/**
 * Campus Live Notifications Data & Unified Storage Infrastructure
 * Supports two distinct notification channels:
 * 1. Normal Notifications (Audience: Students OR Admin/Faculty)
 * 2. Internal Admin Panel Notifications (Audience: Admin/Faculty ONLY, Students never receive or see)
 */

import { normalizeRole } from '../lib/authUtils.js'

export const notificationCategories = [
  'All',
  'Unread',
  'Activities',
  'Registrations',
  'Clubs',
  'System',
  'Internal Admin',
]

export const NOTIFICATIONS_STORAGE_KEY = 'campuslive_notifications'
export const NOTIFICATIONS_EVENT_KEY = 'campuslive_notifications_updated'

export const initialNotifications = [
  // 1. Normal Student Notifications
  {
    id: 'notif-1',
    channel: 'normal',
    recipientRole: 'student',
    targetAudience: 'All Students',
    title: 'New Activity Published: Smart Campus 24-Hour Hackathon',
    message: 'Department of Computer Science has announced the Smart Campus Hackathon 2026. Registrations are now open for student teams across all years.',
    time: '10 minutes ago',
    date: '25 Sep 2026, 11:20 AM',
    category: 'Activities',
    type: 'activity',
    priority: 'Normal',
    isUnread: true,
    sender: 'Department of Computer Engineering',
    action: {
      label: 'View Activity',
      to: '/student/activities',
    },
  },
  {
    id: 'notif-2',
    channel: 'normal',
    recipientRole: 'student',
    targetAudience: 'Individual Student (Nisarg Patel)',
    title: 'Registration Confirmed: Web Development Bootcamp',
    message: 'Your seat has been confirmed for the Web Development Bootcamp (React & Tailwind). Your official registration code is REG-2026-0891.',
    time: '1 hour ago',
    date: '25 Sep 2026, 10:30 AM',
    category: 'Registrations',
    type: 'success',
    priority: 'Normal',
    isUnread: true,
    sender: 'Faculty Coordinator (Prof. David Vance)',
    action: {
      label: 'View Registration',
      to: '/student/my-registrations',
    },
  },
  {
    id: 'notif-3',
    channel: 'normal',
    recipientRole: 'student',
    targetAudience: 'Individual Student (Priya Sharma)',
    title: 'Club Membership Approved: Coding Club',
    message: 'Congratulations! Your application to join the Coding Club has been approved by Faculty Coordinator Dr. Sarah Jenkins. Welcome aboard!',
    time: '3 hours ago',
    date: '25 Sep 2026, 08:45 AM',
    category: 'Clubs',
    type: 'success',
    priority: 'Normal',
    isUnread: true,
    sender: 'Coding Club Committee',
    action: {
      label: 'View Club',
      to: '/student/clubs',
    },
  },
  {
    id: 'notif-4',
    channel: 'normal',
    recipientRole: 'student',
    targetAudience: 'Computer Engineering (3rd Year)',
    title: 'Schedule Changed: AI & Cloud Computing Workshop',
    message: 'The AI & Cloud Computing Workshop has been rescheduled to Friday, 28 September at 2:00 PM in Central Auditorium. Please verify your calendar.',
    time: 'Yesterday, 4:15 PM',
    date: '24 Sep 2026, 04:15 PM',
    category: 'Activities',
    type: 'warning',
    priority: 'Important',
    isUnread: false,
    sender: 'Dr. Sarah Jenkins',
    action: {
      label: 'Check Activity',
      to: '/student/activities',
    },
  },
  {
    id: 'notif-5',
    channel: 'normal',
    recipientRole: 'student',
    targetAudience: 'All Students',
    title: 'Campus Advisory: Library & Tech Annex Extended Hours',
    message: 'In preparation for mid-term assessments, central library reading halls and digital innovation labs will remain open until 11:00 PM on weekdays.',
    time: 'Yesterday, 11:00 AM',
    date: '24 Sep 2026, 11:00 AM',
    category: 'System',
    type: 'info',
    priority: 'Normal',
    isUnread: false,
    sender: 'University Academic Registrar',
    action: null,
  },

  // 2. Normal Admin / Faculty Notifications
  {
    id: 'notif-f1',
    channel: 'normal',
    recipientRole: 'faculty',
    targetAudience: 'All Admin/Faculty',
    title: 'New Student Registrations Queued for Approval',
    message: 'A total of 42 student registrations have been submitted for upcoming October campus activities and require coordinator sign-off.',
    time: '2 hours ago',
    date: '25 Sep 2026, 09:30 AM',
    category: 'Registrations',
    type: 'info',
    priority: 'Normal',
    isUnread: true,
    sender: 'Campus Live System',
    action: {
      label: 'Review Registrations',
      to: '/faculty/registrations',
    },
  },

  // 3. Internal Admin Panel Notifications (Admin/Faculty ONLY - Students never receive or see)
  {
    id: 'notif-adm-1',
    channel: 'internal_admin',
    recipientRole: 'faculty',
    targetAudience: 'All Admin/Faculty',
    title: 'System Maintenance Notice: Cloud Database Upgrades',
    message: 'Central IT Infrastructure will execute PostgreSQL database clustering on Sunday, 28 Sep from 01:00 AM to 03:30 AM IST. Admin panel write operations will be temporarily paused.',
    time: '3 hours ago',
    date: '25 Sep 2026, 08:00 AM',
    category: 'System Maintenance Notice',
    type: 'warning',
    priority: 'Important',
    isUnread: true,
    sender: 'Super Admin Office',
    action: null,
  },
  {
    id: 'notif-adm-2',
    channel: 'internal_admin',
    recipientRole: 'faculty',
    targetAudience: 'Department (Computer Engineering & IT)',
    title: 'Internal Administrative Announcement: Mid-Term Accreditation Review',
    message: 'All department activity coordinators must verify student attendance rosters and certify event completion reports by 30 September for NAAC accreditation records.',
    time: 'Yesterday, 02:30 PM',
    date: '24 Sep 2026, 02:30 PM',
    category: 'Internal Administrative Announcement',
    type: 'danger',
    priority: 'Urgent',
    isUnread: true,
    sender: 'Super Admin Council',
    action: null,
  },
  {
    id: 'notif-adm-3',
    channel: 'internal_admin',
    recipientRole: 'faculty',
    targetAudience: 'Individual Admin/Faculty (Dr. Sarah Jenkins)',
    title: 'Admin Meeting Reminder: Campus Fest Scheduling Council',
    message: 'The institutional fest scheduling council will convene on Tuesday at 03:00 PM in Conference Room B to finalize auditorium booking allocations.',
    time: '2 days ago',
    date: '23 Sep 2026, 11:15 AM',
    category: 'Admin Meeting Reminder',
    type: 'info',
    priority: 'Normal',
    isUnread: false,
    sender: 'Super Admin Secretariat',
    action: null,
  },
  {
    id: 'notif-adm-4',
    channel: 'internal_admin',
    recipientRole: 'faculty',
    targetAudience: 'All Admin/Faculty',
    title: 'Platform Management Notice: Updated Activity Cancellation Policy',
    message: 'Please review the updated institutional regulation regarding activity cancellations: Available Seats must automatically recalculate as Maximum Capacity minus Valid Active Registrations.',
    time: '3 days ago',
    date: '22 Sep 2026, 04:00 PM',
    category: 'Platform Management Notice',
    type: 'warning',
    priority: 'Important',
    isUnread: false,
    sender: 'Super Admin Office',
    action: null,
  },
]

