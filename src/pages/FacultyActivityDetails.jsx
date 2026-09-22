import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import StatCard from '../components/common/StatCard'
import ConfirmationDialog from '../components/common/ConfirmationDialog'
import EmptyState from '../components/common/EmptyState'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconMail,
  IconPhone,
  IconClipboardCheck,
  IconEdit,
  IconCheck,
  IconActivity,
  IconAlertCircle,
  IconTrendingUp,
} from '../components/icons/Icons'
import {
  getFacultyActivityById,
  updateFacultyActivity,
} from '../data/facultyActivitiesData'

export default function FacultyActivityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Load activity data (reactive to id and updates)
  const initialData = useMemo(() => getFacultyActivityById(id), [id])
  const [activity, setActivity] = useState(initialData)

  // Status message
  const [notice, setNotice] = useState(null)

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  if (!activity) {
    return (
      <FacultyLayout>
        <PageHeader
          title="Activity Not Found"
          breadcrumb={[
            { label: 'Campus Live', to: '/' },
            { label: 'Admin', to: '/faculty/dashboard' },
            { label: 'Activities', to: '/faculty/activities' },
            { label: 'Not Found' },
          ]}
        />
        <EmptyState
          title="Activity not found"
          description="The requested campus activity does not exist or has been removed."
          icon={<IconActivity className="w-8 h-8 text-slate-400" />}
          actionText="Back to Activities"
          onAction={() => navigate('/faculty/activities')}
        />
      </FacultyLayout>
    )
  }

  // Registration Calculations (Strict Rule: Available Seats = Max - Registered)
  const maxParticipants = Number(activity.maxParticipants) || 0
  const registeredCount = Number(activity.registeredCount) || 0
  const availableSeats = Math.max(0, maxParticipants - registeredCount)
  const registrationPercentage =
    maxParticipants > 0 ? Math.min(100, Math.round((registeredCount / maxParticipants) * 100)) : 0
  const isFull = registeredCount >= maxParticipants && maxParticipants > 0

  // Handle Cancel Activity
  const handleConfirmCancel = () => {
    updateFacultyActivity(activity.id, { status: 'Cancelled' })
    setActivity((prev) => ({ ...prev, status: 'Cancelled' }))
    setIsCancelModalOpen(false)
    setNotice(`Activity "${activity.title}" has been cancelled. Student registration is closed.`)
    setTimeout(() => setNotice(null), 5000)
  }

  // Status badge config
  const statusBadgeConfig = {
    Published: { variant: 'success', label: 'Published' },
    'Registration Open': { variant: 'success', label: 'Registration Open' },
    'Almost Full': { variant: 'warning', label: 'Almost Full' },
    Upcoming: { variant: 'info', label: 'Upcoming' },
    Draft: { variant: 'neutral', label: 'Draft' },
    Completed: { variant: 'primary', label: 'Completed' },
    Cancelled: { variant: 'danger', label: 'Cancelled' },
  }
  const currentStatus = statusBadgeConfig[activity.status] || {
    variant: 'neutral',
    label: activity.status,
  }

  return (
    <FacultyLayout>
      {/* 1. Header with Back button and Primary Actions */}
      <PageHeader
        title={activity.title}
        subtitle="Activity Coordination & Management Overview"
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Activities', to: '/faculty/activities' },
          { label: activity.title },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/faculty/activities')}
              icon={<IconArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Activities
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/faculty/activities/${activity.id}/edit`)}
              icon={<IconEdit className="w-3.5 h-3.5" />}
            >
              Edit Activity
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/faculty/registrations?activity=${activity.id}`)}
              icon={<IconClipboardCheck className="w-3.5 h-3.5" />}
            >
              Manage Registrations
            </Button>
            {activity.status !== 'Cancelled' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
              >
                Cancel Activity
              </Button>
            )}
          </div>
        }
      />

      {/* Notice Banner */}
      {notice && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Visual Hero Banner Card */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div
          className={`h-40 sm:h-48 bg-gradient-to-r ${activity.thumbnailGradient || 'from-blue-600 to-indigo-700'} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white`}
        >
          {/* Subtle background ambient graphic */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/10 blur-md pointer-events-none" />
          <div className="absolute right-12 top-6 text-white/15 pointer-events-none">
            <IconActivity className="w-28 h-28" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md" className="backdrop-blur-sm bg-white/20 text-white border-white/30 font-bold shadow-xs">
                {activity.type}
              </Badge>
              <Badge
                variant={currentStatus.variant}
                size="md"
                dot
                className="backdrop-blur-sm bg-white/20 text-white border-white/30 font-semibold shadow-xs"
              >
                {currentStatus.label}
              </Badge>
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-xs">
              {activity.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-2xl font-medium line-clamp-1">
              Organized by {activity.organizer}
            </p>
          </div>
        </div>

        {/* Banner Quick Highlights Bar */}
        <div className="p-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <IconCalendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-900">{activity.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconClock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              {activity.startTime} - {activity.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <IconMapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">{activity.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconUsers className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-900">
              {registeredCount} / {maxParticipants} Registered
            </span>
          </div>
        </div>
      </div>

      {/* 3. Registration Metrics Cards */}
      <section
        aria-label="Registration Key Information"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8"
      >
        <StatCard
          title="Maximum Participants"
          value={maxParticipants}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="Approved venue seating limit"
        />
        <StatCard
          title="Registered Students"
          value={registeredCount}
          icon={<IconClipboardCheck className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          change={`${registrationPercentage}% capacity`}
          changeType="positive"
          helperText="Verified student registrations"
        />
        <StatCard
          title="Available Seats"
          value={availableSeats}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change={isFull ? 'Full capacity' : 'Slots available'}
          changeType={isFull ? 'negative' : 'positive'}
          helperText="Calculated: Max - Registered"
        />
        <StatCard
          title="Registration Percentage"
          value={`${registrationPercentage}%`}
          icon={<IconTrendingUp className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Real-time enrollment rate"
        />
      </section>

      {/* 4. Main Two-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {/* LEFT COLUMN: Activity Overview & Detailed Info (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Description */}
          <Card title="Activity Description" subtitle="Comprehensive overview and objectives">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </p>
          </Card>

          {/* Schedule, Venue & Location Info */}
          <Card title="Schedule & Venue Location" subtitle="Event timing and campus access details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Event Date
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <IconCalendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{activity.date}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Event Timing
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <IconClock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {activity.startTime} &ndash; {activity.endTime}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Venue
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <IconMapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{activity.venue}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Registration Deadline
                </span>
                <div className="flex items-center gap-2 font-bold text-amber-700 text-sm">
                  <IconClock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{activity.registrationDeadline}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Campus Address / Navigation
                </span>
                <p className="text-slate-800 font-medium">{activity.address}</p>
              </div>
            </div>
          </Card>

          {/* Student Eligibility Criteria */}
          <Card title="Student Eligibility" subtitle="Target audience, eligible departments, and academic years">
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Eligible Departments
                </span>
                <p className="text-slate-800 font-bold">
                  {typeof activity.eligibility === 'object'
                    ? activity.eligibility.departments || 'Open to All Departments'
                    : activity.eligibility}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Academic Year
                  </span>
                  <p className="text-slate-800 font-medium">
                    {typeof activity.eligibility === 'object'
                      ? activity.eligibility.years || 'All Years'
                      : 'All Enrolled Students'}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Degree Programs / Courses
                  </span>
                  <p className="text-slate-800 font-medium">
                    {typeof activity.eligibility === 'object'
                      ? activity.eligibility.courses || 'All Degrees'
                      : 'All Undergraduate & Postgraduate Programs'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Capacity & Faculty Quick Actions (1 Col) */}
        <div className="space-y-6">
          {/* Capacity Progress Card */}
          <Card title="Capacity & Seat Status" subtitle="Live registration saturation tracker">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Capacity Filled</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  {registrationPercentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    registrationPercentage >= 95
                      ? 'bg-rose-500'
                      : registrationPercentage >= 75
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${registrationPercentage}%` }}
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Maximum Capacity:</span>
                  <span className="font-bold text-slate-900 font-mono">{maxParticipants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Registered:</span>
                  <span className="font-bold text-blue-700 font-mono">{registeredCount}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">Remaining Seats:</span>
                  <span className={`font-bold font-mono text-sm ${availableSeats > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {availableSeats}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate(`/faculty/registrations?activity=${activity.id}`)}
                icon={<IconClipboardCheck className="w-4 h-4" />}
                className="justify-center shadow-xs"
              >
                Manage Registrations ({registeredCount})
              </Button>
            </div>
          </Card>

          {/* Organizer & Contact Info Card */}
          <Card title="Organizer & Contact" subtitle="Department steward and communications point">
            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Organizing Entity
                </span>
                <span className="font-bold text-slate-900 block">{activity.organizer}</span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <IconMail className="w-4 h-4 text-blue-600 shrink-0" />
                  <a
                    href={`mailto:${activity.contactEmail}`}
                    className="hover:text-blue-600 hover:underline truncate"
                  >
                    {activity.contactEmail}
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700">
                  <IconPhone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{activity.contactPhone}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Quick Action Buttons */}
          <Card title="Admin Actions" subtitle="Administrative activity controls">
            <div className="space-y-2.5">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate(`/faculty/activities/${activity.id}/edit`)}
                icon={<IconEdit className="w-3.5 h-3.5" />}
                className="justify-center"
              >
                Edit Activity Details
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate(`/faculty/registrations?activity=${activity.id}`)}
                icon={<IconUsers className="w-3.5 h-3.5" />}
                className="justify-center"
              >
                View Registered Students
              </Button>

              {activity.status !== 'Cancelled' ? (
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setIsCancelModalOpen(true)}
                  className="justify-center text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Cancel This Activity
                </Button>
              ) : (
                <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl text-center text-xs font-semibold">
                  This activity has been cancelled
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Activity Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Activity"
        message={`Are you sure you want to cancel "${activity.title}"? This will close registration and notify registered students.`}
        confirmText="Confirm Cancellation"
        cancelText="Keep Active"
        variant="danger"
      />
    </FacultyLayout>
  )
}
