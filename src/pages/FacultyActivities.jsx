import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import SearchBar from '../components/common/SearchBar'
import Select from '../components/common/Select'
import Dropdown from '../components/common/Dropdown'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import EmptyState from '../components/common/EmptyState'
import {
  IconPlus,
  IconActivity,
  IconCalendar,
  IconClipboardCheck,
  IconEdit,
  IconMapPin,
  IconCheck,
  IconEye,
  IconFilter,
} from '../components/icons/Icons'
import {
  initialFacultyActivities,
  activityTypes,
  activityStatuses,
  dateFilterOptions,
} from '../data/facultyActivitiesData'

export default function FacultyActivities() {
  const navigate = useNavigate()

  // Main State
  const [activities, setActivities] = useState(initialFacultyActivities)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')
  const [selectedDateFilter, setSelectedDateFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  // Cancellation Confirmation Dialog State
  const [activityToCancel, setActivityToCancel] = useState(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [notice, setNotice] = useState(null)

  // Dynamic Statistics derived from current activities state
  const stats = useMemo(() => {
    return {
      total: activities.length,
      upcoming: activities.filter(
        (a) => (a.status === 'Published' || a.status === 'Draft') && a.dateCategory !== 'past'
      ).length,
      completed: activities.filter((a) => a.status === 'Completed').length,
      drafts: activities.filter((a) => a.status === 'Draft').length,
    }
  }, [activities])

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = act.title.toLowerCase().includes(query)
        const matchesVenue = act.venue.toLowerCase().includes(query)
        const matchesOrganizer = act.organizer.toLowerCase().includes(query)
        if (!matchesTitle && !matchesVenue && !matchesOrganizer) return false
      }

      // 2. Activity Type Filter
      if (selectedType !== 'All Types' && act.type !== selectedType) {
        return false
      }

      // 3. Status Filter
      if (selectedStatus !== 'All Statuses' && act.status !== selectedStatus) {
        return false
      }

      // 4. Date Filter
      if (selectedDateFilter !== 'all') {
        if (selectedDateFilter === 'upcoming' && act.dateCategory === 'past') return false
        if (selectedDateFilter === 'past' && act.dateCategory !== 'past') return false
        if (
          selectedDateFilter === 'this_week' &&
          act.dateCategory !== 'this_week' &&
          act.dateCategory !== 'today'
        )
          return false
        if (
          selectedDateFilter === 'this_month' &&
          act.dateCategory !== 'this_month' &&
          act.dateCategory !== 'this_week' &&
          act.dateCategory !== 'today'
        )
          return false
        if (selectedDateFilter === 'today' && act.dateCategory !== 'today') return false
      }

      return true
    })
  }, [activities, searchQuery, selectedType, selectedStatus, selectedDateFilter])

  // Has active filters
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedType !== 'All Types' ||
    selectedStatus !== 'All Statuses' ||
    selectedDateFilter !== 'all'

  // Reset Filters handler
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedType('All Types')
    setSelectedStatus('All Statuses')
    setSelectedDateFilter('all')
  }

  // Handle Cancel Activity confirmation
  const handleConfirmCancel = () => {
    if (!activityToCancel) return

    setActivities((prev) =>
      prev.map((item) =>
        item.id === activityToCancel.id ? { ...item, status: 'Cancelled' } : item
      )
    )

    setNotice(`Activity "${activityToCancel.title}" has been cancelled.`)
    setIsCancelModalOpen(false)
    setActivityToCancel(null)
    setTimeout(() => setNotice(null), 4500)
  }

  // Status Badge variant mapper
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Published':
        return 'success'
      case 'Draft':
        return 'neutral'
      case 'Completed':
        return 'primary'
      case 'Cancelled':
        return 'danger'
      default:
        return 'primary'
    }
  }

  // Activity Type Badge variant mapper
  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'Workshop':
        return 'primary'
      case 'Hackathon':
        return 'secondary'
      case 'Seminar':
        return 'warning'
      case 'Competition':
        return 'secondary'
      case 'Sports':
        return 'neutral'
      case 'Cultural':
        return 'danger'
      default:
        return 'primary'
    }
  }

  return (
    <FacultyLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Activities"
        subtitle="Create, manage, and track your campus activities."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Activities' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            icon={<IconPlus className="w-4 h-4" />}
            onClick={() => navigate('/faculty/activities/create')}
            className="shadow-sm font-semibold"
          >
            Create Activity
          </Button>
        }
      />

      {/* Success Notification */}
      {notice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Activity Statistics (4 Summary Cards) */}
      <section
        aria-label="Activity Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-6"
      >
        <StatCard
          title="Total Activities"
          value={stats.total}
          icon={<IconActivity className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All department events"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          change="Active"
          changeType="positive"
          helperText="Scheduled & published"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<IconClipboardCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Past sessions archived"
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          icon={<IconEdit className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600"
          helperText="Unpublished proposals"
        />
      </section>

      {/* 3. Search and Filters Control Bar */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="flex-1 max-w-lg">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by title, venue, or organizer..."
            />
          </div>

          {/* Right: Filter dropdowns & View switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Activity Type Filter */}
            <div className="w-36 sm:w-40">
              <Select
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={activityTypes}
              />
            </div>

            {/* Status Filter */}
            <div className="w-32 sm:w-36">
              <Select
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={activityStatuses}
              />
            </div>

            {/* Date Filter */}
            <div className="w-32 sm:w-36">
              <Select
                value={selectedDateFilter}
                onChange={(val) => setSelectedDateFilter(val)}
                options={dateFilterOptions}
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Reset
              </Button>
            )}

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* View Mode Switcher (Table vs Grid) */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                aria-label="Table View"
                title="Table View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                title="Grid View"
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. Activities List / Table / Empty State */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No activities found"
          description="No activities match your current search and filter settings. Try adjusting your query or resetting filters to see all campus activities."
          icon={<IconFilter className="w-6 h-6 text-slate-400" />}
          actionText={hasActiveFilters ? 'Reset All Filters' : 'Create Activity'}
          onAction={
            hasActiveFilters ? handleResetFilters : () => navigate('/faculty/activities/create')
          }
        />
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Activity & Details</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-4">Schedule & Venue</th>
                  <th className="py-3.5 px-4">Capacity & Seats</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.map((act) => {
                  const availableSeats = Math.max(0, act.maxParticipants - act.registeredCount)
                  const isFull = act.registeredCount >= act.maxParticipants
                  const percentFilled = Math.min(
                    100,
                    Math.round((act.registeredCount / act.maxParticipants) * 100)
                  )

                  return (
                    <tr
                      key={act.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Activity Title & Banner Icon */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.thumbnailGradient} text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs`}
                          >
                            <IconActivity className="w-5 h-5 text-white/90" />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h3
                              onClick={() => navigate(`/faculty/activities/${act.id}`)}
                              className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate cursor-pointer text-sm"
                            >
                              {act.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {act.organizer}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-3">
                        <Badge variant={getTypeBadgeVariant(act.type)} size="sm">
                          {act.type}
                        </Badge>
                      </td>

                      {/* Schedule & Venue */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-1 text-slate-600">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800">
                            <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{act.date}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-500 font-normal">{act.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{act.venue}</span>
                          </div>
                        </div>
                      </td>

                      {/* Capacity & Seats */}
                      <td className="py-4 px-4 min-w-[170px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">
                              {act.registeredCount} / {act.maxParticipants}{' '}
                              <span className="text-slate-400 font-normal">registered</span>
                            </span>
                            {isFull ? (
                              <Badge variant="danger" size="sm" className="font-bold">
                                Full
                              </Badge>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                {availableSeats} left
                              </span>
                            )}
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull
                                  ? 'bg-rose-500'
                                  : percentFilled >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <Badge variant={getStatusBadgeVariant(act.status)} size="sm" dot>
                          {act.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/faculty/activities/${act.id}`)}
                            className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 px-2 py-1"
                          >
                            View
                          </Button>

                          {/* Edit */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/faculty/activities/${act.id}/edit`)}
                            className="text-xs px-2.5 py-1 text-slate-700 hover:border-blue-500 hover:text-blue-600"
                          >
                            Edit
                          </Button>

                          {/* Manage Registrations */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(`/faculty/registrations?activity=${act.id}`)
                            }
                            className="text-xs px-2.5 py-1 text-blue-600 border-blue-200 hover:bg-blue-50/60"
                          >
                            Registrations
                          </Button>

                          {/* More Menu Dropdown */}
                          <Dropdown
                            trigger={
                              <button
                                type="button"
                                aria-label="More options"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg>
                              </button>
                            }
                            items={[
                              {
                                label: 'View Activity Details',
                                icon: <IconEye className="w-4 h-4 text-slate-400" />,
                                onClick: () => navigate(`/faculty/activities/${act.id}`),
                              },
                              {
                                label: 'Manage Registrations',
                                icon: <IconClipboardCheck className="w-4 h-4 text-blue-500" />,
                                onClick: () =>
                                  navigate(`/faculty/registrations?activity=${act.id}`),
                              },
                              { divider: true },
                              {
                                label: 'Cancel Activity',
                                danger: true,
                                onClick: () => {
                                  setActivityToCancel(act)
                                  setIsCancelModalOpen(true)
                                },
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-800">{filteredActivities.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{activities.length}</span> campus activities
            </span>
            <span className="text-[11px] text-slate-400">
              KPGU Activity Management &bull; Capacity monitored in real-time
            </span>
          </div>
        </Card>
      ) : (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((act) => {
            const availableSeats = Math.max(0, act.maxParticipants - act.registeredCount)
            const isFull = act.registeredCount >= act.maxParticipants
            const percentFilled = Math.min(
              100,
              Math.round((act.registeredCount / act.maxParticipants) * 100)
            )

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Header */}
                  <div
                    className={`h-24 bg-gradient-to-br ${act.thumbnailGradient} p-3.5 flex flex-col justify-between relative overflow-hidden`}
                  >
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <Badge
                        variant={getTypeBadgeVariant(act.type)}
                        size="sm"
                        className="backdrop-blur-sm shadow-xs font-semibold"
                      >
                        {act.type}
                      </Badge>
                      <Badge
                        variant={getStatusBadgeVariant(act.status)}
                        size="sm"
                        dot
                        className="shadow-xs font-medium"
                      >
                        {act.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3
                        onClick={() => navigate(`/faculty/activities/${act.id}`)}
                        className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer text-sm"
                      >
                        {act.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {act.organizer}
                      </p>
                    </div>

                    {/* Schedule & Venue */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium text-slate-800">{act.date}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500">{act.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{act.venue}</span>
                      </div>
                    </div>

                    {/* Capacity and available seats */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">
                          {act.registeredCount} / {act.maxParticipants} Registered
                        </span>
                        {isFull ? (
                          <Badge variant="danger" size="sm" className="font-bold">
                            Full
                          </Badge>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {availableSeats} seats left
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull
                              ? 'bg-rose-500'
                              : percentFilled >= 75
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl">
                  <div className="grid grid-cols-3 gap-1.5 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/faculty/activities/${act.id}`)}
                      className="text-xs px-2 py-1 hover:text-blue-600 hover:bg-blue-50"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/faculty/activities/${act.id}/edit`)}
                      className="text-xs px-2 py-1 text-slate-700 hover:border-blue-500"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/faculty/registrations?activity=${act.id}`)
                      }
                      className="text-xs px-2 py-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Registrations
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirmation Dialog: Cancel Activity */}
      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false)
          setActivityToCancel(null)
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel Campus Activity"
        message={`Are you sure you want to cancel "${activityToCancel?.title}"? Registered students will be alerted and signups will immediately be closed.`}
        confirmText="Cancel Activity"
        cancelText="Keep Active"
        variant="danger"
      />
    </FacultyLayout>
  )
}
