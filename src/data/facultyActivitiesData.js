export const initialFacultyActivities = [
  {
    id: 'act-1',
    title: 'AI & Future Technology Workshop',
    type: 'Workshop',
    date: '24 Sep 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'Seminar Hall, Main Campus',
    organizer: 'Dept. of Computer Science & Engineering',
    registeredCount: 86,
    maxParticipants: 120,
    status: 'Published',
    thumbnailGradient: 'from-blue-600 to-indigo-700',
    dateCategory: 'this_week',
  },
  {
    id: 'act-2',
    title: 'Inter-College Hackathon 2026',
    type: 'Hackathon',
    date: '28 Sep 2026',
    time: '9:00 AM - 6:00 PM',
    venue: 'Innovation Hub & Lab 4',
    organizer: 'Innovation Cell & Coding Club',
    registeredCount: 150,
    maxParticipants: 150,
    status: 'Published',
    thumbnailGradient: 'from-indigo-600 to-purple-700',
    dateCategory: 'this_week',
  },
  {
    id: 'act-3',
    title: 'Cyber Security Seminar',
    type: 'Seminar',
    date: '2 Oct 2026',
    time: '11:00 AM - 1:00 PM',
    venue: 'Auditorium A, Academic Block',
    organizer: 'Cyber Security Guild',
    registeredCount: 195,
    maxParticipants: 200,
    status: 'Published',
    thumbnailGradient: 'from-sky-600 to-blue-800',
    dateCategory: 'this_month',
  },
  {
    id: 'act-4',
    title: 'Robotics & Autonomous Systems Expo',
    type: 'Technical',
    date: '12 Oct 2026',
    time: '10:00 AM - 4:00 PM',
    venue: 'Mechanical Engineering Workshop B',
    organizer: 'Robotics Society',
    registeredCount: 72,
    maxParticipants: 100,
    status: 'Published',
    thumbnailGradient: 'from-emerald-600 to-teal-800',
    dateCategory: 'this_month',
  },
  {
    id: 'act-5',
    title: 'Campus Web Development Bootcamp',
    type: 'Workshop',
    date: '15 Sep 2026',
    time: '2:00 PM - 5:00 PM',
    venue: 'Computer Lab 3',
    organizer: 'Web Developers Guild',
    registeredCount: 90,
    maxParticipants: 90,
    status: 'Completed',
    thumbnailGradient: 'from-blue-700 to-cyan-800',
    dateCategory: 'past',
  },
  {
    id: 'act-6',
    title: 'Annual Inter-Department Cricket Tournament',
    type: 'Sports',
    date: '18 Oct 2026',
    time: '8:00 AM - 5:00 PM',
    venue: 'University Sports Ground',
    organizer: 'Department of Physical Education',
    registeredCount: 160,
    maxParticipants: 160,
    status: 'Published',
    thumbnailGradient: 'from-amber-600 to-orange-700',
    dateCategory: 'upcoming',
  },
  {
    id: 'act-7',
    title: 'Campus Rhythm Music & Cultural Fest',
    type: 'Cultural',
    date: '24 Oct 2026',
    time: '5:00 PM - 9:30 PM',
    venue: 'Open Air Amphitheatre',
    organizer: 'Cultural Activities Committee',
    registeredCount: 240,
    maxParticipants: 300,
    status: 'Published',
    thumbnailGradient: 'from-rose-600 to-pink-700',
    dateCategory: 'upcoming',
  },
  {
    id: 'act-8',
    title: 'Cloud Computing with AWS & GCP',
    type: 'Workshop',
    date: '5 Nov 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'Virtual Classroom & Lab 1',
    organizer: 'Dept. of Computer Science & Engineering',
    registeredCount: 0,
    maxParticipants: 80,
    status: 'Draft',
    thumbnailGradient: 'from-slate-600 to-slate-800',
    dateCategory: 'upcoming',
  },
  {
    id: 'act-9',
    title: 'UI/UX Design Thinking Masterclass',
    type: 'Workshop',
    date: '12 Nov 2026',
    time: '2:00 PM - 5:00 PM',
    venue: 'Design Studio Lab',
    organizer: 'Creative Design Association',
    registeredCount: 0,
    maxParticipants: 60,
    status: 'Draft',
    thumbnailGradient: 'from-violet-600 to-indigo-800',
    dateCategory: 'upcoming',
  },
  {
    id: 'act-10',
    title: 'Data Science with Python Hands-on',
    type: 'Technical',
    date: '10 Sep 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'Data Analytics Center',
    organizer: 'Dept. of Information Technology',
    registeredCount: 110,
    maxParticipants: 120,
    status: 'Completed',
    thumbnailGradient: 'from-teal-600 to-blue-800',
    dateCategory: 'past',
  },
  {
    id: 'act-11',
    title: 'Blockchain & Smart Contracts Seminar',
    type: 'Seminar',
    date: '18 Sep 2026',
    time: '11:00 AM - 1:00 PM',
    venue: 'Auditorium C',
    organizer: 'Fintech Innovation Lab',
    registeredCount: 15,
    maxParticipants: 80,
    status: 'Cancelled',
    thumbnailGradient: 'from-zinc-600 to-slate-700',
    dateCategory: 'past',
  },
  {
    id: 'act-12',
    title: 'Alumni Startup & Entrepreneurship Pitch',
    type: 'Other',
    date: '5 Sep 2026',
    time: '3:00 PM - 6:00 PM',
    venue: 'Incubation Center Conference Hall',
    organizer: 'E-Cell & Alumni Relations',
    registeredCount: 140,
    maxParticipants: 150,
    status: 'Completed',
    thumbnailGradient: 'from-indigo-700 to-slate-800',
    dateCategory: 'past',
  },
]

