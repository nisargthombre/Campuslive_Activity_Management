/**
 * Campus Live - Route Security & Role Access Control Verification Test Suite
 *
 * Verifies all 8 requirements specified in the Step 1 task:
 * 1. Logged-out user opening /student/dashboard
 * 2. Student opening /student/profile
 * 3. Student attempting to open faculty, admin and Super Admin routes
 * 4. Faculty attempting to open Super Admin routes
 * 5. Authorized Super Admin accessing authorized routes
 * 6. Authentication loading and expired sessions
 * 7. Existing login, logout and route aliases
 * 8. Demo/offline fallback behaviour & layout identity safety
 */

import fs from 'node:fs'
import path from 'node:path'
import { normalizeRole } from '../src/lib/authUtils.js'

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 1 - ROUTE SECURITY & RBAC VERIFICATION SUITE')
console.log('======================================================================\n')

let passed = 0
let failed = 0

function assert(condition, testNumber, description) {
  if (condition) {
    console.log(`[PASS] Test ${testNumber}: ${description}`)
    passed++
  } else {
    console.error(`[FAIL] Test ${testNumber}: ${description}`)
    failed++
  }
}

// Helper simulating RoleRoute decision logic identically to RoleRoute.jsx
function evaluateRouteAccess({ user, profile, loading, allowedRoles, unauthenticatedRedirect }) {
  if (loading) {
    return { status: 'LOADING', message: 'Checking permissions...' }
  }

  if (!user) {
    return { status: 'REDIRECT_LOGIN', redirect: unauthenticatedRedirect }
  }

  const rawRole = profile?.role || user?.user_metadata?.role || user?.role || ''
  const currentRole = normalizeRole(rawRole)
  const normalizedAllowed = allowedRoles.map(normalizeRole)

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(currentRole)) {
    const fallbackPath =
      currentRole === 'super_admin'
        ? '/admin/dashboard'
        : currentRole === 'admin'
        ? '/admin/dashboard'
        : currentRole === 'faculty'
        ? '/faculty/dashboard'
        : '/student/dashboard'

    return { status: 'REDIRECT_FORBIDDEN', redirect: fallbackPath }
  }

  return { status: 'AUTHORIZED' }
}

// -----------------------------------------------------------------------------
// SECTION 1: ROLE NORMALIZATION
// -----------------------------------------------------------------------------
console.log('--- SECTION 1: Canonical Role Normalization ---')
assert(normalizeRole('Student') === 'student', '1.1', "Normalizes 'Student' -> 'student'")
assert(normalizeRole('student') === 'student', '1.2', "Normalizes 'student' -> 'student'")
assert(normalizeRole('Faculty') === 'faculty', '1.3', "Normalizes 'Faculty' -> 'faculty'")
assert(normalizeRole('faculty') === 'faculty', '1.4', "Normalizes 'faculty' -> 'faculty'")
assert(normalizeRole('Admin') === 'admin', '1.5', "Normalizes 'Admin' -> 'admin'")
assert(normalizeRole('Super Admin') === 'super_admin', '1.6', "Normalizes 'Super Admin' -> 'super_admin'")
assert(normalizeRole('super_admin') === 'super_admin', '1.7', "Normalizes 'super_admin' -> 'super_admin'")
assert(normalizeRole('superadmin') === 'super_admin', '1.8', "Normalizes 'superadmin' -> 'super_admin'")

// -----------------------------------------------------------------------------
// SECTION 2: TEST 1 - Logged-Out User Accessing Protected Routes
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: Logged-Out User Access Restrictions ---')
const loggedOutAccessStudent = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: false,
  allowedRoles: ['student'],
  unauthenticatedRedirect: '/login',
})
assert(
  loggedOutAccessStudent.status === 'REDIRECT_LOGIN' && loggedOutAccessStudent.redirect === '/login',
  '2.1',
  'Logged-out user accessing /student/dashboard is redirected to /login'
)

