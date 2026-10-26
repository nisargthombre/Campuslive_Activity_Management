/**
 * Campus Live - Authentication & Role Utility Functions
 */

/**
 * Normalizes role strings to standard canonical tokens ('student', 'faculty', 'admin', 'super_admin').
 *
 * @param {string} role
 * @returns {string}
 */
export function normalizeRole(role) {
  if (!role || typeof role !== 'string') return ''
  const cleaned = role.toLowerCase().trim().replace(/[\s-]+/g, '_')
  if (cleaned === 'student') return 'student'
  if (cleaned === 'faculty') return 'faculty'
  if (cleaned === 'admin') return 'admin'
  if (cleaned === 'super_admin' || cleaned === 'superadmin') return 'super_admin'
  return cleaned
}
