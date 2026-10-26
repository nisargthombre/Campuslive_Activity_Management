/**
 * Campus Live — Step 3: Student Clubs Backend Integration Verification Test Suite
 *
 * Verifies all 10 required test scenarios:
 * 1. Club listing and club details.
 * 2. Joining a club successfully.
 * 3. Duplicate join attempts.
 * 4. Leaving a club.
 * 5. Attempting to modify another student's membership.
 * 6. Unauthenticated requests.
 * 7. Invalid or nonexistent club IDs.
 * 8. Inactive clubs.
 * 9. Demo/offline fallback.
 * 10. Existing route security and notification tests remaining intact.
 */

import http from 'http'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getClubs,
  getClubById,
  getMyMemberships,
  joinClub,
  leaveClub,
  demoMembershipsStore,
} from '../server/controllers/clubController.js'
import { initialClubsData } from '../src/data/clubsData.js'
import clubsRouter from '../server/routes/clubs.js'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 3 - STUDENT CLUBS BACKEND TEST SUITE')
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

// Run a child process and return promise with exit code and output
function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    })
    let stdout = ''
    let stderr = ''
    proc.stdout.on('data', (d) => (stdout += d.toString()))
    proc.stderr.on('data', (d) => (stderr += d.toString()))
    proc.on('close', (code) => {
      resolve({ code, stdout, stderr })
    })
    proc.on('error', (err) => reject(err))
  })
}