export const activityTypes = [
  'All Types',
  'Workshop',
  'Seminar',
  'Competition',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
]

export const activityStatuses = [
  'All Statuses',
  'Published',
  'Draft',
  'Completed',
  'Cancelled',
]

export const dateFilterOptions = [
  { value: 'all', label: 'All Dates' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'past', label: 'Past' },
]

// Mutable session storage for activities to support updates & cancellations
let sessionFacultyActivities = [...initialFacultyActivities]

/**
 * Detailed metadata dictionary for faculty activities
 */
const activityDetailsMap = {
  'act-1': {
    description:
      'Explore emerging technologies, artificial intelligence and future innovations through an interactive campus workshop led by faculty and industry specialists.',
    address: 'Academic Block A, Floor 2, Main University Campus',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    organizer: 'Dept. of Computer Science & Engineering',
    contactEmail: 'cse.activities@campus.edu',
    contactPhone: '+91 98765 43210',
    eligibility: {
      departments: 'Computer Science, Information Technology, Electronics',
      years: '2nd, 3rd and 4th Year Students',
      courses: 'B.Tech, BCA, MCA, M.Tech',
    },
    registrationDeadline: '23 Sep 2026, 11:59 PM',
  },
  'act-2': {
    description:
      '36-hour hackathon where student teams design, develop, and present innovative software & hardware solutions for real-world campus and industrial challenges.',
    address: 'Innovation & Incubation Hub, Wing B, Campus Live Center',
    startTime: '9:00 AM',
    endTime: '6:00 PM',
    organizer: 'Innovation Cell & Coding Club',
    contactEmail: 'innovation.cell@campus.edu',
    contactPhone: '+91 98234 56789',
    eligibility: {
      departments: 'Open to All Departments',
      years: 'All Academic Years',
      courses: 'All Undergraduate & Postgraduate Programs',
    },
    registrationDeadline: '26 Sep 2026, 6:00 PM',
  },
  'act-3': {
    description:
      'Expert lecture and live threat demonstration covering ethical hacking, vulnerability scanning, cloud defense, and career paths in enterprise cyber security.',
    address: 'Auditorium A, Ground Floor, Academic Central Complex',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    organizer: 'Cyber Security Guild',
    contactEmail: 'cybersec.guild@campus.edu',
    contactPhone: '+91 98112 34567',
    eligibility: {
      departments: 'Computer Science, IT, Cyber Security',
      years: 'All Academic Years',
      courses: 'B.Tech, BCA, MCA',
    },
    registrationDeadline: '1 Oct 2026, 5:00 PM',
  },
  'act-4': {
    description:
      'Hands-on showcase of autonomous robotic rovers, drone automation, embedded microcontrollers, and computer vision demonstrations.',
    address: 'Mechanical Engineering Workshop B, North Campus',
    startTime: '10:00 AM',
    endTime: '4:00 PM',
    organizer: 'Robotics Society',
    contactEmail: 'robotics.society@campus.edu',
    contactPhone: '+91 98345 67890',
    eligibility: {
      departments: 'Mechanical, Electronics, Computer Science',
      years: 'All Academic Years',
      courses: 'B.Tech, Diploma, M.Tech',
    },
    registrationDeadline: '10 Oct 2026, 11:59 PM',
  },
}

