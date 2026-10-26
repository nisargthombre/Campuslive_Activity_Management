import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingState from './LoadingState'

/**
 * ProtectedRoute component: Ensures a user has an active session before accessing a route.
 * Redirects unauthenticated users to the login route while preserving location state.
 */
export default function ProtectedRoute({
  children,
  redirectTo = '/login',
  loadingMessage = 'Verifying session...',
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState fullScreen message={loadingMessage} />
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return children ? children : <Outlet />
}
