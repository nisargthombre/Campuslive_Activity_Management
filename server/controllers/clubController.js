import {
  getAdminSupabase,
  getAuthenticatedClient,
  adminSupabase,
  supabase,
} from '../supabase.js'
import { initialClubsData } from '../../src/data/clubsData.js'

/**
 * ==============================================================================
 * CAMPUS LIVE: CLUB CONTROLLER
 * ==============================================================================
 * Security & Architectural Constraints:
 * 1. Cryptographic Identity Anchor:
 *    The student ID is derived EXCLUSIVELY from req.user.id (verified via
 *    Supabase Auth JWT). Client-supplied IDs in body or params are strictly ignored.
 *
 * 2. Concurrency Safety:
 *    Uses an async promise queue (withClubLock) keyed by club identifier to
 *    serialize concurrent join and leave requests within the Node.js server.
 *
 * 3. Validation Rules:
 *    - Club must exist (404 Not Found if missing).
 *    - Inactive clubs cannot be joined or listed (400 Bad Request).
 *    - Student cannot hold duplicate active memberships (409 Conflict if already joined).
 *    - Student cannot leave a club they have not joined (400 Bad Request).
 *
 * 4. Audit Preservation:
 *    - Memberships are NOT deleted upon leaving; status is set to 'left'.
 *
 * 5. Resilient Demo & Offline Fallback:
 *    - If Supabase is unconfigured or the clubs table does not exist,
 *      controller falls back gracefully to initial demo data and in-memory tracking.
 * ==============================================================================
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * In-memory mutex keyed by club identifier to serialize concurrent
 * membership requests.
 */
const clubLocks = new Map()

export async function withClubLock(clubId, fn) {
  const currentLock = clubLocks.get(clubId) || Promise.resolve()
  let release
  const nextLock = new Promise((resolve) => {
    release = resolve
  })
  clubLocks.set(clubId, currentLock.then(() => nextLock))

  try {
    await currentLock
    return await fn()
  } finally {
    release()
    if (clubLocks.get(clubId) === nextLock) {
      clubLocks.delete(clubId)
    }
  }
}

/**
 * In-memory demo membership store for offline/demo mode and pre-migration fallback.
 * Maps `${userId}:${clubIdOrSlug}` -> { status: 'joined'|'left'|'pending', joinedAt: string }
 */
export const demoMembershipsStore = new Map()

// Seed default demo memberships matching initialClubsData for 'demo-user'
for (const club of initialClubsData) {
  if (club.membershipStatus === 'Joined') {
    demoMembershipsStore.set(`demo-user:${club.id}`, { status: 'joined', joinedAt: new Date().toISOString() })
  } else if (club.membershipStatus === 'Pending') {
    demoMembershipsStore.set(`demo-user:${club.id}`, { status: 'pending', joinedAt: new Date().toISOString() })
  }
}

/**
 * Normalizes and formats a club database row for safe client responses.
 *
 * @param {object} row - Raw row from public.clubs or demo item
 * @param {object|null} membership - User membership record if any
 * @param {number|null} memberCount - Dynamic active member count if computed
 * @returns {object} Standardized, student-safe club object
 */
