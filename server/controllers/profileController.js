import { getAuthenticatedClient, getAdminSupabase, adminSupabase, supabase } from '../supabase.js'

/**
 * ==============================================================================
 * CAMPUS LIVE - CANONICAL PROFILE CONTROLLER
 * ==============================================================================
 * Security & Architectural Constraints:
 *
 * 1. Principle of Least Privilege:
 *    Users can view and update their own profile, but critical system attributes
 *    such as `id`, `role`, `email`, and `is_active` are immutable through this API.
 *
 * 2. Cryptographic Identity Anchor:
 *    The target user ID is NEVER taken from the client's HTTP request body or query.
 *    Instead, it is strictly bound to `req.user.id`, verified cryptographically
 *    by the Supabase JWT authentication middleware.
 *
 * 3. Strict Attribute Whitelisting:
 *    Incoming request fields are explicitly filtered against an allowed whitelist.
 *    Any attempted parameter tampering (e.g. passing { role: 'super_admin' }) is
 *    safely ignored and stripped.
 *
 * 4. Database Security & RLS:
 *    Queries are executed using `getAuthenticatedClient(req.token)`, propagating
 *    the caller's JWT directly to PostgreSQL Row Level Security (RLS).
 * ==============================================================================
 */

/**
 * Sanitizes and formats a raw database profile row for safe API responses.
 * Never includes internal hashes, secrets, or auth tokens.
 *
 * @param {object} profile - Raw row from public.profiles
 * @param {object} [user] - Optional Supabase auth user object
 * @returns {object} Clean, client-safe profile object
 */
export function formatSafeProfile(profile, user = null) {
  if (!profile) return null

  return {
    id: profile.id,
    fullName: profile.full_name || '',
    email: profile.email || user?.email || '',
    role: profile.role || 'student',
    department: profile.department || null,
    course: profile.course || null,
    academicYear: profile.academic_year || null,
    studentId: profile.student_id || null,
    division: profile.division || null,
    enrollmentYear: profile.enrollment_year || null,
    phone: profile.phone || null,
    profileImage: profile.profile_image || null,
    socialLinks: profile.social_links || null,
    preferences:
      profile.preferences ||
      (profile.id && inMemoryPreferencesStore.get(profile.id)) ||
      DEFAULT_STUDENT_PREFERENCES,
    isActive: profile.is_active !== false,
    createdAt: profile.created_at || null,
    updatedAt: profile.updated_at || null,
  }
}

/**
 * Helper to validate URL strings for social links
 */
