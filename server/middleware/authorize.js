/**
 * ==============================================================================
 * CAMPUS LIVE - ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MIDDLEWARE
 * ==============================================================================
 * Flow Architecture for Viva & Project Defense:
 *
 * 1. Role Verification Context:
 *    The `authenticateUser` middleware must precede this middleware in the request chain.
 *    It populates `req.profile` with institutional metadata from `public.profiles`.
 *
 * 2. Role Normalization:
 *    To ensure robust matching across database conventions and UI strings:
 *    - 'Student' / 'student' -> 'student'
 *    - 'Admin' / 'admin' / 'Faculty' / 'faculty' -> 'admin'
 *    - 'Super Admin' / 'super_admin' / 'superadmin' -> 'super_admin'
 *
 * 3. Granular Enforcement:
 *    Inspects whether the caller's normalized role matches any of the roles
 *    permitted by the route. Returns HTTP 403 Forbidden with clear diagnostic feedback
 *    if the user does not possess sufficient privileges.
 * ==============================================================================
 */

/**
 * Normalizes role strings to standard canonical tokens ('student', 'admin', 'super_admin').
 *
 * @param {string} role
 * @returns {string}
 */
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return ''

  const cleaned = role.toLowerCase().trim().replace(/[\s-]+/g, '_')

  if (cleaned === 'faculty' || cleaned === 'admin') {
    return 'admin'
  }
  if (cleaned === 'super_admin' || cleaned === 'superadmin') {
    return 'super_admin'
  }
  if (cleaned === 'student') {
    return 'student'
  }

  return cleaned
}

/**
 * Higher-order middleware factory that restricts route access to one or more allowed roles.
 *
 * Usage examples:
 *   router.get('/student-only', authenticateUser, requireRole('student'), handler)
 *   router.post('/activities', authenticateUser, requireRole('admin', 'super_admin'), handler)
 *
 * @param {...string} roles - List of permitted roles ('student', 'admin', 'super_admin')
 * @returns {import('express').RequestHandler}
 */
export function requireRole(...roles) {
  // Flatten array in case an array was passed as first argument: requireRole(['admin', 'student'])
  const allowedRoles = roles.flat().map(normalizeRole)

  return (req, res, next) => {
    // 1. Ensure user is authenticated first
    if (!req.user || !req.profile) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication must be verified before role authorization checks.',
        code: 'AUTH_REQUIRED_BEFORE_ROLE',
      })
    }

    // 2. Extract and normalize the user's role from public.profiles
    const rawRole = req.profile.role
    const userRole = normalizeRole(rawRole)

    if (!userRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'User profile does not have a designated system role.',
        code: 'ROLE_UNDEFINED',
      })
    }

    // 3. Super admin hierarchy:
    // If route requires 'admin', a 'super_admin' also qualifies by virtue of administrative hierarchy
    const hasPermission =
      allowedRoles.includes(userRole) ||
      (allowedRoles.includes('admin') && userRole === 'super_admin')

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. This endpoint requires one of the following roles: [${allowedRoles.join(
          ', '
        )}]. Current role is '${rawRole || 'None'}'.`,
        code: 'INSUFFICIENT_ROLE_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: rawRole,
      })
    }

    return next()
  }
}

/**
 * Alias for requireRole accepting an array of roles.
 */
export const requireAnyRole = (rolesArray) => requireRole(rolesArray)