export function formatSafeClub(row, membership = null, memberCount = null) {
  if (!row) return null

  let resolvedStatus = 'Not Joined'
  if (membership?.status) {
    const raw = String(membership.status).toLowerCase()
    if (raw === 'joined') resolvedStatus = 'Joined'
    else if (raw === 'pending') resolvedStatus = 'Pending'
    else resolvedStatus = 'Not Joined'
  } else if (row.membershipStatus) {
    resolvedStatus = row.membershipStatus
  }

  const baseMembers = row.members_count ?? row.membersCount ?? 0
  const finalMembersCount = memberCount !== null ? memberCount : baseMembers

  return {
    id: row.slug || row.id,
    clubId: row.id,
    slug: row.slug || row.id,
    name: row.name || '',
    category: row.category || 'Other',
    description: row.description || '',
    aboutLong: row.about_long || row.aboutLong || row.description || '',
    facultyCoordinator: row.faculty_coordinator || row.facultyCoordinator || '',
    facultyDepartment: row.faculty_department || row.facultyDepartment || '',
    facultyEmail: row.faculty_email || row.facultyEmail || '',
    leadName: row.lead_name || row.leadName || '',
    officeRoom: row.office_room || row.officeRoom || '',
    email: row.email || '',
    founded: row.founded || 2020,
    meetingSchedule: row.meeting_schedule || row.meetingSchedule || '',
    venue: row.venue || '',
    eligibility: row.eligibility || 'Open to all students',
    avatarText: row.avatar_text || row.avatarText || (row.name ? row.name.slice(0, 2).toUpperCase() : 'CL'),
    gradient: row.gradient || 'from-blue-600 to-indigo-600',
    status: row.status || 'active',
    membersCount: finalMembersCount,
    activitiesCount: row.activities_count ?? row.activitiesCount ?? 0,
    upcomingCount: row.upcomingActivities?.length ?? row.upcomingCount ?? 0,
    membershipStatus: resolvedStatus,
    upcomingActivities: row.upcomingActivities || [],
    recentActivities: row.recentActivities || [],
    members: row.members || [],
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

/**
 * Helper to acquire the best available Supabase client.
 * Follows the trusted-backend pattern:
 * Prefers the administrative client (getAdminSupabase / adminSupabase) for server-orchestrated
 * operations (join/leave mutations, cross-student membership counts) after strict authentication
 * and ownership verification. Falls back to caller-authenticated client or demo store.
 */
function getClient(req) {
  return (
    req?.mockClient ||
    getAdminSupabase() ||
    adminSupabase ||
    (req?.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
    supabase
  )
}

/**
 * GET /api/clubs
 * Retrieves active student clubs.
 * Uses optionalAuthenticateUser to personalize membershipStatus if token is provided.
 */
export async function getClubs(req, res) {
  try {
    const { category, search } = req.query || {}
    const client = getClient(req)
    const userId = req.user?.id || null

    let liveClubs = null
    let liveMemberships = new Map()
    const countsMap = new Map()

    if (client) {
      try {
        let query = client
          .from('clubs')
          .select('*')
          .eq('status', 'active')
          .order('name', { ascending: true })

        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`)
        }

        const { data, error } = await query

        if (!error && Array.isArray(data) && data.length > 0) {
          liveClubs = data

          // Query live active member counts per club across all students
          const clubIds = liveClubs.map((c) => c.id)
          try {
            const { data: countsData } = await client
              .from('club_memberships')
              .select('club_id')
              .in('club_id', clubIds)
              .eq('status', 'joined')

            if (Array.isArray(countsData)) {
              for (const row of countsData) {
                countsMap.set(row.club_id, (countsMap.get(row.club_id) || 0) + 1)
              }
            }
          } catch (countErr) {
            console.warn('[ClubController] Live membership counts query note:', countErr.message || countErr)
          }

          // If authenticated, fetch user's memberships in these clubs
          if (userId && UUID_REGEX.test(userId)) {
            const { data: memData } = await client
              .from('club_memberships')
              .select('*')
              .eq('student_id', userId)
              .in('club_id', clubIds)

            if (Array.isArray(memData)) {
              for (const m of memData) {
                liveMemberships.set(m.club_id, m)
              }
            }
          }
        }
      } catch (dbErr) {
        // Table may not exist yet or connection failed - fallback to demo data
        console.warn('[ClubController] Live clubs query note:', dbErr.message || dbErr)
      }
    }

    // Determine clubs dataset: live database rows or initial demo dataset
    let clubsToReturn
    const isLive = liveClubs !== null

    if (isLive) {
      clubsToReturn = liveClubs.map((c) => {
        const mem = liveMemberships.get(c.id) || null
        const memberCount = countsMap.has(c.id) ? countsMap.get(c.id) : null
        return formatSafeClub(c, mem, memberCount)
      })
    } else {
      // Fallback to initial demo data with demo membership overlay
      clubsToReturn = initialClubsData.map((c) => {
        if (!userId) {
          return {
            ...c,
            membershipStatus: 'Not Joined',
          }
        }
        const demoKey = `${userId}:${c.id}`
        const demoMem = demoMembershipsStore.get(demoKey)
        const effectiveStatus = demoMem
          ? demoMem.status === 'joined'
            ? 'Joined'
            : demoMem.status === 'pending'
            ? 'Pending'
            : 'Not Joined'
          : 'Not Joined'
        return {
          ...c,
          membershipStatus: effectiveStatus,
        }
      })
    }

    // Apply category filter if fallback
    if (!isLive && category && category !== 'All') {
      clubsToReturn = clubsToReturn.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      )
    }

    // Apply search filter if provided
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase()
      clubsToReturn = clubsToReturn.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.facultyCoordinator && c.facultyCoordinator.toLowerCase().includes(q)) ||
          (c.leadName && c.leadName.toLowerCase().includes(q))
        )
      })
    }

    return res.status(200).json({
      success: true,
      clubs: clubsToReturn,
      total: clubsToReturn.length,
      isDemo: !isLive,
      source: isLive ? 'live' : 'demo',
    })
  } catch (err) {
    console.error('[ClubController] Error in getClubs:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to retrieve clubs.',
    })
  }
}

/**
 * GET /api/clubs/my
 * Retrieves clubs joined by the authenticated student.
 */
export async function getMyMemberships(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required to view your club memberships.',
      })
    }

    const client = getClient(req)
    let joinedClubs = []
    let isLive = false

    if (client && UUID_REGEX.test(userId)) {
      try {
        const { data: memRows, error: memErr } = await client
          .from('club_memberships')
          .select('club_id, status, role, joined_at, clubs (*)')
          .eq('student_id', userId)
          .in('status', ['joined', 'pending'])

        if (!memErr && Array.isArray(memRows)) {
          isLive = true
          joinedClubs = memRows
            .filter((m) => m.clubs && m.clubs.status === 'active')
            .map((m) => formatSafeClub(m.clubs, m))
        }
      } catch (dbErr) {
        console.warn('[ClubController] Live my-memberships note:', dbErr.message || dbErr)
      }
    }

    if (!isLive) {
      // Demo store fallback
      joinedClubs = initialClubsData
        .map((c) => {
          const demoKey = `${userId}:${c.id}`
          const demoMem = demoMembershipsStore.get(demoKey)
          const effectiveStatus = demoMem
            ? demoMem.status === 'joined'
              ? 'Joined'
              : demoMem.status === 'pending'
              ? 'Pending'
              : 'Not Joined'
            : 'Not Joined'

          return { ...c, membershipStatus: effectiveStatus }
        })
        .filter((c) => c.membershipStatus === 'Joined' || c.membershipStatus === 'Pending')
    }

    const memberships = joinedClubs.map((c) => ({
      club_id: c.id,
      status: c.membershipStatus === 'Joined' ? 'joined' : 'pending',
      club: c,
    }))

    return res.status(200).json({
      success: true,
      clubs: joinedClubs,
      memberships,
      total: joinedClubs.length,
      isDemo: !isLive,
      source: isLive ? 'live' : 'demo',
    })
  } catch (err) {
    console.error('[ClubController] Error in getMyMemberships:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to retrieve your club memberships.',
    })
  }
}

/**
 * GET /api/clubs/:id
 * Retrieves details for a specific club by UUID or slug.
 */
export async function getClubById(req, res) {
  try {
    const { id } = req.params
    if (!id || !String(id).trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Club identifier is required.',
      })
    }

    const cleanId = String(id).trim()
    const client = getClient(req)
    const userId = req.user?.id || null

    let liveClub = null
    let liveMembership = null
    let memberCount = null

    if (client) {
      try {
        let query = client.from('clubs').select('*')
        if (UUID_REGEX.test(cleanId)) {
          query = query.or(`id.eq.${cleanId},slug.eq.${cleanId}`)
        } else {
          query = query.eq('slug', cleanId)
        }

        const { data, error } = await query.maybeSingle()

        if (!error && data) {
          liveClub = data

          // Count active members in live DB
          const { count } = await client
            .from('club_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('club_id', liveClub.id)
            .eq('status', 'joined')
          if (typeof count === 'number') {
            memberCount = count
          }

          // Check user membership if authenticated
          if (userId && UUID_REGEX.test(userId)) {
            const { data: mData } = await client
              .from('club_memberships')
              .select('*')
              .eq('student_id', userId)
              .eq('club_id', liveClub.id)
              .maybeSingle()
            liveMembership = mData || null
          }
        }
      } catch (dbErr) {
        console.warn('[ClubController] Live getClubById note:', dbErr.message || dbErr)
      }
    }

    if (liveClub) {
      if (liveClub.status && liveClub.status !== 'active') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'This club is currently inactive or not available to students.',
          code: 'CLUB_INACTIVE',
        })
      }
      return res.status(200).json({
        success: true,
        club: formatSafeClub(liveClub, liveMembership, memberCount),
        isDemo: false,
        source: 'live',
      })
    }

    // Demo fallback lookup
    const demoClub = initialClubsData.find(
      (c) =>
        c.id.toLowerCase() === cleanId.toLowerCase() ||
        (c.slug && c.slug.toLowerCase() === cleanId.toLowerCase())
    )

    if (!demoClub) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Club '${cleanId}' not found.`,
        code: 'CLUB_NOT_FOUND',
      })
    }

    if (demoClub.status && demoClub.status !== 'active') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'This club is currently inactive or not available to students.',
        code: 'CLUB_INACTIVE',
      })
    }

    const demoKey = `${userId}:${demoClub.id}`
    const demoMem = userId ? demoMembershipsStore.get(demoKey) : null
    const effectiveStatus = demoMem
      ? demoMem.status === 'joined'
        ? 'Joined'
        : demoMem.status === 'pending'
        ? 'Pending'
        : 'Not Joined'
      : 'Not Joined'

    return res.status(200).json({
      success: true,
      club: {
        ...demoClub,
        membershipStatus: effectiveStatus,
      },
      isDemo: true,
      source: 'demo',
    })
  } catch (err) {
    console.error('[ClubController] Error in getClubById:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: err.message || 'Failed to fetch club details.',
    })
  }
}

