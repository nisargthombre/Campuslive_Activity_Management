import { getAdminSupabase, supabase } from '../supabase.js'
import { normalizeRole } from '../middleware/authorize.js'

/**
 * ==============================================================================
 * CAMPUS LIVE - ADMIN MANAGEMENT CONTROLLER
 * ==============================================================================
 * Viva & Project Architecture Notes:
 *
 * 1. Super Admin Authorization Constraint:
 *    Only verified Super Administrators can invoke this handler.
 *    Preceded by `authenticateUser` and `requireRole('super_admin')`.
 *
 * 2. Immutable Role Enforcement:
 *    The client cannot specify or elevate roles. The system strictly creates
 *    accounts with role = 'admin'. Any attempt to supply other roles (e.g., 'super_admin')
 *    is rejected with HTTP 400.
 *
 * 3. Server-Side Service Role Isolation:
 *    Uses `supabase.auth.admin.createUser` via the private server-side service role
 *    client. Credentials and initial passwords are NEVER exposed to browser clients,
 *    never logged, and never stored in `public.profiles`.
 *
 * 4. Two-Phase Creation & Safe Rollback (Transaction Emulation):
 *    Phase 1: Create Supabase Auth user record.
 *    Phase 2: Create matching `public.profiles` row.
 *    Rollback: If Phase 2 fails, Phase 1 is immediately rolled back by calling
 *    `admin.deleteUser(id)` to prevent leaving orphaned, unmanaged Auth users.
 * ==============================================================================
 */

// Email format regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/admin/users
 * Allows a Super Admin to create a new Admin / Faculty account.
 */
