/**
 * Unified Support & Ticketing Architecture for Campus Live
 * Serves as the single common data source across:
 * - Student Support (Student-created tickets)
 * - Admin / Faculty Support (Faculty/Admin-created tickets)
 * - Public Help & Support (Public inquiries)
 * - Super Admin Support (Central Management Console)
 */

export const UNIFIED_SUPPORT_STORAGE_KEY = 'campuslive_unified_support_tickets'
export const UNIFIED_SUPPORT_EVENT_KEY = 'campuslive_unified_support_updated'
export const FACULTY_SUPPORT_EVENT_KEY = 'campuslive_faculty_support_updated'

export const supportCategoriesList = [
  'Technical Issue',
  'Account & Login',
  'Activity / Registration',
  'Club',
  'Payment / Fees',
  'General Inquiry',
  'Other',
]

export const supportPrioritiesList = ['Low', 'Medium', 'High', 'Urgent']

export const supportStatusesList = [
  'All',
  'Open',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
]

export const supportAssigneesList = [
  'Unassigned',
  'Super Admin',
  'Support Admin',
  'Prof. David Vance',
  'Dr. Sarah Jenkins',
]

export const initialUnifiedTickets = [
  // -------------------------------------------------------------------------
  // 1. STUDENT CREATED TICKETS (origin: 'student')
  // -------------------------------------------------------------------------
  {
    id: 'TICK-2026-0425',
    ticketNumber: 'TICK-2026-0425',
    origin: 'student',
    subject: 'Coding Club weekly discord & repo link not received',
    category: 'Club',
    priority: 'Low',
    status: 'Open',
    assignedTo: 'Dr. Sarah Jenkins',
    createdDate: '24 Sep 2026, 09:00 AM',
    lastUpdated: '24 Sep 2026, 09:00 AM',
    description:
      'My membership for Coding Club was approved this morning, but I have not received the GitHub organization invite and private community channel link.',
    attachmentName: null,
    creator: {
      name: 'Priya Sharma',
      role: 'Student',
      email: 'priya.s@campus.edu',
      department: 'Information Technology',
      phone: '+91 98451 23456',
      studentId: 'STU-2024-042',
    },
    messages: [
      {
        id: 'msg-425-1',
        senderName: 'Priya Sharma',
        senderRole: 'Student',
        role: 'Student',
        avatar: 'PS',
        text: 'My membership for Coding Club was approved this morning, but I have not received the GitHub organization invite and private community channel link. Could someone please share them?',
        message: 'My membership for Coding Club was approved this morning, but I have not received the GitHub organization invite and private community channel link. Could someone please share them?',
        timestamp: '24 Sep 2026, 09:00 AM',
        time: '24 Sep 2026, 09:00 AM',
        isStaff: false,
      },
    ],
  },
  {
    id: 'TICK-2026-0418',
    ticketNumber: 'TICK-2026-0418',
    origin: 'student',
    subject: 'Schedule clash for Web Development Bootcamp with Lab Exam',
    category: 'Activity / Registration',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Super Admin',
    createdDate: '20 Sep 2026, 04:30 PM',
    lastUpdated: '22 Sep 2026, 09:20 AM',
    description:
      'The Web Development Bootcamp session on Friday afternoon clashes with our scheduled CS202 Lab Exam. Can I transfer to the morning weekend slot?',
    attachmentName: null,
    creator: {
      name: 'Karan Mehta',
      role: 'Student',
      email: 'karan.m@campus.edu',
      department: 'Information Technology',
      phone: '+91 98990 12345',
      studentId: 'STU-2023-055',
    },
    messages: [
      {
        id: 'msg-418-1',
        senderName: 'Karan Mehta',
        senderRole: 'Student',
        role: 'Student',
        avatar: 'KM',
        text: 'The Web Development Bootcamp session on Friday afternoon clashes with our scheduled CS202 Lab Exam. Can I transfer to the morning weekend slot or get access to session recordings?',
        message: 'The Web Development Bootcamp session on Friday afternoon clashes with our scheduled CS202 Lab Exam. Can I transfer to the morning weekend slot or get access to session recordings?',
        timestamp: '20 Sep 2026, 04:30 PM',
        time: '20 Sep 2026, 04:30 PM',
        isStaff: false,
      },
      {
        id: 'msg-418-2',
        senderName: 'Prof. David Vance',
        senderRole: 'Faculty Coordinator',
        role: 'Faculty Coordinator',
        avatar: 'DV',
        text: 'We are checking slot capacities with the event organizer. We will confirm your transfer request by this afternoon.',
        message: 'We are checking slot capacities with the event organizer. We will confirm your transfer request by this afternoon.',
        timestamp: '21 Sep 2026, 09:20 AM',
        time: '21 Sep 2026, 09:20 AM',
        isStaff: true,
      },
      {
        id: 'msg-418-3',
        senderName: 'Super Admin (Sarah Jenkins)',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'Capacity override authorized for the Saturday morning batch. We have transferred your registration without impacting your seat quota.',
        message: 'Capacity override authorized for the Saturday morning batch. We have transferred your registration without impacting your seat quota.',
        timestamp: '22 Sep 2026, 09:20 AM',
        time: '22 Sep 2026, 09:20 AM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'TICK-2026-0402',
    ticketNumber: 'TICK-2026-0402',
    origin: 'student',
    subject: 'Unable to download Certificate of Participation for Ideathon',
    category: 'Technical Issue',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Super Admin',
    createdDate: '19 Sep 2026, 02:40 PM',
    lastUpdated: '21 Sep 2026, 10:15 AM',
    description:
      'I completed the Smart Campus Ideathon 2026 last week, but the download certificate link on my participation history is showing verification pending.',
    attachmentName: 'ideathon-screen.png',
    creator: {
      name: 'Nisarg Patel',
      role: 'Student',
      email: 'nisarg@campus.edu',
      department: 'Computer Engineering',
      phone: '+91 98765 43210',
      studentId: 'STU-2024-001',
    },
    messages: [
      {
        id: 'msg-402-1',
        senderName: 'Nisarg Patel',
        senderRole: 'Student',
        role: 'Student',
        avatar: 'NP',
        text: 'I completed the Smart Campus Ideathon 2026 last week, but the download certificate link on my participation history is showing verification pending. Could you please look into it?',
        message: 'I completed the Smart Campus Ideathon 2026 last week, but the download certificate link on my participation history is showing verification pending. Could you please look into it?',
        timestamp: '19 Sep 2026, 02:40 PM',
        time: '19 Sep 2026, 02:40 PM',
        isStaff: false,
      },
      {
        id: 'msg-402-2',
        senderName: 'Dr. Rajiv Sen',
        senderRole: 'Faculty Coordinator',
        role: 'Faculty Coordinator',
        avatar: 'RS',
        text: 'Hello Nisarg, thank you for reaching out. We have sent the attendance logs to the academic registrar for digital signature verification.',
        message: 'Hello Nisarg, thank you for reaching out. We have sent the attendance logs to the academic registrar for digital signature verification.',
        timestamp: '20 Sep 2026, 11:30 AM',
        time: '20 Sep 2026, 11:30 AM',
        isStaff: true,
      },
      {
        id: 'msg-402-3',
        senderName: 'Super Admin (Sarah Jenkins)',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'Your digital credential has now been validated and certified institution-wide. You can download your official PDF certificate from your student portal.',
        message: 'Your digital credential has now been validated and certified institution-wide. You can download your official PDF certificate from your student portal.',
        timestamp: '21 Sep 2026, 10:15 AM',
        time: '21 Sep 2026, 10:15 AM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'TICK-2026-0391',
    ticketNumber: 'TICK-2026-0391',
    origin: 'student',
    subject: 'Two-factor authenticator reset for university portal email',
    category: 'Account & Login',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'Support Admin',
    createdDate: '18 Sep 2026, 11:15 AM',
    lastUpdated: '19 Sep 2026, 01:20 PM',
    description:
      'I switched to a new phone and lost my authenticator app seeds for single sign-on access to the portal.',
    attachmentName: null,
    creator: {
      name: 'Rahul Verma',
      role: 'Student',
      email: 'r.verma@campus.edu',
      department: 'Mechanical Engineering',
      phone: '+91 97654 32109',
      studentId: 'STU-2023-118',
    },
    messages: [
      {
        id: 'msg-391-1',
        senderName: 'Rahul Verma',
        senderRole: 'Student',
        role: 'Student',
        avatar: 'RV',
        text: 'I switched to a new phone and lost my authenticator app seeds for single sign-on access to the portal. Please initiate an identity reset.',
        message: 'I switched to a new phone and lost my authenticator app seeds for single sign-on access to the portal. Please initiate an identity reset.',
        timestamp: '18 Sep 2026, 11:15 AM',
        time: '18 Sep 2026, 11:15 AM',
        isStaff: false,
      },
      {
        id: 'msg-391-2',
        senderName: 'Campus IT Security',
        senderRole: 'Support Admin',
        role: 'Support Admin',
        avatar: 'IT',
        text: 'Ticket assigned to Security Operations. A recovery SMS verification link has been queued for your registered contact phone.',
        message: 'Ticket assigned to Security Operations. A recovery SMS verification link has been queued for your registered contact phone.',
        timestamp: '19 Sep 2026, 01:20 PM',
        time: '19 Sep 2026, 01:20 PM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'TICK-2026-0365',
    ticketNumber: 'TICK-2026-0365',
    origin: 'student',
    subject: 'Workshop kit receipt acknowledgment & GST invoice',
    category: 'Payment / Fees',
    priority: 'Low',
    status: 'Closed',
    assignedTo: 'Support Admin',
    createdDate: '12 Sep 2026, 10:00 AM',
    lastUpdated: '13 Sep 2026, 03:45 PM',
    description:
      'Needed an official college stamp receipt for robotics kit purchase for external scholarship reimbursement.',
    attachmentName: 'receipt-copy.pdf',
    creator: {
      name: 'Sneha Nair',
      role: 'Student',
      email: 'sneha.n@campus.edu',
      department: 'Other / Applied Sciences',
      phone: '+91 98221 44556',
      studentId: 'STU-2024-112',
    },
    messages: [
      {
        id: 'msg-365-1',
        senderName: 'Sneha Nair',
        senderRole: 'Student',
        role: 'Student',
        avatar: 'SN',
        text: 'I need an official stamped payment receipt for the robotics kit for my state scholarship claim.',
        message: 'I need an official stamped payment receipt for the robotics kit for my state scholarship claim.',
        timestamp: '12 Sep 2026, 10:00 AM',
        time: '12 Sep 2026, 10:00 AM',
        isStaff: false,
      },
      {
        id: 'msg-365-2',
        senderName: 'Accounts Department',
        senderRole: 'Support Admin',
        role: 'Support Admin',
        avatar: 'AD',
        text: 'Stamped receipt has been issued and sent to your student email. Closing this ticket.',
        message: 'Stamped receipt has been issued and sent to your student email. Closing this ticket.',
        timestamp: '13 Sep 2026, 03:45 PM',
        time: '13 Sep 2026, 03:45 PM',
        isStaff: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 2. ADMIN / FACULTY CREATED TICKETS (origin: 'faculty')
  // -------------------------------------------------------------------------
  {
    id: 'SUP-1024',
    ticketNumber: 'SUP-1024',
    origin: 'faculty',
    subject: 'Unable to register for AI & Future Technology Workshop (Quota Bug)',
    category: 'Activity / Registration',
    priority: 'High',
    status: 'Open',
    assignedTo: 'Super Admin',
    createdDate: '24 Sep 2026, 09:30 AM',
    lastUpdated: '24 Sep 2026, 10:15 AM',
    description:
      'Several students in 3rd year Computer Science are reporting that their registration button is greyed out even though there are 34 open seats remaining on the activity roster.',
    attachmentName: 'registration_error_code504.png',
    creator: {
      name: 'Prof. David Vance',
      role: 'Admin',
      email: 'd.vance@campuslive.edu',
      department: 'Information Technology',
      phone: '+91 98450 33812',
      staffId: 'ADM-2020-014',
    },
    messages: [
      {
        id: 'msg-1024-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'DV',
        text: 'Several students in 3rd year IT/CSE are reporting that their registration button is greyed out even though there are 34 open seats remaining on the activity roster.',
        message: 'Several students in 3rd year IT/CSE are reporting that their registration button is greyed out even though there are 34 open seats remaining on the activity roster.',
        timestamp: '24 Sep 2026, 09:30 AM',
        time: '24 Sep 2026, 09:30 AM',
        isStaff: true,
      },
      {
        id: 'msg-1024-2',
        senderName: 'Super Admin (Sarah Jenkins)',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'Investigating the capacity calculation cache. A recalculation patch has been applied to unblock valid active seats.',
        message: 'Investigating the capacity calculation cache. A recalculation patch has been applied to unblock valid active seats.',
        timestamp: '24 Sep 2026, 10:15 AM',
        time: '24 Sep 2026, 10:15 AM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'SUP-1023',
    ticketNumber: 'SUP-1023',
    origin: 'faculty',
    subject: 'Acoustic and Sound Gear Request for Central Auditorium Keynote',
    category: 'Activity / Registration',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: 'Support Admin',
    createdDate: '23 Sep 2026, 02:15 PM',
    lastUpdated: '24 Sep 2026, 08:45 AM',
    description:
      'Requesting high-output PA wireless microphones and projector HDMI matrix tie-ins for the upcoming Hackathon keynote speech in Central Auditorium.',
    attachmentName: 'auditorium_av_checklist.pdf',
    creator: {
      name: 'Dr. Sarah Jenkins',
      role: 'Admin',
      email: 's.jenkins@campuslive.edu',
      department: 'Computer Engineering',
      phone: '+91 98230 11421',
      staffId: 'ADM-2019-001',
    },
    messages: [
      {
        id: 'msg-1023-1',
        senderName: 'Dr. Sarah Jenkins',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'SJ',
        text: 'Requesting high-output PA microphones and projector HDMI tie-ins for the upcoming Hackathon keynote speech in Central Auditorium on Friday.',
        message: 'Requesting high-output PA microphones and projector HDMI tie-ins for the upcoming Hackathon keynote speech in Central Auditorium on Friday.',
        timestamp: '23 Sep 2026, 02:15 PM',
        time: '23 Sep 2026, 02:15 PM',
        isStaff: true,
      },
      {
        id: 'msg-1023-2',
        senderName: 'Campus Operations AV',
        senderRole: 'Support Admin',
        role: 'Support Admin',
        avatar: 'AV',
        text: 'Audio-visual technician has been assigned to Hall A. Equipment setup and mic test scheduled for Thursday 4:00 PM.',
        message: 'Audio-visual technician has been assigned to Hall A. Equipment setup and mic test scheduled for Thursday 4:00 PM.',
        timestamp: '24 Sep 2026, 08:45 AM',
        time: '24 Sep 2026, 08:45 AM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'SUP-1022',
    ticketNumber: 'SUP-1022',
    origin: 'faculty',
    subject: 'Single Sign-On login latency during peak hours',
    category: 'Technical Issue',
    priority: 'Urgent',
    status: 'Assigned',
    assignedTo: 'Super Admin',
    createdDate: '21 Sep 2026, 11:10 AM',
    lastUpdated: '21 Sep 2026, 04:30 PM',
    description:
      'Admin dashboard analytics and student roster exports take over 12 seconds to load between 11:00 AM and 1:00 PM.',
    attachmentName: null,
    creator: {
      name: 'Prof. David Vance',
      role: 'Admin',
      email: 'd.vance@campuslive.edu',
      department: 'Information Technology',
      phone: '+91 98450 33812',
      staffId: 'ADM-2020-014',
    },
    messages: [
      {
        id: 'msg-1022-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'DV',
        text: 'Admin dashboard analytics and student roster exports take over 12 seconds to load during mid-day peak usage across campus.',
        message: 'Admin dashboard analytics and student roster exports take over 12 seconds to load during mid-day peak usage across campus.',
        timestamp: '21 Sep 2026, 11:10 AM',
        time: '21 Sep 2026, 11:10 AM',
        isStaff: true,
      },
      {
        id: 'msg-1022-2',
        senderName: 'Super Admin Operations',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SA',
        text: 'Database query caching and connection pool optimization has been queued. Our cloud infrastructure team is monitoring server loads.',
        message: 'Database query caching and connection pool optimization has been queued. Our cloud infrastructure team is monitoring server loads.',
        timestamp: '21 Sep 2026, 04:30 PM',
        time: '21 Sep 2026, 04:30 PM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'SUP-1021',
    ticketNumber: 'SUP-1021',
    origin: 'faculty',
    subject: 'Coding Club Faculty Advisor Co-Signatory Authorization',
    category: 'Club',
    priority: 'Medium',
    status: 'Resolved',
    assignedTo: 'Support Admin',
    createdDate: '19 Sep 2026, 03:00 PM',
    lastUpdated: '20 Sep 2026, 05:20 PM',
    description:
      'Need department endorsement and faculty co-signatory approval for the inter-college hackathon sponsorship prospectus.',
    attachmentName: 'sponsorship_prospectus_v2.docx',
    creator: {
      name: 'Priya Patel',
      role: 'Student Lead',
      email: 'p.patel@campuslive.edu',
      department: 'Computer Engineering',
      phone: '+91 98451 99012',
      staffId: 'STU-2023-012',
    },
    messages: [
      {
        id: 'msg-1021-1',
        senderName: 'Priya Patel',
        senderRole: 'Student Lead',
        role: 'Student Lead',
        avatar: 'PP',
        text: 'We have finalized the draft for the industry sponsorship letter. Need Prof. Vance to co-sign the digital authorization document.',
        message: 'We have finalized the draft for the industry sponsorship letter. Need Prof. Vance to co-sign the digital authorization document.',
        timestamp: '19 Sep 2026, 03:00 PM',
        time: '19 Sep 2026, 03:00 PM',
        isStaff: false,
      },
      {
        id: 'msg-1021-2',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'DV',
        text: 'Digital authorization signed and uploaded to the club repository portal. Best of luck securing sponsors!',
        message: 'Digital authorization signed and uploaded to the club repository portal. Best of luck securing sponsors!',
        timestamp: '20 Sep 2026, 05:20 PM',
        time: '20 Sep 2026, 05:20 PM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'SUP-1020',
    ticketNumber: 'SUP-1020',
    origin: 'faculty',
    subject: 'Faculty Profile Designation & Department Affiliation Update',
    category: 'Account & Login',
    priority: 'Low',
    status: 'Closed',
    assignedTo: 'Super Admin',
    createdDate: '15 Sep 2026, 10:00 AM',
    lastUpdated: '16 Sep 2026, 02:10 PM',
    description:
      'Update profile designation from Associate Coordinator to Department Admin Head for Computer Science.',
    attachmentName: null,
    creator: {
      name: 'Prof. David Vance',
      role: 'Admin',
      email: 'd.vance@campuslive.edu',
      department: 'Information Technology',
      phone: '+91 98450 33812',
      staffId: 'ADM-2020-014',
    },
    messages: [
      {
        id: 'msg-1020-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'DV',
        text: 'Please update my faculty portal designation to Department Admin Head for CSE.',
        message: 'Please update my faculty portal designation to Department Admin Head for CSE.',
        timestamp: '15 Sep 2026, 10:00 AM',
        time: '15 Sep 2026, 10:00 AM',
        isStaff: true,
      },
      {
        id: 'msg-1020-2',
        senderName: 'Super Admin (Sarah Jenkins)',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'Your title and portal permissions have been successfully updated in institutional directory. Closing ticket.',
        message: 'Your title and portal permissions have been successfully updated in institutional directory. Closing ticket.',
        timestamp: '16 Sep 2026, 02:10 PM',
        time: '16 Sep 2026, 02:10 PM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'SUP-1019',
    ticketNumber: 'SUP-1019',
    origin: 'faculty',
    subject: 'Batch certificate generation format discrepancy for Hackathon',
    category: 'Other',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Support Admin',
    createdDate: '12 Sep 2026, 09:30 AM',
    lastUpdated: '13 Sep 2026, 11:00 AM',
    description:
      'Certificate template was missing the official university accreditation seal on PDF exports.',
    attachmentName: 'sample_cert_preview.pdf',
    creator: {
      name: 'Prof. David Vance',
      role: 'Admin',
      email: 'd.vance@campuslive.edu',
      department: 'Information Technology',
      phone: '+91 98450 33812',
      staffId: 'ADM-2020-014',
    },
    messages: [
      {
        id: 'msg-1019-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        role: 'Admin',
        avatar: 'DV',
        text: 'Certificate template was missing the official university accreditation seal on PDF exports.',
        message: 'Certificate template was missing the official university accreditation seal on PDF exports.',
        timestamp: '12 Sep 2026, 09:30 AM',
        time: '12 Sep 2026, 09:30 AM',
        isStaff: true,
      },
      {
        id: 'msg-1019-2',
        senderName: 'Design & Media Cell',
        senderRole: 'Support Admin',
        role: 'Support Admin',
        avatar: 'DM',
        text: 'Vector seal has been embedded into the automated PDF generation pipeline. Re-exports verified.',
        message: 'Vector seal has been embedded into the automated PDF generation pipeline. Re-exports verified.',
        timestamp: '13 Sep 2026, 11:00 AM',
        time: '13 Sep 2026, 11:00 AM',
        isStaff: true,
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 3. PUBLIC HELP & SUPPORT INQUIRIES (origin: 'public')
  // -------------------------------------------------------------------------
  {
    id: 'INQ-58210',
    ticketNumber: 'INQ-58210',
    origin: 'public',
    subject: 'Prospective student inquiry regarding inter-college hackathon eligibility',
    category: 'General Inquiry',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Super Admin',
    createdDate: '25 Sep 2026, 11:10 AM',
    lastUpdated: '25 Sep 2026, 11:10 AM',
    description:
      'I am an external B.Tech student from neighboring university. Can external college teams register for the CodeSprint 2026 Hackathon on your campus?',
    attachmentName: null,
    creator: {
      name: 'Aakash Mehta',
      role: 'Public User',
      email: 'aakash.m@gmail.com',
      department: 'External Applicant',
      phone: '+91 99887 76655',
    },
    messages: [
      {
        id: 'msg-inq-1',
        senderName: 'Aakash Mehta',
        senderRole: 'Public User',
        role: 'Public User',
        avatar: 'AM',
        text: 'I am an external B.Tech student from neighboring university. Can external college teams register for the CodeSprint 2026 Hackathon on your campus?',
        message: 'I am an external B.Tech student from neighboring university. Can external college teams register for the CodeSprint 2026 Hackathon on your campus?',
        timestamp: '25 Sep 2026, 11:10 AM',
        time: '25 Sep 2026, 11:10 AM',
        isStaff: false,
      },
    ],
  },
  {
    id: 'INQ-64902',
    ticketNumber: 'INQ-64902',
    origin: 'public',
    subject: 'Guest industry speaker pass and campus parking permit request',
    category: 'Activity / Registration',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Super Admin',
    createdDate: '24 Sep 2026, 03:40 PM',
    lastUpdated: '25 Sep 2026, 09:15 AM',
    description:
      'Our team is conducting the Cloud Architecture workshop. Requesting 3 guest vehicle parking permits and lab network visitor WiFi credentials.',
    attachmentName: 'speaker_details_badge.pdf',
    creator: {
      name: 'Ritu Singhania',
      role: 'Public User',
      email: 'ritu@techlabs.io',
      department: 'Industry Partner',
      phone: '+91 98112 99887',
    },
    messages: [
      {
        id: 'msg-inq-2',
        senderName: 'Ritu Singhania',
        senderRole: 'Public User',
        role: 'Public User',
        avatar: 'RS',
        text: 'Our team is conducting the Cloud Architecture workshop. Requesting 3 guest vehicle parking permits and lab network visitor WiFi credentials.',
        message: 'Our team is conducting the Cloud Architecture workshop. Requesting 3 guest vehicle parking permits and lab network visitor WiFi credentials.',
        timestamp: '24 Sep 2026, 03:40 PM',
        time: '24 Sep 2026, 03:40 PM',
        isStaff: false,
      },
      {
        id: 'msg-inq-3',
        senderName: 'Super Admin (Sarah Jenkins)',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'Security clearance issued. Gate passes are available at Main Gate Security Booth under TechLabs guest listing.',
        message: 'Security clearance issued. Gate passes are available at Main Gate Security Booth under TechLabs guest listing.',
        timestamp: '25 Sep 2026, 09:15 AM',
        time: '25 Sep 2026, 09:15 AM',
        isStaff: true,
      },
    ],
  },
  {
    id: 'INQ-41098',
    ticketNumber: 'INQ-41098',
    origin: 'public',
    subject: 'Parent inquiry about student participation certificates verification',
    category: 'General Inquiry',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'Support Admin',
    createdDate: '20 Sep 2026, 02:00 PM',
    lastUpdated: '21 Sep 2026, 04:30 PM',
    description:
      'Seeking verification instructions for certificate QR codes presented for education loan co-curricular validation.',
    attachmentName: null,
    creator: {
      name: 'Suresh Patel',
      role: 'Public User',
      email: 'spatel@outlook.com',
      department: 'Parent / Guardian',
      phone: '+91 97223 44551',
    },
    messages: [
      {
        id: 'msg-inq-4',
        senderName: 'Suresh Patel',
        senderRole: 'Public User',
        role: 'Public User',
        avatar: 'SP',
        text: 'Seeking verification instructions for certificate QR codes presented for education loan co-curricular validation.',
        message: 'Seeking verification instructions for certificate QR codes presented for education loan co-curricular validation.',
        timestamp: '20 Sep 2026, 02:00 PM',
        time: '20 Sep 2026, 02:00 PM',
        isStaff: false,
      },
      {
        id: 'msg-inq-5',
        senderName: 'Super Admin Support Desk',
        senderRole: 'Super Admin',
        role: 'Super Admin',
        avatar: 'SJ',
        text: 'All Campus Live certificates can be verified publicly by scanning the cryptographic QR watermark on the bottom right corner of the document.',
        message: 'All Campus Live certificates can be verified publicly by scanning the cryptographic QR watermark on the bottom right corner of the document.',
        timestamp: '21 Sep 2026, 04:30 PM',
        time: '21 Sep 2026, 04:30 PM',
        isStaff: true,
      },
    ],
  },
]

/**
 * Get all stored tickets from unified store
 */
export function getStoredUnifiedTickets() {
  try {
    const saved = localStorage.getItem(UNIFIED_SUPPORT_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return initialUnifiedTickets
}

/**
 * Save tickets to unified store and trigger sync events across portals
 */
export function saveStoredUnifiedTickets(tickets) {
  try {
    localStorage.setItem(UNIFIED_SUPPORT_STORAGE_KEY, JSON.stringify(tickets))
    window.dispatchEvent(new CustomEvent(UNIFIED_SUPPORT_EVENT_KEY, { detail: tickets }))
    window.dispatchEvent(new CustomEvent(FACULTY_SUPPORT_EVENT_KEY, { detail: tickets }))
  } catch {
    // ignore
  }
}

/**
 * Get tickets filtered for specific portal view
 * - Student: sees only their student tickets
 * - Faculty: sees faculty-created tickets
 * - Public: public inquiries (only managed by Super Admin)
 * - Super Admin: sees ALL tickets across all origins
 */
export function getTicketsForScope(scope = 'super_admin') {
  const allTickets = getStoredUnifiedTickets()

  if (scope === 'student') {
    return allTickets.filter((t) => t.origin === 'student')
  }

  if (scope === 'faculty') {
    return allTickets.filter((t) => t.origin === 'faculty' || t.origin === 'student')
  }

  if (scope === 'public') {
    return allTickets.filter((t) => t.origin === 'public')
  }

  // Super Admin: Central view of everything
  return allTickets
}

/**
 * Helper to submit a public inquiry from Help & Support page
 */
export function createPublicInquiry({ ticketNumber, fullName, email, phone, category, subject, message }) {
  const randomId = ticketNumber || `INQ-${Math.floor(10000 + Math.random() * 90000)}`
  const dateFormatted =
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    `, ` +
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const newTicket = {
    id: randomId,
    ticketNumber: randomId,
    origin: 'public',
    subject: subject || 'Public Helpdesk Inquiry',
    category: category || 'General Inquiry',
    priority: 'Medium',
    status: 'Open',
    assignedTo: 'Super Admin',
    createdDate: dateFormatted,
    lastUpdated: 'Just now',
    description: message,
    attachmentName: null,
    creator: {
      name: fullName,
      role: 'Public User',
      email: email,
      phone: phone || 'Not provided',
      department: 'Public Inquiry',
    },
    messages: [
      {
        id: `msg-pub-${Date.now()}`,
        senderName: fullName,
        senderRole: 'Public User',
        role: 'Public User',
        avatar: fullName ? fullName.charAt(0).toUpperCase() : 'P',
        text: message,
        message: message,
        timestamp: 'Just now',
        time: dateFormatted,
        isStaff: false,
      },
    ],
  }

  const current = getStoredUnifiedTickets()
  const updated = [newTicket, ...current]
  saveStoredUnifiedTickets(updated)
  return newTicket
}
