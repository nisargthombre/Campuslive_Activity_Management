import { useState, useMemo, useRef, useEffect } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import {
  IconCalendar,
  IconClipboardCheck,
  IconCheck,
  IconUsers,
  IconUser,
  IconClubs,
  IconSupport,
  IconFilter,
  IconSearch,
  IconClose,
  IconChevronDown,
  IconEye,
} from '../components/icons/Icons'
import {
  reportTypes,
  reportDateRanges,
  departmentsList,
  rawActivityReportData,
  rawRegistrationReportData,
  rawParticipationReportData,
  rawStudentReportData,
  rawAdminFacultyReportData,
  rawClubReportData,
  rawSupportReportData,
} from '../data/superAdminReportsData'

export default function SuperAdminReports() {
  // 1. Report Type & Date Range State
  const [selectedReportType, setSelectedReportType] = useState('activity')
  const [selectedDateRange, setSelectedDateRange] = useState('This Academic Year')
  const [customStart, setCustomStart] = useState('2026-06-01')
  const [customEnd, setCustomEnd] = useState('2026-10-31')
  const [appliedCustomStart, setAppliedCustomStart] = useState('')
  const [appliedCustomEnd, setAppliedCustomEnd] = useState('')
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const dateDropdownRef = useRef(null)

  // 2. Common Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All Departments')

  // 3. Specific Filter States
  // Activity
  const [activityTypeFilter, setActivityTypeFilter] = useState('All')
  const [activityStatusFilter, setActivityStatusFilter] = useState('All')

  // Registration
  const [regStatusFilter, setRegStatusFilter] = useState('All')
  const [regTimeframeFilter, setRegTimeframeFilter] = useState('All')

  // Participation
  const [partTypeFilter, setPartTypeFilter] = useState('All')
  const [partStatusFilter, setPartStatusFilter] = useState('All')

  // Student
  const [studentCourseFilter, setStudentCourseFilter] = useState('All')
  const [studentYearFilter, setStudentYearFilter] = useState('All')
  const [studentStatusFilter, setStudentStatusFilter] = useState('All')

  // Admin / Faculty
  const [staffRoleFilter, setStaffRoleFilter] = useState('All')
  const [staffStatusFilter, setStaffStatusFilter] = useState('All')

  // Club
  const [clubCategoryFilter, setClubCategoryFilter] = useState('All')
  const [clubStatusFilter, setClubStatusFilter] = useState('All')

  // Support
  const [ticketStatusFilter, setTicketStatusFilter] = useState('All')
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('All')
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState('All')
  const [ticketRoleFilter, setTicketRoleFilter] = useState('All')

  // 4. Export Banner State
  const [exportBanner, setExportBanner] = useState({ visible: false, message: '' })

  // 5. Details Modal State
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Outside click listener for date range dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-dismiss export message after 4s
  useEffect(() => {
    if (exportBanner.visible) {
      const timer = setTimeout(() => {
        setExportBanner({ visible: false, message: '' })
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [exportBanner.visible])

  // Clear specific filters when switching report type
  const handleSelectReportType = (id) => {
    setSelectedReportType(id)
    setSearchQuery('')
    setDeptFilter('All Departments')
    setActivityTypeFilter('All')
    setActivityStatusFilter('All')
    setRegStatusFilter('All')
    setRegTimeframeFilter('All')
    setPartTypeFilter('All')
    setPartStatusFilter('All')
    setStudentCourseFilter('All')
    setStudentYearFilter('All')
    setStudentStatusFilter('All')
    setStaffRoleFilter('All')
    setStaffStatusFilter('All')
    setClubCategoryFilter('All')
    setClubStatusFilter('All')
    setTicketStatusFilter('All')
    setTicketPriorityFilter('All')
    setTicketCategoryFilter('All')
    setTicketRoleFilter('All')
  }

  // Reset All to initial default state
  const handleResetAll = () => {
    setSelectedReportType('activity')
    setSelectedDateRange('This Academic Year')
    setAppliedCustomStart('')
    setAppliedCustomEnd('')
    setSearchQuery('')
    setDeptFilter('All Departments')
    setActivityTypeFilter('All')
    setActivityStatusFilter('All')
    setRegStatusFilter('All')
    setRegTimeframeFilter('All')
    setPartTypeFilter('All')
    setPartStatusFilter('All')
    setStudentCourseFilter('All')
    setStudentYearFilter('All')
    setStudentStatusFilter('All')
    setStaffRoleFilter('All')
    setStaffStatusFilter('All')
    setClubCategoryFilter('All')
    setClubStatusFilter('All')
    setTicketStatusFilter('All')
    setTicketPriorityFilter('All')
    setTicketCategoryFilter('All')
    setTicketRoleFilter('All')
  }

  // Clear active filters only
  const handleClearActiveFilters = () => {
    setSearchQuery('')
    setDeptFilter('All Departments')
    setActivityTypeFilter('All')
    setActivityStatusFilter('All')
    setRegStatusFilter('All')
    setRegTimeframeFilter('All')
    setPartTypeFilter('All')
    setPartStatusFilter('All')
    setStudentCourseFilter('All')
    setStudentYearFilter('All')
    setStudentStatusFilter('All')
    setStaffRoleFilter('All')
    setStaffStatusFilter('All')
    setClubCategoryFilter('All')
    setClubStatusFilter('All')
    setTicketStatusFilter('All')
    setTicketPriorityFilter('All')
    setTicketCategoryFilter('All')
    setTicketRoleFilter('All')
  }

  // Handle Export Mock Action
  const handleExport = (format) => {
    const currentMeta = reportTypes.find((r) => r.id === selectedReportType)
    const reportLabel = currentMeta ? currentMeta.label : 'Report'
    setExportBanner({
      visible: true,
      message: `${reportLabel} (${format.toUpperCase()}) prepared successfully. Institutional export generated for ${selectedDateRange}.`,
    })
  }

  // Handle View Details
  const handleViewDetails = (record) => {
    setSelectedRecord(record)
    setDetailsModalOpen(true)
  }

  // Handle Apply Custom Range
  const handleApplyCustomRange = (e) => {
    e.preventDefault()
    setAppliedCustomStart(customStart)
    setAppliedCustomEnd(customEnd)
    setDateDropdownOpen(false)
  }

  // =========================================================================
  // FILTERED DATASETS (AND Logic applied)
  // =========================================================================

  // 1. Activity Report
  const filteredActivities = useMemo(() => {
    return rawActivityReportData.filter((item) => {
      // Date Range condition mock
      if (selectedDateRange === 'Last 7 Days' && item.rawDate < '2026-09-18') return false
      if (selectedDateRange === 'Last 30 Days' && item.rawDate < '2026-08-25') return false
      if (selectedDateRange === 'Last 3 Months' && item.rawDate < '2026-06-25') return false

      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Activity Type
      if (activityTypeFilter !== 'All' && item.type !== activityTypeFilter) return false

      // Activity Status
      if (activityStatusFilter !== 'All' && item.status !== activityStatusFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.activity.toLowerCase().includes(q)
        const matchId = item.id.toLowerCase().includes(q)
        const matchOrg = item.organizer.toLowerCase().includes(q)
        if (!matchTitle && !matchId && !matchOrg) return false
      }

      return true
    })
  }, [selectedDateRange, deptFilter, activityTypeFilter, activityStatusFilter, searchQuery])

  // 2. Registration Report
  const filteredRegistrations = useMemo(() => {
    return rawRegistrationReportData.filter((item) => {
      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Registration Status
      if (regStatusFilter !== 'All' && item.status !== regStatusFilter) return false

      // Timeframe
      if (regTimeframeFilter === 'Upcoming' && !item.isUpcoming) return false
      if (regTimeframeFilter === 'Past' && item.isUpcoming) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.student.toLowerCase().includes(q)
        const matchId = item.studentId.toLowerCase().includes(q)
        const matchAct = item.activity.toLowerCase().includes(q)
        const matchRegId = item.id.toLowerCase().includes(q)
        if (!matchName && !matchId && !matchAct && !matchRegId) return false
      }

      return true
    })
  }, [deptFilter, regStatusFilter, regTimeframeFilter, searchQuery])

  // 3. Participation Report
  const filteredParticipation = useMemo(() => {
    return rawParticipationReportData.filter((item) => {
      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Activity Type
      if (partTypeFilter !== 'All' && item.activityType !== partTypeFilter) return false

      // Participation Status
      if (partStatusFilter !== 'All' && item.participationStatus !== partStatusFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.student.toLowerCase().includes(q)
        const matchId = item.studentId.toLowerCase().includes(q)
        const matchAct = item.activity.toLowerCase().includes(q)
        if (!matchName && !matchId && !matchAct) return false
      }

      return true
    })
  }, [deptFilter, partTypeFilter, partStatusFilter, searchQuery])

  // 4. Student Report
  const filteredStudents = useMemo(() => {
    return rawStudentReportData.filter((item) => {
      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Course
      if (studentCourseFilter !== 'All' && item.course !== studentCourseFilter) return false

      // Academic Year
      if (studentYearFilter !== 'All' && item.year !== studentYearFilter) return false

      // Status
      if (studentStatusFilter !== 'All' && item.status !== studentStatusFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.student.toLowerCase().includes(q)
        const matchId = item.studentId.toLowerCase().includes(q)
        const matchEmail = item.email.toLowerCase().includes(q)
        if (!matchName && !matchId && !matchEmail) return false
      }

      return true
    })
  }, [deptFilter, studentCourseFilter, studentYearFilter, studentStatusFilter, searchQuery])

  // 5. Admin / Faculty Report
  const filteredAdminFaculty = useMemo(() => {
    return rawAdminFacultyReportData.filter((item) => {
      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Role
      if (staffRoleFilter !== 'All' && item.role !== staffRoleFilter) return false

      // Status
      if (staffStatusFilter !== 'All' && item.status !== staffStatusFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.name.toLowerCase().includes(q)
        const matchId = item.staffId.toLowerCase().includes(q)
        const matchEmail = item.email.toLowerCase().includes(q)
        if (!matchName && !matchId && !matchEmail) return false
      }

      return true
    })
  }, [deptFilter, staffRoleFilter, staffStatusFilter, searchQuery])

  // 6. Club Report
  const filteredClubs = useMemo(() => {
    return rawClubReportData.filter((item) => {
      // Category
      if (clubCategoryFilter !== 'All' && item.category !== clubCategoryFilter) return false

      // Status
      if (clubStatusFilter !== 'All' && item.status !== clubStatusFilter) return false

      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = item.club.toLowerCase().includes(q)
        const matchCoord = item.coordinator.toLowerCase().includes(q)
        if (!matchName && !matchCoord) return false
      }

      return true
    })
  }, [clubCategoryFilter, clubStatusFilter, deptFilter, searchQuery])

  // 7. Support Ticket Report
  const filteredSupport = useMemo(() => {
    return rawSupportReportData.filter((item) => {
      // Status
      if (ticketStatusFilter !== 'All' && item.status !== ticketStatusFilter) return false

      // Priority
      if (ticketPriorityFilter !== 'All' && item.priority !== ticketPriorityFilter) return false

      // Category
      if (ticketCategoryFilter !== 'All' && item.category !== ticketCategoryFilter) return false

      // Role
      if (ticketRoleFilter !== 'All' && item.role !== ticketRoleFilter) return false

      // Department
      if (deptFilter !== 'All Departments' && item.department !== deptFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNum = item.ticketNumber.toLowerCase().includes(q)
        const matchSub = item.subject.toLowerCase().includes(q)
        const matchCreator = item.createdBy.toLowerCase().includes(q)
        if (!matchNum && !matchSub && !matchCreator) return false
      }

      return true
    })
  }, [ticketStatusFilter, ticketPriorityFilter, ticketCategoryFilter, ticketRoleFilter, deptFilter, searchQuery])

  // Helper mapping icon for report types
  const renderReportIcon = (iconName, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'calendar': return <IconCalendar className={className} />
      case 'clipboard': return <IconClipboardCheck className={className} />
      case 'check': return <IconCheck className={className} />
      case 'user': return <IconUser className={className} />
      case 'users': return <IconUsers className={className} />
      case 'clubs': return <IconClubs className={className} />
      case 'support': return <IconSupport className={className} />
      default: return <IconCalendar className={className} />
    }
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. EXPORT NOTIFICATION BANNER                                  */}
      {/* ============================================================== */}
      {exportBanner.visible && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <IconCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Report prepared successfully.
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {exportBanner.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExportBanner({ visible: false, message: '' })}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md transition-colors"
            title="Dismiss message"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Super Admin Reports"
        subtitle="System-wide institutional records, capacity audits, student registries, and exportable datasets."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Reports' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Selector Pill */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                type="button"
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
              >
                <IconCalendar className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{selectedDateRange}</span>
                <IconChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    dateDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Report Date Range
                  </div>
                  {reportDateRanges.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedDateRange(opt)
                        if (opt !== 'Custom Range') {
                          setDateDropdownOpen(false)
                          setAppliedCustomStart('')
                          setAppliedCustomEnd('')
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedDateRange === opt
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedDateRange === opt && <IconCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export CSV Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('CSV')}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
              icon={
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Export CSV
            </Button>

            {/* Export PDF Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('PDF')}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
              icon={
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            >
              Export PDF
            </Button>

            {/* Reset All Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="text-slate-500 hover:text-slate-800 text-xs"
            >
              Reset All
            </Button>

            {/* Badge */}
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
          </div>
        }
      />

      {/* Custom Range Picker Drawer */}
      {selectedDateRange === 'Custom Range' && (
        <Card className="mb-6 bg-slate-50/70 border-dashed" padding="sm">
          <form onSubmit={handleApplyCustomRange} className="flex flex-wrap items-end gap-3">
            <div className="w-40">
              <Input
                label="From Date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                required
              />
            </div>
            <div className="w-40">
              <Input
                label="To Date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<IconFilter className="w-3.5 h-3.5" />}
            >
              Apply Filter
            </Button>
            {appliedCustomStart && (
              <span className="text-xs text-slate-500 pb-2">
                Active: {appliedCustomStart} to {appliedCustomEnd}
              </span>
            )}
          </form>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 1: REPORT TYPE SELECTOR (7 Report Types)            */}
      {/* ============================================================== */}
      <section aria-label="Report Type Selector" className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Select Report Type
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Reports = Structured filtered datasets ready for export
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {reportTypes.map((rpt) => {
            const isSelected = selectedReportType === rpt.id
            return (
              <button
                key={rpt.id}
                type="button"
                onClick={() => handleSelectReportType(rpt.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {renderReportIcon(rpt.icon, 'w-4 h-4')}
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-blue-900' : 'text-slate-800'
                  }`}
                >
                  {rpt.label}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {rpt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 4: SUMMARY CARDS ACCORDING TO SELECTED REPORT TYPE  */}
      {/* ============================================================== */}
      <section aria-label="Report Summary Cards" className="mb-6">
        {/* ACTIVITY REPORT SUMMARY */}
        {selectedReportType === 'activity' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Activities
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredActivities.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Filtered records
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Upcoming
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {filteredActivities.filter((a) => a.status === 'Upcoming').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Active registration queues
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredActivities.filter((a) => a.status === 'Completed').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Rosters archived
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Cancelled
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {filteredActivities.filter((a) => a.status === 'Cancelled').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                No capacity occupied
              </span>
            </div>
          </div>
        )}

        {/* REGISTRATION REPORT SUMMARY */}
        {selectedReportType === 'registration' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Registrations
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredRegistrations.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Gross student applications
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Valid
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {filteredRegistrations.filter((r) => r.status === 'Registered').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Seat reservations confirmed
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Cancelled
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {filteredRegistrations.filter((r) => r.status === 'Cancelled').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Seats freed & refunded
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Upcoming
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">
                {filteredRegistrations.filter((r) => r.isUpcoming).length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Upcoming session bookings
              </span>
            </div>
          </div>
        )}

        {/* PARTICIPATION REPORT SUMMARY */}
        {selectedReportType === 'participation' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Students
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {filteredParticipation.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Seat reservation holders
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Participated Students
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredParticipation.filter((p) => p.participationStatus === 'Participated').length}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                Roster verified check-ins
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Absent / No-Show
              </span>
              <span className="text-2xl font-black text-slate-700 mt-1 block">
                {filteredParticipation.filter((p) => p.participationStatus === 'Absent / No-Show').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Unverified absence recorded
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Turnout Ratio
              </span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">
                {filteredParticipation.length > 0
                  ? (
                      (filteredParticipation.filter((p) => p.participationStatus === 'Participated').length /
                        filteredParticipation.length) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Strict: Registered ≠ Participated
              </span>
            </div>
          </div>
        )}

        {/* STUDENT REPORT SUMMARY */}
        {selectedReportType === 'student' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Students
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredStudents.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Matched institutional records
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Students
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredStudents.filter((s) => s.status === 'Active').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                In good standing
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Inactive Students
              </span>
              <span className="text-2xl font-black text-slate-600 mt-1 block">
                {filteredStudents.filter((s) => s.status === 'Inactive').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Graduated or suspended
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Departments
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {new Set(filteredStudents.map((s) => s.department)).size}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Active campus divisions
              </span>
            </div>
          </div>
        )}

        {/* ADMIN / FACULTY REPORT SUMMARY */}
        {selectedReportType === 'adminFaculty' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Staff
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredAdminFaculty.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Coordinators & staff
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Staff
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredAdminFaculty.filter((f) => f.status === 'Active').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Active event coordinators
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Inactive Staff
              </span>
              <span className="text-2xl font-black text-slate-600 mt-1 block">
                {filteredAdminFaculty.filter((f) => f.status === 'Inactive').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                On sabbatical / retired
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Managed Activities
              </span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">
                {filteredAdminFaculty.reduce((sum, f) => sum + f.managedActivities, 0)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Total events supervised
              </span>
            </div>
          </div>
        )}

        {/* CLUB REPORT SUMMARY */}
        {selectedReportType === 'club' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Clubs
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredClubs.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Chartered societies
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Chapters
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredClubs.filter((c) => c.status === 'Active').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Conducting regular fests
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Inactive Chapters
              </span>
              <span className="text-2xl font-black text-slate-600 mt-1 block">
                {filteredClubs.filter((c) => c.status === 'Inactive').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Awaiting charter renewal
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Members
              </span>
              <span className="text-2xl font-black text-blue-600 mt-1 block">
                {filteredClubs.reduce((sum, c) => sum + c.members, 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Enrolled society members
              </span>
            </div>
          </div>
        )}

        {/* SUPPORT TICKET REPORT SUMMARY */}
        {selectedReportType === 'support' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Tickets
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {filteredSupport.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Helpdesk tickets in scope
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Open Tickets
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {filteredSupport.filter((t) => t.status === 'Open').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Awaiting initial action
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {filteredSupport.filter((t) => t.status === 'In Progress').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Being investigated
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Resolved
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {filteredSupport.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Completed & verified
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. SECTION 3: DYNAMIC REPORT FILTERS                           */}
      {/* ============================================================== */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <IconFilter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Filter {reportTypes.find((r) => r.id === selectedReportType)?.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearActiveFilters}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder="Search by name, ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<IconSearch className="w-4 h-4 text-slate-400" />}
              />
            </div>

            {/* Department Filter (Universal) */}
            <div>
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={departmentsList.map((d) => ({ label: d, value: d }))}
              />
            </div>

            {/* REPORT-SPECIFIC FILTERS */}

            {/* 1. Activity Report Filters */}
            {selectedReportType === 'activity' && (
              <>
                <div>
                  <Select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    options={[
                      { label: 'All Activity Types', value: 'All' },
                      { label: 'Workshop', value: 'Workshop' },
                      { label: 'Seminar', value: 'Seminar' },
                      { label: 'Competition', value: 'Competition' },
                      { label: 'Hackathon', value: 'Hackathon' },
                      { label: 'Cultural', value: 'Cultural' },
                      { label: 'Sports', value: 'Sports' },
                      { label: 'Technical', value: 'Technical' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={activityStatusFilter}
                    onChange={(e) => setActivityStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Statuses', value: 'All' },
                      { label: 'Upcoming', value: 'Upcoming' },
                      { label: 'Completed', value: 'Completed' },
                      { label: 'Cancelled', value: 'Cancelled' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 2. Registration Report Filters */}
            {selectedReportType === 'registration' && (
              <>
                <div>
                  <Select
                    value={regStatusFilter}
                    onChange={(e) => setRegStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Statuses', value: 'All' },
                      { label: 'Registered', value: 'Registered' },
                      { label: 'Cancelled', value: 'Cancelled' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={regTimeframeFilter}
                    onChange={(e) => setRegTimeframeFilter(e.target.value)}
                    options={[
                      { label: 'All Schedules', value: 'All' },
                      { label: 'Upcoming Activities', value: 'Upcoming' },
                      { label: 'Past Activities', value: 'Past' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 3. Participation Report Filters */}
            {selectedReportType === 'participation' && (
              <>
                <div>
                  <Select
                    value={partTypeFilter}
                    onChange={(e) => setPartTypeFilter(e.target.value)}
                    options={[
                      { label: 'All Activity Types', value: 'All' },
                      { label: 'Workshop', value: 'Workshop' },
                      { label: 'Seminar', value: 'Seminar' },
                      { label: 'Competition', value: 'Competition' },
                      { label: 'Hackathon', value: 'Hackathon' },
                      { label: 'Cultural', value: 'Cultural' },
                      { label: 'Sports', value: 'Sports' },
                      { label: 'Technical', value: 'Technical' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={partStatusFilter}
                    onChange={(e) => setPartStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Attendance States', value: 'All' },
                      { label: 'Participated', value: 'Participated' },
                      { label: 'Absent / No-Show', value: 'Absent / No-Show' },
                      { label: 'Pending Check-in', value: 'Pending Check-in' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 4. Student Report Filters */}
            {selectedReportType === 'student' && (
              <>
                <div>
                  <Select
                    value={studentCourseFilter}
                    onChange={(e) => setStudentCourseFilter(e.target.value)}
                    options={[
                      { label: 'All Courses', value: 'All' },
                      { label: 'B.Tech', value: 'B.Tech' },
                      { label: 'M.Tech', value: 'M.Tech' },
                      { label: 'BCA / MCA', value: 'BCA' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={studentYearFilter}
                    onChange={(e) => setStudentYearFilter(e.target.value)}
                    options={[
                      { label: 'All Academic Years', value: 'All' },
                      { label: 'First Year', value: 'First Year' },
                      { label: 'Second Year', value: 'Second Year' },
                      { label: 'Third Year', value: 'Third Year' },
                      { label: 'Fourth Year', value: 'Fourth Year' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Student Statuses', value: 'All' },
                      { label: 'Active', value: 'Active' },
                      { label: 'Inactive', value: 'Inactive' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 5. Admin / Faculty Report Filters */}
            {selectedReportType === 'adminFaculty' && (
              <>
                <div>
                  <Select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    options={[
                      { label: 'All Staff Roles', value: 'All' },
                      { label: 'Admin (Coordinator)', value: 'Admin' },
                      { label: 'Staff (Assistant)', value: 'Staff' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={staffStatusFilter}
                    onChange={(e) => setStaffStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Statuses', value: 'All' },
                      { label: 'Active', value: 'Active' },
                      { label: 'Inactive', value: 'Inactive' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 6. Club Report Filters */}
            {selectedReportType === 'club' && (
              <>
                <div>
                  <Select
                    value={clubCategoryFilter}
                    onChange={(e) => setClubCategoryFilter(e.target.value)}
                    options={[
                      { label: 'All Categories', value: 'All' },
                      { label: 'Technical', value: 'Technical' },
                      { label: 'Cultural', value: 'Cultural' },
                      { label: 'Sports', value: 'Sports' },
                      { label: 'Social', value: 'Social' },
                      { label: 'Literary', value: 'Literary' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={clubStatusFilter}
                    onChange={(e) => setClubStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Chapter Statuses', value: 'All' },
                      { label: 'Active Chapters', value: 'Active' },
                      { label: 'Inactive Chapters', value: 'Inactive' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* 7. Support Ticket Report Filters */}
            {selectedReportType === 'support' && (
              <>
                <div>
                  <Select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Ticket Statuses', value: 'All' },
                      { label: 'Open', value: 'Open' },
                      { label: 'In Progress', value: 'In Progress' },
                      { label: 'Resolved', value: 'Resolved' },
                      { label: 'Closed', value: 'Closed' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={ticketPriorityFilter}
                    onChange={(e) => setTicketPriorityFilter(e.target.value)}
                    options={[
                      { label: 'All Priorities', value: 'All' },
                      { label: 'High', value: 'High' },
                      { label: 'Medium', value: 'Medium' },
                      { label: 'Low', value: 'Low' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={ticketRoleFilter}
                    onChange={(e) => setTicketRoleFilter(e.target.value)}
                    options={[
                      { label: 'All Created By Roles', value: 'All' },
                      { label: 'Student', value: 'Student' },
                      { label: 'Faculty', value: 'Faculty' },
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ============================================================== */}
      {/* 6. SECTION 5: REPORT TABLE                                     */}
      {/* ============================================================== */}
      <Card padding="none" className="overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {reportTypes.find((r) => r.id === selectedReportType)?.label} Data
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered for {selectedDateRange} • System-wide institution logs
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {selectedReportType === 'activity' && `${filteredActivities.length} Records`}
            {selectedReportType === 'registration' && `${filteredRegistrations.length} Records`}
            {selectedReportType === 'participation' && `${filteredParticipation.length} Records`}
            {selectedReportType === 'student' && `${filteredStudents.length} Records`}
            {selectedReportType === 'adminFaculty' && `${filteredAdminFaculty.length} Records`}
            {selectedReportType === 'club' && `${filteredClubs.length} Records`}
            {selectedReportType === 'support' && `${filteredSupport.length} Records`}
          </span>
        </div>

        {/* ========================================================== */}
        {/* TABLE 1: ACTIVITY REPORT                                   */}
        {/* ========================================================== */}
        {selectedReportType === 'activity' && (
          filteredActivities.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try broadening your department, activity type, or status criteria."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Activity</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Registrations</th>
                    <th className="py-3 px-4 text-center">Capacity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <div>{act.activity}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{act.id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700">{act.type}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {act.department}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {act.date}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                        {act.registrations}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                        {act.capacity}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            act.status === 'Completed'
                              ? 'success'
                              : act.status === 'Cancelled'
                              ? 'danger'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {act.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(act)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 2: REGISTRATION REPORT                               */}
        {/* ========================================================== */}
        {selectedReportType === 'registration' && (
          filteredRegistrations.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing registration status or timeframe filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4">Activity Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {reg.student}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {reg.studentId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {reg.activity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {reg.department}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {reg.registrationDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {reg.activityDate}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={reg.status === 'Registered' ? 'success' : 'danger'}
                          size="sm"
                        >
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(reg)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 3: PARTICIPATION REPORT                              */}
        {/* ========================================================== */}
        {selectedReportType === 'participation' && (
          filteredParticipation.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing participation status or department filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4 text-center">Registration Status</th>
                    <th className="py-3 px-4 text-center">Participation Status</th>
                    <th className="py-3 px-4">Activity Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredParticipation.map((part) => (
                    <tr key={part.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {part.student}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {part.studentId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {part.activity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {part.department}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="primary" size="sm">
                          {part.registrationStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            part.participationStatus === 'Participated'
                              ? 'success'
                              : part.participationStatus === 'Absent / No-Show'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {part.participationStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {part.activityDate}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(part)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 4: STUDENT REPORT                                    */}
        {/* ========================================================== */}
        {selectedReportType === 'student' && (
          filteredStudents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing course, year, or student status filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Academic Year</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <div>{stu.student}</div>
                        <div className="text-[11px] text-slate-400">{stu.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {stu.studentId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {stu.department}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {stu.course}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {stu.year}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={stu.status === 'Active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {stu.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(stu)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 5: ADMIN / FACULTY REPORT                            */}
        {/* ========================================================== */}
        {selectedReportType === 'adminFaculty' && (
          filteredAdminFaculty.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing role or department filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-4">Staff ID</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Managed Activities</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAdminFaculty.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        <div>{staff.name}</div>
                        <div className="text-[11px] text-slate-400">{staff.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {staff.staffId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {staff.department}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px]">
                          {staff.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {staff.managedActivities}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={staff.status === 'Active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {staff.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(staff)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 6: CLUB REPORT                                       */}
        {/* ========================================================== */}
        {selectedReportType === 'club' && (
          filteredClubs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing club category or status filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Club</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Coordinator</th>
                    <th className="py-3 px-4 text-center">Members</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredClubs.map((clb) => (
                    <tr key={clb.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {clb.club}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md text-[11px]">
                          {clb.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {clb.department}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {clb.coordinator}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {clb.members}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={clb.status === 'Active' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {clb.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(clb)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ========================================================== */}
        {/* TABLE 7: SUPPORT TICKET REPORT                             */}
        {/* ========================================================== */}
        {selectedReportType === 'support' && (
          filteredSupport.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No records found for the selected filters."
                description="Try clearing ticket status, priority, or category filters."
                icon={<IconSearch className="w-8 h-8 text-slate-400" />}
                actionText="Clear Filters"
                onAction={handleClearActiveFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">Ticket Number</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Created By</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredSupport.map((tck) => (
                    <tr key={tck.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                        {tck.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[220px] truncate" title={tck.subject}>
                        {tck.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {tck.createdBy}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {tck.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {tck.category}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            tck.priority === 'High'
                              ? 'danger'
                              : tck.priority === 'Medium'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {tck.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            tck.status === 'Resolved' || tck.status === 'Closed'
                              ? 'success'
                              : tck.status === 'Open'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {tck.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {tck.createdDate}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(tck)}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Card>

      {/* ============================================================== */}
      {/* 7. VIEW DETAILS MODAL                                          */}
      {/* ============================================================== */}
      {detailsModalOpen && selectedRecord && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Report Record Details • ${reportTypes.find((r) => r.id === selectedReportType)?.label}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* ACTIVITY DETAILS */}
            {selectedReportType === 'activity' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.id}</span>
                    <Badge
                      variant={
                        selectedRecord.status === 'Completed'
                          ? 'success'
                          : selectedRecord.status === 'Cancelled'
                          ? 'danger'
                          : 'primary'
                      }
                      size="sm"
                    >
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.activity}</h4>
                  <p className="text-slate-600 text-xs mt-0.5">{selectedRecord.department} • {selectedRecord.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.date}</p>
                    <p className="text-slate-500 text-[11px]">{selectedRecord.time}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Venue</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.venue}</p>
                    <p className="text-slate-500 text-[11px]">Campus Facility</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Registrations</span>
                    <span className="text-lg font-black text-blue-900 mt-0.5 block">{selectedRecord.registrations}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Max Capacity</span>
                    <span className="text-lg font-black text-slate-800 mt-0.5 block">{selectedRecord.capacity}</span>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Available Seats</span>
                    <span className="text-lg font-black text-emerald-900 mt-0.5 block">{selectedRecord.availableSeats}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Organizer</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedRecord.organizer}</p>
                </div>
              </div>
            )}

            {/* REGISTRATION DETAILS */}
            {selectedReportType === 'registration' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.id}</span>
                    <Badge variant={selectedRecord.status === 'Registered' ? 'success' : 'danger'} size="sm">
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.student}</h4>
                  <p className="text-slate-600 text-xs mt-0.5 font-mono">{selectedRecord.studentId} • {selectedRecord.email}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled Activity</span>
                  <p className="font-bold text-slate-900 mt-1">{selectedRecord.activity}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedRecord.department}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registration Date</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.registrationDate}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Scheduled Date</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.activityDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PARTICIPATION DETAILS */}
            {selectedReportType === 'participation' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.id}</span>
                    <Badge
                      variant={
                        selectedRecord.participationStatus === 'Participated'
                          ? 'success'
                          : selectedRecord.participationStatus === 'Absent / No-Show'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {selectedRecord.participationStatus}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.student}</h4>
                  <p className="text-slate-600 text-xs mt-0.5 font-mono">{selectedRecord.studentId} • {selectedRecord.department}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Record</span>
                  <p className="font-bold text-slate-900 mt-1">{selectedRecord.activity}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{selectedRecord.activityType} • Date: {selectedRecord.activityDate}</p>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Verification Telemetry</span>
                  <p className="font-semibold text-emerald-950 mt-1">{selectedRecord.verificationMethod}</p>
                  <p className="text-emerald-700 text-[11px] mt-0.5">Certifying Coordinator: {selectedRecord.verifiedBy}</p>
                </div>
              </div>
            )}

            {/* STUDENT DETAILS */}
            {selectedReportType === 'student' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.studentId}</span>
                    <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.student}</h4>
                  <p className="text-slate-600 text-xs mt-0.5">{selectedRecord.email} • {selectedRecord.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department & Course</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.department}</p>
                    <p className="text-slate-500 text-[11px]">{selectedRecord.course} ({selectedRecord.year})</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Engagement</span>
                    <p className="font-semibold text-slate-800 mt-1">Registrations: {selectedRecord.registeredActivities}</p>
                    <p className="text-emerald-600 font-semibold text-[11px]">Participated: {selectedRecord.participatedActivities}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN / FACULTY DETAILS */}
            {selectedReportType === 'adminFaculty' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.staffId}</span>
                    <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.name}</h4>
                  <p className="text-slate-600 text-xs mt-0.5">{selectedRecord.designation}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department & Role</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.department}</p>
                    <p className="text-indigo-600 font-semibold text-[11px]">Role: {selectedRecord.role}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervised Events</span>
                    <p className="text-xl font-black text-slate-900 mt-1">{selectedRecord.managedActivities}</p>
                    <p className="text-slate-500 text-[11px]">Activities Hosted</p>
                  </div>
                </div>
              </div>
            )}

            {/* CLUB DETAILS */}
            {selectedReportType === 'club' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-slate-500">{selectedRecord.id}</span>
                    <Badge variant={selectedRecord.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.club}</h4>
                  <p className="text-slate-600 text-xs mt-0.5">{selectedRecord.category} Society • {selectedRecord.department}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Charter Description</span>
                  <p className="text-slate-700 text-xs mt-1">{selectedRecord.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Staff Coordinator</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.coordinator}</p>
                    <p className="text-slate-500 text-[11px]">{selectedRecord.coordinatorEmail}</p>
                  </div>
                  <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Membership Roster</span>
                    <p className="text-lg font-black text-purple-900 mt-1">{selectedRecord.members} Total Members</p>
                    <p className="text-purple-700 text-[11px]">{selectedRecord.activeMembers} Active Members</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUPPORT TICKET DETAILS */}
            {selectedReportType === 'support' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{selectedRecord.ticketNumber}</span>
                    <Badge
                      variant={
                        selectedRecord.status === 'Resolved' || selectedRecord.status === 'Closed'
                          ? 'success'
                          : selectedRecord.status === 'Open'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {selectedRecord.status}
                    </Badge>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{selectedRecord.subject}</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Category: {selectedRecord.category} • Priority: {selectedRecord.priority}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Description</span>
                  <p className="text-slate-700 text-xs mt-1">{selectedRecord.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin Details</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedRecord.createdBy} ({selectedRecord.role})</p>
                    <p className="text-slate-500 text-[11px]">{selectedRecord.department}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Handling & Timeline</span>
                    <p className="font-semibold text-slate-800 mt-1">Assigned: {selectedRecord.assignedTo}</p>
                    <p className="text-slate-500 text-[11px]">Logged: {selectedRecord.createdDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsModalOpen(false)}
            >
              Close Record
            </Button>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
