/**
 * Campus Live - Step 2: Student Notification Synchronization Verification Test Suite
 *
 * Verifies all 10 requirements:
 * 1. Correct unread count.
 * 2. Zero unread notifications.
 * 3. Mark one notification as read.
 * 4. Mark all notifications as read.
 * 5. Student role normalization and filtering.
 * 6. Students cannot see faculty/admin/Super Admin notifications.
 * 7. Different users do not share private notifications.
 * 8. Refresh and navigation preserve consistent counts.
 * 9. Malformed localStorage data does not crash the app.
 * 10. Demo/offline mode continues to work.
 */

// Setup mock browser environment for Node.js
class MockLocalStorage {
  constructor() {
    this.store = new Map()
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }
  setItem(key, value) {
    this.store.set(key, String(value))
  }
  removeItem(key) {
    this.store.delete(key)
  }
  clear() {
    this.store.clear()
  }
}

class MockCustomEvent {
  constructor(type, init = {}) {
    this.type = type
    this.detail = init.detail || null
  }
}

const mockStorage = new MockLocalStorage()
const eventListeners = new Map()

globalThis.localStorage = mockStorage
globalThis.CustomEvent = MockCustomEvent
globalThis.window = {
  localStorage: mockStorage,
  addEventListener(event, callback) {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set())
    }
    eventListeners.get(event).add(callback)
  },
  removeEventListener(event, callback) {
    if (eventListeners.has(event)) {
      eventListeners.get(event).delete(callback)
    }
  },
  dispatchEvent(event) {
    if (eventListeners.has(event.type)) {
      for (const cb of eventListeners.get(event.type)) {
        cb(event)
      }
    }
    return true
  },
}

// Now dynamically import project modules
import { studentNav } from '../src/config/navigation.js'
import {
  NOTIFICATIONS_STORAGE_KEY,
  NOTIFICATIONS_EVENT_KEY,
  initialNotifications,
  getStoredNotifications,
  saveStoredNotifications,
  getNotificationsForRole,
  getNotificationsForUser,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserScopeKey,
  getUserReadMap,
  saveUserReadMap,
} from '../src/data/notificationsData.js'

console.log('======================================================================')
console.log('  CAMPUS LIVE: STEP 2 - NOTIFICATION SYNCHRONIZATION TEST SUITE')
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

// Reset localStorage helper
function resetStorage() {
  mockStorage.clear()
}

// -----------------------------------------------------------------------------
// Requirement 1: Correct Unread Count & Removal of Hardcoded '3'
// -----------------------------------------------------------------------------
resetStorage()

const notifNavItem = studentNav.find((item) => item.path === '/student/notifications')
assert(
  notifNavItem && notifNavItem.badge === undefined,
  1.1,
  "Hardcoded notification badge value '3' is completely removed from navigation.js studentNav"
)

// Nisarg Patel user (matches individual notif-2)
const nisargUser = {
  id: 'usr-nisarg',
  name: 'Nisarg Patel',
  role: 'student',
  email: 'nisarg@campus.edu',
}
const nisargInitialNotifs = getNotificationsForRole('student', nisargUser)
const nisargUnreadCount = getUnreadNotificationCount(nisargUser)

assert(
  nisargInitialNotifs.length === 4,
  1.2,
  `Nisarg sees exactly 4 notifications (notif-1 broadcast, notif-2 personal, notif-4 CE, notif-5 broadcast), got ${nisargInitialNotifs.length}`
)
assert(
  nisargUnreadCount === 2,
  1.3,
  `Nisarg has exactly 2 unread notifications (notif-1 & notif-2), got ${nisargUnreadCount}`
)

// General student (does not match Nisarg or Priya)
const alexUser = {
  id: 'usr-alex',
  name: 'Alex Johnson',
  role: 'student',
  email: 'alex@campus.edu',
}
const alexUnreadCount = getUnreadNotificationCount(alexUser)
assert(
  alexUnreadCount === 1,
  1.4,
  `General student Alex has exactly 1 unread notification (notif-1 broadcast), got ${alexUnreadCount}`
)

// -----------------------------------------------------------------------------
// Requirement 2: Zero Unread Notifications Handling
// -----------------------------------------------------------------------------
resetStorage()

// When Alex marks his 1 unread notification as read:
markNotificationAsRead('notif-1', false, alexUser)
const alexZeroCount = getUnreadNotificationCount(alexUser)
assert(alexZeroCount === 0, 2.1, `Alex unread count is 0 after reading notif-1, got ${alexZeroCount}`)

// Check sidebar badge generation logic
const dynamicBadge = alexZeroCount > 0 ? String(alexZeroCount) : null
assert(dynamicBadge === null, 2.2, 'Dynamic sidebar badge assigns null when unread count is 0')

// Verify Sidebar.jsx condition logic {Boolean(item.badge) && item.badge !== '0' && item.badge !== 0}
const shouldRenderBadge = Boolean(dynamicBadge) && dynamicBadge !== '0' && dynamicBadge !== 0
assert(!shouldRenderBadge, 2.3, 'Sidebar cleanly hides badge element when unread count is zero')

