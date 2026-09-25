/**
 * Support Data Module (Bridged to Unified Support Architecture)
 * Connects the Student Support portal to the single common support ticket system.
 */

import {
  initialUnifiedTickets,
  getStoredUnifiedTickets,
  saveStoredUnifiedTickets,
  UNIFIED_SUPPORT_EVENT_KEY,
  supportCategoriesList,
  supportPrioritiesList,
  supportStatusesList,
} from './unifiedSupportData.js'

export const supportCategories = supportCategoriesList
export const supportPriorities = supportPrioritiesList
export const supportStatuses = supportStatusesList

// Student initial tickets are the student-origin subset of the unified store
export const initialTickets = initialUnifiedTickets.filter((t) => t.origin === 'student')

export const SUPPORT_EVENT_KEY = UNIFIED_SUPPORT_EVENT_KEY

/**
 * Get student tickets from unified store
 */
export function getStoredSupportTickets() {
  const allTickets = getStoredUnifiedTickets()
  return allTickets.filter((t) => t.origin === 'student')
}

/**
 * Save student tickets to unified store while preserving faculty and public tickets
 */
export function saveStoredSupportTickets(studentTickets) {
  const allTickets = getStoredUnifiedTickets()
  const studentMap = new Map(studentTickets.map((t) => [t.id, t]))

  // Update existing tickets
  const merged = allTickets.map((t) => {
    if (studentMap.has(t.id)) {
      return { ...studentMap.get(t.id), origin: 'student' }
    }
    return t
  })

  // Add any brand new student tickets that weren't in allTickets yet
  studentTickets.forEach((st) => {
    if (!allTickets.some((t) => t.id === st.id)) {
      merged.unshift({ ...st, origin: 'student' })
    }
  })

  saveStoredUnifiedTickets(merged)
}
