import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import SearchBar from '../components/common/SearchBar'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import ActivityCard from '../components/common/ActivityCard'
import EmptyState from '../components/common/EmptyState'
import {
  IconSearch,
  IconCalendar,
  IconSparkles,
} from '../components/icons/Icons'
import {
  activityCategories,
  dateFilters,
  departmentFilters,
  statusFilters,
  allActivities,
} from '../data/activitiesData'
import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Format database date (YYYY-MM-DD) into user-friendly string
 */
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

/**
 * Format time strings (HH:MM:SS) into user-friendly range
 */
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

  const startFormatted = formatSingle(startTime)
  const endFormatted = formatSingle(endTime)

  if (startFormatted && endFormatted) {
    return `${startFormatted} - ${endFormatted}`
  }
  return startFormatted || 'Time TBA'
}

/**
 * Maps database activity status to display label and badge variants
 */
function getStatusDisplay(status) {
  const s = (status || '').toLowerCase()
  switch (s) {
    case 'upcoming':
    case 'open':
    case 'published':
      return { label: 'Open for Registration', variant: 'info' }
    case 'closing_soon':
      return { label: 'Registration Closing Soon', variant: 'warning' }
    case 'completed':
      return { label: 'Completed', variant: 'neutral' }
    case 'ongoing':
      return { label: 'Happening Now', variant: 'success' }
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Scheduled',
        variant: 'primary',
      }
  }
}

/**
 * Maps activity category to badge and gradient styling
 */
function getCategoryDesign(category) {
  const c = (category || '').toLowerCase()
  switch (c) {
    case 'workshop':
      return {
        badgeVariant: 'primary',
        thumbnailGradient: 'from-blue-600 to-indigo-700',
      }
    case 'hackathon':
      return {
        badgeVariant: 'secondary',
        thumbnailGradient: 'from-indigo-600 to-purple-700',
      }
    case 'competition':
      return {
        badgeVariant: 'warning',
        thumbnailGradient: 'from-amber-500 to-orange-600',
      }
    case 'seminar':
      return {
        badgeVariant: 'neutral',
        thumbnailGradient: 'from-emerald-600 to-teal-700',
      }
    case 'cultural':
      return {
        badgeVariant: 'accent',
        thumbnailGradient: 'from-rose-500 to-pink-600',
      }
    case 'sports':
      return {
        badgeVariant: 'info',
        thumbnailGradient: 'from-cyan-600 to-blue-700',
      }
    case 'technical':
      return {
        badgeVariant: 'neutral',
        thumbnailGradient: 'from-slate-700 to-slate-900',
      }
    default:
      return {
        badgeVariant: 'primary',
        thumbnailGradient: 'from-blue-600 to-indigo-600',
      }
  }
}

/**
 * Computes dynamic date grouping relative to current local time
 */
function getDateGroup(dateStr) {
  if (!dateStr) return null
  try {
    const actDate = new Date(dateStr)
    if (isNaN(actDate.getTime())) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(actDate)
    target.setHours(0, 0, 0, 0)

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays > 0 && diffDays <= 7) return 'this_week'
    if (diffDays > 0 && diffDays <= 30) return 'this_month'
    return 'future'
  } catch {
    return null
  }
}

