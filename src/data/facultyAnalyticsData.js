/**
 * Faculty Analytics Mock Dataset
 * Structures transactional activity records, registration logs,
 * attendance records, and trend data across configurable time periods.
 * Designed to mirror future PostgreSQL/Supabase database aggregations.
 */

export const timeRangeOptions = [
  'This Week',
  'This Month',
  'This Semester',
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

export const departmentsList = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
]

// Raw activity records (24 total: 18 Upcoming, 6 Completed)
// Total Registrations = 428, Students Participated = 312, Participation Rate = 72.9%
export const masterSemesterActivities = [
  {
    id: 'act-101',
    title: 'AI & Prompt Engineering Workshop',
    type: 'Workshop',
    date: '28 May 2024',
    rawDate: '2024-05-28',
    capacity: 40,
    registered: 32,
    cancelled: 3,
    participated: 24,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 12,
      'Information Technology': 7,
      'Electronics': 3,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-102',
    title: 'Inter-College Hackathon 2024',
    type: 'Hackathon',
    date: '25 May 2024',
    rawDate: '2024-05-25',
    capacity: 65,
    registered: 54,
    cancelled: 5,
    participated: 40,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 20,
      'Information Technology': 12,
      'Electronics': 5,
      'Mechanical': 2,
      'Civil': 1,
    },
  },
  {
    id: 'act-103',
    title: 'Cloud Infrastructure & DevOps Seminar',
    type: 'Seminar',
    date: '22 May 2024',
    rawDate: '2024-05-22',
    capacity: 45,
    registered: 35,
    cancelled: 4,
    participated: 26,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 11,
      'Information Technology': 8,
      'Electronics': 4,
      'Mechanical': 2,
      'Civil': 1,
    },
  },
  {
    id: 'act-104',
    title: 'Robotics Autonomous Systems Expo',
    type: 'Technical',
    date: '20 May 2024',
    rawDate: '2024-05-20',
    capacity: 35,
    registered: 28,
    cancelled: 3,
    participated: 20,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 5,
      'Information Technology': 3,
      'Electronics': 7,
      'Mechanical': 4,
      'Civil': 1,
    },
  },
  {
    id: 'act-105',
    title: 'Annual CodeSprint Coding Competition',
    type: 'Competition',
    date: '18 May 2024',
    rawDate: '2024-05-18',
    capacity: 45,
    registered: 40,
    cancelled: 4,
    participated: 29,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 16,
      'Information Technology': 8,
      'Electronics': 3,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-106',
    title: 'Campus Cricket League 2024',
    type: 'Sports',
    date: '17 May 2024',
    rawDate: '2024-05-17',
    capacity: 40,
    registered: 32,
    cancelled: 3,
    participated: 23,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 6,
      'Information Technology': 5,
      'Electronics': 4,
      'Mechanical': 5,
      'Civil': 3,
    },
  },
  {
    id: 'act-107',
    title: 'Symphony: Spring Musical Night',
    type: 'Cultural',
    date: '16 May 2024',
    rawDate: '2024-05-16',
    capacity: 35,
    registered: 26,
    cancelled: 2,
    participated: 19,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 5,
      'Information Technology': 4,
      'Electronics': 3,
      'Mechanical': 4,
      'Civil': 3,
    },
  },
  {
    id: 'act-108',
    title: 'Clean Energy & EV Technology Seminar',
    type: 'Other',
    date: '15 May 2024',
    rawDate: '2024-05-15',
    capacity: 25,
    registered: 20,
    cancelled: 2,
    participated: 14,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 2,
      'Electronics': 4,
      'Mechanical': 4,
      'Civil': 2,
    },
  },
  {
    id: 'act-109',
    title: 'Modern Web Development with React',
    type: 'Workshop',
    date: '14 May 2024',
    rawDate: '2024-05-14',
    capacity: 25,
    registered: 22,
    cancelled: 2,
    participated: 16,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 8,
      'Information Technology': 5,
      'Electronics': 2,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-110',
    title: 'Cyber Security & Network Defense',
    type: 'Seminar',
    date: '12 May 2024',
    rawDate: '2024-05-12',
    capacity: 25,
    registered: 19,
    cancelled: 2,
    participated: 14,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 6,
      'Information Technology': 5,
      'Electronics': 2,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-111',
    title: 'Machine Learning Model Deployment',
    type: 'Workshop',
    date: '11 May 2024',
    rawDate: '2024-05-11',
    capacity: 20,
    registered: 16,
    cancelled: 1,
    participated: 12,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 6,
      'Information Technology': 4,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-112',
    title: 'UI/UX Design Thinking Workshop',
    type: 'Workshop',
    date: '10 May 2024',
    rawDate: '2024-05-10',
    capacity: 18,
    registered: 14,
    cancelled: 1,
    participated: 10,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 3,
      'Information Technology': 4,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-113',
    title: 'Game Development 360 Hackathon',
    type: 'Hackathon',
    date: '09 May 2024',
    rawDate: '2024-05-09',
    capacity: 16,
    registered: 13,
    cancelled: 1,
    participated: 9,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 4,
      'Information Technology': 3,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-114',
    title: 'Inter-Branch Badminton Championship',
    type: 'Sports',
    date: '08 May 2024',
    rawDate: '2024-05-08',
    capacity: 15,
    registered: 11,
    cancelled: 1,
    participated: 8,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 2,
      'Electronics': 2,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-115',
    title: 'Fine Arts & Photography Exhibition',
    type: 'Cultural',
    date: '07 May 2024',
    rawDate: '2024-05-07',
    capacity: 12,
    registered: 9,
    cancelled: 1,
    participated: 7,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 1,
      'Electronics': 1,
      'Mechanical': 2,
      'Civil': 1,
    },
  },
  {
    id: 'act-116',
    title: 'IoT Smart Campus Innovation Showcase',
    type: 'Technical',
    date: '06 May 2024',
    rawDate: '2024-05-06',
    capacity: 12,
    registered: 9,
    cancelled: 1,
    participated: 7,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 1,
      'Electronics': 2,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-117',
    title: 'Fintech & Blockchain Overview',
    type: 'Seminar',
    date: '05 May 2024',
    rawDate: '2024-05-05',
    capacity: 10,
    registered: 7,
    cancelled: 1,
    participated: 5,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 2,
      'Electronics': 1,
      'Mechanical': 0,
      'Civil': 0,
    },
  },
  {
    id: 'act-118',
    title: 'Disaster Management & Safety Drill',
    type: 'Other',
    date: '04 May 2024',
    rawDate: '2024-05-04',
    capacity: 10,
    registered: 6,
    cancelled: 1,
    participated: 4,
    status: 'Upcoming',
    departmentBreakdown: {
      'Computer Science': 1,
      'Information Technology': 1,
      'Electronics': 0,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  // 6 Completed Activities
  {
    id: 'act-119',
    title: 'Python for Data Analysis Bootcamp',
    type: 'Workshop',
    date: '03 May 2024',
    rawDate: '2024-05-03',
    capacity: 14,
    registered: 11,
    cancelled: 1,
    participated: 8,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 3,
      'Information Technology': 3,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-120',
    title: 'Algorithm Design Challenge',
    type: 'Competition',
    date: '02 May 2024',
    rawDate: '2024-05-02',
    capacity: 12,
    registered: 8,
    cancelled: 1,
    participated: 6,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 3,
      'Information Technology': 1,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-121',
    title: 'Open Source Day Meetup',
    type: 'Technical',
    date: '02 May 2024',
    rawDate: '2024-05-02',
    capacity: 10,
    registered: 7,
    cancelled: 1,
    participated: 5,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 2,
      'Information Technology': 1,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 0,
    },
  },
  {
    id: 'act-122',
    title: 'Classical Dance & Theater Fest',
    type: 'Cultural',
    date: '01 May 2024',
    rawDate: '2024-05-01',
    capacity: 8,
    registered: 5,
    cancelled: 1,
    participated: 3,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 0,
      'Information Technology': 0,
      'Electronics': 1,
      'Mechanical': 1,
      'Civil': 1,
    },
  },
  {
    id: 'act-123',
    title: 'Tech Ethics & Privacy Forum',
    type: 'Seminar',
    date: '01 May 2024',
    rawDate: '2024-05-01',
    capacity: 6,
    registered: 3,
    cancelled: 0,
    participated: 2,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 1,
      'Information Technology': 1,
      'Electronics': 0,
      'Mechanical': 0,
      'Civil': 0,
    },
  },
  {
    id: 'act-124',
    title: 'Mobile App Debugging Sprint',
    type: 'Competition',
    date: '01 May 2024',
    rawDate: '2024-05-01',
    capacity: 5,
    registered: 1,
    cancelled: 0,
    participated: 1,
    status: 'Completed',
    departmentBreakdown: {
      'Computer Science': 0,
      'Information Technology': 0,
      'Electronics': 1,
      'Mechanical': 0,
      'Civil': 0,
    },
  },
]

