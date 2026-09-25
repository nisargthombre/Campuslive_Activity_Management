/**
 * Super Admin Analytics Mock Dataset
 * Institution-wide aggregations across all departments, faculties, students, clubs, and activities.
 * Follows strict system rules:
 * - REGISTERED ≠ PARTICIPATED
 * - Cancelled registrations do NOT count as active capacity or participation.
 * - NO Activity Points or co-curricular scores.
 */

export const timeRangeOptions = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'This Academic Year',
  'Custom Range',
]

export const activityTypesList = [
  'Workshop',
  'Seminar',
  'Competition',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
]

export const categoryColors = {
  Workshop: '#2563eb', // Blue
  Seminar: '#6366f1', // Indigo
  Competition: '#8b5cf6', // Violet
  Hackathon: '#06b6d4', // Cyan
  Cultural: '#ec4899', // Pink
  Sports: '#f59e0b', // Amber
  Technical: '#10b981', // Emerald
  Other: '#64748b', // Slate
}

// Analytics datasets by time range
export const analyticsDatasetsByRange = {
  'Last 7 Days': {
    label: 'Last 7 Days (19 Sep 2026 – 25 Sep 2026)',
    summary: {
      totalStudents: 4850,
      totalFaculty: 142,
      totalActivities: 5,
      totalRegistrations: 340,
      activeRegistrations: 312,
      cancelledRegistrations: 28,
      totalParticipated: 268,
      totalClubs: 28,
      totalClubMembers: 1480,
      openSupportTickets: 8,
    },
    activityTrends: [
      { label: 'Fri 19', created: 1, completed: 1, cancelled: 0 },
      { label: 'Sat 20', created: 2, completed: 2, cancelled: 0 },
      { label: 'Sun 21', created: 0, completed: 0, cancelled: 0 },
      { label: 'Mon 22', created: 1, completed: 1, cancelled: 0 },
      { label: 'Tue 23', created: 2, completed: 1, cancelled: 1 },
      { label: 'Wed 24', created: 1, completed: 1, cancelled: 0 },
      { label: 'Thu 25', created: 1, completed: 1, cancelled: 0 },
    ],
    registrationTrends: [
      { label: 'Fri 19', total: 42, active: 39, cancelled: 3 },
      { label: 'Sat 20', total: 68, active: 62, cancelled: 6 },
      { label: 'Sun 21', total: 18, active: 17, cancelled: 1 },
      { label: 'Mon 22', total: 54, active: 50, cancelled: 4 },
      { label: 'Tue 23', total: 62, active: 56, cancelled: 6 },
      { label: 'Wed 24', total: 48, active: 44, cancelled: 4 },
      { label: 'Thu 25', total: 48, active: 44, cancelled: 4 },
    ],
    participationTrends: [
      { label: 'Fri 19', registered: 39, participated: 34 },
      { label: 'Sat 20', registered: 62, participated: 55 },
      { label: 'Sun 21', registered: 17, participated: 15 },
      { label: 'Mon 22', registered: 50, participated: 43 },
      { label: 'Tue 23', registered: 56, participated: 48 },
      { label: 'Wed 24', registered: 44, participated: 38 },
      { label: 'Thu 25', registered: 44, participated: 35 },
    ],
    activityTypes: [
      { type: 'Workshop', count: 2, percentage: 40 },
      { type: 'Seminar', count: 1, percentage: 20 },
      { type: 'Competition', count: 1, percentage: 20 },
      { type: 'Hackathon', count: 0, percentage: 0 },
      { type: 'Cultural', count: 0, percentage: 0 },
      { type: 'Sports', count: 0, percentage: 0 },
      { type: 'Technical', count: 1, percentage: 20 },
      { type: 'Other', count: 0, percentage: 0 },
    ],
    departmentBreakdown: [
      { department: 'Computer Engineering', students: 1240, activities: 2, registrations: 130, participated: 110 },
      { department: 'Information Technology', students: 980, activities: 1, registrations: 95, participated: 82 },
      { department: 'Electronics & Comm.', students: 860, activities: 1, registrations: 60, participated: 48 },
      { department: 'Mechanical Engineering', students: 740, activities: 1, registrations: 35, participated: 28 },
      { department: 'Civil Engineering', students: 580, activities: 0, registrations: 12, participated: 0 },
      { department: 'Other / Applied Sciences', students: 450, activities: 0, registrations: 8, participated: 0 },
    ],
  },

  'Last 30 Days': {
    label: 'Last 30 Days (26 Aug 2026 – 25 Sep 2026)',
    summary: {
      totalStudents: 4850,
      totalFaculty: 142,
      totalActivities: 18,
      totalRegistrations: 1120,
      activeRegistrations: 1015,
      cancelledRegistrations: 105,
      totalParticipated: 890,
      totalClubs: 28,
      totalClubMembers: 1480,
      openSupportTickets: 14,
    },
    activityTrends: [
      { label: 'Week 1', created: 4, completed: 3, cancelled: 1 },
      { label: 'Week 2', created: 5, completed: 5, cancelled: 0 },
      { label: 'Week 3', created: 6, completed: 5, cancelled: 1 },
      { label: 'Week 4', created: 5, completed: 4, cancelled: 0 },
    ],
    registrationTrends: [
      { label: 'Week 1', total: 240, active: 218, cancelled: 22 },
      { label: 'Week 2', total: 290, active: 265, cancelled: 25 },
      { label: 'Week 3', total: 340, active: 308, cancelled: 32 },
      { label: 'Week 4', total: 250, active: 224, cancelled: 26 },
    ],
    participationTrends: [
      { label: 'Week 1', registered: 218, participated: 182 },
      { label: 'Week 2', registered: 265, participated: 236 },
      { label: 'Week 3', registered: 308, participated: 271 },
      { label: 'Week 4', registered: 224, participated: 201 },
    ],
    activityTypes: [
      { type: 'Workshop', count: 6, percentage: 33 },
      { type: 'Seminar', count: 3, percentage: 17 },
      { type: 'Competition', count: 3, percentage: 17 },
      { type: 'Hackathon', count: 2, percentage: 11 },
      { type: 'Cultural', count: 1, percentage: 6 },
      { type: 'Sports', count: 1, percentage: 6 },
      { type: 'Technical', count: 2, percentage: 11 },
      { type: 'Other', count: 0, percentage: 0 },
    ],
    departmentBreakdown: [
      { department: 'Computer Engineering', students: 1240, activities: 7, registrations: 420, participated: 348 },
      { department: 'Information Technology', students: 980, activities: 4, registrations: 310, participated: 262 },
      { department: 'Electronics & Comm.', students: 860, activities: 3, registrations: 195, participated: 154 },
      { department: 'Mechanical Engineering', students: 740, activities: 2, registrations: 115, participated: 92 },
      { department: 'Civil Engineering', students: 580, activities: 1, registrations: 52, participated: 34 },
      { department: 'Other / Applied Sciences', students: 450, activities: 1, registrations: 28, participated: 0 },
    ],
  },

  'Last 3 Months': {
    label: 'Last 3 Months (Jun 2026 – Sep 2026)',
    summary: {
      totalStudents: 4850,
      totalFaculty: 142,
      totalActivities: 42,
      totalRegistrations: 2380,
      activeRegistrations: 2160,
      cancelledRegistrations: 220,
      totalParticipated: 1910,
      totalClubs: 28,
      totalClubMembers: 1480,
      openSupportTickets: 18,
    },
    activityTrends: [
      { label: 'July 2026', created: 12, completed: 11, cancelled: 1 },
      { label: 'August 2026', created: 16, completed: 14, cancelled: 2 },
      { label: 'September 2026', created: 14, completed: 12, cancelled: 1 },
    ],
    registrationTrends: [
      { label: 'July 2026', total: 680, active: 620, cancelled: 60 },
      { label: 'August 2026', total: 950, active: 865, cancelled: 85 },
      { label: 'September 2026', total: 750, active: 675, cancelled: 75 },
    ],
    participationTrends: [
      { label: 'July 2026', registered: 620, participated: 535 },
      { label: 'August 2026', registered: 865, participated: 772 },
      { label: 'September 2026', registered: 675, participated: 603 },
    ],
    activityTypes: [
      { type: 'Workshop', count: 13, percentage: 31 },
      { type: 'Seminar', count: 8, percentage: 19 },
      { type: 'Competition', count: 7, percentage: 17 },
      { type: 'Hackathon', count: 4, percentage: 10 },
      { type: 'Cultural', count: 3, percentage: 7 },
      { type: 'Sports', count: 3, percentage: 7 },
      { type: 'Technical', count: 3, percentage: 7 },
      { type: 'Other', count: 1, percentage: 2 },
    ],
    departmentBreakdown: [
      { department: 'Computer Engineering', students: 1240, activities: 15, registrations: 890, participated: 742 },
      { department: 'Information Technology', students: 980, activities: 11, registrations: 620, participated: 524 },
      { department: 'Electronics & Comm.', students: 860, activities: 7, registrations: 410, participated: 332 },
      { department: 'Mechanical Engineering', students: 740, activities: 5, registrations: 260, participated: 202 },
      { department: 'Civil Engineering', students: 580, activities: 3, registrations: 125, participated: 92 },
      { department: 'Other / Applied Sciences', students: 450, activities: 1, registrations: 75, participated: 18 },
    ],
  },

  'This Academic Year': {
    label: 'Academic Year 2026-27 (Jun 2026 – May 2027)',
    summary: {
      totalStudents: 4850,
      totalFaculty: 142,
      totalActivities: 64,
      totalRegistrations: 3420,
      activeRegistrations: 3120,
      cancelledRegistrations: 300,
      totalParticipated: 2750,
      totalClubs: 28,
      totalClubMembers: 1480,
      openSupportTickets: 18,
    },
    activityTrends: [
      { label: 'Jun', created: 8, completed: 7, cancelled: 1 },
      { label: 'Jul', created: 12, completed: 11, cancelled: 1 },
      { label: 'Aug', created: 16, completed: 14, cancelled: 2 },
      { label: 'Sep', created: 18, completed: 15, cancelled: 2 },
      { label: 'Oct (Proj)', created: 10, completed: 9, cancelled: 0 },
    ],
    registrationTrends: [
      { label: 'Jun', total: 420, active: 385, cancelled: 35 },
      { label: 'Jul', total: 680, active: 620, cancelled: 60 },
      { label: 'Aug', total: 1150, active: 1040, cancelled: 110 },
      { label: 'Sep', total: 1170, active: 1075, cancelled: 95 },
    ],
    participationTrends: [
      { label: 'Jun', registered: 385, participated: 338 },
      { label: 'Jul', registered: 620, participated: 535 },
      { label: 'Aug', registered: 1040, participated: 922 },
      { label: 'Sep', registered: 1075, participated: 955 },
    ],
    activityTypes: [
      { type: 'Workshop', count: 18, percentage: 28 },
      { type: 'Seminar', count: 12, percentage: 19 },
      { type: 'Competition', count: 10, percentage: 16 },
      { type: 'Hackathon', count: 6, percentage: 9 },
      { type: 'Cultural', count: 6, percentage: 9 },
      { type: 'Sports', count: 5, percentage: 8 },
      { type: 'Technical', count: 5, percentage: 8 },
      { type: 'Other', count: 2, percentage: 3 },
    ],
    departmentBreakdown: [
      { department: 'Computer Engineering', students: 1240, activities: 22, registrations: 1180, participated: 960 },
      { department: 'Information Technology', students: 980, activities: 16, registrations: 840, participated: 690 },
      { department: 'Electronics & Comm.', students: 860, activities: 12, registrations: 620, participated: 480 },
      { department: 'Mechanical Engineering', students: 740, activities: 8, registrations: 410, participated: 330 },
      { department: 'Civil Engineering', students: 580, activities: 4, registrations: 250, participated: 195 },
      { department: 'Other / Applied Sciences', students: 450, activities: 2, registrations: 120, participated: 95 },
    ],
  },
}

