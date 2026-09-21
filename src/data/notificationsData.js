export const notificationCategories = [
  'All',
  'Unread',
  'Activities',
  'Registrations',
  'Clubs',
  'System',
]

export const NOTIFICATIONS_STORAGE_KEY = 'campuslive_notifications'
export const NOTIFICATIONS_EVENT_KEY = 'campuslive_notifications_updated'

export function getStoredNotifications() {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return initialNotifications
}

export function saveStoredNotifications(notifications) {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_EVENT_KEY, { detail: notifications }))
  } catch {
    // ignore
  }
}

export const initialNotifications = [
  {
    id: 'notif-1',
    title: 'New Activity Published: Smart Campus 24-Hour Hackathon',
    message: 'Department of Computer Science has announced the Smart Campus Hackathon 2026. Registrations are now open for student teams across all years.',
    time: '10 minutes ago',
    date: '21 Sep 2026, 11:20 AM',
    category: 'Activities',
    type: 'activity',
    isUnread: true,
    action: {
      label: 'View Activity',
      to: '/student/activities',
    },
  },
  {
    id: 'notif-2',
    title: 'Registration Confirmed: Web Development Bootcamp',
    message: 'Your seat has been confirmed for the Web Development Bootcamp (React & Tailwind). Your official registration code is REG-2026-0891.',
    time: '1 hour ago',
    date: '21 Sep 2026, 10:30 AM',
    category: 'Registrations',
    type: 'success',
    isUnread: true,
    action: {
      label: 'View Registration',
      to: '/student/my-registrations',
    },
  },
  {
    id: 'notif-3',
    title: 'Club Membership Approved: Coding Club',
    message: 'Congratulations! Your application to join the Coding Club has been approved by Faculty Coordinator Dr. Rajiv Sen. Welcome aboard!',
    time: '3 hours ago',
    date: '21 Sep 2026, 08:45 AM',
    category: 'Clubs',
    type: 'success',
    isUnread: true,
    action: {
      label: 'View Club',
      to: '/student/clubs/coding-club',
    },
  },
  {
    id: 'notif-4',
    title: 'Schedule Changed: AI & Future Technology Workshop',
    message: 'The AI & Future Technology Workshop has been rescheduled to Friday, 25 September at 2:00 PM in Central Auditorium. Please verify your calendar.',
    time: 'Yesterday, 4:15 PM',
    date: '20 Sep 2026, 04:15 PM',
    category: 'Activities',
    type: 'warning',
    isUnread: false,
    action: {
      label: 'Check Activity',
      to: '/student/activities',
    },
  },
  {
    id: 'notif-5',
    title: 'Campus Advisory: Library & Tech Annex Extended Hours',
    message: 'In preparation for mid-term assessments, central library reading halls and digital innovation labs will remain open until 11:00 PM on weekdays.',
    time: 'Yesterday, 11:00 AM',
    date: '20 Sep 2026, 11:00 AM',
    category: 'System',
    type: 'info',
    isUnread: false,
    action: null,
  },
  {
    id: 'notif-6',
    title: 'Registration Cancelled: Algorithmic Problem Solving',
    message: 'Your registration for the Algorithmic Problem Solving Sprint has been successfully cancelled as requested. Seat released to waitlisted students.',
    time: '2 days ago',
    date: '19 Sep 2026, 02:30 PM',
    category: 'Registrations',
    type: 'warning',
    isUnread: false,
    action: {
      label: 'View Registrations',
      to: '/student/my-registrations',
    },
  },
  {
    id: 'notif-7',
    title: 'Activity Notice: Drone Flying Masterclass Cancelled',
    message: 'Due to severe monsoon forecast and high crosswinds, the outdoor drone session scheduled for this weekend has been cancelled. Rescheduled dates will follow.',
    time: '3 days ago',
    date: '18 Sep 2026, 09:15 AM',
    category: 'Activities',
    type: 'warning',
    isUnread: false,
    action: {
      label: 'Explore Activities',
      to: '/student/activities',
    },
  },
  {
    id: 'notif-8',
    title: 'Support Ticket #402 Updated: Certificate Verification',
    message: 'Academic Administration has processed and verified your participation attendance for the Smart Campus Ideathon 2026.',
    time: '4 days ago',
    date: '17 Sep 2026, 03:00 PM',
    category: 'System',
    type: 'success',
    isUnread: false,
    action: {
      label: 'View My Activity',
      to: '/student/my-activity',
    },
  },
]
