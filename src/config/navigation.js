export const studentNav = [
  { label: 'Dashboard', path: '/student/dashboard', icon: 'dashboard' },
  { label: 'Explore Activities', path: '/student/activities', icon: 'calendar' },
  { label: 'My Registrations', path: '/student/my-registrations', icon: 'clipboard' },
  { label: 'My Activity', path: '/student/my-activity', icon: 'activity' },
  { label: 'Clubs', path: '/student/clubs', icon: 'clubs' },
  { label: 'Notifications', path: '/student/notifications', icon: 'bell', badge: '3' },
  { label: 'Support', path: '/student/support', icon: 'support' },
  { label: 'Profile', path: '/student/profile', icon: 'user' },
  { label: 'Logout', path: '/login', icon: 'logout', isAction: true },
]

export const facultyNav = [
  { label: 'Dashboard', path: '/faculty/dashboard', icon: 'dashboard' },
  { label: 'Activities', path: '/faculty/activities', icon: 'calendar' },
  { label: 'Create Activity', path: '/faculty/activities/create', icon: 'plus' },
  { label: 'Registrations', path: '/faculty/registrations', icon: 'clipboard' },
  { label: 'Students', path: '/faculty/students', icon: 'users' },
  { label: 'Clubs', path: '/faculty/clubs', icon: 'clubs' },
  { label: 'Analytics', path: '/faculty/analytics', icon: 'chart' },
  { label: 'Notifications', path: '/faculty/notifications', icon: 'bell', badge: '5' },
  { label: 'Support', path: '/faculty/support', icon: 'support' },
  { label: 'Profile', path: '/faculty/profile', icon: 'user' },
  { label: 'Logout', path: '/login', icon: 'logout', isAction: true },
]

export const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  {
    section: 'User Management',
    items: [
      { label: 'All Users', path: '/admin/users', icon: 'users' },
      { label: 'Students', path: '/admin/users/students', icon: 'user' },
      { label: 'Faculty / Staff', path: '/admin/users/faculty', icon: 'users' },
    ],
  },
  {
    section: 'Campus Management',
    items: [
      { label: 'Activities', path: '/admin/activities', icon: 'calendar' },
      { label: 'Clubs', path: '/admin/clubs', icon: 'clubs' },
      { label: 'Registrations', path: '/admin/registrations', icon: 'clipboard' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Analytics', path: '/admin/analytics', icon: 'chart' },
      { label: 'Reports', path: '/admin/reports', icon: 'reports' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Notifications', path: '/admin/notifications', icon: 'bell', badge: '12' },
      { label: 'Support Tickets', path: '/admin/support', icon: 'support' },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Settings', path: '/admin/settings', icon: 'settings' },
      { label: 'Profile', path: '/admin/profile', icon: 'user' },
      { label: 'Logout', path: '/login', icon: 'logout', isAction: true },
    ],
  },
]
