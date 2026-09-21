export const activityCategories = [
  'All',
  'Workshop',
  'Seminar',
  'Competition',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
]

export const dateFilters = [
  'All Dates',
  'Today',
  'This Week',
  'This Month',
]

export const departmentFilters = [
  'All Departments',
  'Computer Engineering',
  'Information Technology',
  'Mechanical',
  'Civil',
  'Electronics',
]

export const statusFilters = [
  'All',
  'Open for Registration',
  'Registration Closing Soon',
  'Registered',
  'Completed',
]

export const featuredActivities = [
  {
    id: 'feat-1',
    title: 'AI & Future Technology Workshop',
    category: 'Workshop',
    department: 'Computer Engineering',
    date: '24 September 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'Seminar Hall, Main Campus',
    organizer: 'Department of Computer Engineering',
    contact: 'computerengineering@college.edu',
    registrationDeadline: '22 September 2026',
    availableSeats: 86,
    totalSeats: 120,
    spotsLeft: 86,
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'primary',
    thumbnailGradient: 'from-blue-600 to-indigo-700',
    description:
      'Explore emerging technologies, artificial intelligence and future innovations through an interactive campus workshop.',
    about:
      'Artificial Intelligence and intelligent autonomous systems are fundamentally transforming software engineering, scientific research, and global industries. This workshop provides students with practical exposure to generative AI workflows, modern neural architecture concepts, and responsible AI practices through interactive demonstrations led by experienced engineering faculty.',
    topics: [
      'Introduction to Artificial Intelligence',
      'Future technology trends',
      'Practical demonstrations',
      'Industry applications',
      'Student interaction',
    ],
    eligibility: {
      departments: ['Computer Engineering', 'Information Technology'],
      years: 'All 2nd, 3rd and 4th year students',
    },
    coordinator: {
      name: 'Dr. Rahul Sharma',
      role: 'Faculty Coordinator',
      department: 'Department of Computer Engineering',
      email: 'computerengineering@college.edu',
      avatar: 'RS',
    },
    dateGroup: 'this_week',
    isFeatured: true,
  },
  {
    id: 'feat-2',
    title: 'Inter-College Hackathon 2026',
    category: 'Hackathon',
    department: 'Computer Engineering',
    date: '28 September 2026',
    time: '9:00 AM - 6:00 PM',
    venue: 'Innovation Lab',
    organizer: 'Coding Club',
    status: 'Registration Closing Soon',
    statusVariant: 'warning',
    badgeVariant: 'secondary',
    thumbnailGradient: 'from-indigo-600 to-purple-700',
    spotsLeft: 6,
    description:
      'A thrilling 24-hour collaborative sprint where teams engineer impactful web and mobile solutions addressing real campus sustainability challenges.',
    dateGroup: 'this_week',
    isFeatured: true,
  },
  {
    id: 'feat-3',
    title: 'Cyber Security Awareness Seminar',
    category: 'Seminar',
    department: 'Information Technology',
    date: '2 October 2026',
    time: '11:00 AM - 1:00 PM',
    venue: 'Main Auditorium',
    organizer: 'Information Technology Department',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'warning',
    thumbnailGradient: 'from-sky-600 to-blue-800',
    spotsLeft: 45,
    description:
      'Deep dive into ethical hacking methodologies, enterprise threat landscapes, digital privacy best practices, and cyber defense protocols.',
    dateGroup: 'this_month',
    isFeatured: true,
  },
]

