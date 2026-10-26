import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import PasswordInput from '../components/common/PasswordInput'
import {
  IconSettings,
  IconUser,
  IconBell,
  IconLock,
  IconCheck,
  IconClose,
  IconLogOut,
  IconAlertCircle,
  IconMail,
  IconChevronRight,
} from '../components/icons/Icons'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function StudentSettings() {
  const navigate = useNavigate()
  const { user, profile, isDemo, signOut } = useAuth()

  // Toast state
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Storage synchronization badge state: 'database' | 'local' | 'loading'
  const [storageMode, setStorageMode] = useState('loading')

  // 1. Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    activityAlerts: true,
    registrationUpdates: true,
    clubNotices: true,
    campusAdvisories: true,
    emailDigest: false,
  })

  // 2. Appearance Preference state
  const [themePreference, setThemePreference] = useState('light')
  const [interfaceDensity, setInterfaceDensity] = useState('comfortable')

  // 3. Security 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [revokedSessions, setRevokedSessions] = useState(false)

  // 4. Change Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // 5. Saving Preferences state
  const [isSavingPrefs, setIsSavingPrefs] = useState(false)

  // Profile data resolution (graceful fallback without assuming optional database columns)
  const studentName =
    profile?.fullName || profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const studentId =
    profile?.studentId || profile?.student_id || (profile?.staffId ? profile.staffId : 'CL-2024-8842')
  const studentEmail = profile?.email || user?.email || 'student@campus.edu'
  const department = profile?.department || 'Computer Science & Engineering'
  const course = profile?.course || 'B.Tech in Computer Engineering'
  const academicYear = profile?.academicYear || profile?.academic_year || '3rd Year'
  const academicProgram =
    course && academicYear ? `${course} (${academicYear})` : course || academicYear || 'B.Tech in Computer Engineering (3rd Year)'
  const avatarInitial = (studentName.trim().charAt(0) || 'S').toUpperCase()
  const profileImage = profile?.profileImage || profile?.profile_image

  /**
   * Loads preferences from backend API or local storage fallback on mount / identity change.
   */
  useEffect(() => {
    let ignore = false

    async function initializePreferences() {
      // A. Demo mode: read from local browser storage
      if (isDemo || user?.isDemo) {
        try {
          const local = localStorage.getItem('campuslive_student_prefs_demo')
          if (local) {
            const parsed = JSON.parse(local)
            if (!ignore) {
              if (parsed.notifications) {
                setNotifPrefs((prev) => ({ ...prev, ...parsed.notifications }))
              }
              if (parsed.appearance?.theme) {
                setThemePreference(parsed.appearance.theme)
              }
              if (parsed.appearance?.density) {
                setInterfaceDensity(parsed.appearance.density)
              }
              if (parsed.security?.twoFactorEnabled !== undefined) {
                setTwoFactorEnabled(parsed.security.twoFactorEnabled)
              }
            }
          }
        } catch {
          // Safe fallback
        }
        if (!ignore) setStorageMode('local')
        return
      }

      // B. Authenticated mode: Query Express backend /api/profile/preferences
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const token = session?.access_token

        if (token) {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 4000)

          const res = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          if (res.ok && !ignore) {
            const json = await res.json()
            if (json.preferences) {
              if (json.preferences.notifications) {
                setNotifPrefs((prev) => ({ ...prev, ...json.preferences.notifications }))
              }
              if (json.preferences.appearance?.theme) {
                setThemePreference(json.preferences.appearance.theme)
              }
              if (json.preferences.appearance?.density) {
                setInterfaceDensity(json.preferences.appearance.density)
              }
              if (json.preferences.security?.twoFactorEnabled !== undefined) {
                setTwoFactorEnabled(json.preferences.security.twoFactorEnabled)
              }

              setStorageMode(json.storage === 'database' ? 'database' : 'local')
              return
            }
          }
        }
      } catch (err) {
        console.warn('[StudentSettings] Notice: Using local preferences fallback:', err.message || err)
      }

      // C. Offline / local fallback for authenticated user
      if (!ignore) {
        try {
          const userKey = `campuslive_student_prefs_${user?.id || 'default'}`
          const local = localStorage.getItem(userKey)
          if (local) {
            const parsed = JSON.parse(local)
            if (parsed.notifications) {
              setNotifPrefs((prev) => ({ ...prev, ...parsed.notifications }))
            }
            if (parsed.appearance?.theme) {
              setThemePreference(parsed.appearance.theme)
            }
            if (parsed.appearance?.density) {
              setInterfaceDensity(parsed.appearance.density)
            }
            if (parsed.security?.twoFactorEnabled !== undefined) {
              setTwoFactorEnabled(parsed.security.twoFactorEnabled)
            }
          }
        } catch {
          // Safe fallback
        }
        setStorageMode('local')
      }
    }

    initializePreferences()

    return () => {
      ignore = true
    }
  }, [isDemo, user])

  /**
   * Persists preferences to backend API or local storage.
   */
  const handleSavePreferences = async (customNotifs = null, customAppearance = null, customSecurity = null) => {
    setIsSavingPrefs(true)
    const payload = {
      notifications: customNotifs || notifPrefs,
      appearance: customAppearance || { theme: themePreference, density: interfaceDensity },
      security: customSecurity !== null ? customSecurity : { twoFactorEnabled },
    }

    // 1. Demo mode: strictly localStorage
    if (isDemo || user?.isDemo) {
      try {
        localStorage.setItem('campuslive_student_prefs_demo', JSON.stringify(payload))
      } catch {
        // ignore
      }
      setStorageMode('local')
      setIsSavingPrefs(false)
      showToast('Preferences saved locally in browser (Demo mode).', 'info')
      return
    }

    // 2. Authenticated user: Send to /api/profile/preferences
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        const userKey = `campuslive_student_prefs_${user?.id || 'default'}`
        localStorage.setItem(userKey, JSON.stringify(payload))
        setStorageMode('local')
        setIsSavingPrefs(false)
        showToast('Preferences saved locally in browser storage.', 'info')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`)
      }

      const json = await res.json()
      if (json.storage === 'database') {
        setStorageMode('database')
        showToast('Preferences successfully saved and synced to database.', 'success')
      } else {
        // Fallback store active on server (database migration pending)
        const userKey = `campuslive_student_prefs_${user?.id || 'default'}`
        localStorage.setItem(userKey, JSON.stringify(payload))
        setStorageMode('local')
        showToast('Preferences saved locally (remote database migration pending).', 'info')
      }
    } catch (err) {
      console.warn('[StudentSettings] Error persisting preferences remotely:', err)
      // Resilient local persistence
      try {
        const userKey = `campuslive_student_prefs_${user?.id || 'default'}`
        localStorage.setItem(userKey, JSON.stringify(payload))
      } catch {
        // ignore
      }
      setStorageMode('local')
      showToast('Preferences saved locally to browser storage.', 'info')
    } finally {
      setIsSavingPrefs(false)
    }
  }

  // Toggle individual notification preferences
  const toggleNotifPref = (key) => {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(next)
    handleSavePreferences(next)
  }

  // Handle Appearance Theme selection
  const handleThemeChange = (theme) => {
    if (theme === 'dark') {
      showToast('Dark Theme is coming in the next release.', 'info')
      return
    }
    setThemePreference(theme)
    handleSavePreferences(null, { theme, density: interfaceDensity })
    showToast(`Theme set to ${theme === 'light' ? 'Light Mode' : 'System Default'}.`, 'info')
  }

  // Handle Appearance Density selection
  const handleDensityChange = (density) => {
    setInterfaceDensity(density)
    handleSavePreferences(null, { theme: themePreference, density })
    showToast(`Layout density set to ${density === 'comfortable' ? 'Comfortable' : 'Compact'}.`, 'info')
  }

  // Handle Two-Factor switch toggle
  const toggle2FA = () => {
    const next = !twoFactorEnabled
    setTwoFactorEnabled(next)
    handleSavePreferences(null, null, { twoFactorEnabled: next })
    showToast(
      next ? 'Two-step verification preference enabled.' : 'Two-step verification preference disabled.',
      'info'
    )
  }

  // Handle Real Supabase Auth Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    // 1. Client-side input validations
    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    // 2. Demo mode & unauthenticated safety guard
    if (isDemo || user?.isDemo || !user?.email) {
      setPasswordError(
        'Password changes are disabled in demo/offline mode. Please log in with a registered account.'
      )
      return
    }

    setIsUpdatingPassword(true)

    try {
      // Step A: Re-authenticate to verify current password credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect. Please verify your credentials and try again.')
        setIsUpdatingPassword(false)
        return
      }

      // Step B: Authenticated password update
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message || 'Failed to update password. Please try again.')
        setIsUpdatingPassword(false)
        return
      }

      // Step C: Success handling
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password updated successfully via Supabase Auth!')
      showToast('Password updated successfully via Supabase Auth!', 'success')
    } catch (err) {
      console.error('[StudentSettings] Exception updating password:', err)
      setPasswordError('An unexpected network error occurred while updating password. Please try again.')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // 6. Sign Out Handler
  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('[StudentSettings] Error signing out:', err)
    }
    navigate('/login')
  }

  return (
    <StudentLayout>
      <div className="space-y-6 pb-12">
        {/* Toast Notification Banner */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500'
                  : toast.type === 'info'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
            />
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Dismiss toast"
            >
              <IconClose className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Page Header */}
        <PageHeader
          title="Account Settings"
          subtitle="Manage your student account information, notification alerts, appearance, and security credentials."
          breadcrumbs={[
            { label: 'Home', path: '/' },
            { label: 'Student', path: '/student/dashboard' },
            { label: 'Settings' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT & CENTER COLUMN (2/3): Account Info, Notifications, Appearance, Security */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Account Information */}
            <Card>
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                      <IconUser className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Account & Profile Details
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your registered university account identity and primary contact.
                      </p>
                    </div>
                  </div>

                  <Link to="/student/profile">
                    <Button variant="outline" size="sm" className="text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={studentName}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg flex items-center justify-center ring-4 ring-white shadow-xs shrink-0">
                      {avatarInitial}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{studentName}</span>
                      <Badge variant="primary" size="sm">
                        {profile?.role ? profile.role.toUpperCase() : 'STUDENT'}
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">
                        ID: {studentId}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <IconMail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{studentEmail}</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-1">
                        <IconCheck className="w-2.5 h-2.5" />
                        Verified Institutional Email
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Department</span>
                    <span className="font-semibold text-slate-800">
                      {department}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Academic Program</span>
                    <span className="font-semibold text-slate-800">
                      {academicProgram}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Notification Preferences */}
            <Card>
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <IconBell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        Notification Preferences
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Control which notifications you receive across the Campus Live portal.
                      </p>
                    </div>
                  </div>

                  {/* Storage Persistence Indicator */}
                  <div className="flex items-center gap-2">
                    {storageMode === 'database' ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                        title="Preferences are synced to your database profile record"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Database Synced
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        title="Preferences are saved to local browser storage"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {isDemo ? 'Local Storage (Demo Mode)' : 'Local Storage (Migration Pending)'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Activity Alerts */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Activity & Event Announcements
                      </p>
                      <p className="text-xs text-slate-500">
                        Receive alerts when new workshops, competitions, and seminars are published.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs.activityAlerts}
                      onClick={() => toggleNotifPref('activityAlerts')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifPrefs.activityAlerts ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.activityAlerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Registration Updates */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Registration & Booking Confirmations
                      </p>
                      <p className="text-xs text-slate-500">
                        Instant notifications for seat approvals, venue updates, and schedule changes.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs.registrationUpdates}
                      onClick={() => toggleNotifPref('registrationUpdates')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifPrefs.registrationUpdates ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.registrationUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Club Notices */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Club Notices & Meeting Alerts
                      </p>
                      <p className="text-xs text-slate-500">
                        Updates, recruitments, and upcoming sessions from student clubs you follow.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs.clubNotices}
                      onClick={() => toggleNotifPref('clubNotices')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifPrefs.clubNotices ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.clubNotices ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Campus Advisories */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Campus Advisories & Official Circulars
                      </p>
                      <p className="text-xs text-slate-500">
                        Urgent institutional notifications, library schedules, and faculty notices.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs.campusAdvisories}
                      onClick={() => toggleNotifPref('campusAdvisories')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifPrefs.campusAdvisories ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.campusAdvisories ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Email Digest */}
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Weekly Activity Email Digest
                      </p>
                      <p className="text-xs text-slate-500">
                        Receive a consolidated Monday morning email of upcoming activities and registrations.
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={notifPrefs.emailDigest}
                      onClick={() => toggleNotifPref('emailDigest')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        notifPrefs.emailDigest ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.emailDigest ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isSavingPrefs}
                    onClick={() => handleSavePreferences()}
                  >
                    {isSavingPrefs ? 'Saving Preferences...' : 'Save Notification Preferences'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* 3. Appearance Preference */}
            <Card>
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <IconSettings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Appearance Preference
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customize how Campus Live looks on this computer.
                    </p>
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Light Theme */}
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        themePreference === 'light'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-4 h-4 rounded-full border border-slate-300 bg-white shadow-xs" />
                        {themePreference === 'light' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Light Mode
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Classic clean campus palette
                        </span>
                      </div>
                    </button>

                    {/* Dark Theme */}
                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-900 text-white text-left transition-all cursor-pointer flex flex-col justify-between h-24 opacity-85 hover:opacity-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-4 h-4 rounded-full border border-slate-600 bg-slate-800 shadow-xs" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Beta
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Dark Mode
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Gentle on the eyes at night
                        </span>
                      </div>
                    </button>

                    {/* System Theme */}
                    <button
                      type="button"
                      onClick={() => handleThemeChange('system')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                        themePreference === 'system'
                          ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-4 h-4 rounded-full border border-slate-300 bg-linear-to-r from-white to-slate-800 shadow-xs" />
                        {themePreference === 'system' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          System Default
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Syncs with operating system
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Interface Density */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Layout Density
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDensityChange('comfortable')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        interfaceDensity === 'comfortable'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Comfortable (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDensityChange('compact')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        interfaceDensity === 'compact'
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Compact View
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Security Section & Active Sessions */}
            <Card>
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Security & Active Sessions
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify multi-factor security and monitor active student sessions.
                    </p>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        Two-Step Verification (2FA)
                      </span>
                      <Badge variant={twoFactorEnabled ? 'success' : 'neutral'} size="sm">
                        {twoFactorEnabled ? 'Enabled' : 'Optional'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Receive an OTP on your verified institutional phone/email when signing in from an unfamiliar device.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={twoFactorEnabled}
                    onClick={toggle2FA}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Active Sessions List */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Current Signed-in Sessions
                  </span>
                  <div className="space-y-2.5">
                    {/* Current device */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-50" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800">
                            Windows PC · Google Chrome (Current Session)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Mumbai, Maharashtra, India · Active right now
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        This Device
                      </Badge>
                    </div>

                    {/* Secondary device */}
                    {!revokedSessions && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200/90 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">
                              Android 14 · Campus Live App
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Mumbai, Maharashtra, India · 2 hours ago
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRevokedSessions(true)
                            showToast('Other device session revoked.', 'info')
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          Revoke
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN (1/3): Change Password & Logout */}
          <div className="space-y-6">
            {/* 5. Change Password Card */}
            <Card>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      Change Password
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update your login password securely via Supabase Auth.
                    </p>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                    <IconCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  <PasswordInput
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    size="sm"
                    required
                    disabled={isUpdatingPassword}
                  />

                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    size="sm"
                    required
                    disabled={isUpdatingPassword}
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    size="sm"
                    required
                    disabled={isUpdatingPassword}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isUpdatingPassword}
                      className="w-full justify-center"
                    >
                      {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>

            {/* Quick Links Card */}
            <Card>
              <div className="p-5 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Quick Navigation
                </span>
                <div className="space-y-1.5 text-xs">
                  <Link
                    to="/student/profile"
                    className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium border border-transparent hover:border-slate-200"
                  >
                    <span>Full Student Profile</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    to="/student/notifications"
                    className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium border border-transparent hover:border-slate-200"
                  >
                    <span>Notification Center</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    to="/student/support"
                    className="flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium border border-transparent hover:border-slate-200"
                  >
                    <span>Help & Student Support</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </Card>

            {/* 6. Logout / Session Termination Card */}
            <Card className="border-rose-200/80 bg-rose-50/20">
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                    <IconLogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Sign Out
                    </h3>
                    <p className="text-xs text-slate-500">
                      End your current student session.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Signing out will close your active student session on this browser. You can sign back in at any time.
                </p>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-center cursor-pointer text-xs"
                >
                  <IconLogOut className="w-4 h-4" />
                  <span>Log Out of Campus Live</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
