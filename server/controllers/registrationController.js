import {
  getAdminSupabase,
  getAuthenticatedClient,
  adminSupabase,
  supabase,
} from '../supabase.js'
import { formatSafeActivity } from './activityController.js'

/**
 * ==============================================================================
 * CAMPUS LIVE: REGISTRATION CONTROLLER
 * ==============================================================================
 * Security & Architectural Constraints:
 * 1. Cryptographic Identity Anchor:
 *    The student ID is derived EXCLUSIVELY from req.user.id (verified via
 *    Supabase Auth JWT). Any client-supplied studentId/student_id in the body
 *    or query is strictly stripped and ignored.
 *
 * 2. Concurrency Safety & Anti-Overbooking:
 *    - In-Memory Mutex: Uses an async promise queue keyed by activityId to
 *      serialize concurrent registration requests within the Node.js server.
 *    - Database Atomic RPC: If the PostgreSQL function 'register_student_for_activity'
 *      is installed, the controller delegates to it (uses SELECT ... FOR UPDATE).
 *    - Graceful Fallback: If the RPC is not yet installed in Supabase, the controller
 *      executes serialized checks and inserts under the activity mutex lock.
 *
 * 3. Validation Rules:
 *    - Activity must exist (404 Not Found if missing).
 *    - Activity status cannot be 'draft', 'cancelled', 'completed', or 'archived' (400).
 *    - Registration deadline must not have passed (400).
 *    - Activity must have remaining capacity (409 Conflict if full).
 *    - Student cannot hold duplicate active registrations (409 Conflict if already registered).
 *
 * 4. Cancellation Preservation:
 *    - Registrations are NEVER deleted.
 *    - Cancellation sets status = 'cancelled' and records cancelled_at timestamp.
 *
 * 5. Safe Error & Status Responses:
 *    - Never leaks secret keys or service role credentials.
 *    - Clearly distinguishes between client errors (400/404/409) and database errors (500).
 * ==============================================================================
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * In-memory mutex keyed by activity ID to serialize concurrent
 * registration requests within the Node.js event loop.
 */
const activityLocks = new Map()

export async function withActivityLock(activityId, fn) {
  const currentLock = activityLocks.get(activityId) || Promise.resolve()
  let release
  const nextLock = new Promise((resolve) => {
    release = resolve
  })
  activityLocks.set(activityId, currentLock.then(() => nextLock))

  try {
    await currentLock
    return await fn()
  } finally {
    release()
    if (activityLocks.get(activityId) === nextLock) {
      activityLocks.delete(activityId)
    }
  }
}

/**
 * Normalizes and formats a registration record for safe API responses.
 *
 * @param {object} row - Raw row from public.registrations
 * @returns {object} Standardized, client-safe registration object
 */