export const upcomingActivities = [
  {
    id: 'act-101',
    title: 'Web Development Bootcamp',
    category: 'Workshop',
    department: 'Computer Engineering',
    date: '6 October 2026',
    time: '2:00 PM - 5:00 PM',
    venue: 'Computer Lab 2',
    organizer: 'Web Developers Guild',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'primary',
    thumbnailGradient: 'from-cyan-600 to-blue-700',
    spotsLeft: 22,
    description:
      'Master modern responsive web development with React, modern CSS architectures, and fullstack deployment best practices.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-102',
    title: 'Photography Competition',
    category: 'Competition',
    department: 'Information Technology',
    date: '10 October 2026',
    time: '10:00 AM - 4:00 PM',
    venue: 'Campus Quad & Amphitheatre',
    organizer: 'Shutterbugs Photography Club',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'secondary',
    thumbnailGradient: 'from-amber-500 to-rose-600',
    spotsLeft: 35,
    description:
      'Showcase campus aesthetics through your lens across categories including architectural symmetry, student life candids, and nature.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-103',
    title: 'Annual Sports Meet 2026',
    category: 'Sports',
    department: 'Mechanical',
    date: '15 October 2026',
    time: '8:00 AM - 5:00 PM',
    venue: 'University Sports Complex',
    organizer: 'Department of Physical Education',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'success',
    thumbnailGradient: 'from-emerald-600 to-teal-700',
    spotsLeft: 80,
    description:
      'Compete in track and field, 100m dash, badminton tournaments, volleyball championships, and team relay races for university honors.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-104',
    title: 'Cultural Fest "Tarang 2026"',
    category: 'Cultural',
    department: 'Civil',
    date: '20 October 2026',
    time: '5:00 PM - 10:00 PM',
    venue: 'Open Air Theatre',
    organizer: 'Student Cultural Council',
    status: 'Registration Closing Soon',
    statusVariant: 'warning',
    badgeVariant: 'secondary',
    thumbnailGradient: 'from-purple-600 to-pink-600',
    spotsLeft: 14,
    description:
      'Campus-wide flagship festival celebrating performing arts, live band showcases, traditional dance, one-act plays, and vibrant art installations.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-105',
    title: 'Robotics & IoT Workshop',
    category: 'Technical',
    department: 'Electronics',
    date: '24 October 2026',
    time: '11:00 AM - 3:00 PM',
    venue: 'Robotics Lab',
    organizer: 'Robotics Club',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'primary',
    thumbnailGradient: 'from-blue-700 to-indigo-900',
    spotsLeft: 20,
    description:
      'Build sensor-driven autonomous bots using microcontrollers, configure telemetry sensors, and test real-time edge computing devices.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-106',
    title: 'Entrepreneurship & Startup Summit',
    category: 'Seminar',
    department: 'Information Technology',
    date: '29 October 2026',
    time: '10:30 AM - 2:30 PM',
    venue: 'Conference Hall B',
    organizer: 'E-Cell & Innovation Council',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'warning',
    thumbnailGradient: 'from-violet-600 to-purple-800',
    spotsLeft: 50,
    description:
      'Learn fundraising, product-market fit validation, and intellectual property strategy with seasoned tech venture capitalists and alumni founders.',
    dateGroup: 'this_month',
    isFeatured: false,
  },
  {
    id: 'act-107',
    title: 'CAD & 3D Modeling Challenge',
    category: 'Competition',
    department: 'Mechanical',
    date: '4 November 2026',
    time: '1:00 PM - 4:00 PM',
    venue: 'Design & Simulation Lab',
    organizer: 'Mechanical Engineers Guild',
    status: 'Open for Registration',
    statusVariant: 'info',
    badgeVariant: 'secondary',
    thumbnailGradient: 'from-orange-500 to-amber-700',
    spotsLeft: 16,
    description:
      'Time-trial computer-aided engineering challenge focused on precision mechanical assemblies, aerodynamic modeling, and FEA stress testing.',
    dateGroup: 'later',
    isFeatured: false,
  },
  {
    id: 'act-108',
    title: 'Mobile App Development Hack',
    category: 'Hackathon',
    department: 'Computer Engineering',
    date: '8 November 2026',
    time: '9:00 AM - 7:00 PM',
    venue: 'Innovation Lab',
    organizer: 'Developer Student Club',
    status: 'Registered',
    statusVariant: 'success',
    badgeVariant: 'primary',
    thumbnailGradient: 'from-blue-600 to-teal-600',
    spotsLeft: 0,
    description:
      'Build performant mobile apps targeting education access and campus transit using Flutter, React Native, and cloud storage backends.',
    dateGroup: 'later',
    isFeatured: false,
  },
  {
    id: 'act-109',
    title: 'Sustainable Infrastructure Seminar',
    category: 'Seminar',
    department: 'Civil',
    date: '15 September 2026',
    time: '10:00 AM - 1:00 PM',
    venue: 'Civil Seminar Room',
    organizer: 'Civil Engineering Forum',
    status: 'Completed',
    statusVariant: 'neutral',
    badgeVariant: 'warning',
    thumbnailGradient: 'from-slate-600 to-zinc-700',
    spotsLeft: 0,
    description:
      'Comprehensive review of green building materials, carbon footprint mitigation in urban architecture, and smart city rainwater management.',
    dateGroup: 'past',
    isFeatured: false,
  },
]

export const allActivities = [...featuredActivities, ...upcomingActivities]

export const relatedActivities = [
  featuredActivities[1], // Inter-College Hackathon 2026
  featuredActivities[2], // Cyber Security Awareness Seminar
  upcomingActivities[0], // Web Development Bootcamp
]

export function getActivityById(id) {
  if (!id || id === '1' || id === 'feat-1') {
    return featuredActivities[0]
  }

  const found = allActivities.find((act) => act.id === id || String(act.id) === String(id))
  return found || featuredActivities[0]
}