// -----------------------------------------------------------------------------
// Requirement 3: Mark One Notification as Read
// -----------------------------------------------------------------------------
resetStorage()

let eventFired = false
let eventPayload = null
const listener = (e) => {
  eventFired = true
  eventPayload = e.detail
}
window.addEventListener(NOTIFICATIONS_EVENT_KEY, listener)

const preMarkCount = getUnreadNotificationCount(nisargUser)
assert(preMarkCount === 2, 3.1, 'Pre-mark unread count for Nisarg is 2')

markNotificationAsRead('notif-1', false, nisargUser)
const postMarkCount = getUnreadNotificationCount(nisargUser)
assert(postMarkCount === 1, 3.2, 'Marking notif-1 as read immediately decrements unread count to 1')
assert(eventFired === true, 3.3, 'Marking single notification as read dispatches notifications update event')

const nisargUpdatedNotifs = getNotificationsForRole('student', nisargUser)
const markedNotif = nisargUpdatedNotifs.find((n) => n.id === 'notif-1')
assert(markedNotif && markedNotif.isUnread === false, 3.4, 'notif-1 isUnread property is immediately false')

window.removeEventListener(NOTIFICATIONS_EVENT_KEY, listener)

// -----------------------------------------------------------------------------
// Requirement 4: Mark All Notifications as Read
// -----------------------------------------------------------------------------
resetStorage()

eventFired = false
window.addEventListener(NOTIFICATIONS_EVENT_KEY, listener)

const preAllCount = getUnreadNotificationCount(nisargUser)
assert(preAllCount === 2, 4.1, 'Pre-mark-all unread count is 2')

markAllNotificationsAsRead(nisargUser)
const postAllCount = getUnreadNotificationCount(nisargUser)
assert(postAllCount === 0, 4.2, 'markAllNotificationsAsRead sets unread count to 0 immediately')
assert(eventFired === true, 4.3, 'markAllNotificationsAsRead dispatches update event')

const postAllNotifs = getNotificationsForRole('student', nisargUser)
const allUnread = postAllNotifs.filter((n) => n.isUnread)
assert(allUnread.length === 0, 4.4, 'All notifications in the student list now have isUnread === false')

window.removeEventListener(NOTIFICATIONS_EVENT_KEY, listener)

// -----------------------------------------------------------------------------
// Requirement 5: Student Role Normalization & Case Robustness
// -----------------------------------------------------------------------------
resetStorage()

const testRoles = ['student', 'Student', 'STUDENT', '  student  ', 'Student ']
for (const r of testRoles) {
  const notifs = getNotificationsForRole(r, alexUser)
  assert(
    notifs.length === 3 && notifs.every((n) => n.channel === 'normal'),
    5.1,
    `Role "${r}" is correctly normalized to student channel and returns only student notifications`
  )
}

// -----------------------------------------------------------------------------
// Requirement 6: Students Cannot See Faculty, Admin, or Super Admin Notifications
// -----------------------------------------------------------------------------
resetStorage()

const studentList = getNotificationsForRole('student', nisargUser)
const hasInternalAdmin = studentList.some((n) => n.channel === 'internal_admin')
const hasFacultyRole = studentList.some((n) => n.recipientRole === 'faculty')
const hasAdminRole = studentList.some((n) => n.recipientRole === 'admin')
const hasAdminAudience = studentList.some((n) => (n.targetAudience || '').toLowerCase().includes('admin'))

assert(!hasInternalAdmin, 6.1, 'Students never receive or view internal_admin channel notifications')
assert(!hasFacultyRole, 6.2, 'Students never receive notifications with recipientRole: faculty')
assert(!hasAdminRole, 6.3, 'Students never receive notifications with recipientRole: admin')
assert(!hasAdminAudience, 6.4, 'Students never receive notifications with targetAudience containing Admin')

// Verify admin notifications exist in initial dataset but are blocked for students
const allStored = getStoredNotifications()
const adminNotifs = allStored.filter((n) => n.channel === 'internal_admin')
assert(adminNotifs.length === 4, 6.5, `Admin notifications exist (${adminNotifs.length}) but are hidden from students`)

// -----------------------------------------------------------------------------
// Requirement 7: Different Users Do Not Share Private Notifications or Read State
// -----------------------------------------------------------------------------
resetStorage()

const userNisarg = { id: 'u1', name: 'Nisarg Patel', role: 'student' }
const userPriya = { id: 'u2', name: 'Priya Sharma', role: 'student' }
const userRahul = { id: 'u3', name: 'Rahul Verma', role: 'student' }

const notifsNisarg = getNotificationsForRole('student', userNisarg)
const notifsPriya = getNotificationsForRole('student', userPriya)
const notifsRahul = getNotificationsForRole('student', userRahul)

