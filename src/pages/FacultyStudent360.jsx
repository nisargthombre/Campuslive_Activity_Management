import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import {
  IconArrowLeft,
  IconCalendar,
  IconClipboardCheck,
  IconCheck,
  IconAlertCircle,
  IconClubs,
  IconMail,
  IconLinkedIn,
  IconGitHub,
  IconGlobe,
  IconChevronRight,
  IconEye,
} from '../components/icons/Icons'
import { getStudentById } from '../data/facultyStudentsData'

export default function FacultyStudent360() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Retrieve student or default
  const student = useMemo(() => getStudentById(id), [id])
  const [contactNotice, setContactNotice] = useState(null)

  // Activity Overview Metrics
  const overviewStats = useMemo(() => {
    const totalReg = student.registrationHistory?.length || 0
    const participated =
      student.participationHistory?.filter((p) => p.status === 'Participated')
        .length || 0
    const upcoming =
      student.registrationHistory?.filter((r) => r.status === 'Registered')
        .length || 0
    const cancelled =
      student.registrationHistory?.filter((r) => r.status === 'Cancelled')
        .length || 0

    return { totalReg, participated, upcoming, cancelled }
  }, [student])

  const handleContactStudent = () => {
    window.location.href = `mailto:${student.email}?subject=Campus%20Live%20Inquiry%20from%20Admin`
    setContactNotice(`Email client opened for ${student.email}`)
    setTimeout(() => setContactNotice(null), 4000)
  }

  return (
    <FacultyLayout>
      {/* 1. Page Header with Breadcrumb and Back Navigation */}
      <PageHeader
        title={`Student 360: ${student.name}`}
        subtitle="Holistic academic, registration, participation, and club membership profile."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Students', to: '/faculty/students' },
          { label: student.id },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/faculty/students')}
              icon={<IconArrowLeft className="w-4 h-4" />}
            >
              Back to Students
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleContactStudent}
              icon={<IconMail className="w-4 h-4" />}
            >
              Contact Student
            </Button>
          </div>
        }
      />

      {/* Contact Notice Alert */}
      {contactNotice && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{contactNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setContactNotice(null)}
            className="text-blue-600 hover:text-blue-800 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Student 360 Identity Header Banner */}
      <Card className="mb-8" padding="lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center ring-4 ring-blue-50 shadow-md shrink-0">
              {student.avatar}
            </div>

            {/* Core Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <Badge
                  variant={student.status === 'Active' ? 'success' : 'neutral'}
                  size="sm"
                  dot
                >
                  {student.status}
                </Badge>
                <Badge variant="primary" size="sm">
                  {student.id}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                {student.course} &bull; {student.department} &bull; {student.academicYear}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <IconMail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span>&bull;</span>
                <span>{student.division}</span>
              </div>
            </div>
          </div>

          {/* Privacy Notice Badge */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-left md:text-right self-start md:self-auto shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Authorization Level
            </span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">
              Admin Oversight
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Confidential Student Record
            </span>
          </div>
        </div>
      </Card>

      {/* 7. Activity Overview Summary Cards */}
      <section
        aria-label="Activity Overview Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8"
      >
        <StatCard
          title="Total Registrations"
          value={overviewStats.totalReg}
          icon={<IconClipboardCheck className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All activity applications"
        />
        <StatCard
          title="Activities Participated"
          value={overviewStats.participated}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Verified"
          changeType="positive"
          helperText="Registered != Participated"
        />
        <StatCard
          title="Upcoming Registrations"
          value={overviewStats.upcoming}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Pending upcoming sessions"
        />
        <StatCard
          title="Cancelled Registrations"
          value={overviewStats.cancelled}
          icon={<IconAlertCircle className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-50 text-rose-600"
          helperText="Withdrawn before event"
        />
      </section>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        {/* LEFT COLUMN: Basic Information + Club Memberships + Activity Timeline */}
        <div className="space-y-8">
          {/* 6. Basic Information Card */}
          <Card
            title="Basic Information"
            subtitle="Student academic identity and verified details"
          >
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-slate-800">{student.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Student ID</span>
                <span className="font-mono font-semibold text-slate-800">{student.id}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">College Email</span>
                <span className="font-medium text-slate-800">{student.email}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="font-medium text-slate-800">{student.phone}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Department</span>
                <span className="font-medium text-slate-800">{student.department}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Course</span>
                <span className="font-medium text-slate-800">{student.course}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-medium text-slate-800">{student.academicYear}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-400">Division</span>
                <span className="font-medium text-slate-800">{student.division}</span>
              </div>
            </div>

            {/* Professional Links */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Professional & Social Profiles
              </span>

              <div className="flex flex-col gap-1.5 pt-1">
                {student.socialLinks?.linkedin && (
                  <a
                    href={student.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors text-xs font-medium group"
                  >
                    <IconLinkedIn className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">LinkedIn Profile</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {student.socialLinks?.github && (
                  <a
                    href={student.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors text-xs font-medium group"
                  >
                    <IconGitHub className="w-4 h-4 text-slate-800 shrink-0" />
                    <span className="truncate">GitHub Workspace</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {student.socialLinks?.portfolio && (
                  <a
                    href={student.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors text-xs font-medium group"
                  >
                    <IconGlobe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Personal Portfolio</span>
                    <IconChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}

                {!student.socialLinks?.linkedin &&
                  !student.socialLinks?.github &&
                  !student.socialLinks?.portfolio && (
                    <p className="text-xs text-slate-400 italic py-1">
                      No public professional links linked yet.
                    </p>
                  )}
              </div>
            </div>
          </Card>

          {/* 10. Club Memberships Section */}
          <Card
            title="Club Memberships"
            subtitle="Campus student chapters and leadership roles"
            padding="none"
          >
            {student.clubMemberships?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active club memberships recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {student.clubMemberships.map((club) => (
                  <div key={club.id} className="p-4 space-y-2 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <IconClubs className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{club.clubName}</h4>
                          <span className="text-[11px] text-slate-400">{club.category}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {club.role}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Joined {club.joinedDate}</span>
                      <span className="font-semibold text-slate-700">
                        {club.activityCount} Activities Organized
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 11. Activity Timeline Section */}
          <Card
            title="Activity Timeline"
            subtitle="Chronological trail of campus activity interactions"
            padding="none"
          >
            <div className="p-5">
              <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                {student.timeline?.map((item) => {
                  const iconColors = {
                    registration: 'bg-blue-500',
                    participation: 'bg-emerald-500',
                    club: 'bg-indigo-500',
                    cancellation: 'bg-rose-500',
                  }

                  return (
                    <div key={item.id} className="relative group">
                      {/* Node Dot */}
                      <div
                        className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ring-slate-100 ${
                          iconColors[item.type] || 'bg-slate-400'
                        }`}
                      />
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Registration History + Participation History (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 8. Registration History Section */}
          <Card
            title="Registration History"
            subtitle="All activity applications submitted by this student"
            padding="none"
          >
            {student.registrationHistory?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No activity registration records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Activity</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-4">Event Date</th>
                      <th className="py-3.5 px-3">Applied Date</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.registrationHistory.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          {reg.activity}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="primary" size="sm">
                            {reg.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {reg.date}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-500">
                          {reg.registrationDate}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <Badge
                            variant={reg.status === 'Registered' ? 'success' : 'danger'}
                            size="sm"
                            dot
                          >
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/faculty/activities/${reg.activityId || 'act-1'}`)}
                            icon={<IconEye className="w-3.5 h-3.5" />}
                            className="text-xs text-slate-600 hover:text-blue-600"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* 9. Participation History Section (Registered != Participated) */}
          <Card
            title="Participation History"
            subtitle="Verified attendance and on-site completion records"
            padding="none"
          >
            {student.participationHistory?.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No past verified participation sessions on record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">Activity</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-4">Event Date</th>
                      <th className="py-3.5 px-3">Participation Status</th>
                      <th className="py-3.5 px-4">Recorded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {student.participationHistory.map((part) => (
                      <tr key={part.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          {part.activity}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="secondary" size="sm">
                            {part.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                          {part.date}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <Badge
                            variant={part.status === 'Participated' ? 'success' : 'neutral'}
                            size="sm"
                            dot
                          >
                            {part.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                          {part.recordedDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-3 sm:px-6 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex items-center justify-between text-xs text-slate-500">
              <span>
                <span className="font-semibold text-slate-800">Note:</span> Registration records
                are maintained separately from verified on-site participation.
              </span>
              <span className="text-[11px] text-slate-400">Verified by Admin Lead</span>
            </div>
          </Card>
        </div>
      </div>
    </FacultyLayout>
  )
}
