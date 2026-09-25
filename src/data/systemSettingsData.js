/**
 * Super Admin System Settings Data Module
 * Manages institutional and platform-level configuration for Campus Live.
 */

export const SYSTEM_SETTINGS_STORAGE_KEY = 'campuslive_system_settings'
export const SYSTEM_SETTINGS_EVENT_KEY = 'campuslive_system_settings_updated'

export const defaultSystemSettings = {
  general: {
    platformName: 'Campus Live',
    tagline: 'Discover. Participate. Connect.',
    institutionName: 'KPGU',
    institutionEmail: 'info@kpgu.edu.in',
    supportEmail: 'support@campuslive.edu',
    timeZone: '(GMT+05:30) India Standard Time - Kolkata',
    academicYear: '2026 - 2027',
  },
  system: {
    maintenanceMode: false,
    allowStudentRegistration: true,
    allowActivityRegistration: true,
    allowClubJoining: true,
    enableInAppNotifications: true,
  },
  registration: {
    allowActivityRegistration: true,
    allowRegistrationCancellation: true,
    cancellationDeadline: '24 hours before activity start',
    allowPostDeadlineRegistration: false,
  },
  notifications: {
    enableInAppNotifications: true,
    enableActivityNotifications: true,
    enableRegistrationNotifications: true,
    enableSupportTicketNotifications: true,
    enableInternalAdminPanelNotifications: true,
  },
  support: {
    enableStudentSupport: true,
    enableFacultySupport: true,
    enablePublicHelpSupport: true,
    allowTicketReopening: true,
    defaultTicketPriority: 'Medium',
    defaultTicketAssignment: 'Super Admin',
  },
  security: {
    sessionTimeout: '1 hour',
    passwordPolicy: 'Strong (Minimum 8 characters with letters, numbers, and symbols)',
    requireStrongPasswords: true,
    maxLoginAttempts: '5 attempts',
    lockoutDuration: '30 minutes',
  },
}

/**
 * Retrieve system settings from localStorage or fallback to defaults
 */
export function getStoredSystemSettings() {
  try {
    const saved = localStorage.getItem(SYSTEM_SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        general: { ...defaultSystemSettings.general, ...parsed.general },
        system: { ...defaultSystemSettings.system, ...parsed.system },
        registration: { ...defaultSystemSettings.registration, ...parsed.registration },
        notifications: { ...defaultSystemSettings.notifications, ...parsed.notifications },
        support: { ...defaultSystemSettings.support, ...parsed.support },
        security: { ...defaultSystemSettings.security, ...parsed.security },
      }
    }
  } catch {
    // fallback
  }
  return defaultSystemSettings
}

/**
 * Save system settings to localStorage and dispatch update event
 */
export function saveStoredSystemSettings(settings) {
  try {
    localStorage.setItem(SYSTEM_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_EVENT_KEY, { detail: settings }))
  } catch {
    // ignore
  }
}

/**
 * Reset all frontend demo mock caches back to initial defaults
 */
export function resetFrontendDemoData() {
  try {
    localStorage.removeItem(SYSTEM_SETTINGS_STORAGE_KEY)
    localStorage.removeItem('campuslive_unified_support_tickets')
    localStorage.removeItem('campuslive_superadmin_notifications')
    localStorage.removeItem('campuslive_superadmin_registrations')
    localStorage.removeItem('campuslive_superadmin_activities')
    localStorage.removeItem('campuslive_superadmin_users')
    localStorage.removeItem('campuslive_superadmin_clubs')
    localStorage.removeItem('campuslive_faculty_support_tickets')

    window.dispatchEvent(new CustomEvent(SYSTEM_SETTINGS_EVENT_KEY, { detail: defaultSystemSettings }))
    window.dispatchEvent(new CustomEvent('campuslive_unified_support_updated', {}))
    window.dispatchEvent(new CustomEvent('campuslive_notifications_updated', {}))
  } catch {
    // ignore
  }
}