// Trend data points for This Week
export const trendThisWeek = [
  { date: '24 May', label: 'Mon', registrations: 16, participated: 12, cancelled: 1 },
  { date: '25 May', label: 'Tue', registrations: 22, participated: 16, cancelled: 2 },
  { date: '26 May', label: 'Wed', registrations: 28, participated: 21, cancelled: 3 },
  { date: '27 May', label: 'Thu', registrations: 24, participated: 18, cancelled: 2 },
  { date: '28 May', label: 'Fri', registrations: 32, participated: 24, cancelled: 3 },
  { date: '29 May', label: 'Sat', registrations: 36, participated: 26, cancelled: 4 },
  { date: '30 May', label: 'Sun', registrations: 20, participated: 14, cancelled: 2 },
]

// Trend data points for This Month (May 2024) - Grouped Bars
// Sum of registrations = 428, Sum of participated = 312, Rate = 72.9%
export const trendThisMonth = [
  { date: '01-07 May', label: 'Week 1', registrations: 78, participated: 58, cancelled: 6 },
  { date: '08-14 May', label: 'Week 2', registrations: 92, participated: 68, cancelled: 8 },
  { date: '15-21 May', label: 'Week 3', registrations: 105, participated: 76, cancelled: 9 },
  { date: '22-28 May', label: 'Week 4', registrations: 88, participated: 64, cancelled: 7 },
  { date: '29-30 May', label: 'Week 5', registrations: 65, participated: 46, cancelled: 5 },
]