export async function createAdminUser(req, res, options = {}) {
  try {
    const { full_name, email, staff_id, department, initial_password, role } = req.body || {}

    // --------------------------------------------------------------------------
    // Step 1: Input Validation
    // --------------------------------------------------------------------------

    // 1A. Full Name
    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Full name is required and must be a non-empty string.',
        code: 'INVALID_FULL_NAME',
      })
    }
    const trimmedFullName = full_name.trim()

    // 1B. Email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Email address is required.',
        code: 'INVALID_EMAIL',
      })
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Invalid email address format.',
        code: 'INVALID_EMAIL_FORMAT',
      })
    }

    // 1C. Staff ID
    if (!staff_id || typeof staff_id !== 'string' || !staff_id.trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Staff ID is required.',
        code: 'INVALID_STAFF_ID',
      })
    }
    const trimmedStaffId = staff_id.trim()

    // 1D. Department
    if (!department || typeof department !== 'string' || !department.trim()) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Department is required.',
        code: 'INVALID_DEPARTMENT',
      })
    }
    const trimmedDepartment = department.trim()

    // 1E. Initial Password (Supabase Auth requires at least 6 characters)
    if (!initial_password || typeof initial_password !== 'string' || initial_password.length < 6) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Initial password must be at least 6 characters in length.',
        code: 'INVALID_PASSWORD',
      })
    }

    // 1F. Role Validation (Must ALWAYS be 'admin'; client cannot override or elevate)
    if (role !== undefined && role !== null) {
      const normalizedRequestedRole = normalizeRole(role)
      if (normalizedRequestedRole !== 'admin') {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Role cannot be changed. Only admin accounts can be created via this endpoint.',
          code: 'INVALID_ROLE',
        })
      }
    }

    // --------------------------------------------------------------------------
    // Step 2: Acquire Supabase Admin Client
    // --------------------------------------------------------------------------
    const adminClient =
      options.adminClient ||
      req.app?.locals?.adminClient ||
      getAdminSupabase()

    if (!adminClient) {
      console.error('[AdminController] Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.')
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Administrator management service is not configured on the server. Service role key required.',
        code: 'ADMIN_SERVICE_UNCONFIGURED',
      })
    }

    // --------------------------------------------------------------------------
    // Step 3: Check for Existing User / Conflict
    // --------------------------------------------------------------------------
    const dbClient = adminClient || supabase

    // Check if email already exists in public.profiles
    const { data: existingEmailProfile, error: emailCheckError } = await dbClient
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('[AdminController] Error checking existing email in profiles:', emailCheckError.message)
    }

    if (existingEmailProfile) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.',
        code: 'EMAIL_ALREADY_EXISTS',
      })
    }

    // Check if staff_id already exists in public.profiles (stored in student_id column)
    const { data: existingStaffProfile, error: staffCheckError } = await dbClient
      .from('profiles')
      .select('id, student_id')
      .eq('student_id', trimmedStaffId)
      .maybeSingle()

    if (staffCheckError && staffCheckError.code !== 'PGRST116') {
      console.error('[AdminController] Error checking existing staff_id in profiles:', staffCheckError.message)
    }

    if (existingStaffProfile) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An account with this Staff ID already exists.',
        code: 'STAFF_ID_ALREADY_EXISTS',
      })
    }

    // --------------------------------------------------------------------------
    // Step 4: Audit Logging (Before Sensitive Operation)
    // --------------------------------------------------------------------------
    const superAdminId = req.user?.id || 'system'
    const superAdminEmail = req.user?.email || 'system'
    console.log(
      `[Audit] [UserCreation] Super Admin '${superAdminId}' (${superAdminEmail}) initiated creation of Admin user '${normalizedEmail}' (Staff ID: '${trimmedStaffId}', Dept: '${trimmedDepartment}').`
    )

    // --------------------------------------------------------------------------
    // Step 5: Phase 1 - Create Supabase Auth User via Admin API
    // --------------------------------------------------------------------------
    const { data: authResult, error: authError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password: initial_password,
      email_confirm: true, // Mark email confirmed for immediate access
      user_metadata: {
        full_name: trimmedFullName,
        role: 'admin',
        department: trimmedDepartment,
        staff_id: trimmedStaffId,
      },
    })

    if (authError || !authResult?.user) {
      const errMsg = authError?.message || ''
      console.error(`[AdminController] Supabase Auth creation failed: ${errMsg}`)

      // Handle duplicate email reported by Supabase Auth engine
      if (
        errMsg.toLowerCase().includes('already registered') ||
        errMsg.toLowerCase().includes('already exists') ||
        errMsg.toLowerCase().includes('duplicate')
      ) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'An account with this email address already exists in authentication registry.',
          code: 'EMAIL_ALREADY_EXISTS',
        })
      }

      return res.status(400).json({
        error: 'BadRequest',
        message: authError?.message || 'Failed to create user account.',
        code: 'AUTH_CREATION_FAILED',
      })
    }

    const newUserId = authResult.user.id

    // --------------------------------------------------------------------------
    // Step 6: Phase 2 - Create Corresponding public.profiles Record
    // --------------------------------------------------------------------------
    const profilePayload = {
      id: newUserId,
      full_name: trimmedFullName,
      email: normalizedEmail,
      role: 'admin',
      department: trimmedDepartment,
      student_id: trimmedStaffId,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    const { data: profileRow, error: profileError } = await adminClient
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
      .select('id, full_name, email, role, department, student_id, is_active, created_at, updated_at')
      .single()

    // --------------------------------------------------------------------------
    // Step 7: Rollback / Cleanup if Phase 2 Fails
    // --------------------------------------------------------------------------
    if (profileError) {
      console.error(
        `[AdminController] Profile row creation failed for Auth user '${newUserId}'. Initiating rollback cleanup... Error:`,
        profileError.message
      )

      try {
        const { error: rollbackError } = await adminClient.auth.admin.deleteUser(newUserId)
        if (rollbackError) {
          console.error(
            `[AdminController] CRITICAL ROLLBACK FAILURE: Unable to delete orphan Auth user '${newUserId}':`,
            rollbackError.message
          )
        } else {
          console.log(
            `[AdminController] Rollback successful: Orphan Auth user '${newUserId}' safely deleted.`
          )
        }
      } catch (rollbackEx) {
        console.error(
          `[AdminController] CRITICAL ROLLBACK EXCEPTION: Unable to delete orphan Auth user '${newUserId}':`,
          rollbackEx.message
        )
      }

      return res.status(500).json({
        error: 'InternalServerError',
        message: 'Failed to initialize administrator profile. The operation was safely aborted.',
        code: 'PROFILE_CREATION_FAILED',
      })
    }

    // --------------------------------------------------------------------------
    // Step 8: Success Response (Safe account data only)
    // --------------------------------------------------------------------------
    console.log(
      `[Audit] [UserCreation] Admin account '${newUserId}' (${normalizedEmail}) successfully created and verified by Super Admin '${superAdminId}'.`
    )

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      user: {
        id: profileRow.id,
        full_name: profileRow.full_name,
        email: profileRow.email,
        staff_id: profileRow.student_id,
        department: profileRow.department,
        role: profileRow.role,
        is_active: profileRow.is_active,
        created_at: profileRow.created_at || authResult.user.created_at,
      },
    })
  } catch (err) {
    console.error('[AdminController] Unexpected error in createAdminUser:', err)
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred while processing admin account creation.',
      code: 'UNEXPECTED_SERVER_ERROR',
    })
  }
}
