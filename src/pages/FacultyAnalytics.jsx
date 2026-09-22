import { useState, useMemo, useRef, useEffect } from 'react'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Input from '../components/common/Input'
import {
  IconActivity,
  IconCalendar,
  IconClipboardCheck,
  IconUsers,
  IconTrendingUp,
  IconChart,
  IconFilter,
  IconCheck,
  IconChevronDown,
} from '../components/icons/Icons'
import {
  timeRangeOptions,
  activityTypesList,
  departmentsList,
  getAnalyticsData,
  getPeriodDateRangeLabel,
} from '../data/facultyAnalyticsData'

const categoryColors = {
  Workshop: '#2563eb',
  Seminar: '#6366f1',
  Competition: '#8b5cf6',
  Hackathon: '#06b6d4',
  Cultural: '#ec4899',
  Sports: '#f59e0b',
  Technical: '#10b981',
  Other: '#64748b',
}

export default function FacultyAnalytics() {
  // Active Time Range Filter (Default: 'This Month' -> 1 May 2024 – 30 May 2024)
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [customStart, setCustomStart] = useState('2024-05-01')
  const [customEnd, setCustomEnd] = useState('2024-05-30')
  const [appliedCustomStart, setAppliedCustomStart] = useState('')
  const [appliedCustomEnd, setAppliedCustomEnd] = useState('')

  // Date range dropdown menu state
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false)
  const dateDropdownRef = useRef(null)

  // Interactive chart hover states
  const [hoveredBarGroup, setHoveredBarGroup] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  // Click outside listener for date range dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch raw dataset for selected period
  const rawData = useMemo(() => {
    return getAnalyticsData(selectedPeriod, appliedCustomStart, appliedCustomEnd)
  }, [selectedPeriod, appliedCustomStart, appliedCustomEnd])

  const activities = rawData.activities
  const trendData = rawData.trend

  // 1. Calculated Summary Metrics (No hardcoding)
  const metrics = useMemo(() => {
    const totalActivities = activities.length
    const upcomingActivities = activities.filter((a) => a.status === 'Upcoming').length
    const completedActivities = activities.filter((a) => a.status === 'Completed').length
    const totalRegistrations = activities.reduce((sum, a) => sum + a.registered, 0)
    const totalCancelled = activities.reduce((sum, a) => sum + a.cancelled, 0)
    const totalParticipated = activities.reduce((sum, a) => sum + a.participated, 0)
    const totalCapacity = activities.reduce((sum, a) => sum + a.capacity, 0)

    // Turnout Rate: Participated / Registered * 100
    const overallParticipationRate =
      totalRegistrations > 0
        ? ((totalParticipated / totalRegistrations) * 100).toFixed(1)
        : '0.0'

    // Registration Rate: Registered / Capacity * 100
    const overallRegistrationRate =
      totalCapacity > 0
        ? Math.round((totalRegistrations / totalCapacity) * 100)
        : 0

    return {
      totalActivities,
      upcomingActivities,
      completedActivities,
      totalRegistrations,
      totalCancelled,
      totalParticipated,
      totalCapacity,
      overallParticipationRate,
      overallRegistrationRate,
    }
  }, [activities])

  // 2. Activity Type Distribution (Calculated dynamically)
  const activityTypeStats = useMemo(() => {
    return activityTypesList.map((type) => {
      const matching = activities.filter((a) => a.type === type)
      const count = matching.length
      const percentage =
        activities.length > 0 ? Math.round((count / activities.length) * 100) : 0
      return { type, count, percentage }
    })
  }, [activities])

  // Donut chart stroke dash offsets calculation
  const donutRadius = 65
  const donutCircumference = 2 * Math.PI * donutRadius
  const totalTypeCount = useMemo(() => {
    return activityTypeStats.reduce((sum, item) => sum + item.count, 0)
  }, [activityTypeStats])

  const donutSlices = useMemo(() => {
    if (totalTypeCount === 0) return []
    let accumulatedOffset = 0
    return activityTypeStats.map((item) => {
      const fraction = item.count / totalTypeCount
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
  }, [activityTypeStats, totalTypeCount, donutCircumference])

  // 3. Department Participation Breakdown (Calculated dynamically)
  const departmentStats = useMemo(() => {
    return departmentsList.map((dept) => {
      const count = activities.reduce((sum, a) => {
        return sum + (a.departmentBreakdown?.[dept] || 0)
      }, 0)
      return { department: dept, count }
    }).sort((a, b) => b.count - a.count)
  }, [activities])

  const maxDeptCount = useMemo(() => {
    const max = Math.max(...departmentStats.map((d) => d.count), 1)
    return max
  }, [departmentStats])

  // 4. Top Activities sorted by Registrations
  const topActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => b.registered - a.registered)
      .slice(0, 6)
  }, [activities])

  // 5. Recent Activities for Performance section
  const recentActivities = useMemo(() => {
    return activities.slice(0, 6)
  }, [activities])

  // Handler for custom range application
  const handleApplyCustomRange = (e) => {
    e?.preventDefault()
    setAppliedCustomStart(customStart)
    setAppliedCustomEnd(customEnd)
  }

  const handleResetFilters = () => {
    setSelectedPeriod('This Month')
    setAppliedCustomStart('')
    setAppliedCustomEnd('')
  }

  const activeDateRangeLabel = useMemo(() => {
    return getPeriodDateRangeLabel(selectedPeriod, appliedCustomStart, appliedCustomEnd)
  }, [selectedPeriod, appliedCustomStart, appliedCustomEnd])

  // Grouped Bar Chart Coordinate Calculation
  const chartWidth = 560
  const chartHeight = 240
  const padLeft = 40
  const padRight = 20
  const padTop = 20
  const padBottom = 35

  const trendMax = useMemo(() => {
    if (!trendData || trendData.length === 0) return 20
    const maxVal = Math.max(
      ...trendData.map((d) => Math.max(d.registrations || 0, d.participated || 0)),
      1
    )
    return Math.ceil(maxVal * 1.15)
  }, [trendData])

  const groupedBarData = useMemo(() => {
    if (!trendData || trendData.length === 0) return []
    const innerW = chartWidth - padLeft - padRight
    const innerH = chartHeight - padTop - padBottom
    const groupW = innerW / trendData.length
    const barW = Math.min(22, Math.max(10, groupW * 0.28))
    const gap = 3

    return trendData.map((d, i) => {
      const centerX = padLeft + (i + 0.5) * groupW
      const regH = ((d.registrations || 0) / trendMax) * innerH
      const regX = centerX - barW - gap / 2
      const regY = chartHeight - padBottom - regH

      const partH = ((d.participated || 0) / trendMax) * innerH
      const partX = centerX + gap / 2
      const partY = chartHeight - padBottom - partH

      const tooltipY = Math.min(regY, partY)

      return {
        ...d,
        centerX,
        barW,
        regX,
        regY,
        regH,
        partX,
        partY,
        partH,
        tooltipY,
        hitX: centerX - groupW / 2,
        hitW: groupW,
      }
    })
  }, [trendData, trendMax, chartWidth, chartHeight, padLeft, padRight, padTop, padBottom])

  // 5 KPI Cards configuration
  const kpiCards = [
    {
      id: 'kpi-activities',
      title: 'Total Activities',
      value: metrics.totalActivities,
      icon: <IconActivity className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 text-blue-600',
      trend: '+3 this term',
      subtext: `${metrics.completedActivities} completed`,
    },
    {
      id: 'kpi-upcoming',
      title: 'Upcoming Activities',
      value: metrics.upcomingActivities,
      icon: <IconCalendar className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'Scheduled',
      subtext: 'Open registrations',
    },
    {
      id: 'kpi-registrations',
      title: 'Total Registrations',
      value: metrics.totalRegistrations,
      icon: <IconClipboardCheck className="w-5 h-5 text-sky-600" />,
      iconBg: 'bg-sky-50 text-sky-600',
      trend: '+18.4%',
      subtext: `${metrics.overallRegistrationRate}% capacity fill`,
    },
    {
      id: 'kpi-participated',
      title: 'Students Participated',
      value: metrics.totalParticipated,
      icon: <IconUsers className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: '+14.2%',
      subtext: 'Verified attendance',
    },
    {
      id: 'kpi-rate',
      title: 'Participation Rate',
      value: `${metrics.overallParticipationRate}%`,
      icon: <IconTrendingUp className="w-5 h-5 text-violet-600" />,
      iconBg: 'bg-violet-50 text-violet-600',
      trend: 'Turnout',
      subtext: 'Participated / Registered',
    },
  ]

  return (
    <FacultyLayout>
      {/* 1. Header with Title, Subtitle, and Date-Range Selector */}
      <PageHeader
        title="Analytics"
        subtitle="Comprehensive view of activity performance and student engagement."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Analytics' },
        ]}
        actions={
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-2xs transition-all cursor-pointer"
            >
              <IconCalendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{activeDateRangeLabel}</span>
              <IconChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  dateDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-30 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Range
                </div>
                {timeRangeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(opt)
                      setDateDropdownOpen(false)
                      if (opt !== 'Custom Range') {
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
                    {selectedPeriod === opt && (
                      <IconCheck className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      />

      {/* Custom Range Picker Drawer */}
      {selectedPeriod === 'Custom Range' && (
        <Card className="mb-6 bg-slate-50/70 border-dashed" padding="sm">
          <form
            onSubmit={handleApplyCustomRange}
            className="flex flex-wrap items-end gap-3"
          >
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
              Filter Range
            </Button>
            {appliedCustomStart && (
              <span className="text-xs text-slate-500 pb-2">
                Showing data for {appliedCustomStart} to {appliedCustomEnd}
              </span>
            )}
          </form>
        </Card>
      )}

      {/* Empty State Fallback */}
      {activities.length === 0 ? (
        <EmptyState
          title="No data available"
          description="There isn't enough activity data for this period."
          icon={<IconChart className="w-8 h-8 text-slate-400" />}
          actionText="Reset Filter"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* 2. KPI Cards: 5 Clean Horizontal Cards */}
          <section
            aria-label="Summary Metrics"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6"
          >
            {kpiCards.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {kpi.title}
                  </span>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  {kpi.trend && (
                    <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
                      {kpi.trend}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {kpi.subtext}
                </div>
              </div>
            ))}
          </section>

          {/* 3. Main Chart Area: Two Columns (Registrations vs Participation & Donut Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Left: Registrations vs Participation Grouped Bar Chart */}
            <div className="lg:col-span-7">
              <Card
                title="Registrations vs Participation"
                subtitle="Comparing student applications against verified attendance"
                action={
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                      Registrations
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                      Participation
                    </span>
                  </div>
                }
              >
                <div className="relative w-full">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-56 sm:h-64 select-none"
                  >
                    {/* Horizontal Grid lines */}
                    {[0, 0.33, 0.66, 1].map((ratio, idx) => {
                      const y =
                        chartHeight - padBottom - ratio * (chartHeight - padTop - padBottom)
                      const val = Math.round(ratio * trendMax)
                      return (
                        <g key={idx}>
                          <line
                            x1={padLeft}
                            y1={y}
                            x2={chartWidth - padRight}
                            y2={y}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={padLeft - 8}
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
                    {groupedBarData.map((d, i) => (
                      <g key={i}>
                        {/* X-axis Label */}
                        <text
                          x={d.centerX}
                          y={chartHeight - 12}
                          textAnchor="middle"
                          className="fill-slate-500 text-[10px] font-medium"
                        >
                          {d.label}
                        </text>

                        {/* Registrations Bar (Blue) */}
                        <rect
                          x={d.regX}
                          y={d.regY}
                          width={d.barW}
                          height={d.regH}
                          rx="3"
                          fill="#2563eb"
                          className="transition-all duration-200 hover:opacity-90"
                        />

                        {/* Participation Bar (Emerald) */}
                        <rect
                          x={d.partX}
                          y={d.partY}
                          width={d.barW}
                          height={d.partH}
                          rx="3"
                          fill="#10b981"
                          className="transition-all duration-200 hover:opacity-90"
                        />

                        {/* Transparent Hover Hit Area */}
                        <rect
                          x={d.hitX}
                          y={padTop}
                          width={d.hitW}
                          height={chartHeight - padTop - padBottom}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBarGroup(d)}
                          onMouseLeave={() => setHoveredBarGroup(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Dynamic Positioning Campus Live White Tooltip */}
                  {hoveredBarGroup && (() => {
                    const turnoutRate =
                      hoveredBarGroup.registrations > 0
                        ? Math.round(
                            (hoveredBarGroup.participated / hoveredBarGroup.registrations) * 100
                          )
                        : 0

                    const xPercent = (hoveredBarGroup.centerX / chartWidth) * 100
                    const isNearTop = hoveredBarGroup.tooltipY < 95

                    // Horizontal boundary repositioning
                    let xPos = `${xPercent}%`
                    let transformX = '-50%'

                    if (xPercent < 28) {
                      xPos = `${Math.max(2.5, xPercent - 2)}%`
                      transformX = '0%'
                    } else if (xPercent > 72) {
                      xPos = `${Math.min(97.5, xPercent + 2)}%`
                      transformX = '-100%'
                    }

                    // Vertical boundary repositioning
                    let yPos = `${((hoveredBarGroup.tooltipY - 10) / chartHeight) * 100}%`
                    let transformY = '-100%'

                    if (isNearTop) {
                      yPos = `${((hoveredBarGroup.tooltipY + 12) / chartHeight) * 100}%`
                      transformY = '0%'
                    }

                    return (
                      <div
                        className="absolute z-30 bg-white border border-slate-200/90 rounded-xl shadow-lg p-2.5 sm:p-3 pointer-events-none transition-all duration-150 text-xs min-w-[155px]"
                        style={{
                          left: xPos,
                          top: yPos,
                          transform: `translate(${transformX}, ${transformY})`,
                        }}
                      >
                        <div className="font-bold text-slate-900 text-xs flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100">
                          <span>{hoveredBarGroup.label}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            {hoveredBarGroup.date}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span className="w-2 h-2 rounded-xs bg-blue-600 shrink-0" />
                              Registration:
                            </span>
                            <span className="font-bold text-slate-900 font-mono">
                              {hoveredBarGroup.registrations}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <span className="w-2 h-2 rounded-xs bg-emerald-500 shrink-0" />
                              Participation:
                            </span>
                            <span className="font-bold text-slate-900 font-mono">
                              {hoveredBarGroup.participated}
                            </span>
                          </div>

                          <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-3">
                            <span className="text-slate-500 font-medium">Turnout Rate:</span>
                            <span className="font-bold text-emerald-600 font-mono">
                              {turnoutRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </Card>
            </div>

            {/* Right: Activity Type Distribution Donut Chart */}
            <div className="lg:col-span-5">
              <Card
                title="Activity Type Distribution"
                subtitle="Categorical breakdown with total activities in center"
                action={
                  <Badge variant="neutral" size="sm">
                    {activityTypesList.length} Categories
                  </Badge>
                }
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* SVG Donut */}
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48 shrink-0">
                    <svg viewBox="0 0 200 200" className="w-full h-full select-none">
                      <g transform="rotate(-90 100 100)">
                        {/* Base track */}
                        <circle
                          cx="100"
                          cy="100"
                          r={donutRadius}
                          fill="none"
                          stroke="#f1f5f9"
                          strokeWidth="24"
                        />
                        {/* Slices */}
                        {donutSlices.map((slice) => (
                          <circle
                            key={slice.type}
                            cx="100"
                            cy="100"
                            r={donutRadius}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth={hoveredCategory?.type === slice.type ? 28 : 24}
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            className="cursor-pointer transition-all duration-200"
                            onMouseEnter={() => setHoveredCategory(slice)}
                            onMouseLeave={() => setHoveredCategory(null)}
                          />
                        ))}
                      </g>
                      {/* Center label */}
                      <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        className="text-3xl font-extrabold fill-slate-900 tracking-tight"
                      >
                        {hoveredCategory ? hoveredCategory.count : metrics.totalActivities}
                      </text>
                      <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        className="text-[10px] font-bold uppercase tracking-wider fill-slate-400"
                      >
                        {hoveredCategory ? hoveredCategory.type : 'Total Activities'}
                      </text>
                    </svg>
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full text-xs">
                    {donutSlices.map((slice) => (
                      <div
                        key={slice.type}
                        onMouseEnter={() => setHoveredCategory(slice)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                          hoveredCategory?.type === slice.type
                            ? 'bg-slate-100'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: slice.color }}
                          />
                          <span className="text-slate-700 font-medium truncate">
                            {slice.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-900 shrink-0 ml-1">
                          <span>{slice.count}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({slice.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 4. Top Activities Table (Full-Width) */}
          <Card
            title="Top Activities by Registrations"
            subtitle="Ranking events by student demand and seat occupancy"
            className="mb-6"
            padding="none"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6 w-12 text-center">#</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3 text-center">Registered</th>
                    <th className="py-3 px-3 text-center">Capacity</th>
                    <th className="py-3 px-4 text-center">Rate</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topActivities.map((act, idx) => {
                    const rate = Math.min(
                      100,
                      Math.round((act.registered / Math.max(1, act.capacity)) * 100)
                    )

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-400">{act.date}</div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <Badge variant="primary" size="sm">
                            {act.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-blue-700">
                          {act.registered}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                          {act.capacity}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rate >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 text-[11px]">
                              {rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Badge
                            variant={act.status === 'Completed' ? 'neutral' : 'success'}
                            size="sm"
                            dot
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
          </Card>

          {/* 5. Bottom Section: Two Columns (Department Participation & Recent Activity Performance) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left: Department Participation Horizontal Bar Chart */}
            <Card
              title="Department Participation"
              subtitle="Verified student turnout across collegiate branches"
            >
              <div className="space-y-4 pt-1">
                {departmentStats.map((item) => {
                  const barWidth = Math.max(6, Math.round((item.count / maxDeptCount) * 100))
                  const deptPercentage =
                    metrics.totalParticipated > 0
                      ? Math.round((item.count / metrics.totalParticipated) * 100)
                      : 0

                  return (
                    <div key={item.department} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {item.department}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-indigo-700">{item.count}</span>
                          <span className="text-slate-400 font-normal">
                            ({deptPercentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Right: Recent Activity Performance Table */}
            <Card
              title="Recent Activity Performance"
              subtitle="Latest activity registrations compared against participation"
              padding="none"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-5">Activity</th>
                      <th className="py-3 px-3 text-center">Registrations</th>
                      <th className="py-3 px-3 text-center">Participation</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 sm:px-5">
                          <div className="font-semibold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-400">
                            {act.date} &bull; {act.type}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-blue-700">
                          {act.registered}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                          {act.participated}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Badge
                            variant={act.status === 'Completed' ? 'neutral' : 'success'}
                            size="sm"
                            dot
                          >
                            {act.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </FacultyLayout>
  )
}