// Trend data points for This Semester
export const trendThisSemester = [
  { date: 'Jan', label: 'Jan', registrations: 65, participated: 48, cancelled: 5 },
  { date: 'Feb', label: 'Feb', registrations: 78, participated: 56, cancelled: 7 },
  { date: 'Mar', label: 'Mar', registrations: 95, participated: 70, cancelled: 8 },
  { date: 'Apr', label: 'Apr', registrations: 82, participated: 60, cancelled: 7 },
  { date: 'May', label: 'May', registrations: 108, participated: 78, cancelled: 8 },
]

/**
 * Returns formatted date range label for the period
 */
export function getPeriodDateRangeLabel(period = 'This Month', customStart = '', customEnd = '') {
  switch (period) {
    case 'This Week':
      return '24 May 2024 – 30 May 2024'
    case 'This Month':
      return '1 May 2024 – 30 May 2024'
    case 'Custom Range':
      return customStart && customEnd ? `${customStart} – ${customEnd}` : '1 May 2024 – 30 May 2024'
    case 'This Semester':
      return '1 Jan 2024 – 30 Jun 2024'
    default:
      return '1 May 2024 – 30 May 2024'
  }
}

/**
 * Filter activities and trend data by selected period
 */
export function getAnalyticsData(period = 'This Month', customStart = '', customEnd = '') {
  let activities
  let trend

  switch (period) {
    case 'This Week':
      // May 24 - May 30
      activities = masterSemesterActivities.filter(
        (a) => a.rawDate >= '2024-05-24' && a.rawDate <= '2024-05-30'
      )
      trend = trendThisWeek
      break

    case 'This Month':
      // May 2024
      activities = masterSemesterActivities.filter((a) =>
        a.rawDate.startsWith('2024-05')
      )
      trend = trendThisMonth
      break

    case 'Custom Range':
      if (customStart && customEnd) {
        activities = masterSemesterActivities.filter(
          (a) => a.rawDate >= customStart && a.rawDate <= customEnd
        )
        // Generate trend from matching activities or fall back
        trend = activities.map((a) => ({
          date: a.date,
          label: a.date.split(' ').slice(0, 2).join(' '),
          registrations: a.registered,
          participated: a.participated,
          cancelled: a.cancelled,
        }))
      } else {
        activities = masterSemesterActivities
        trend = trendThisMonth
      }
      break

    case 'This Semester':
    default:
      activities = masterSemesterActivities
      trend = trendThisSemester
      break
  }

  return { activities, trend }
}
