import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import {
  IconUsers,
  IconActivity,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconMail,
  IconCheck,
  IconArrowLeft,
  IconUser,
  IconClose,
  IconAlertCircle,
} from '../components/icons/Icons'
import { getClubById, CLUBS_EVENT_KEY } from '../data/clubsData'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ClubDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Club data & loading states
  const [clubState, setClubState] = useState(() => getClubById(id))
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('demo')
  const [toast, setToast] = useState(null)

  // Scroll to top on load or ID change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const [reloadToken, setReloadToken] = useState(0)
  const refreshClubDetails = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setReloadToken((k) => k + 1)
  }, [])

  // Fetch single club details from API with demo fallback
  useEffect(() => {
    let ignore = false

    const loadClubDetails = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const headers = {}
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE_URL}/api/clubs/${id}`, {
          method: 'GET',
          headers,
        })

        if (response.status === 404) {
          if (!ignore) {
            setClubState(null)
            setDataSource('live')
          }
          return
        }

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}))
          throw new Error(errorJson.message || `Server returned ${response.status}`)
        }

        const result = await response.json()
        if (result.success && result.club) {
          let loaded = result.club
          if (!ignore) {
            setDataSource(result.source || 'live')
          }

          // If demo fallback, also check local demo membership overlay
          if (result.source === 'demo') {
            try {
              const savedDemo = JSON.parse(
                localStorage.getItem('campuslive_demo_club_memberships') || '{}'
              )
              if (savedDemo[loaded.id]) {
                const dm = savedDemo[loaded.id]
                const effStatus = dm.status === 'joined' ? 'Joined' : dm.status === 'pending' ? 'Pending' : 'Not Joined'
                loaded = {
                  ...loaded,
                  membershipStatus: effStatus,
                  membersCount:
                    dm.status === 'joined' && loaded.membershipStatus !== 'Joined'
                      ? loaded.membersCount + 1
                      : dm.status === 'left' && loaded.membershipStatus === 'Joined'
                      ? Math.max(0, loaded.membersCount - 1)
                      : loaded.membersCount,
                }
              }
            } catch {
              // ignore
            }
          }
          if (!ignore) setClubState(loaded)
        } else {
          const local = getClubById(id)
          if (!ignore) {
            setClubState(local)
            setDataSource('demo')
          }
        }
      } catch (err) {
        console.warn('[ClubDetails] Fetch error, falling back to local dataset:', err.message || err)
        const local = getClubById(id)
        if (local) {
          try {
            const savedDemo = JSON.parse(
              localStorage.getItem('campuslive_demo_club_memberships') || '{}'
            )
            if (savedDemo[local.id]) {
              const dm = savedDemo[local.id]
              const effStatus = dm.status === 'joined' ? 'Joined' : dm.status === 'pending' ? 'Pending' : 'Not Joined'
              if (!ignore) {
                setClubState({
                  ...local,
                  membershipStatus: effStatus,
                  membersCount:
                    dm.status === 'joined' && local.membershipStatus !== 'Joined'
                      ? local.membersCount + 1
                      : dm.status === 'left' && local.membershipStatus === 'Joined'
                      ? Math.max(0, local.membersCount - 1)
                      : local.membersCount,
                })
              }
            } else {
              if (!ignore) setClubState(local)
            }
          } catch {
            if (!ignore) setClubState(local)
          }
        } else {
          if (!ignore) setClubState(null)
        }
        if (!ignore) {
          setDataSource('demo')
          setError('Could not connect to live clubs server. Displaying local demo data.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadClubDetails()
    return () => {
      ignore = true
    }
  }, [id, reloadToken])

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Handle Join Club (server-backed with demo fallback)
  const handleJoinClub = async () => {
    if (!clubState || isSubmitting) return
    setIsSubmitting(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      let joinedSuccess = false
      let updatedMembersCount = clubState.membersCount + 1
      let serverMessage = `You have successfully joined ${clubState.name}! Welcome to the community.`

      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${clubState.id}/join`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const resData = await res.json().catch(() => ({}))
        if (!res.ok) {
          if (res.status === 409) {
            showToast(resData.message || `You are already a member of ${clubState.name}.`, 'info')
            refreshClubDetails()
            return
          }
          throw new Error(resData.message || 'Failed to join club on the server.')
        }

        joinedSuccess = true
        if (typeof resData.membersCount === 'number') {
          updatedMembersCount = resData.membersCount
        }
        if (resData.message) {
          serverMessage = resData.message
        }
      } else {
        // Safe offline / demo client join
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          savedDemo[clubState.id] = { status: 'joined', joinedAt: new Date().toISOString() }
          localStorage.setItem('campuslive_demo_club_memberships', JSON.stringify(savedDemo))
        } catch {
          // ignore
        }
        joinedSuccess = true
        serverMessage = `You have joined ${clubState.name} (Demo Mode).`
      }

      if (joinedSuccess) {
        setClubState((prev) => ({
          ...prev,
          membershipStatus: 'Joined',
          membersCount: updatedMembersCount,
        }))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(CLUBS_EVENT_KEY, {
              detail: { clubId: clubState.id, status: 'joined' },
            })
          )
        }
        showToast(serverMessage, 'success')
      }
    } catch (err) {
      console.error('[ClubDetails] Join error:', err)
      showToast(err.message || 'Failed to join club. Please try again.', 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Leave Club (server-backed with demo fallback)
  const handleLeaveClub = async () => {
    if (!clubState || isSubmitting) return
    setIsSubmitting(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      let leaveSuccess = false
      let updatedMembersCount = Math.max(0, clubState.membersCount - 1)
      let serverMessage = `You have left ${clubState.name}.`

      if (token) {
        const res = await fetch(`${API_BASE_URL}/api/clubs/${clubState.id}/leave`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const resData = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error(resData.message || 'Failed to leave club on the server.')
        }

        leaveSuccess = true
        if (typeof resData.membersCount === 'number') {
          updatedMembersCount = resData.membersCount
        }
        if (resData.message) {
          serverMessage = resData.message
        }
      } else {
        // Safe offline / demo client leave
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          savedDemo[clubState.id] = { status: 'left', leftAt: new Date().toISOString() }
          localStorage.setItem('campuslive_demo_club_memberships', JSON.stringify(savedDemo))
        } catch {
          // ignore
        }
        leaveSuccess = true
        serverMessage = `You have left ${clubState.name} (Demo Mode).`
      }

      if (leaveSuccess) {
        setClubState((prev) => ({
          ...prev,
          membershipStatus: 'Not Joined',
          membersCount: updatedMembersCount,
        }))
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent(CLUBS_EVENT_KEY, {
              detail: { clubId: clubState.id, status: 'left' },
            })
          )
        }
        showToast(serverMessage, 'info')
      }
    } catch (err) {
      console.error('[ClubDetails] Leave error:', err)
      showToast(err.message || 'Failed to leave club. Please try again.', 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Cancel Request
  const handleCancelRequest = async () => {
    // For pending requests, canceling is handled by leaving/clearing the request
    await handleLeaveClub()
  }

  // Loading State
  if (isLoading && !clubState) {
    return (
      <StudentLayout>
        <div className="py-16">
          <LoadingState message="Loading club details..." />
        </div>
      </StudentLayout>
    )
  }

  // Not Found State
  if (!clubState) {
    return (
      <StudentLayout>
        <div className="py-12">
          <EmptyState
            title="Club Not Found"
            description={`We could not find any student club with the identifier "${id}". Please explore all available clubs in the directory.`}
            actionLabel="Back to Clubs"
            onAction={() => navigate('/student/clubs')}
          />
        </div>
      </StudentLayout>
    )
  }

  // Status configuration
  const statusBadgeConfig = {
    Joined: {
      variant: 'success',
      label: 'Joined Member',
      icon: <IconCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />,
    },
    Pending: {
      variant: 'warning',
      label: 'Pending Approval',
      icon: <IconClock className="w-3.5 h-3.5 text-amber-600 inline mr-1" />,
    },
    'Not Joined': {
      variant: 'neutral',
      label: 'Not Joined',
      icon: null,
    },
  }

  const currentStatusConfig =
    statusBadgeConfig[clubState.membershipStatus] || statusBadgeConfig['Not Joined']

  return (
    <StudentLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'danger'
                ? 'bg-rose-500'
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

      {/* Error / Offline Retry Banner */}
      {error && (
        <div className="mb-5 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-800 text-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshClubDetails()}
            className="shrink-0 text-amber-800 border-amber-300 hover:bg-amber-100"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Top Back Navigation & Breadcrumb */}
      <div className="mb-5 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/clubs')}
          className="text-slate-600 hover:text-slate-900 -ml-2 gap-1.5"
          icon={<IconArrowLeft className="w-4 h-4" />}
        >
          Back to Clubs
        </Button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => navigate('/student/clubs')}
          >
            Clubs
          </span>
          <span>/</span>
          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
            {clubState.name}
          </span>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs mb-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50/60 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5 min-w-0">
            {/* Club Logo Avatar */}
            <div
              className={`w-18 h-18 md:w-22 md:h-22 rounded-2xl bg-gradient-to-br ${
                clubState.gradient || 'from-blue-600 to-indigo-600'
              } text-white font-bold flex items-center justify-center text-2xl md:text-3xl shadow-sm shrink-0 tracking-wider`}
            >
              {clubState.avatarText}
            </div>

            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="secondary" size="sm">
                  {clubState.category}
                </Badge>
                <Badge variant={currentStatusConfig.variant} size="sm">
                  {currentStatusConfig.icon}
                  {currentStatusConfig.label}
                </Badge>
                {dataSource === 'demo' && (
                  <Badge variant="warning" size="sm">
                    Offline Demo
                  </Badge>
                )}
                <span className="text-xs text-slate-500 font-medium">
                  Est. {clubState.founded}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {clubState.name}
              </h1>

              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {clubState.description}
              </p>
            </div>
          </div>

          {/* Hero Action Button */}
          <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
            {clubState.membershipStatus === 'Joined' && (
              <Button
                variant="outline"
                size="md"
                onClick={handleLeaveClub}
                disabled={isSubmitting}
                className="w-full md:w-auto text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              >
                {isSubmitting ? 'Leaving...' : 'Leave Club'}
              </Button>
            )}

            {clubState.membershipStatus === 'Pending' && (
              <Button
                variant="outline"
                size="md"
                onClick={handleCancelRequest}
                disabled={isSubmitting}
                className="w-full md:w-auto text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Request'}
              </Button>
            )}

            {clubState.membershipStatus === 'Not Joined' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleJoinClub}
                disabled={isSubmitting}
                className="w-full md:w-auto shadow-xs"
              >
                {isSubmitting ? 'Joining...' : 'Join Club'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Club Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IconUsers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{clubState.membersCount}</div>
            <div className="text-xs font-medium text-slate-500">Active Members</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IconActivity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{clubState.activitiesCount}</div>
            <div className="text-xs font-medium text-slate-500">Activities Conducted</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IconCalendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {clubState.upcomingActivities?.length || clubState.upcomingCount || 0}
            </div>
            <div className="text-xs font-medium text-slate-500">Upcoming Activities</div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* About the Club Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span>About the Club</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {clubState.aboutLong || clubState.description}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Weekly workshops, practice sessions, and peer mentorship</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Inter-collegiate competitive team representation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Access to specialized campus labs and maker equipment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Organizing flagship campus events and showcases</span>
              </div>
            </div>
          </div>

          {/* Upcoming Club Activities Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upcoming Club Activities</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled workshops, contests, and meets organized by {clubState.name}
                </p>
              </div>
              <Badge variant="secondary" size="sm">
                {clubState.upcomingActivities?.length || 0} Scheduled
              </Badge>
            </div>

            {clubState.upcomingActivities && clubState.upcomingActivities.length > 0 ? (
              <div className="space-y-3.5">
                {clubState.upcomingActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {act.type}
                        </Badge>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {act.badge || 'Upcoming'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {act.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                          {act.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock className="w-3.5 h-3.5 text-slate-400" />
                          {act.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                          {act.venue}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/student/activities')}
                        className="text-xs shadow-2xs w-full sm:w-auto"
                      >
                        View Activity
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No upcoming activities scheduled at the moment. Stay tuned for upcoming announcements!
              </div>
            )}
          </div>

          {/* Recent Club Activities Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Recent Activities & Highlights</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Past events and achievements conducted by {clubState.name}
              </p>
            </div>

            {clubState.recentActivities && clubState.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {clubState.recentActivities.map((past) => (
                  <div
                    key={past.id}
                    className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">
                          {past.type}
                        </Badge>
                        <span className="text-xs text-slate-500">{past.date}</span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900">{past.title}</h4>
                      {past.outcome && (
                        <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                          {past.outcome}
                        </p>
                      )}
                    </div>

                    {past.attendees && (
                      <div className="shrink-0 text-xs text-slate-500 flex items-center gap-1.5 sm:self-center">
                        <IconUsers className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{past.attendees}</span>
                        <span>attendees</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No past activities records available.
              </div>
            )}
          </div>

          {/* Members & Leadership Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Club Leadership & Members</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core committee, volunteers, and student members
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {clubState.members?.length || 0} Listed
              </span>
            </div>

            {clubState.members && clubState.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {clubState.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                        {member.avatar || member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {member.department}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        member.role.includes('Lead') || member.role.includes('President') || member.role.includes('Secretary')
                          ? 'primary'
                          : member.role.includes('Core')
                          ? 'secondary'
                          : member.role.includes('Volunteer')
                          ? 'info'
                          : 'neutral'
                      }
                      size="sm"
                      className="shrink-0"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                No member records listed.
              </div>
            )}
          </div>
        </div>

        {/* Right Column / Sidebar Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Club Information & Logistics Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Club Information
            </h3>

            {/* Faculty Coordinator */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <IconUser className="w-3.5 h-3.5 text-slate-400" />
                Faculty Coordinator
              </div>
              <div className="text-xs font-bold text-slate-900">
                {clubState.facultyCoordinator}
              </div>
              {clubState.facultyDepartment && (
                <div className="text-[11px] text-slate-600">
                  {clubState.facultyDepartment}
                </div>
              )}
              {clubState.facultyEmail && (
                <div className="text-[11px] text-blue-600 flex items-center gap-1 pt-0.5">
                  <IconMail className="w-3 h-3" />
                  <a href={`mailto:${clubState.facultyEmail}`} className="hover:underline">
                    {clubState.facultyEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Student Lead */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <IconUser className="w-3.5 h-3.5 text-slate-400" />
                Student Leadership
              </div>
              <div className="text-xs font-bold text-slate-900">
                {clubState.leadName}
              </div>
            </div>

            {/* Meetings & Schedule */}
            <div className="space-y-3 pt-1 text-xs">
              <div>
                <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconClock className="w-3.5 h-3.5 text-slate-400" />
                  Meeting Schedule
                </div>
                <div className="font-medium text-slate-800">
                  {clubState.meetingSchedule}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                  Official Venue
                </div>
                <div className="font-medium text-slate-800">
                  {clubState.venue}
                </div>
                {clubState.officeRoom && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Club Room: {clubState.officeRoom}
                  </div>
                )}
              </div>

              <div>
                <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1">
                  Eligibility Criteria
                </div>
                <div className="text-slate-600 leading-relaxed text-xs">
                  {clubState.eligibility}
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconMail className="w-3.5 h-3.5 text-slate-400" />
                  Contact Information
                </div>
                <a
                  href={`mailto:${clubState.email}`}
                  className="text-blue-600 hover:underline break-all block"
                >
                  {clubState.email}
                </a>
              </div>
            </div>
          </div>

          {/* Membership Actions & Quick Help */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-100 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Membership Information
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Joining a club connects you with fellow campus innovators, gives you priority access to exclusive workshops, and lets you help organize collegiate fests.
            </p>

            <div className="pt-2">
              {clubState.membershipStatus === 'Joined' ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>You are an active member of this club.</span>
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={handleLeaveClub}
                    disabled={isSubmitting}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                  >
                    {isSubmitting ? 'Leaving...' : 'Leave Club'}
                  </Button>
                </div>
              ) : clubState.membershipStatus === 'Pending' ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                    <IconClock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Your membership request is pending approval.</span>
                  </div>
                  <Button
                    variant="outline"
                    fullWidth
                    size="sm"
                    onClick={handleCancelRequest}
                    disabled={isSubmitting}
                    className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  >
                    {isSubmitting ? 'Cancelling...' : 'Cancel Request'}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={handleJoinClub}
                  disabled={isSubmitting}
                  className="shadow-xs"
                >
                  {isSubmitting ? 'Joining...' : `Join ${clubState.name}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