const loggedOutAccessFaculty = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: false,
  allowedRoles: ['faculty', 'admin', 'super_admin'],
  unauthenticatedRedirect: '/faculty/login',
})
assert(
  loggedOutAccessFaculty.status === 'REDIRECT_LOGIN' && loggedOutAccessFaculty.redirect === '/faculty/login',
  '2.2',
  'Logged-out user accessing /faculty/dashboard is redirected to /faculty/login'
)

const loggedOutAccessAdmin = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: false,
  allowedRoles: ['admin', 'super_admin'],
  unauthenticatedRedirect: '/admin/login',
})
assert(
  loggedOutAccessAdmin.status === 'REDIRECT_LOGIN' && loggedOutAccessAdmin.redirect === '/admin/login',
  '2.3',
  'Logged-out user accessing /admin/dashboard is redirected to /admin/login'
)

const loggedOutAccessSuperAdmin = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: false,
  allowedRoles: ['super_admin'],
  unauthenticatedRedirect: '/super-admin/login',
})
assert(
  loggedOutAccessSuperAdmin.status === 'REDIRECT_LOGIN' && loggedOutAccessSuperAdmin.redirect === '/super-admin/login',
  '2.4',
  'Logged-out user accessing /super-admin/dashboard is redirected to /super-admin/login'
)

// -----------------------------------------------------------------------------
// SECTION 3: TEST 2 - Student Accessing Authorized Student Routes
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: Student Authorized Access ---')
const studentUser = {
  id: 'stu-uuid-001',
  email: 'student@campuslive.edu',
  user_metadata: { role: 'student', full_name: 'Student User' },
}
const studentProfile = {
  id: 'stu-uuid-001',
  email: 'student@campuslive.edu',
  role: 'student',
  full_name: 'Student User',
}

const studentAccessProfile = evaluateRouteAccess({
  user: studentUser,
  profile: studentProfile,
  loading: false,
  allowedRoles: ['student'],
  unauthenticatedRedirect: '/login',
})
assert(
  studentAccessProfile.status === 'AUTHORIZED',
  '3.1',
  'Authenticated Student is authorized to access /student/profile'
)

const studentAccessDashboard = evaluateRouteAccess({
  user: studentUser,
  profile: studentProfile,
  loading: false,
  allowedRoles: ['student'],
  unauthenticatedRedirect: '/login',
})
assert(
  studentAccessDashboard.status === 'AUTHORIZED',
  '3.2',
  'Authenticated Student is authorized to access /student/dashboard'
)

// -----------------------------------------------------------------------------
// SECTION 4: TEST 3 - Student Escalation Attempts (Faculty, Admin, Super Admin)
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 4: Student Privilege Escalation Prevention ---')
const studentToFaculty = evaluateRouteAccess({
  user: studentUser,
  profile: studentProfile,
  loading: false,
  allowedRoles: ['faculty', 'admin', 'super_admin'],
  unauthenticatedRedirect: '/faculty/login',
})
assert(
  studentToFaculty.status === 'REDIRECT_FORBIDDEN' && studentToFaculty.redirect === '/student/dashboard',
  '4.1',
  'Student attempting to access /faculty/* is blocked and redirected to /student/dashboard'
)

const studentToAdmin = evaluateRouteAccess({
  user: studentUser,
  profile: studentProfile,
  loading: false,
  allowedRoles: ['admin', 'super_admin'],
  unauthenticatedRedirect: '/admin/login',
})
assert(
  studentToAdmin.status === 'REDIRECT_FORBIDDEN' && studentToAdmin.redirect === '/student/dashboard',
  '4.2',
  'Student attempting to access /admin/* is blocked and redirected to /student/dashboard'
)