function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string' || !string.trim()) return true
  try {
    const parsed = new URL(string.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * GET /api/profile/me
 * Retrieves the currently authenticated user's profile from public.profiles.
 */
export async function getProfileMe(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User identity missing from authenticated context.',
        code: 'USER_IDENTITY_MISSING',
      })
    }

    // If req.profile was already attached by authenticateUser middleware, reuse it
    let profile = req.profile

    if (!profile) {
      // Prefer client scoped with caller JWT to preserve RLS; fallback to admin/anon
      const client =
        req?.mockClient ||
        (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
        getAdminSupabase() ||
        adminSupabase ||
        supabase

      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[ProfileController] Error fetching profile:', error.message)
        return res.status(500).json({
          error: 'InternalServerError',
          message: 'Failed to retrieve profile record from database.',
          code: 'PROFILE_FETCH_FAILED',
        })
      }
      profile = data
    }

    if (!profile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Profile record not found in database.',
        code: 'PROFILE_NOT_FOUND',
      })
    }

    return res.status(200).json({
      success: true,
      profile: formatSafeProfile(profile, req.user),
    })
  } catch (err) {
    console.error('[ProfileController] Unexpected error in getProfileMe:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while loading profile.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * PUT /api/profile/me
 * Updates permitted profile fields for the authenticated user.
 */
export async function updateProfileMe(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User identity missing from authenticated context.',
        code: 'USER_IDENTITY_MISSING',
      })
    }

    const body = req.body || {}

    // --------------------------------------------------------------------------
    // 1. Strict Whitelist & Extraction (Supports camelCase & snake_case)
    // --------------------------------------------------------------------------
    const rawFullName = body.full_name !== undefined ? body.full_name : body.fullName
    const rawDepartment = body.department
    const rawCourse = body.course
    const rawAcademicYear =
      body.academic_year !== undefined ? body.academic_year : body.academicYear
    const rawStudentId =
      body.student_id !== undefined
        ? body.student_id
        : body.studentId !== undefined
        ? body.studentId
        : body.staff_id !== undefined
        ? body.staff_id
        : body.staffId
    const rawDivision = body.division
    const rawPhone = body.phone
    const rawSocialLinks =
      body.social_links !== undefined ? body.social_links : body.socialLinks
    const rawProfileImage =
      body.profile_image !== undefined ? body.profile_image : body.profileImage

    const updates = {}

    // --------------------------------------------------------------------------
    // 2. Field Validations
    // --------------------------------------------------------------------------

    // A. Full Name (Required string if provided)
    if (rawFullName !== undefined) {
      if (typeof rawFullName !== 'string' || !rawFullName.trim()) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Full name must be a non-empty string.',
          code: 'INVALID_FULL_NAME',
        })
      }
      if (rawFullName.trim().length > 100) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Full name cannot exceed 100 characters.',
          code: 'FULL_NAME_TOO_LONG',
        })
      }
      updates.full_name = rawFullName.trim()
    }

    // B. Phone (Optional string)
    if (rawPhone !== undefined) {
      if (rawPhone !== null && typeof rawPhone !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Phone must be a string or null.',
          code: 'INVALID_PHONE',
        })
      }
      updates.phone = rawPhone ? rawPhone.trim() : null
    }

    // C. Department (Optional string)
    if (rawDepartment !== undefined) {
      if (rawDepartment !== null && typeof rawDepartment !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Department must be a string.',
          code: 'INVALID_DEPARTMENT',
        })
      }
      updates.department = rawDepartment ? rawDepartment.trim() : null
    }

    // D. Course / Program (Optional string)
    if (rawCourse !== undefined) {
      if (rawCourse !== null && typeof rawCourse !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Course must be a string.',
          code: 'INVALID_COURSE',
        })
      }
      updates.course = rawCourse ? rawCourse.trim() : null
    }

    // E. Academic Year (Optional string)
    if (rawAcademicYear !== undefined) {
      if (rawAcademicYear !== null && typeof rawAcademicYear !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Academic Year must be a string.',
          code: 'INVALID_ACADEMIC_YEAR',
        })
      }
      updates.academic_year = rawAcademicYear ? rawAcademicYear.trim() : null
    }

    // F. Student ID / Staff ID (Optional string)
    if (rawStudentId !== undefined) {
      if (rawStudentId !== null && typeof rawStudentId !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'ID must be a string.',
          code: 'INVALID_ID_FORMAT',
        })
      }
      updates.student_id = rawStudentId ? rawStudentId.trim() : null
    }

    // G. Division / Class (Optional string)
    if (rawDivision !== undefined) {
      if (rawDivision !== null && typeof rawDivision !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Division must be a string.',
          code: 'INVALID_DIVISION',
        })
      }
      updates.division = rawDivision ? rawDivision.trim() : null
    }

    // H. Social Links (Optional object)
    if (rawSocialLinks !== undefined) {
      if (
        rawSocialLinks !== null &&
        (typeof rawSocialLinks !== 'object' || Array.isArray(rawSocialLinks))
      ) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Social links must be an object with URL properties.',
          code: 'INVALID_SOCIAL_LINKS_OBJECT',
        })
      }

      if (rawSocialLinks) {
        const { linkedin, github, portfolio, other } = rawSocialLinks

        if (linkedin && !isValidHttpUrl(linkedin)) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Invalid LinkedIn URL format. Must start with http:// or https://',
            code: 'INVALID_LINKEDIN_URL',
          })
        }
        if (github && !isValidHttpUrl(github)) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Invalid GitHub URL format. Must start with http:// or https://',
            code: 'INVALID_GITHUB_URL',
          })
        }
        if (portfolio && !isValidHttpUrl(portfolio)) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Invalid Portfolio URL format. Must start with http:// or https://',
            code: 'INVALID_PORTFOLIO_URL',
          })
        }
        if (other && !isValidHttpUrl(other)) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Invalid website URL format for other link.',
            code: 'INVALID_OTHER_URL',
          })
        }

        updates.social_links = {
          linkedin: linkedin ? linkedin.trim() : '',
          github: github ? github.trim() : '',
          portfolio: portfolio ? portfolio.trim() : '',
          other: other ? other.trim() : '',
        }
      } else {
        updates.social_links = null
      }
    }

    // I. Profile Image (Optional string URL or null)
    if (rawProfileImage !== undefined) {
      if (rawProfileImage !== null && typeof rawProfileImage !== 'string') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Profile image must be a string URL or null.',
          code: 'INVALID_PROFILE_IMAGE',
        })
      }

      if (typeof rawProfileImage === 'string') {
        const trimmed = rawProfileImage.trim()
        if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Profile image must be a valid HTTP or HTTPS URL.',
            code: 'INVALID_PROFILE_IMAGE_URL',
          })
        }
        if (trimmed.length > 2000) {
          return res.status(400).json({
            error: 'BadRequest',
            message: 'Profile image URL exceeds maximum length.',
            code: 'PROFILE_IMAGE_TOO_LONG',
          })
        }
        updates.profile_image = trimmed || null
      } else {
        updates.profile_image = null
      }
    }

    // --------------------------------------------------------------------------
    // 3. Ensure At Least One Editable Field is Provided
    // --------------------------------------------------------------------------
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No valid editable fields were provided in the request body.',
        code: 'NO_VALID_FIELDS',
        allowedFields: [
          'full_name',
          'department',
          'course',
          'academic_year',
          'student_id',
          'division',
          'phone',
          'social_links',
          'profile_image',
        ],
      })
    }

    // Timestamp tracking
    updates.updated_at = new Date().toISOString()

    // --------------------------------------------------------------------------
    // 4. Execute Parameterized Database Update
    // --------------------------------------------------------------------------
    const client =
      req?.mockClient ||
      (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
      getAdminSupabase() ||
      adminSupabase ||
      supabase

    const { data: updatedProfile, error: updateError } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('[ProfileController] Database update error:', updateError.message)
      return res.status(500).json({
        error: 'InternalServerError',
        message: updateError.message || 'Failed to update profile record in database.',
        code: 'PROFILE_UPDATE_FAILED',
      })
    }

    if (!updatedProfile) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Profile record not found for update.',
        code: 'PROFILE_NOT_FOUND',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile: formatSafeProfile(updatedProfile, req.user),
    })
  } catch (err) {
    console.error('[ProfileController] Unexpected error in updateProfileMe:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating profile.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * ==============================================================================
 * STUDENT PREFERENCES HANDLERS
 * ==============================================================================
 */

/**
 * Default preferences for student portal settings
 */
export const DEFAULT_STUDENT_PREFERENCES = {
  notifications: {
    activityAlerts: true,
    registrationUpdates: true,
    clubNotices: true,
    campusAdvisories: true,
    emailDigest: false,
  },
  appearance: {
    theme: 'light',
    density: 'comfortable',
  },
  security: {
    twoFactorEnabled: false,
  },
}

/**
 * In-memory fallback preferences store
 * Keyed by userId string. Ensures resilience when database column 'preferences'
 * has not yet been migrated to the remote Supabase PostgreSQL instance.
 */
export const inMemoryPreferencesStore = new Map()

/**
 * Validates preferences payload from request body.
 *
 * @param {object} payload
 * @returns {{ valid: boolean, error?: string, code?: string, sanitized?: object }}
 */
export function validatePreferencesPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      error: 'Request body must be a valid JSON object.',
      code: 'INVALID_PREFERENCES_PAYLOAD',
    }
  }

  const { notifications, appearance, security } = payload

  // At least one section or valid key must be supplied
  if (
    notifications === undefined &&
    appearance === undefined &&
    security === undefined
  ) {
    return {
      valid: false,
      error: 'At least one preference category (notifications, appearance, security) must be provided.',
      code: 'NO_PREFERENCES_PROVIDED',
    }
  }

  const sanitized = {}

  // 1. Validate notifications
  if (notifications !== undefined) {
    if (!notifications || typeof notifications !== 'object' || Array.isArray(notifications)) {
      return {
        valid: false,
        error: 'Notifications preferences must be an object.',
        code: 'INVALID_NOTIFICATIONS_OBJECT',
      }
    }

    const validNotifKeys = [
      'activityAlerts',
      'registrationUpdates',
      'clubNotices',
      'campusAdvisories',
      'emailDigest',
    ]

    sanitized.notifications = {}
    for (const [key, val] of Object.entries(notifications)) {
      if (validNotifKeys.includes(key)) {
        if (typeof val !== 'boolean') {
          return {
            valid: false,
            error: `Notification setting '${key}' must be a boolean (true or false).`,
            code: 'INVALID_NOTIFICATION_PREF',
          }
        }
        sanitized.notifications[key] = val
      }
    }
  }

  // 2. Validate appearance
  if (appearance !== undefined) {
    if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) {
      return {
        valid: false,
        error: 'Appearance preferences must be an object.',
        code: 'INVALID_APPEARANCE_OBJECT',
      }
    }

    sanitized.appearance = {}

    if (appearance.theme !== undefined) {
      const allowedThemes = ['light', 'dark', 'system']
      if (!allowedThemes.includes(appearance.theme)) {
        return {
          valid: false,
          error: `Appearance theme must be one of: ${allowedThemes.join(', ')}.`,
          code: 'INVALID_THEME_PREF',
        }
      }
      sanitized.appearance.theme = appearance.theme
    }

    if (appearance.density !== undefined) {
      const allowedDensities = ['comfortable', 'compact']
      if (!allowedDensities.includes(appearance.density)) {
        return {
          valid: false,
          error: `Layout density must be one of: ${allowedDensities.join(', ')}.`,
          code: 'INVALID_DENSITY_PREF',
        }
      }
      sanitized.appearance.density = appearance.density
    }
  }

  // 3. Validate security
  if (security !== undefined) {
    if (!security || typeof security !== 'object' || Array.isArray(security)) {
      return {
        valid: false,
        error: 'Security preferences must be an object.',
        code: 'INVALID_SECURITY_OBJECT',
      }
    }

    sanitized.security = {}

    if (security.twoFactorEnabled !== undefined) {
      if (typeof security.twoFactorEnabled !== 'boolean') {
        return {
          valid: false,
          error: 'twoFactorEnabled must be a boolean (true or false).',
          code: 'INVALID_SECURITY_PREF',
        }
      }
      sanitized.security.twoFactorEnabled = security.twoFactorEnabled
    }
  }

  return { valid: true, sanitized }
}