export function getUserScopeKey(user) {
  if (!user) return 'anonymous'
  const rawId =
    user.id ||
    user.student_id ||
    user.studentId ||
    user.email ||
    user.fullName ||
    user.full_name ||
    user.name ||
    'anonymous'
  return String(rawId)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
}

export function getUserReadMap(user) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {}
  const scopeKey = getUserScopeKey(user)
  const storageKey = `campuslive_notif_reads_${scopeKey}`
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('[Notifications] Failed to read user read map:', err)
  }
  return {}
}

export function saveUserReadMap(user, readMap) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  const scopeKey = getUserScopeKey(user)
  const storageKey = `campuslive_notif_reads_${scopeKey}`
  try {
    localStorage.setItem(storageKey, JSON.stringify(readMap || {}))
  } catch (err) {
    console.warn('[Notifications] Failed to save user read map:', err)
  }
}

export function getStoredNotifications() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return initialNotifications.map((n) => ({ ...n }))
  }
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        const seen = new Set()
        const valid = []
        for (const item of parsed) {
          if (item && typeof item === 'object' && item.id && !seen.has(item.id)) {
            seen.add(item.id)
            valid.push(item)
          }
        }
        if (valid.length > 0) return valid
      }
    }
  } catch (err) {
    console.warn('[Notifications] Failed to parse stored notifications, using initial fallback:', err)
  }
  return initialNotifications.map((n) => ({ ...n }))
}

export function saveStoredNotifications(notifications, user = null) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_EVENT_KEY, {
        detail: { notifications, user },
      })
    )
  } catch (err) {
    console.warn('[Notifications] Failed to save notifications to storage:', err)
  }
}