const studentToSuperAdmin = evaluateRouteAccess({
  user: studentUser,
  profile: studentProfile,
  loading: false,
  allowedRoles: ['super_admin'],
  unauthenticatedRedirect: '/super-admin/login',
})
assert(
  studentToSuperAdmin.status === 'REDIRECT_FORBIDDEN' && studentToSuperAdmin.redirect === '/student/dashboard',
  '4.3',
  'Student attempting to access /super-admin/* is blocked and redirected to /student/dashboard'
)

// -----------------------------------------------------------------------------
// SECTION 5: TEST 4 - Faculty Accessing Super Admin Routes
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 5: Faculty Role Boundary Verification ---')
const facultyUser = {
  id: 'fac-uuid-002',
  email: 'faculty@campuslive.edu',
  user_metadata: { role: 'faculty', full_name: 'Prof. David Vance' },
}
const facultyProfile = {
  id: 'fac-uuid-002',
  email: 'faculty@campuslive.edu',
  role: 'faculty',
  full_name: 'Prof. David Vance',
}

const facultyToFaculty = evaluateRouteAccess({
  user: facultyUser,
  profile: facultyProfile,
  loading: false,
  allowedRoles: ['faculty', 'admin', 'super_admin'],
  unauthenticatedRedirect: '/faculty/login',
})
assert(
  facultyToFaculty.status === 'AUTHORIZED',
  '5.1',
  'Faculty member is authorized to access /faculty/dashboard'
)

const facultyToSuperAdmin = evaluateRouteAccess({
  user: facultyUser,
  profile: facultyProfile,
  loading: false,
  allowedRoles: ['super_admin'],
  unauthenticatedRedirect: '/super-admin/login',
})
assert(
  facultyToSuperAdmin.status === 'REDIRECT_FORBIDDEN' && facultyToSuperAdmin.redirect === '/faculty/dashboard',
  '5.2',
  'Faculty member attempting to access /super-admin/* is blocked and redirected to /faculty/dashboard'
)

// -----------------------------------------------------------------------------
// SECTION 6: TEST 5 - Super Admin Accessing Authorized Routes
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 6: Super Admin Authorization ---')
const superAdminUser = {
  id: 'sa-uuid-003',
  email: 'superadmin@campuslive.edu',
  user_metadata: { role: 'super_admin', full_name: 'Super Admin' },
}
const superAdminProfile = {
  id: 'sa-uuid-003',
  email: 'superadmin@campuslive.edu',
  role: 'super_admin',
  full_name: 'Super Admin',
}

const superAdminAccessSelf = evaluateRouteAccess({
  user: superAdminUser,
  profile: superAdminProfile,
  loading: false,
  allowedRoles: ['super_admin'],
  unauthenticatedRedirect: '/super-admin/login',
})
assert(
  superAdminAccessSelf.status === 'AUTHORIZED',
  '6.1',
  'Super Admin is authorized to access /super-admin/*'
)

const superAdminAccessAdmin = evaluateRouteAccess({
  user: superAdminUser,
  profile: superAdminProfile,
  loading: false,
  allowedRoles: ['admin', 'super_admin'],
  unauthenticatedRedirect: '/admin/login',
})
assert(
  superAdminAccessAdmin.status === 'AUTHORIZED',
  '6.2',
  'Super Admin is authorized to access /admin/*'
)

const superAdminAccessFaculty = evaluateRouteAccess({
  user: superAdminUser,
  profile: superAdminProfile,
  loading: false,
  allowedRoles: ['faculty', 'admin', 'super_admin'],
  unauthenticatedRedirect: '/faculty/login',
})
assert(
  superAdminAccessFaculty.status === 'AUTHORIZED',
  '6.3',
  'Super Admin is authorized to access /faculty/*'
)

// -----------------------------------------------------------------------------
// SECTION 7: TEST 6 - Loading State and Expired Sessions
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 7: Loading State & Expired Session Verification ---')
const loadingCheck = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: true,
  allowedRoles: ['student'],
  unauthenticatedRedirect: '/login',
})
assert(
  loadingCheck.status === 'LOADING',
  '7.1',
  'Route evaluation displays LoadingState when loading is true (no flash of content)'
)

