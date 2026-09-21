import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import ActivityCard from '../components/common/ActivityCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import NotificationItem from '../components/common/NotificationItem'
import {
  IconClipboardCheck,
  IconClubs,
  IconActivity,
  IconCalendar,
  IconChevronRight,
  IconUsers,
} from '../components/icons/Icons'
import {
  studentStats,
  upcomingActivities,
  myActivities,
  myClubs,
  studentNotifications,
} from '../data/studentDashboardData'

function StudentDashboard() {
  const navigate = useNavigate()
  const statIconMap = {
    clipboard: <IconClipboardCheck className="w-5 h-5" />,
    clubs: <IconClubs className="w-5 h-5" />,
    activity: <IconActivity className="w-5 h-5" />,
    calendar: <IconCalendar className="w-5 h-5 text-amber-600" />,
  }

  return (
    <StudentLayout>
      {/* Header */}
      <PageHeader
        title="Good Morning, Nisarg 👋"
        subtitle="Stay connected with what's happening on campus."
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
          </div>
        }
      />

      {/* 4 Statistics Cards */}
      <section aria-label="Student Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {studentStats.map((stat, idx) => (
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* LEFT COLUMN: Upcoming Activities + My Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Activities Section */}
          <section aria-label="Upcoming Activities">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upcoming Activities</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Featured campus events, workshops, and competitions
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/student/activities')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium cursor-pointer"
              >
                View All Activities &rarr;
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingActivities.map((act) => (
                <ActivityCard
                  key={act.id}
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
          </section>

          {/* Participation History Section */}
          <section aria-label="Participation History">
            <Card
              title="Participation History"
              subtitle="Track your event attendance and past registrations"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  View Full History
                </Button>
              }
              padding="none"
            >
              <div className="divide-y divide-slate-100">
                {myActivities.map((item) => (
                   <div
                     key={item.id}
                     className="p-4 sm:px-6 sm:py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                   >
                     <div className="flex items-start sm:items-center gap-3.5">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <IconCalendar className="w-5 h-5" />
                       </div>
                       <div>
                         <div className="flex items-center gap-2">
                           <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                           <span className="text-[11px] text-slate-400 font-normal">({item.category})</span>
                         </div>
                         <p className="text-xs text-slate-500 mt-0.5">
                           {item.date} &bull; {item.venue}
                         </p>
                       </div>
                     </div>

                     <div className="flex items-center gap-3 self-end sm:self-center">
                       <Badge variant={item.statusVariant} size="sm" dot>
                         {item.status}
                       </Badge>
                     </div>
                   </div>
                 ))}
               </div>
             </Card>
           </section>
        </div>

        {/* RIGHT COLUMN: My Clubs + Notifications */}
        <div className="space-y-8">
          {/* My Clubs Section */}
          <section aria-label="My Clubs">
            <Card
              title="My Clubs"
              subtitle="Clubs and student associations you are part of"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Explore &rarr;
                </Button>
              }
              padding="none"
            >
              <div className="divide-y divide-slate-100">
                {myClubs.map((club) => (
                  <div
                    key={club.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${club.color} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {club.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">
                          {club.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{club.category}</span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <IconUsers className="w-3 h-3 text-slate-400" />
                            {club.memberCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="neutral" size="sm">
                      {club.role}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                <Button variant="outline" size="sm" fullWidth>
                  Discover More Clubs
                </Button>
              </div>
            </Card>
          </section>

          {/* Notifications Section */}
          <section aria-label="Notifications">
            <Card
              title="Notifications"
              subtitle="Latest activity updates and reminders"
              action={
                <Badge variant="primary" size="sm" className="font-semibold">
                  3 New
                </Badge>
              }
              padding="none"
            >
              <div className="divide-y divide-slate-100 p-2">
                {studentNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    title={notif.title}
                    message={notif.message}
                    time={notif.time}
                    type={notif.type}
                    isUnread={notif.isUnread}
                    onClick={() => {}}
                  />
                ))}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/40 rounded-b-xl text-center">
                <button
                  type="button"
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
    </StudentLayout>
  )
}

export default StudentDashboard