export default function ExploreActivities() {
  const navigate = useNavigate()

  // Real Database Data State
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedDate, setSelectedDate] = useState('All Dates')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Fetch activities from Express API (GET /api/activities)
  const fetchActivities = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setIsLoading(true)
    }
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const headers = {}
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/activities`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}))
        throw new Error(
          errorJson.message || `Server returned status ${response.status}`
        )
      }

      const result = await response.json()
      setActivities(result.activities && result.activities.length > 0 ? result.activities : allActivities)
    } catch (err) {
      console.warn('[ExploreActivities] Notice: Using fallback activities dataset.', err.message || err)
      setActivities(allActivities)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false

    const loadInitial = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const headers = {}
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`
        }

        const response = await fetch(`${API_BASE_URL}/api/activities`, {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}))
          throw new Error(
            errorJson.message || `Server returned status ${response.status}`
          )
        }

        const result = await response.json()
        if (!ignore) {
          setActivities(result.activities && result.activities.length > 0 ? result.activities : allActivities)
        }
      } catch (err) {
        if (!ignore) {
          console.warn('[ExploreActivities] Notice: Using fallback activities dataset.', err.message || err)
          setActivities(allActivities)
          setError(null)
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
  }, [])

  // Check if any filter is active
  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedDate !== 'All Dates' ||
    selectedDepartment !== 'All Departments' ||
    selectedStatus !== 'All'

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedDate('All Dates')
    setSelectedDepartment('All Departments')
    setSelectedStatus('All')
  }

  // Filtered activities list
  const filteredAll = useMemo(() => {
    return activities.filter((act) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          act.title.toLowerCase().includes(q) ||
          (act.description && act.description.toLowerCase().includes(q)) ||
          act.category.toLowerCase().includes(q) ||
          (act.activityType && act.activityType.toLowerCase().includes(q)) ||
          act.organizer.toLowerCase().includes(q) ||
          act.venue.toLowerCase().includes(q) ||
          (act.department && act.department.toLowerCase().includes(q))
        if (!match) return false
      }

      // 2. Category / Activity Type
      if (selectedCategory !== 'All') {
        const c1 = (act.category || '').toLowerCase()
        const c2 = (act.activityType || '').toLowerCase()
        const sel = selectedCategory.toLowerCase()
        if (c1 !== sel && c2 !== sel) {
          return false
        }
      }

      // 3. Department
      if (selectedDepartment !== 'All Departments') {
        const d = (act.department || '').toLowerCase()
        const sel = selectedDepartment.toLowerCase()
        if (d !== sel && d !== 'all departments') {
          return false
        }
      }

      // 4. Status
      if (selectedStatus !== 'All') {
        const statusMeta = getStatusDisplay(act.status)
        const rawStatus = (act.status || '').toLowerCase()
        const filterStatus = selectedStatus.toLowerCase()
        if (
          !statusMeta.label.toLowerCase().includes(filterStatus) &&
          !rawStatus.includes(filterStatus)
        ) {
          return false
        }
      }

      // 5. Date Grouping
      if (selectedDate !== 'All Dates') {
        const dateGroup = getDateGroup(act.date)
        if (selectedDate === 'Today' && dateGroup !== 'today') return false
        if (
          selectedDate === 'This Week' &&
          dateGroup !== 'this_week' &&
          dateGroup !== 'today'
        ) {
          return false
        }
        if (
          selectedDate === 'This Month' &&
          dateGroup !== 'this_month' &&
          dateGroup !== 'this_week' &&
          dateGroup !== 'today'
        ) {
          return false
        }
      }

      return true
    })
  }, [activities, searchQuery, selectedCategory, selectedDate, selectedDepartment, selectedStatus])

  // Featured activities: first 3 or activities marked upcoming
  const featuredList = useMemo(() => {
    return activities.slice(0, 3)
  }, [activities])

  // Upcoming activities: remaining or all activities
  const upcomingList = useMemo(() => {
    return activities.length > 3 ? activities.slice(3) : activities
  }, [activities])

  return (
    <StudentLayout>
      {/* Page Header */}
      <PageHeader
        title="Explore Activities"
        subtitle="Discover upcoming events, workshops, competitions and more happening on campus."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Explore Activities' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/student/dashboard')}
            className="shadow-xs"
          >
            View My Registrations
          </Button>
        }
      />

      {/* Search & Filter Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs mb-8">
        {/* Large Search Bar */}
        <div className="mb-5">
          <SearchBar
            size="lg"
            placeholder="Search activities, workshops, competitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="shadow-2xs"
          />
        </div>

        {/* Activity Type Pills */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Activity Type
            </span>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Reset Type
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {activityCategories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }
                  `}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          {/* Date Filter */}
          <Select
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            options={dateFilters}
            className="text-xs"
          />

          {/* Department Filter */}
          <Select
            label="Department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            options={departmentFilters}
            className="text-xs"
          />

          {/* Status Filter */}
          <Select
            label="Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusFilters}
            className="text-xs"
          />
        </div>

        {/* Active Filters Summary & Reset */}
        {isFilterActive && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium">Active filters:</span>
              {searchQuery && (
                <Badge variant="primary" size="sm">
                  "{searchQuery}"
                </Badge>
              )}
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" size="sm">
                  Type: {selectedCategory}
                </Badge>
              )}
              {selectedDate !== 'All Dates' && (
                <Badge variant="neutral" size="sm">
                  Date: {selectedDate}
                </Badge>
              )}
              {selectedDepartment !== 'All Departments' && (
                <Badge variant="neutral" size="sm">
                  Dept: {selectedDepartment}
                </Badge>
              )}
              {selectedStatus !== 'All' && (
                <Badge variant="warning" size="sm">
                  Status: {selectedStatus}
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <section aria-label="Loading Activities" className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between h-96"
              >
                <div className="h-28 bg-slate-200" />
                <div className="p-5 space-y-3 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="pt-2 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="h-9 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : error ? (
        /* Error State with Retry CTA */
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center my-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-rose-900 mb-1">
            Unable to Load Activities
          </h3>
          <p className="text-xs text-rose-700 mb-4 max-w-md mx-auto leading-relaxed">
            {error}
          </p>
          <Button variant="primary" size="sm" onClick={() => fetchActivities(true)}>
            Retry Loading
          </Button>
        </div>
      ) : filteredAll.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No activities found"
          description={
            isFilterActive
              ? 'Try changing your search keywords or adjusting your filters.'
              : 'There are currently no activities scheduled on campus. Check back soon!'
          }
          actionText={isFilterActive ? 'Clear Filters' : 'Refresh'}
          onAction={isFilterActive ? handleClearFilters : () => fetchActivities(true)}
          icon={<IconSearch className="w-6 h-6 text-slate-400" />}
          className="my-8"
        />
      ) : isFilterActive ? (
        /* Filtered Results View */
        <section aria-label="Filtered Activities" className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Matching Activities ({filteredAll.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Results matching your selected search criteria and filters
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredAll.length} of {activities.length} activities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAll.map((act) => {
              const statusMeta = getStatusDisplay(act.status)
              const designMeta = getCategoryDesign(act.category || act.activityType)
              return (
                <ActivityCard
                  key={act.id}
                  title={act.title}
                  category={act.category || act.activityType}
                  date={formatDisplayDate(act.date)}
                  time={formatDisplayTime(act.startTime, act.endTime)}
                  venue={act.venue}
                  organizer={act.organizer}
                  description={act.description}
                  status={statusMeta.label}
                  statusVariant={statusMeta.variant}
                  badgeVariant={designMeta.badgeVariant}
                  thumbnailGradient={designMeta.thumbnailGradient}
                  spotsLeft={act.spotsLeft}
                  actionText="View Details"
                  onAction={() => navigate(`/student/activities/${act.id}`)}
                />
              )
            })}
          </div>
        </section>
      ) : (
        /* Default Browse Mode: Featured Activities + Upcoming Activities */
        <>
          {/* Featured Activities Section */}
          <section aria-label="Featured Activities" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconSparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Featured Activities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-priority flagship campus workshops, hackathons, and seminars
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="md">
                {featuredList.length} Featured
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredList.map((act) => {
                const statusMeta = getStatusDisplay(act.status)
                const designMeta = getCategoryDesign(act.category || act.activityType)
                return (
                  <ActivityCard
                    key={act.id}
                    title={act.title}
                    category={act.category || act.activityType}
                    date={formatDisplayDate(act.date)}
                    time={formatDisplayTime(act.startTime, act.endTime)}
                    venue={act.venue}
                    organizer={act.organizer}
                    description={act.description}
                    status={statusMeta.label}
                    statusVariant={statusMeta.variant}
                    badgeVariant={designMeta.badgeVariant}
                    thumbnailGradient={designMeta.thumbnailGradient}
                    spotsLeft={act.spotsLeft}
                    actionText="View Details"
                    onAction={() => navigate(`/student/activities/${act.id}`)}
                  />
                )
              })}
            </div>
          </section>

          {/* All Upcoming Activities Section */}
          <section aria-label="Upcoming Activities" className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <IconCalendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Upcoming Activities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore all scheduled competitions, fests, workshops, and student meets
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {upcomingList.length} activities scheduled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingList.map((act) => {
                const statusMeta = getStatusDisplay(act.status)
                const designMeta = getCategoryDesign(act.category || act.activityType)
                return (
                  <ActivityCard
                    key={act.id}
                    title={act.title}
                    category={act.category || act.activityType}
                    date={formatDisplayDate(act.date)}
                    time={formatDisplayTime(act.startTime, act.endTime)}
                    venue={act.venue}
                    organizer={act.organizer}
                    description={act.description}
                    status={statusMeta.label}
                    statusVariant={statusMeta.variant}
                    badgeVariant={designMeta.badgeVariant}
                    thumbnailGradient={designMeta.thumbnailGradient}
                    spotsLeft={act.spotsLeft}
                    actionText="View Details"
                    onAction={() => navigate(`/student/activities/${act.id}`)}
                  />
                )
              })}
            </div>
          </section>
        </>
      )}
    </StudentLayout>
  )
}
