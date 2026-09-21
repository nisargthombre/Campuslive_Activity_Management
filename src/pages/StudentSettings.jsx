import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function StudentSettings() {
  const navigate = useNavigate()

  // Toast state
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // 1. Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState({
    activityAlerts: true,
    registrationUpdates: true,
    clubNotices: true,
    campusAdvisories: true,
    emailDigest: false,
  })

  const toggleNotifPref = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      showToast('Notification preference updated.', 'info')
      return next
    })
  }

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordError('')

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

    // Success mock update
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    showToast('Password updated successfully!', 'success')
  }

  // 5. Logout Handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('campuslive_user')
      localStorage.removeItem('campuslive_auth_session')
      sessionStorage.clear()
    } catch {
      // ignore
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
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-lg flex items-center justify-center ring-4 ring-white shadow-xs shrink-0">
                    N
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">Nisarg</span>
                      <Badge variant="primary" size="sm">
                        Student
                      </Badge>
                      <span className="text-xs font-medium text-slate-400">ID: CL-2024-8842</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <IconMail className="w-3.5 h-3.5 text-slate-400" />
                      <span>nisarg@campus.edu</span>
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
                      Computer Science & Engineering
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1">
                    <span className="text-slate-400 block font-medium">Academic Program</span>
                    <span className="font-semibold text-slate-800">
                      B.Tech in Computer Engineering (3rd Year)
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Notification Preferences */}
            <Card>
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
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
                        Registration & Attendance Confirmations
                      </p>
                      <p className="text-xs text-slate-500">
                        Instant notifications for seat approvals, venue updates, and participation check-ins.
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
                    onClick={() => showToast('All notification preferences saved.', 'success')}
                  >
                    Save Notification Preferences
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
                      onClick={() => {
                        setThemePreference('light')
                        showToast('Theme set to Light Mode.', 'info')
                      }}
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
                      onClick={() => {
                        showToast('Dark Theme is coming in the next release.', 'info')
                      }}
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
                      onClick={() => {
                        setThemePreference('system')
                        showToast('Theme set to System Default.', 'info')
                      }}
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
                      onClick={() => setInterfaceDensity('comfortable')}
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
                      onClick={() => setInterfaceDensity('compact')}
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
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled)
                      showToast(
                        twoFactorEnabled
                          ? 'Two-step verification disabled.'
                          : 'Two-step verification enabled.',
                        'info'
                      )
                    }}
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
                      Update your login password.
                    </p>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
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
                  />

                  <PasswordInput
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    size="sm"
                    required
                  />

                  <PasswordInput
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    size="sm"
                    required
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                    >
                      Update Password
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