// Club Statistics and Membership Distribution
export const clubAnalyticsData = {
  totalClubs: 28,
  activeClubs: 25,
  inactiveClubs: 3,
  totalClubMembers: 1480,
  categories: [
    { name: 'Technical & Coding', clubsCount: 10, members: 690, color: '#2563eb' },
    { name: 'Cultural & Arts', clubsCount: 7, members: 380, color: '#ec4899' },
    { name: 'Sports & Athletics', clubsCount: 5, members: 230, color: '#f59e0b' },
    { name: 'Social & NSS', clubsCount: 4, members: 120, color: '#10b981' },
    { name: 'Literary & Debate', clubsCount: 2, members: 60, color: '#8b5cf6' },
  ],
  prominentClubs: [
    { name: 'Google Developer Student Club (GDSC)', category: 'Technical', members: 220, activitiesHosted: 8, status: 'Active' },
    { name: 'ACM Student Chapter', category: 'Technical', members: 195, activitiesHosted: 6, status: 'Active' },
    { name: 'Campus Cultural Society', category: 'Cultural', members: 160, activitiesHosted: 5, status: 'Active' },
    { name: 'Robotics & Automation Club', category: 'Technical', members: 145, activitiesHosted: 4, status: 'Active' },
    { name: 'Rotaract Youth Club', category: 'Social', members: 120, activitiesHosted: 3, status: 'Active' },
    { name: 'Campus Sports Guild', category: 'Sports', members: 110, activitiesHosted: 4, status: 'Active' },
  ],
}

