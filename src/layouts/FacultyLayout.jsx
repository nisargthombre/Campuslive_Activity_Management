import BaseLayout from '../components/layout/BaseLayout'
import { facultyNav } from '../config/navigation'
import { useAuth } from '../context/AuthContext'

export default function FacultyLayout({ children }) {
  const { user, profile, loading } = useAuth()

  let localUser = null
  try {
    const raw = localStorage.getItem('campuslive_user')
    if (raw) localUser = JSON.parse(raw)
  } catch {
    // ignore
  }

  // Build the Navbar user data from the real authenticated profile
  const facultyUser = loading
    ? {
        name: 'Loading...',
        email: '',
        role: 'Faculty',
        avatar: '…',
      }
    : profile
    ? {
        name: profile.full_name || 'Faculty Member',
        email: profile.email || user?.email || '',
        role: profile.role || 'Faculty',
        avatar:
          profile.profile_image ||
          (profile.full_name ? profile.full_name.trim().charAt(0).toUpperCase() : 'F'),
      }
    : user
    ? {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Faculty Member',
        email: user.email || '',
        role: user.user_metadata?.role || 'Faculty',
        avatar: (user.user_metadata?.full_name || user.email || 'F').trim().charAt(0).toUpperCase(),
      }
    : localUser
    ? {
        name: localUser.name || 'Faculty Member',
        email: localUser.email || '',
        role: localUser.role || 'Faculty',
        avatar: localUser.avatar || 'F',
      }
    : null

  return (
    <BaseLayout user={facultyUser} navItems={facultyNav}>
      {children}
    </BaseLayout>
  )
}
