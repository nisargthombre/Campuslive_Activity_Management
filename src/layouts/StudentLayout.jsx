import { useState, useEffect, useMemo } from 'react'
import BaseLayout from '../components/layout/BaseLayout'
import { studentNav } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import {
  getUnreadNotificationCount,
  NOTIFICATIONS_EVENT_KEY,
} from '../data/notificationsData'

export default function StudentLayout({ children }) {
  const { user, profile, loading } = useAuth()

  // Build the Navbar user data from the real authenticated profile or localUser fallback
  const studentUser = useMemo(() => {
    if (loading) {
      return {
        name: 'Loading...',
        email: '',
        role: 'Student',
        avatar: '…',
      }
    }
    if (profile) {
      return {
        id: profile.id || user?.id,
        name: profile.full_name || profile.fullName || 'Student',
        fullName: profile.full_name || profile.fullName || 'Student',
        email: profile.email || user?.email || '',
        role: profile.role || 'Student',
        studentId: profile.student_id || profile.studentId,
        department: profile.department,
        course: profile.course,
        academicYear: profile.academic_year || profile.academicYear,
        avatar:
          profile.profile_image ||
          profile.profileImage ||
          (profile.full_name || profile.fullName
            ? (profile.full_name || profile.fullName).trim().charAt(0).toUpperCase()
            : 'S'),
      }
    }
    if (user) {
      return {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        role: user.user_metadata?.role || 'Student',
        avatar: (user.user_metadata?.full_name || user.email || 'S').trim().charAt(0).toUpperCase(),
      }
    }
    try {
      const raw = localStorage.getItem('campuslive_user')
      if (raw) {
        const localUser = JSON.parse(raw)
        return {
          id: localUser.id || 'demo-user',
          name: localUser.name || 'Student',
          fullName: localUser.name || 'Student',
          email: localUser.email || '',
          role: localUser.role || 'Student',
          department: localUser.department,
          avatar: localUser.avatar || 'S',
        }
      }
    } catch {
      // ignore
    }
    return null
  }, [loading, profile, user])

  // Revision token to synchronize unread count across notification events
  const [syncToken, setSyncToken] = useState(0)

  const unreadCount = useMemo(() => {
    return studentUser ? getUnreadNotificationCount(studentUser, 'student') : 0
  }, [studentUser, syncToken])

  // Subscribe to notification event updates
  useEffect(() => {
    const handleSync = () => {
      setSyncToken((t) => t + 1)
    }

    window.addEventListener(NOTIFICATIONS_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const dynamicNav = useMemo(() => {
    return studentNav.map((item) => {
      if (item.path === '/student/notifications') {
        return {
          ...item,
          badge: unreadCount > 0 ? String(unreadCount) : null,
        }
      }
      return item
    })
  }, [unreadCount])

  return (
    <BaseLayout user={studentUser} navItems={dynamicNav}>
      {children}
    </BaseLayout>
  )
}