/**
 * Retrieves a faculty activity by ID with complete normalized metadata
 */
export function getFacultyActivityById(activityId) {
  if (!activityId) return null

  // Normalize ID (e.g. handle 'feat-1' gracefully mapping to 'act-1')
  const lookupId = activityId === 'feat-1' ? 'act-1' : activityId

  // Find in session list
  const found = sessionFacultyActivities.find((a) => a.id === lookupId)

  if (found) {
    const details = activityDetailsMap[lookupId] || {}
    const [start, end] = (found.time || '10:00 AM - 1:00 PM').split(' - ')

    return {
      ...found,
      description:
        found.description ||
        details.description ||
        `${found.title} hosted by ${found.organizer || 'Campus Live'}. Comprehensive student session focused on practical learning and skill building.`,
      address: found.address || details.address || `${found.venue}, Main University Campus`,
      startTime: found.startTime || details.startTime || start || '10:00 AM',
      endTime: found.endTime || details.endTime || end || '1:00 PM',
      organizer: found.organizer || details.organizer || 'Campus Activities Committee',
      contactEmail: found.contactEmail || details.contactEmail || 'activities@campus.edu',
      contactPhone: found.contactPhone || details.contactPhone || '+91 98765 43210',
      eligibility: found.eligibility ||
        details.eligibility || {
          departments: 'Open to All Departments',
          years: 'All Enrolled Students',
          courses: 'All Programs',
        },
      registrationDeadline:
        found.registrationDeadline || details.registrationDeadline || 'Prior to event start',
      maxParticipants: found.maxParticipants || 100,
      registeredCount: found.registeredCount ?? 0,
      thumbnailGradient: found.thumbnailGradient || 'from-blue-600 to-indigo-700',
    }
  }

  // Fallback for custom or club-level activity IDs (e.g. act-cc-101)
  return {
    id: lookupId,
    title: lookupId.replace(/-/g, ' ').toUpperCase(),
    type: 'Workshop',
    date: '28 Sep 2026',
    time: '10:00 AM - 1:00 PM',
    startTime: '10:00 AM',
    endTime: '1:00 PM',
    venue: 'Seminar Hall, Main Campus',
    address: 'Seminar Hall, Main Campus, Building 2',
    organizer: 'Faculty Coordination Board',
    registeredCount: 45,
    maxParticipants: 80,
    status: 'Published',
    thumbnailGradient: 'from-blue-600 to-indigo-700',
    description:
      'Campus academic and extracurricular session coordinated through university faculty and student committees.',
    contactEmail: 'activities@campus.edu',
    contactPhone: '+91 98765 43210',
    eligibility: {
      departments: 'Open to All Departments',
      years: 'All Enrolled Students',
      courses: 'All Undergraduate & Postgraduate Programs',
    },
    registrationDeadline: '27 Sep 2026, 11:59 PM',
  }
}

/**
 * Updates a faculty activity in the session store
 */
export function updateFacultyActivity(activityId, updatedData) {
  const index = sessionFacultyActivities.findIndex((a) => a.id === activityId)
  if (index !== -1) {
    sessionFacultyActivities[index] = {
      ...sessionFacultyActivities[index],
      ...updatedData,
    }
    return sessionFacultyActivities[index]
  }
  return null
}

