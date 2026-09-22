export const FACULTY_NOTIFICATIONS_STORAGE_KEY = 'campuslive_faculty_received_notifications'
export const FACULTY_SENT_NOTIFICATIONS_STORAGE_KEY = 'campuslive_faculty_sent_notifications'
export const FACULTY_NOTIFICATIONS_EVENT_KEY = 'campuslive_faculty_notifications_updated'

export const facultyNotificationTypes = [
  'All',
  'Announcement',
  'Administrative',
  'System',
  'Activity',
]

export const createNotificationTypes = [
  'General Announcement',
  'Activity Update',
  'Registration Reminder',
  'Important Notice',
  'Deadline Reminder',
]

export const targetAudienceOptions = [
  'All Students',
  'Department',
  'Course',
  'Academic Year',
]

export const departmentOptions = [
  'Computer Science & Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Civil Engineering',
]

export const courseOptions = [
  'B.Tech',
  'M.Tech',
  'BCA',
  'MCA',
  'Diploma Engineering',
]

export const academicYearOptions = [
  '1st Year (Freshmen)',
  '2nd Year (Sophomores)',
  '3rd Year (Juniors)',
  '4th Year (Seniors)',
]

export const initialFacultyReceivedNotifications = [
  {
    id: 'notif-rec-1',
    title: 'Super Admin Announcement: Annual Academic & Activity Audit 2026',
    message: 'The Vice Chancellor & Super Admin Council has scheduled the comprehensive annual activity and accreditation audit for 15-18 October 2026. All faculty coordinators must review and certify their student participation rosters, club activity logs, and event completion certificates by 10 October.',
    sender: 'Office of the Vice Chancellor (Super Admin)',
    type: 'Announcement',
    date: 'Today, 10:45 AM',
    timestamp: '2026-09-23T10:45:00',
    isUnread: true,
    priority: 'High',
    relatedActivity: null,
  },
  {
    id: 'notif-rec-2',
    title: 'Important Administrative Notice: Mid-Term Activity Approval Cutoff',
    message: 'Academic Administration has established Friday, 26 September at 5:00 PM as the strict deadline for verifying all pending student registrations and approving club membership rosters for the current semester.',
    sender: 'Academic Affairs Committee',
    type: 'Administrative',
    date: 'Today, 08:30 AM',
    timestamp: '2026-09-23T08:30:00',
    isUnread: true,
    priority: 'Urgent',
    relatedActivity: null,
  },
  {
    id: 'notif-rec-3',
    title: 'System Announcement: Scheduled Cloud Infrastructure Upgrade',
    message: 'The central IT Systems team will perform routine maintenance and database security patching on Sunday from 01:00 AM to 04:00 AM IST. Portal access may experience intermittent downtime during this maintenance window.',
    sender: 'IT Infrastructure & Systems',
    type: 'System',
    date: 'Yesterday, 04:15 PM',
    timestamp: '2026-09-22T16:15:00',
    isUnread: true,
    priority: 'Normal',
    relatedActivity: null,
  },
  {
    id: 'notif-rec-4',
    title: 'Campus Administration Update: Central Auditorium Venue Policy',
    message: 'Campus Operations has instituted updated safety and sound-level regulations for Central Auditorium and Seminar Halls. Events with more than 100 anticipated student attendees require a safety marshal sign-off 48 hours in advance.',
    sender: 'Campus Facilities & Safety Administration',
    type: 'Administrative',
    date: 'Yesterday, 11:30 AM',
    timestamp: '2026-09-22T11:30:00',
    isUnread: false,
    priority: 'Normal',
    relatedActivity: null,
  },
  {
    id: 'notif-rec-5',
    title: 'Account Notification: Department Admin Access Verified for 2026-27',
    message: 'Your administrative privileges and role permissions for the Department of Computer Science & Engineering have been authenticated and renewed for the 2026-27 Academic Cycle.',
    sender: 'Institutional Identity & Access Management',
    type: 'System',
    date: '20 Sep 2026, 09:00 AM',
    timestamp: '2026-09-20T09:00:00',
    isUnread: false,
    priority: 'Low',
    relatedActivity: null,
  },
  {
    id: 'notif-rec-6',
    title: 'Activity Coordination Alert: AI & Future Technology Workshop Capacity',
    message: 'AI & Future Technology Workshop has reached 86 registered students out of 120 available seats (71% occupancy). Automated registration waitlist protocol is now primed for standby applicants.',
    sender: 'Campus Activity Management System',
    type: 'Activity',
    date: '19 Sep 2026, 02:40 PM',
    timestamp: '2026-09-19T14:40:00',
    isUnread: false,
    priority: 'Normal',
    relatedActivity: 'AI & Future Technology Workshop',
  },
  {
    id: 'notif-rec-7',
    title: 'Super Admin Notice: Mandatory Campus Discipline Charter',
    message: 'All department heads and faculty mentors must mandate the digital signing of the Campus Discipline Charter by all incoming students before upcoming cultural and tech events.',
    sender: 'Super Admin Council',
    type: 'Announcement',
    date: '18 Sep 2026, 03:15 PM',
    timestamp: '2026-09-18T15:15:00',
    isUnread: false,
    priority: 'Normal',
    relatedActivity: null,
  },
]