/**
 * POST /api/clubs/:id/join
 * Joins a club for the authenticated student.
 */
export async function joinClub(req, res) {
  const { id } = req.params
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in as a student to join a club.',
      code: 'AUTH_REQUIRED',
    })
  }

  if (!id || !String(id).trim()) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Club identifier is required.',
      code: 'CLUB_ID_MISSING',
    })
  }

  const cleanId = String(id).trim()

  return withClubLock(cleanId, async () => {
    try {
      const client = getClient(req)
      let liveClub = null

      if (client) {
        try {
          let query = client.from('clubs').select('*')
          if (UUID_REGEX.test(cleanId)) {
            query = query.or(`id.eq.${cleanId},slug.eq.${cleanId}`)
          } else {
            query = query.eq('slug', cleanId)
          }
          const { data } = await query.maybeSingle()
          liveClub = data || null
        } catch {
          liveClub = null
        }
      }

      // If live club exists in database:
      if (liveClub && UUID_REGEX.test(userId)) {
        if (liveClub.status && liveClub.status !== 'active') {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Cannot join an inactive club.',
            code: 'CLUB_INACTIVE',
          })
        }

        // Check existing membership row
        const { data: existing } = await client
          .from('club_memberships')
          .select('*')
          .eq('club_id', liveClub.id)
          .eq('student_id', userId)
          .maybeSingle()

        if (existing) {
          if (existing.status === 'joined') {
            return res.status(409).json({
              error: 'Conflict',
              message: `You are already a registered member of ${liveClub.name}.`,
              code: 'ALREADY_JOINED',
            })
          }
          if (existing.status === 'pending') {
            return res.status(409).json({
              error: 'Conflict',
              message: `Your membership request for ${liveClub.name} is already pending approval.`,
              code: 'MEMBERSHIP_PENDING',
            })
          }

          // If previously left or cancelled, reactivate membership row
          const { error: updateErr } = await client
            .from('club_memberships')
            .update({
              status: 'joined',
              role: 'member',
              joined_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (updateErr) {
            throw updateErr
          }
        } else {
          // Fresh membership insertion
          const { error: insertErr } = await client
            .from('club_memberships')
            .insert({
              club_id: liveClub.id,
              student_id: userId,
              status: 'joined',
              role: 'member',
              joined_at: new Date().toISOString(),
            })

          if (insertErr) {
            // Guard duplicate key race
            if (insertErr.code === '23505') {
              return res.status(409).json({
                error: 'Conflict',
                message: `You are already a member of ${liveClub.name}.`,
                code: 'ALREADY_JOINED',
              })
            }
            throw insertErr
          }
        }

        // Recalculate member count
        const { count } = await client
          .from('club_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('club_id', liveClub.id)
          .eq('status', 'joined')

        return res.status(200).json({
          success: true,
          message: `You have successfully joined ${liveClub.name}! Welcome to the community.`,
          clubId: liveClub.slug || liveClub.id,
          membership: {
            clubId: liveClub.slug || liveClub.id,
            status: 'Joined',
          },
          membershipStatus: 'Joined',
          membersCount: typeof count === 'number' ? count : ((liveClub.members_count ?? 0) + 1),
          isDemo: false,
          source: 'live',
        })
      }

      // Demo/Fallback mode handling
      const demoClub = initialClubsData.find(
        (c) =>
          c.id.toLowerCase() === cleanId.toLowerCase() ||
          (c.slug && c.slug.toLowerCase() === cleanId.toLowerCase())
      )

      if (!demoClub) {
        return res.status(404).json({
          error: 'NotFound',
          message: `Club '${cleanId}' not found.`,
          code: 'CLUB_NOT_FOUND',
        })
      }

      if (demoClub.status && demoClub.status !== 'active') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Cannot join an inactive club.',
          code: 'CLUB_INACTIVE',
        })
      }

      const demoKey = `${userId}:${demoClub.id}`
      const currentDemoMem = demoMembershipsStore.get(demoKey)

      if (currentDemoMem?.status === 'joined') {
        return res.status(409).json({
          error: 'Conflict',
          message: `You are already a registered member of ${demoClub.name}.`,
          code: 'ALREADY_JOINED',
        })
      }

      if (currentDemoMem?.status === 'pending') {
        return res.status(409).json({
          error: 'Conflict',
          message: `Your membership request for ${demoClub.name} is already pending approval.`,
          code: 'MEMBERSHIP_PENDING',
        })
      }

      demoMembershipsStore.set(demoKey, {
        status: 'joined',
        joinedAt: new Date().toISOString(),
      })

      return res.status(200).json({
        success: true,
        message: `You have successfully joined ${demoClub.name}! Welcome aboard.`,
        clubId: demoClub.id,
        membership: {
          clubId: demoClub.id,
          status: 'Joined',
        },
        membershipStatus: 'Joined',
        membersCount: demoClub.membersCount + 1,
        isDemo: true,
        source: 'demo',
      })
    } catch (err) {
      console.error('[ClubController] Error in joinClub:', err)
      return res.status(500).json({
        error: 'InternalServerError',
        message: err.message || 'An error occurred while joining the club.',
      })
    }
  })
}

