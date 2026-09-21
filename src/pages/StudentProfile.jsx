import { useState } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import {
  IconCheck,
  IconClose,
  IconLinkedIn,
  IconGitHub,
  IconGlobe,
  IconLink,
  IconCamera,
  IconLock,
  IconEdit,
  IconMail,
  IconAlertCircle,
} from '../components/icons/Icons'
import { initialProfileData } from '../data/profileData'

// URL validation helper function
function isValidUrl(string) {
  if (!string || !string.trim()) return true
  const s = string.trim()
  try {
    const formatted = s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`
    const parsed = new URL(formatted)
    return Boolean(parsed.hostname && parsed.hostname.includes('.'))
  } catch {
    return false
  }
}

// Normalize URL for external opening
function normalizeUrl(string) {
  if (!string || !string.trim()) return '#'
  const s = string.trim()
  return s.startsWith('http://') || s.startsWith('https://') ? s : `https://${s}`
}

export default function StudentProfile() {
  // Main profile state
  const [profile, setProfile] = useState(initialProfileData)
  const [toast, setToast] = useState(null)

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)

  // Edit Profile Form State
  const [editName, setEditName] = useState(profile.name)
  const [editPhone, setEditPhone] = useState(profile.phone)
  const [editAvatarText, setEditAvatarText] = useState(profile.avatarText)
  const [editLinkedin, setEditLinkedin] = useState(profile.socialLinks.linkedin)
  const [editGithub, setEditGithub] = useState(profile.socialLinks.github)
  const [editPortfolio, setEditPortfolio] = useState(profile.socialLinks.portfolio)
  const [editOther, setEditOther] = useState(profile.socialLinks.other)
  const [editError, setEditError] = useState('')

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Open Edit Profile modal with fresh state
  const handleOpenEdit = () => {
    setEditName(profile.name)
    setEditPhone(profile.phone)
    setEditAvatarText(profile.avatarText)
    setEditLinkedin(profile.socialLinks.linkedin)
    setEditGithub(profile.socialLinks.github)
    setEditPortfolio(profile.socialLinks.portfolio)
    setEditOther(profile.socialLinks.other)
    setEditError('')
    setIsEditOpen(true)
  }

  // Save Edit Profile Changes
  const handleSaveProfile = (e) => {
    e.preventDefault()

    // Required fields validation
    if (!editName.trim()) {
      setEditError('Full Name is required.')
      return
    }
    if (!editPhone.trim()) {
      setEditError('Phone Number is required.')
      return
    }

    // Optional social links URL validation
    if (!isValidUrl(editLinkedin)) {
      setEditError('Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).')
      return
    }
    if (!isValidUrl(editGithub)) {
      setEditError('Please enter a valid GitHub URL (e.g. https://github.com/username).')
      return
    }
    if (!isValidUrl(editPortfolio)) {
      setEditError('Please enter a valid Portfolio URL (e.g. https://username.dev).')
      return
    }
    if (!isValidUrl(editOther)) {
      setEditError('Please enter a valid website URL for Other Link.')
      return
    }

    // Update Profile State
    setProfile((prev) => ({
      ...prev,
      name: editName.trim(),
      phone: editPhone.trim(),
      avatarText:
        editAvatarText.trim().toUpperCase().slice(0, 2) ||
        editName.trim().slice(0, 2).toUpperCase(),
      socialLinks: {
        linkedin: editLinkedin.trim(),
        github: editGithub.trim(),
        portfolio: editPortfolio.trim(),
        other: editOther.trim(),
      },
    }))

    setIsEditOpen(false)
    setEditError('')
    showToast('Profile information updated successfully!', 'success')
  }

  // Change Password Submit
  const handleSavePassword = (e) => {
    e.preventDefault()

    if (!currentPassword) {
      setPasswordError('Please enter your current password.')
      return
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.')
      return
    }

    // Reset fields & close
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setIsPasswordOpen(false)
    showToast('Password changed successfully!', 'success')
  }

  // Avatar presets for quick photo selector
  const avatarPresets = ['AR', 'AL', 'RV', 'ST', 'DEV', 'CS']

  return (
    <StudentLayout>
      {/* Toast Notification */}
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
            className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Profile"
        subtitle="Manage your student account, academic records, and professional profiles."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Profile' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPasswordOpen(true)}
              className="text-xs gap-1.5"
              icon={<IconLock className="w-3.5 h-3.5" />}
            >
              Change Password
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenEdit}
              className="text-xs gap-1.5 shadow-2xs"
              icon={<IconEdit className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Profile Header Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/70 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            {/* Avatar with Change Photo Trigger */}
            <div className="relative group shrink-0">
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-2xl md:text-3xl flex items-center justify-center shadow-md tracking-wider transition-transform group-hover:scale-102"
                aria-label={`${profile.name} avatar`}
              >
                {profile.avatarText}
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoOpen(true)}
                title="Change Photo"
                className="absolute -bottom-1 -right-1 p-1.5 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <IconCamera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {profile.name}
                </h1>
                <Badge variant="primary" size="sm" className="font-semibold">
                  {profile.role}
                </Badge>
                <Badge variant="success" size="sm">
                  <IconCheck className="w-3 h-3 mr-1 inline text-emerald-600" />
                  {profile.accountStatus}
                </Badge>
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Student ID: <span className="font-bold text-slate-700">{profile.studentId}</span>
              </div>

              <div className="text-xs text-slate-600">
                <span>{profile.course}</span> • <span>{profile.year}</span>
              </div>

              <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 pt-0.5">
                <IconMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Mobile/Header */}
          <div className="flex sm:hidden w-full items-center gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsPasswordOpen(true)}
              className="text-xs"
            >
              Password
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={handleOpenEdit}
              className="text-xs"
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal, Academic, and Social Links (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your primary identification and contact details
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenEdit}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Full Name</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{profile.name}</div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Email Address</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate" title={profile.email}>
                  {profile.email}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Phone Number</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{profile.phone}</div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Student ID</div>
                <div className="text-sm font-mono font-semibold text-slate-900 mt-0.5">
                  {profile.studentId}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Academic Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional enrollment records verified by the academic registrar
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                Official Record
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 sm:col-span-2">
                <div className="text-[11px] font-medium text-slate-500">Department</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {profile.department}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Course / Program</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{profile.course}</div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Academic Year</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{profile.year}</div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Division / Class</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {profile.division}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="text-[11px] font-medium text-slate-500">Enrollment Year</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {profile.enrollmentYear}
                </div>
              </div>
            </div>
          </div>

          {/* Professional & Social Links Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Professional & Social Links
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  External portfolio, coding repositories, and professional networks
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenEdit}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Update Links
              </Button>
            </div>

            <div className="space-y-3">
              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <IconLinkedIn className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">LinkedIn Profile</div>
                    {profile.socialLinks.linkedin ? (
                      <span className="text-[11px] text-slate-500 truncate block">
                        {profile.socialLinks.linkedin}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                    )}
                  </div>
                </div>

                {profile.socialLinks.linkedin && (
                  <a
                    href={normalizeUrl(profile.socialLinks.linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <span>Visit</span>
                    <span className="text-slate-400">&rarr;</span>
                  </a>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <IconGitHub className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">GitHub Profile</div>
                    {profile.socialLinks.github ? (
                      <span className="text-[11px] text-slate-500 truncate block">
                        {profile.socialLinks.github}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                    )}
                  </div>
                </div>

                {profile.socialLinks.github && (
                  <a
                    href={normalizeUrl(profile.socialLinks.github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <span>Visit</span>
                    <span className="text-slate-400">&rarr;</span>
                  </a>
                )}
              </div>

              {/* Portfolio */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <IconGlobe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">Portfolio Website</div>
                    {profile.socialLinks.portfolio ? (
                      <span className="text-[11px] text-slate-500 truncate block">
                        {profile.socialLinks.portfolio}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                    )}
                  </div>
                </div>

                {profile.socialLinks.portfolio && (
                  <a
                    href={normalizeUrl(profile.socialLinks.portfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <span>Visit</span>
                    <span className="text-slate-400">&rarr;</span>
                  </a>
                )}
              </div>

              {/* Other Link */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <IconLink className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900">Other Link / Blog</div>
                    {profile.socialLinks.other ? (
                      <span className="text-[11px] text-slate-500 truncate block">
                        {profile.socialLinks.other}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                    )}
                  </div>
                </div>

                {profile.socialLinks.other && (
                  <a
                    href={normalizeUrl(profile.socialLinks.other)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                  >
                    <span>Visit</span>
                    <span className="text-slate-400">&rarr;</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Image, Account Info, Security (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Image & Avatar Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 text-center">
            <h3 className="text-sm font-semibold text-slate-900 text-left uppercase tracking-wider">
              Profile Photo
            </h3>

            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md mb-3">
                {profile.avatarText}
              </div>

              <div className="text-xs font-semibold text-slate-900">{profile.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">{profile.studentId}</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsPhotoOpen(true)}
              className="text-xs gap-1.5"
              icon={<IconCamera className="w-3.5 h-3.5" />}
            >
              Change Avatar
            </Button>
          </div>

          {/* Account Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Account Information
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Account Status</span>
                <Badge variant="success" size="sm">
                  {profile.accountStatus}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                <span className="text-slate-500 font-medium">Role</span>
                <Badge variant="primary" size="sm">
                  {profile.role}
                </Badge>
              </div>

              <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-0.5">
                <span className="text-slate-500 font-medium block text-[11px]">
                  Account Created
                </span>
                <span className="font-semibold text-slate-800">{profile.accountCreated}</span>
              </div>

              <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-0.5">
                <span className="text-slate-500 font-medium block text-[11px]">
                  Last Portal Login
                </span>
                <span className="font-semibold text-slate-800">{profile.lastLogin}</span>
              </div>
            </div>
          </div>

          {/* Security & Password Quick Card */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <IconLock className="w-4 h-4 text-blue-600" />
              <span>Password & Security</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ensure your student credentials remain safe. Change your password periodically or after accessing shared campus terminals.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => setIsPasswordOpen(true)}
              className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setEditError('')
          }}
          title="Edit Profile"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditOpen(false)
                  setEditError('')
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Personal Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Personal Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                />
                <Input
                  label="Phone Number"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm py-2 px-3.5 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Institutional email cannot be edited.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={profile.studentId}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm py-2 px-3.5 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Registrar issued ID cannot be edited.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional & Social Links */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Professional & Social Links (Optional)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enter complete URLs to connect your external profiles.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  label="LinkedIn Profile"
                  placeholder="https://linkedin.com/in/username"
                  value={editLinkedin}
                  onChange={(e) => setEditLinkedin(e.target.value)}
                  leftIcon={<IconLinkedIn className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="GitHub Profile"
                  placeholder="https://github.com/username"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  leftIcon={<IconGitHub className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Portfolio Website"
                  placeholder="https://username.dev"
                  value={editPortfolio}
                  onChange={(e) => setEditPortfolio(e.target.value)}
                  leftIcon={<IconGlobe className="w-4 h-4 text-slate-400" />}
                />

                <Input
                  label="Other Website / Blog"
                  placeholder="https://medium.com/@username"
                  value={editOther}
                  onChange={(e) => setEditOther(e.target.value)}
                  leftIcon={<IconLink className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <Modal
          isOpen={isPasswordOpen}
          onClose={() => {
            setIsPasswordOpen(false)
            setPasswordError('')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
          }}
          title="Change Password"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsPasswordOpen(false)
                  setPasswordError('')
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSavePassword}>
                Update Password
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="New Password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <p className="text-[11px] text-slate-500">
              Passwords should contain letters and numbers for maximum security.
            </p>
          </form>
        </Modal>
      )}

      {/* Change Photo Modal / Avatar Picker */}
      {isPhotoOpen && (
        <Modal
          isOpen={isPhotoOpen}
          onClose={() => setIsPhotoOpen(false)}
          title="Change Profile Avatar"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsPhotoOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsPhotoOpen(false)
                  showToast('Avatar style updated!', 'success')
                }}
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md mx-auto">
              {profile.avatarText}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
                Select Monogram Style
              </h4>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {avatarPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setProfile((prev) => ({ ...prev, avatarText: preset }))
                      setEditAvatarText(preset)
                    }}
                    className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      profile.avatarText === preset
                        ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600 ring-offset-2'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Custom Photo (Mock)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    showToast(`Photo "${e.target.files[0].name}" selected.`, 'info')
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
              />
            </div>
          </div>
        </Modal>
      )}
    </StudentLayout>
  )
}