export function formatSafeRegistration(row) {
  if (!row) return null

  return {
    id: row.id,
    studentId: row.student_id,
    activityId: row.activity_id,
    status: row.status || 'registered',
    registeredAt: row.registered_at || row.created_at || null,
    cancelledAt: row.cancelled_at || null,
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

/**
 * Helper to acquire the best available Supabase client for registration operations.
 * Prefers admin client to handle capacity checks across all students, falling back
 * to authenticated client.
 */
function getClient(req) {
  return (
    req?.mockClient ||
    getAdminSupabase() ||
    (req?.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
    adminSupabase ||
    supabase
  )
}

/**
 * GET /api/registrations/status/:activityId
 * Checks whether the authenticated student is currently registered for the given activity
 * and retrieves current availability/capacity metrics.
 */
export async function getRegistrationStatus(req, res) {
  try {
    const studentId = req.user?.id
    const { activityId } = req.params

    if (!studentId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Student identity could not be verified.',
        code: 'UNAUTHORIZED',
      })
    }

    if (!activityId || !UUID_REGEX.test(activityId)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'A valid activity UUID is required.',
        code: 'INVALID_ACTIVITY_ID',
      })
    }

    const client = getClient(req)
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Database service is not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // 1. Fetch activity info to evaluate deadline & max participants
    const { data: activity, error: activityError } = await client
      .from('activities')
      .select('id, title, max_participants, registration_deadline, status, date')
      .eq('id', activityId)
      .maybeSingle()

    if (activityError) {
      console.error('[RegistrationController] Error querying activity:', activityError)
      if (activityError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'activities'. Please apply migration '20261004_activities_table_grants.sql'.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve activity information.',
        code: 'ACTIVITY_QUERY_FAILED',
      })
    }

    if (!activity) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Activity '${activityId}' was not found.`,
        code: 'ACTIVITY_NOT_FOUND',
      })
    }

    // 2. Fetch the student's registration record for this activity
    const { data: registration, error: regError } = await client
      .from('registrations')
      .select('*')
      .eq('student_id', studentId)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (regError && regError.code === '42501') {
      return res.status(500).json({
        error: 'DatabasePermissionDenied',
        message:
          "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
        code: 'DATABASE_PERMISSION_DENIED',
      })
    }

    // 3. Count total active registrations for this activity
    const { count: activeCount, error: countError } = await client
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('activity_id', activityId)
      .eq('status', 'registered')

    if (countError && countError.code === '42501') {
      return res.status(500).json({
        error: 'DatabasePermissionDenied',
        message:
          "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
        code: 'DATABASE_PERMISSION_DENIED',
      })
    }

    const totalRegistered = typeof activeCount === 'number' ? activeCount : 0
    const maxParticipants =
      typeof activity.max_participants === 'number' ? activity.max_participants : null
    const availableSeats =
      maxParticipants !== null ? Math.max(0, maxParticipants - totalRegistered) : null
    const isFull = maxParticipants !== null ? totalRegistered >= maxParticipants : false

    // Deadline check
    const deadlineStr = activity.registration_deadline || activity.date
    const isDeadlinePassed = deadlineStr ? new Date(deadlineStr).getTime() < Date.now() : false

    const isRegistered = Boolean(registration && registration.status === 'registered')
    const registrationStatus = registration ? registration.status : 'none'

    return res.status(200).json({
      success: true,
      registered: isRegistered,
      status: registrationStatus,
      registration: isRegistered ? formatSafeRegistration(registration) : null,
      totalRegistered,
      maxParticipants,
      availableSeats,
      isFull,
      isDeadlinePassed,
      activity: {
        id: activity.id,
        title: activity.title,
        status: activity.status,
      },
    })
  } catch (err) {
    console.error('[RegistrationController] Unexpected error in getRegistrationStatus:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while checking registration status.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * POST /api/registrations
 * Registers the authenticated student for an activity.
 *
 * Body parameters:
 * - activityId: UUID of the activity to register for.
 */
export async function registerForActivity(req, res) {
  try {
    // 1. Strictly anchor student ID to verified JWT user identity
    const studentId = req.user?.id

    if (!studentId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Student identity could not be verified.',
        code: 'UNAUTHORIZED',
      })
    }

    // Role check: Only students may register
    if (req.profile?.role && req.profile.role !== 'student') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only registered students may register for campus activities.',
        code: 'STUDENT_ROLE_REQUIRED',
      })
    }

    // Extract activity ID (ignoring any user-supplied studentId)
    const activityId = req.body?.activityId || req.body?.activity_id

    if (!activityId || !UUID_REGEX.test(activityId)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'A valid activity UUID is required in the request body (activityId).',
        code: 'INVALID_ACTIVITY_ID',
      })
    }

    const client = getClient(req)
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Database service is not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // 2. Concurrency-Safe Execution via Activity Mutex Lock
    return await withActivityLock(activityId, async () => {
      // Step A: Attempt database-level atomic RPC if available
      try {
        const { data: rpcData, error: rpcError } = await client.rpc(
          'register_student_for_activity',
          {
            p_student_id: studentId,
            p_activity_id: activityId,
          }
        )

        if (!rpcError && rpcData) {
          return res.status(201).json({
            success: true,
            message: 'You have successfully registered for this activity!',
            registration: formatSafeRegistration(rpcData),
          })
        }

        // Handle known domain exceptions raised by PostgreSQL function
        if (rpcError) {
          const msg = rpcError.message || ''
          if (msg.includes('ACTIVITY_NOT_FOUND')) {
            return res.status(404).json({
              error: 'NotFound',
              message: 'Activity not found.',
              code: 'ACTIVITY_NOT_FOUND',
            })
          }
          if (msg.includes('ACTIVITY_NOT_AVAILABLE')) {
            return res.status(400).json({
              error: 'BadRequest',
              message: 'This activity is currently not open for registration.',
              code: 'ACTIVITY_NOT_AVAILABLE',
            })
          }
          if (msg.includes('REGISTRATION_DEADLINE_PASSED')) {
            return res.status(400).json({
              error: 'BadRequest',
              message: 'The registration deadline for this activity has passed.',
              code: 'REGISTRATION_DEADLINE_PASSED',
            })
          }
          if (msg.includes('ALREADY_REGISTERED')) {
            return res.status(409).json({
              error: 'Conflict',
              message: 'You are already registered for this activity.',
              code: 'ALREADY_REGISTERED',
            })
          }
          if (msg.includes('ACTIVITY_FULL')) {
            return res.status(409).json({
              error: 'Conflict',
              message: 'This activity has reached its maximum participant capacity.',
              code: 'ACTIVITY_FULL',
            })
          }

          // If function does not exist (PGRST202 or 42883), gracefully fall through to standard flow
          const isFunctionMissing =
            rpcError.code === 'PGRST202' ||
            rpcError.code === '42883' ||
            msg.includes('function public.register_student_for_activity')

          if (!isFunctionMissing) {
            console.error('[RegistrationController] RPC error:', rpcError)
            if (rpcError.code === '42501') {
              return res.status(500).json({
                error: 'DatabasePermissionDenied',
                message:
                  "Permission denied. Please apply migration '20261004_registrations_table_grants.sql'.",
                code: 'DATABASE_PERMISSION_DENIED',
              })
            }
          }
        }
      } catch (rpcEx) {
        // Fallback to application-level atomic execution
        console.warn('[RegistrationController] RPC attempt skipped, using application flow:', rpcEx)
      }

      // Step B: Application-level atomic registration under mutex lock
      // 1. Validate activity existence and availability
      const { data: activity, error: activityError } = await client
        .from('activities')
        .select('id, title, max_participants, registration_deadline, status, date')
        .eq('id', activityId)
        .maybeSingle()

      if (activityError) {
        if (activityError.code === '42501') {
          return res.status(500).json({
            error: 'DatabasePermissionDenied',
            message:
              "Permission denied for table 'activities'. Please apply migration '20261004_activities_table_grants.sql'.",
            code: 'DATABASE_PERMISSION_DENIED',
          })
        }
        return res.status(500).json({
          error: 'InternalServerError',
          message: 'Failed to verify activity status.',
          code: 'ACTIVITY_QUERY_FAILED',
        })
      }

      if (!activity) {
        return res.status(404).json({
          error: 'NotFound',
          message: `Activity '${activityId}' does not exist.`,
          code: 'ACTIVITY_NOT_FOUND',
        })
      }

      // Check status rules
      const unavailableStatuses = ['draft', 'cancelled', 'completed', 'archived']
      if (unavailableStatuses.includes(String(activity.status || '').toLowerCase())) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'This activity is currently not open for registration.',
          code: 'ACTIVITY_NOT_AVAILABLE',
        })
      }

      // Check registration deadline
      const deadlineStr = activity.registration_deadline || activity.date
      if (deadlineStr && new Date(deadlineStr).getTime() < Date.now()) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'The registration deadline for this activity has passed.',
          code: 'REGISTRATION_DEADLINE_PASSED',
        })
      }

      // 2. Check for duplicate active registration
      const { data: existingReg, error: existingRegError } = await client
        .from('registrations')
        .select('*')
        .eq('student_id', studentId)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingRegError && existingRegError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }

      if (existingReg && existingReg.status === 'registered') {
        return res.status(409).json({
          error: 'Conflict',
          message: 'You are already registered for this activity.',
          code: 'ALREADY_REGISTERED',
        })
      }

      // 3. Check capacity limit
      const { count: currentCount, error: countError } = await client
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('activity_id', activityId)
        .eq('status', 'registered')

      if (countError && countError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }

      const activeCount = typeof currentCount === 'number' ? currentCount : 0
      if (
        typeof activity.max_participants === 'number' &&
        activeCount >= activity.max_participants
      ) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'This activity has reached its maximum participant capacity.',
          code: 'ACTIVITY_FULL',
        })
      }

      // 4. Save registration (Reactivate if previously cancelled, or Insert new row)
      let savedRow
      const nowIso = new Date().toISOString()

      if (existingReg && existingReg.status === 'cancelled') {
        const { data: updated, error: updateError } = await client
          .from('registrations')
          .update({
            status: 'registered',
            registered_at: nowIso,
            cancelled_at: null,
            updated_at: nowIso,
          })
          .eq('id', existingReg.id)
          .select()
          .single()

        if (updateError) {
          console.error('[RegistrationController] Error reactivating registration:', updateError)
          return res.status(500).json({
            error: 'InternalServerError',
            message: 'Failed to reactivate registration in database.',
            code: 'REGISTRATION_REACTIVATION_FAILED',
          })
        }
        savedRow = updated
      } else {
        const { data: inserted, error: insertError } = await client
          .from('registrations')
          .insert({
            student_id: studentId,
            activity_id: activityId,
            status: 'registered',
            registered_at: nowIso,
            created_at: nowIso,
            updated_at: nowIso,
          })
          .select()
          .single()

        if (insertError) {
          console.error('[RegistrationController] Error inserting registration:', insertError)
          if (insertError.code === '42501') {
            return res.status(500).json({
              error: 'DatabasePermissionDenied',
              message:
                "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
              code: 'DATABASE_PERMISSION_DENIED',
            })
          }
          if (insertError.code === '23505') {
            return res.status(409).json({
              error: 'Conflict',
              message: 'You are already registered for this activity.',
              code: 'ALREADY_REGISTERED',
            })
          }
          return res.status(500).json({
            error: 'InternalServerError',
            message: 'Failed to create registration record in database.',
            code: 'REGISTRATION_INSERT_FAILED',
          })
        }
        savedRow = inserted
      }

      const remainingSeats =
        typeof activity.max_participants === 'number'
          ? Math.max(0, activity.max_participants - (activeCount + 1))
          : null

      return res.status(201).json({
        success: true,
        message: 'You have successfully registered for this activity!',
        registration: formatSafeRegistration(savedRow),
        remainingSeats,
      })
    })
  } catch (err) {
    console.error('[RegistrationController] Unexpected error in registerForActivity:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while processing registration.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * POST /api/registrations/cancel
 * Cancels an active registration for the authenticated student.
 * Updates status = 'cancelled' and sets cancelled_at. Does NOT delete the row.
 *
 * Body parameters:
 * - activityId: UUID of the activity whose registration is being cancelled.
 */
export async function cancelRegistration(req, res) {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Student identity could not be verified.',
        code: 'UNAUTHORIZED',
      })
    }

    const activityId = req.body?.activityId || req.body?.activity_id

    if (!activityId || !UUID_REGEX.test(activityId)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'A valid activity UUID is required in the request body (activityId).',
        code: 'INVALID_ACTIVITY_ID',
      })
    }

    const client = getClient(req)
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Database service is not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // Step A: Attempt database-level atomic cancellation RPC if available
    try {
      if (typeof client.rpc === 'function') {
        const { data: rpcData, error: rpcError } = await client.rpc(
          'cancel_student_registration',
          {
            p_student_id: studentId,
            p_activity_id: activityId,
          }
        )

        if (!rpcError && rpcData) {
          return res.status(200).json({
            success: true,
            message: 'Your registration has been cancelled successfully.',
            registration: formatSafeRegistration(rpcData),
          })
        }

        if (rpcError) {
          const msg = rpcError.message || ''

          if (msg.includes('UNAUTHORIZED_CANCELLATION')) {
            return res.status(403).json({
              error: 'Forbidden',
              message: 'You are not authorized to cancel this registration.',
              code: 'UNAUTHORIZED_CANCELLATION',
            })
          }

          if (msg.includes('UNAUTHENTICATED')) {
            return res.status(401).json({
              error: 'Unauthorized',
              message: 'Authentication required to cancel registration.',
              code: 'UNAUTHENTICATED',
            })
          }

          if (msg.includes('ACTIVE_REGISTRATION_NOT_FOUND')) {
            // Check whether registration already exists in cancelled state or is completely missing
            try {
              const { data: existingReg } = await client
                .from('registrations')
                .select('status')
                .eq('student_id', studentId)
                .eq('activity_id', activityId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

              if (existingReg && existingReg.status === 'cancelled') {
                return res.status(400).json({
                  error: 'BadRequest',
                  message: 'Your registration for this activity is already cancelled.',
                  code: 'ALREADY_CANCELLED',
                })
              }
            } catch {
              // Ignore lookup error, proceed with NOT_FOUND
            }

            return res.status(404).json({
              error: 'NotFound',
              message: 'No registration record found for this activity.',
              code: 'REGISTRATION_NOT_FOUND',
            })
          }

          // If function does not exist (PGRST202 or 42883), gracefully fall through to standard flow
          const isFunctionMissing =
            rpcError.code === 'PGRST202' ||
            rpcError.code === '42883' ||
            msg.includes('function public.cancel_student_registration') ||
            msg.includes('cancel_student_registration')

          if (!isFunctionMissing) {
            console.error('[RegistrationController] Cancellation RPC error:', rpcError)
            if (rpcError.code === '42501') {
              return res.status(500).json({
                error: 'DatabasePermissionDenied',
                message:
                  "Permission denied for cancellation function. Please verify database grants.",
                code: 'DATABASE_PERMISSION_DENIED',
              })
            }
            return res.status(500).json({
              error: 'InternalServerError',
              message: rpcError.message || 'Failed to cancel registration via database function.',
              code: 'REGISTRATION_CANCELLATION_FAILED',
            })
          }
        }
      }
    } catch (rpcEx) {
      console.warn(
        '[RegistrationController] Cancellation RPC attempt skipped, using application flow:',
        rpcEx?.message || rpcEx
      )
    }

    // Step B: Application-level cancellation fallback (when RPC is missing or using mock client)
    // Find the latest registration record for this student and activity
    const { data: registration, error: queryError } = await client
      .from('registrations')
      .select('*')
      .eq('student_id', studentId)
      .eq('activity_id', activityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (queryError) {
      if (queryError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Direct updates are disabled. Please ensure the 'cancel_student_registration' RPC function is deployed.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to query registration record.',
        code: 'REGISTRATION_QUERY_FAILED',
      })
    }

    if (!registration) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No registration record found for this activity.',
        code: 'REGISTRATION_NOT_FOUND',
      })
    }

    if (registration.status === 'cancelled') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Your registration for this activity is already cancelled.',
        code: 'ALREADY_CANCELLED',
      })
    }

    // Update status to 'cancelled' and timestamp cancellation without deleting row
    const nowIso = new Date().toISOString()
    const { data: updated, error: updateError } = await client
      .from('registrations')
      .update({
        status: 'cancelled',
        cancelled_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', registration.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Direct updates are disabled. Please ensure the 'cancel_student_registration' RPC function is deployed.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to update registration status in database.',
        code: 'REGISTRATION_UPDATE_FAILED',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Your registration has been cancelled successfully.',
      registration: formatSafeRegistration(updated),
    })
  } catch (err) {
    console.error('[RegistrationController] Unexpected error in cancelRegistration:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while cancelling registration.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

// Helper to format 24h time to user-friendly string
export const formatDisplayTime = (startTime, endTime) => {
  if (!startTime) return 'Time TBA'
  const formatSingle = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    if (parts.length < 2) return timeStr
    let h = parseInt(parts[0], 10)
    const m = parts[1]
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${ampm}`
  }
  return endTime ? `${formatSingle(startTime)} - ${formatSingle(endTime)}` : formatSingle(startTime)
}

