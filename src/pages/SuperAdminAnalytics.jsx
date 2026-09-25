import { useState, useMemo, useRef, useEffect } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import {
  IconActivity,
  IconCalendar,
  IconClipboardCheck,
  IconUsers,
  IconUser,
  IconTrendingUp,
  IconChart,
  IconFilter,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconClubs,
  IconSupport,
  IconClock,
  IconMapPin,
  IconAlertCircle,
} from '../components/icons/Icons'
import {
  timeRangeOptions,
  activityTypesList,
  categoryColors,
  analyticsDatasetsByRange,
  clubAnalyticsData,
  supportAnalyticsData,
  upcomingActivitiesData,
  getSuperAdminAnalyticsData,
} from '../data/superAdminAnalyticsData'

export default function SuperAdminAnalytics() {
  // 1. Date Range State
  const [selectedPeriod, setSelectedPeriod] = useState('This Academic Year')
  const [customStart, setCustomStart] = useState('2026-06-01')
  const [customEnd, setCustomEnd] = useState('2026-09-25')
  const [appliedCustomStart, setAppliedCustomStart] = useState('')
  const [appliedCustomEnd, setAppliedCustomEnd] = useState('')
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const dateDropdownRef = useRef(null)

  // 2. Export Banner State
  const [exportBannerVisible, setExportBannerVisible] = useState(false)
  const [exportTimestamp, setExportTimestamp] = useState('')

  // 3. Interactive Chart Hover States
  const [hoveredActivityBar, setHoveredActivityBar] = useState(null)
  const [hoveredRegBar, setHoveredRegBar] = useState(null)
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState(null)
  const [deptViewMode, setDeptViewMode] = useState('table') // 'table' | 'chart'

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-dismiss export message after 5s
  useEffect(() => {
    if (exportBannerVisible) {
      const timer = setTimeout(() => {
        setExportBannerVisible(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [exportBannerVisible])

  // Get active dataset
  const activeDataset = useMemo(() => {
    return getSuperAdminAnalyticsData(selectedPeriod, appliedCustomStart, appliedCustomEnd)
  }, [selectedPeriod, appliedCustomStart, appliedCustomEnd])

  const summary = activeDataset.summary

  // Handle Export Action
  const handleExportReport = () => {
    const now = new Date()
    setExportTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    setExportBannerVisible(true)
  }

  // Handle Custom Date Range Submit
  const handleApplyCustomRange = (e) => {
    e.preventDefault()
    setAppliedCustomStart(customStart)
    setAppliedCustomEnd(customEnd)
    setDateDropdownOpen(false)
  }

  // =========================================================================
  // CHART CALCULATIONS & GEOMETRY
  // =========================================================================

  // A. Activity Overview Chart (Grouped Bars: Created, Completed, Cancelled)
  const actChartWidth = 560
  const actChartHeight = 220
  const actPadLeft = 35
  const actPadRight = 20
  const actPadTop = 20
  const actPadBottom = 35

  const activityMaxVal = useMemo(() => {
    const maxVal = Math.max(
      ...activeDataset.activityTrends.map((d) => Math.max(d.created, d.completed, d.cancelled, 1)),
      1
    )
    return Math.ceil(maxVal * 1.25)
  }, [activeDataset])

  const activityBarGroups = useMemo(() => {
    const count = activeDataset.activityTrends.length
    if (count === 0) return []
    const availableWidth = actChartWidth - actPadLeft - actPadRight
    const groupSlot = availableWidth / count
    const barW = Math.min(Math.max(groupSlot * 0.22, 8), 16)
    const gap = 3
    const totalGroupBarsW = barW * 3 + gap * 2
    const usableH = actChartHeight - actPadTop - actPadBottom

    return activeDataset.activityTrends.map((item, idx) => {
      const centerX = actPadLeft + idx * groupSlot + groupSlot / 2
      const startX = centerX - totalGroupBarsW / 2

      const createdH = (item.created / activityMaxVal) * usableH
      const createdY = actChartHeight - actPadBottom - createdH

      const completedH = (item.completed / activityMaxVal) * usableH
      const completedY = actChartHeight - actPadBottom - completedH

      const cancelledH = (item.cancelled / activityMaxVal) * usableH
      const cancelledY = actChartHeight - actPadBottom - cancelledH

      return {
        ...item,
        centerX,
        barW,
        createdX: startX,
        createdY,
        createdH,
        completedX: startX + barW + gap,
        completedY,
        completedH,
        cancelledX: startX + (barW + gap) * 2,
        cancelledY,
        cancelledH,
        hitX: startX - 4,
        hitW: totalGroupBarsW + 8,
      }
    })
  }, [activeDataset, activityMaxVal])

  // B. Registration & Cancelled Trend Chart
  const regChartWidth = 560
  const regChartHeight = 220
  const regPadLeft = 40
  const regPadRight = 20
  const regPadTop = 20
  const regPadBottom = 35

  const regMaxVal = useMemo(() => {
    const maxVal = Math.max(...activeDataset.registrationTrends.map((d) => d.total), 1)
    return Math.ceil(maxVal * 1.2)
  }, [activeDataset])

  const registrationBarGroups = useMemo(() => {
    const count = activeDataset.registrationTrends.length
    if (count === 0) return []
    const availableWidth = regChartWidth - regPadLeft - regPadRight
    const groupSlot = availableWidth / count
    const barW = Math.min(Math.max(groupSlot * 0.28, 12), 22)
    const gap = 4
    const totalGroupBarsW = barW * 2 + gap
    const usableH = regChartHeight - regPadTop - regPadBottom

    return activeDataset.registrationTrends.map((item, idx) => {
      const centerX = regPadLeft + idx * groupSlot + groupSlot / 2
      const startX = centerX - totalGroupBarsW / 2

      const activeH = (item.active / regMaxVal) * usableH
      const activeY = regChartHeight - regPadBottom - activeH

      const cancelledH = (item.cancelled / regMaxVal) * usableH
      const cancelledY = regChartHeight - regPadBottom - cancelledH

      return {
        ...item,
        centerX,
        barW,
        activeX: startX,
        activeY,
        activeH,
        cancelledX: startX + barW + gap,
        cancelledY,
        cancelledH,
        hitX: startX - 4,
        hitW: totalGroupBarsW + 8,
      }
    })
  }, [activeDataset, regMaxVal])

  // C. Activity Type Distribution Donut
  const donutRadius = 65
  const donutCircumference = 2 * Math.PI * donutRadius
  const totalActivityTypeCount = useMemo(() => {
    return activeDataset.activityTypes.reduce((sum, item) => sum + item.count, 0)
  }, [activeDataset])

  const donutSlices = useMemo(() => {
    if (totalActivityTypeCount === 0) return []
    let accumulatedOffset = 0
    return activeDataset.activityTypes.map((item) => {
      const fraction = item.count / totalActivityTypeCount
      const dashLength = fraction * donutCircumference
      const strokeDasharray = `${dashLength.toFixed(2)} ${(donutCircumference - dashLength).toFixed(2)}`
      const strokeDashoffset = -accumulatedOffset
      accumulatedOffset += dashLength
      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
        color: categoryColors[item.type] || '#64748b',
      }
    })
  }, [activeDataset, totalActivityTypeCount, donutCircumference])

  // D. Department Volume Max Scale
  const maxDeptParticipation = useMemo(() => {
    return Math.max(...activeDataset.departmentBreakdown.map((d) => d.participated), 1)
  }, [activeDataset])

  const maxDeptRegistrations = useMemo(() => {
    return Math.max(...activeDataset.departmentBreakdown.map((d) => d.registrations), 1)
  }, [activeDataset])

  const maxDeptActivities = useMemo(() => {
    return Math.max(...activeDataset.departmentBreakdown.map((d) => d.activities), 1)
  }, [activeDataset])

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. NOTIFICATION BANNER: EXPORT REPORT SUCCESS                   */}
      {/* ============================================================== */}
      {exportBannerVisible && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <IconCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Analytics report prepared successfully.
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Institutional summary metrics and telemetry compiled for {activeDataset.label} at {exportTimestamp}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExportBannerVisible(false)}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md transition-colors"
            title="Dismiss message"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PAGE HEADER WITH DATE FILTER & EXPORT ACTION                */}
      {/* ============================================================== */}
      <PageHeader
        title="Super Admin Analytics"
        subtitle="System-wide performance telemetry, institutional participation ratios, and campus activity velocity."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Analytics' },
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
                <span>{selectedPeriod}</span>
                <IconChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    dateDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dateDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Time Window
                  </div>
                  {timeRangeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(opt)
                        if (opt !== 'Custom Range') {
                          setDateDropdownOpen(false)
                          setAppliedCustomStart('')
                          setAppliedCustomEnd('')
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        selectedPeriod === opt
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedPeriod === opt && <IconCheck className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Report Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
              icon={
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              }
            >
              Export Report
            </Button>

            {/* Super Admin Status Pill */}
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
          </div>
        }
      />

      {/* Custom Range Picker Drawer */}
      {selectedPeriod === 'Custom Range' && (
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
      {/* 3. SECTION 1: TOP 8 SUMMARY CARDS                              */}
      {/* ============================================================== */}
      <section aria-label="System Summary Metrics" className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            System-Wide Metric Totals • {activeDataset.label}
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            Strict Rule: Registered ≠ Participated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-3.5">
          {/* Card 1: Total Students */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Students
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IconUser className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalStudents.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                12 Departments
              </p>
            </div>
          </div>

          {/* Card 2: Total Admin/Faculty */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Admin / Faculty
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <IconUsers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalFaculty.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Staff Coordinators
              </p>
            </div>
          </div>

          {/* Card 3: Total Activities */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Activities
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <IconActivity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalActivities.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Workshops & Fests
              </p>
            </div>
          </div>

          {/* Card 4: Total Registrations */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Registrations
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <IconClipboardCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalRegistrations.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Gross Applications
              </p>
            </div>
          </div>

          {/* Card 5: Total Participated */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Participated
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IconCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                {summary.totalParticipated.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5 truncate">
                Verified Check-ins
              </p>
            </div>
          </div>

          {/* Card 6: Total Clubs */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Clubs
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <IconClubs className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalClubs}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                25 Active, 3 Inactive
              </p>
            </div>
          </div>

          {/* Card 7: Total Club Members */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Club Members
              </span>
              <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <IconTrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {summary.totalClubMembers.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Active Society Roster
              </p>
            </div>
          </div>

          {/* Card 8: Open Support Tickets */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Open Tickets
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <IconSupport className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
                {summary.openSupportTickets}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                Pending Resolution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 3 & 4: ACTIVITY OVERVIEW & REGISTRATION TREND       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* CHART 1: Activity Trends (Created, Completed, Cancelled) */}
        <Card
          title="Activity Overview"
          subtitle="Lifecycle tracking: Activities created, completed, and cancelled"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Created
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                Cancelled
              </span>
            </div>
          }
        >
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${actChartWidth} ${actChartHeight}`}
              className="w-full h-56 select-none"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                const y = actChartHeight - actPadBottom - ratio * (actChartHeight - actPadTop - actPadBottom)
                const val = Math.round(ratio * activityMaxVal)
                return (
                  <g key={idx}>
                    <line
                      x1={actPadLeft}
                      y1={y}
                      x2={actChartWidth - actPadRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={actPadLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {val}
                    </text>
                  </g>
                )
              })}

              {/* Grouped Bars */}
              {activityBarGroups.map((d, i) => (
                <g key={i}>
                  {/* X Axis Label */}
                  <text
                    x={d.centerX}
                    y={actChartHeight - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    {d.label}
                  </text>

                  {/* Created Bar */}
                  <rect
                    x={d.createdX}
                    y={d.createdY}
                    width={d.barW}
                    height={d.createdH}
                    rx="2.5"
                    fill="#2563eb"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Completed Bar */}
                  <rect
                    x={d.completedX}
                    y={d.completedY}
                    width={d.barW}
                    height={d.completedH}
                    rx="2.5"
                    fill="#10b981"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Cancelled Bar */}
                  <rect
                    x={d.cancelledX}
                    y={d.cancelledY}
                    width={d.barW}
                    height={d.cancelledH}
                    rx="2.5"
                    fill="#f43f5e"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Hit Area */}
                  <rect
                    x={d.hitX}
                    y={actPadTop}
                    width={d.hitW}
                    height={actChartHeight - actPadTop - actPadBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredActivityBar(d)}
                    onMouseLeave={() => setHoveredActivityBar(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredActivityBar && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-lg text-[11px] -translate-x-1/2 -translate-y-full top-2"
                style={{ left: `${(hoveredActivityBar.centerX / actChartWidth) * 100}%` }}
              >
                <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                  {hoveredActivityBar.label}
                </div>
                <div className="text-blue-300">Created: {hoveredActivityBar.created}</div>
                <div className="text-emerald-300">Completed: {hoveredActivityBar.completed}</div>
                <div className="text-rose-300">Cancelled: {hoveredActivityBar.cancelled}</div>
              </div>
            )}
          </div>
        </Card>

        {/* CHART 2: Registration Trend (Total / Active vs Cancelled) */}
        <Card
          title="Registration Trend"
          subtitle="Valid active registrations vs cancelled registrations (no capacity held)"
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
                Active Valid
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                Cancelled
              </span>
            </div>
          }
        >
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${regChartWidth} ${regChartHeight}`}
              className="w-full h-56 select-none"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                const y = regChartHeight - regPadBottom - ratio * (regChartHeight - regPadTop - regPadBottom)
                const val = Math.round(ratio * regMaxVal)
                return (
                  <g key={idx}>
                    <line
                      x1={regPadLeft}
                      y1={y}
                      x2={regChartWidth - regPadRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={regPadLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {val}
                    </text>
                  </g>
                )
              })}

              {/* Grouped Bars */}
              {registrationBarGroups.map((d, i) => (
                <g key={i}>
                  {/* X Axis Label */}
                  <text
                    x={d.centerX}
                    y={regChartHeight - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-medium"
                  >
                    {d.label}
                  </text>

                  {/* Active Registrations Bar */}
                  <rect
                    x={d.activeX}
                    y={d.activeY}
                    width={d.barW}
                    height={d.activeH}
                    rx="3"
                    fill="#4f46e5"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Cancelled Registrations Bar */}
                  <rect
                    x={d.cancelledX}
                    y={d.cancelledY}
                    width={d.barW}
                    height={d.cancelledH}
                    rx="3"
                    fill="#f59e0b"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Hit Area */}
                  <rect
                    x={d.hitX}
                    y={regPadTop}
                    width={d.hitW}
                    height={regChartHeight - regPadTop - regPadBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRegBar(d)}
                    onMouseLeave={() => setHoveredRegBar(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredRegBar && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-2.5 py-1.5 shadow-lg text-[11px] -translate-x-1/2 -translate-y-full top-2"
                style={{ left: `${(hoveredRegBar.centerX / regChartWidth) * 100}%` }}
              >
                <div className="font-bold border-b border-slate-700 pb-1 mb-1">
                  {hoveredRegBar.label}
                </div>
                <div className="text-indigo-300">Active Valid: {hoveredRegBar.active}</div>
                <div className="text-amber-300">Cancelled: {hoveredRegBar.cancelled}</div>
                <div className="text-slate-400">Total Inquiries: {hoveredRegBar.total}</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 5. SECTION 5: PARTICIPATION OVERVIEW (Registered ≠ Participated)*/}
      {/* ============================================================== */}
      <section aria-label="Participation Overview" className="mb-8">
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-emerald-50/70 border border-blue-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 mb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase mb-2">
                <IconAlertCircle className="w-3.5 h-3.5" />
                Fundamental Rule: Registered ≠ Participated
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Institutional Participation Telemetry
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                A student registration reserves a seat and indicates intent. Verified participation is established exclusively through faculty-certified physical attendance, QR scans, or session rosters.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Campus Turnout Rate
                </span>
                <span className="text-2xl font-black text-emerald-600 tracking-tight">
                  {summary.activeRegistrations > 0
                    ? ((summary.totalParticipated / summary.activeRegistrations) * 100).toFixed(1)
                    : '0.0'}
                  %
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                <IconClipboardCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* 3 Metric Comparison Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                1. Registered Students
              </span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {summary.activeRegistrations.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Valid active seat reservations across all campus activities.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                2. Participated Students
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {summary.totalParticipated.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Physically verified in attendance via official rosters.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                3. Unattended / No-Shows
              </span>
              <div className="text-2xl font-black text-slate-700 mt-1">
                {(summary.activeRegistrations - summary.totalParticipated).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Registered seats with unverified or absent attendance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SECTION 6 & 11: DEPARTMENT ANALYTICS & MOST ACTIVE AREAS    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Department Analytics (8 Columns) */}
        <div className="lg:col-span-8">
          <Card
            title="Department Analytics"
            subtitle="Department-wise activity volume, registration count, and verified attendance"
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeptViewMode('table')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    deptViewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setDeptViewMode('chart')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    deptViewMode === 'chart'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Comparison Bars
                </button>
              </div>
            }
          >
            {deptViewMode === 'table' ? (
              <div className="overflow-x-auto -mx-5 -my-4">
                <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-5">Department</th>
                      <th className="py-3 px-4 text-center">Enrolled</th>
                      <th className="py-3 px-4 text-center">Activities</th>
                      <th className="py-3 px-4 text-center">Registrations</th>
                      <th className="py-3 px-4 text-center">Participated</th>
                      <th className="py-3 px-5 text-right">Turnout Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeDataset.departmentBreakdown.map((row, idx) => {
                      const turnout =
                        row.registrations > 0
                          ? ((row.participated / row.registrations) * 100).toFixed(1)
                          : '0.0'
                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-5 font-semibold text-slate-900">
                            {row.department}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 font-mono">
                            {row.students.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700">
                              {row.activities}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-blue-600 font-bold font-mono">
                            {row.registrations}
                          </td>
                          <td className="py-3 px-4 text-center text-emerald-600 font-bold font-mono">
                            {row.participated}
                          </td>
                          <td className="py-3 px-5 text-right font-bold text-slate-800 font-mono">
                            {turnout}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {activeDataset.departmentBreakdown.map((row, idx) => {
                  const regPercent = (row.registrations / maxDeptRegistrations) * 100
                  const partPercent = (row.participated / maxDeptRegistrations) * 100
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">{row.department}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-blue-600">Reg: {row.registrations}</span>
                          <span className="text-emerald-600">Attended: {row.participated}</span>
                        </div>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex gap-1 relative">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${regPercent}%` }}
                          title={`Registrations: ${row.registrations}`}
                        />
                        <div
                          className="h-full bg-emerald-500 rounded-full -ml-2"
                          style={{ width: `${partPercent}%` }}
                          title={`Participated: ${row.participated}`}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Section 11 - Most Active Areas (Strictly Neutral Labels) (4 Columns) */}
        <div className="lg:col-span-4">
          <Card
            title="Participation by Department"
            subtitle="Department engagement volume ranked neutrally by verified attendance"
          >
            <div className="space-y-3.5">
              {[...activeDataset.departmentBreakdown]
                .sort((a, b) => b.participated - a.participated)
                .slice(0, 5)
                .map((d, index) => {
                  const pct = Math.round((d.participated / maxDeptParticipation) * 100)
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-slate-800 truncate max-w-[150px]">
                            {d.department}
                          </span>
                        </div>
                        <span className="font-mono text-slate-700 font-bold text-xs">
                          {d.participated}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Activity Volume by Department
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {activeDataset.departmentBreakdown.slice(0, 4).map((d, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="text-[11px] text-slate-500 truncate">{d.department}</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5">{d.activities} Activities</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. SECTION 7 & 8: ACTIVITY TYPE & CLUB ANALYTICS                */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Activity Type Analytics Donut (5 Columns) */}
        <div className="lg:col-span-5">
          <Card
            title="Activity Type Analytics"
            subtitle="Campus activities distribution classified across 8 institutional types"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 160 160"
                  className="w-full h-full -rotate-90 select-none transform"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="18"
                  />
                  {donutSlices.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={hoveredDonutSlice === slice.type ? 22 : 18}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredDonutSlice(slice.type)}
                      onMouseLeave={() => setHoveredDonutSlice(null)}
                    />
                  ))}
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900">
                    {totalActivityTypeCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Breakdown Legend */}
              <div className="w-full space-y-1.5 text-xs">
                {donutSlices.map((slice, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-1 rounded-md transition-colors ${
                      hoveredDonutSlice === slice.type ? 'bg-slate-100 font-bold' : ''
                    }`}
                    onMouseEnter={() => setHoveredDonutSlice(slice.type)}
                    onMouseLeave={() => setHoveredDonutSlice(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <span className="text-slate-700">{slice.type}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-900 font-semibold">{slice.count}</span>
                      <span className="text-slate-400 text-[11px]">({slice.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Club Analytics (7 Columns) */}
        <div className="lg:col-span-7">
          <Card
            title="Club Analytics"
            subtitle="Student societies membership, category distribution, and chapter health"
          >
            {/* 4 Mini Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Total Clubs
                </span>
                <span className="text-xl font-black text-purple-900 mt-0.5 block">
                  {clubAnalyticsData.totalClubs}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Active Chapters
                </span>
                <span className="text-xl font-black text-emerald-900 mt-0.5 block">
                  {clubAnalyticsData.activeClubs}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Inactive Chapters
                </span>
                <span className="text-xl font-black text-slate-700 mt-0.5 block">
                  {clubAnalyticsData.inactiveClubs}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Club Members
                </span>
                <span className="text-xl font-black text-blue-900 mt-0.5 block">
                  {clubAnalyticsData.totalClubMembers.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Membership Category Distribution */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Membership by Society Category
              </span>
              <div className="space-y-2.5">
                {clubAnalyticsData.categories.map((cat, idx) => {
                  const pct = Math.round((cat.members / clubAnalyticsData.totalClubMembers) * 100)
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{cat.name} ({cat.clubsCount} Clubs)</span>
                        <span className="font-mono text-slate-600 font-semibold">{cat.members} Members ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 8. SECTION 9: SUPPORT ANALYTICS (Tickets Telemetry)            */}
      {/* ============================================================== */}
      <section aria-label="Support Analytics" className="mb-8">
        <Card
          title="Support Analytics"
          subtitle="System-wide incident tracking across both Student and Faculty/Admin queues"
        >
          {/* Status Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Tickets
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {supportAnalyticsData.totalTickets}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                Open
              </span>
              <span className="text-xl font-black text-rose-700 mt-1 block">
                {supportAnalyticsData.open}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Assigned
              </span>
              <span className="text-xl font-black text-blue-700 mt-1 block">
                {supportAnalyticsData.assigned}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-xl font-black text-amber-700 mt-1 block">
                {supportAnalyticsData.inProgress}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Resolved
              </span>
              <span className="text-xl font-black text-emerald-700 mt-1 block">
                {supportAnalyticsData.resolved}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Closed
              </span>
              <span className="text-xl font-black text-slate-700 mt-1 block">
                {supportAnalyticsData.closed}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Origin Split: Student vs Faculty */}
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                Ticket Origin by User Role
              </span>
              <div className="space-y-3">
                {supportAnalyticsData.userOrigin.map((origin, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{origin.label}</span>
                      <span className="font-mono text-slate-600">{origin.count} tickets ({origin.percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${origin.percentage}%`, backgroundColor: origin.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-3">
                Distribution by Issue Category
              </span>
              <div className="space-y-2">
                {supportAnalyticsData.categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700">{cat.name}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-900">{cat.count}</span>
                      <span className="text-slate-400 text-[11px]">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ============================================================== */}
      {/* 9. SECTION 10: UPCOMING ACTIVITIES & SEAT CAPACITY MONITOR     */}
      {/* ============================================================== */}
      <section aria-label="Upcoming Activities Capacity Monitor">
        <Card
          title="Upcoming Activities & Capacity Status"
          subtitle="Real-time capacity monitor: Available Seats = Maximum Participants - Valid Active Registrations"
          action={
            <div className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Excludes Cancelled Registrations
            </div>
          }
        >
          <div className="overflow-x-auto -mx-5 -my-4">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Activity Name</th>
                  <th className="py-3 px-4">Date & Venue</th>
                  <th className="py-3 px-4 text-center">Active Registrations</th>
                  <th className="py-3 px-4 text-center">Max Capacity</th>
                  <th className="py-3 px-4 text-center">Available Seats</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {upcomingActivitiesData.map((act) => {
                  const capacityPercent = Math.round((act.activeRegistrations / act.maxCapacity) * 100)
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-5">
                        <div className="font-bold text-slate-900">{act.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {act.department} • <span className="font-medium text-blue-600">{act.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{act.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <IconMapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[170px]">{act.venue}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-blue-600">
                          {act.activeRegistrations}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({act.cancelledRegistrations} cancelled)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {act.maxCapacity}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            act.availableSeats === 0
                              ? 'text-rose-600'
                              : act.availableSeats <= 10
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {act.availableSeats}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              capacityPercent >= 100
                                ? 'bg-rose-500'
                                : capacityPercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <Badge
                          variant={
                            act.status === 'Full'
                              ? 'danger'
                              : act.status === 'Filling Fast'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        >
                          {act.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>
              Rule: Available Seats = Maximum Capacity - Valid Active Registrations.
            </span>
            <span>All figures update in real-time.</span>
          </div>
        </Card>
      </section>
    </SuperAdminLayout>
  )
}
