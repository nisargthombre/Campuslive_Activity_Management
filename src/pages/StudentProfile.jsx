import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import ImageCropModal from '../components/common/ImageCropModal'
import { uploadAndPersistProfileImage } from '../lib/profileImage'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { initialProfileData } from '../data/profileData'
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

// Compute monogram initials from full name
function getAvatarInitials(name) {
  if (!name || !name.trim()) return 'ST'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}

export default function StudentProfile() {
  const navigate = useNavigate()
  const {
    user: contextUser,
    profile: contextProfile,
    loading: contextLoading,
    isProfileMissing: contextProfileMissing,
    refreshProfile,
    isDemo,
  } = useAuth()

  // Profile data & auth state (derived directly from AuthContext to avoid cascading renders)
  const [localProfile, setLocalProfile] = useState(null)
  const [retryError, setRetryError] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [toast, setToast] = useState(null)
  const [avatarLoadError, setAvatarLoadError] = useState(false)

  let localUser = null
  try {
    const raw = localStorage.getItem('campuslive_user')
    if (raw) localUser = JSON.parse(raw)
  } catch {
    // ignore
  }

  const baseProfile =
    contextProfile ||
    (localUser
      ? {
          ...initialProfileData,
          name: localUser.name || initialProfileData.name,
          full_name: localUser.name || initialProfileData.name,
          email: localUser.email || initialProfileData.email,
          avatarText: localUser.avatar || initialProfileData.avatarText,
          role: localUser.role || initialProfileData.role,
        }
      : initialProfileData)

  const profile = localProfile ? { ...baseProfile, ...localProfile } : baseProfile
  const authUser = contextUser || (localUser ? { email: localUser.email } : null)
  const isLoading = contextLoading && !localUser && !contextProfile
  const errorMessage = retryError
  const isProfileMissing = Boolean(contextProfileMissing && !isRetrying && !localUser)

  // Ensure profile is retrieved if AuthContext was initialized before session was ready
  useEffect(() => {
    if (!contextProfile && !contextLoading) {
      refreshProfile()
    }
  }, [contextProfile, contextLoading, refreshProfile])

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Edit Profile Form State
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [editGithub, setEditGithub] = useState('')
  const [editPortfolio, setEditPortfolio] = useState('')
  const [editOther, setEditOther] = useState('')
  const [editError, setEditError] = useState('')

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Password Modal Open/Close Helpers
  const handleOpenPasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setIsPasswordOpen(true)
  }

  const handleClosePasswordModal = () => {
    setIsPasswordOpen(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Explicit Retry handler for failed profile loads
  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryError(null)
    try {
      await refreshProfile()
    } catch (err) {
      setRetryError(err?.message || 'Failed to reload profile.')
    } finally {
      setIsRetrying(false)
    }
  }

  // Open Edit Profile modal with fresh state
  const handleOpenEdit = () => {
    if (!profile) return
    const links = profile.social_links || profile.socialLinks || {}
    setEditName(profile.full_name || '')
    setEditPhone(profile.phone || '')
    setEditLinkedin(links.linkedin || '')
    setEditGithub(links.github || '')
    setEditPortfolio(links.portfolio || '')
    setEditOther(links.other || '')
    setEditError('')
    setIsEditOpen(true)
  }

  // Save Edit Profile Changes via backend PUT /api/profile/me
  const handleSaveProfile = async (e) => {
    e.preventDefault()

    if (!editName.trim()) {
      setEditError('Full Name is required.')
      return
    }

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

    setIsSaving(true)
    setEditError('')

    // Strictly whitelist permitted editable fields
    const payload = {
      full_name: editName.trim(),
      phone: editPhone.trim() || null,
      social_links: {
        linkedin: editLinkedin.trim(),
        github: editGithub.trim(),
        portfolio: editPortfolio.trim(),
        other: editOther.trim(),
      },
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session || !session.access_token) {
        setIsSaving(false)
        setEditError('Your session has expired. Please sign in again.')
        return
      }

      let updatedApiProfile = null
      const isLocalhost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      const hasCustomApi = Boolean(import.meta.env.VITE_API_URL)

      if (hasCustomApi || isLocalhost) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (response.ok) {
            const data = await response.json().catch(() => ({}))
            updatedApiProfile = data.profile || data
          }
        } catch {
          // Fall through to direct Supabase update
        }
      }

      if (!updatedApiProfile) {
        // Direct Supabase update (Cloud-native on Vercel)
        const { data: dbData, error: dbErr } = await supabase
          .from('profiles')
          .update({
            full_name: payload.fullName || editName.trim(),
            academic_year: payload.academicYear || editYear,
            phone: payload.phone || editPhone.trim(),
            social_links: payload.social_links || payload.socialLinks || {},
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id)
          .select('*')
          .maybeSingle()

        if (dbErr) {
          console.warn('[StudentProfile] Direct Supabase profile update notice:', dbErr)
        }

        await supabase.auth
          .updateUser({
            data: {
              full_name: payload.fullName || editName.trim(),
              academic_year: payload.academicYear || editYear,
              phone: payload.phone || editPhone.trim(),
            },
          })
          .catch(() => {})

        updatedApiProfile = dbData || {
          ...payload,
          full_name: payload.fullName || editName.trim(),
          academic_year: payload.academicYear || editYear,
          phone: payload.phone || editPhone.trim(),
        }
      }
      const normalizedUpdated = {
        ...profile,
        ...updatedApiProfile,
        full_name: updatedApiProfile.fullName || updatedApiProfile.full_name || editName.trim(),
        student_id:
          updatedApiProfile.studentId || updatedApiProfile.student_id || profile.student_id,
        academic_year:
          updatedApiProfile.academicYear ||
          updatedApiProfile.academic_year ||
          profile.academic_year,
        phone: updatedApiProfile.phone !== undefined ? updatedApiProfile.phone : payload.phone,
        social_links:
          updatedApiProfile.socialLinks || updatedApiProfile.social_links || payload.social_links,
        updated_at:
          updatedApiProfile.updatedAt || updatedApiProfile.updated_at || new Date().toISOString(),
      }

      setLocalProfile(normalizedUpdated)

      // Refresh global AuthContext profile so Navbar and StudentLayout receive updated name immediately
      if (typeof refreshProfile === 'function') {
        try {
          await refreshProfile()
        } catch (refreshErr) {
          console.warn('Non-critical: AuthContext refreshProfile warning:', refreshErr)
        }
      }

      setIsSaving(false)
      setIsEditOpen(false)
      showToast('Profile information updated successfully!', 'success')
    } catch (err) {
      setIsSaving(false)
      const isNetError = err?.message?.includes('fetch') || err?.name === 'TypeError'
      setEditError(
        isNetError
          ? 'Unable to connect to the backend server. Please verify backend is running on http://localhost:5000.'
          : err?.message || 'Failed to update profile.'
      )
    }
  }

  // Change Password Submit
  const handleSavePassword = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault()
    }
    setPasswordError('')

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
      setPasswordError('New password and confirmation password do not match.')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    // 2. Demo mode & unauthenticated safety guard
    const userEmail = contextUser?.email || profile?.email || authUser?.email
    if (isDemo || contextUser?.isDemo || localUser?.isDemo || !userEmail) {
      setPasswordError(
        'Password changes are disabled in demo/offline mode. Please log in with a registered account.'
      )
      return
    }

    setIsSavingPassword(true)

    try {
      // Step A: Re-authenticate to verify current password credentials securely
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect. Please verify your credentials and try again.')
        setIsSavingPassword(false)
        return
      }

      // Step B: Authenticated password update via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message || 'Failed to update password. Please try again.')
        setIsSavingPassword(false)
        return
      }

      // Step C: Success handling
      handleClosePasswordModal()
      showToast('Password updated successfully via Supabase Auth!', 'success')
    } catch (err) {
      console.error('[StudentProfile] Exception updating password:', err)
      setPasswordError('An unexpected network error occurred while updating password. Please try again.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  // Avatar presets for quick photo selector
  const avatarPresets = ['ST', 'CL', 'KP', 'CS', 'IT', 'DEV']

  const avatarText = profile?.avatarText || getAvatarInitials(profile?.full_name)
  const socialLinks = profile?.social_links || profile?.socialLinks || {}

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
          profile && (
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
          )
        }
      />

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xs text-center max-w-md mx-auto my-8 space-y-4 animate-in fade-in duration-200">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Loading Student Profile</h3>
            <p className="text-xs text-slate-500">Retrieving records from database...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && errorMessage && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto my-8 space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <IconAlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Unable to Load Profile</h3>
            <p className="text-xs sm:text-sm text-rose-600 max-w-md mx-auto leading-relaxed">
              {errorMessage}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Try Again
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Missing Profile Row in public.profiles State */}
      {!isLoading && !errorMessage && isProfileMissing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-2xl mx-auto my-8 space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <IconAlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Profile Record Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your authenticated account is active, but your student profile record has not been created in{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-xs">
                public.profiles
              </code>{' '}
              yet.
            </p>
          </div>

          {authUser?.email && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
              <IconMail className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Authenticated as: <strong className="text-slate-800">{authUser.email}</strong>
              </span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Retry
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Fallback when Profile Data is Not Loaded or User Unauthenticated (Prevents silent blank page) */}
      {!isLoading && !errorMessage && !isProfileMissing && !profile && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center max-w-xl mx-auto my-8 space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
            <IconAlertCircle className="w-7 h-7 text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              {authUser ? 'Profile Details Unavailable' : 'Sign In Required'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {authUser
                ? 'Your authenticated session is active, but student profile details could not be retrieved from the database. Please retry.'
                : 'You are currently not signed in. Please sign in to view and manage your student profile.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
            >
              Retry
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Profile Loaded Successfully */}
      {!isLoading && !errorMessage && !isProfileMissing && profile && (
        <>
          {/* Profile Header Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/70 to-transparent rounded-bl-full pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                {/* Avatar with Change Photo Trigger */}
                <div className="relative group shrink-0">
                  {profile.profile_image && !avatarLoadError ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.full_name || 'Profile photo'}
                      onError={() => setAvatarLoadError(true)}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md tracking-wider transition-transform group-hover:scale-102"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-2xl md:text-3xl flex items-center justify-center shadow-md tracking-wider transition-transform group-hover:scale-102"
                      aria-label={`${profile.full_name || 'Student'} avatar`}
                    >
                      {avatarText}
                    </div>
                  )}

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
                      {profile.full_name || 'Student'}
                    </h1>
                    <Badge variant="primary" size="sm" className="font-semibold">
                      {profile.role || 'Student'}
                    </Badge>
                    <Badge variant={profile.is_active ? 'success' : 'neutral'} size="sm">
                      <IconCheck className="w-3 h-3 mr-1 inline text-emerald-600" />
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Student ID:{' '}
                    <span className="font-bold text-slate-700">
                      {profile.student_id || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span>{profile.course || 'Course Not Assigned'}</span>
                    {' • '}
                    <span>{profile.academic_year || 'Year Not Assigned'}</span>
                  </div>

                  <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 pt-0.5">
                    <IconMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{profile.email || authUser?.email || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons for Mobile/Header */}
              <div className="flex sm:hidden w-full items-center gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleOpenPasswordModal}
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
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.full_name || '—'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Email Address</div>
                    <div
                      className="text-sm font-semibold text-slate-900 mt-0.5 truncate"
                      title={profile.email || authUser?.email}
                    >
                      {profile.email || authUser?.email || '—'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Phone Number</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Student ID</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 mt-0.5">
                      {profile.student_id || '—'}
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
                      {profile.department || '—'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Course / Program</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.course || '—'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Academic Year</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.academic_year || '—'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Division / Class</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.division || 'Not assigned'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Enrollment Year</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.enrollment_year || profile.academic_year || '—'}
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
                        {socialLinks.linkedin ? (
                          <span className="text-[11px] text-slate-500 truncate block">
                            {socialLinks.linkedin}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                        )}
                      </div>
                    </div>

                    {socialLinks.linkedin && (
                      <a
                        href={normalizeUrl(socialLinks.linkedin)}
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
                        {socialLinks.github ? (
                          <span className="text-[11px] text-slate-500 truncate block">
                            {socialLinks.github}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                        )}
                      </div>
                    </div>

                    {socialLinks.github && (
                      <a
                        href={normalizeUrl(socialLinks.github)}
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
                        {socialLinks.portfolio ? (
                          <span className="text-[11px] text-slate-500 truncate block">
                            {socialLinks.portfolio}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                        )}
                      </div>
                    </div>

                    {socialLinks.portfolio && (
                      <a
                        href={normalizeUrl(socialLinks.portfolio)}
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
                        {socialLinks.other ? (
                          <span className="text-[11px] text-slate-500 truncate block">
                            {socialLinks.other}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not added yet</span>
                        )}
                      </div>
                    </div>

                    {socialLinks.other && (
                      <a
                        href={normalizeUrl(socialLinks.other)}
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
                  {profile.profile_image && !avatarLoadError ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.full_name || 'Profile photo'}
                      onError={() => setAvatarLoadError(true)}
                      className="w-24 h-24 rounded-2xl object-cover shadow-md mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md mb-3">
                      {avatarText}
                    </div>
                  )}

                  <div className="text-xs font-semibold text-slate-900">
                    {profile.full_name || 'Student'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {profile.student_id || '—'}
                  </div>
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
                    <Badge variant={profile.is_active ? 'success' : 'neutral'} size="sm">
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium">Role</span>
                    <Badge variant="primary" size="sm">
                      {profile.role || 'Student'}
                    </Badge>
                  </div>

                  <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-0.5">
                    <span className="text-slate-500 font-medium block text-[11px]">
                      Account Created
                    </span>
                    <span className="font-semibold text-slate-800">
                      {profile.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-0.5">
                    <span className="text-slate-500 font-medium block text-[11px]">
                      Last Portal Login
                    </span>
                    <span className="font-semibold text-slate-800">
                      {authUser?.last_sign_in_at
                        ? new Date(authUser.last_sign_in_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Active Session'}
                    </span>
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
                  Ensure your student credentials remain safe. Change your password periodically or
                  after accessing shared campus terminals.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={handleOpenPasswordModal}
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
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    onClick={handleSaveProfile}
                  >
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
                      placeholder="Enter full name"
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="text"
                        value={profile.email || authUser?.email || ''}
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
                        value={profile.student_id || ''}
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
              onClose={handleClosePasswordModal}
              title="Change Password"
              size="md"
              footer={
                <div className="flex items-center justify-end gap-2 w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClosePasswordModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSavingPassword}
                    onClick={handleSavePassword}
                  >
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
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <PasswordInput
                  label="New Password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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
                  {avatarText}
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
                          setLocalProfile((prev) => ({ ...prev, avatarText: preset }))
                        }}
                        className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          avatarText === preset
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
                    Upload Custom Photo
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      const validTypes = ['image/jpeg', 'image/png', 'image/webp']
                      if (!validTypes.includes(file.type)) {
                        showToast('Please select a valid image file (JPEG, PNG, or WebP).', 'danger')
                        return
                      }

                      if (file.size > 2 * 1024 * 1024) {
                        showToast('Image exceeds 2 MB size limit. Please choose a smaller file.', 'danger')
                        return
                      }

                      const objectUrl = URL.createObjectURL(file)
                      setCropImageSrc(objectUrl)
                      setIsPhotoOpen(false)
                      setIsCropperOpen(true)
                      e.target.value = ''
                    }}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Supports JPG, PNG, WebP up to 2 MB. Square 1:1 crop modal will open.
                  </p>
                </div>
              </div>
            </Modal>
          )}

          {/* Client-Side Profile Image Cropper Modal */}
          {isCropperOpen && (
            <ImageCropModal
              isOpen={isCropperOpen}
              imageSrc={cropImageSrc}
              onClose={() => {
                setIsCropperOpen(false)
                if (cropImageSrc) {
                  URL.revokeObjectURL(cropImageSrc)
                }
                setCropImageSrc(null)
              }}
              onCropSave={async ({ blob, previewUrl }) => {
                try {
                  const { publicUrl } = await uploadAndPersistProfileImage(blob, refreshProfile)
                  setLocalProfile((prev) => ({
                    ...prev,
                    profile_image: publicUrl,
                  }))
                  setAvatarLoadError(false)
                  showToast('Profile photo updated successfully!', 'success')
                } catch (err) {
                  console.error('Profile photo update failed:', err)
                  showToast(err.message || 'Failed to update profile photo.', 'danger')
                  throw err
                } finally {
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                  }
                }
              }}
            />
          )}
        </>
      )}
    </StudentLayout>
  )
}