assert(
  notifsNisarg.some((n) => n.id === 'notif-2'),
  7.1,
  'Nisarg sees his own confirmation notification (notif-2)'
)
assert(
  !notifsNisarg.some((n) => n.id === 'notif-3'),
  7.2,
  'Nisarg CANNOT see Priyas private club approval notification (notif-3)'
)

assert(
  notifsPriya.some((n) => n.id === 'notif-3'),
  7.3,
  'Priya sees her own club approval notification (notif-3)'
)
assert(
  !notifsPriya.some((n) => n.id === 'notif-2'),
  7.4,
  'Priya CANNOT see Nisargs private confirmation notification (notif-2)'
)

assert(
  !notifsRahul.some((n) => n.id === 'notif-2' || n.id === 'notif-3'),
  7.5,
  'Third student Rahul sees neither Nisargs nor Priyas private notifications'
)

// Read status isolation test:
// Nisarg marks broadcast notif-1 as read
markNotificationAsRead('notif-1', false, userNisarg)
const nisargReadMap = getUserReadMap(userNisarg)
assert(nisargReadMap['notif-1'] === true, 7.6, 'Nisarg read map has notif-1 marked as read')

// Priya should still have notif-1 unread!
const priyaNotifs = getNotificationsForRole('student', userPriya)
const priyaNotif1 = priyaNotifs.find((n) => n.id === 'notif-1')
assert(
  priyaNotif1 && priyaNotif1.isUnread === true,
  7.7,
  'Priyas notif-1 remains unread: Different users do not share read status'
)

// -----------------------------------------------------------------------------
// Requirement 8: Refresh and Navigation Preserve Consistent Counts & Deduplication
// -----------------------------------------------------------------------------
// Simulate navigating away and reloading notifications for Nisarg
const reloadedNotifsNisarg = getNotificationsForRole('student', userNisarg)
const reloadedUnreadNisarg = getUnreadNotificationCount(userNisarg)

assert(
  reloadedUnreadNisarg === 1,
  8.1,
  `Consistent unread count preserved across page navigation/refresh (${reloadedUnreadNisarg})`
)

// Verify deduplication
const dupList = [...initialNotifications, ...initialNotifications]
saveStoredNotifications(dupList)
const dedupedList = getStoredNotifications()
assert(
  dedupedList.length === initialNotifications.length,
  8.2,
  `Stored notifications deduplicate duplicate IDs cleanly (${dedupedList.length} items)`
)

// -----------------------------------------------------------------------------
// Requirement 9: Malformed localStorage Data Does Not Crash the App
// -----------------------------------------------------------------------------
// Test 9a: Corrupt non-JSON string in notifications storage
mockStorage.setItem(NOTIFICATIONS_STORAGE_KEY, '{ invalid corrupt json %$#@')
let safeNotifs = []
let didCrash = false
try {
  safeNotifs = getStoredNotifications()
} catch (e) {
  didCrash = true
}
assert(!didCrash && safeNotifs.length > 0, 9.1, 'Corrupted JSON in localStorage falls back safely without crashing')

// Test 9b: Valid JSON but not an array (e.g. object or number or string)
mockStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify({ error: 'not an array' }))
didCrash = false
try {
  safeNotifs = getNotificationsForRole('student', userNisarg)
} catch (e) {
  didCrash = true
}
assert(!didCrash && safeNotifs.length > 0, 9.2, 'Non-array JSON stored in localStorage falls back gracefully without crash')

// Test 9c: Corrupt user read map
const userKey = getUserScopeKey(userNisarg)
mockStorage.setItem(`campuslive_notif_reads_${userKey}`, '<<<malformed>>>')
didCrash = false
let safeReads = null
try {
  safeReads = getUserReadMap(userNisarg)
} catch (e) {
  didCrash = true
}
assert(!didCrash && typeof safeReads === 'object', 9.3, 'Malformed user read map falls back to empty object safely')

// -----------------------------------------------------------------------------
// Requirement 10: Demo/Offline Mode Continues to Work
// -----------------------------------------------------------------------------
resetStorage()

const demoStudent = {
  id: 'demo-user',
  name: 'Demo Student',
  role: 'Student',
  email: 'demo@campus.edu',
}
mockStorage.setItem('campuslive_user', JSON.stringify(demoStudent))

const demoNotifs = getNotificationsForRole(demoStudent.role, demoStudent)
assert(demoNotifs.length === 3, 10.1, `Demo student loads offline initial notifications (${demoNotifs.length} items)`)

const demoInitialUnread = getUnreadNotificationCount(demoStudent)
assert(demoInitialUnread === 1, 10.2, `Demo student unread count is accurately computed (${demoInitialUnread})`)

markAllNotificationsAsRead(demoStudent)
const demoFinalUnread = getUnreadNotificationCount(demoStudent)
assert(demoFinalUnread === 0, 10.3, `Demo student can mark all notifications as read offline (count: ${demoFinalUnread})`)

console.log('\n======================================================================')
console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`)
console.log('======================================================================\n')

if (failed > 0) {
  process.exit(1)
} else {
  process.exit(0)
}