/**
 * POST /api/clubs/:id/leave
 * Leaves a club for the authenticated student.
 */
export async function leaveClub(req, res) {
  const { id } = req.params
  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please sign in to leave a club.',
      code: 'AUTH_REQUIRED',
    })
  }

  if (!id || !String(id).trim()) {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Club identifier is required.',
      code: 'CLUB_ID_MISSING',
    })
  }

  const cleanId = String(id).trim()

  return withClubLock(cleanId, async () => {
    try {
      const client = getClient(req)
      let liveClub = null

      if (client) {
        try {
          let query = client.from('clubs').select('*')
          if (UUID_REGEX.test(cleanId)) {
            query = query.or(`id.eq.${cleanId},slug.eq.${cleanId}`)
          } else {
            query = query.eq('slug', cleanId)
          }
          const { data } = await query.maybeSingle()
          liveClub = data || null
        } catch {
          liveClub = null
        }
      }

      if (liveClub && UUID_REGEX.test(userId)) {
        // Query existing membership
        const { data: existing } = await client
          .from('club_memberships')
          .select('*')
          .eq('club_id', liveClub.id)
          .eq('student_id', userId)
          .maybeSingle()

        if (!existing || existing.status !== 'joined') {
          return res.status(400).json({
            error: 'BadRequest',
            message: `You are not currently an active member of ${liveClub.name}.`,
            code: 'NOT_A_MEMBER',
          })
        }

        // Soft leave: update status to 'left'
        const { error: updateErr } = await client
          .from('club_memberships')
          .update({
            status: 'left',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)

        if (updateErr) {
          throw updateErr
        }

        const { count } = await client
          .from('club_memberships')
          .select('id', { count: 'exact', head: true })
          .eq('club_id', liveClub.id)
          .eq('status', 'joined')

        return res.status(200).json({
          success: true,
          message: `You have left ${liveClub.name}.`,
          clubId: liveClub.slug || liveClub.id,
          membership: {
            clubId: liveClub.slug || liveClub.id,
            status: 'Not Joined',
          },
          membershipStatus: 'Not Joined',
          membersCount: typeof count === 'number' ? count : Math.max(0, (liveClub.members_count ?? 1) - 1),
          isDemo: false,
          source: 'live',
        })
      }

      // Demo fallback handling
      const demoClub = initialClubsData.find(
        (c) =>
          c.id.toLowerCase() === cleanId.toLowerCase() ||
          (c.slug && c.slug.toLowerCase() === cleanId.toLowerCase())
      )

      if (!demoClub) {
        return res.status(404).json({
          error: 'NotFound',
          message: `Club '${cleanId}' not found.`,
          code: 'CLUB_NOT_FOUND',
        })
      }

      const demoKey = `${userId}:${demoClub.id}`
      const currentDemoMem = demoMembershipsStore.get(demoKey)

      const currentStatus = currentDemoMem ? currentDemoMem.status : 'none'

      if (currentStatus !== 'joined') {
        return res.status(400).json({
          error: 'BadRequest',
          message: `You are not currently an active member of ${demoClub.name}.`,
          code: 'NOT_A_MEMBER',
        })
      }

      demoMembershipsStore.set(demoKey, {
        status: 'left',
        leftAt: new Date().toISOString(),
      })

      return res.status(200).json({
        success: true,
        message: `You have left ${demoClub.name}.`,
        clubId: demoClub.id,
        membership: {
          clubId: demoClub.id,
          status: 'Not Joined',
        },
        membershipStatus: 'Not Joined',
        membersCount: Math.max(0, demoClub.membersCount - 1),
        isDemo: true,
        source: 'demo',
      })
    } catch (err) {
      console.error('[ClubController] Error in leaveClub:', err)
      return res.status(500).json({
        error: 'InternalServerError',
        message: err.message || 'An error occurred while leaving the club.',
      })
    }
  })
}
