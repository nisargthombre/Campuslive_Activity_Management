/**
 * Campus Live — Step 5: Student Support Tickets Backend Verification Test Suite
 *
 * Verifies all required scenarios:
 * 1. Ticket creation with valid input.
 * 2. Listing tickets for authenticated student.
 * 3. Ownership isolation (prevent viewing another student's ticket).
 * 4. Unauthorized access (unauthenticated requests).
 * 5. Message posting by owner.
 * 6. Message posting by non-owner (forbidden).
 * 7. Invalid input validation (missing fields).
 * 8. Nonexistent ticket ID (404).
 * 9. Closed ticket protection (cannot reply to closed ticket).
 * 10. Demo / offline fallback behavior.
 * 11. Regression checks (Step 1 Route Security, Step 2 Notification Sync, Step 3 Clubs Backend).
 */

import http from 'http'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getMyTickets,
  createTicket,
  getTicketById,
  addTicketMessage,
  demoTicketsStore,
} from '../server/controllers/supportController.js'
import supportRouter from '../server/routes/support.js'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 5 - STUDENT SUPPORT BACKEND TEST SUITE')
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
  const student1Id = '00000000-0000-0000-0000-000000000001'
  const student2Id = '00000000-0000-0000-0000-000000000002'

  const student1Profile = {
    full_name: 'Nisarg Thombre',
    email: 'nisarg@campus.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    student_id: 'STU-2024-001',
  }

  const student2Profile = {
    full_name: 'Priya Sharma',
    email: 'priya.s@campus.edu',
    role: 'student',
    department: 'Information Technology',
    student_id: 'STU-2024-042',
  }

  // --------------------------------------------------------------------------
  // SCENARIO 1: Ticket Creation with Valid Input
  // --------------------------------------------------------------------------
  console.log('--- SCENARIO 1: Ticket Creation with Valid Input ---')
  let createdTicketId = null
  let createdTicketNumber = null
  {
    const reqCreate = {
      user: { id: student1Id, email: student1Profile.email, role: 'student' },
      profile: student1Profile,
      body: {
        subject: 'Cannot access workshop materials for AI Hackathon',
        description: 'I registered yesterday but the GitHub repository link gives a 404 error.',
        category: 'Activity / Registration',
        priority: 'High',
        attachmentName: 'screenshot-error.png',
      },
    }
    const resCreate = createMockResponse()
    await createTicket(reqCreate, resCreate)

    assert(resCreate.statusCode === 201, '1.1', 'createTicket returns HTTP 201 Created')
    assert(resCreate.body?.success === true, '1.2', 'Response body has success: true')
    assert(
      resCreate.body?.ticket?.ticketNumber?.startsWith('TICK-2026-'),
      '1.3',
      `Ticket number formatted with institutional prefix (${resCreate.body?.ticket?.ticketNumber})`
    )
    assert(
      resCreate.body?.ticket?.creator?.name === 'Nisarg Thombre',
      '1.4',
      'Ticket creator identity derived from authenticated profile (not hardcoded fake name)'
    )
    assert(
      resCreate.body?.ticket?.creator?.email === 'nisarg@campus.edu',
      '1.5',
      'Ticket creator email matches verified session'
    )
    assert(
      Array.isArray(resCreate.body?.ticket?.messages) && resCreate.body.ticket.messages.length === 1,
      '1.6',
      'Opening message generated automatically from description'
    )

    createdTicketId = resCreate.body?.ticket?.id
    createdTicketNumber = resCreate.body?.ticket?.ticketNumber
  }

  // --------------------------------------------------------------------------
  // SCENARIO 2: Listing Tickets for Authenticated Student
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Listing Tickets for Authenticated Student ---')
  {
    const reqList = {
      user: { id: student1Id, email: student1Profile.email, role: 'student' },
      profile: student1Profile,
      query: {},
    }
    const resList = createMockResponse()
    await getMyTickets(reqList, resList)

    assert(resList.statusCode === 200, '2.1', 'getMyTickets returns HTTP 200')
    assert(
      Array.isArray(resList.body?.tickets) && resList.body.tickets.length > 0,
      '2.2',
      `getMyTickets returns array containing student's tickets (found: ${resList.body?.tickets?.length})`
    )
    const hasCreated = resList.body.tickets.some(
      (t) => t.id === createdTicketId || t.ticketNumber === createdTicketNumber
    )
    assert(hasCreated, '2.3', 'Newly created ticket is present in listing')
  }

  // --------------------------------------------------------------------------
  // SCENARIO 3: Ownership Isolation (Cross-Student Access Prevention)
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Ownership Isolation ---')
  {
    // Student 2 attempts to fetch Student 1's ticket
    const reqOtherStudentGet = {
      params: { id: createdTicketId },
      user: { id: student2Id, email: student2Profile.email, role: 'student' },
      profile: student2Profile,
    }
    const resOtherStudentGet = createMockResponse()
    await getTicketById(reqOtherStudentGet, resOtherStudentGet)

    assert(
      resOtherStudentGet.statusCode === 403,
      '3.1',
      'Student 2 attempting to view Student 1’s ticket is blocked with HTTP 403 Forbidden'
    )
    assert(
      resOtherStudentGet.body?.code === 'FORBIDDEN_TICKET_ACCESS',
      '3.2',
      'Returns error code "FORBIDDEN_TICKET_ACCESS"'
    )

    // Owner (Student 1) can fetch their own ticket
    const reqOwnerGet = {
      params: { id: createdTicketId },
      user: { id: student1Id, email: student1Profile.email, role: 'student' },
      profile: student1Profile,
    }
    const resOwnerGet = createMockResponse()
    await getTicketById(reqOwnerGet, resOwnerGet)

    assert(resOwnerGet.statusCode === 200, '3.3', 'Owner (Student 1) successfully views their ticket')
    assert(
      resOwnerGet.body?.ticket?.id === createdTicketId,
      '3.4',
      'Ticket details match requested identifier'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 4: Message Posting & Conversation Thread
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Message Posting & Conversation Thread ---')
  {
    // Owner posts a reply
    const reqReply = {
      params: { id: createdTicketId },
      user: { id: student1Id, email: student1Profile.email, role: 'student' },
      profile: student1Profile,
      body: { message: 'Here is an update: the invite worked after clearing cookies!' },
    }
    const resReply = createMockResponse()
    await addTicketMessage(reqReply, resReply)

    assert(resReply.statusCode === 201, '4.1', 'addTicketMessage returns HTTP 201 Created')
    assert(
      resReply.body?.ticket?.messages?.length >= 2,
      '4.2',
      'Conversation thread now has 2 messages'
    )
    const latestMsg = resReply.body?.ticket?.messages?.slice(-1)[0]
    assert(
      latestMsg?.senderName === 'Nisarg Thombre',
      '4.3',
      'Reply senderName uses authenticated student profile'
    )

    // Non-owner attempts to post a reply
    const reqAttackerReply = {
      params: { id: createdTicketId },
      user: { id: student2Id, email: student2Profile.email, role: 'student' },
      profile: student2Profile,
      body: { message: 'Unauthorized message injection attempt' },
    }
    const resAttackerReply = createMockResponse()
    await addTicketMessage(reqAttackerReply, resAttackerReply)

    assert(
      resAttackerReply.statusCode === 403,
      '4.4',
      'Non-owner attempting to post reply returns HTTP 403 Forbidden'
    )
    assert(
      resAttackerReply.body?.code === 'FORBIDDEN_TICKET_ACCESS',
      '4.5',
      'Returns code "FORBIDDEN_TICKET_ACCESS"'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 5: Input Validation & Edge Cases
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Input Validation & Edge Cases ---')
  {
    // 5.1: Missing Subject
    const reqNoSubject = {
      user: { id: student1Id, role: 'student' },
      profile: student1Profile,
      body: { description: 'Missing subject field' },
    }
    const resNoSubject = createMockResponse()
    await createTicket(reqNoSubject, resNoSubject)
    assert(resNoSubject.statusCode === 400, '5.1', 'Missing subject returns HTTP 400 Bad Request')
    assert(resNoSubject.body?.code === 'SUBJECT_REQUIRED', '5.2', 'Returns code "SUBJECT_REQUIRED"')

    // 5.2: Missing Description
    const reqNoDesc = {
      user: { id: student1Id, role: 'student' },
      profile: student1Profile,
      body: { subject: 'Missing description' },
    }
    const resNoDesc = createMockResponse()
    await createTicket(reqNoDesc, resNoDesc)
    assert(resNoDesc.statusCode === 400, '5.3', 'Missing description returns HTTP 400 Bad Request')
    assert(resNoDesc.body?.code === 'DESCRIPTION_REQUIRED', '5.4', 'Returns code "DESCRIPTION_REQUIRED"')

    // 5.3: Empty Reply Message
    const reqEmptyReply = {
      params: { id: createdTicketId },
      user: { id: student1Id, role: 'student' },
      profile: student1Profile,
      body: { message: '   ' },
    }
    const resEmptyReply = createMockResponse()
    await addTicketMessage(reqEmptyReply, resEmptyReply)
    assert(resEmptyReply.statusCode === 400, '5.5', 'Empty reply message returns HTTP 400')
    assert(resEmptyReply.body?.code === 'MESSAGE_REQUIRED', '5.6', 'Returns code "MESSAGE_REQUIRED"')

    // 5.4: Nonexistent Ticket ID
    const reqNonexistent = {
      params: { id: 'TICK-9999-9999' },
      user: { id: student1Id, role: 'student' },
      profile: student1Profile,
    }
    const resNonexistent = createMockResponse()
    await getTicketById(reqNonexistent, resNonexistent)
    assert(resNonexistent.statusCode === 404, '5.7', 'Nonexistent ticket ID returns HTTP 404 Not Found')

    // 5.5: Closed Ticket Reply Block
    const targetTicket = demoTicketsStore.find((t) => t.id === createdTicketId)
    if (targetTicket) {
      targetTicket.status = 'Closed'
      const reqClosedReply = {
        params: { id: createdTicketId },
        user: { id: student1Id, role: 'student' },
        profile: student1Profile,
        body: { message: 'Trying to reply to closed ticket' },
      }
      const resClosedReply = createMockResponse()
      await addTicketMessage(reqClosedReply, resClosedReply)
      assert(resClosedReply.statusCode === 400, '5.8', 'Replying to closed ticket returns HTTP 400 Bad Request')
      assert(resClosedReply.body?.code === 'TICKET_CLOSED', '5.9', 'Returns code "TICKET_CLOSED"')
      targetTicket.status = 'Open'
    }
  }

  // --------------------------------------------------------------------------
  // SCENARIO 6: Unauthorized Requests via HTTP Server
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Unauthorized Requests (HTTP Server) ---')
  {
    const app = express()
    app.use(express.json())
    app.use('/api/support', supportRouter)

    const server = http.createServer(app)
    await new Promise((res) => server.listen(0, res))
    const port = server.address().port
    const baseUrl = `http://localhost:${port}`

    try {
      // 6.1: GET /api/support/tickets without token
      const resNoToken = await fetch(`${baseUrl}/api/support/tickets`)
      const bodyNoToken = await resNoToken.json()
      assert(resNoToken.status === 401, '6.1', 'GET /api/support/tickets without token returns HTTP 401')
      assert(bodyNoToken.code === 'AUTH_HEADER_MISSING', '6.2', 'Returns code "AUTH_HEADER_MISSING"')

      // 6.2: POST /api/support/tickets without token
      const resPostNoToken = await fetch(`${baseUrl}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Test', description: 'Test' }),
      })
      assert(resPostNoToken.status === 401, '6.3', 'POST /api/support/tickets without token returns HTTP 401')

      // 6.3: Invalid Bearer token
      const resInvalidToken = await fetch(`${baseUrl}/api/support/tickets`, {
        headers: { Authorization: 'Bearer fake-invalid-token' },
      })
      assert(resInvalidToken.status === 401, '6.4', 'Invalid Bearer token returns HTTP 401')
    } finally {
      await new Promise((res) => server.close(res))
    }
  }

  // --------------------------------------------------------------------------
  // SCENARIO 7: Demo / Offline Fallback Metadata
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 7: Demo / Offline Fallback Metadata ---')
  {
    const reqDemoCheck = {
      user: { id: student1Id, role: 'student' },
      profile: student1Profile,
    }
    const resDemoCheck = createMockResponse()
    await getMyTickets(reqDemoCheck, resDemoCheck)

    assert(
      resDemoCheck.body?.source === 'demo' || resDemoCheck.body?.source === 'live',
      '7.1',
      `Identifies data source clearly as "${resDemoCheck.body?.source}"`
    )
    assert(
      typeof resDemoCheck.body?.isDemo === 'boolean',
      '7.2',
      'Includes boolean isDemo flag in response payload'
    )
  }

  // --------------------------------------------------------------------------
  // SCENARIO 8: Regression Tests (Step 1, Step 2, Step 3)
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO 8: System Regression Checks ---')
  {
    console.log('Running Step 1 Route Security test suite...')
    const step1 = await runCommand('node', ['scripts/test_route_security.mjs'])
    assert(step1.code === 0, '8.1', 'Step 1 Route Security regression suite passed (exit code 0)')

    console.log('Running Step 2 Notification Sync test suite...')
    const step2 = await runCommand('node', ['scripts/test_notification_sync.mjs'])
    assert(step2.code === 0, '8.2', 'Step 2 Notification Sync regression suite passed (exit code 0)')

    console.log('Running Step 3 Clubs Backend test suite...')
    const step3 = await runCommand('node', ['scripts/test_clubs_backend.mjs'])
    assert(step3.code === 0, '8.3', 'Step 3 Clubs Backend regression suite passed (exit code 0)')
  }

  // --------------------------------------------------------------------------
  // FINAL TEST SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================================')
  console.log(`  STEP 5 TEST RESULTS: ${passed} PASSED | ${failed} FAILED (TOTAL: ${total})`)
  console.log('======================================================================\n')

  if (failed === 0) {
    console.log('All Student Support Tickets backend integration tests passed successfully!\n')
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