export function isNotificationTargetedToUser(notif, user, normRole = 'student') {
  if (!notif) return false

  // Channel & recipient role check
  if (normRole === 'student') {
    // Under NO circumstances can student see internal_admin notifications
    if (notif.channel !== 'normal') return false
    // Must be intended for student or all
    const rRole = (notif.recipientRole || '').toLowerCase()
    if (rRole !== 'student' && rRole !== 'all') return false

    // Target audience safety checks
    const target = notif.targetAudience || ''
    const lowerTarget = target.toLowerCase()
    if (lowerTarget.includes('admin') || lowerTarget.includes('faculty')) {
      return false
    }

    // Check individual student target
    const indMatch = target.match(/Individual Student \(([^)]+)\)/i)
    if (indMatch) {
      if (!user) return false // unauthenticated/unspecified users cannot see private student notifications
      const targetNameOrId = indMatch[1].trim().toLowerCase()
      const uName = (user.name || user.fullName || user.full_name || '').trim().toLowerCase()
      const uId = (user.id || '').trim().toLowerCase()
      const uStudentId = (user.studentId || user.student_id || '').trim().toLowerCase()
      const uEmail = (user.email || '').trim().toLowerCase()

      const nameMatch =
        uName &&
        (targetNameOrId === uName ||
          targetNameOrId.includes(uName) ||
          uName.includes(targetNameOrId))
      const idMatch = uId && targetNameOrId === uId
      const studentIdMatch = uStudentId && targetNameOrId === uStudentId
      const emailMatch = uEmail && targetNameOrId === uEmail

      return Boolean(nameMatch || idMatch || studentIdMatch || emailMatch)
    }

    return true
  }

  if (normRole === 'faculty' || normRole === 'admin') {
    if (notif.channel === 'internal_admin') return true
    const rRole = (notif.recipientRole || '').toLowerCase()
    return rRole === 'faculty' || rRole === 'admin' || rRole === 'all'
  }

  if (normRole === 'super_admin') {
    return true
  }

  // Safe fallback: treat as student
  return (
    notif.channel === 'normal' &&
    ((notif.recipientRole || '').toLowerCase() === 'student' ||
      (notif.recipientRole || '').toLowerCase() === 'all')
  )
}

/**
 * Filter notifications for specific logged-in user role & user profile
 * - Student: normal student notifications ONLY (never internal_admin, never faculty/admin)
 * - Faculty: normal faculty notifications + internal_admin notifications
 * - Admin: normal admin/faculty notifications + internal_admin notifications
 * - Super Admin: all notifications
 */
export function getNotificationsForRole(role = 'student', user = null) {
  const normRole = normalizeRole(role) || 'student'
  const allNotifs = getStoredNotifications()
  const userReads = getUserReadMap(user)

  const seenIds = new Set()
  const result = []

  for (const n of allNotifs) {
    if (!n || !n.id || seenIds.has(n.id)) continue
    seenIds.add(n.id)

    if (isNotificationTargetedToUser(n, user, normRole)) {
      // Determine effective unread status:
      // If userReads has recorded read status for this item, userReads[n.id] === true means read (isUnread = false)
      const isReadInUserMap = userReads[n.id]
      const effectiveUnread =
        isReadInUserMap !== undefined ? !isReadInUserMap : Boolean(n.isUnread)

      result.push({
        ...n,
        isUnread: effectiveUnread,
      })
    }
  }

  return result
}

export function getNotificationsForUser(user) {
  const role = user?.role || 'student'
  return getNotificationsForRole(role, user)
}

export function getUnreadNotificationCount(user, role = null) {
  const effectiveRole = role || user?.role || 'student'
  const notifs = getNotificationsForRole(effectiveRole, user)
  return notifs.filter((n) => n.isUnread).length
}

export function markNotificationAsRead(id, nextIsUnread = false, user = null) {
  if (!id) return

  // 1. Update user-scoped read map
  const userReads = getUserReadMap(user)
  userReads[id] = !nextIsUnread
  saveUserReadMap(user, userReads)

  // 2. Dispatch notifications update event for cross-view synchronization
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_EVENT_KEY, {
        detail: { id, isUnread: nextIsUnread, user },
      })
    )
  }
}

export function markAllNotificationsAsRead(user = null, targetIds = null) {
  const role = user?.role || 'student'
  const currentNotifs = getNotificationsForRole(role, user)
  const idsToMark =
    Array.isArray(targetIds) && targetIds.length > 0
      ? targetIds
      : currentNotifs.filter((n) => n.isUnread).map((n) => n.id)

  if (idsToMark.length === 0) return

  // 1. Update user-scoped read map
  const userReads = getUserReadMap(user)
  for (const id of idsToMark) {
    userReads[id] = true
  }
  saveUserReadMap(user, userReads)

  // 2. Dispatch notifications update event for cross-view synchronization
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(NOTIFICATIONS_EVENT_KEY, {
        detail: { ids: idsToMark, isUnread: false, user },
      })
    )
  }
}

