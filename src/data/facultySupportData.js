/**
 * Faculty Support Data Module (Bridged to Unified Support Architecture)
 * Connects the Faculty/Admin Support portal to the common support ticket system.
 */

import {
  initialUnifiedTickets,
  getStoredUnifiedTickets,
  saveStoredUnifiedTickets,
  FACULTY_SUPPORT_EVENT_KEY,
  supportCategoriesList,
  supportPrioritiesList,
  supportStatusesList,
  supportAssigneesList,
} from './unifiedSupportData.js'

export {
  FACULTY_SUPPORT_EVENT_KEY,
  supportCategoriesList,
  supportPrioritiesList,
  supportStatusesList,
  supportAssigneesList,
}

export const FACULTY_SUPPORT_STORAGE_KEY = 'campuslive_faculty_support_tickets'

export const initialFacultySupportTickets = initialUnifiedTickets
  .filter((t) => t.origin === 'faculty')
  .map(formatForFacultySupport)

function formatForFacultySupport(t) {
  const normalizedStatus = (t.status || 'Open').toUpperCase().replace(/\s+/g, '_')
  const ticketNum = t.ticketNumber?.startsWith('#') ? t.ticketNumber : `#${t.ticketNumber || t.id}`

  return {
    ...t,
    ticketNumber: ticketNum,
    user: t.user || (t.creator?.name ? `${t.creator.name} (${t.creator.role || 'Faculty'})` : 'Faculty Member'),
    userRole: t.userRole || t.creator?.role || 'Admin',
    status: normalizedStatus,
    messages: (t.messages || []).map((m) => ({
      ...m,
      message: m.message || m.text || '',
      text: m.text || m.message || '',
      time: m.time || m.timestamp || 'Just now',
      timestamp: m.timestamp || m.time || 'Just now',
    })),
  }
}

function normalizeFromFacultySupport(ft, original = {}) {
  // Map uppercase status back to standard Title Case status
  let status = 'Open'
  if (ft.status === 'ASSIGNED') status = 'Assigned'
  else if (ft.status === 'IN_PROGRESS') status = 'In Progress'
  else if (ft.status === 'RESOLVED') status = 'Resolved'
  else if (ft.status === 'CLOSED') status = 'Closed'
  else if (ft.status === 'OPEN') status = 'Open'
  else if (ft.status) {
    status = ft.status
  }

  const cleanTicketNumber = (ft.ticketNumber || ft.id).replace(/^#/, '')

  return {
    ...original,
    ...ft,
    id: ft.id || cleanTicketNumber,
    ticketNumber: cleanTicketNumber,
    origin: ft.origin || original.origin || 'faculty',
    status,
    messages: (ft.messages || []).map((m) => ({
      ...m,
      text: m.message || m.text || '',
      message: m.message || m.text || '',
      timestamp: m.time || m.timestamp || 'Just now',
      time: m.time || m.timestamp || 'Just now',
      isStaff: m.isStaff !== undefined ? m.isStaff : (m.senderRole === 'Admin' || m.senderRole === 'Super Admin' || m.senderRole === 'Support Admin'),
    })),
  }
}

/**
 * Get faculty tickets from unified store
 */
export function getStoredFacultySupportTickets() {
  const all = getStoredUnifiedTickets()
  const facultyTickets = all.filter((t) => t.origin === 'faculty')
  return facultyTickets.map(formatForFacultySupport)
}

/**
 * Save faculty tickets to unified store while preserving student and public tickets
 */
export function saveStoredFacultySupportTickets(facultyTickets) {
  const all = getStoredUnifiedTickets()
  const updatedMap = new Map(facultyTickets.map((t) => [t.id, t]))

  // Update existing items in unified store
  const merged = all.map((t) => {
    if (updatedMap.has(t.id)) {
      return normalizeFromFacultySupport(updatedMap.get(t.id), t)
    }
    return t
  })

  // Add any new faculty tickets
  facultyTickets.forEach((ft) => {
    if (!all.some((t) => t.id === ft.id)) {
      merged.unshift(normalizeFromFacultySupport(ft))
    }
  })

  saveStoredUnifiedTickets(merged)
}
