import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Card from '../components/common/Card'
import ActivityCard from '../components/common/ActivityCard'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconArrowLeft,
  IconActivity,
  IconClose,
} from '../components/icons/Icons'
import { relatedActivities, getActivityById as getFallbackActivityById } from '../data/activitiesData'
import { initialRegistrations } from '../data/registrationsData'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Format a 24h or ISO time string into clean 12h AM/PM
 */
function formatTimeRange(startTime, endTime) {
  const formatSingle = (timeStr) => {
    if (!timeStr) return ''
    const parts = timeStr.split(':')
    if (parts.length < 2) return timeStr
    let h = parseInt(parts[0], 10)
    const m = parts[1]
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${h}:${m} ${ampm}`
  }

  const startFormatted = formatSingle(startTime)
  const endFormatted = formatSingle(endTime)

  if (startFormatted && endFormatted) {
    return `${startFormatted} - ${endFormatted}`
  }
  return startFormatted || '10:00 AM - 1:00 PM'
}

/**
 * Format a database date string (YYYY-MM-DD or ISO) into readable display
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Date TBA'
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Map activity category to gradient
 */
function getCategoryGradient(category) {
  const c = (category || '').toLowerCase()
  switch (c) {
    case 'workshop':
      return 'from-blue-600 to-indigo-700'
    case 'hackathon':
      return 'from-indigo-600 to-purple-700'
    case 'competition':
      return 'from-purple-600 to-pink-700'
    case 'seminar':
    case 'webinar':
      return 'from-sky-600 to-blue-800'
    case 'cultural':
      return 'from-pink-600 to-rose-700'
    case 'sports':
      return 'from-emerald-600 to-teal-700'
    case 'technical':
      return 'from-cyan-600 to-blue-700'
    default:
      return 'from-blue-600 to-indigo-700'
  }
}

export default function ActivityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Real Database Data State
  const [activity, setActivity] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthRequired, setIsAuthRequired] = useState(false)

  // Registration State
  const [isRegistered, setIsRegistered] = useState(false)
  const [totalRegistered, setTotalRegistered] = useState(0)
  const [availableSeats, setAvailableSeats] = useState(null)
  const [maxParticipants, setMaxParticipants] = useState(null)
  const [isFull, setIsFull] = useState(false)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({
    show: false,
    type: 'success', // 'success' | 'error'
    message: '',
  })

  // Scroll to top whenever ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Toast notification auto-dismiss timer
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  // Helper to retrieve current authenticated user token
  const getAuthToken = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (err) {
      console.error('[ActivityDetails] Error getting auth session:', err)
      return null
    }
  }, [])

  // Fetch activity details and registration status from real Express APIs on mount / id change
  useEffect(() => {
    let ignore = false

    const loadInitial = async () => {
      if (!id) return
      setError(null)
      setIsAuthRequired(false)

      // Check if this ID is a demo / offline activity
      if (!UUID_REGEX.test(id)) {
        const fallback = getFallbackActivityById(id)
        if (fallback) {
          setActivity(fallback)
          try {
            const savedDemo = JSON.parse(localStorage.getItem('campuslive_demo_registrations') || '{}')
            const isDemoReg =
              savedDemo[id] !== undefined
                ? Boolean(savedDemo[id])
                : initialRegistrations.some((r) => r.activityId === id && r.status === 'Registered')

            setIsRegistered(isDemoReg)
            const fallbackCap = fallback.totalSeats || fallback.maxParticipants || 100
            setMaxParticipants(fallbackCap)
            const baseAvail =
              typeof fallback.availableSeats === 'number'
                ? fallback.availableSeats
                : typeof fallback.spotsLeft === 'number'
                ? fallback.spotsLeft
                : fallbackCap

            if (isDemoReg) {
              setTotalRegistered(1)
              setAvailableSeats(Math.max(0, baseAvail - 1))
            } else {
              setTotalRegistered(0)
              setAvailableSeats(baseAvail)
            }
          } catch {
            // Ignore parse errors
          }
          setIsLoading(false)
          return
        }
      }

      try {
        const token = await getAuthToken()
        const headers = {
          'Content-Type': 'application/json',
        }
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const actRes = await fetch(`${API_BASE_URL}/api/activities/${id}`, {
          method: 'GET',
          headers,
        })

        if (!actRes.ok) {
          if (actRes.status === 401) {
            const errJson = await actRes.json().catch(() => ({}))
            const fallback = getFallbackActivityById(id)
            if (fallback && String(fallback.id) === String(id)) {
              setActivity(fallback)
              return
            }
            setIsAuthRequired(true)
            throw new Error(errJson.message || 'Your session has expired. Please sign in again.')
          }

          if (actRes.status === 404) {
            const fallback = getFallbackActivityById(id)
            if (fallback && String(fallback.id) === String(id)) {
              setActivity(fallback)
              return
            }
            throw new Error('The requested activity was not found in the database.')
          }

          const errJson = await actRes.json().catch(() => ({}))
          const fallback = getFallbackActivityById(id)
          if (fallback && String(fallback.id) === String(id)) {
            setActivity(fallback)
            return
          }
          throw new Error(errJson.message || `Server returned status ${actRes.status}`)
        }

        const actData = await actRes.json()
        if (ignore) return

        if (!actData.activity) {
          const fallback = getFallbackActivityById(id)
          if (fallback && String(fallback.id) === String(id)) {
            setActivity(fallback)
            return
          }
          throw new Error('Activity data could not be retrieved.')
        }
        setActivity(actData.activity)

        if (token) {
          try {
            const regRes = await fetch(`${API_BASE_URL}/api/registrations/status/${id}`, {
              method: 'GET',
              headers,
            })

            if (regRes.ok && !ignore) {
              const regData = await regRes.json()
              setIsRegistered(Boolean(regData.registered))
              setTotalRegistered(regData.totalRegistered || 0)
              setMaxParticipants(
                typeof regData.maxParticipants === 'number'
                  ? regData.maxParticipants
                  : actData.activity.maxParticipants || null
              )
              setAvailableSeats(
                typeof regData.availableSeats === 'number'
                  ? regData.availableSeats
                  : null
              )
              setIsFull(Boolean(regData.isFull))
              setIsDeadlinePassed(Boolean(regData.isDeadlinePassed))
            }
          } catch (regErr) {
            console.warn('[ActivityDetails] Could not fetch registration status:', regErr)
          }
        }
      } catch (err) {
        if (!ignore) {
          const fallback = getFallbackActivityById(id)
          if (fallback && String(fallback.id) === String(id)) {
            setActivity(fallback)
            setError(null)
          } else {
            console.error('[ActivityDetails] Error loading activity:', err)
            setError(err.message || 'Failed to load activity details.')
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadInitial()

    return () => {
      ignore = true
    }
  }, [id, getAuthToken])

  // Handle registration action: POST /api/registrations
  const handleRegister = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Please sign in to register for activities.',
        })
        navigate('/login', { state: { from: location.pathname } })
        return
      }

      const realDbActivityId =
        (UUID_REGEX.test(String(activity?.id || '')) ? activity.id : null) ||
        (UUID_REGEX.test(String(id || '')) ? id : null)

      if (!realDbActivityId) {
        // Safe demo registration fallback without sending non-UUID to Supabase
        setIsRegistered(true)
        if (availableSeats !== null) {
          setAvailableSeats((prev) => Math.max(0, prev - 1))
        }
        setTotalRegistered((prev) => prev + 1)

        try {
          const savedDemo = JSON.parse(localStorage.getItem('campuslive_demo_registrations') || '{}')
          savedDemo[id] = true
          localStorage.setItem('campuslive_demo_registrations', JSON.stringify(savedDemo))
        } catch {
          // Ignore localStorage errors
        }

        setNotification({
          show: true,
          type: 'success',
          message: 'Demo registration confirmed! (Preview activity; real activities sync with Supabase).',
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activityId: realDbActivityId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for activity.')
      }

      // Successful registration: update state
      setIsRegistered(true)
      if (typeof data.remainingSeats === 'number') {
        setAvailableSeats(data.remainingSeats)
      } else if (availableSeats !== null) {
        setAvailableSeats((prev) => Math.max(0, prev - 1))
      }
      setTotalRegistered((prev) => prev + 1)

      setNotification({
        show: true,
        type: 'success',
        message: data.message || 'You have successfully registered for this activity!',
      })
    } catch (err) {
      console.error('[ActivityDetails] Register error:', err)
      setNotification({
        show: true,
        type: 'error',
        message: err.message || 'Registration failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancellation action: POST /api/registrations/cancel
  const handleCancelRegistration = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        setNotification({
          show: true,
          type: 'error',
          message: 'Your session has expired. Please sign in again.',
        })
        navigate('/login')
        return
      }

      const realDbActivityId =
        (UUID_REGEX.test(String(activity?.id || '')) ? activity.id : null) ||
        (UUID_REGEX.test(String(id || '')) ? id : null)

      if (!realDbActivityId) {
        // Safe demo cancellation fallback without sending non-UUID to Supabase
        setIsRegistered(false)
        if (availableSeats !== null) {
          setAvailableSeats((prev) => Math.max(0, prev + 1))
        }
        setTotalRegistered((prev) => Math.max(0, prev - 1))

        try {
          const savedDemo = JSON.parse(localStorage.getItem('campuslive_demo_registrations') || '{}')
          savedDemo[id] = false
          localStorage.setItem('campuslive_demo_registrations', JSON.stringify(savedDemo))
        } catch {
          // Ignore localStorage errors
        }

        setNotification({
          show: true,
          type: 'success',
          message: 'Your demo registration has been cancelled.',
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/registrations/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activityId: realDbActivityId }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel registration.')
      }

      // Successful cancellation: update state
      setIsRegistered(false)
      if (availableSeats !== null) {
        setAvailableSeats((prev) => prev + 1)
      }
      setTotalRegistered((prev) => Math.max(0, prev - 1))

      setNotification({
        show: true,
        type: 'success',
        message: data.message || 'Your registration has been cancelled.',
      })
    } catch (err) {
      console.error('[ActivityDetails] Cancel registration error:', err)
      setNotification({
        show: true,
        type: 'error',
        message: err.message || 'Cancellation failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Evaluate dynamic registration state
  const totalCapacity =
    maxParticipants ||
    activity?.maxParticipants ||
    activity?.totalSeats ||
    100
  const currentAvailable =
    availableSeats !== null
      ? availableSeats
      : typeof activity?.availableSeats === 'number'
        ? activity.availableSeats
        : typeof activity?.spotsLeft === 'number'
          ? activity.spotsLeft
          : Math.max(0, totalCapacity - totalRegistered)

  const isEventFull = isFull || currentAvailable <= 0
  const isClosed =
    isDeadlinePassed ||
    ['draft', 'cancelled', 'completed', 'archived', 'closed'].includes(
      String(activity?.status || '').toLowerCase()
    )

  let registrationState = 'open'
  if (isRegistered) {
    registrationState = 'registered'
  } else if (isClosed) {
    registrationState = 'closed'
  } else if (isEventFull) {
    registrationState = 'full'
  }

  const deadlineDisplay = activity?.registrationDeadline
    ? formatDisplayDate(activity.registrationDeadline)
    : activity?.date
      ? formatDisplayDate(activity.date)
      : 'Date TBA'

  const timeDisplay = formatTimeRange(activity?.startTime, activity?.endTime)
  const dateDisplay = formatDisplayDate(activity?.date)
  const contactEmail =
    activity?.contactEmail ||
    activity?.contact ||
    (typeof activity?.coordinator === 'object' ? activity?.coordinator?.email : null) ||
    'activities@campus.edu'

  const topics =
    Array.isArray(activity?.topics) && activity.topics.length > 0
      ? activity.topics
      : [
          'Interactive curriculum & technical concepts',
          'Practical demonstrations & real-world workflows',
          'Hands-on collaborative exercises',
          'Department mentor guidance and student interaction',
        ]

  const coordinator = {
    name:
      activity?.contactName ||
      (typeof activity?.coordinator === 'object' ? activity?.coordinator?.name : activity?.coordinator) ||
      'Faculty Coordinator',
    role:
      (typeof activity?.coordinator === 'object' ? activity?.coordinator?.role : null) ||
      'Faculty Coordinator',
    department:
      (typeof activity?.coordinator === 'object' ? activity?.coordinator?.department : null) ||
      (activity?.department ? `Department of ${activity.department}` : 'Academic Affairs'),
    email: contactEmail,
    avatar:
      (typeof activity?.coordinator === 'object' ? activity?.coordinator?.avatar : null) ||
      (activity?.contactName
        ? activity.contactName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'FC'),
  }

  const eligibleDepartments = Array.isArray(activity?.eligibility?.departments)
    ? activity.eligibility.departments
    : typeof activity?.department === 'string' && activity.department
      ? [activity.department]
      : ['All Departments']

  const eligibleCohortDisplay =
    activity?.academicYear ||
    (typeof activity?.eligibility === 'string'
      ? activity.eligibility
      : typeof activity?.eligibility === 'object' && activity?.eligibility !== null
        ? activity.eligibility.years
        : null) ||
    'All Registered Students'

  const seatPercentage =
    totalCapacity > 0
      ? Math.min(100, Math.round(((totalCapacity - currentAvailable) / totalCapacity) * 100))
      : 0

  return (
    <StudentLayout>
      {/* Toast Notification Banner */}
      {notification.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              notification.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {notification.type === 'error' ? (
              <IconAlertCircle className="w-4 h-4" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
          </div>
          <span className="text-xs font-medium leading-relaxed">{notification.message}</span>
          <button
            type="button"
            onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
          <PageHeader
            title="Activity Details"
            subtitle="Loading activity record from database..."
            breadcrumb={[
              { label: 'Campus Live', to: '/' },
              { label: 'Student', to: '/student/dashboard' },
              { label: 'Explore Activities', to: '/student/activities' },
              { label: 'Loading...' },
            ]}
          />
          <div className="h-64 rounded-3xl bg-slate-200" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-40 rounded-2xl bg-slate-200" />
              <div className="h-64 rounded-2xl bg-slate-200" />
            </div>
            <div className="space-y-6">
              <div className="h-80 rounded-2xl bg-slate-200" />
              <div className="h-44 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      )}

      {/* AUTH REQUIRED / SESSION EXPIRED STATE */}
      {!isLoading && isAuthRequired && (
        <div className="py-12">
          <PageHeader
            title="Authentication Required"
            subtitle="Please sign in to access activity details and registrations."
            breadcrumb={[
              { label: 'Campus Live', to: '/' },
              { label: 'Student', to: '/student/dashboard' },
              { label: 'Explore Activities', to: '/student/activities' },
              { label: 'Sign In Required' },
            ]}
          />
          <div className="max-w-xl mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
              <IconUsers className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {error || 'Your session has expired or authentication is required to access this activity.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login', { state: { from: location.pathname } })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <span>Sign In to Continue</span>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/student/activities')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span>Back to Activities</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR / NOT FOUND STATE */}
      {!isLoading && !isAuthRequired && (error || !activity) && (
        <div className="py-12">
          <PageHeader
            title="Activity Details"
            subtitle="Explore comprehensive activity details and schedules."
            breadcrumb={[
              { label: 'Campus Live', to: '/' },
              { label: 'Student', to: '/student/dashboard' },
              { label: 'Explore Activities', to: '/student/activities' },
              { label: 'Activity Not Found' },
            ]}
          />
          <div className="max-w-xl mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <IconAlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Activity Not Found</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {error || 'The requested activity could not be found or has been removed from the schedule.'}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/student/activities')}
              className="inline-flex items-center gap-2"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Back to Explore Activities</span>
            </Button>
          </div>
        </div>
      )}

      {/* LOADED ACTIVITY VIEW */}
      {!isLoading && activity && (
        <>
          {/* Page Header */}
          <PageHeader
            title="Activity Details"
            subtitle="Complete overview, schedule, prerequisites, and registration."
            breadcrumb={[
              { label: 'Campus Live', to: '/' },
              { label: 'Student', to: '/student/dashboard' },
              { label: 'Explore Activities', to: '/student/activities' },
              { label: activity.title },
            ]}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/activities')}
                className="inline-flex items-center gap-1.5"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span>Back to Activities</span>
              </Button>
            }
          />

          {/* HERO SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs mb-8">
            {/* Visual Banner Thumbnail */}
            <div
              className={`h-48 sm:h-64 bg-gradient-to-br ${getCategoryGradient(
                activity.category
              )} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white`}
            >
              {/* Subtle Decorative Accents */}
              <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-md pointer-events-none" />
              <div className="absolute right-12 top-6 text-white/15 pointer-events-none">
                <IconActivity className="w-32 h-32" />
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2.5 relative z-10">
                <Badge
                  variant="primary"
                  size="md"
                  className="backdrop-blur-md bg-white/20 text-white font-semibold"
                >
                  {activity.category || activity.activityType || 'Activity'}
                </Badge>

                {registrationState === 'registered' ? (
                  <Badge
                    variant="success"
                    size="md"
                    dot
                    className="bg-emerald-500/90 text-white font-semibold shadow-xs"
                  >
                    Already Registered
                  </Badge>
                ) : registrationState === 'closed' ? (
                  <Badge
                    variant="neutral"
                    size="md"
                    className="bg-slate-700 text-slate-200 font-semibold shadow-xs"
                  >
                    Registration Closed
                  </Badge>
                ) : registrationState === 'full' ? (
                  <Badge
                    variant="danger"
                    size="md"
                    className="bg-rose-600 text-white font-semibold shadow-xs"
                  >
                    Event Full
                  </Badge>
                ) : (
                  <Badge
                    variant="info"
                    size="md"
                    dot
                    className="bg-white/20 text-white backdrop-blur-md font-semibold"
                  >
                    Open for Registration
                  </Badge>
                )}
              </div>

              {/* Title & Quick Description */}
              <div className="relative z-10 max-w-3xl mt-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
                  {activity.title}
                </h1>
                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl line-clamp-2">
                  {activity.description}
                </p>
              </div>
            </div>

            {/* Hero Quick Action Bar */}
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {coordinator.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{activity.organizer || 'Campus Live'}</p>
                  <p className="text-[11px] text-slate-500">
                    Coordinator: {coordinator.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {registrationState === 'open' && (
                  <Button
                    id="hero-register-btn"
                    variant="primary"
                    size="md"
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="shadow-sm font-semibold cursor-pointer"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Now \u2192'}
                  </Button>
                )}
                {registrationState === 'registered' && (
                  <Button
                    id="hero-cancel-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelRegistration}
                    disabled={isSubmitting}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Cancelling...' : 'Cancel Registration'}
                  </Button>
                )}
                {registrationState === 'closed' && (
                  <Badge variant="neutral" size="md">
                    Registration Closed
                  </Badge>
                )}
                {registrationState === 'full' && (
                  <Badge variant="danger" size="md">
                    Event Full
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* MAIN TWO-COLUMN BODY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
            {/* LEFT COLUMN: Activity Info + About + Eligibility */}
            <div className="lg:col-span-2 space-y-8">
              {/* Activity Information Grid */}
              <section aria-label="Activity Information">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <IconCalendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Date
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{dateDisplay}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Academic Calendar</p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <IconClock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Time
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{timeDisplay}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Session Schedule</p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <IconMapPin className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Venue
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                        {activity.venue || 'Campus Venue'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Main Campus</p>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <IconUsers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Organizer
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                        {activity.organizer || 'Campus Live'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.department || 'All Departments'}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                      <IconMail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Contact
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{contactEmail}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Official Helpdesk</p>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <IconAlertCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Registration Deadline
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{deadlineDisplay}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Closes 11:59 PM</p>
                    </div>
                  </div>

                  {/* Available Seats */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5 sm:col-span-2 md:col-span-3 lg:col-span-1">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <IconUsers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Available Seats
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentAvailable} / {totalCapacity}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {totalRegistered} students registered
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* About this Activity Section */}
              <section aria-label="About this Activity">
                <Card
                  title="About this Activity"
                  subtitle="Comprehensive curriculum overview and workshop objectives"
                  padding="lg"
                >
                  <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
                    <p>
                      {activity.description ||
                        'Explore emerging technologies, practical engineering, and future innovations through an interactive campus event.'}
                    </p>
                    <p>
                      Participants will engage directly with hands-on exercises, inspect modern frameworks, and learn directly from experienced faculty mentors. Attendees will gain actionable insights into how these concepts apply to modern industry settings.
                    </p>
                  </div>

                  {/* Topics Covered */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Key Topics & Modules</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {topics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <IconCheck className="w-3 h-3" />
                          </div>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </section>

              {/* Eligibility Section */}
              <section aria-label="Eligibility Criteria">
                <Card
                  title="Eligibility"
                  subtitle="Academic disciplines and student prerequisites for this activity"
                  padding="lg"
                >
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Eligible Departments:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {eligibleDepartments.map((dept, index) => (
                          <Badge key={index} variant="primary" size="md">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                        Eligible Academic Cohorts:
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs">
                        <span>🎓</span>
                        <span>{eligibleCohortDisplay}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </div>

            {/* RIGHT COLUMN: Registration Card + Organizer Card */}
            <div className="space-y-6">
              {/* Prominent Registration Card */}
              <section aria-label="Registration Action">
                <Card padding="lg" className="border-blue-100 shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Registration Status
                    </span>
                    {registrationState === 'registered' ? (
                      <Badge variant="success" size="sm" dot>
                        Confirmed
                      </Badge>
                    ) : registrationState === 'closed' ? (
                      <Badge variant="neutral" size="sm">
                        Closed
                      </Badge>
                    ) : registrationState === 'full' ? (
                      <Badge variant="danger" size="sm">
                        Full
                      </Badge>
                    ) : (
                      <Badge variant="primary" size="sm" dot>
                        Open
                      </Badge>
                    )}
                  </div>

                  {/* Deadline & Seat Meter */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                      <span className="text-slate-500">Deadline</span>
                      <span className="font-bold text-slate-900">{deadlineDisplay}</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">Available Seats</span>
                        <span className="font-bold text-slate-900">
                          {currentAvailable} / {totalCapacity}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${seatPercentage}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 text-right">
                        {totalRegistered} students registered
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons for Real States */}
                  <div className="space-y-3">
                    {registrationState === 'open' && (
                      <Button
                        id="card-register-btn"
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="shadow-sm font-semibold cursor-pointer"
                      >
                        {isSubmitting ? 'Registering...' : 'Register Now'}
                      </Button>
                    )}

                    {registrationState === 'registered' && (
                      <>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-semibold text-xs mb-0.5">
                            <IconCheck className="w-4 h-4 text-emerald-600" />
                            <span>Registered Successfully</span>
                          </div>
                          <p className="text-[11px] text-emerald-600">
                            Your seat is confirmed in this activity.
                          </p>
                        </div>

                        <Button
                          id="card-cancel-btn"
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={handleCancelRegistration}
                          disabled={isSubmitting}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer"
                        >
                          {isSubmitting ? 'Cancelling...' : 'Cancel Registration'}
                        </Button>
                      </>
                    )}

                    {registrationState === 'closed' && (
                      <Button
                        id="card-closed-btn"
                        variant="secondary"
                        size="lg"
                        fullWidth
                        disabled
                        className="opacity-60 cursor-not-allowed"
                      >
                        Registration Closed
                      </Button>
                    )}

                    {registrationState === 'full' && (
                      <Button
                        id="card-full-btn"
                        variant="secondary"
                        size="lg"
                        fullWidth
                        disabled
                        className="opacity-60 cursor-not-allowed"
                      >
                        Event Full
                      </Button>
                    )}
                  </div>

                  {/* Cancellation Policy Note */}
                  <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
                    You can cancel your registration before the registration deadline to liberate seats for peers.
                  </p>
                </Card>
              </section>

              {/* Organizer Card */}
              <section aria-label="Organizer Information">
                <Card title="Organizer" subtitle="Academic department coordinating this event" padding="lg">
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {coordinator.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{activity.organizer || 'Campus Live'}</h4>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        {coordinator.role}: {coordinator.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">{coordinator.department}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href={`mailto:${contactEmail}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <IconMail className="w-4 h-4 text-slate-500" />
                      <span>Contact: {contactEmail}</span>
                    </a>
                  </div>
                </Card>
              </section>
            </div>
          </div>

          {/* RELATED ACTIVITIES SECTION */}
          <section aria-label="Related Activities" className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Related Activities</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore other workshops, competitions, and seminars happening soon
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/activities')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
              >
                Explore All Activities &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(relatedActivities || []).filter(Boolean).map((rel) => (
                <ActivityCard
                  key={rel.id}
                  id={rel.id}
                  title={rel.title}
                  category={rel.category}
                  date={rel.date}
                  time={rel.time}
                  venue={rel.venue}
                  organizer={rel.organizer}
                  description={rel.description}
                  status={rel.status}
                  statusVariant={rel.statusVariant}
                  badgeVariant={rel.badgeVariant}
                  thumbnailGradient={rel.thumbnailGradient}
                  spotsLeft={rel.spotsLeft}
                  actionText="View Details"
                  onAction={() => navigate(`/student/activities/${rel.id}`)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </StudentLayout>
  )
}