// Helper to format date string to user-friendly string
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Date TBA'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Helper to determine whether an activity has concluded.
 * Considers explicit status ('completed', 'concluded', 'archived', 'past')
 * or a scheduled date that is strictly in the past relative to today.
 *
 * @param {object} act - Activity database record or formatted activity
 * @returns {boolean}
 */
export function isActivityConcluded(act) {
  if (!act) return false
  const status = (act.status || act.activity_status || act.activityStatus || '').toLowerCase()
  if (['completed', 'concluded', 'archived', 'past'].includes(status)) {
    return true
  }
  const dateStr = act.date || act.rawDate
  if (!dateStr) return false

  try {
    const actDate = new Date(dateStr)
    if (isNaN(actDate.getTime())) return false

    // Compare date to start of current day
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return actDate < today
  } catch {
    return false
  }
}

/**
 * Maps an activity category or type to the standardized filter categories,
 * badge variants, and visual thumbnail gradients used by the UI.
 *
 * @param {string} category
 * @returns {{ filterCategory: string, badgeVariant: string, thumbnailGradient: string }}
 */
export function getActivityCategoryMetadata(category) {
  const c = (category || '').toLowerCase()

  if (c.includes('workshop')) {
    return {
      filterCategory: 'Workshops',
      badgeVariant: 'primary',
      thumbnailGradient: 'from-blue-600 to-indigo-700',
    }
  }
  if (c.includes('hackathon')) {
    return {
      filterCategory: 'Hackathons',
      badgeVariant: 'secondary',
      thumbnailGradient: 'from-indigo-600 to-purple-700',
    }
  }
  if (c.includes('competition') || c.includes('contest') || c.includes('coding')) {
    return {
      filterCategory: 'Competitions',
      badgeVariant: 'secondary',
      thumbnailGradient: 'from-amber-600 to-orange-700',
    }
  }
  if (c.includes('seminar') || c.includes('webinar')) {
    return {
      filterCategory: 'Seminars',
      badgeVariant: 'warning',
      thumbnailGradient: 'from-slate-600 to-zinc-700',
    }
  }
  if (c.includes('cultural') || c.includes('arts') || c.includes('music') || c.includes('drama')) {
    return {
      filterCategory: 'Cultural',
      badgeVariant: 'success',
      thumbnailGradient: 'from-pink-600 to-rose-700',
    }
  }
  if (c.includes('sports') || c.includes('athletics') || c.includes('tournament')) {
    return {
      filterCategory: 'Sports',
      badgeVariant: 'success',
      thumbnailGradient: 'from-emerald-600 to-teal-700',
    }
  }
  return {
    filterCategory: 'Technical',
    badgeVariant: 'primary',
    thumbnailGradient: 'from-blue-600 to-indigo-700',
  }
}

