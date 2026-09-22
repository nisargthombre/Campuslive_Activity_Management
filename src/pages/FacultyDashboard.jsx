import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import EmptyState from '../components/common/EmptyState'
import {
  IconActivity,
  IconCalendar,
  IconClipboardCheck,
  IconUsers,
  IconChart,
  IconClock,
  IconMapPin,
  IconPlus,
  IconChevronRight,
  IconCheck,
  IconEdit,
  IconEye,
  IconUser,
} from '../components/icons/Icons'
import {
  facultyStats,
  facultyUpcomingActivities,
  facultyRecentRegistrations,
  participationBreakdown,
  facultyQuickActions,
  facultyRecentActivity,
} from '../data/facultyDashboardData'

export default function FacultyDashboard() {
  const navigate = useNavigate()

  // State
  const [activitiesList, setActivitiesList] = useState(facultyUpcomingActivities)
  const [registrationsList, setRegistrationsList] = useState(facultyRecentRegistrations)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All')
  const [editingActivity, setEditingActivity] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [successNotice, setSuccessNotice] = useState(null)

  // Map icon types for Stat Cards
  const statIconMap = {
    activity: <IconActivity className="w-5 h-5 text-blue-600" />,
    calendar: <IconCalendar className="w-5 h-5 text-indigo-600" />,
    clipboard: <IconClipboardCheck className="w-5 h-5 text-emerald-600" />,
    users: <IconUsers className="w-5 h-5 text-purple-600" />,
  }

  // Filter activities
  const filteredActivities = activitiesList.filter((act) => {
    if (activeCategoryFilter === 'All') return true
    if (activeCategoryFilter === 'Workshop') return act.category === 'Workshop'
    if (activeCategoryFilter === 'Competition') return act.category === 'Competition'
    if (activeCategoryFilter === 'Seminar') return act.category === 'Seminar'
    if (activeCategoryFilter === 'Empty') return false
    return true
  })

  // Handle Edit Activity Modal Open
  const handleOpenEdit = (act) => {
    setEditingActivity(act)
    setEditFormData({
      title: act.title,
      venue: act.venue,
      date: act.date,
      time: act.time,
      maxParticipants: act.maxParticipants,
      status: act.status,
    })
  }

  // Handle Edit Activity Submit
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingActivity) return

    setActivitiesList((prev) =>
      prev.map((item) =>
        item.id === editingActivity.id
          ? {
              ...item,
              title: editFormData.title || item.title,
              venue: editFormData.venue || item.venue,
              date: editFormData.date || item.date,
              time: editFormData.time || item.time,
              maxParticipants: Number(editFormData.maxParticipants) || item.maxParticipants,
              status: editFormData.status || item.status,
            }
          : item
      )
    )

    setSuccessNotice(`Activity "${editFormData.title || editingActivity.title}" updated successfully.`)
    setEditingActivity(null)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Handle Quick Status Toggle for Registrations (Mock Verification)
  const handleToggleRegistrationStatus = (regId) => {
    setRegistrationsList((prev) =>
      prev.map((reg) => {
        if (reg.id === regId) {
          const newStatus = reg.status === 'Confirmed' ? 'Pending Verification' : 'Confirmed'
          const newVariant = newStatus === 'Confirmed' ? 'success' : 'warning'
          return { ...reg, status: newStatus, statusVariant: newVariant }
        }
        return reg
      })
    )
  }

  return (
    <FacultyLayout>
      {/* 1. Header Section */}
      <PageHeader
        title="Good Morning, Admin 👋"
        subtitle="Manage campus activities, registrations, and student participation from one place."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="secondary" size="md" dot>
              Computer Science & Engineering
            </Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<IconPlus className="w-4 h-4" />}
              onClick={() => navigate('/faculty/activities/create')}
              className="shadow-sm font-semibold"
            >
              Create Activity
            </Button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Summary Cards (4 Cards) */}
      <section
        aria-label="Admin Summary Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8"
      >
        {facultyStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={statIconMap[stat.iconType] || <IconActivity className="w-5 h-5" />}
            iconBg={stat.iconBg}
            change={stat.change}
            changeType={stat.changeType}
            helperText={stat.helperText}
          />
        ))}
      </section>

      {/* 6. Quick Actions Section */}
      <section aria-label="Quick Actions" className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to faculty activity coordination tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {facultyQuickActions.map((action, idx) => {
            const iconMap = {
              plus: <IconPlus className="w-4 h-4 text-white" />,
              calendar: <IconCalendar className="w-4 h-4 text-white" />,
              clipboard: <IconClipboardCheck className="w-4 h-4 text-white" />,
              users: <IconUsers className="w-4 h-4 text-white" />,
              chart: <IconChart className="w-4 h-4 text-white" />,
            }

            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all duration-150 cursor-pointer ${action.hoverBorder} group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${action.accentColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      {iconMap[action.iconType]}
                    </div>
                    {action.badge && (
                      <Badge variant={action.badgeVariant || 'primary'} size="sm">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
                  <span>Open</span>
                  <IconChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {/* LEFT COLUMN: Upcoming Activities + Recent Registrations (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3. Upcoming Activities Section */}
          <section aria-label="Upcoming Activities">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Upcoming Activities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin-managed and coordinated campus activities
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Category Filter Pills */}
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
                  {['All', 'Workshop', 'Competition', 'Seminar', 'Empty'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      {cat === 'Empty' ? 'Demo Empty' : cat}
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/faculty/activities')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium cursor-pointer text-xs"
                >
                  View All &rarr;
                </Button>
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <EmptyState
                title="No activities in this filter"
                description="There are currently no scheduled activities matching the selected filter. Create a new activity to get started."
                icon={<IconCalendar className="w-6 h-6 text-slate-400" />}
                actionText="Create Activity"
                onAction={() => navigate('/faculty/activities/create')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActivities.map((act) => {
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
                        {/* Header Gradient */}
                        <div
                          className={`h-24 bg-gradient-to-br ${act.thumbnailGradient} p-3.5 flex flex-col justify-between relative overflow-hidden`}
                        >
                          <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                          <div className="flex items-center justify-between relative z-10">
                            <Badge
                              variant={act.badgeVariant}
                              size="sm"
                              className="backdrop-blur-sm shadow-xs font-semibold"
                            >
                              {act.type}
                            </Badge>
                            <Badge
                              variant={act.statusVariant}
                              size="sm"
                              dot
                              className="shadow-xs font-medium"
                            >
                              {act.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Body Details */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {act.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {act.organizer}
                            </p>
                          </div>

                          {/* Date, Time, Venue */}
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="font-medium text-slate-700">{act.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{act.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{act.venue}</span>
                            </div>
                          </div>

                          {/* Capacity Progress Bar */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500 font-medium">Capacity</span>
                              <span className="font-semibold text-slate-800">
                                {act.registeredCount} / {act.maxParticipants}{' '}
                                <span className="text-slate-400 font-normal">({percentFilled}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  percentFilled >= 90
                                    ? 'bg-amber-500'
                                    : percentFilled >= 75
                                    ? 'bg-blue-600'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${percentFilled}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Dual Actions */}
                      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/faculty/activities/${act.id}`)}
                          icon={<IconEye className="w-3.5 h-3.5" />}
                          className="text-xs hover:border-blue-600 hover:text-blue-600 transition-colors"
                        >
                          View Activity
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(act)}
                          icon={<IconEdit className="w-3.5 h-3.5" />}
                          className="text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Edit Activity
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* 4. Recent Registrations Section */}
          <section aria-label="Recent Registrations">
            <Card
              title="Recent Registrations"
              subtitle="Latest student applications awaiting review or verified for campus activities"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/faculty/registrations')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium cursor-pointer text-xs"
                >
                  View All Registrations &rarr;
                </Button>
              }
              padding="none"
            >
              {/* Responsive Table / List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Student</th>
                      <th className="py-3 px-3">Student ID</th>
                      <th className="py-3 px-4">Activity</th>
                      <th className="py-3 px-3">Registered Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrationsList.map((reg) => (
                      <tr
                        key={reg.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {reg.studentAvatar}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{reg.studentName}</div>
                              <div className="text-[10px] text-slate-400">{reg.department}</div>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">
                          {reg.studentId}
                        </td>

                        {/* Activity */}
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-[180px] truncate">
                          {reg.activity}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                          {reg.registrationDate}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <Badge variant={reg.statusVariant} size="sm" dot>
                            {reg.status}
                          </Badge>
                        </td>

                        {/* Quick Toggle Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleRegistrationStatus(reg.id)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                          >
                            {reg.status === 'Confirmed' ? 'Revoke' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 sm:px-6 border-t border-slate-100 bg-slate-50/40 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>Showing 5 recent applications &bull; 89 total pending verification</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/faculty/registrations')}
                  className="text-xs"
                >
                  Manage All Registrations
                </Button>
              </div>
            </Card>
          </section>
        </div>

        {/* RIGHT COLUMN: Student Participation + Recent Activity (1 col wide on desktop) */}
        <div className="space-y-8">
          {/* 5. Student Participation Overview */}
          <section aria-label="Student Participation Overview">
            <Card
              title="Student Participation"
              subtitle="Engagement breakdown by activity category"
              action={
                <Badge variant="primary" size="sm">
                  {participationBreakdown.participationRate}% Active
                </Badge>
              }
            >
              {/* Highlight summary numbers */}
              <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <div className="text-xl font-bold text-slate-900">
                    {participationBreakdown.totalStudentsParticipated}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Students Participated</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-600">
                    {participationBreakdown.turnoutConversionRate}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Turnout Conversion</div>
                </div>
              </div>

              {/* Progress bars by activity type */}
              <div className="space-y-3.5">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                  Participation by Activity Type
                </div>
                {participationBreakdown.byCategory.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.type}</span>
                      <span className="font-semibold text-slate-900">
                        {cat.count}{' '}
                        <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.barColor}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Insights List */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Participation Highlights
                </div>
                {participationBreakdown.insights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-800">{item.label}:</span>{' '}
                      <span className="text-slate-500">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* 7. Recent Activity Feed */}
          <section aria-label="Recent Activity">
            <Card
              title="Recent Activity"
              subtitle="Notifications and department event milestones"
              action={
                <Badge variant="neutral" size="sm">
                  Live Feed
                </Badge>
              }
              padding="none"
            >
              <div className="divide-y divide-slate-100">
                {facultyRecentActivity.map((activity) => {
                  const iconMap = {
                    user: <IconUser className="w-4 h-4" />,
                    activity: <IconActivity className="w-4 h-4" />,
                    check: <IconCheck className="w-4 h-4" />,
                    clock: <IconClock className="w-4 h-4" />,
                  }

                  return (
                    <div
                      key={activity.id}
                      className="p-4 flex items-start gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${activity.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        {iconMap[activity.iconType]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {activity.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                <button
                  type="button"
                  onClick={() => navigate('/faculty/notifications')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Notifications</span>
                  <IconChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <Modal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          title={`Edit Activity: ${editingActivity.title}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Activity Title"
              value={editFormData.title}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Date"
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
              <Input
                label="Time"
                value={editFormData.time}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                required
              />
            </div>

            <Input
              label="Venue"
              value={editFormData.venue}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, venue: e.target.value }))
              }
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Max Participants"
                type="number"
                value={editFormData.maxParticipants}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    maxParticipants: e.target.value,
                  }))
                }
                required
              />
              <Select
                label="Status"
                value={editFormData.status}
                onChange={(val) =>
                  setEditFormData((prev) => ({ ...prev, status: val }))
                }
                options={[
                  { value: 'Registration Open', label: 'Registration Open' },
                  { value: 'Almost Full', label: 'Almost Full' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'Completed', label: 'Completed' },
                ]}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingActivity(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </FacultyLayout>
  )
}
