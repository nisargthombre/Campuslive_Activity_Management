import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth, normalizeRole } from '../../context/AuthContext'
import LoadingState from './LoadingState'

/**
 * RoleRoute component: Restricts route access to users possessing specific authorized roles.
 * - Redirects unauthenticated users to the specified login page.
 * - Redirects authenticated but unauthorized users to their respective home dashboard.
 */
export default function RoleRoute({
  children,
  allowedRoles = [],
  unauthenticatedRedirect = '/login',
  loadingMessage = 'Checking permissions...',
}) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState fullScreen message={loadingMessage} />
  }

  // 1. Unauthenticated -> redirect to login with original location state
  if (!user) {
    return (
      <Navigate
        to={unauthenticatedRedirect}
        state={{ from: location }}
        replace
      />
    )
  }

  // 2. Resolve trusted role
  const rawRole = profile?.role || user?.user_metadata?.role || user?.role || ''
  const currentRole = normalizeRole(rawRole)
  const normalizedAllowed = allowedRoles.map(normalizeRole)

  // 3. Unauthorized role -> redirect to the user's appropriate default dashboard
  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(currentRole)) {
    const fallbackPath =
      currentRole === 'super_admin'
        ? '/admin/dashboard'
        : currentRole === 'admin'
        ? '/admin/dashboard'
        : currentRole === 'faculty'
        ? '/faculty/dashboard'
        : '/student/dashboard'

    return <Navigate to={fallbackPath} replace />
  }

  return children ? children : <Outlet />
}
