import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import ImageCropModal from '../components/common/ImageCropModal'
import { uploadAndPersistProfileImage } from '../lib/profileImage'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  IconCheck,
  IconClose,
  IconLinkedIn,
  IconGitHub,
  IconGlobe,
  IconLink,
  IconEdit,
  IconMail,
  IconAlertCircle,
  IconUsers,
  IconCamera,
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
  if (!name || !name.trim()) return 'FA'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}

export default function FacultyProfile() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()

  // Profile data & auth state
  const [profile, setProfile] = useState(null)
  const [authUser, setAuthUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isProfileMissing, setIsProfileMissing] = useState(false)
  const [toast, setToast] = useState(null)

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Profile Image Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const facultyFileInputRef = useRef(null)

  // Edit Form Fields
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editStaffId, setEditStaffId] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [editGithub, setEditGithub] = useState('')
  const [editPortfolio, setEditPortfolio] = useState('')
  const [editOther, setEditOther] = useState('')
  const [editError, setEditError] = useState('')

  // Department choices for select dropdown
  const departmentOptions = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Applied Sciences & Humanities',
    'Management & Business Studies',
    'Campus Student Affairs',
  ]

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Fetch authenticated Admin/Faculty profile from backend API: GET /api/profile/me
  useEffect(() => {
    async function loadFacultyProfile() {
      setIsLoading(true)
      setErrorMessage(null)
      setIsProfileMissing(false)

      try {
        // 1. Get currently authenticated Supabase session & user
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session || !session.access_token) {
          setIsLoading(false)
          setErrorMessage('No active user session found. Please sign in to view your profile.')
          return
        }

        setAuthUser(session.user)

        // 2. Call backend GET http://localhost:5000/api/profile/me
        const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 401) {
          setIsLoading(false)
          setErrorMessage('Session expired or unauthorized. Please sign in again.')
          return
        }

        if (response.status === 403) {
          const data = await response.json().catch(() => ({}))
          setIsLoading(false)
          setErrorMessage(
            data.message || 'Access forbidden. Your account may be inactive or restricted.'
          )
          return
        }

        if (response.status === 404) {
          setIsLoading(false)
          setIsProfileMissing(true)
          return
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setIsLoading(false)
          setErrorMessage(data.message || `Server error (${response.status}) loading profile.`)
          return
        }

        const result = await response.json()
        const apiProfile = result.profile || result

        // Normalize profile keys to support both camelCase and snake_case in UI
        const normalized = {
          ...apiProfile,
          full_name: apiProfile.fullName || apiProfile.full_name || 'Faculty Coordinator',
          staff_id: apiProfile.studentId || apiProfile.student_id || apiProfile.staffId || apiProfile.staff_id || '',
          department: apiProfile.department || 'Computer Science & Engineering',
          phone: apiProfile.phone || '',
          email: apiProfile.email || session.user?.email || '',
          role: apiProfile.role || 'Admin',
          profile_image: apiProfile.profileImage || apiProfile.profile_image || null,
          social_links: apiProfile.socialLinks || apiProfile.social_links || {},
          is_active: apiProfile.isActive !== undefined ? apiProfile.isActive : apiProfile.is_active,
          created_at: apiProfile.createdAt || apiProfile.created_at || null,
          updated_at: apiProfile.updatedAt || apiProfile.updated_at || null,
        }

        setProfile(normalized)
        setIsLoading(false)
      } catch (err) {
        setIsLoading(false)
        const isNetError = err?.message?.includes('fetch') || err?.name === 'TypeError'
        setErrorMessage(
          isNetError
            ? 'Unable to connect to the backend server. Please verify the server is running on http://localhost:5000.'
            : err?.message || 'An unexpected error occurred while loading your profile.'
        )
      }
    }

    loadFacultyProfile()
  }, [])

  // Open Edit Profile modal with fresh state
  const handleOpenEdit = () => {
    if (!profile) return
    const links = profile.social_links || {}
    setEditName(profile.full_name || '')
    setEditPhone(profile.phone || '')
    setEditDepartment(profile.department || departmentOptions[0])
    setEditStaffId(profile.staff_id || '')
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
    // Exclude role, is_active, id, email, password, tokens
    const payload = {
      full_name: editName.trim(),
      phone: editPhone.trim() || null,
      department: editDepartment.trim() || null,
      staff_id: editStaffId.trim() || null,
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

      const response = await fetch(`${API_BASE_URL}/api/profile/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setIsSaving(false)
        if (response.status === 401) {
          setEditError('Session expired. Please sign in again.')
        } else if (response.status === 403) {
          setEditError(
            data.message || 'Forbidden: You do not have permission to update this profile.'
          )
        } else if (response.status === 400) {
          setEditError(data.message || 'Validation error. Please verify the entered fields.')
        } else {
          setEditError(data.message || `Server error (${response.status}): Failed to save changes.`)
        }
        return
      }

      const updatedApiProfile = data.profile || data
      const normalizedUpdated = {
        ...profile,
        ...updatedApiProfile,
        full_name: updatedApiProfile.fullName || updatedApiProfile.full_name || editName.trim(),
        staff_id:
          updatedApiProfile.studentId ||
          updatedApiProfile.student_id ||
          updatedApiProfile.staffId ||
          updatedApiProfile.staff_id ||
          payload.staff_id,
        department: updatedApiProfile.department || payload.department,
        phone: updatedApiProfile.phone !== undefined ? updatedApiProfile.phone : payload.phone,
        social_links:
          updatedApiProfile.socialLinks || updatedApiProfile.social_links || payload.social_links,
        updated_at:
          updatedApiProfile.updatedAt || updatedApiProfile.updated_at || new Date().toISOString(),
      }

      setProfile(normalizedUpdated)

      // Refresh global AuthContext profile so FacultyLayout and Navbar receive updated name immediately
      if (typeof refreshProfile === 'function') {
        try {
          await refreshProfile()
        } catch (refreshErr) {
          console.warn('Non-critical: AuthContext refreshProfile warning:', refreshErr)
        }
      }

      setIsSaving(false)
      setIsEditOpen(false)
      showToast('Faculty profile updated successfully!', 'success')
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

  const avatarText = getAvatarInitials(profile?.full_name)
  const socialLinks = profile?.social_links || {}

  return (
    <FacultyLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
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
        title="Admin Profile"
        subtitle="Manage your faculty & administrator profile, academic appointments, and contact credentials."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Profile' },
        ]}
        actions={
          profile && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenEdit}
              className="text-xs gap-1.5 shadow-2xs"
              icon={<IconEdit className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
          )
        }
      />

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-xs text-center max-w-md mx-auto my-8 space-y-4 animate-in fade-in duration-200">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">Loading Admin Profile</h3>
            <p className="text-xs text-slate-500">Retrieving records from backend API...</p>
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
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/login')}>
              Go to Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Missing Profile State */}
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
              Your account is authenticated, but your faculty coordinator record has not been initialized in{' '}
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
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/faculty/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Profile Loaded Successfully */}
      {!isLoading && !errorMessage && !isProfileMissing && profile && (
        <>
          {/* Profile Header Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-50/70 to-transparent rounded-bl-full pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5 min-w-0">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  {profile.profile_image ? (
                    <img
                      src={profile.profile_image}
                      alt={profile.full_name || 'Faculty photo'}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shadow-md tracking-wider"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-bold text-2xl md:text-3xl flex items-center justify-center shadow-md tracking-wider"
                      aria-label={`${profile.full_name || 'Faculty'} avatar`}
                    >
                      {avatarText}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => facultyFileInputRef.current?.click()}
                    title="Change Photo"
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white text-slate-700 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <IconCamera className="w-4 h-4" />
                  </button>

                  <input
                    ref={facultyFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
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
                      setIsCropperOpen(true)
                      e.target.value = ''
                    }}
                  />
                </div>

                {/* Profile Summary */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                      {profile.full_name || 'Faculty Member'}
                    </h1>
                    <Badge variant="secondary" size="sm" className="font-semibold">
                      {profile.role || 'Admin'}
                    </Badge>
                    <Badge variant={profile.is_active ? 'success' : 'neutral'} size="sm">
                      <IconCheck className="w-3 h-3 mr-1 inline text-emerald-600" />
                      {profile.is_active ? 'Active Status' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    Staff ID:{' '}
                    <span className="font-bold text-slate-700">
                      {profile.staff_id || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span>{profile.department || 'Department Not Assigned'}</span>
                    {' • '}
                    <span>Faculty Coordinator</span>
                  </div>

                  <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 pt-0.5">
                    <IconMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{profile.email || authUser?.email || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Edit Trigger for Desktop/Header */}
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEdit}
                  className="text-xs gap-1.5 border-slate-300 hover:bg-slate-50"
                  icon={<IconEdit className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (8 cols): Department, Contact, and Social Links */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal & Appointment Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Academic & Professional Details
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your institutional faculty appointment and department credentials
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenEdit}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Edit
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Full Name</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.full_name || '—'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Official Email</div>
                    <div
                      className="text-sm font-semibold text-slate-900 mt-0.5 truncate"
                      title={profile.email || authUser?.email}
                    >
                      {profile.email || authUser?.email || '—'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Staff / Faculty ID</div>
                    <div className="text-sm font-mono font-semibold text-slate-900 mt-0.5">
                      {profile.staff_id || 'Not Assigned'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500">Phone Number</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 sm:col-span-2">
                    <div className="text-[11px] font-medium text-slate-500">Department / School</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {profile.department || 'Not assigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional & Social Links Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Professional & Academic Profiles
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Public research portals, faculty portfolios, and professional networks
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenEdit}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                      >
                        <span>Visit</span>
                        <span className="text-slate-400">&rarr;</span>
                      </a>
                    )}
                  </div>

                  {/* GitHub / Lab Portal */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                        <IconGitHub className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">
                          GitHub / Research Lab
                        </div>
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                      >
                        <span>Visit</span>
                        <span className="text-slate-400">&rarr;</span>
                      </a>
                    )}
                  </div>

                  {/* Portfolio / Faculty Webpage */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <IconGlobe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">
                          Faculty Portfolio / Publications
                        </div>
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
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
                        <div className="text-xs font-semibold text-slate-900">
                          Department Noticeboard / Blog
                        </div>
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
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                      >
                        <span>Visit</span>
                        <span className="text-slate-400">&rarr;</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Roles, Permissions, and Account Metadata */}
            <div className="lg:col-span-4 space-y-6">
              {/* Institutional Privileges Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Administrative Permissions
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium">Assigned Role</span>
                    <Badge variant="secondary" size="sm">
                      {profile.role || 'Admin'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium">Account Status</span>
                    <Badge variant={profile.is_active ? 'success' : 'neutral'} size="sm">
                      {profile.is_active ? 'Active' : 'Deactivated'}
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
                        : 'Official Staff Roster'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100 space-y-0.5">
                    <span className="text-slate-500 font-medium block text-[11px]">
                      Scope of Authority
                    </span>
                    <span className="font-semibold text-slate-800 block">
                      Activity Coordination & Attendance
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Authorized to publish workshops, approve registrations, and manage student attendance cohorts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-xl border border-indigo-100 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <IconUsers className="w-4 h-4 text-indigo-600" />
                  <span>Student 360 Directory</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review student participation histories, registration status, and club involvement records.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/faculty/students')}
                  className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Open Students Directory
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
              title="Edit Admin Profile"
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

                {/* Identification Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Coordinator Credentials
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Prof. David Vance"
                      required
                    />
                    <Input
                      label="Staff / Faculty ID"
                      value={editStaffId}
                      onChange={(e) => setEditStaffId(e.target.value)}
                      placeholder="e.g. FAC-2024-001"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Select
                      label="Department / School"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      options={departmentOptions}
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
                        Official Institutional Email
                      </label>
                      <input
                        type="text"
                        value={profile.email || authUser?.email || ''}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm py-2 px-3.5 cursor-not-allowed"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Official email is managed via institutional registrar.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        System Role
                      </label>
                      <input
                        type="text"
                        value={profile.role || 'Admin'}
                        disabled
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm py-2 px-3.5 cursor-not-allowed"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Roles are governed by institutional administrator charters.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional & Social Links */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Professional & Academic Links (Optional)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Connect your external profiles, research repositories, and publications.
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
                      label="GitHub / Lab Page"
                      placeholder="https://github.com/username"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      leftIcon={<IconGitHub className="w-4 h-4 text-slate-400" />}
                    />

                    <Input
                      label="Portfolio / Publications"
                      placeholder="https://scholar.google.com/..."
                      value={editPortfolio}
                      onChange={(e) => setEditPortfolio(e.target.value)}
                      leftIcon={<IconGlobe className="w-4 h-4 text-slate-400" />}
                    />

                    <Input
                      label="Other Link / Blog"
                      placeholder="https://department.campus.edu/..."
                      value={editOther}
                      onChange={(e) => setEditOther(e.target.value)}
                      leftIcon={<IconLink className="w-4 h-4 text-slate-400" />}
                    />
                  </div>
                </div>
              </form>
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
                  setProfile((prev) => ({
                    ...prev,
                    profile_image: publicUrl,
                  }))
                  showToast('Faculty profile photo updated successfully!', 'success')
                } catch (err) {
                  console.error('Faculty profile photo update failed:', err)
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
    </FacultyLayout>
  )
}
