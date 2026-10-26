import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import ActivityCard from '../components/common/ActivityCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  IconClipboardCheck,
  IconClubs,
  IconActivity,
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconUsers,
  IconCheck,
  IconAlertCircle,
  IconTrophy,
  IconSparkles,
  IconCamera,
  IconTrendingUp,
  IconGlobe,
  IconHelp,
} from '../components/icons/Icons'
import {
  upcomingActivities as initialUpcomingActivities,
  myClubs as initialClubs,
} from '../data/studentDashboardData'
import { initialRegistrations } from '../data/registrationsData'
import {
  getNotificationsForRole,
  NOTIFICATIONS_EVENT_KEY,
} from '../data/notificationsData'
import { initialClubsData, CLUBS_EVENT_KEY } from '../data/clubsData'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function normalizeDashboardClub(c) {
  return {
    id: c.slug || c.id,
    slug: c.slug || c.id,
    name: c.name || 'Club',
    category: c.category || 'General',
    role: c.role || (c.membershipStatus === 'Pending' ? 'Pending Approval' : 'Member'),
    memberCount: c.membersCount ?? c.members_count ?? c.memberCount ?? 0,
    avatar: c.avatar || c.avatarText || c.avatar_text || (c.name ? c.name.slice(0, 2).toUpperCase() : 'CL'),
    color: c.gradient || c.color || 'from-blue-600 to-indigo-600',
  }
}

function getCategoryDesign(category) {
  const c = (category || '').toLowerCase()
  switch (c) {
    case 'workshop':
      return { badgeVariant: 'primary', thumbnailGradient: 'from-blue-600 to-indigo-700' }
    case 'hackathon':
      return { badgeVariant: 'secondary', thumbnailGradient: 'from-indigo-600 to-purple-700' }
    case 'competition':
      return { badgeVariant: 'warning', thumbnailGradient: 'from-amber-500 to-orange-600' }
    case 'seminar':
    case 'webinar':
      return { badgeVariant: 'neutral', thumbnailGradient: 'from-sky-600 to-blue-800' }
    case 'cultural':
      return { badgeVariant: 'accent', thumbnailGradient: 'from-rose-500 to-pink-600' }
    case 'sports':
      return { badgeVariant: 'info', thumbnailGradient: 'from-emerald-600 to-teal-700' }
    case 'technical':
      return { badgeVariant: 'neutral', thumbnailGradient: 'from-cyan-600 to-blue-700' }
    default:
      return { badgeVariant: 'primary', thumbnailGradient: 'from-blue-600 to-indigo-700' }
  }
}