/**
 * GET /api/registrations/my
 * Retrieves all registrations for the authenticated student, joining corresponding
 * activity details.
 */
export async function getMyRegistrations(req, res) {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Student identity could not be verified.',
        code: 'UNAUTHORIZED',
      })
    }

    // Role check: Only students may access their registrations via this endpoint
    if (req.profile?.role && req.profile.role !== 'student') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only registered students may access student registrations.',
        code: 'STUDENT_ROLE_REQUIRED',
      })
    }

    const client = getClient(req)
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Database service is not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // 1. Fetch registrations strictly filtered by authenticated student ID
    const { data: regRows, error: queryError } = await client
      .from('registrations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('[RegistrationController] Error querying my registrations:', queryError)
      if (queryError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Please apply migration '20261004_registrations_table_grants.sql'.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve registrations from database.',
        code: 'REGISTRATIONS_QUERY_FAILED',
      })
    }

    // Return empty list if no registrations exist
    if (!regRows || regRows.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        registrations: [],
      })
    }

    // 2. Fetch corresponding activity records for all referenced activity IDs
    const activityIds = [...new Set(regRows.map((r) => r.activity_id).filter(Boolean))]
    const activitiesMap = new Map()

    if (activityIds.length > 0) {
      const { data: actRows, error: actError } = await client
        .from('activities')
        .select('*')
        .in('id', activityIds)

      if (!actError && actRows) {
        actRows.forEach((act) => activitiesMap.set(act.id, act))
      } else if (actError) {
        console.warn('[RegistrationController] Notice fetching activities for registrations:', actError.message)
      }
    }

    // 3. Assemble and normalize output records
    const formattedRegistrations = regRows.map((reg) => {
      const act = activitiesMap.get(reg.activity_id) || null
      const rawStatus = reg.status || 'registered'
      const capitalizedStatus =
        rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase()

      return {
        id: reg.id,
        studentId: reg.student_id,
        activityId: reg.activity_id,
        status: capitalizedStatus,
        rawStatus,
        registrationId: `REG-${reg.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
        registeredAt: reg.registered_at || reg.created_at || null,
        registeredOn: formatDisplayDate(reg.registered_at || reg.created_at),
        cancelledAt: reg.cancelled_at || null,
        createdAt: reg.created_at || null,
        updatedAt: reg.updated_at || null,

        // Joined activity attributes
        title: act?.title || 'Campus Activity',
        description: act?.description || '',
        category: act?.category || act?.activity_type || 'General',
        activityType: act?.activity_type || act?.category || 'General',
        department: act?.department || 'All Departments',
        date: act?.date ? formatDisplayDate(act.date) : 'Date TBA',
        rawDate: act?.date || null,
        time: act ? formatDisplayTime(act.start_time, act.end_time) : 'Time TBA',
        startTime: act?.start_time || null,
        endTime: act?.end_time || null,
        venue: act?.venue || act?.address || 'Campus Venue',
        organizer: act?.organizer || 'Campus Live',
        thumbnailUrl: act?.thumbnail_url || null,
        bannerUrl: act?.banner_url || null,
        maxParticipants: act?.max_participants || null,
        activityStatus: act?.status || 'upcoming',
        activity: act ? formatSafeActivity(act) : null,
      }
    })

    return res.status(200).json({
      success: true,
      count: formattedRegistrations.length,
      registrations: formattedRegistrations,
    })
  } catch (err) {
    console.error('[RegistrationController] Unexpected error in getMyRegistrations:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while loading your registrations.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * GET /api/registrations/history
 * Retrieves verified historical registrations for concluded/past activities
 * belonging exclusively to the authenticated student.
 */
export async function getMyActivityHistory(req, res) {
  try {
    const studentId = req.user?.id

    if (!studentId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Student identity could not be verified.',
        code: 'UNAUTHORIZED',
      })
    }

    // Role check: Only students may access their history via this endpoint
    if (req.profile?.role && req.profile.role !== 'student') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only registered students may access student activity history.',
        code: 'STUDENT_ROLE_REQUIRED',
      })
    }

    const client = getClient(req)
    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Database service is not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // 1. Fetch registrations strictly filtered by authenticated student ID
    const { data: regRows, error: queryError } = await client
      .from('registrations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('[RegistrationController] Error querying activity history:', queryError)
      if (queryError.code === '42501') {
        return res.status(500).json({
          error: 'DatabasePermissionDenied',
          message:
            "Permission denied for table 'registrations'. Please verify database grants.",
          code: 'DATABASE_PERMISSION_DENIED',
        })
      }
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve activity history from database.',
        code: 'REGISTRATIONS_QUERY_FAILED',
      })
    }

    // Filter out cancelled registrations — only registrations that remained active represent concluded participation
    const activeRegRows = (regRows || []).filter(
      (r) => (r.status || '').toLowerCase() !== 'cancelled'
    )

    if (activeRegRows.length === 0) {
      return res.status(200).json({
        success: true,
        source: 'database',
        count: 0,
        summary: {
          totalPastEvents: 0,
          totalParticipated: 0,
          thisYear: 0,
          workshops: 0,
          competitions: 0,
        },
        records: [],
      })
    }

    // 2. Fetch corresponding activity records for all active registrations
    const activityIds = [...new Set(activeRegRows.map((r) => r.activity_id).filter(Boolean))]
    const activitiesMap = new Map()

    if (activityIds.length > 0) {
      const { data: actRows, error: actError } = await client
        .from('activities')
        .select('*')
        .in('id', activityIds)

      if (!actError && actRows) {
        actRows.forEach((act) => activitiesMap.set(act.id, act))
      } else if (actError) {
        console.warn('[RegistrationController] Notice fetching activities for history:', actError.message)
      }
    }

    // 3. Filter to activities that have concluded and assemble historical records
    const historyRecords = []

    for (const reg of activeRegRows) {
      const act = activitiesMap.get(reg.activity_id)
      if (!act) continue

      // An activity is historical if its status is concluded/completed/archived OR its scheduled date is past
      if (!isActivityConcluded(act)) {
        continue
      }

      const catMeta = getActivityCategoryMetadata(act.category || act.activity_type)

      // Derive academic session year safely
      let year = String(new Date().getFullYear())
      if (act.date) {
        const d = new Date(act.date)
        if (!isNaN(d.getTime())) {
          year = String(d.getFullYear())
        }
      }

      historyRecords.push({
        id: reg.id,
        activityId: act.id,
        registrationId: `REG-${reg.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`,
        title: act.title || 'Campus Activity',
        category: act.category || act.activity_type || 'General',
        filterCategory: catMeta.filterCategory,
        department: act.department || 'All Departments',
        date: act.date ? formatDisplayDate(act.date) : 'Date TBA',
        rawDate: act.date || null,
        time: formatDisplayTime(act.start_time, act.end_time),
        venue: act.venue || act.address || 'Campus Venue',
        organizer: act.organizer || 'Campus Live',
        participationStatus: 'Concluded',
        statusVariant: 'success',
        badgeVariant: catMeta.badgeVariant,
        thumbnailGradient: catMeta.thumbnailGradient,
        year,
        registeredAt: reg.registered_at || reg.created_at || null,
        registeredOn: formatDisplayDate(reg.registered_at || reg.created_at),
        createdAt: reg.created_at || null,
      })
    }

    // 4. Compute summary metrics derived from the student's actual concluded records
    const currentYear = String(new Date().getFullYear())
    const summary = {
      totalPastEvents: historyRecords.length,
      totalParticipated: historyRecords.length,
      thisYear: historyRecords.filter((r) => r.year === currentYear).length,
      workshops: historyRecords.filter((r) => r.filterCategory === 'Workshops').length,
      competitions: historyRecords.filter(
        (r) => r.filterCategory === 'Competitions' || r.filterCategory === 'Hackathons'
      ).length,
    }

    return res.status(200).json({
      success: true,
      source: 'database',
      count: historyRecords.length,
      summary,
      records: historyRecords,
    })
  } catch (err) {
    console.error('[RegistrationController] Unexpected error in getMyActivityHistory:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while loading your activity history.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

