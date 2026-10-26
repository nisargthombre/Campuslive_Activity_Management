/**
 * Campus Live — Step 7: Student Activity History Test Suite
 *
 * Verifies all required scenarios:
 * 1. Unauthorized access handling (401 on missing or malformed token).
 * 2. Role restriction (403 when non-student attempts to query student history).
 * 3. Ownership isolation (strictly scopes query to req.user.id).
 * 4. Concluded activity filtering (past date or status completed/concluded).
 * 5. Exclusion of cancelled and upcoming registrations.
 * 6. Summary metrics computation (totalPastEvents, thisYear, workshops, competitions).
 * 7. Empty history handling for students without past registrations.
 * 8. Category metadata and date/time formatting helpers.
 * 9. Offline demo fallback data integrity and absence of gamification/attendance flags.
 * 10. Express HTTP route integration.
 * 11. Regression verification across Steps 1, 2, 3, 5, and 6.
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import http from 'http'
import {
  getMyActivityHistory,
  isActivityConcluded,
  getActivityCategoryMetadata,
  formatDisplayDate,
  formatDisplayTime,
} from '../server/controllers/registrationController.js'
import registrationsRouter from '../server/routes/registrations.js'
import {
  participationRecords,
  activitySummary,
} from '../src/data/myActivityData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 7 - STUDENT ACTIVITY HISTORY TEST SUITE')
console.log('======================================================================\n')

let passed = 0
let failed = 0
let total = 0

function assert(condition, testNumber, description) {
  total++
  if (condition) {
    console.log(`[PASS] Test ${testNumber}: ${description}`)
    passed++
  } else {
    console.error(`[FAIL] Test ${testNumber}: ${description}`)
    failed++
    process.exitCode = 1
  }
}

// Helper to create mock Express response object
function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    setHeader(k, v) {
      this.headers[k] = v
      return this
    },
    json(data) {
      this.body = data
      return this
    },
    send(data) {
      this.body = data
      return this
    },
  }
  return res
}

// Run a child node script and assert it exits with 0
function runScript(scriptPath, testNumber, testDesc) {
  return new Promise((resolve) => {
    const proc = spawn('node', [scriptPath], {
      cwd: ROOT_DIR,
      stdio: 'pipe',
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (d) => {
      stdout += d.toString()
    })
    proc.stderr.on('data', (d) => {
      stderr += d.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        assert(true, testNumber, testDesc)
      } else {
        console.error(`    Sub-script failed with code ${code}:\n${stdout}\n${stderr}`)
        assert(false, testNumber, testDesc)
      }
      resolve()
    })
  })
}

async function runTestSuite() {
  // --------------------------------------------------------------------------
  // SECTION 1: HELPER FUNCTIONS (Activity Concluded, Category Meta, Date/Time)
  // --------------------------------------------------------------------------
  console.log('\n--- Section 1: Helper Functions & History Classification ---')

  // isActivityConcluded
  assert(
    isActivityConcluded({ status: 'completed' }) === true,
    1,
    'isActivityConcluded returns true for explicit status "completed"'
  )
  assert(
    isActivityConcluded({ status: 'concluded' }) === true,
    2,
    'isActivityConcluded returns true for explicit status "concluded"'
  )
  assert(
    isActivityConcluded({ status: 'archived' }) === true,
    3,
    'isActivityConcluded returns true for explicit status "archived"'
  )
  assert(
    isActivityConcluded({ date: '2020-01-01', status: 'upcoming' }) === true,
    4,
    'isActivityConcluded returns true for past calendar date even if status is upcoming'
  )
  assert(
    isActivityConcluded({ date: '2099-12-31', status: 'upcoming' }) === false,
    5,
    'isActivityConcluded returns false for future calendar date'
  )
  assert(
    isActivityConcluded(null) === false,
    6,
    'isActivityConcluded safely returns false for null/undefined'
  )

  // getActivityCategoryMetadata
  const catWorkshop = getActivityCategoryMetadata('Workshop & Bootcamp')
  assert(
    catWorkshop.filterCategory === 'Workshops' &&
      catWorkshop.badgeVariant === 'primary' &&
      catWorkshop.thumbnailGradient.includes('from-blue-600'),
    7,
    'getActivityCategoryMetadata maps Workshop correctly'
  )

  const catHackathon = getActivityCategoryMetadata('24-Hour Hackathon')
  assert(
    catHackathon.filterCategory === 'Hackathons' &&
      catHackathon.badgeVariant === 'secondary',
    8,
    'getActivityCategoryMetadata maps Hackathon correctly'
  )

  const catComp = getActivityCategoryMetadata('Coding Competition Prelims')
  assert(
    catComp.filterCategory === 'Competitions' &&
      catComp.badgeVariant === 'secondary',
    9,
    'getActivityCategoryMetadata maps Competition correctly'
  )

  const catSeminar = getActivityCategoryMetadata('Leadership Seminar')
  assert(
    catSeminar.filterCategory === 'Seminars' &&
      catSeminar.badgeVariant === 'warning',
    10,
    'getActivityCategoryMetadata maps Seminar correctly'
  )

  const catCultural = getActivityCategoryMetadata('Annual Cultural Gala')
  assert(
    catCultural.filterCategory === 'Cultural' &&
      catCultural.badgeVariant === 'success',
    11,
    'getActivityCategoryMetadata maps Cultural correctly'
  )

  const catSports = getActivityCategoryMetadata('Inter-College Sports Meet')
  assert(
    catSports.filterCategory === 'Sports' &&
      catSports.badgeVariant === 'success',
    12,
    'getActivityCategoryMetadata maps Sports correctly'
  )

  // formatDisplayDate & formatDisplayTime
  assert(
    formatDisplayDate('2026-09-24').includes('2026') &&
      formatDisplayDate('2026-09-24').includes('September'),
    13,
    'formatDisplayDate formats ISO date to user-friendly UK string'
  )
  assert(
    formatDisplayTime('14:30', '16:00') === '2:30 PM - 4:00 PM',
    14,
    'formatDisplayTime formats 24h start/end range to 12h AM/PM format'
  )

  // --------------------------------------------------------------------------
  // SECTION 2: CONTROLLER UNIT TESTS (Authentication, Role, Ownership)
  // --------------------------------------------------------------------------
  console.log('\n--- Section 2: Controller Unit Tests (Auth, Roles, Ownership) ---')

  // 1. Unauthenticated request
  const reqUnauth = { user: null }
  const resUnauth = createMockResponse()
  await getMyActivityHistory(reqUnauth, resUnauth)
  assert(
    resUnauth.statusCode === 401 && resUnauth.body?.code === 'UNAUTHORIZED',
    15,
    'getMyActivityHistory rejects request with missing student identity (401 UNAUTHORIZED)'
  )

  // 2. Non-student role forbidden
  const reqFaculty = {
    user: { id: 'faculty-uuid-001' },
    profile: { role: 'faculty' },
  }
  const resFaculty = createMockResponse()
  await getMyActivityHistory(reqFaculty, resFaculty)
  assert(
    resFaculty.statusCode === 403 && resFaculty.body?.code === 'STUDENT_ROLE_REQUIRED',
    16,
    'getMyActivityHistory rejects non-student accounts with HTTP 403 STUDENT_ROLE_REQUIRED'
  )

  // 3. Ownership and history filtering with mock client
  const studentA = 'student-uuid-aaa'
  const studentB = 'student-uuid-bbb'

  const mockRegistrations = [
    // Student A: Concluded Workshop
    {
      id: 'reg-001',
      student_id: studentA,
      activity_id: 'act-001',
      status: 'registered',
      registered_at: '2026-08-01T10:00:00Z',
      created_at: '2026-08-01T10:00:00Z',
    },
    // Student A: Concluded Competition
    {
      id: 'reg-002',
      student_id: studentA,
      activity_id: 'act-002',
      status: 'registered',
      registered_at: '2026-08-10T10:00:00Z',
      created_at: '2026-08-10T10:00:00Z',
    },
    // Student A: Cancelled Past Event (should be excluded!)
    {
      id: 'reg-003',
      student_id: studentA,
      activity_id: 'act-003',
      status: 'cancelled',
      registered_at: '2026-08-15T10:00:00Z',
      created_at: '2026-08-15T10:00:00Z',
    },
    // Student A: Upcoming Future Event (should be excluded!)
    {
      id: 'reg-004',
      student_id: studentA,
      activity_id: 'act-004',
      status: 'registered',
      registered_at: '2026-10-01T10:00:00Z',
      created_at: '2026-10-01T10:00:00Z',
    },
    // Student B: Concluded Event (Student A should NEVER see this!)
    {
      id: 'reg-005',
      student_id: studentB,
      activity_id: 'act-001',
      status: 'registered',
      registered_at: '2026-08-01T10:00:00Z',
      created_at: '2026-08-01T10:00:00Z',
    },
  ]

  const mockActivities = [
    {
      id: 'act-001',
      title: 'AI Machine Learning Workshop',
      category: 'Workshop',
      activity_type: 'Workshop',
      department: 'Computer Engineering',
      date: '2026-08-15',
      start_time: '10:00',
      end_time: '16:00',
      venue: 'Main Lab A',
      organizer: 'Computer Dept',
      status: 'completed',
    },
    {
      id: 'act-002',
      title: 'Campus Coding Competition Prelims',
      category: 'Competition',
      activity_type: 'Competition',
      department: 'Computer Engineering',
      date: '2026-08-20',
      start_time: '09:00',
      end_time: '12:00',
      venue: 'Auditorium',
      organizer: 'Coding Club',
      status: 'concluded',
    },
    {
      id: 'act-003',
      title: 'Cancelled Robotics Seminar',
      category: 'Seminar',
      activity_type: 'Seminar',
      department: 'Mechanical',
      date: '2026-08-25',
      status: 'completed',
    },
    {
      id: 'act-004',
      title: 'Future Tech Conference 2099',
      category: 'Seminar',
      activity_type: 'Seminar',
      department: 'IT',
      date: '2099-12-31',
      status: 'upcoming',
    },
  ]

  // Create mock Supabase client for testing
  function createMockSupabaseClient(targetStudentId) {
    return {
      from(tableName) {
        if (tableName === 'registrations') {
          return {
            select() {
              return {
                eq(col, val) {
                  return {
                    order() {
                      const filtered = mockRegistrations.filter(
                        (r) => r[col] === val && r.student_id === targetStudentId
                      )
                      return Promise.resolve({ data: filtered, error: null })
                    },
                  }
                },
              }
            },
          }
        }
        if (tableName === 'activities') {
          return {
            select() {
              return {
                in(col, valList) {
                  const filtered = mockActivities.filter((a) => valList.includes(a.id))
                  return Promise.resolve({ data: filtered, error: null })
                },
              }
            },
          }
        }
        return {
          select: () => Promise.resolve({ data: [], error: null }),
        }
      },
    }
  }

  // Execute getMyActivityHistory for Student A
  const reqStudentA = {
    user: { id: studentA },
    profile: { role: 'student' },
    mockClient: createMockSupabaseClient(studentA),
  }
  const resStudentA = createMockResponse()
  await getMyActivityHistory(reqStudentA, resStudentA)

  assert(
    resStudentA.statusCode === 200 && resStudentA.body?.success === true,
    17,
    'getMyActivityHistory successfully returns HTTP 200 for authenticated student'
  )

  const studentARecords = resStudentA.body?.records || []
  assert(
    studentARecords.length === 2,
    18,
    `Student A returns exactly 2 concluded activity records (returned: ${studentARecords.length})`
  )

  const returnedTitles = studentARecords.map((r) => r.title)
  assert(
    returnedTitles.includes('AI Machine Learning Workshop') &&
      returnedTitles.includes('Campus Coding Competition Prelims'),
    19,
    'History contains verified past events (Workshop and Competition)'
  )

  assert(
    !returnedTitles.includes('Cancelled Robotics Seminar'),
    20,
    'Cancelled registrations are strictly excluded from concluded history'
  )

  assert(
    !returnedTitles.includes('Future Tech Conference 2099'),
    21,
    'Upcoming future registrations are strictly excluded from concluded history'
  )

  // Ownership verification: Student B's records not in Student A
  const studentAIds = studentARecords.map((r) => r.id)
  assert(
    !studentAIds.includes('reg-005'),
    22,
    'Ownership isolation: Student A cannot see registrations belonging to Student B'
  )

  // Summary statistics verification
  const summaryA = resStudentA.body?.summary
  assert(
    summaryA?.totalPastEvents === 2 &&
      summaryA?.workshops === 1 &&
      summaryA?.competitions === 1,
    23,
    'Summary metrics accurately reflect student history breakdown (2 past events, 1 workshop, 1 competition)'
  )

  // Source declaration
  assert(
    resStudentA.body?.source === 'database',
    24,
    'Response explicitly specifies source as "database"'
  )

  // Empty history test: Student with zero registrations
  const studentEmpty = 'student-empty-000'
  const reqStudentEmpty = {
    user: { id: studentEmpty },
    profile: { role: 'student' },
    mockClient: createMockSupabaseClient(studentEmpty),
  }
  const resStudentEmpty = createMockResponse()
  await getMyActivityHistory(reqStudentEmpty, resStudentEmpty)

  assert(
    resStudentEmpty.statusCode === 200 &&
      resStudentEmpty.body?.count === 0 &&
      resStudentEmpty.body?.records?.length === 0 &&
      resStudentEmpty.body?.summary?.totalPastEvents === 0,
    25,
    'Student with zero registrations returns clean empty history and zeroed summary'
  )

  // --------------------------------------------------------------------------
  // SECTION 3: OFFLINE DEMO FALLBACK & GAMIFICATION CONSTRAINTS
  // --------------------------------------------------------------------------
  console.log('\n--- Section 3: Demo Fallback & Scope Constraints ---')

  assert(
    Array.isArray(participationRecords) && participationRecords.length > 0,
    26,
    'Sample demo participationRecords exist for offline development fallback'
  )

  assert(
    typeof activitySummary.totalPastEvents === 'number' ||
      typeof activitySummary.totalParticipated === 'number',
    27,
    'Sample demo activitySummary exists with numerical event counts'
  )

  // Scope rule check: No gamification, attendance marking, or points properties
  const allRecordKeys = participationRecords.flatMap((r) => Object.keys(r))
  const forbiddenProperties = [
    'attendanceStatus',
    'attendance_status',
    'pointsEarned',
    'points_earned',
    'points',
    'xp',
    'gamificationBadge',
    'attendanceVerified',
    'verifiedByFaculty',
  ]

  const foundForbidden = forbiddenProperties.filter((p) => allRecordKeys.includes(p))
  assert(
    foundForbidden.length === 0,
    28,
    'Requirement 8 satisfied: No attendance, attendance verification, points, badges, or gamification properties present'
  )

  // --------------------------------------------------------------------------
  // SECTION 4: EXPRESS HTTP INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- Section 4: Express HTTP Router Integration ---')

  const testApp = express()
  testApp.use(express.json())
  testApp.use('/api/registrations', registrationsRouter)

  const server = http.createServer(testApp)
  await new Promise((resolve) => server.listen(0, resolve))
  const serverPort = server.address().port

  // 1. Unauthenticated GET /api/registrations/history -> 401
  const httpGetUnauth = await fetch(`http://localhost:${serverPort}/api/registrations/history`, {
    method: 'GET',
  })
  const httpGetUnauthBody = await httpGetUnauth.json()
  assert(
    httpGetUnauth.status === 401 && httpGetUnauthBody.code === 'AUTH_HEADER_MISSING',
    29,
    'HTTP GET /api/registrations/history rejects unauthenticated request with HTTP 401 AUTH_HEADER_MISSING'
  )

  // 2. Malformed token -> 401
  const httpMalformed = await fetch(`http://localhost:${serverPort}/api/registrations/history`, {
    method: 'GET',
    headers: { Authorization: 'Basic invalid-token-type' },
  })
  const httpMalformedBody = await httpMalformed.json()
  assert(
    httpMalformed.status === 401 && httpMalformedBody.code === 'AUTH_HEADER_MALFORMED',
    30,
    'HTTP GET /api/registrations/history rejects invalid token format with HTTP 401 AUTH_HEADER_MALFORMED'
  )

  server.close()

  // --------------------------------------------------------------------------
  // SECTION 5: FULL REGRESSION CHECKS (Steps 1, 2, 3, 5, 6)
  // --------------------------------------------------------------------------
  console.log('\n--- Section 5: Full Regression Checks ---')

  await runScript(path.join(ROOT_DIR, 'scripts', 'test_route_security.mjs'), 31, 'Step 1: Route Security verification passing')
  await runScript(path.join(ROOT_DIR, 'scripts', 'test_notification_sync.mjs'), 32, 'Step 2: Notification Real-Time Sync verification passing')
  await runScript(path.join(ROOT_DIR, 'scripts', 'test_clubs_backend.mjs'), 33, 'Step 3: Clubs Backend & Memberships verification passing')
  await runScript(path.join(ROOT_DIR, 'scripts', 'test_support_backend.mjs'), 34, 'Step 5: Support Tickets Backend verification passing')
  await runScript(path.join(ROOT_DIR, 'scripts', 'test_settings_persistence.mjs'), 35, 'Step 6: Student Settings Persistence verification passing')

  // Summary
  console.log('\n======================================================================')
  console.log(`  STEP 7 TEST SUMMARY: ${passed}/${total} TESTS PASSED (${failed} FAILED)`)
  console.log('======================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
