/**
 * ==============================================================================
 * CAMPUS LIVE: STEP 8C.1 - DATABASE AUDIT, SECURITY & PERMISSIONS TEST SUITE
 * ==============================================================================
 * Verifies:
 * 1. Migration SQL integrity (transaction blocks, column-level grants, NULL backfills,
 *    foreign keys, trigger functions, least-privilege revokes).
 * 2. Club join/leave operations, tamper-proof student identity binding, and accurate
 *    cross-student membership aggregate counts via trusted backend client.
 * 3. Support ticket student isolation (HTTP 403 for unauthorized students), staff
 *    authorization for inspection/replies, tamper-proof sender metadata, and
 *    updated_at timestamp synchronization.
 * 4. Profile preferences persistence, column-level least privilege, and exclusion
 *    of sensitive profile fields (id, role, email, is_active, student_id).
 * 5. Strict architectural invariants: attendance tracking and gamification remain excluded.
 * ==============================================================================
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getClubs,
  getClubById,
  joinClub,
  leaveClub,
  formatSafeClub,
  demoMembershipsStore,
} from '../server/controllers/clubController.js'
import {
  getMyTickets,
  getTicketById,
  addTicketMessage,
  createTicket,
  demoTicketsStore,
} from '../server/controllers/supportController.js'
import {
  getProfilePreferences,
  updateProfilePreferences,
  validatePreferencesPayload,
  DEFAULT_STUDENT_PREFERENCES,
} from '../server/controllers/profileController.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 8C.1 - DATABASE & BACKEND PERMISSIONS TEST SUITE')
console.log('======================================================================\n')

let passed = 0
let failed = 0
let testNumber = 0

function assert(condition, message) {
  testNumber++
  if (condition) {
    console.log(`[PASS] Test ${testNumber}: ${message}`)
    passed++
  } else {
    console.error(`[FAIL] Test ${testNumber}: ${message}`)
    failed++
  }
}

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

async function runTests() {
  // --------------------------------------------------------------------------
  // SECTION 1: SQL MIGRATION FILE REVIEWS & PERMISSION HARDENING
  // --------------------------------------------------------------------------
  console.log('--- SECTION 1: SQL Migration Reviews & Least-Privilege Grants ---')

  const prefsMigrationPath = path.join(
    ROOT_DIR,
    'supabase/migrations/20261016_add_preferences_to_profiles.sql'
  )
  const prefsSql = fs.readFileSync(prefsMigrationPath, 'utf8')

  assert(
    prefsSql.includes('BEGIN;') && prefsSql.includes('COMMIT;'),
    'Preferences migration wraps changes in an atomic transaction (BEGIN/COMMIT)'
  )
  assert(
    prefsSql.includes('GRANT UPDATE (preferences) ON TABLE public.profiles TO authenticated;'),
    'Preferences migration explicitly grants column-level UPDATE on preferences to authenticated'
  )
  assert(
    prefsSql.includes('UPDATE public.profiles') && prefsSql.includes('WHERE preferences IS NULL;'),
    'Preferences migration provides an idempotent backfill for existing NULL profile rows'
  )
  assert(
    !prefsSql.includes('GRANT UPDATE ON TABLE public.profiles TO authenticated;') &&
      !prefsSql.includes('GRANT ALL ON TABLE public.profiles TO authenticated;'),
    'Preferences migration strictly preserves column-level protection on sensitive fields'
  )

  const clubsMigrationPath = path.join(
    ROOT_DIR,
    'supabase/migrations/20261016_create_clubs_and_memberships.sql'
  )
  const clubsSql = fs.readFileSync(clubsMigrationPath, 'utf8')

  assert(
    clubsSql.includes('CONSTRAINT unique_club_student_membership UNIQUE (club_id, student_id)'),
    'Clubs migration enforces composite UNIQUE constraint on (club_id, student_id)'
  )
  assert(
    clubsSql.includes('REVOKE INSERT, UPDATE, DELETE ON TABLE public.club_memberships FROM authenticated, anon, PUBLIC;'),
    'Clubs migration strictly revokes direct client writes on club_memberships (trusted backend required)'
  )
  assert(
    clubsSql.includes('members_count integer NOT NULL DEFAULT 0'),
    'Clubs table defines members_count column with DEFAULT 0'
  )

  const supportMigrationPath = path.join(
    ROOT_DIR,
    'supabase/migrations/20261016_create_support_tickets.sql'
  )
  const supportSql = fs.readFileSync(supportMigrationPath, 'utf8')

  assert(
    supportSql.includes('student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE'),
    'Support tickets migration preserves student_id NOT NULL foreign key integrity'
  )
  assert(
    supportSql.includes('CREATE OR REPLACE FUNCTION public.sync_support_ticket_updated_at()') &&
      supportSql.includes('CREATE TRIGGER trg_sync_support_ticket_updated_at'),
    'Support tickets migration includes database trigger to keep updated_at synchronized on reply'
  )
  assert(
    supportSql.includes('REVOKE UPDATE, DELETE ON TABLE public.support_tickets FROM authenticated, anon, PUBLIC;'),
    'Support tickets migration strictly revokes client UPDATE/DELETE on support_tickets'
  )

  // --------------------------------------------------------------------------
  // SECTION 2: CLUB CONTROLLER SECURITY & MULTI-STUDENT MEMBER COUNTS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 2: Club Controller Security & Member Counts ---')

  const studentA = '11111111-1111-4111-8111-111111111111'
  const studentB = '22222222-2222-4222-8222-222222222222'
  const victimId = '99999999-9999-4999-8999-999999999999'

  // Test 2.1: Student identity spoofing attempt is rejected
  const reqJoinSpoof = {
    params: { id: 'coding-club' },
    user: { id: studentA, email: 'studentA@campus.edu' },
    body: { student_id: victimId, studentId: victimId, role: 'super_admin' },
  }
  const resJoinSpoof = createMockResponse()
  await joinClub(reqJoinSpoof, resJoinSpoof)

  assert(resJoinSpoof.statusCode === 200, 'joinClub succeeds for authenticated caller')
  assert(
    demoMembershipsStore.get(`${studentA}:coding-club`)?.status === 'joined',
    'Caller account (studentA) was registered'
  )
  assert(
    !demoMembershipsStore.has(`${victimId}:coding-club`),
    'Victim account was completely untouched: server never trusts body student_id'
  )

  // Test 2.2: Cross-student member count simulation
  // Simulate multiple active members in Robotics Club
  demoMembershipsStore.set(`student-1:robotics-club`, { status: 'joined' })
  demoMembershipsStore.set(`student-2:robotics-club`, { status: 'joined' })
  demoMembershipsStore.set(`student-3:robotics-club`, { status: 'joined' })
  demoMembershipsStore.set(`student-4:robotics-club`, { status: 'left' })

  // Multi-student live mock client simulation
  const mockMembershipsData = [
    { id: 'mem-1', club_id: 'club-uuid-1', student_id: studentA, status: 'joined' },
    { id: 'mem-2', club_id: 'club-uuid-1', student_id: studentB, status: 'joined' },
    { id: 'mem-3', club_id: 'club-uuid-1', student_id: 'student-3', status: 'joined' },
    { id: 'mem-4', club_id: 'club-uuid-1', student_id: 'student-4', status: 'left' },
  ]

  const mockClient = {
    from: (table) => {
      if (table === 'clubs') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: [
                  { id: 'club-uuid-1', slug: 'tech-club', name: 'Tech Club', status: 'active', category: 'Technical' },
                ],
                error: null,
              }),
            }),
            or: () => ({
              maybeSingle: () => Promise.resolve({
                data: { id: 'club-uuid-1', slug: 'tech-club', name: 'Tech Club', status: 'active' },
                error: null,
              }),
            }),
            eq: () => ({
              maybeSingle: () => Promise.resolve({
                data: { id: 'club-uuid-1', slug: 'tech-club', name: 'Tech Club', status: 'active' },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'club_memberships') {
        return {
          select: (fields, opts) => {
            if (opts?.count === 'exact') {
              return {
                eq: (f1, v1) => ({
                  eq: (f2, v2) => {
                    const filtered = mockMembershipsData.filter(
                      (m) => m.club_id === v1 && m.status === v2
                    )
                    return Promise.resolve({ count: filtered.length, error: null })
                  },
                }),
              }
            }
            return {
              in: () => ({
                eq: (field, val) => {
                  const filtered = mockMembershipsData.filter((m) => m.status === val)
                  return Promise.resolve({ data: filtered, error: null })
                },
              }),
              eq: () => ({
                in: () => Promise.resolve({ data: [], error: null }),
                eq: () => ({
                  maybeSingle: () => Promise.resolve({ data: null, error: null }),
                }),
              }),
            }
          },
          insert: (payload) => {
            mockMembershipsData.push({ id: `mem-${Date.now()}`, ...payload })
            return Promise.resolve({ data: payload, error: null })
          },
          update: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
        }
      }
      return {}
    },
  }

  const reqClubById = {
    params: { id: 'tech-club' },
    user: { id: studentA },
    mockClient,
  }
  const resClubById = createMockResponse()
  await getClubById(reqClubById, resClubById)

  assert(resClubById.statusCode === 200, 'getClubById returns HTTP 200 with live mock client')
  assert(
    resClubById.body?.club?.membersCount === 3,
    `getClubById accurately computes global member count (expected 3 active, got ${resClubById.body?.club?.membersCount})`
  )

  const safeClub = formatSafeClub({ id: 'club-1', name: 'Test Club' }, null, null)
  assert(
    !Number.isNaN(safeClub.membersCount) && typeof safeClub.membersCount === 'number',
    'formatSafeClub membersCount fallback is never NaN'
  )

  // --------------------------------------------------------------------------
  // SECTION 3: SUPPORT TICKET CONTROLLER & STAFF AUTHORIZATION
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 3: Support Ticket Controller & Staff Authorization ---')

  const studentUser = { id: studentA, email: 'studentA@campus.edu' }
  const studentProfile = { full_name: 'Student A', role: 'student', email: 'studentA@campus.edu' }

  const studentOther = { id: studentB, email: 'studentB@campus.edu' }
  const studentOtherProfile = { full_name: 'Student B', role: 'student', email: 'studentB@campus.edu' }

  const facultyStaff = { id: 'fa000000-0000-0000-0000-000000000001', email: 'prof.smith@campus.edu' }
  const facultyProfile = { full_name: 'Prof. John Smith', role: 'faculty', department: 'Computer Science' }

  const adminStaff = { id: 'ad000000-0000-0000-0000-000000000001', email: 'admin.jenny@campus.edu' }
  const adminProfile = { full_name: 'Admin Jenny', role: 'super_admin' }

  // 3.1 Create student ticket
  const reqCreateTicket = {
    user: studentUser,
    profile: studentProfile,
    body: {
      subject: 'Lab Machine SSH key authorization error',
      description: 'Cannot connect to remote compute node with public key.',
      category: 'Technical Issue',
      priority: 'High',
    },
  }
  const resCreateTicket = createMockResponse()
  await createTicket(reqCreateTicket, resCreateTicket)

  assert(resCreateTicket.statusCode === 201, 'createTicket succeeds for student')
  const createdTicket = resCreateTicket.body?.ticket
  const ticketId = createdTicket?.id

  // 3.2 Unauthorized cross-student inspection is blocked
  const reqOtherInspect = {
    params: { id: ticketId },
    user: studentOther,
    profile: studentOtherProfile,
  }
  const resOtherInspect = createMockResponse()
  await getTicketById(reqOtherInspect, resOtherInspect)

  assert(
    resOtherInspect.statusCode === 403,
    'Unauthorized student inspection is strictly blocked with HTTP 403'
  )
  assert(
    resOtherInspect.body?.code === 'FORBIDDEN_TICKET_ACCESS',
    'Returns FORBIDDEN_TICKET_ACCESS error code'
  )

  // 3.3 Authorized staff (faculty) inspection is permitted
  const reqStaffInspect = {
    params: { id: ticketId },
    user: facultyStaff,
    profile: facultyProfile,
  }
  const resStaffInspect = createMockResponse()
  await getTicketById(reqStaffInspect, resStaffInspect)

  assert(
    resStaffInspect.statusCode === 200,
    'Authorized faculty coordinator is permitted to inspect student ticket'
  )
  assert(
    resStaffInspect.body?.ticket?.id === ticketId,
    'Faculty receives correct ticket record'
  )

  // 3.4 Unauthorized cross-student reply is blocked
  const reqOtherReply = {
    params: { id: ticketId },
    user: studentOther,
    profile: studentOtherProfile,
    body: { message: 'I am another student trying to reply.' },
  }
  const resOtherReply = createMockResponse()
  await addTicketMessage(reqOtherReply, resOtherReply)

  assert(
    resOtherReply.statusCode === 403,
    'Unauthorized student reply is strictly blocked with HTTP 403'
  )

  // 3.5 Authorized staff (super admin) reply is permitted
  const reqStaffReply = {
    params: { id: ticketId },
    user: adminStaff,
    profile: adminProfile,
    body: {
      message: 'Your SSH key has been added to the authorized_keys list.',
      // Attacker attempts to spoof client fields
      is_staff: false,
      senderRole: 'Student',
    },
  }
  const resStaffReply = createMockResponse()
  await addTicketMessage(reqStaffReply, resStaffReply)

  assert(
    resStaffReply.statusCode === 201,
    'Authorized staff (super admin) reply is accepted with HTTP 201'
  )
  const staffMsg = resStaffReply.body?.ticketMessage
  assert(
    staffMsg?.is_staff === true && staffMsg?.isStaff === true,
    'Staff reply is_staff boolean is derived strictly from server identity (true)'
  )
  assert(
    staffMsg?.senderRole === 'Super Admin' || staffMsg?.sender_role === 'Super Admin',
    'Staff reply senderRole is derived strictly from server role (Super Admin)'
  )

  // 3.6 Student reply cannot spoof staff status
  const reqStudentReplySpoof = {
    params: { id: ticketId },
    user: studentUser,
    profile: studentProfile,
    body: {
      message: 'Thank you for fixing it!',
      is_staff: true,
      isStaff: true,
      senderRole: 'Super Admin',
      sender_role: 'Super Admin',
    },
  }
  const resStudentReplySpoof = createMockResponse()
  await addTicketMessage(reqStudentReplySpoof, resStudentReplySpoof)

  assert(resStudentReplySpoof.statusCode === 201, 'Student reply accepted')
  const studentMsg = resStudentReplySpoof.body?.ticketMessage
  assert(
    studentMsg?.is_staff === false && studentMsg?.isStaff === false,
    'Student reply spoofing is_staff=true was safely ignored and forced to false'
  )
  assert(
    studentMsg?.senderRole === 'Student' && studentMsg?.sender_role === 'Student',
    'Student reply spoofing senderRole was safely ignored and forced to Student'
  )

  // 3.7 Ticket updated_at was refreshed
  const finalTicket = resStudentReplySpoof.body?.ticket
  assert(
    Boolean(finalTicket?.updatedAt) && finalTicket?.updatedAt !== 'Just now',
    'Ticket updatedAt timestamp is synchronized upon message posting'
  )

  // --------------------------------------------------------------------------
  // SECTION 4: PROFILE PREFERENCES PERSISTENCE & LEAST-PRIVILEGE GUARDS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 4: Profile Preferences & Sensitive Column Protection ---')

  assert(
    DEFAULT_STUDENT_PREFERENCES.notifications.activityAlerts === true &&
      DEFAULT_STUDENT_PREFERENCES.appearance.theme === 'light' &&
      DEFAULT_STUDENT_PREFERENCES.security.twoFactorEnabled === false,
    'Canonical default student preferences schema is correctly defined'
  )

  // Test 4.1: Validation accepts valid multifaceted updates
  const validPayload = {
    notifications: { emailDigest: true, activityAlerts: false },
    appearance: { theme: 'dark', density: 'compact' },
    security: { twoFactorEnabled: true },
  }
  const valResult = validatePreferencesPayload(validPayload)
  assert(valResult.valid === true, 'validatePreferencesPayload accepts compliant preferences')

  // Test 4.2: Tampering with sensitive fields is ignored by preferences validator
  const maliciousPayload = {
    notifications: { emailDigest: true },
    role: 'super_admin',
    email: 'hacked@victim.com',
    is_active: false,
    student_id: 'STU-FAKE-001',
  }
  const valMalicious = validatePreferencesPayload(maliciousPayload)
  assert(
    valMalicious.valid === true &&
      valMalicious.sanitized.role === undefined &&
      valMalicious.sanitized.email === undefined &&
      valMalicious.sanitized.is_active === undefined,
    'validatePreferencesPayload completely strips non-whitelisted sensitive profile attributes'
  )

  // Test 4.3: Mock live updateProfilePreferences with simulated column-level permissions
  let capturedUpdates = null
  const mockProfileClient = {
    from: (table) => {
      assert(table === 'profiles', 'Preferences persistence targets public.profiles')
      return {
        update: (updates) => {
          capturedUpdates = updates
          // Ensure only preferences and updated_at are updated
          const updatedKeys = Object.keys(updates)
          const forbiddenKeys = ['id', 'role', 'email', 'student_id', 'is_active', 'created_at']
          const hasForbidden = updatedKeys.some((k) => forbiddenKeys.includes(k))
          if (hasForbidden) {
            return {
              eq: () => Promise.resolve({ error: { code: '42501', message: 'permission denied' } }),
            }
          }
          return {
            eq: () => Promise.resolve({ data: { id: studentA, ...updates }, error: null }),
          }
        },
      }
    },
  }

  const reqPrefsUpdate = {
    user: studentUser,
    body: {
      notifications: { emailDigest: true },
      appearance: { theme: 'dark' },
    },
    mockClient: mockProfileClient,
  }
  const resPrefsUpdate = createMockResponse()
  await updateProfilePreferences(reqPrefsUpdate, resPrefsUpdate)

  assert(
    resPrefsUpdate.statusCode === 200,
    'updateProfilePreferences succeeds with column-level granted mock client'
  )
  assert(
    capturedUpdates !== null &&
      Boolean(capturedUpdates.preferences) &&
      Boolean(capturedUpdates.updated_at),
    'Updates targeted strictly preferences and updated_at'
  )
  assert(
    capturedUpdates.role === undefined && capturedUpdates.email === undefined,
    'Sensitive columns are never included in preferences database update'
  )

  // --------------------------------------------------------------------------
  // SECTION 5: ATTENDANCE & GAMIFICATION EXCLUSION INVARIANTS
  // --------------------------------------------------------------------------
  console.log('\n--- SECTION 5: Invariant Verification (Attendance & Gamification) ---')

  const allMigrations = [clubsSql, supportSql, prefsSql].join('\n').toLowerCase()
  assert(
    !allMigrations.includes('attendance') && !allMigrations.includes('check_in'),
    'Attendance tracking schemas are strictly absent from all pending migrations'
  )
  assert(
    !allMigrations.includes('gamification') &&
      !allMigrations.includes('leaderboard') &&
      !allMigrations.includes('badges_earned') &&
      !allMigrations.includes('xp_points'),
    'Gamification schemas (badges, points, leaderboards) are strictly absent from all pending migrations'
  )

  console.log('\n======================================================================')
  console.log(`  STEP 8C.1 TEST SUMMARY: ${passed}/${testNumber} PASSED (${failed} FAILED)`)
  console.log('======================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('[FATAL] Step 8C.1 test suite encountered an unhandled exception:', err)
  process.exit(1)
})
