import BaseLayout from '../components/layout/BaseLayout'
import { adminNav } from '../config/navigation'
import { useAuth } from '../context/AuthContext'

export default function SuperAdminLayout({ children }) {
  const { user, profile, loading } = useAuth()

  let localUser = null
  try {
    const raw = localStorage.getItem('campuslive_user')
    if (raw) localUser = JSON.parse(raw)
  } catch {
    // ignore
  }

  const adminUser = loading
    ? {
        name: 'Loading...',
        email: '',
        role: 'Super Admin',
        avatar: '…',
      }
    : profile
    ? {
        name: profile.full_name || profile.fullName || 'Super Admin',
        email: profile.email || user?.email || '',
        role: profile.role || 'Super Admin',
        avatar:
          profile.profile_image ||
          (profile.full_name ? profile.full_name.trim().charAt(0).toUpperCase() : 'SA'),
      }
    : user
    ? {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Super Admin',
        email: user.email || '',
        role: user.user_metadata?.role || 'Super Admin',
        avatar: (user.user_metadata?.full_name || user.email || 'SA').trim().charAt(0).toUpperCase(),
      }
    : localUser
    ? {
        name: localUser.name || 'Super Admin',
        email: localUser.email || '',
        role: localUser.role || 'Super Admin',
        avatar: localUser.avatar || 'SA',
      }
    : null

  return (
    <BaseLayout user={adminUser} navItems={adminNav}>
      {children}
    </BaseLayout>
  )
}