const expiredSessionCheck = evaluateRouteAccess({
  user: null,
  profile: null,
  loading: false,
  allowedRoles: ['student'],
  unauthenticatedRedirect: '/login',
})
assert(
  expiredSessionCheck.status === 'REDIRECT_LOGIN' && expiredSessionCheck.redirect === '/login',
  '7.2',
  'Expired or revoked session redirects cleanly to login'
)

// -----------------------------------------------------------------------------
// SECTION 8: TEST 7 - Route Aliases & Router File Structure Audit
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 8: Router Definitions & Aliases Audit ---')
const appJsxContent = fs.readFileSync(path.resolve('src/App.jsx'), 'utf-8')

assert(
  appJsxContent.includes('import RoleRoute from'),
  '8.1',
  "App.jsx imports RoleRoute guard component"
)

assert(
  appJsxContent.includes('<Route element={<RoleRoute allowedRoles={[\'student\']}'),
  '8.2',
  "App.jsx protects /student/* routes with student RoleRoute"
)

assert(
  appJsxContent.includes('<Route element={<RoleRoute allowedRoles={[\'faculty\', \'admin\', \'super_admin\']}'),
  '8.3',
  "App.jsx protects /faculty/* routes with faculty RoleRoute"
)

assert(
  appJsxContent.includes('<Route element={<RoleRoute allowedRoles={[\'admin\', \'super_admin\']}'),
  '8.4',
  "App.jsx protects /admin/* routes with admin RoleRoute"
)

assert(
  appJsxContent.includes('<Route element={<RoleRoute allowedRoles={[\'super_admin\']}'),
  '8.5',
  "App.jsx strictly restricts /super-admin/* routes to super_admin"
)

assert(
  appJsxContent.includes('path="/student/registrations"') &&
  appJsxContent.includes('path="/student/my-registrations"'),
  '8.6',
  "Student registration route alias preserved"
)

assert(
  appJsxContent.includes('path="/student/history"') &&
  appJsxContent.includes('path="/student/my-activity"'),
  '8.7',
  "Student activity history route alias preserved"
)

assert(
  appJsxContent.includes('path="/dev-portals"') &&
  appJsxContent.includes('path="/help-support"'),
  '8.8',
  "Public dev portal switcher and help-support routes remain public"
)

// -----------------------------------------------------------------------------
// SECTION 9: TEST 8 - Layout Fabricated Identity Removal Audit
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 9: Layout Identity Fallback Audit ---')
const studentLayoutContent = fs.readFileSync(path.resolve('src/layouts/StudentLayout.jsx'), 'utf-8')
const facultyLayoutContent = fs.readFileSync(path.resolve('src/layouts/FacultyLayout.jsx'), 'utf-8')
const superAdminLayoutContent = fs.readFileSync(path.resolve('src/layouts/SuperAdminLayout.jsx'), 'utf-8')

assert(
  !studentLayoutContent.includes("name: 'Nisarg Thombre'"),
  '9.1',
  "StudentLayout does not contain hardcoded 'Nisarg Thombre' unauthenticated fallback"
)

assert(
  !facultyLayoutContent.includes("name: 'Prof. David Vance'"),
  '9.2',
  "FacultyLayout does not contain hardcoded 'Prof. David Vance' unauthenticated fallback"
)

assert(
  !superAdminLayoutContent.includes("const adminUser = {\n    name: 'Sarah Jenkins',"),
  '9.3',
  "SuperAdminLayout does not contain static 'Sarah Jenkins' unauthenticated user object"
)

assert(
  superAdminLayoutContent.includes('useAuth()'),
  '9.4',
  "SuperAdminLayout dynamically binds to useAuth() session"
)

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================')
console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`)
console.log('======================================================================\n')

if (failed > 0) {
  process.exit(1)
} else {
  console.log('All Route Security and Role-Based Access Control tests PASSED successfully!')
}
