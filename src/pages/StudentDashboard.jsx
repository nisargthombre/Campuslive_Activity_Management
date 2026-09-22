import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import ActivityCard from '../components/common/ActivityCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  IconClipboardCheck,
  IconClubs,
  IconActivity,
  IconCalendar,
  IconClock,
  IconChevronRight,
  IconUsers,
  IconCheck,
  IconAlertCircle,
  IconTrophy,
  IconSparkles,
  IconCamera,
  IconTrendingUp,
  IconGlobe,
  IconHelp,
} from '../components/icons/Icons'
import {
  studentStats,
  upcomingActivities as initialUpcomingActivities,
  myClubs as initialClubs,
  studentNotifications as initialNotifications,
} from '../data/studentDashboardData'
import { initialRegistrations } from '../data/registrationsData'

export default function StudentDashboard() {
  const navigate = useNavigate()

  // State with existing mock data
  const [upcomingList] = useState(initialUpcomingActivities)
  const [registrationsList] = useState(initialRegistrations)
  const [clubsList] = useState(initialClubs)
  const [notificationsList] = useState(initialNotifications)

  // 1. Summary statistics in the exact 4-card order requested
  const summaryStats = [
    {
      title: 'Registered Activities',
      value: studentStats.find((s) => s.title === 'Registered Activities')?.value || '8',
      icon: <IconClipboardCheck className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50 text-blue-600',
      change: '+2 this week',
      changeType: 'positive',
      helperText: '2 upcoming this week',
    },
    {
      title: 'Upcoming Activities',
      value: studentStats.find((s) => s.title === 'Upcoming Events')?.value || '6',
      icon: <IconCalendar className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50 text-amber-600',
      change: '2 this week',
      changeType: 'positive',
      helperText: 'Explore & register early',
    },
    {
      title: 'Activities Participated',
      value: studentStats.find((s) => s.title === 'Activities Participated')?.value || '12',
      icon: <IconActivity className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      change: '+4 this semester',
      changeType: 'positive',
      helperText: 'Verified certificates earned',
    },
    {
      title: 'Clubs Joined',
      value: studentStats.find((s) => s.title === 'Clubs Joined')?.value || '3',
      icon: <IconClubs className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      change: 'Active',
      changeType: 'neutral',
      helperText: 'Active club memberships',
    },
  ]

  // 2. Activity Categories
  const categories = [
    {
      name: 'Workshops',
      query: 'Workshop',
      icon: <IconActivity className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50/80 border-blue-200/70 hover:border-blue-300 text-blue-900',
      tagBg: 'bg-blue-100/80 text-blue-700',
      count: '8 Events',
    },
    {
      name: 'Seminars',
      query: 'Seminar',
      icon: <IconUsers className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/80 border-purple-200/70 hover:border-purple-300 text-purple-900',
      tagBg: 'bg-purple-100/80 text-purple-700',
      count: '5 Events',
    },
    {
      name: 'Competitions',
      query: 'Competition',
      icon: <IconTrophy className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50/80 border-amber-200/70 hover:border-amber-300 text-amber-900',
      tagBg: 'bg-amber-100/80 text-amber-700',
      count: '4 Events',
    },
    {
      name: 'Hackathons',
      query: 'Hackathon',
      icon: <IconSparkles className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50/80 border-indigo-200/70 hover:border-indigo-300 text-indigo-900',
      tagBg: 'bg-indigo-100/80 text-indigo-700',
      count: '3 Events',
    },
    {
      name: 'Cultural',
      query: 'Cultural',
      icon: <IconCamera className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50/80 border-rose-200/70 hover:border-rose-300 text-rose-900',
      tagBg: 'bg-rose-100/80 text-rose-700',
      count: '6 Events',
    },
    {
      name: 'Sports',
      query: 'Sports',
      icon: <IconTrendingUp className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/80 border-emerald-200/70 hover:border-emerald-300 text-emerald-900',
      tagBg: 'bg-emerald-100/80 text-emerald-700',
      count: '4 Events',
    },
    {
      name: 'Technical',
      query: 'Technical',
      icon: <IconGlobe className="w-4 h-4 text-cyan-600" />,
      bg: 'bg-cyan-50/80 border-cyan-200/70 hover:border-cyan-300 text-cyan-900',
      tagBg: 'bg-cyan-100/80 text-cyan-700',
      count: '9 Events',
    },
  ]

  const handleCategoryClick = (cat) => {
    navigate(`/student/activities?category=${encodeURIComponent(cat.query)}`)
  }

  return (
    <StudentLayout>
      {/* 1. Welcome Section */}
      <PageHeader
        title="Good Morning, Student 👋"
        subtitle="Stay updated with what's happening on campus."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Badge variant="primary" size="md" dot>
              Fall Semester 2026
            </Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<IconCalendar className="w-4 h-4" />}
              onClick={() => navigate('/student/activities')}
              className="font-semibold shadow-2xs"
            >
              Explore Activities
            </Button>
          </div>
        }
      />

      {/* 2. 4 Summary Cards Grid */}
      <section aria-label="Student Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {summaryStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconBg={stat.iconBg}
            change={stat.change}
            changeType={stat.changeType}
            helperText={stat.helperText}
          />
        ))}
      </section>

      {/* 3. Explore by Category Section */}
      <section aria-label="Activity Categories" className="mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse campus events and workshops tailored to your interests
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`p-3 rounded-xl border ${cat.bg} transition-all duration-150 flex flex-col items-center text-center justify-center gap-1.5 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 cursor-pointer group`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {cat.name}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.tagBg}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Upcoming Activities Section */}
      <section aria-label="Upcoming Activities" className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Upcoming Activities</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {upcomingList.length} Available
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Featured campus events, workshops, and competitions open for registration
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/activities')}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer shrink-0"
          >
            <span>View All Activities</span>
            <IconChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {upcomingList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingList.map((act) => (
              <ActivityCard
                key={act.id}
                id={act.id}
                title={act.title}
                category={act.category}
                date={act.date}
                time={act.time}
                venue={act.venue}
                organizer={act.organizer}
                status={act.status}
                statusVariant={act.statusVariant}
                badgeVariant={act.badgeVariant}
                thumbnailGradient={act.thumbnailGradient}
                spotsLeft={act.spotsLeft}
                actionText="View Details"
                onAction={() => navigate(`/student/activities/${act.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming activities"
            description="There are currently no upcoming activities scheduled. Check back soon for new announcements!"
            actionText="Explore All Activities"
            onAction={() => navigate('/student/activities')}
          />
        )}
      </section>

      {/* 5. Main 2-Column Split: Left (Registrations + Clubs) & Right (Notifications + Support) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Recent Registrations & Clubs Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Registrations Section */}
          <section aria-label="Recent Registrations">
            <Card
              title="Recent Registrations"
              subtitle="Your active and confirmed campus activity bookings"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/my-registrations')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>View All</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {registrationsList.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {/* Table header for desktop */}
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Activity</div>
                    <div className="col-span-3">Schedule</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                  </div>

                  {/* List rows */}
                  {registrationsList.slice(0, 4).map((reg) => (
                    <div
                      key={reg.id}
                      className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="sm:col-span-5 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {reg.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-600">{reg.category}</span>
                          <span>&bull;</span>
                          <span className="truncate">{reg.venue}</span>
                        </div>
                      </div>

                      <div className="sm:col-span-3 text-xs text-slate-600">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{reg.date}</span>
                        </div>
                        {reg.time && (
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <IconClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{reg.time}</span>
                          </div>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <Badge variant={reg.statusVariant || 'primary'} size="sm" dot>
                          {reg.status}
                        </Badge>
                      </div>

                      <div className="sm:col-span-2 sm:text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/student/activities/${reg.activityId || 'feat-1'}`)}
                          className="w-full sm:w-auto text-xs font-semibold justify-center"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No recent registrations"
                    description="You haven't registered for any campus activities yet. Explore upcoming events to get involved!"
                    actionText="Explore Activities"
                    onAction={() => navigate('/student/activities')}
                  />
                </div>
              )}
            </Card>
          </section>

          {/* Clubs Preview Section */}
          <section aria-label="Clubs Preview">
            <Card
              title="Clubs"
              subtitle="Student organizations and technical chapters"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/clubs')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>Explore Clubs</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {clubsList.length > 0 ? (
                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {clubsList.map((club) => (
                      <div
                        key={club.id}
                        className="bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${club.color || 'from-blue-600 to-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              {club.avatar || club.name.slice(0, 2).toUpperCase()}
                            </div>
                            <Badge variant="neutral" size="sm">
                              {club.category}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {club.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <IconUsers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{club.memberCount} members</span>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {club.role || 'Member'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/clubs/${club.id}`)}
                            className="text-xs font-semibold px-2.5 py-1"
                          >
                            View Club
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No clubs joined"
                    description="Discover clubs to meet fellow students and grow your technical & creative skills."
                    actionText="Explore Clubs"
                    onAction={() => navigate('/student/clubs')}
                  />
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* RIGHT COLUMN: Recent Notifications & Quick Support */}
        <div className="space-y-8">
          {/* Recent Notifications Section */}
          <section aria-label="Recent Notifications">
            <Card
              title="Recent Notifications"
              subtitle="Latest activity updates and reminders"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/notifications')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <span>View All</span>
                  <IconChevronRight className="w-4 h-4 ml-1" />
                </Button>
              }
              padding="none"
            >
              {notificationsList.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-100 p-2">
                    {notificationsList.slice(0, 4).map((notif) => {
                      const notifIcon =
                        notif.type === 'activity' ? (
                          <IconActivity className="w-4 h-4 text-blue-600" />
                        ) : notif.type === 'success' ? (
                          <IconCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <IconAlertCircle className="w-4 h-4 text-amber-600" />
                        )

                      const notifBg =
                        notif.type === 'activity'
                          ? 'bg-blue-50'
                          : notif.type === 'success'
                          ? 'bg-emerald-50'
                          : 'bg-amber-50'

                      return (
                        <div
                          key={notif.id}
                          onClick={() => navigate('/student/notifications')}
                          className={`p-3.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                            notif.isUnread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg ${notifBg} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            {notifIcon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5
                                className={`text-xs truncate ${
                                  notif.isUnread
                                    ? 'font-bold text-slate-900'
                                    : 'font-semibold text-slate-700'
                                }`}
                              >
                                {notif.title}
                              </h5>
                              {notif.isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/student/notifications')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View All Notifications</span>
                      <IconChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <EmptyState
                    title="No notifications"
                    description="You are all caught up! No unread activity alerts or announcements."
                    actionText="Notification Center"
                    onAction={() => navigate('/student/notifications')}
                  />
                </div>
              )}
            </Card>
          </section>

          {/* Quick Support & Resources Card */}
          <section aria-label="Student Help & Quick Links">
            <Card padding="md" className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-0 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-blue-400">
                  <IconHelp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Need Activity Assistance?</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Questions about your registrations, venue access, or club memberships?
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/student/support')}
                      className="bg-white text-slate-950 hover:bg-slate-100 font-semibold text-xs border-0 cursor-pointer"
                    >
                      Contact Support
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/student/my-registrations')}
                      className="text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer"
                    >
                      My Registrations
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </StudentLayout>
  )
}
