export const FACULTY_SUPPORT_STORAGE_KEY = 'campuslive_faculty_support_tickets'
export const FACULTY_SUPPORT_EVENT_KEY = 'campuslive_faculty_support_updated'

export const supportCategoriesList = [
  'Technical Issue',
  'Account Issue',
  'Activity Issue',
  'Registration Issue',
  'Club Issue',
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
]

export const initialFacultySupportTickets = [
  {
    id: 'SUP-1024',
    ticketNumber: '#SUP-1024',
    subject: 'Unable to register for AI & Future Technology Workshop',
    user: 'Rahul Sharma (Student)',
    userRole: 'Student',
    category: 'Registration Issue',
    priority: 'High',
    status: 'OPEN',
    assignedTo: 'Support Admin',
    createdDate: 'Today, 09:30 AM',
    lastUpdated: 'Today, 10:15 AM',
    description:
      'Several students in 3rd year Computer Science are reporting that their registration button is greyed out even though there are 34 open seats remaining on the activity roster.',
    attachmentName: 'registration_error_code504.png',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Rahul Sharma',
        senderRole: 'Student',
        avatar: 'RS',
        message:
          'I am unable to register for the AI & Future Technology workshop. The portal says eligibility criteria not met, but I am in 3rd year CSE.',
        time: 'Today, 09:30 AM',
      },
      {
        id: 'msg-2',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'We are checking the department eligibility rules configured for this activity. A fix is being applied to the registration filter.',
        time: 'Today, 10:15 AM',
      },
    ],
  },
  {
    id: 'SUP-1023',
    ticketNumber: '#SUP-1023',
    subject: 'Acoustic and Sound Gear Request for Central Auditorium',
    user: 'Prof. David Vance (Admin)',
    userRole: 'Admin',
    category: 'Activity Issue',
    priority: 'Medium',
    status: 'IN_PROGRESS',
    assignedTo: 'Super Admin',
    createdDate: 'Yesterday, 02:15 PM',
    lastUpdated: 'Today, 08:45 AM',
    description:
      'Requesting high-output PA wireless microphones and projector HDMI matrix tie-ins for the upcoming Hackathon keynote speech in Central Auditorium.',
    attachmentName: 'auditorium_av_checklist.pdf',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'Requesting high-output PA microphones and projector HDMI tie-ins for the upcoming Hackathon keynote speech in Central Auditorium on Friday.',
        time: 'Yesterday, 02:15 PM',
      },
      {
        id: 'msg-2',
        senderName: 'Campus Operations AV',
        senderRole: 'Support Admin',
        avatar: 'AV',
        message:
          'Audio-visual technician has been assigned to Hall A. Equipment setup and mic test scheduled for Thursday 4:00 PM.',
        time: 'Today, 08:45 AM',
      },
    ],
  },
  {
    id: 'SUP-1022',
    ticketNumber: '#SUP-1022',
    subject: 'Single Sign-On login latency during peak hours',
    user: 'Prof. David Vance (Admin)',
    userRole: 'Admin',
    category: 'Technical Issue',
    priority: 'Urgent',
    status: 'ASSIGNED',
    assignedTo: 'Super Admin',
    createdDate: '21 Sep 2026, 11:10 AM',
    lastUpdated: '21 Sep 2026, 04:30 PM',
    description:
      'Admin dashboard analytics and student roster exports take over 12 seconds to load between 11:00 AM and 1:00 PM.',
    attachmentName: null,
    messages: [
      {
        id: 'msg-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'Admin dashboard analytics and student roster exports take over 12 seconds to load during mid-day peak usage across campus.',
        time: '21 Sep 2026, 11:10 AM',
      },
      {
        id: 'msg-2',
        senderName: 'Super Admin Operations',
        senderRole: 'Super Admin',
        avatar: 'SA',
        message:
          'Database query caching and connection pool optimization has been queued. Our cloud infrastructure team is monitoring server loads.',
        time: '21 Sep 2026, 04:30 PM',
      },
    ],
  },
  {
    id: 'SUP-1021',
    ticketNumber: '#SUP-1021',
    subject: 'Coding Club Faculty Advisor Co-Signatory Authorization',
    user: 'Priya Patel (Student Lead)',
    userRole: 'Student',
    category: 'Club Issue',
    priority: 'Medium',
    status: 'RESOLVED',
    assignedTo: 'Support Admin',
    createdDate: '19 Sep 2026, 03:00 PM',
    lastUpdated: '20 Sep 2026, 05:20 PM',
    description:
      'Need department endorsement and faculty co-signatory approval for the inter-college hackathon sponsorship prospectus.',
    attachmentName: 'sponsorship_prospectus_v2.docx',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Priya Patel',
        senderRole: 'Student',
        avatar: 'PP',
        message:
          'We have finalized the draft for the industry sponsorship letter. Need Prof. Vance to co-sign the digital authorization document.',
        time: '19 Sep 2026, 03:00 PM',
      },
      {
        id: 'msg-2',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'Digital authorization signed and uploaded to the club repository portal. Best of luck securing sponsors!',
        time: '20 Sep 2026, 05:20 PM',
      },
    ],
  },
  {
    id: 'SUP-1020',
    ticketNumber: '#SUP-1020',
    subject: 'Faculty Profile Designation & Department Affiliation Update',
    user: 'Prof. David Vance (Admin)',
    userRole: 'Admin',
    category: 'Account Issue',
    priority: 'Low',
    status: 'CLOSED',
    assignedTo: 'Super Admin',
    createdDate: '15 Sep 2026, 10:00 AM',
    lastUpdated: '16 Sep 2026, 02:10 PM',
    description:
      'Update profile designation from Associate Coordinator to Department Admin Head for Computer Science.',
    attachmentName: null,
    messages: [
      {
        id: 'msg-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'Please update my faculty portal designation to Department Admin Head for CSE.',
        time: '15 Sep 2026, 10:00 AM',
      },
      {
        id: 'msg-2',
        senderName: 'Academic Registrar Staff',
        senderRole: 'Super Admin',
        avatar: 'RS',
        message:
          'Your title and portal permissions have been successfully updated in institutional directory. Closing ticket.',
        time: '16 Sep 2026, 02:10 PM',
      },
    ],
  },
  {
    id: 'SUP-1019',
    ticketNumber: '#SUP-1019',
    subject: 'Batch certificate generation format discrepancy for Hackathon',
    user: 'Prof. David Vance (Admin)',
    userRole: 'Admin',
    category: 'Other',
    priority: 'Low',
    status: 'RESOLVED',
    assignedTo: 'Support Admin',
    createdDate: '12 Sep 2026, 09:30 AM',
    lastUpdated: '13 Sep 2026, 11:00 AM',
    description:
      'Certificate template was missing the official university accreditation seal on PDF exports.',
    attachmentName: 'sample_cert_preview.pdf',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Prof. David Vance',
        senderRole: 'Admin',
        avatar: 'DV',
        message:
          'Certificate template was missing the official university accreditation seal on PDF exports.',
        time: '12 Sep 2026, 09:30 AM',
      },
      {
        id: 'msg-2',
        senderName: 'Design & Media Cell',
        senderRole: 'Support Admin',
        avatar: 'DM',
        message:
          'Vector seal has been embedded into the automated PDF generation pipeline. Re-exports verified.',
        time: '13 Sep 2026, 11:00 AM',
      },
    ],
  },
]

export function getStoredFacultySupportTickets() {
  try {
    const saved = localStorage.getItem(FACULTY_SUPPORT_STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return initialFacultySupportTickets
}

export function saveStoredFacultySupportTickets(tickets) {
  try {
    localStorage.setItem(FACULTY_SUPPORT_STORAGE_KEY, JSON.stringify(tickets))
    window.dispatchEvent(
      new CustomEvent(FACULTY_SUPPORT_EVENT_KEY, { detail: tickets })
    )
  } catch {
    // ignore
  }
}