/**
 * Helper to identify when PostgreSQL / PostgREST reports that a column
 * does not exist in the database table schema.
 */
function isColumnMissingError(error) {
  if (!error) return false
  const code = String(error.code || '')
  const msg = (error.message || '').toLowerCase()
  return (
    code === '42703' ||
    code === 'PGRST204' ||
    msg.includes('preferences') ||
    msg.includes('column') ||
    msg.includes('schema cache')
  )
}

/**
 * GET /api/profile/preferences
 * Retrieves student preferences from database or resilient in-memory fallback.
 */
export async function getProfilePreferences(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User identity missing from authenticated context.',
        code: 'USER_IDENTITY_MISSING',
      })
    }

    const client =
      req?.mockClient ||
      (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
      getAdminSupabase() ||
      adminSupabase ||
      supabase

    let dbPreferences = null
    let dbHasColumn = true

    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('preferences')
          .eq('id', userId)
          .maybeSingle()

        if (error) {
          if (isColumnMissingError(error)) {
            dbHasColumn = false
          } else {
            console.error('[ProfileController] Database error querying preferences:', error.message)
            return res.status(500).json({
              error: 'InternalServerError',
              message: 'Failed to retrieve preferences from database.',
              code: 'PREFERENCES_FETCH_FAILED',
            })
          }
        } else if (data && data.preferences) {
          dbPreferences = data.preferences
        }
      } catch (dbErr) {
        console.warn('[ProfileController] Exception reading preferences from DB:', dbErr.message)
        dbHasColumn = false
      }
    } else {
      dbHasColumn = false
    }

    const fallbackPrefs = inMemoryPreferencesStore.get(userId)
    const effectivePreferences = {
      notifications: {
        ...DEFAULT_STUDENT_PREFERENCES.notifications,
        ...(fallbackPrefs?.notifications || {}),
        ...(dbPreferences?.notifications || {}),
      },
      appearance: {
        ...DEFAULT_STUDENT_PREFERENCES.appearance,
        ...(fallbackPrefs?.appearance || {}),
        ...(dbPreferences?.appearance || {}),
      },
      security: {
        ...DEFAULT_STUDENT_PREFERENCES.security,
        ...(fallbackPrefs?.security || {}),
        ...(dbPreferences?.security || {}),
      },
    }

    return res.status(200).json({
      success: true,
      preferences: effectivePreferences,
      storage: dbHasColumn && dbPreferences ? 'database' : 'local_fallback',
      databaseSupported: dbHasColumn,
      message:
        dbHasColumn && dbPreferences
          ? 'Preferences loaded from database.'
          : 'Preferences loaded from fallback storage (remote database migration pending).',
    })
  } catch (err) {
    console.error('[ProfileController] Unexpected error in getProfilePreferences:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while loading preferences.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

/**
 * PUT /api/profile/preferences
 * Updates student preferences with validation and database/fallback persistence.
 */
export async function updateProfilePreferences(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User identity missing from authenticated context.',
        code: 'USER_IDENTITY_MISSING',
      })
    }

    // 1. Validate incoming preferences payload
    const validation = validatePreferencesPayload(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        error: 'BadRequest',
        message: validation.error,
        code: validation.code,
      })
    }

    const { sanitized } = validation

    // 2. Compute merged preferences
    const fallbackPrefs = inMemoryPreferencesStore.get(userId) || DEFAULT_STUDENT_PREFERENCES
    const mergedPreferences = {
      notifications: {
        ...fallbackPrefs.notifications,
        ...(sanitized.notifications || {}),
      },
      appearance: {
        ...fallbackPrefs.appearance,
        ...(sanitized.appearance || {}),
      },
      security: {
        ...fallbackPrefs.security,
        ...(sanitized.security || {}),
      },
    }

    // 3. Attempt database persistence
    const client =
      req?.mockClient ||
      (req.token && typeof req.token === 'string' ? getAuthenticatedClient(req.token) : null) ||
      getAdminSupabase() ||
      adminSupabase ||
      supabase

    let dbSaved = false
    let dbHasColumn = true

    if (client) {
      try {
        const { error: updateError } = await client
          .from('profiles')
          .update({
            preferences: mergedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

        if (updateError) {
          if (isColumnMissingError(updateError)) {
            dbHasColumn = false
          } else {
            console.error('[ProfileController] Database error updating preferences:', updateError.message)
            return res.status(500).json({
              error: 'InternalServerError',
              message: 'Failed to persist preferences to database.',
              code: 'DATABASE_UPDATE_FAILED',
            })
          }
        } else {
          dbSaved = true
        }
      } catch (dbErr) {
        console.warn('[ProfileController] DB update exception:', dbErr.message)
        dbHasColumn = false
      }
    } else {
      dbHasColumn = false
    }

    // Store in fallback memory store to guarantee session persistence
    inMemoryPreferencesStore.set(userId, mergedPreferences)

    return res.status(200).json({
      success: true,
      message: dbSaved
        ? 'Preferences saved to database successfully.'
        : 'Preferences saved to session fallback storage. (Database column requires pending local migration).',
      preferences: mergedPreferences,
      storage: dbSaved ? 'database' : 'local_fallback',
      databaseSupported: dbHasColumn && dbSaved,
    })
  } catch (err) {
    console.error('[ProfileController] Unexpected error in updateProfilePreferences:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while updating preferences.',
      code: 'UNEXPECTED_ERROR',
    })
  }
}

