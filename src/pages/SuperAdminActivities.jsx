import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import Dropdown from '../components/common/Dropdown'
import EmptyState from '../components/common/EmptyState'
import {
  IconCalendar,
  IconCheck,
  IconClose,
  IconSearch,
  IconEye,
  IconEdit,
  IconAlertCircle,
  IconClock,
  IconMapPin,
  IconPlus,
} from '../components/icons/Icons'
import {
  superAdminActivitiesSummary,
  initialSuperAdminActivities,
} from '../data/superAdminActivitiesData'

export default function SuperAdminActivities() {
  const navigate = useNavigate()
  // Main Activities State (Local/Mock)
  const [activities, setActivities] = useState(initialSuperAdminActivities)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Modals & Feedback State
  const [viewingActivity, setViewingActivity] = useState(null)
  const [editingActivity, setEditingActivity] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})

  const [statusChangeActivity, setStatusChangeActivity] = useState(null)
  const [newSelectedStatus, setNewSelectedStatus] = useState('Published')

  const [actionNotice, setActionNotice] = useState(null)

  // Filter activities using strict AND logic across all dimensions
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // 1. Search Query (Title, Organizer, or Category)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        act.title.toLowerCase().includes(q) ||
        act.organizer.toLowerCase().includes(q) ||
        act.category.toLowerCase().includes(q)

      // 2. Type / Category Filter
      const matchesType =
        typeFilter === 'all' ||
        act.category.toLowerCase() === typeFilter.toLowerCase()

      // 3. Status Filter
      const matchesStatus =
        statusFilter === 'all' ||
        act.status.toLowerCase() === statusFilter.toLowerCase()

      // 4. Department Filter
      const matchesDept =
        departmentFilter === 'all' ||
        act.department.toLowerCase() === departmentFilter.toLowerCase()

      // 5. Date Filter (Upcoming vs Past)
      let matchesDate = true
      if (dateFilter === 'Upcoming') {
        matchesDate = act.isUpcoming === true
      } else if (dateFilter === 'Past') {
        matchesDate = act.isUpcoming === false
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDept &&
        matchesDate
      )
    })
  }, [
    activities,
    searchQuery,
    typeFilter,
    statusFilter,
    departmentFilter,
    dateFilter,
  ])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    departmentFilter !== 'all' ||
    dateFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setTypeFilter('all')
    setStatusFilter('all')
    setDepartmentFilter('all')
    setDateFilter('all')
  }

  // Open Edit Modal
  const handleOpenEdit = (act) => {
    setEditingActivity(act)
    setEditFormData({
      title: act.title,
      description: act.description,
      category: act.category,
      department: act.department,
      date: act.date,
      startTime: act.startTime,
      endTime: act.endTime,
      venue: act.venue,
      organizer: act.organizer,
      eligibility: act.eligibility,
      maxCapacity: act.maxCapacity,
      registrationDeadline: act.registrationDeadline,
      contactInfo: act.contactInfo,
      status: act.status,
    })
    setEditErrors({})
  }

  // Save Edit Activity
  const handleSaveEdit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!editFormData.title?.trim()) {
      errors.title = 'Activity title is required'
    }
    if (!editFormData.venue?.trim()) {
      errors.venue = 'Venue location is required'
    }
    if (!editFormData.date?.trim()) {
      errors.date = 'Date is required'
    }
    if (!editFormData.maxCapacity || Number(editFormData.maxCapacity) <= 0) {
      errors.maxCapacity = 'Capacity must be greater than 0'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setActivities((prev) =>
      prev.map((act) =>
        act.id === editingActivity.id
          ? {
              ...act,
              title: editFormData.title.trim(),
              description: editFormData.description?.trim() || act.description,
              category: editFormData.category,
              department: editFormData.department,
              date: editFormData.date.trim(),
              startTime: editFormData.startTime?.trim() || act.startTime,
              endTime: editFormData.endTime?.trim() || act.endTime,
              venue: editFormData.venue.trim(),
              organizer: editFormData.organizer?.trim() || act.organizer,
              eligibility: editFormData.eligibility?.trim() || act.eligibility,
              maxCapacity: Number(editFormData.maxCapacity),
              registrationDeadline:
                editFormData.registrationDeadline?.trim() ||
                act.registrationDeadline,
              contactInfo:
                editFormData.contactInfo?.trim() || act.contactInfo,
              status: editFormData.status,
            }
          : act
      )
    )

    if (viewingActivity && viewingActivity.id === editingActivity.id) {
      setViewingActivity((prev) => ({
        ...prev,
        ...editFormData,
        maxCapacity: Number(editFormData.maxCapacity),
      }))
    }

    setActionNotice(`Activity details for "${editFormData.title.trim()}" updated successfully.`)
    setEditingActivity(null)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Open Change Status Modal
  const handleOpenStatusChange = (act) => {
    setStatusChangeActivity(act)
    setNewSelectedStatus(act.status)
  }

  // Save Changed Status
  const handleSaveStatusChange = (e) => {
    e.preventDefault()
    if (!statusChangeActivity) return

    setActivities((prev) =>
      prev.map((act) =>
        act.id === statusChangeActivity.id
          ? { ...act, status: newSelectedStatus }
          : act
      )
    )

    if (viewingActivity && viewingActivity.id === statusChangeActivity.id) {
      setViewingActivity((prev) => ({ ...prev, status: newSelectedStatus }))
    }

    setActionNotice(
      `Status for "${statusChangeActivity.title}" changed to ${newSelectedStatus}.`
    )
    setStatusChangeActivity(null)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Badge variant helper for status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Published':
        return 'success'
      case 'Draft':
        return 'neutral'
      case 'Cancelled':
        return 'danger'
      case 'Completed':
        return 'primary'
      default:
        return 'neutral'
    }
  }

  // Category Icon & Color helper
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Workshop':
        return { bg: 'bg-blue-50 text-blue-700', badge: 'primary' }
      case 'Seminar':
        return { bg: 'bg-emerald-50 text-emerald-700', badge: 'success' }
      case 'Hackathon':
        return { bg: 'bg-indigo-50 text-indigo-700', badge: 'info' }
      case 'Competition':
        return { bg: 'bg-amber-50 text-amber-700', badge: 'warning' }
      case 'Cultural':
        return { bg: 'bg-rose-50 text-rose-700', badge: 'danger' }
      case 'Sports':
        return { bg: 'bg-teal-50 text-teal-700', badge: 'success' }
      case 'Technical':
        return { bg: 'bg-purple-50 text-purple-700', badge: 'info' }
      default:
        return { bg: 'bg-slate-100 text-slate-700', badge: 'neutral' }
    }
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Activities Management"
        subtitle="Monitor and manage campus activities across departments and administrative teams."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Activities' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/activities/create')}
              icon={<IconPlus className="w-4 h-4" />}
            >
              Create Activity
            </Button>
          </div>
        }
      />

      {/* Action Notification Toast / Banner */}
      {actionNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
            aria-label="Dismiss notice"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUMMARY METRIC CARDS                                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Activities"
          value={superAdminActivitiesSummary.totalActivities}
          icon={<IconCalendar className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All recorded campus events"
        />
        <StatCard
          title="Upcoming Activities"
          value={superAdminActivitiesSummary.upcomingActivities}
          icon={<IconClock className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Scheduled future sessions"
        />
        <StatCard
          title="Active Activities"
          value={superAdminActivitiesSummary.activeActivities}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Currently published & open"
        />
        <StatCard
          title="Cancelled Activities"
          value={superAdminActivitiesSummary.cancelledActivities}
          icon={<IconAlertCircle className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-50 text-rose-600"
          helperText="Suspended or withdrawn events"
        />
      </div>

      {/* ============================================================== */}
      {/* 3. SEARCH AND FILTERS TOOLBAR                                  */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activities by title, organizer, or category..."
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Technical">Technical</option>
              <option value="Other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>

            {/* Date Filter (Upcoming vs Past) */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Past">Past</option>
            </select>
          </div>
        </div>

        {/* Filter status row & Clear Filters button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredActivities.length}</strong> of{' '}
            {activities.length} activities
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1"
            >
              <IconClose className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. ACTIVITY TABLE & EMPTY STATE                                */}
      {/* ============================================================== */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No activities found"
          description="Try changing your search or filter criteria."
          icon={<IconCalendar className="w-6 h-6 text-slate-400" />}
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Activity
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Date
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Venue
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Organizer
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Registrations
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredActivities.map((act) => {
                const theme = getCategoryTheme(act.category)
                const percentFull = Math.min(
                  100,
                  Math.round((act.registeredCount / act.maxCapacity) * 100)
                )

                return (
                  <tr
                    key={act.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    {/* Column 1: Activity (Icon, Title, Category) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${theme.bg}`}
                        >
                          <IconCalendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-semibold text-slate-900 truncate">
                            {act.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant={theme.badge} size="xs">
                              {act.category}
                            </Badge>
                            <span className="text-xs text-slate-400 truncate">
                              • {act.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Date & Start Time */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-slate-900">
                        {act.date}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <IconClock className="w-3 h-3 text-slate-400" />
                        {act.startTime}
                      </div>
                    </td>

                    {/* Column 3: Venue */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-700 flex items-center gap-1.5 max-w-xs truncate">
                        <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{act.venue}</span>
                      </div>
                    </td>

                    {/* Column 4: Organizer */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 max-w-xs truncate">
                      {act.organizer}
                    </td>

                    {/* Column 5: Registrations (Capacity) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-800 mb-1">
                        <span>
                          {act.registeredCount} / {act.maxCapacity}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {percentFull}%
                        </span>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            percentFull >= 95
                              ? 'bg-rose-500'
                              : percentFull >= 80
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </td>

                    {/* Column 6: Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusBadgeVariant(act.status)}
                        size="sm"
                        dot
                      >
                        {act.status}
                      </Badge>
                    </td>

                    {/* Column 7: Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Dropdown
                        align="right"
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            aria-label="Open activity actions"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01"
                              />
                            </svg>
                          </button>
                        }
                        items={[
                          {
                            label: 'View Details',
                            icon: <IconEye className="w-4 h-4" />,
                            onClick: () => setViewingActivity(act),
                          },
                          {
                            label: 'Edit Activity',
                            icon: <IconEdit className="w-4 h-4" />,
                            onClick: () => handleOpenEdit(act),
                          },
                          {
                            label: 'Change Status',
                            icon: <IconAlertCircle className="w-4 h-4" />,
                            onClick: () => handleOpenStatusChange(act),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. VIEW ACTIVITY DETAILS MODAL                                 */}
      {/* ============================================================== */}
      {viewingActivity && (
        <Modal
          isOpen={Boolean(viewingActivity)}
          onClose={() => setViewingActivity(null)}
          title="Activity Details"
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = viewingActivity
                  setViewingActivity(null)
                  handleOpenEdit(target)
                }}
              >
                Edit Activity
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingActivity(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Header info banner */}
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={getCategoryTheme(viewingActivity.category).badge}
                  size="sm"
                >
                  {viewingActivity.category}
                </Badge>
                <Badge
                  variant={getStatusBadgeVariant(viewingActivity.status)}
                  size="sm"
                  dot
                >
                  {viewingActivity.status}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                {viewingActivity.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {viewingActivity.description}
              </p>
            </div>

            {/* Registration Capacity Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Registration Capacity
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {Math.round(
                    (viewingActivity.registeredCount /
                      viewingActivity.maxCapacity) *
                      100
                  )}
                  % booked
                </span>
              </div>

              {/* Stat breakdown pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Registered
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {viewingActivity.registeredCount}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Max Capacity
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {viewingActivity.maxCapacity}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Seats Remaining
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {Math.max(
                      0,
                      viewingActivity.maxCapacity - viewingActivity.registeredCount
                    )}
                  </span>
                </div>
              </div>

              {/* Visual capacity bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (viewingActivity.registeredCount /
                        viewingActivity.maxCapacity) *
                        100
                    )}%`,
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <IconAlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Registered students ≠ Participated. Event attendance is validated separately upon activity conclusion.
                </span>
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Date
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.date}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Time Schedule
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.startTime} - {viewingActivity.endTime}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Venue
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.venue}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Hosting Department
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.department}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Organizer / Coordinator
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.organizer}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Registration Deadline
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.registrationDeadline}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Eligibility Criteria
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.eligibility}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Official Contact Details
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingActivity.contactInfo}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. EDIT ACTIVITY MODAL                                         */}
      {/* ============================================================== */}
      {editingActivity && (
        <Modal
          isOpen={Boolean(editingActivity)}
          onClose={() => setEditingActivity(null)}
          title="Edit Activity"
          size="xl"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingActivity(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Title */}
            <Input
              label="Activity Title"
              id="edit-activity-title"
              name="title"
              value={editFormData.title || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={editErrors.title}
              required
            />

            {/* Description */}
            <div className="space-y-1">
              <label
                htmlFor="edit-activity-description"
                className="block text-xs font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="edit-activity-description"
                rows={3}
                value={editFormData.description || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Row: Type & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Activity Type"
                id="edit-activity-type"
                name="category"
                value={editFormData.category || 'Workshop'}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                options={[
                  'Workshop',
                  'Seminar',
                  'Competition',
                  'Hackathon',
                  'Cultural',
                  'Sports',
                  'Technical',
                  'Other',
                ]}
                required
              />

              <Select
                label="Department"
                id="edit-activity-dept"
                name="department"
                value={editFormData.department || 'Computer Engineering'}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                options={[
                  'Computer Engineering',
                  'Information Technology',
                  'Mechanical Engineering',
                  'Civil Engineering',
                  'Other',
                ]}
                required
              />
            </div>

            {/* Row: Date, Start Time & End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="Event Date"
                id="edit-activity-date"
                name="date"
                placeholder="e.g. 15 Oct 2026"
                value={editFormData.date || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                error={editErrors.date}
                required
              />

              <Input
                label="Start Time"
                id="edit-activity-start-time"
                name="startTime"
                placeholder="e.g. 10:00 AM"
                value={editFormData.startTime || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
              />

              <Input
                label="End Time"
                id="edit-activity-end-time"
                name="endTime"
                placeholder="e.g. 01:00 PM"
                value={editFormData.endTime || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
              />
            </div>

            {/* Row: Venue & Maximum Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Venue Location"
                id="edit-activity-venue"
                name="venue"
                value={editFormData.venue || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, venue: e.target.value }))
                }
                error={editErrors.venue}
                required
              />

              <Input
                label="Maximum Capacity"
                id="edit-activity-capacity"
                name="maxCapacity"
                type="number"
                min="1"
                value={editFormData.maxCapacity || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    maxCapacity: e.target.value,
                  }))
                }
                error={editErrors.maxCapacity}
                required
              />
            </div>

            {/* Row: Eligibility & Registration Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Eligibility"
                id="edit-activity-eligibility"
                name="eligibility"
                value={editFormData.eligibility || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    eligibility: e.target.value,
                  }))
                }
              />

              <Input
                label="Registration Deadline"
                id="edit-activity-deadline"
                name="registrationDeadline"
                placeholder="e.g. 12 Oct 2026"
                value={editFormData.registrationDeadline || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    registrationDeadline: e.target.value,
                  }))
                }
              />
            </div>

            {/* Row: Contact Info & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Contact Information"
                id="edit-activity-contact"
                name="contactInfo"
                value={editFormData.contactInfo || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    contactInfo: e.target.value,
                  }))
                }
              />

              <Select
                label="Publication Status"
                id="edit-activity-status"
                name="status"
                value={editFormData.status || 'Published'}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                options={['Published', 'Draft', 'Cancelled', 'Completed']}
                required
              />
            </div>

            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 7. CHANGE STATUS MODAL                                         */}
      {/* ============================================================== */}
      {statusChangeActivity && (
        <Modal
          isOpen={Boolean(statusChangeActivity)}
          onClose={() => setStatusChangeActivity(null)}
          title="Change Activity Status"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusChangeActivity(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveStatusChange}
              >
                Update Status
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveStatusChange} className="space-y-4">
            <p className="text-xs text-slate-600">
              Update the active publication status for{' '}
              <strong className="text-slate-900">
                {statusChangeActivity.title}
              </strong>
              .
            </p>

            <Select
              label="Select New Status"
              id="change-status-select"
              value={newSelectedStatus}
              onChange={(e) => setNewSelectedStatus(e.target.value)}
              options={['Published', 'Draft', 'Cancelled']}
              required
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Cancelled activities remain in the audit register and will be flagged as cancelled across administrative views.
              </span>
            </div>

            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