async function runTestSuite() {
  // Clear any existing in-memory demo test memberships
  demoMembershipsStore.clear()

  // --------------------------------------------------------------------------
  // SCENARIO 1: Club Listing and Club Details
  // --------------------------------------------------------------------------
  console.log('--- SCENARIO 1: Club Listing & Club Details ---')
  {
    // 1.1: List clubs without auth (public/guest view)
    const reqListGuest = { query: {}, user: null }
    const resListGuest = createMockResponse()
    await getClubs(reqListGuest, resListGuest)

    assert(resListGuest.statusCode === 200, '1.1', 'getClubs returns HTTP 200')
    assert(
      Array.isArray(resListGuest.body?.clubs) && resListGuest.body.clubs.length >= 10,
      '1.2',
      `getClubs returns all 10 active student clubs (got ${resListGuest.body?.clubs?.length})`
    )

    const firstClub = resListGuest.body.clubs[0]
    assert(
      Boolean(firstClub.id && firstClub.name && firstClub.category && firstClub.description),
      '1.3',
      'Club listing items contain id, name, category, and description'
    )
    assert(
      firstClub.membershipStatus === 'Not Joined',
      '1.4',
      'Unauthenticated listing defaults membershipStatus to "Not Joined"'
    )

    // 1.2: Fetch single club details by slug
    const reqDetailSlug = { params: { id: 'coding-club' }, user: null }
    const resDetailSlug = createMockResponse()
    await getClubById(reqDetailSlug, resDetailSlug)

    assert(resDetailSlug.statusCode === 200, '1.5', 'getClubById returns HTTP 200 for "coding-club"')
    assert(
      resDetailSlug.body?.club?.name === 'Coding Club',
      '1.6',
      'getClubById correctly matches club by slug'
    )
    assert(
      Boolean(
        resDetailSlug.body?.club?.facultyCoordinator &&
        resDetailSlug.body?.club?.meetingSchedule &&
        Array.isArray(resDetailSlug.body?.club?.members)
      ),
      '1.7',
      'Club details object includes leadership, logistics, and member list'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 2: Joining a Club Successfully
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Joining a Club Successfully ---')
  const student1Id = '00000000-0000-0000-0000-000000000001'
  {
    const reqJoin = {
      params: { id: 'coding-club' },
      user: { id: student1Id, role: 'student', email: 'student1@campus.edu' },
      body: {},
    }
    const resJoin = createMockResponse()
    await joinClub(reqJoin, resJoin)

    assert(resJoin.statusCode === 200, '2.1', 'joinClub returns HTTP 200 on first join')
    assert(
      resJoin.body?.membershipStatus === 'Joined',
      '2.2',
      'joinClub response returns membershipStatus: "Joined"'
    )
    assert(
      typeof resJoin.body?.membersCount === 'number' && resJoin.body.membersCount > 0,
      '2.3',
      'joinClub increments and returns updated membersCount'
    )

    // Verify student's my memberships endpoint reflects the join
    const reqMy = { user: { id: student1Id, role: 'student' } }
    const resMy = createMockResponse()
    await getMyMemberships(reqMy, resMy)

    assert(resMy.statusCode === 200, '2.4', 'getMyMemberships returns HTTP 200')
    const hasJoinedCoding = resMy.body?.memberships?.some(
      (m) => (m.club_id === 'coding-club' || m.club?.slug === 'coding-club') && m.status === 'joined'
    )
    assert(hasJoinedCoding, '2.5', 'getMyMemberships lists the newly joined club')
  }

  // --------------------------------------------------------------------------
  // SCENARIO 3: Duplicate Join Attempts
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Duplicate Join Attempts ---')
  {
    const reqDupJoin = {
      params: { id: 'coding-club' },
      user: { id: student1Id, role: 'student', email: 'student1@campus.edu' },
      body: {},
    }
    const resDupJoin = createMockResponse()
    await joinClub(reqDupJoin, resDupJoin)

    assert(resDupJoin.statusCode === 409, '3.1', 'Duplicate join returns HTTP 409 Conflict')
    assert(
      resDupJoin.body?.code === 'ALREADY_JOINED',
      '3.2',
      'Duplicate join returns error code "ALREADY_JOINED"'
    )
    assert(
      resDupJoin.body?.message?.includes('already a registered member'),
      '3.3',
      'Duplicate join returns descriptive user-facing message'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 4: Leaving a Club
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Leaving a Club ---')
  {
    const reqLeave = {
      params: { id: 'coding-club' },
      user: { id: student1Id, role: 'student', email: 'student1@campus.edu' },
      body: {},
    }
    const resLeave = createMockResponse()
    await leaveClub(reqLeave, resLeave)

    assert(resLeave.statusCode === 200, '4.1', 'leaveClub returns HTTP 200 on successful leave')
    assert(
      resLeave.body?.membershipStatus === 'Not Joined',
      '4.2',
      'leaveClub response returns membershipStatus: "Not Joined"'
    )

    // Attempting to leave again when not a member
    const reqLeaveAgain = {
      params: { id: 'coding-club' },
      user: { id: student1Id, role: 'student' },
      body: {},
    }
    const resLeaveAgain = createMockResponse()
    await leaveClub(reqLeaveAgain, resLeaveAgain)

    assert(
      resLeaveAgain.statusCode === 400,
      '4.3',
      'Leaving when not an active member returns HTTP 400 Bad Request'
    )
    assert(
      resLeaveAgain.body?.code === 'NOT_A_MEMBER',
      '4.4',
      'Leaving non-member club returns code "NOT_A_MEMBER"'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 5: Attempting to Modify Another Student's Membership
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Attempting to Modify Another Student\'s Membership ---')
  const attackerStudentId = '00000000-0000-0000-0000-000000000002'
  const victimStudentId = '00000000-0000-0000-0000-000000000003'
  {
    // Attacker sends request with victim student ID in body
    const reqMaliciousJoin = {
      params: { id: 'robotics-club' },
      user: { id: attackerStudentId, role: 'student' },
      body: {
        studentId: victimStudentId,
        student_id: victimStudentId,
        userId: victimStudentId,
      },
    }
    const resMaliciousJoin = createMockResponse()
    await joinClub(reqMaliciousJoin, resMaliciousJoin)

    assert(resMaliciousJoin.statusCode === 200, '5.1', 'Join request processes for authenticated caller')

    // Verify Attacker was registered, but Victim was NOT registered
    const keyAttacker = `${attackerStudentId}:robotics-club`
    const keyVictim = `${victimStudentId}:robotics-club`

    assert(
      demoMembershipsStore.has(keyAttacker) && demoMembershipsStore.get(keyAttacker).status === 'joined',
      '5.2',
      'Server derived student identity exclusively from token (attacker registered)'
    )
    assert(
      !demoMembershipsStore.has(keyVictim),
      '5.3',
      'Client-supplied victim student ID was completely ignored (victim NOT registered)'
    )

    // Attacker attempts to leave on behalf of victim
    const reqMaliciousLeave = {
      params: { id: 'robotics-club' },
      user: { id: attackerStudentId, role: 'student' },
      body: { studentId: victimStudentId },
    }
    const resMaliciousLeave = createMockResponse()
    await leaveClub(reqMaliciousLeave, resMaliciousLeave)

    assert(
      demoMembershipsStore.get(keyAttacker)?.status === 'left',
      '5.4',
      'Leave operation affected caller account only'
    )
    assert(
      !demoMembershipsStore.has(keyVictim),
      '5.5',
      'Victim records remained completely untouched by attacker leave call'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 6: Unauthenticated Requests to Protected Endpoints
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Unauthenticated Requests ---')
  {
    // Test Express Router with Express mock app
    const app = express()
    app.use(express.json())
    app.use('/api/clubs', clubsRouter)

    const server = http.createServer(app)
    await new Promise((res) => server.listen(0, res))
    const testPort = server.address().port
    const baseUrl = `http://127.0.0.1:${testPort}`

    try {
      // 6.1: Join without auth header
      const resUnauthJoin = await fetch(`${baseUrl}/api/clubs/coding-club/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const bodyUnauthJoin = await resUnauthJoin.json()
      assert(resUnauthJoin.status === 401, '6.1', 'POST /join without auth header returns HTTP 401')
      assert(
        bodyUnauthJoin.code === 'AUTH_HEADER_MISSING',
        '6.2',
        'Returns code "AUTH_HEADER_MISSING"'
      )

      // 6.2: Leave without auth header
      const resUnauthLeave = await fetch(`${baseUrl}/api/clubs/coding-club/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const bodyUnauthLeave = await resUnauthLeave.json()
      assert(resUnauthLeave.status === 401, '6.3', 'POST /leave without auth header returns HTTP 401')
      assert(
        bodyUnauthLeave.code === 'AUTH_HEADER_MISSING',
        '6.4',
        'Returns code "AUTH_HEADER_MISSING"'
      )

      // 6.3: My memberships without auth header
      const resUnauthMy = await fetch(`${baseUrl}/api/clubs/my`, {
        method: 'GET',
      })
      const bodyUnauthMy = await resUnauthMy.json()
      assert(resUnauthMy.status === 401, '6.5', 'GET /my without auth header returns HTTP 401')
      assert(
        bodyUnauthMy.code === 'AUTH_HEADER_MISSING',
        '6.6',
        'Returns code "AUTH_HEADER_MISSING"'
      )

      // 6.4: Invalid token
      const resInvalidToken = await fetch(`${baseUrl}/api/clubs/coding-club/join`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer invalid-token-string-12345',
          'Content-Type': 'application/json',
        },
      })
      assert(resInvalidToken.status === 401, '6.7', 'Invalid Bearer token returns HTTP 401')
    } finally {
      await new Promise((res) => server.close(res))
    }
  }

  // --------------------------------------------------------------------------
  // SCENARIO 7: Invalid or Nonexistent Club IDs
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 7: Invalid or Nonexistent Club IDs ---')
  {
    const fakeClubId = 'nonexistent-club-identifier-xyz-999'

    // 7.1: GET invalid club details
    const reqFakeGet = { params: { id: fakeClubId }, user: null }
    const resFakeGet = createMockResponse()
    await getClubById(reqFakeGet, resFakeGet)

    assert(resFakeGet.statusCode === 404, '7.1', 'GET /api/clubs/:id for nonexistent ID returns HTTP 404')
    assert(
      resFakeGet.body?.message?.includes('not found'),
      '7.2',
      'Returns descriptive "not found" message'
    )

    // 7.2: POST join invalid club
    const reqFakeJoin = {
      params: { id: fakeClubId },
      user: { id: student1Id, role: 'student' },
      body: {},
    }
    const resFakeJoin = createMockResponse()
    await joinClub(reqFakeJoin, resFakeJoin)

    assert(resFakeJoin.statusCode === 404, '7.3', 'POST /join for nonexistent ID returns HTTP 404')

    // 7.3: POST leave invalid club
    const reqFakeLeave = {
      params: { id: fakeClubId },
      user: { id: student1Id, role: 'student' },
      body: {},
    }
    const resFakeLeave = createMockResponse()
    await leaveClub(reqFakeLeave, resFakeLeave)

    assert(resFakeLeave.statusCode === 404, '7.4', 'POST /leave for nonexistent ID returns HTTP 404')
  }

  // --------------------------------------------------------------------------
  // SCENARIO 8: Inactive Clubs
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 8: Inactive Clubs ---')
  {
    // Temporarily mark a club as inactive in the fallback/initial dataset
    const targetClub = initialClubsData.find((c) => c.id === 'ecell')
    const originalStatus = targetClub.status
    targetClub.status = 'inactive'

    try {
      const reqInactiveJoin = {
        params: { id: 'ecell' },
        user: { id: student1Id, role: 'student' },
        body: {},
      }
      const resInactiveJoin = createMockResponse()
      await joinClub(reqInactiveJoin, resInactiveJoin)

      assert(resInactiveJoin.statusCode === 400, '8.1', 'Joining an inactive club returns HTTP 400 Bad Request')
      assert(
        resInactiveJoin.body?.code === 'CLUB_INACTIVE',
        '8.2',
        'Returns error code "CLUB_INACTIVE"'
      )
      assert(
        resInactiveJoin.body?.message?.includes('Cannot join an inactive club'),
        '8.3',
        'Returns descriptive inactive club notice'
      )
    } finally {
      targetClub.status = originalStatus
    }
  }

  // --------------------------------------------------------------------------
  // SCENARIO 9: Demo / Offline Fallback Resilience
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 9: Demo / Offline Fallback Resilience ---')
  {
    // Verify controller operates without error even when Supabase is unconfigured or tables don't exist
    const reqListFallback = { query: {}, user: null }
    const resListFallback = createMockResponse()
    await getClubs(reqListFallback, resListFallback)

    assert(resListFallback.statusCode === 200, '9.1', 'Fallback list returns HTTP 200')
    assert(
      resListFallback.body?.source === 'demo' || resListFallback.body?.source === 'live',
      '9.2',
      `Identifies source cleanly as "${resListFallback.body?.source}"`
    )
    assert(
      resListFallback.body?.clubs?.length === 10,
      '9.3',
      'Returns complete initial 10 clubs dataset'
    )

    // Verify join and leave operate smoothly in demo fallback mode
    const demoStudentId = '00000000-0000-0000-0000-000000000099'
    const reqDemoJoin = {
      params: { id: 'astronomy-club' },
      user: { id: demoStudentId, role: 'student' },
      body: {},
    }
    const resDemoJoin = createMockResponse()
    await joinClub(reqDemoJoin, resDemoJoin)

    assert(resDemoJoin.statusCode === 200, '9.4', 'Demo join succeeds with HTTP 200')
    assert(
      resDemoJoin.body?.membershipStatus === 'Joined',
      '9.5',
      'Demo join returns membershipStatus: "Joined"'
    )

    const reqDemoLeave = {
      params: { id: 'astronomy-club' },
      user: { id: demoStudentId, role: 'student' },
      body: {},
    }
    const resDemoLeave = createMockResponse()
    await leaveClub(reqDemoLeave, resDemoLeave)

    assert(resDemoLeave.statusCode === 200, '9.6', 'Demo leave succeeds with HTTP 200')
    assert(
      resDemoLeave.body?.membershipStatus === 'Not Joined',
      '9.7',
      'Demo leave returns membershipStatus: "Not Joined"'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 10: Existing Route Security and Notification Tests Regression Check
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 10: Route Security & Notification Sync Regression Check ---')
  {
    console.log('Running Step 1: Route Security verification suite...')
    const step1Result = await runCommand('node', ['scripts/test_route_security.mjs'])
    assert(
      step1Result.code === 0,
      '10.1',
      `Step 1 Route Security suite passed with exit code 0 (output length: ${step1Result.stdout.length} chars)`
    )

    console.log('Running Step 2: Notification Synchronization verification suite...')
    const step2Result = await runCommand('node', ['scripts/test_notification_sync.mjs'])
    assert(
      step2Result.code === 0,
      '10.2',
      `Step 2 Notification Synchronization suite passed with exit code 0 (output length: ${step2Result.stdout.length} chars)`
    )
  }

  // --------------------------------------------------------------------------
  // FINAL TEST SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================================')
  console.log(`  STEP 3 TEST RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${total})`)
  console.log('======================================================================\n')

  if (failed === 0) {
    console.log('All Student Clubs backend integration tests passed successfully!\n')
    process.exit(0)
  } else {
    console.error(`Tests failed: ${failed} assertion(s) did not pass.`)
    process.exit(1)
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test suite failure:', err)
  process.exit(1)
})
