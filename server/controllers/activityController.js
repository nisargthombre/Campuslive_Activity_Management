import {
  getAdminSupabase,
  getAuthenticatedClient,
  adminSupabase,
  supabase,
} from '../supabase.js'

/**
 * ==============================================================================
 * CAMPUS LIVE: ACTIVITY CONTROLLER
 * ==============================================================================
 * Architecture & Security Constraints:
 * 1. Read-Only Student Exploration:
 *    Returns activities appropriate for students to discover. Draft and cancelled
 *    activities are excluded from student discovery feeds.
 *
 * 2. Database Schema Alignment:
 *    Strictly aligns with public.activities columns in PostgreSQL:
 *    id, title, description, activity_type, category, thumbnail_url, banner_url,
 *    date, start_time, end_time, venue, address, organizer, eligibility,
 *    department, course, academic_year, max_participants, registration_deadline,
 *    contact_name, contact_email, contact_phone, status, created_by, created_at,
 *    updated_at.
 *
 * 3. Client & RLS Propagation:
 *    Uses the caller's authenticated Supabase client (scoped with JWT access token)
 *    when available to honor Row Level Security (RLS), with administrative client
 *    fallback for server operations.
 *
 * 4. Diagnostics & Safe Logging:
 *    Never logs tokens, secret keys, or passwords.
 * ==============================================================================
 */

/**
 * Normalizes and formats a raw database activity record for API responses.
 *
 * @param {object} row - Raw row from public.activities
 * @returns {object} Standardized, student-safe activity object
 */
export function formatSafeActivity(row) {
  if (!row) return null

  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    activityType: row.activity_type || row.category || 'Other',
    category: row.category || row.activity_type || 'Other',
    thumbnailUrl: row.thumbnail_url || null,
    bannerUrl: row.banner_url || null,
    date: row.date || null,
    startTime: row.start_time || null,
    endTime: row.end_time || null,
    venue: row.venue || row.address || 'Campus Venue',
    address: row.address || null,
    organizer: row.organizer || 'Campus Live',
    eligibility: row.eligibility || null,
    department: row.department || 'All Departments',
    course: row.course || null,
    academicYear: row.academic_year || null,
    maxParticipants: row.max_participants || null,
    spotsLeft: row.max_participants || null,
    registrationDeadline: row.registration_deadline || null,
    contactName: row.contact_name || null,
    contactEmail: row.contact_email || null,
    contactPhone: row.contact_phone || null,
    status: row.status || 'upcoming',
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

/**
 * GET /api/activities
 * Retrieves published and upcoming activities for student discovery.
 *
 * Supported query parameters:
 * - search: Keyword matching title, description, category, organizer, venue, department
 * - category: Filter by category / activity_type
 * - department: Filter by department
 * - status: Filter by activity status
 * - limit: Maximum records to return (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function getActivities(req, res) {
  try {
    const {
      search,
      category,
      department,
      status,
      limit = 50,
      offset = 0,
    } = req.query || {}

    // Prefer authenticated client scoped with caller JWT to preserve RLS; fallback to admin/anon
    const client =
      (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
      getAdminSupabase() ||
      adminSupabase ||
      supabase

    if (!client) {
      console.error('[ActivityController] Supabase client is not configured.')
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Activity service is unavailable. Database connection not configured.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    // Build query on public.activities
    let query = client
      .from('activities')
      .select('*')
      .not('status', 'ilike', '%draft%')
      .not('status', 'ilike', '%cancelled%')
      .not('status', 'ilike', '%archived%')
      .order('date', { ascending: true })

    // Optional category / activity type filter
    if (category && category !== 'All') {
      query = query.or(`category.ilike.%${category}%,activity_type.ilike.%${category}%`)
    }

    // Optional department filter
    if (department && department !== 'All Departments') {
      query = query.or(`department.ilike.%${department}%,department.eq.All Departments`)
    }

    // Optional status filter
    if (status && status !== 'All') {
      query = query.ilike('status', `%${status}%`)
    }

    // Pagination
    const numLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100)
    const numOffset = Math.max(0, parseInt(offset, 10) || 0)
    query = query.range(numOffset, numOffset + numLimit - 1)

    const { data, error } = await query

    if (error) {
      console.error('[ActivityController] Database query error on activities:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
      })

      return res.status(500).json({
        error: 'InternalServerError',
        message: error.message || 'Failed to retrieve activities from database.',
        code: error.code || 'ACTIVITIES_FETCH_FAILED',
        hint: error.hint || null,
      })
    }

    let activities = (data || []).map(formatSafeActivity)

    // Optional in-memory search refinement for combined fields
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase()
      activities = activities.filter((act) => {
        return (
          act.title.toLowerCase().includes(q) ||
          act.description.toLowerCase().includes(q) ||
          act.category.toLowerCase().includes(q) ||
          act.activityType.toLowerCase().includes(q) ||
          act.organizer.toLowerCase().includes(q) ||
          act.venue.toLowerCase().includes(q) ||
          act.department.toLowerCase().includes(q)
        )
      })
    }

    return res.status(200).json({
      success: true,
      activities,
      total: activities.length,
    })
  } catch (err) {
    console.error('[ActivityController] Unexpected error in getActivities:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while loading activities.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * GET /api/activities/:id
 * Retrieves detailed information for a single activity.
 */
export async function getActivityById(req, res) {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Activity ID is required.',
        code: 'ACTIVITY_ID_REQUIRED',
      })
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!UUID_REGEX.test(id)) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Activity '${id}' not found.`,
        code: 'ACTIVITY_NOT_FOUND',
      })
    }

    const client =
      (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
      getAdminSupabase() ||
      adminSupabase ||
      supabase

    if (!client) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Activity service is unavailable.',
        code: 'DATABASE_NOT_CONFIGURED',
      })
    }

    const { data, error } = await client
      .from('activities')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('[ActivityController] Error fetching activity by ID:', {
        message: error.message,
        code: error.code,
        id,
      })
      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to retrieve activity from database.',
        code: 'ACTIVITY_FETCH_FAILED',
      })
    }

    if (!data) {
      return res.status(404).json({
        error: 'NotFound',
        message: `Activity '${id}' not found.`,
        code: 'ACTIVITY_NOT_FOUND',
      })
    }

    return res.status(200).json({
      success: true,
      activity: formatSafeActivity(data),
    })
  } catch (err) {
    console.error('[ActivityController] Unexpected error in getActivityById:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while retrieving activity.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}
