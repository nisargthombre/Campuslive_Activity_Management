import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import SearchBar from '../components/common/SearchBar'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import {
  IconClipboardCheck,
  IconCalendar,
  IconMapPin,
  IconCheck,
  IconAlertCircle,
  IconChevronRight,
} from '../components/icons/Icons'
import {
  mockActivitiesList,
  initialRegistrations,
  registrationDepartments,
  registrationCourses,
  registrationYears,
  registrationStatuses,
} from '../data/facultyRegistrationsData'

export default function FacultyRegistrations() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Read ?activity=:id directly from URL query parameters (single source of truth)
  const selectedActivityId = searchParams.get('activity') || 'all'

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [selectedYear, setSelectedYear] = useState('All Years')
  const [selectedStatus, setSelectedStatus] = useState('All Statuses')

  // Selected Registration for Details Modal
  const [viewingRegistration, setViewingRegistration] = useState(null)
  const [exportNotice, setExportNotice] = useState(null)

  // Selected Activity Object
  const selectedActivity = useMemo(() => {
    if (selectedActivityId === 'all') return null
    return mockActivitiesList.find((a) => a.id === selectedActivityId) || null
  }, [selectedActivityId])

  // Handle Activity Selection & sync query parameter
  const handleSelectActivity = (activityId) => {
    if (activityId === 'all') {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('activity')
      setSearchParams(newParams)
    } else {
      setSearchParams({ activity: activityId })
    }
  }

  // Filtered Registrations with combined AND logic
  const filteredRegistrations = useMemo(() => {
    return initialRegistrations.filter((reg) => {
      // 1. Activity filter
      if (selectedActivityId !== 'all' && reg.activityId !== selectedActivityId) {
        return false
      }

      // 2. Search query (Name, ID, Email)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = reg.studentName.toLowerCase().includes(q)
        const matchesId = reg.studentId.toLowerCase().includes(q)
        const matchesEmail = reg.studentEmail.toLowerCase().includes(q)
        if (!matchesName && !matchesId && !matchesEmail) return false
      }

      // 3. Department filter
      if (
        selectedDepartment !== 'All Departments' &&
        reg.department !== selectedDepartment
      ) {
        return false
      }

      // 4. Course filter
      if (selectedCourse !== 'All Courses' && reg.course !== selectedCourse) {
        return false
      }

      // 5. Academic Year filter
      if (selectedYear !== 'All Years' && reg.academicYear !== selectedYear) {
        return false
      }

      // 6. Status filter
      if (selectedStatus !== 'All Statuses' && reg.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [
    selectedActivityId,
    searchQuery,
    selectedDepartment,
    selectedCourse,
    selectedYear,
    selectedStatus,
  ])

  // Dynamic Summary Metrics
  const summaryStats = useMemo(() => {
    const scopedList =
      selectedActivityId === 'all'
        ? initialRegistrations
        : initialRegistrations.filter((r) => r.activityId === selectedActivityId)

    const total = scopedList.length
    const active = scopedList.filter((r) => r.status === 'Registered').length
    const cancelled = scopedList.filter((r) => r.status === 'Cancelled').length
    const distinctActivities = new Set(scopedList.map((r) => r.activityId)).size

    return { total, active, cancelled, distinctActivities }
  }, [selectedActivityId])

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDepartment !== 'All Departments' ||
    selectedCourse !== 'All Courses' ||
    selectedYear !== 'All Years' ||
    selectedStatus !== 'All Statuses'

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('All Departments')
    setSelectedCourse('All Courses')
    setSelectedYear('All Years')
    setSelectedStatus('All Statuses')
  }

  // Handle Export button click
  const handleExport = () => {
    setExportNotice('Export functionality will be connected later.')
    setTimeout(() => setExportNotice(null), 4000)
  }

  // Activity Dropdown Options
  const activityDropdownOptions = [
    { value: 'all', label: 'All Activities (Overview)' },
    ...mockActivitiesList.map((a) => ({
      value: a.id,
      label: `${a.title} (${a.registeredCount}/${a.maxParticipants})`,
    })),
  ]

  return (
    <FacultyLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Registrations"
        subtitle="View and manage students registered for campus activities."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Registrations' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="text-slate-700 bg-white"
            >
              Export
            </Button>
          </div>
        }
      />

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportNotice(null)}
            className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <section
        aria-label="Registrations Summary"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-6"
      >
        <StatCard
          title="Total Registrations"
          value={summaryStats.total}
          icon={<IconClipboardCheck className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText={selectedActivity ? selectedActivity.title : 'Across all campus events'}
        />
        <StatCard
          title="Active Registrations"
          value={summaryStats.active}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Confirmed"
          changeType="positive"
          helperText="Eligible for attendance"
        />
        <StatCard
          title="Cancelled Registrations"
          value={summaryStats.cancelled}
          icon={<IconAlertCircle className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-50 text-rose-600"
          helperText="Slots restored to available"
        />
        <StatCard
          title="Activities with Registrations"
          value={summaryStats.distinctActivities}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Active event rosters"
        />
      </section>

      {/* 2. Activity Selector & Registration Capacity Indicator */}
      <Card className="mb-6" padding="md">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter registrations by a specific campus event
              </p>
            </div>

            <div className="w-full sm:w-80">
              <Select
                value={selectedActivityId}
                onChange={(val) => handleSelectActivity(val)}
                options={activityDropdownOptions}
              />
            </div>
          </div>

          {/* Activity Capacity Details Banner (When an activity is selected) */}
          {selectedActivity && (
            (() => {
              const availableSeats = Math.max(
                0,
                selectedActivity.maxParticipants - selectedActivity.registeredCount
              )
              const isFull = selectedActivity.registeredCount >= selectedActivity.maxParticipants
              const percentFilled = Math.min(
                100,
                Math.round(
                  (selectedActivity.registeredCount / selectedActivity.maxParticipants) * 100
                )
              )

              return (
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-center animate-in fade-in duration-200">
                  {/* Left: Title & Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {selectedActivity.type}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => navigate(`/faculty/activities/${selectedActivity.id}`)}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 hover:underline text-left cursor-pointer"
                      >
                        {selectedActivity.title} &rarr;
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <IconCalendar className="w-3.5 h-3.5 text-blue-500" />
                        {selectedActivity.date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <IconMapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedActivity.venue}
                      </span>
                    </div>
                  </div>

                  {/* Center: Capacity Indicator */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-slate-800">
                        {selectedActivity.registeredCount} / {selectedActivity.maxParticipants} Registered
                      </div>

                      <div>
                        {isFull ? (
                          <Badge variant="danger" size="sm" className="font-bold">
                            FULL
                          </Badge>
                        ) : (
                          <span className="font-semibold text-emerald-700">
                            Available: {availableSeats} seats
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
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
              )
            })()
          )}
        </div>
      </Card>

      {/* 3. Search and Combined Filters Bar */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search students by name, ID, or email..."
            />
          </div>

          {/* Combined Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department Filter */}
            <div className="w-36 sm:w-40">
              <Select
                value={selectedDepartment}
                onChange={(val) => setSelectedDepartment(val)}
                options={registrationDepartments}
              />
            </div>

            {/* Course Filter */}
            <div className="w-28 sm:w-32">
              <Select
                value={selectedCourse}
                onChange={(val) => setSelectedCourse(val)}
                options={registrationCourses}
              />
            </div>

            {/* Academic Year Filter */}
            <div className="w-28 sm:w-32">
              <Select
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                options={registrationYears}
              />
            </div>

            {/* Status Filter */}
            <div className="w-32 sm:w-36">
              <Select
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={registrationStatuses}
              />
            </div>

            {/* Reset Filters */}
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
          </div>
        </div>
      </Card>

      {/* 4. Student Registration Table / Empty State */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations found"
          description="Try changing your search or filters."
          icon={<IconClipboardCheck className="w-6 h-6 text-slate-400" />}
          actionText={hasActiveFilters ? 'Reset Filters' : undefined}
          onAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-3">Student ID</th>
                  {selectedActivityId === 'all' && (
                    <th className="py-3.5 px-4">Activity</th>
                  )}
                  <th className="py-3.5 px-4">Department & Course</th>
                  <th className="py-3.5 px-3">Year</th>
                  <th className="py-3.5 px-4">Registration Date</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.map((reg) => (
                  <tr
                    key={reg.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Student Name & Email */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {reg.studentAvatar}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xs truncate">
                            {reg.studentName}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {reg.studentEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Student ID */}
                    <td className="py-4 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {reg.studentId}
                    </td>

                    {/* Activity Title (if all activities view) */}
                    {selectedActivityId === 'all' && (
                      <td className="py-4 px-4 font-medium text-slate-800 max-w-[170px] truncate">
                        <button
                          type="button"
                          onClick={() => navigate(`/faculty/activities/${reg.activityId}`)}
                          className="hover:text-blue-600 hover:underline text-left truncate block w-full cursor-pointer"
                        >
                          {reg.activityTitle}
                        </button>
                      </td>
                    )}

                    {/* Department & Course */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{reg.department}</div>
                      <div className="text-[11px] text-slate-400">{reg.course}</div>
                    </td>

                    {/* Academic Year */}
                    <td className="py-4 px-3 whitespace-nowrap text-slate-600">
                      {reg.academicYear}
                    </td>

                    {/* Registration Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      {reg.registrationDate}
                    </td>

                    {/* Registration Status */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge
                        variant={reg.status === 'Registered' ? 'success' : 'danger'}
                        size="sm"
                        dot
                      >
                        {reg.status}
                      </Badge>
                    </td>

                    {/* Actions: View Details & View Student (Student 360) */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Details Modal */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingRegistration(reg)}
                          className="text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 px-2 py-1"
                        >
                          View
                        </Button>

                        {/* Student 360 Navigation */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/faculty/students/${reg.studentId}`)}
                          className="text-xs px-2.5 py-1 text-blue-600 border-blue-200 hover:bg-blue-50/60"
                        >
                          View Student
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-800">{filteredRegistrations.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{initialRegistrations.length}</span> registrations
            </span>
            <span className="text-[11px] text-slate-400">
              KPGU Student Registrations &bull; Registered &#8800; Participated
            </span>
          </div>
        </Card>
      )}

      {/* 8. Registration Details Modal */}
      {viewingRegistration && (
        <Modal
          isOpen={true}
          onClose={() => setViewingRegistration(null)}
          title="Registration Details"
          size="md"
        >
          <div className="space-y-4 py-1">
            {/* Student Header Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {viewingRegistration.studentAvatar}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-base">
                  {viewingRegistration.studentName}
                </h3>
                <p className="text-xs text-slate-500">{viewingRegistration.studentEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="sm">
                    {viewingRegistration.studentId}
                  </Badge>
                  <Badge
                    variant={viewingRegistration.status === 'Registered' ? 'success' : 'danger'}
                    size="sm"
                    dot
                  >
                    {viewingRegistration.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Structured Registration Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {viewingRegistration.department}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[11px]">Course & Year</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {viewingRegistration.course} &bull; {viewingRegistration.academicYear}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white col-span-2">
                <span className="text-slate-400 block text-[11px]">Registered Activity</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {viewingRegistration.activityTitle}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[11px]">Registration Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {viewingRegistration.registrationDate}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <span className="text-slate-400 block text-[11px]">Status Note</span>
                <span className="font-medium text-slate-600 mt-0.5 block">
                  Registered (Participation pending event verification)
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingRegistration(null)}
              >
                Close
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const studentId = viewingRegistration.studentId
                  setViewingRegistration(null)
                  navigate(`/faculty/students/${studentId}`)
                }}
                icon={<IconChevronRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                View Student Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </FacultyLayout>
  )
}
