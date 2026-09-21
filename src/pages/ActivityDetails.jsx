import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Card from '../components/common/Card'
import ActivityCard from '../components/common/ActivityCard'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconArrowLeft,
  IconActivity,
  IconClose,
} from '../components/icons/Icons'
import {
  getActivityById,
  relatedActivities,
} from '../data/activitiesData'

export default function ActivityDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Scroll to top whenever ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  // Retrieve current activity by ID (with fallback to flagship AI workshop)
  const activity = getActivityById(id)

  // Registration state: 'open' | 'registered' | 'closed' | 'full'
  const [registrationState, setRegistrationState] = useState('open')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState('')

  // Handle registration action
  const handleRegister = () => {
    setRegistrationState('registered')
    setNotificationMsg('You have successfully registered for this activity!')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  // Handle cancellation action
  const handleCancelRegistration = () => {
    setRegistrationState('open')
    setNotificationMsg('Your registration has been cancelled.')
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  // Fallback / defaults for enriched details
  const deadline = activity.registrationDeadline || '22 September 2026'
  const availableSeats = activity.availableSeats || 86
  const totalSeats = activity.totalSeats || 120
  const contactEmail = activity.contact || 'computerengineering@college.edu'
  const topics = activity.topics || [
    'Introduction to Artificial Intelligence',
    'Future technology trends',
    'Practical demonstrations',
    'Industry applications',
    'Student interaction',
  ]
  const eligibility = activity.eligibility || {
    departments: ['Computer Engineering', 'Information Technology'],
    years: 'All 2nd, 3rd and 4th year students',
  }
  const coordinator = activity.coordinator || {
    name: 'Dr. Rahul Sharma',
    role: 'Faculty Coordinator',
    department: activity.department
      ? `Department of ${activity.department}`
      : 'Department of Computer Engineering',
    email: contactEmail,
    avatar: 'RS',
  }

  // Calculate capacity percentage
  const seatPercentage = Math.round(((totalSeats - availableSeats) / totalSeats) * 100)

  return (
    <StudentLayout>
      {/* Toast Notification Banner */}
      {showNotification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <IconCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">{notificationMsg}</span>
          <button
            type="button"
            onClick={() => setShowNotification(false)}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Activity Details"
        subtitle="Complete overview, schedule, prerequisites, and registration."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Explore Activities', to: '/student/activities' },
          { label: activity.title },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/activities')}
            className="inline-flex items-center gap-1.5"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to Activities</span>
          </Button>
        }
      />

      {/* HERO SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs mb-8">
        {/* Visual Banner Thumbnail */}
        <div
          className={`h-48 sm:h-64 bg-gradient-to-br ${
            activity.thumbnailGradient || 'from-blue-600 to-indigo-700'
          } p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden text-white`}
        >
          {/* Subtle Decorative Accents */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-md pointer-events-none" />
          <div className="absolute right-12 top-6 text-white/15 pointer-events-none">
            <IconActivity className="w-32 h-32" />
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            <Badge variant="primary" size="md" className="backdrop-blur-md bg-white/20 text-white font-semibold">
              {activity.category}
            </Badge>

            {registrationState === 'registered' ? (
              <Badge variant="success" size="md" dot className="bg-emerald-500/90 text-white font-semibold shadow-xs">
                Already Registered
              </Badge>
            ) : registrationState === 'closed' ? (
              <Badge variant="neutral" size="md" className="bg-slate-700 text-slate-200 font-semibold shadow-xs">
                Registration Closed
              </Badge>
            ) : registrationState === 'full' ? (
              <Badge variant="danger" size="md" className="bg-rose-600 text-white font-semibold shadow-xs">
                Event Full
              </Badge>
            ) : (
              <Badge variant="info" size="md" dot className="bg-white/20 text-white backdrop-blur-md font-semibold">
                Open for Registration
              </Badge>
            )}
          </div>

          {/* Title & Quick Description */}
          <div className="relative z-10 max-w-3xl mt-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
              {activity.title}
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl line-clamp-2">
              {activity.description}
            </p>
          </div>
        </div>

        {/* Hero Quick Action Bar */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold text-xs">
              {coordinator.avatar || 'CL'}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{activity.organizer}</p>
              <p className="text-[11px] text-slate-500">
                Department Coordinator: {coordinator.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {registrationState === 'open' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleRegister}
                className="shadow-sm"
              >
                Register Now &rarr;
              </Button>
            )}
            {registrationState === 'registered' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelRegistration}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Cancel Registration
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN BODY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
        {/* LEFT COLUMN: Activity Info + About + Eligibility */}
        <div className="lg:col-span-2 space-y-8">
          {/* Activity Information Grid */}
          <section aria-label="Activity Information">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Activity Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Date */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <IconCalendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activity.date}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Fall Semester 2026</p>
                </div>
              </div>

              {/* Time */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <IconClock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Time
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{activity.time}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Duration: 3 Hours</p>
                </div>
              </div>

              {/* Venue */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <IconMapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Venue
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{activity.venue}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Main Campus</p>
                </div>
              </div>

              {/* Organizer */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <IconUsers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Organizer
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{activity.organizer}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{coordinator.name}</p>
                </div>
              </div>

              {/* Contact */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <IconMail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Contact
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{contactEmail}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Official Helpdesk</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <IconAlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Registration Deadline
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{deadline}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Closes 11:59 PM</p>
                </div>
              </div>

              {/* Available Seats */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5 sm:col-span-2 md:col-span-3 lg:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <IconUsers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Available Seats
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{availableSeats} / {totalSeats}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{totalSeats - availableSeats} students registered</p>
                </div>
              </div>
            </div>
          </section>

          {/* About this Activity Section */}
          <section aria-label="About this Activity">
            <Card
              title="About this Activity"
              subtitle="Comprehensive curriculum overview and workshop objectives"
              padding="lg"
            >
              <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
                <p>
                  {activity.about ||
                    'Explore emerging technologies, artificial intelligence and future innovations through an interactive campus workshop.'}
                </p>
                <p>
                  Participants will engage directly with hands-on exercises, inspect modern frameworks, and learn directly from experienced faculty mentors. Attendees will gain actionable insights into how these technologies are applied in modern industry settings.
                </p>
              </div>

              {/* Topics Covered */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Key Topics & Modules</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {topics.map((topic, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                    >
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <IconCheck className="w-3 h-3" />
                      </div>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          {/* Eligibility Section */}
          <section aria-label="Eligibility Criteria">
            <Card
              title="Eligibility"
              subtitle="Academic disciplines and student prerequisites for this activity"
              padding="lg"
            >
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Eligible Departments:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {eligibility.departments.map((dept, idx) => (
                      <Badge key={idx} variant="primary" size="md">
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Eligible Academic Years:
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium text-xs">
                    <span>🎓</span>
                    <span>{eligibility.years}</span>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* RIGHT COLUMN: Registration Card + Organizer Card + State Switcher */}
        <div className="space-y-6">
          {/* Prominent Registration Card */}
          <section aria-label="Registration Action">
            <Card padding="lg" className="border-blue-100 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Registration
                </span>
                {registrationState === 'registered' ? (
                  <Badge variant="success" size="sm" dot>
                    Confirmed
                  </Badge>
                ) : registrationState === 'closed' ? (
                  <Badge variant="neutral" size="sm">
                    Closed
                  </Badge>
                ) : registrationState === 'full' ? (
                  <Badge variant="danger" size="sm">
                    Full
                  </Badge>
                ) : (
                  <Badge variant="primary" size="sm" dot>
                    Open
                  </Badge>
                )}
              </div>

              {/* Deadline & Seat Meter */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                  <span className="text-slate-500">Deadline</span>
                  <span className="font-bold text-slate-900">{deadline}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Available Seats</span>
                    <span className="font-bold text-slate-900">
                      {availableSeats} / {totalSeats}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${seatPercentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 text-right">
                    {totalSeats - availableSeats} students registered
                  </p>
                </div>
              </div>

              {/* Dynamic Action Buttons for the 4 States */}
              <div className="space-y-3">
                {registrationState === 'open' && (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleRegister}
                    className="shadow-sm font-semibold"
                  >
                    Register Now
                  </Button>
                )}

                {registrationState === 'registered' && (
                  <>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-semibold text-xs mb-0.5">
                        <IconCheck className="w-4 h-4 text-emerald-600" />
                        <span>Registered Successfully</span>
                      </div>
                      <p className="text-[11px] text-emerald-600">
                        Confirmation email sent to student ID.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={handleCancelRegistration}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      Cancel Registration
                    </Button>
                  </>
                )}

                {registrationState === 'closed' && (
                  <Button variant="secondary" size="lg" fullWidth disabled className="opacity-60">
                    Registration Closed
                  </Button>
                )}

                {registrationState === 'full' && (
                  <Button variant="secondary" size="lg" fullWidth disabled className="opacity-60">
                    Event Full
                  </Button>
                )}
              </div>

              {/* Cancellation Policy Note */}
              <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
                You can cancel your registration before the registration deadline.
              </p>
            </Card>
          </section>

          {/* Interactive State Previewer (For Verification & Demo) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Preview Registration States:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegistrationState('open')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  registrationState === 'open'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                1. Open
              </button>
              <button
                type="button"
                onClick={() => setRegistrationState('registered')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  registrationState === 'registered'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                2. Registered
              </button>
              <button
                type="button"
                onClick={() => setRegistrationState('closed')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  registrationState === 'closed'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                3. Closed
              </button>
              <button
                type="button"
                onClick={() => setRegistrationState('full')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  registrationState === 'full'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                4. Full
              </button>
            </div>
          </div>

          {/* Organizer Card */}
          <section aria-label="Organizer Information">
            <Card title="Organizer" subtitle="Academic department coordinating this event" padding="lg">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  {coordinator.avatar || 'DC'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{activity.organizer}</h4>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">
                    {coordinator.role}: {coordinator.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{coordinator.department}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href={`mailto:${contactEmail}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  <IconMail className="w-4 h-4 text-slate-500" />
                  <span>Contact: {contactEmail}</span>
                </a>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* RELATED ACTIVITIES SECTION */}
      <section aria-label="Related Activities" className="pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Related Activities</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore other workshops, competitions, and seminars happening soon
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/activities')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
          >
            Explore All Activities &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedActivities.map((rel) => (
            <ActivityCard
              key={rel.id}
              title={rel.title}
              category={rel.category}
              date={rel.date}
              time={rel.time}
              venue={rel.venue}
              organizer={rel.organizer}
              description={rel.description}
              status={rel.status}
              statusVariant={rel.statusVariant}
              badgeVariant={rel.badgeVariant}
              thumbnailGradient={rel.thumbnailGradient}
              spotsLeft={rel.spotsLeft}
              actionText="View Details"
              onAction={() => navigate(`/student/activities/${rel.id}`)}
            />
          ))}
        </div>
      </section>
    </StudentLayout>
  )
}