// Support Desk System-Wide Analytics
export const supportAnalyticsData = {
  totalTickets: 84,
  open: 18,
  assigned: 22,
  inProgress: 14,
  resolved: 24,
  closed: 6,
  userOrigin: [
    { label: 'Student Inquiries', count: 62, percentage: 73.8, color: '#2563eb' },
    { label: 'Admin / Faculty Inquiries', count: 22, percentage: 26.2, color: '#6366f1' },
  ],
  categories: [
    { name: 'Registration & Seat Issues', count: 32, percentage: 38 },
    { name: 'Account Access & Auth', count: 19, percentage: 23 },
    { name: 'Activity Approval / Scheduling', count: 15, percentage: 18 },
    { name: 'Club Membership Rosters', count: 10, percentage: 12 },
    { name: 'Platform Technical Support', count: 8, percentage: 9 },
  ],
}

// Upcoming Activities
// STRICT RULE: Available Seats = Maximum Capacity - Valid Active Registrations
// Cancelled registrations must not count toward active capacity.
export const upcomingActivitiesData = [
  {
    id: 'act-up-1',
    name: 'National Level Hackathon 2026',
    department: 'Computer Engineering',
    type: 'Hackathon',
    date: '28 Sep 2026',
    time: '09:00 AM - 09:00 PM',
    venue: 'Campus Tech Center, Hall A',
    maxCapacity: 150,
    activeRegistrations: 140, // 12 cancelled registrations occurred and freed seats
    cancelledRegistrations: 12,
    get availableSeats() {
      return this.maxCapacity - this.activeRegistrations
    },
    status: 'Filling Fast',
  },
  {
    id: 'act-up-2',
    name: 'AI & Prompt Engineering Workshop',
    department: 'Information Technology',
    type: 'Workshop',
    date: '02 Oct 2026',
    time: '10:00 AM - 01:00 PM',
    venue: 'Seminar Hall 3',
    maxCapacity: 50,
    activeRegistrations: 45, // 5 cancelled
    cancelledRegistrations: 5,
    get availableSeats() {
      return this.maxCapacity - this.activeRegistrations
    },
    status: 'Filling Fast',
  },
  {
    id: 'act-up-3',
    name: 'Inter-College Robotics Challenge',
    department: 'Electronics & Comm.',
    type: 'Competition',
    date: '08 Oct 2026',
    time: '10:00 AM - 04:00 PM',
    venue: 'Robotics Central Lab',
    maxCapacity: 100,
    activeRegistrations: 82, // 8 cancelled
    cancelledRegistrations: 8,
    get availableSeats() {
      return this.maxCapacity - this.activeRegistrations
    },
    status: 'Available',
  },
  {
    id: 'act-up-4',
    name: 'Cybersecurity Defense Summit',
    department: 'Computer Engineering',
    type: 'Seminar',
    date: '14 Oct 2026',
    time: '02:00 PM - 05:00 PM',
    venue: 'Auditorium 1',
    maxCapacity: 60,
    activeRegistrations: 60, // 6 cancelled earlier, now completely full
    cancelledRegistrations: 6,
    get availableSeats() {
      return this.maxCapacity - this.activeRegistrations
    },
    status: 'Full',
  },
  {
    id: 'act-up-5',
    name: 'Annual Campus Cultural Fest 2026',
    department: 'Campus Wide',
    type: 'Cultural',
    date: '20 Oct 2026',
    time: '04:00 PM - 10:00 PM',
    venue: 'Main Campus Amphitheatre',
    maxCapacity: 500,
    activeRegistrations: 380, // 30 cancelled
    cancelledRegistrations: 30,
    get availableSeats() {
      return this.maxCapacity - this.activeRegistrations
    },
    status: 'Available',
  },
]

/**
 * Returns dynamic dataset based on selected period
 */
export function getSuperAdminAnalyticsData(period = 'This Academic Year', customStart = '', customEnd = '') {
  if (period === 'Custom Range' && customStart && customEnd) {
    // Generate calculated scale for custom range
    const base = analyticsDatasetsByRange['Last 30 Days']
    return {
      ...base,
      label: `Custom Range (${customStart} to ${customEnd})`,
    }
  }

  return analyticsDatasetsByRange[period] || analyticsDatasetsByRange['This Academic Year']
}
