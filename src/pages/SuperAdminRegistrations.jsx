import { useState, useMemo } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Dropdown from '../components/common/Dropdown'
import EmptyState from '../components/common/EmptyState'
import {
  IconClipboardCheck,
  IconCalendar,
  IconUsers,
  IconCheck,
  IconClose,
  IconSearch,
  IconEye,
  IconAlertCircle,
  IconClock,
  IconMapPin,
  IconMail,
  IconFilter,
} from '../components/icons/Icons'
import {
  superAdminRegistrationsSummary,
  initialSuperAdminRegistrations,
} from '../data/superAdminRegistrationsData'

export default function SuperAdminRegistrations() {
  // Main Registrations State (Local/Mock)
  const [registrations, setRegistrations] = useState(initialSuperAdminRegistrations)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Modals & Feedback State
  const [viewingRegistration, setViewingRegistration] = useState(null)
  const [cancellingRegistration, setCancellingRegistration] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  // Track session cancellations to adjust mock totals accurately
  const newlyCancelledList = useMemo(() => {
    return registrations.filter(
      (r) =>
        r.status === 'Cancelled' &&
        initialSuperAdminRegistrations.find((ir) => ir.id === r.id)?.status === 'Registered'
    )
  }, [registrations])

  // Summary Metrics with dynamic responsiveness
  const summaryMetrics = useMemo(() => {
    const newlyCancelledCount = newlyCancelledList.length
    const newlyCancelledUpcomingCount = newlyCancelledList.filter(
      (r) => r.activity.isUpcoming
    ).length

    return {
      total: superAdminRegistrationsSummary.totalRegistrations,
      active: superAdminRegistrationsSummary.activeRegistrations - newlyCancelledCount,
      cancelled: superAdminRegistrationsSummary.cancelledRegistrations + newlyCancelledCount,
      upcoming: superAdminRegistrationsSummary.upcomingRegistrations - newlyCancelledUpcomingCount,
    }
  }, [newlyCancelledList])

  // Strict AND logic filtering
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // 1. Search Query: Student name, student ID, email, or activity name
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        reg.student.name.toLowerCase().includes(q) ||
        reg.student.studentId.toLowerCase().includes(q) ||
        reg.student.email.toLowerCase().includes(q) ||
        reg.activity.title.toLowerCase().includes(q)

      // 2. Registration Status Filter: Registered vs Cancelled
      const matchesStatus =
        statusFilter === 'all' ||
        reg.status.toLowerCase() === statusFilter.toLowerCase()

      // 3. Activity Type Filter
      const matchesType =
        typeFilter === 'all' ||
        reg.activity.type.toLowerCase() === typeFilter.toLowerCase()

      // 4. Department Filter (Matches student's department)
      const matchesDept =
        departmentFilter === 'all' ||
        reg.student.department.toLowerCase() === departmentFilter.toLowerCase()

      // 5. Date Filter (Upcoming vs Past)
      let matchesDate = true
      if (dateFilter === 'Upcoming') {
        matchesDate = reg.activity.isUpcoming === true
      } else if (dateFilter === 'Past') {
        matchesDate = reg.activity.isUpcoming === false
      }

      return matchesSearch && matchesStatus && matchesType && matchesDept && matchesDate
    })
  }, [registrations, searchQuery, statusFilter, typeFilter, departmentFilter, dateFilter])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    departmentFilter !== 'all' ||
    dateFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setTypeFilter('all')
    setDepartmentFilter('all')
    setDateFilter('all')
  }

  // Handle Cancel Registration Confirmation
  const handleConfirmCancellation = () => {
    if (!cancellingRegistration) return

    const targetId = cancellingRegistration.id
    const targetActivityId = cancellingRegistration.activity.id

    // Update registration status to 'Cancelled'
    // Also decrement registeredCount for this activity across the state
    setRegistrations((prev) =>
      prev.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            status: 'Cancelled',
            activity: {
              ...item.activity,
              registeredCount: Math.max(0, item.activity.registeredCount - 1),
            },
          }
        }
        if (item.activity.id === targetActivityId) {
          return {
            ...item,
            activity: {
              ...item.activity,
              registeredCount: Math.max(0, item.activity.registeredCount - 1),
            },
          }
        }
        return item
      })
    )

    // Also update viewingRegistration if currently open
    if (viewingRegistration && viewingRegistration.id === targetId) {
      setViewingRegistration((prev) => ({
        ...prev,
        status: 'Cancelled',
        activity: {
          ...prev.activity,
          registeredCount: Math.max(0, prev.activity.registeredCount - 1),
        },
      }))
    }

    setCancellingRegistration(null)
    setActionNotice('Registration cancelled successfully.')

    setTimeout(() => {
      setActionNotice(null)
    }, 4500)
  }

  // Activity Type badge styling helper
  const getActivityTypeBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop':
        return 'info'
      case 'seminar':
        return 'primary'
      case 'competition':
        return 'warning'
      case 'hackathon':
        return 'secondary'
      case 'cultural':
        return 'danger'
      case 'sports':
        return 'success'
      case 'technical':
        return 'info'
      default:
        return 'neutral'
    }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ============================================================== */}
        {/* 1. NOTIFICATION BANNER                                         */}
        {/* ============================================================== */}
        {actionNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-2xs transition-all animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              </span>
              <p className="font-medium">{actionNotice}</p>
            </div>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-emerald-600 hover:text-emerald-900 transition-colors p-1 cursor-pointer"
              aria-label="Dismiss notice"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. PAGE HEADER                                                 */}
        {/* ============================================================== */}
        <PageHeader
          title="Registration Management"
          subtitle="Monitor student registrations across campus activities."
          breadcrumb={[
            { label: 'Campus Live', to: '/' },
            { label: 'Super Admin', to: '/admin/dashboard' },
            { label: 'Registrations' },
          ]}
          actions={
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
          }
        />

        {/* ============================================================== */}
        {/* 3. BUSINESS RULE BANNER (REGISTERED != PARTICIPATED)           */}
        {/* ============================================================== */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <IconAlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                Important Business Rule: REGISTERED ≠ PARTICIPATED
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                A registration only means that a student registered for an activity. It does not track attendance, event completion, or award Activity Points. Participation is handled separately.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white text-blue-800 rounded-full border border-blue-200 shrink-0">
            System Rule
          </span>
        </div>

        {/* ============================================================== */}
        {/* 4. SUMMARY METRIC CARDS                                        */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registrations"
            value={summaryMetrics.total.toLocaleString()}
            icon={<IconClipboardCheck className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50 text-blue-600"
            helperText="System-wide registrations"
          />
          <StatCard
            title="Active Registrations"
            value={summaryMetrics.active.toLocaleString()}
            icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50 text-emerald-600"
            helperText="Valid capacity reservations"
          />
          <StatCard
            title="Cancelled Registrations"
            value={summaryMetrics.cancelled.toLocaleString()}
            icon={<IconClose className="w-5 h-5 text-rose-600" />}
            iconBg="bg-rose-50 text-rose-600"
            helperText="Released capacity pool"
          />
          <StatCard
            title="Upcoming Registrations"
            value={summaryMetrics.upcoming.toLocaleString()}
            icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
            iconBg="bg-indigo-50 text-indigo-600"
            helperText="Registrations for upcoming events"
          />
        </div>

        {/* ============================================================== */}
        {/* 5. SEARCH AND FILTERS TOOLBAR                                  */}
        {/* ============================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
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
                placeholder="Search by student name, student ID, email, or activity..."
                className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <IconClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:w-auto">
              {/* Registration Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Registered">Registered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {/* Activity Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
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

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Other">Other</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Past">Past</option>
              </select>
            </div>
          </div>

          {/* Active Filters Row & Results Count */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <IconFilter className="w-3.5 h-3.5 text-slate-400" />
                Active Filters:
              </span>
              {!hasActiveFilters && (
                <span className="text-slate-400 italic">None (Showing all registrations)</span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  &quot;{searchQuery}&quot;
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Status: {statusFilter}
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove status filter"
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Type: {typeFilter}
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove type filter"
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              )}
              {departmentFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Dept: {departmentFilter}
                  <button
                    type="button"
                    onClick={() => setDepartmentFilter('all')}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove department filter"
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Date: {dateFilter}
                  <button
                    type="button"
                    onClick={() => setDateFilter('all')}
                    className="hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="Remove date filter"
                  >
                    <IconClose className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                Showing{' '}
                <strong className="text-slate-900">{filteredRegistrations.length}</strong> of{' '}
                <strong className="text-slate-900">{registrations.length}</strong> registrations
              </span>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs h-7 px-2.5 text-slate-600 hover:text-rose-600"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 6. REGISTRATIONS TABLE (10 COLUMNS PER SPECIFICATION)          */}
        {/* ============================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No registrations found"
                description="Try changing your search or filter criteria."
                icon={<IconClipboardCheck className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Student</th>
                    <th scope="col" className="py-3.5 px-4">Student ID</th>
                    <th scope="col" className="py-3.5 px-4">Activity</th>
                    <th scope="col" className="py-3.5 px-4">Activity Type</th>
                    <th scope="col" className="py-3.5 px-4">Department</th>
                    <th scope="col" className="py-3.5 px-4">Registration Date</th>
                    <th scope="col" className="py-3.5 px-4">Activity Date</th>
                    <th scope="col" className="py-3.5 px-4">Status</th>
                    <th scope="col" className="py-3.5 px-4">Capacity</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRegistrations.map((reg) => {
                    const isRegistered = reg.status === 'Registered'
                    const maxCap = reg.activity.maxCapacity || 100
                    const activeCap = reg.activity.registeredCount || 0
                    const availableSeats = Math.max(0, maxCap - activeCap)

                    return (
                      <tr
                        key={reg.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* 1. Student Column (Avatar + Full Name) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
                              {reg.student.avatar}
                            </div>
                            <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {reg.student.name}
                            </span>
                          </div>
                        </td>

                        {/* 2. Student ID Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {reg.student.studentId}
                          </span>
                        </td>

                        {/* 3. Activity Column */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <span
                            className="font-medium text-slate-900 truncate block"
                            title={reg.activity.title}
                          >
                            {reg.activity.title}
                          </span>
                        </td>

                        {/* 4. Activity Type Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <Badge
                            variant={getActivityTypeBadgeVariant(reg.activity.type)}
                            size="sm"
                          >
                            {reg.activity.type}
                          </Badge>
                        </td>

                        {/* 5. Department Column */}
                        <td className="py-3.5 px-4 text-slate-700 text-xs font-medium whitespace-nowrap">
                          {reg.student.department}
                        </td>

                        {/* 6. Registration Date Column */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {reg.registrationDate}
                        </td>

                        {/* 7. Activity Date Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs font-medium text-slate-900">
                            {reg.activity.date}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <IconClock className="w-3 h-3 text-slate-400" />
                            {reg.activity.isUpcoming ? (
                              <span className="text-indigo-600 font-semibold">Upcoming</span>
                            ) : (
                              <span className="text-slate-400">Past</span>
                            )}
                          </div>
                        </td>

                        {/* 8. Status Column */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isRegistered ? (
                            <Badge variant="success" dot size="sm">
                              Registered
                            </Badge>
                          ) : (
                            <Badge variant="danger" dot size="sm">
                              Cancelled
                            </Badge>
                          )}
                        </td>

                        {/* 9. Capacity Column (Active / Max with Available Seats) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-semibold text-xs text-slate-800">
                            <span>{activeCap}</span>
                            <span className="text-slate-400">/</span>
                            <span>{maxCap}</span>
                          </div>
                          <div className="text-[11px] text-emerald-600 font-medium">
                            {availableSeats} available
                          </div>
                        </td>

                        {/* 10. Actions Column */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingRegistration(reg)}
                              className="text-xs h-7 px-2.5 text-slate-600 hover:text-blue-600"
                            >
                              View Details
                            </Button>

                            {isRegistered && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCancellingRegistration(reg)}
                                className="text-xs h-7 px-2 text-rose-600 hover:bg-rose-50"
                              >
                                Cancel
                              </Button>
                            )}

                            <Dropdown
                              align="right"
                              trigger={
                                <button
                                  type="button"
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                  aria-label="More Actions"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                              }
                              items={[
                                {
                                  label: 'View Details',
                                  icon: <IconEye className="w-4 h-4" />,
                                  onClick: () => setViewingRegistration(reg),
                                },
                                ...(isRegistered
                                  ? [
                                      {
                                        label: 'Cancel Registration',
                                        icon: <IconClose className="w-4 h-4" />,
                                        danger: true,
                                        onClick: () => setCancellingRegistration(reg),
                                      },
                                    ]
                                  : []),
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
          )}
        </div>

        {/* ============================================================== */}
        {/* 7. VIEW DETAILS MODAL                                          */}
        {/* ============================================================== */}
        {viewingRegistration && (
          <Modal
            isOpen={Boolean(viewingRegistration)}
            onClose={() => setViewingRegistration(null)}
            title="Registration Details"
            size="xl"
            footer={
              <div className="flex items-center justify-between w-full">
                {viewingRegistration.status === 'Registered' ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setCancellingRegistration(viewingRegistration)
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <IconClose className="w-4 h-4" />
                    Cancel Registration
                  </Button>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Registration record marked as Cancelled (Seat released).
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingRegistration(null)}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-5 py-1 text-slate-700">
              {/* Header Status Strip */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center shrink-0">
                    {viewingRegistration.student.avatar}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {viewingRegistration.student.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {viewingRegistration.student.studentId} • Reg Ref: {viewingRegistration.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Registration Status:</span>
                  {viewingRegistration.status === 'Registered' ? (
                    <Badge variant="success" dot>
                      Registered
                    </Badge>
                  ) : (
                    <Badge variant="danger" dot>
                      Cancelled
                    </Badge>
                  )}
                </div>
              </div>

              {/* Student Information */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <IconUsers className="w-4 h-4 text-blue-600" />
                  Student Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Student Name</span>
                    <span className="font-semibold text-slate-900">{viewingRegistration.student.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Student ID</span>
                    <span className="font-mono text-slate-900">{viewingRegistration.student.studentId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email</span>
                    <a
                      href={`mailto:${viewingRegistration.student.email}`}
                      className="text-blue-600 hover:underline flex items-center gap-1.5"
                    >
                      <IconMail className="w-3.5 h-3.5 text-blue-500" />
                      {viewingRegistration.student.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Department</span>
                    <span className="text-slate-900 font-medium">{viewingRegistration.student.department}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Course</span>
                    <span className="text-slate-800">{viewingRegistration.student.course}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Academic Year</span>
                    <span className="text-slate-800 font-medium">{viewingRegistration.student.year}</span>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <IconCalendar className="w-4 h-4 text-indigo-600" />
                    Activity Information
                  </h5>
                  <Badge variant={getActivityTypeBadgeVariant(viewingRegistration.activity.type)} size="sm">
                    {viewingRegistration.activity.type}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Activity Name</span>
                    <span className="font-bold text-slate-900 text-base">
                      {viewingRegistration.activity.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Activity Type</span>
                      <span className="text-slate-800 font-medium">
                        {viewingRegistration.activity.type}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">Activity Date</span>
                      <span className="text-slate-800 font-medium">
                        {viewingRegistration.activity.date} ({viewingRegistration.activity.startTime} - {viewingRegistration.activity.endTime})
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">Venue</span>
                      <span className="text-slate-800 flex items-center gap-1.5 font-medium">
                        <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                        {viewingRegistration.activity.venue}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">Organizer</span>
                      <span className="text-slate-800 font-medium">
                        {viewingRegistration.activity.organizer}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <IconClipboardCheck className="w-4 h-4 text-emerald-600" />
                  Registration Information
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Registration Date</span>
                    <span className="font-semibold text-slate-900">{viewingRegistration.registrationDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Registration Status</span>
                    {viewingRegistration.status === 'Registered' ? (
                      <Badge variant="success" dot size="sm">
                        Registered
                      </Badge>
                    ) : (
                      <Badge variant="danger" dot size="sm">
                        Cancelled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Capacity Overview */}
              {(() => {
                const max = viewingRegistration.activity.maxCapacity || 100
                const registered = viewingRegistration.activity.registeredCount || 0
                const available = Math.max(0, max - registered)
                const percent = Math.min(100, Math.round((registered / max) * 100))

                return (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Activity Capacity Overview
                      </h5>
                      <span className="text-xs font-medium text-slate-500">
                        {percent}% Reserved
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 block">Active Registrations</span>
                        <span className="text-xl font-bold text-slate-900">{registered}</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 block">Activity Capacity</span>
                        <span className="text-xl font-bold text-slate-900">{max}</span>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500 block">Available Seats</span>
                        <span className="text-xl font-bold text-emerald-600">{available}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      * Available Seats = Maximum Participants - Valid Active Registrations. Cancelled registrations do not count toward active capacity.
                    </p>
                  </div>
                )
              })()}

              {/* Core Business Rule Notice in Modal */}
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Business Rule: REGISTERED ≠ PARTICIPATED</span>
                  A registration only means that a student registered for an activity. This system does not track attendance or award Activity Points. Participation status will be managed separately.
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* ============================================================== */}
        {/* 8. CANCEL REGISTRATION CONFIRMATION DIALOG                     */}
        {/* ============================================================== */}
        {cancellingRegistration && (
          <Modal
            isOpen={Boolean(cancellingRegistration)}
            onClose={() => setCancellingRegistration(null)}
            title="Cancel this registration?"
            size="md"
            footer={
              <div className="flex items-center justify-end gap-3 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancellingRegistration(null)}
                >
                  Keep Registration
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmCancellation}
                >
                  Cancel Registration
                </Button>
              </div>
            }
          >
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-sm">
                <IconAlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900">
                    Cancel this registration?
                  </p>
                  <p className="text-xs text-rose-700 mt-1">
                    Student <strong>{cancellingRegistration.student.name}</strong> (
                    <span className="font-mono">{cancellingRegistration.student.studentId}</span>)
                    will be unreserved from <strong>&quot;{cancellingRegistration.activity.title}&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration ID:</span>
                  <span className="font-mono font-medium text-slate-800">{cancellingRegistration.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Activity:</span>
                  <span className="font-medium text-slate-800">{cancellingRegistration.activity.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Activity Date:</span>
                  <span className="font-medium text-slate-800">{cancellingRegistration.activity.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity Impact:</span>
                  <span className="text-emerald-700 font-semibold">+1 seat released to available pool</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Record Status:</span>
                  <span className="text-slate-700 font-medium">Record preserved with status &quot;Cancelled&quot;</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                This record will not be deleted. The registration status will become <strong>Cancelled</strong> and remain visible when filtering by Cancelled status.
              </p>
            </div>
          </Modal>
        )}
      </div>
    </SuperAdminLayout>
  )
}