export const initialFacultySentNotifications = [
  {
    id: 'notif-sent-1',
    title: 'Workshop Venue & Timing Confirmation: AI & Future Tech',
    message: 'All registered participants for the AI & Future Technology Workshop are requested to report to Seminar Hall, Main Campus by 9:45 AM. Laptops with Python 3.10+ installed are required.',
    type: 'Activity Update',
    audience: 'Course: B.Tech',
    targetType: 'Course',
    targetValue: 'B.Tech',
    relatedActivity: 'AI & Future Technology Workshop',
    date: '21 Sep 2026, 11:30 AM',
    timestamp: '2026-09-21T11:30:00',
    status: 'Sent',
    recipientCount: 145,
    sender: 'Prof. David Vance (Admin)',
  },
  {
    id: 'notif-sent-2',
    title: 'Registration Deadline Reminder: Inter-College Hackathon 2026',
    message: 'Team registrations for the 24-Hour Inter-College Hackathon close strictly tomorrow at 6:00 PM. No walk-in registrations will be accepted due to lab capacity limits.',
    type: 'Deadline Reminder',
    audience: 'Department: Computer Science & Engineering',
    targetType: 'Department',
    targetValue: 'Computer Science & Engineering',
    relatedActivity: 'Inter-College Hackathon 2026',
    date: '20 Sep 2026, 02:15 PM',
    timestamp: '2026-09-20T14:15:00',
    status: 'Sent',
    recipientCount: 320,
    sender: 'Prof. David Vance (Admin)',
  },
  {
    id: 'notif-sent-3',
    title: 'Club Meeting Schedule: Coding Club Orientation',
    message: 'First introductory meeting for all newly approved Coding Club members will take place this Thursday at 4:30 PM in Computer Lab 2.',
    type: 'General Announcement',
    audience: 'All Students',
    targetType: 'All Students',
    targetValue: 'All Students',
    relatedActivity: null,
    date: '19 Sep 2026, 10:00 AM',
    timestamp: '2026-09-19T10:00:00',
    status: 'Sent',
    recipientCount: 1250,
    sender: 'Prof. David Vance (Admin)',
  },
]

export function getStoredFacultyReceivedNotifications() {
  try {
    const saved = localStorage.getItem(FACULTY_NOTIFICATIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return initialFacultyReceivedNotifications
}

export function saveStoredFacultyReceivedNotifications(notifications) {
  try {
    localStorage.setItem(FACULTY_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(new CustomEvent(FACULTY_NOTIFICATIONS_EVENT_KEY, { detail: notifications }))
  } catch {
    // ignore
  }
}

export function getStoredFacultySentNotifications() {
  try {
    const saved = localStorage.getItem(FACULTY_SENT_NOTIFICATIONS_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return initialFacultySentNotifications
}

export function saveStoredFacultySentNotifications(notifications) {
  try {
    localStorage.setItem(FACULTY_SENT_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications))
    window.dispatchEvent(new CustomEvent(FACULTY_NOTIFICATIONS_EVENT_KEY, { detail: notifications }))
  } catch {
    // ignore
  }
}