function formatDisplayTime(startTime, endTime) {
  if (!startTime) return 'Time TBA'
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
  const start = formatSingle(startTime)
  const end = formatSingle(endTime)
  return start && end ? `${start} - ${end}` : start || 'Time TBA'
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Date TBA'
  try {
    const d = new Date(dateStr)
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

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, profile, isDemo } = useAuth()

  // 1. Resolve canonical active student profile
  const activeUser = useMemo(() => {
    if (profile) {
      return {
        id: profile.id || user?.id,
        name: profile.full_name || profile.fullName || 'Student',
        fullName: profile.full_name || profile.fullName || 'Student',
        email: profile.email || user?.email || '',
        role: profile.role || 'student',
        studentId: profile.student_id || profile.studentId,
        department: profile.department,
        course: profile.course,
        academicYear: profile.academic_year || profile.academicYear,
      }
    }
    if (user) {
      return {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        role: user.user_metadata?.role || 'student',
      }
    }
    try {
      const raw = localStorage.getItem('campuslive_user')
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return null
  }, [profile, user])

  const studentFirstName = useMemo(() => {
    const full = profile?.fullName || profile?.full_name || user?.user_metadata?.full_name
    if (!full || !full.trim()) return 'Student'
    return full.trim().split(' ')[0]
  }, [profile, user])

  // 2. Upcoming Activities & Registrations state
  const [upcomingList, setUpcomingList] = useState(initialUpcomingActivities)
  const [registrationsList, setRegistrationsList] = useState(initialRegistrations)

  // 3. Live Clubs Preview state
  const [clubsList, setClubsList] = useState([])
  const [isClubsLoading, setIsClubsLoading] = useState(true)
  const [clubsSource, setClubsSource] = useState('demo') // 'live' | 'demo'

  // 4. Live Notifications Preview state
  const [notificationsList, setNotificationsList] = useState([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true)

  // Fetch real registrations & activities concurrently with graceful demo fallback
  useEffect(() => {
    let ignore = false

    const loadInitial = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token

        // Check if user is in Demo Mode
        if (!token) {
          if (!ignore) {
            setUpcomingList(initialUpcomingActivities)
            setRegistrationsList(initialRegistrations)
          }
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }

        // Concurrently fetch user registrations and visible activities
        const [regRes, actRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/registrations/my`, { method: 'GET', headers }),
          fetch(`${API_BASE_URL}/api/activities`, { method: 'GET', headers }),
        ])

        // Process registrations response
        if (regRes.status === 'fulfilled' && regRes.value.ok && !ignore) {
          const regData = await regRes.value.json()
          setRegistrationsList(regData.registrations || [])
        }

        // Process activities response
        if (actRes.status === 'fulfilled' && actRes.value.ok && !ignore) {
          const actData = await actRes.value.json()
          const rawActivities = actData.activities || []

          if (rawActivities.length > 0) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            // Strictly filter for published/upcoming statuses and dates that are today or in the future
            const validUpcoming = rawActivities.filter((item) => {
              const status = (item.status || '').toLowerCase()
              const isExcludedStatus =
                status === 'draft' ||
                status === 'cancelled' ||
                status === 'archived' ||
                status === 'completed'
              if (isExcludedStatus) return false

              if (item.date) {
                const eventDate = new Date(item.date)
                if (!isNaN(eventDate.getTime())) {
                  const target = new Date(eventDate)
                  target.setHours(0, 0, 0, 0)
                  return target >= today
                }
              }
              return true
            })

            const formattedUpcoming = validUpcoming.slice(0, 6).map((item) => {
              const { badgeVariant, thumbnailGradient } = getCategoryDesign(item.category)
              return {
                id: item.id,
                title: item.title,
                category: item.category || 'Workshop',
                date: formatDisplayDate(item.date),
                time: formatDisplayTime(item.startTime, item.endTime),
                venue: item.venue || 'Campus Venue',
                organizer: item.organizer || 'Campus Live',
                status: item.status === 'upcoming' ? 'Upcoming' : item.status || 'Upcoming',
                statusVariant: 'info',
                badgeVariant,
                thumbnailGradient,
                spotsLeft: item.spotsLeft || item.maxParticipants || 50,
              }
            })
            setUpcomingList(formattedUpcoming)
          }
        }
      } catch (err) {
        console.warn('[StudentDashboard] Notice loading live data:', err.message)
      }
    }

    loadInitial()

    return () => {
      ignore = true
    }
  }, [])

  // Synchronize notifications preview with existing notification service and event bus
  useEffect(() => {
    let ignore = false

    const syncNotifications = () => {
      const notifs = getNotificationsForRole('student', activeUser)
      if (!ignore) {
        setNotificationsList(notifs)
        setIsNotificationsLoading(false)
      }
    }

    syncNotifications()

    window.addEventListener(NOTIFICATIONS_EVENT_KEY, syncNotifications)
    window.addEventListener('storage', syncNotifications)

    return () => {
      ignore = true
      window.removeEventListener(NOTIFICATIONS_EVENT_KEY, syncNotifications)
      window.removeEventListener('storage', syncNotifications)
    }
  }, [activeUser])

  const unreadNotificationsCount = useMemo(
    () => notificationsList.filter((n) => n.isUnread).length,
    [notificationsList]
  )

  // Fetch real clubs memberships from GET /api/clubs/my with resilient demo fallback
  useEffect(() => {
    let ignore = false

    const loadClubs = async () => {
      setIsClubsLoading(true)

      const isDemoSession = isDemo || user?.isDemo
      let token = null
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        token = session?.access_token
      } catch {
        // ignore
      }

      // A. Offline demo fallback: resolve from demo memberships overlay
      if (isDemoSession || !token) {
        try {
          const savedDemo = JSON.parse(
            localStorage.getItem('campuslive_demo_club_memberships') || '{}'
          )
          const hasSavedDemo = Object.keys(savedDemo).length > 0

          let demoClubs = []
          if (hasSavedDemo) {
            demoClubs = initialClubsData
              .filter((c) => {
                const status = savedDemo[c.id]?.status
                return status === 'joined' || status === 'pending'
              })
              .map(normalizeDashboardClub)
          } else {
            // Initial baseline demo clubs
            demoClubs = initialClubs.map(normalizeDashboardClub)
          }

          if (!ignore) {
            setClubsList(demoClubs)
            setClubsSource('demo')
          }
        } catch {
          if (!ignore) {
            setClubsList(initialClubs.map(normalizeDashboardClub))
            setClubsSource('demo')
          }
        } finally {
          if (!ignore) {
            setIsClubsLoading(false)
          }
        }
        return
      }

      // B. Authenticated mode: call GET /api/clubs/my
      try {
        const res = await fetch(`${API_BASE_URL}/api/clubs/my`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}))
          throw new Error(errJson.message || `Server returned ${res.status}`)
        }

        const data = await res.json()
        const rawClubs = Array.isArray(data.clubs) ? data.clubs : []
        const isLive = data.source === 'live' && !data.isDemo

        if (!ignore) {
          if (isLive) {
            setClubsList(rawClubs.map(normalizeDashboardClub))
            setClubsSource('live')
          } else {
            // Fallback demo dataset from server: overlay local demo memberships if present
            try {
              const savedDemo = JSON.parse(
                localStorage.getItem('campuslive_demo_club_memberships') || '{}'
              )
              if (Object.keys(savedDemo).length > 0) {
                const overlaid = initialClubsData
                  .filter((c) => {
                    const status = savedDemo[c.id]?.status
                    return status === 'joined' || status === 'pending'
                  })
                  .map(normalizeDashboardClub)
                setClubsList(overlaid)
              } else {
                setClubsList(rawClubs.map(normalizeDashboardClub))
              }
            } catch {
              setClubsList(rawClubs.map(normalizeDashboardClub))
            }
            setClubsSource('demo')
          }
        }
      } catch (err) {
        console.warn('[StudentDashboard] Clubs fetch notice, falling back to local demo:', err.message)
        if (!ignore) {
          try {
            const savedDemo = JSON.parse(
              localStorage.getItem('campuslive_demo_club_memberships') || '{}'
            )
            const hasSavedDemo = Object.keys(savedDemo).length > 0
            const demoClubs = hasSavedDemo
              ? initialClubsData
                  .filter((c) => savedDemo[c.id]?.status === 'joined')
                  .map(normalizeDashboardClub)
              : initialClubs.map(normalizeDashboardClub)
            setClubsList(demoClubs)
          } catch {
            setClubsList(initialClubs.map(normalizeDashboardClub))
          }
          setClubsSource('demo')
        }
      } finally {
        if (!ignore) {
          setIsClubsLoading(false)
        }
      }
    }

    loadClubs()

    const handleClubsEvent = () => {
      if (!ignore) loadClubs()
    }

    window.addEventListener(CLUBS_EVENT_KEY, handleClubsEvent)
    window.addEventListener('storage', handleClubsEvent)
    window.addEventListener('focus', handleClubsEvent)

    return () => {
      ignore = true
      window.removeEventListener(CLUBS_EVENT_KEY, handleClubsEvent)
      window.removeEventListener('storage', handleClubsEvent)
      window.removeEventListener('focus', handleClubsEvent)
    }
  }, [isDemo, user])

  // Dynamically calculate KPI counts from actual returned records
  // Excludes cancelled registrations
  const activeRegistrationsCount = useMemo(
    () =>
      registrationsList.filter(
        (r) =>
          r.status &&
          r.status.toLowerCase() !== 'cancelled' &&
          (r.status.toLowerCase() === 'registered' || r.status.toLowerCase() === 'confirmed')
      ).length,
    [registrationsList]
  )

  // Dynamically calculate unique event categories available across events
  const eventCategoriesCount = useMemo(() => {
    const categorySet = new Set()
    upcomingList.forEach((a) => {
      if (a.category) categorySet.add(a.category)
    })
    registrationsList.forEach((r) => {
      if (r.category) categorySet.add(r.category)
    })
    return categorySet.size || 4
  }, [upcomingList, registrationsList])

  const upcomingEventsCount = useMemo(
    () => upcomingList.length,
    [upcomingList]
  )

  // 1. Summary statistics cards calculated dynamically from real data
  const summaryStats = useMemo(
    () => [
      {
        title: 'Registered Activities',
        value: String(activeRegistrationsCount),
        icon: <IconClipboardCheck className="w-5 h-5 text-blue-600" />,
        iconBg: 'bg-blue-50 text-blue-600',
        change: activeRegistrationsCount > 0 ? `${activeRegistrationsCount} Active` : '0 Active',
        changeType: 'positive',
        helperText: 'Active bookings (excludes cancelled)',
      },
      {
        title: 'Upcoming Activities',
        value: String(upcomingEventsCount),
        icon: <IconCalendar className="w-5 h-5 text-amber-600" />,
        iconBg: 'bg-amber-50 text-amber-600',
        change: 'Open Now',
        changeType: 'positive',
        helperText: 'Scheduled & open for registration',
      },
      {
        title: 'Event Categories',
        value: String(eventCategoriesCount),
        icon: <IconSparkles className="w-5 h-5 text-purple-600" />,
        iconBg: 'bg-purple-50 text-purple-600',
        change: `${eventCategoriesCount} Tracks`,
        changeType: 'neutral',
        helperText: 'Workshops, hackathons & seminars',
      },
      {
        title: 'Clubs Joined',
        value: String(clubsList.length),
        icon: <IconClubs className="w-5 h-5 text-indigo-600" />,
        iconBg: 'bg-indigo-50 text-indigo-600',
        change: clubsSource === 'live' ? `${clubsList.length} Active` : 'Demo Data',
        changeType: 'neutral',
        helperText: clubsSource === 'live' ? 'Active club memberships' : 'Campus club chapters (Demo)',
      },
    ],
    [activeRegistrationsCount, upcomingEventsCount, eventCategoriesCount, clubsList.length, clubsSource]
  )

  // 2. Activity Categories
  const categories = [
    {
      name: 'Workshops',
      query: 'Workshop',
      icon: <IconActivity className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50/80 border-blue-200/70 hover:border-blue-300 text-blue-900',
      tagBg: 'bg-blue-100/80 text-blue-700',
      count: '8 Events',
    },
    {
      name: 'Seminars',
      query: 'Seminar',
      icon: <IconUsers className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80 border-purple-200/70 hover:border-purple-300 text-purple-900',
      tagBg: 'bg-purple-100/80 text-purple-700',
      count: '5 Events',
    },
    {
      name: 'Competitions',
      query: 'Competition',
      icon: <IconTrophy className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-200/70 hover:border-amber-300 text-amber-900',
      tagBg: 'bg-amber-100/80 text-amber-700',
      count: '4 Events',
    },
    {
      name: 'Hackathons',
      query: 'Hackathon',
      icon: <IconSparkles className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50/80 border-indigo-200/70 hover:border-indigo-300 text-indigo-900',
      tagBg: 'bg-indigo-100/80 text-indigo-700',
      count: '3 Events',
    },
    {
      name: 'Cultural',
      query: 'Cultural',
      icon: <IconCamera className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50/80 border-rose-200/70 hover:border-rose-300 text-rose-900',
      tagBg: 'bg-rose-100/80 text-rose-700',
      count: '6 Events',
    },
    {
      name: 'Sports',
      query: 'Sports',
      icon: <IconTrendingUp className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-200/70 hover:border-emerald-300 text-emerald-900',
      tagBg: 'bg-emerald-100/80 text-emerald-700',
      count: '4 Events',
    },
    {
      name: 'Technical',
      query: 'Technical',
      icon: <IconGlobe className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50/80 border-cyan-200/70 hover:border-cyan-300 text-cyan-900',
      tagBg: 'bg-cyan-100/80 text-cyan-700',
      count: '9 Events',
    },
  ]

  const handleCategoryClick = (cat) => {
    navigate(`/student/activities?category=${encodeURIComponent(cat.query)}`)
  }

  return (
    <StudentLayout>
      {/* 1. Welcome Section */}
      <PageHeader
        title={`Good Morning, ${studentFirstName} 👋`}
        subtitle="Stay updated with what's happening on campus."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Badge variant="primary" size="md" dot>
              Fall Semester 2026
            </Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<IconCalendar className="w-4 h-4" />}
              onClick={() => navigate('/student/activities')}
              className="font-semibold shadow-2xs"
            >
              Explore Activities
            </Button>
          </div>
        }
      />

      {/* 2. 4 Summary Cards Grid */}
      <section aria-label="Student Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {summaryStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBg={stat.iconBg}
            change={stat.change}
            changeType={stat.changeType}
            helperText={stat.helperText}
          />
        ))}
      </section>

      {/* 3. Explore by Category Section */}
      <section aria-label="Activity Categories" className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse campus events and workshops tailored to your interests
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`p-3 rounded-xl border ${cat.bg} transition-all duration-150 flex flex-col items-center text-center justify-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer group`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {cat.name}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.tagBg}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Upcoming Activities Section */}
      <section aria-label="Upcoming Activities" className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Upcoming Activities</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {upcomingList.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Featured campus events, workshops, and competitions open for registration
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/activities')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer shrink-0"
          >
            <span>View All Activities</span>
            <IconChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {upcomingList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingList.map((act) => (
              <ActivityCard
                key={act.id}
                id={act.id}
                title={act.title}
                category={act.category}
                date={act.date}
                time={act.time}
                venue={act.venue}
                organizer={act.organizer}
                status={act.status}
                statusVariant={act.statusVariant}
                badgeVariant={act.badgeVariant}
                thumbnailGradient={act.thumbnailGradient}
                spotsLeft={act.spotsLeft}
                actionText="View Details"
                onAction={() => navigate(`/student/activities/${act.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming activities"
            description="There are currently no upcoming activities scheduled. Check back soon for new announcements!"
            actionText="Explore All Activities"
            onAction={() => navigate('/student/activities')}
          />
        )}
      </section>

      {/* 5. Main 2-Column Split: Left (Registrations + Clubs) & Right (Notifications + Support) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Recent Registrations & Clubs Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Registrations Section */}
          <section aria-label="Recent Registrations">
            <Card
              title="Recent Registrations"
              subtitle="Your active and confirmed campus activity bookings"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/my-registrations')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>View All</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {registrationsList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {/* Table header for desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Activity</div>
                    <div className="col-span-3">Schedule</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>

                  {/* List rows */}
                  {registrationsList.slice(0, 4).map((reg) => (
                    <div
                      key={reg.id}
                      className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="sm:col-span-5 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {reg.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-600">{reg.category}</span>
                          <span>&bull;</span>
                          <span className="truncate">{reg.venue}</span>
                        </div>
                      </div>

                      <div className="sm:col-span-3 text-xs text-slate-600">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{reg.date}</span>
                        </div>
                        {reg.time && (
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <IconClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{reg.time}</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Badge variant={reg.statusVariant || 'primary'} size="sm" dot>
                          {reg.status}
                        </Badge>
                      </div>

                      <div className="sm:col-span-2 sm:text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/student/activities/${reg.activityId || reg.id}`)}
                          className="w-full sm:w-auto text-xs font-semibold justify-center"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No recent registrations"
                    description="You haven't registered for any campus activities yet. Explore upcoming events to get involved!"
                    actionText="Explore Activities"
                    onAction={() => navigate('/student/activities')}
                  />
                </div>
              )}
            </Card>
          </section>

          {/* Clubs Preview Section */}
          <section aria-label="Clubs Preview">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span>Clubs</span>
                  {clubsSource === 'live' ? (
                    <Badge variant="success" size="xs">
                      Live
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="xs">
                      Demo Mode
                    </Badge>
                  )}
                </div>
              }
              subtitle="Student organizations and technical chapters"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/clubs')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>Explore Clubs</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {isClubsLoading ? (
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="bg-slate-50/70 rounded-xl border border-slate-200/60 p-4 animate-pulse flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200" />
                            <div className="w-16 h-5 rounded-full bg-slate-200" />
                          </div>
                          <div className="w-24 h-4 bg-slate-200 rounded mb-2" />
                          <div className="w-16 h-3 bg-slate-200 rounded" />
                        </div>
                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                          <div className="w-12 h-3 bg-slate-200 rounded" />
                          <div className="w-16 h-6 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : clubsList.length > 0 ? (
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {clubsList.map((club) => (
                      <div
                        key={club.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${club.color || 'from-blue-600 to-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {club.avatar || club.name.slice(0, 2).toUpperCase()}
                            </div>
                            <Badge variant="neutral" size="sm">
                              {club.category}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {club.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <IconUsers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{club.memberCount} members</span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {club.role || 'Member'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/clubs/${club.id}`)}
                            className="text-xs font-semibold px-2.5 py-1"
                          >
                            View Club
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No clubs joined"
                    description="Discover clubs to meet fellow students and grow your technical & creative skills."
                    actionText="Explore Clubs"
                    onAction={() => navigate('/student/clubs')}
                  />
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* RIGHT COLUMN: Recent Notifications & Quick Support */}
        <div className="space-y-8">
          {/* Recent Notifications Section */}
          <section aria-label="Recent Notifications">
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span>Recent Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <Badge variant="info" size="xs">
                      {unreadNotificationsCount} Unread
                    </Badge>
                  )}
                </div>
              }
              subtitle="Latest activity updates and reminders"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/notifications')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>View All</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {isNotificationsLoading ? (
                <div className="divide-y divide-slate-100 p-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-3 bg-slate-200 rounded" />
                        <div className="w-full h-3 bg-slate-100 rounded" />
                        <div className="w-1/4 h-2 bg-slate-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notificationsList.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-100 p-2">
                    {notificationsList.slice(0, 4).map((notif) => {
                      const notifIcon =
                        notif.type === 'activity' ? (
                          <IconActivity className="w-4 h-4 text-blue-600" />
                        ) : notif.type === 'success' ? (
                          <IconCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <IconAlertCircle className="w-4 h-4 text-amber-600" />
                        )

                      const notifBg =
                        notif.type === 'activity'
                          ? 'bg-blue-50'
                          : notif.type === 'success'
                          ? 'bg-emerald-50'
                          : 'bg-amber-50'

                      return (
                        <div
                          key={notif.id}
                          onClick={() => navigate('/student/notifications')}
                          className={`p-3.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                            notif.isUnread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${notifBg} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            {notifIcon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5
                                className={`text-xs truncate ${
                                  notif.isUnread
                                    ? 'font-bold text-slate-900'
                                    : 'font-semibold text-slate-700'
                                }`}
                              >
                                {notif.title}
                              </h5>
                              {notif.isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                              {notif.time || notif.date || 'Recent'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/student/notifications')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Notifications</span>
                      <IconChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No notifications"
                    description="You are all caught up! No unread activity alerts or announcements."
                    actionText="Notification Center"
                    onAction={() => navigate('/student/notifications')}
                  />
                </div>
              )}
            </Card>
          </section>

          {/* Quick Support & Resources Card */}
          <section aria-label="Student Help & Quick Links">
            <Card padding="md" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-blue-400">
                  <IconHelp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Need Activity Assistance?</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Questions about your registrations, venue access, or club memberships?
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/student/support')}
                      className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs border-0 cursor-pointer"
                    >
                      Contact Support
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/student/my-registrations')}
                      className="text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer"
                    >
                      My Registrations
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </StudentLayout>
  )
}
