import { useState, useEffect } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import {
  IconSettings,
  IconCheck,
  IconClose,
  IconAlertCircle,
  IconLock,
  IconBell,
  IconSupport,
  IconClipboardCheck,
  IconClock,
  IconUsers,
} from '../components/icons/Icons'
import {
  getStoredSystemSettings,
  saveStoredSystemSettings,
  resetFrontendDemoData,
  SYSTEM_SETTINGS_EVENT_KEY,
  defaultSystemSettings,
} from '../data/systemSettingsData'

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: IconSettings },
  { id: 'system', label: 'System', icon: IconCheck },
  { id: 'registration', label: 'Registration', icon: IconClipboardCheck },
  { id: 'notifications', label: 'Notifications', icon: IconBell },
  { id: 'support', label: 'Support', icon: IconSupport },
  { id: 'security', label: 'Security', icon: IconLock },
  { id: 'danger', label: 'Danger Zone', icon: IconAlertCircle, isDanger: true },
]

export default function SuperAdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState(() => getStoredSystemSettings())
  const [toastMessage, setToastMessage] = useState(null)

  // Confirmation Modals State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [isResetDataModalOpen, setIsResetDataModalOpen] = useState(false)

  // Auto-dismiss toast
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Sync state if settings update externally
  useEffect(() => {
    const handleSync = () => {
      setSettings(getStoredSystemSettings())
    }
    window.addEventListener(SYSTEM_SETTINGS_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(SYSTEM_SETTINGS_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Generic Field Change Handler
  const handleFieldChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  // Toggle switch helper
  const handleToggle = (section, field) => {
    // Intercept Maintenance Mode toggle to show warning confirmation
    if (section === 'system' && field === 'maintenanceMode' && !settings.system.maintenanceMode) {
      setIsMaintenanceModalOpen(true)
      return
    }

    setSettings((prev) => {
      const nextVal = !prev[section][field]
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: nextVal,
        },
      }
      saveStoredSystemSettings(updated)
      return updated
    })
  }

  // Confirm Maintenance Mode Enable
  const handleConfirmMaintenanceMode = () => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        system: {
          ...prev.system,
          maintenanceMode: true,
        },
      }
      saveStoredSystemSettings(updated)
      return updated
    })
    setIsMaintenanceModalOpen(false)
    showToast('Maintenance Mode has been enabled.', 'info')
  }

  // Confirm Reset Demo Data
  const handleConfirmResetData = () => {
    resetFrontendDemoData()
    setSettings(defaultSystemSettings)
    setIsResetDataModalOpen(false)
    showToast('Frontend demo data has been reset to defaults.', 'success')
  }

  // Section Save Handler
  const handleSaveSection = (e) => {
    if (e) e.preventDefault()
    saveStoredSystemSettings(settings)
    showToast('Settings saved successfully.', 'success')
  }

  return (
    <SuperAdminLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500'
                : toastMessage.type === 'info'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          />
          <span>{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="System Settings"
        subtitle="System-level configuration for Campus Live. Manage platform parameters, security policies, and institutional defaults."
        breadcrumb={[
          { label: 'Home', to: '/admin/dashboard' },
          { label: 'Settings' },
        ]}
        action={
          <div className="flex items-center gap-2">
            {settings.system.maintenanceMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Maintenance Mode Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                All Systems Operational
              </span>
            )}
            <Button variant="primary" size="sm" onClick={handleSaveSection} className="gap-1.5">
              <IconCheck className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Navigation Pills */}
        <div className="lg:col-span-3">
          <Card className="p-2 border-slate-200/80 sticky top-24">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
              System Configuration
            </div>
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? tab.isDanger
                          ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                          : 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                        : tab.isDanger
                        ? 'text-rose-600 hover:bg-rose-50/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? tab.isDanger
                              ? 'text-rose-600'
                              : 'text-blue-600'
                            : tab.isDanger
                            ? 'text-rose-500'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </div>
                    {tab.id === 'system' && settings.system.maintenanceMode && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                )
              })}
            </nav>
          </Card>
        </div>

        {/* Right Side Settings Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* ========================================================= */}
          {/* 1. GENERAL SETTINGS                                       */}
          {/* ========================================================= */}
          {activeTab === 'general' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">General Platform Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure institutional identity, platform branding, and academic year settings.
                  </p>
                </div>
                <Badge variant="primary" size="sm">System Level</Badge>
              </div>

              <form onSubmit={handleSaveSection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Platform Name *
                    </label>
                    <Input
                      type="text"
                      value={settings.general.platformName}
                      onChange={(e) =>
                        handleFieldChange('general', 'platformName', e.target.value)
                      }
                      placeholder="e.g. Campus Live"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Display name shown across the student, faculty, and public portals.
                    </p>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Platform Tagline
                    </label>
                    <Input
                      type="text"
                      value={settings.general.tagline}
                      onChange={(e) =>
                        handleFieldChange('general', 'tagline', e.target.value)
                      }
                      placeholder="e.g. Discover. Participate. Connect."
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Header caption displayed on login and welcome screens.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institution Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Institution Name *
                    </label>
                    <Input
                      type="text"
                      value={settings.general.institutionName}
                      onChange={(e) =>
                        handleFieldChange('general', 'institutionName', e.target.value)
                      }
                      placeholder="e.g. KPGU"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      University or college accreditation title.
                    </p>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Academic Year *
                    </label>
                    <Select
                      value={settings.general.academicYear}
                      onChange={(e) =>
                        handleFieldChange('general', 'academicYear', e.target.value)
                      }
                      options={[
                        { label: '2025 - 2026', value: '2025 - 2026' },
                        { label: '2026 - 2027 (Active)', value: '2026 - 2027' },
                        { label: '2027 - 2028', value: '2027 - 2028' },
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Determines active semester rosters and activity scheduling periods.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institution Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Institution Email Address
                    </label>
                    <Input
                      type="email"
                      value={settings.general.institutionEmail}
                      onChange={(e) =>
                        handleFieldChange('general', 'institutionEmail', e.target.value)
                      }
                      placeholder="e.g. info@kpgu.edu.in"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Primary contact address published on institutional circulars.
                    </p>
                  </div>

                  {/* Support Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Support Desk Email
                    </label>
                    <Input
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) =>
                        handleFieldChange('general', 'supportEmail', e.target.value)
                      }
                      placeholder="e.g. support@campuslive.edu"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Recipient inbox for automated ticketing notifications.
                    </p>
                  </div>
                </div>

                {/* Time Zone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Platform Time Zone
                  </label>
                  <Select
                    value={settings.general.timeZone}
                    onChange={(e) =>
                      handleFieldChange('general', 'timeZone', e.target.value)
                    }
                    options={[
                      {
                        label: '(GMT+05:30) India Standard Time - Kolkata',
                        value: '(GMT+05:30) India Standard Time - Kolkata',
                      },
                      { label: '(GMT+00:00) UTC Universal Time', value: '(GMT+00:00) UTC Universal Time' },
                      { label: '(GMT-05:00) Eastern Time (US & Canada)', value: '(GMT-05:00) Eastern Time (US & Canada)' },
                      { label: '(GMT+08:00) Singapore / Perth', value: '(GMT+08:00) Singapore / Perth' },
                    ]}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    All activity countdowns, registration cutoffs, and timestamps format according to this zone.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Button type="submit" variant="primary" className="gap-2">
                    <IconCheck className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 2. SYSTEM SETTINGS                                        */}
          {/* ========================================================= */}
          {activeTab === 'system' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">System Controls & Master Toggles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Control global feature availability, account registration gates, and maintenance states.
                  </p>
                </div>
                <Badge variant="primary" size="sm">System Level</Badge>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Maintenance Mode */}
                <div className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        Maintenance Mode
                      </span>
                      {settings.system.maintenanceMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      When enabled, displays a scheduled maintenance advisory screen for all non-admin users. Requires confirmation before enabling.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.system.maintenanceMode}
                    onClick={() => handleToggle('system', 'maintenanceMode')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.system.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.system.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Student Registration */}
                <div className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Student Account Registration
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Enables prospective and enrolled students to register new student accounts on the portal. Disabling this restricts access to invited students only.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.system.allowStudentRegistration}
                    onClick={() => handleToggle('system', 'allowStudentRegistration')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.system.allowStudentRegistration ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.system.allowStudentRegistration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Activity Registration */}
                <div className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Activity Registration (Global Switch)
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      System-wide master toggle governing whether students can register for upcoming campus activities, workshops, competitions, and seminars.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.system.allowActivityRegistration}
                    onClick={() => handleToggle('system', 'allowActivityRegistration')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.system.allowActivityRegistration ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.system.allowActivityRegistration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Club Joining */}
                <div className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Club Membership Requests
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Permits students to browse registered campus chapters and submit membership applications to club leadership and faculty advisors.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.system.allowClubJoining}
                    onClick={() => handleToggle('system', 'allowClubJoining')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.system.allowClubJoining ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.system.allowClubJoining ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable In-App Notifications */}
                <div className="py-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable System-Wide In-App Notifications
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Controls delivery of real-time notification bells, unread counters, and instant toast alerts across all portals.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.system.enableInAppNotifications}
                    onClick={() => handleToggle('system', 'enableInAppNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.system.enableInAppNotifications ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.system.enableInAppNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <Button variant="primary" onClick={handleSaveSection} className="gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 3. REGISTRATION SETTINGS                                  */}
          {/* ========================================================= */}
          {activeTab === 'registration' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Activity Registration Policies</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define system rules for registration signups, cancellation windows, and coordinator walk-ins.
                  </p>
                </div>
                <Badge variant="primary" size="sm">Registration Rules</Badge>
              </div>

              <div className="divide-y divide-slate-100 space-y-2">
                {/* Allow students to register */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Students to Register for Activities
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Enables the 'Register Now' button on activity detail cards for eligible students across departments.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.registration.allowActivityRegistration}
                    onClick={() => handleToggle('registration', 'allowActivityRegistration')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.registration.allowActivityRegistration ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.registration.allowActivityRegistration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow students to cancel registrations */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Students to Cancel Registrations
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Allows students to cancel active registrations from their 'My Registrations' dashboard, liberating seats for peers.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.registration.allowRegistrationCancellation}
                    onClick={() => handleToggle('registration', 'allowRegistrationCancellation')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.registration.allowRegistrationCancellation ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.registration.allowRegistrationCancellation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Registration cancellation deadline */}
                <div className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block mb-1">
                        Registration Cancellation Deadline
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Sets the cutoff duration after which students cannot cancel without faculty coordinator permission.
                      </p>
                    </div>
                    <div>
                      <Select
                        value={settings.registration.cancellationDeadline}
                        onChange={(e) =>
                          handleFieldChange('registration', 'cancellationDeadline', e.target.value)
                        }
                        options={[
                          { label: '12 hours before activity start', value: '12 hours before activity start' },
                          { label: '24 hours before activity start (Recommended)', value: '24 hours before activity start' },
                          { label: '48 hours before activity start', value: '48 hours before activity start' },
                          { label: 'Until activity start time', value: 'Until activity start time' },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* Allow registration after deadline */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Registration After Official Deadline (Faculty Override)
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Permits authorized faculty coordinators and Super Admins to manually register walk-in attendees even after registration has formally closed.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.registration.allowPostDeadlineRegistration}
                    onClick={() => handleToggle('registration', 'allowPostDeadlineRegistration')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.registration.allowPostDeadlineRegistration ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.registration.allowPostDeadlineRegistration ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <Button variant="primary" onClick={handleSaveSection} className="gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 4. NOTIFICATION SETTINGS                                  */}
          {/* ========================================================= */}
          {activeTab === 'notifications' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Notification Delivery Channels</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure institutional notification types, delivery triggers, and internal panel segregation.
                  </p>
                </div>
                <Badge variant="primary" size="sm">Notification Rules</Badge>
              </div>

              {/* Crucial Architecture Rule Alert */}
              <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200/70 flex items-start gap-3 text-xs text-blue-900">
                <IconAlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-950">
                    Important Architectural Rule: Internal Admin Panel Notifications
                  </p>
                  <p className="text-blue-800 leading-relaxed">
                    Internal Admin Panel notifications are strictly reserved for Admin and Faculty users who manage the platform. Students never receive or see Internal Admin Panel notifications under any circumstances.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Enable In-App Notifications */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable In-App Notifications
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Master toggle controlling top-bar bell badges, toast banners, and the unified notification center.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications.enableInAppNotifications}
                    onClick={() => handleToggle('notifications', 'enableInAppNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.notifications.enableInAppNotifications ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.notifications.enableInAppNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Activity Notifications */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Activity & Event Announcements
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Dispatches automatic notices to students and faculty whenever new activities are scheduled or updated.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications.enableActivityNotifications}
                    onClick={() => handleToggle('notifications', 'enableActivityNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.notifications.enableActivityNotifications ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.notifications.enableActivityNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Registration Notifications */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Registration Status Notifications
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Sends confirmation receipts, seat verification updates, and cancellation acknowledgments.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications.enableRegistrationNotifications}
                    onClick={() => handleToggle('notifications', 'enableRegistrationNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.notifications.enableRegistrationNotifications ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.notifications.enableRegistrationNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Support Ticket Notifications */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Support Ticket Notifications
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Alerts ticket creators and support personnel immediately when replies or status changes are made.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications.enableSupportTicketNotifications}
                    onClick={() => handleToggle('notifications', 'enableSupportTicketNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.notifications.enableSupportTicketNotifications ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.notifications.enableSupportTicketNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Internal Admin Panel Notifications */}
                <div className="py-3.5 flex items-start justify-between gap-4 bg-slate-50/70 p-3 rounded-xl mt-2 border border-slate-200/80">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Enable Internal Admin Panel Notifications
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                        Admin Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                      Dedicated administrative channel for platform maintenance circulars, staff meeting agendas, and institutional policy updates.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.notifications.enableInternalAdminPanelNotifications}
                    onClick={() => handleToggle('notifications', 'enableInternalAdminPanelNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.notifications.enableInternalAdminPanelNotifications ? 'bg-purple-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.notifications.enableInternalAdminPanelNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <Button variant="primary" onClick={handleSaveSection} className="gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 5. SUPPORT SETTINGS                                       */}
          {/* ========================================================= */}
          {activeTab === 'support' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unified Support & Helpdesk Policies</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure ticket routing, public inquiries handling, and default queue assignment parameters.
                  </p>
                </div>
                <Badge variant="primary" size="sm">Helpdesk Rules</Badge>
              </div>

              <div className="divide-y divide-slate-100 space-y-2">
                {/* Enable Student Support */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Student Support Portal
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Permits students to file support tickets and participate in conversation threads at /student/support.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.support.enableStudentSupport}
                    onClick={() => handleToggle('support', 'enableStudentSupport')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.support.enableStudentSupport ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.support.enableStudentSupport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Admin/Faculty Support */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Admin / Faculty Support Desk
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Enables faculty coordinators and department heads to raise equipment, roster, and technical issues at /faculty/support.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.support.enableFacultySupport}
                    onClick={() => handleToggle('support', 'enableFacultySupport')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.support.enableFacultySupport ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.support.enableFacultySupport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Enable Public Help & Support */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enable Public Help & Support (/help-support)
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Activates the public contact desk for prospective students, parents, and visiting industry guests.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.support.enablePublicHelpSupport}
                    onClick={() => handleToggle('support', 'enablePublicHelpSupport')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.support.enablePublicHelpSupport ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.support.enablePublicHelpSupport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Allow Ticket Reopening */}
                <div className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Allow Ticket Reopening
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Permits students and faculty to reopen resolved tickets by submitting a subsequent conversation message within 7 days.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.support.allowTicketReopening}
                    onClick={() => handleToggle('support', 'allowTicketReopening')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.support.allowTicketReopening ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.support.allowTicketReopening ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Priority & Assignment */}
                <div className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Default Ticket Priority
                      </label>
                      <Select
                        value={settings.support.defaultTicketPriority}
                        onChange={(e) =>
                          handleFieldChange('support', 'defaultTicketPriority', e.target.value)
                        }
                        options={[
                          { label: 'Low', value: 'Low' },
                          { label: 'Medium (Standard)', value: 'Medium' },
                          { label: 'High', value: 'High' },
                          { label: 'Urgent', value: 'Urgent' },
                        ]}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Applied to new inquiries when creators do not select a priority.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Default Ticket Assignment
                      </label>
                      <Select
                        value={settings.support.defaultTicketAssignment}
                        onChange={(e) =>
                          handleFieldChange('support', 'defaultTicketAssignment', e.target.value)
                        }
                        options={[
                          { label: 'Super Admin', value: 'Super Admin' },
                          { label: 'Support Admin', value: 'Support Admin' },
                          { label: 'Prof. David Vance', value: 'Prof. David Vance' },
                          { label: 'Dr. Sarah Jenkins', value: 'Dr. Sarah Jenkins' },
                          { label: 'Unassigned', value: 'Unassigned' },
                        ]}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Staff queue assigned when tickets are created without explicit routing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <Button variant="primary" onClick={handleSaveSection} className="gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 6. SECURITY SETTINGS                                      */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <Card className="p-6 border-slate-200/80 shadow-2xs">
              <div className="pb-4 mb-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">System Security & Access Controls</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure institutional authentication thresholds, session life-cycles, and brute-force defenses.
                  </p>
                </div>
                <Badge variant="primary" size="sm">Security Policy</Badge>
              </div>

              {/* Security Privacy Notice */}
              <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-700">
                <IconLock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    Cryptographic Privacy Protection
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    User passwords are irreversibly hashed and protected with cryptographic salt. In compliance with security standards, existing user passwords are never stored in plaintext and cannot be viewed by any administrator.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Session Timeout */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Inactivity Session Timeout
                    </label>
                    <Select
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        handleFieldChange('security', 'sessionTimeout', e.target.value)
                      }
                      options={[
                        { label: '15 minutes', value: '15 minutes' },
                        { label: '30 minutes', value: '30 minutes' },
                        { label: '1 hour (Standard)', value: '1 hour' },
                        { label: '4 hours', value: '4 hours' },
                        { label: '8 hours', value: '8 hours' },
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Automatically logs out idle users to prevent unauthorized browser access.
                    </p>
                  </div>

                  {/* Password Policy */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      System Password Complexity Policy
                    </label>
                    <Select
                      value={settings.security.passwordPolicy}
                      onChange={(e) =>
                        handleFieldChange('security', 'passwordPolicy', e.target.value)
                      }
                      options={[
                        {
                          label: 'Standard (Minimum 8 characters)',
                          value: 'Standard (Minimum 8 characters)',
                        },
                        {
                          label: 'Strong (Minimum 8 characters with letters, numbers, and symbols)',
                          value: 'Strong (Minimum 8 characters with letters, numbers, and symbols)',
                        },
                        {
                          label: 'High Security (Minimum 12 characters with mixed case & symbols)',
                          value: 'High Security (Minimum 12 characters with mixed case & symbols)',
                        },
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enforced during account registration and password resets.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Maximum Login Attempts */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Maximum Failed Login Attempts
                    </label>
                    <Select
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        handleFieldChange('security', 'maxLoginAttempts', e.target.value)
                      }
                      options={[
                        { label: '3 attempts', value: '3 attempts' },
                        { label: '5 attempts (Recommended)', value: '5 attempts' },
                        { label: '10 attempts', value: '10 attempts' },
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Threshold before triggering temporary account lockout defense.
                    </p>
                  </div>

                  {/* Lockout Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Lockout Duration
                    </label>
                    <Select
                      value={settings.security.lockoutDuration}
                      onChange={(e) =>
                        handleFieldChange('security', 'lockoutDuration', e.target.value)
                      }
                      options={[
                        { label: '15 minutes', value: '15 minutes' },
                        { label: '30 minutes (Standard)', value: '30 minutes' },
                        { label: '1 hour', value: '1 hour' },
                        { label: '24 hours', value: '24 hours' },
                      ]}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Duration an account remains suspended after exceeding failed attempts.
                    </p>
                  </div>
                </div>

                {/* Require Strong Passwords Toggle */}
                <div className="py-3.5 flex items-start justify-between gap-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-slate-900">
                      Enforce Strong Passwords
                    </span>
                    <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                      Requires at least one uppercase letter, one number, and one special character for all account credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.security.requireStrongPasswords}
                    onClick={() => handleToggle('security', 'requireStrongPasswords')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      settings.security.requireStrongPasswords ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        settings.security.requireStrongPasswords ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Section 11: Production Backend Security Concept Callout */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">
                    Production Backend Security Architecture Note:
                  </span>
                  <p className="leading-relaxed">
                    Settings must be accessible only to authorized Super Admin users. Frontend hiding is not security; backend authorization and Supabase Row Level Security (RLS) / server-side verification must enforce administrative permissions.
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
                <Button variant="primary" onClick={handleSaveSection} className="gap-2">
                  <IconCheck className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================= */}
          {/* 7. DANGER ZONE                                            */}
          {/* ========================================================= */}
          {activeTab === 'danger' && (
            <Card className="p-6 border-rose-200 shadow-2xs bg-rose-50/20">
              <div className="pb-4 mb-6 border-b border-rose-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                    <IconAlertCircle className="w-5 h-5 text-rose-600" />
                    Danger Zone
                  </h3>
                  <p className="text-xs text-rose-700/80 mt-0.5">
                    Critical administrative controls affecting platform availability and demonstration datasets.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  Restricted Access
                </span>
              </div>

              <div className="space-y-4">
                {/* Maintenance Mode Action */}
                <div className="p-4 rounded-xl bg-white border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Institutional Maintenance Mode
                      </span>
                      {settings.system.maintenanceMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Currently Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                      Suspends active portal access for students and faculty while administrators perform scheduled maintenance or upgrades.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={settings.system.maintenanceMode ? 'outline' : 'danger'}
                    size="sm"
                    onClick={() => {
                      if (settings.system.maintenanceMode) {
                        handleToggle('system', 'maintenanceMode')
                        showToast('Maintenance Mode has been deactivated.', 'info')
                      } else {
                        setIsMaintenanceModalOpen(true)
                      }
                    }}
                    className="shrink-0"
                  >
                    {settings.system.maintenanceMode ? 'Deactivate Maintenance' : 'Enable Maintenance Mode'}
                  </Button>
                </div>

                {/* Reset Mock Demo Data */}
                <div className="p-4 rounded-xl bg-white border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900">
                      Reset Frontend Demo Data
                    </span>
                    <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                      Resets local demo data (support tickets, registrations, clubs, and settings) back to the clean initial state. Real database data is unaffected.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setIsResetDataModalOpen(true)}
                    className="shrink-0"
                  >
                    Reset Mock Data
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Maintenance Mode */}
      {isMaintenanceModalOpen && (
        <Modal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          title="Enable Institutional Maintenance Mode?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <IconAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Enabling Maintenance Mode will display a scheduled maintenance screen for all non-admin users. Only authorized Super Admin accounts will retain portal access.
              </p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Do you wish to proceed and activate system maintenance?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaintenanceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmMaintenanceMode}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Confirm & Enable
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Reset Mock Demo Data */}
      {isResetDataModalOpen && (
        <Modal
          isOpen={isResetDataModalOpen}
          onClose={() => setIsResetDataModalOpen(false)}
          title="Reset Frontend Demo Data?"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <IconAlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This action will reset the current frontend demo data across all modules (support tickets, registrations, notifications, and settings) back to defaults. Continue?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetDataModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmResetData}
              >
                Confirm Reset
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
