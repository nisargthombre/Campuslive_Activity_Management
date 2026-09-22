import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  IconArrowLeft,
  IconClubs,
  IconUsers,
  IconCalendar,
  IconActivity,
  IconClipboardCheck,
  IconMail,
  IconSearch,
  IconCheck,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconClose,
  IconClock,
  IconMapPin,
  IconEye,
  IconAlertCircle,
  IconTrendingUp,
} from '../components/icons/Icons'
import { getClubById } from '../data/facultyClubsData'

export default function FacultyClubDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Retrieve matching club
  const club = useMemo(() => getClubById(id), [id])

  // Active Tab state (synced with query param ?tab=...)
  const activeTabParam = searchParams.get('tab')
  const validTabs = [
    'overview',
    'members',
    'activities',
    'registrations',
    'participation',
    'announcements',
    'resources',
  ]
  const initialTab = validTabs.includes(activeTabParam) ? activeTabParam : 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams(tabId === 'overview' ? {} : { tab: tabId })
  }

  // Edit Club Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: club?.name || '',
    category: club?.category || '',
    status: club?.status || 'Active',
    meetingSchedule: club?.meetingSchedule || '',
    meetingVenue: club?.meetingVenue || '',
    description: club?.description || '',
    mission: club?.mission || '',
    eligibility: club?.eligibility || '',
  })
  const [editSuccessMessage, setEditSuccessMessage] = useState(null)

  // Member Quick View Modal State
  const [selectedMemberModal, setSelectedMemberModal] = useState(null)

  // Announcements Modal State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', preview: '' })
  const [announcementsList, setAnnouncementsList] = useState(club?.announcements || [])

  // Resources Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [newResource, setNewResource] = useState({ name: '', type: 'PDF' })
  const [resourcesList, setResourcesList] = useState(club?.resources || [])

  // ----------------------------------------------------
  // Members Filtering State
  // ----------------------------------------------------
  const [memberSearch, setMemberSearch] = useState('')
  const [memberDept, setMemberDept] = useState('All')
  const [memberCourse, setMemberCourse] = useState('All')
  const [memberYear, setMemberYear] = useState('All')
  const [memberRole, setMemberRole] = useState('All')
  const [memberStatus, setMemberStatus] = useState('All')

  const filteredMembers = useMemo(() => {
    if (!club?.members) return []
    const q = memberSearch.trim().toLowerCase()

    return club.members.filter((m) => {
      // Search
      if (q) {
        const nameMatch = m.name.toLowerCase().includes(q)
        const idMatch = m.studentId.toLowerCase().includes(q)
        const emailMatch = m.email.toLowerCase().includes(q)
        if (!nameMatch && !idMatch && !emailMatch) return false
      }

      // Filters
      if (memberDept !== 'All' && m.department !== memberDept) return false
      if (memberCourse !== 'All' && m.course !== memberCourse) return false
      if (memberYear !== 'All' && m.academicYear !== memberYear) return false
      if (memberRole !== 'All' && m.role !== memberRole) return false
      if (memberStatus !== 'All' && m.status !== memberStatus) return false

      return true
    })
  }, [
    club,
    memberSearch,
    memberDept,
    memberCourse,
    memberYear,
    memberRole,
    memberStatus,
  ])

  const handleClearMemberFilters = () => {
    setMemberSearch('')
    setMemberDept('All')
    setMemberCourse('All')
    setMemberYear('All')
    setMemberRole('All')
    setMemberStatus('All')
  }

  // ----------------------------------------------------
  // Activities Filtering State
  // ----------------------------------------------------
  const [activitySearch, setActivitySearch] = useState('')
  const [activityType, setActivityType] = useState('All')
  const [activityStatus, setActivityStatus] = useState('All')

  const filteredActivities = useMemo(() => {
    if (!club?.activities) return []
    const q = activitySearch.trim().toLowerCase()

    return club.activities.filter((act) => {
      if (q) {
        const titleMatch = act.title.toLowerCase().includes(q)
        const typeMatch = act.type.toLowerCase().includes(q)
        const venueMatch = act.venue.toLowerCase().includes(q)
        if (!titleMatch && !typeMatch && !venueMatch) return false
      }

      if (activityType !== 'All' && act.type !== activityType) return false
      if (activityStatus !== 'All' && act.status !== activityStatus) return false

      return true
    })
  }, [club, activitySearch, activityType, activityStatus])

  const handleClearActivityFilters = () => {
    setActivitySearch('')
    setActivityType('All')
    setActivityStatus('All')
  }

  // ----------------------------------------------------
  // Summary Aggregates (Dynamic Calculations)
  // ----------------------------------------------------
  const summary = useMemo(() => {
    if (!club) return {}
    const totalMembers = club.members?.length || 0
    const activeMembers = club.members?.filter((m) => m.status === 'Active').length || 0
    const totalActivities = club.activities?.length || 0
    const upcomingActivities =
      club.activities?.filter((a) => a.status === 'Upcoming').length || 0
    const completedActivities =
      club.activities?.filter((a) => a.status === 'Completed').length || 0
    const totalRegistrations =
      club.activities?.reduce((sum, a) => sum + (a.registered || 0), 0) || 0
    const totalParticipated =
      club.activities?.reduce((sum, a) => sum + (a.participated || 0), 0) || 0
    const totalCancelled =
      club.activities?.reduce((sum, a) => sum + (a.cancelled || 0), 0) || 0

    const overallParticipationRate =
      totalRegistrations > 0
        ? Math.round((totalParticipated / totalRegistrations) * 100)
        : 0

    const avgRegistrations =
      totalActivities > 0 ? Math.round(totalRegistrations / totalActivities) : 0

    return {
      totalMembers,
      activeMembers,
      totalActivities,
      upcomingActivities,
      completedActivities,
      totalRegistrations,
      totalParticipated,
      totalCancelled,
      overallParticipationRate,
      avgRegistrations,
    }
  }, [club])

  // Save Edit Handler
  const handleSaveEdit = (e) => {
    e.preventDefault()
    setIsEditModalOpen(false)
    setEditSuccessMessage('Club information updated successfully in active session.')
    setTimeout(() => setEditSuccessMessage(null), 4000)
  }

  // Create Announcement Handler
  const handleAddAnnouncement = (e) => {
    e.preventDefault()
    if (!newAnnouncement.title) return
    const ann = {
      id: `ann-${Date.now()}`,
      title: newAnnouncement.title,
      preview: newAnnouncement.preview,
      postedBy: club.facultyCoordinator?.name || 'Faculty Coordinator',
      date: 'Today',
      status: 'Published',
    }
    setAnnouncementsList((prev) => [ann, ...prev])
    setNewAnnouncement({ title: '', preview: '' })
    setIsAnnouncementModalOpen(false)
  }

  // Create Resource Handler
  const handleAddResource = (e) => {
    e.preventDefault()
    if (!newResource.name) return
    const res = {
      id: `res-${Date.now()}`,
      name: newResource.name.endsWith('.pdf') ? newResource.name : `${newResource.name}.pdf`,
      type: newResource.type,
      size: '1.5 MB',
      uploadedDate: 'Today',
      uploadedBy: club.facultyCoordinator?.name || 'Faculty Coordinator',
    }
    setResourcesList((prev) => [res, ...prev])
    setNewResource({ name: '', type: 'PDF' })
    setIsResourceModalOpen(false)
  }

  if (!club) {
    return (
      <FacultyLayout>
        <PageHeader
          title="Club Not Found"
          breadcrumb={[
            { label: 'Campus Live', to: '/' },
            { label: 'Admin', to: '/faculty/dashboard' },
            { label: 'Clubs', to: '/faculty/clubs' },
            { label: 'Not Found' },
          ]}
        />
        <EmptyState
          title="Club not found"
          description="The requested club profile does not exist or has been archived."
          icon={<IconClubs className="w-8 h-8 text-slate-400" />}
          actionText="Back to Clubs"
          onAction={() => navigate('/faculty/clubs')}
        />
      </FacultyLayout>
    )
  }

  return (
    <FacultyLayout>
      {/* 1. Page Header with Back button and Actions */}
      <PageHeader
        title={club.name}
        subtitle="Club Overview & Management 360"
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Clubs', to: '/faculty/clubs' },
          { label: club.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/faculty/clubs')}
              icon={<IconArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Clubs
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={<IconEdit className="w-3.5 h-3.5" />}
            >
              Edit Club
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange('members')}
              icon={<IconUsers className="w-3.5 h-3.5" />}
            >
              View Members
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleTabChange('activities')}
              icon={<IconCalendar className="w-3.5 h-3.5" />}
            >
              Manage Activities
            </Button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {editSuccessMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{editSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Hero Club Banner Card */}
      <Card className="mb-6" padding="md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xs shrink-0 bg-gradient-to-br ${club.gradient}`}
            >
              {club.avatarText}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {club.name}
                </h1>
                <Badge variant="primary" size="sm">
                  {club.category}
                </Badge>
                <Badge
                  variant={
                    club.status === 'Active'
                      ? 'success'
                      : club.status === 'Pending'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="sm"
                  dot
                >
                  {club.status}
                </Badge>
                <Badge variant="secondary" size="sm">
                  {club.activityLevel} Activity
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed mb-3">
                {club.description}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  <strong>Coordinator:</strong> {club.facultyCoordinator?.name}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconMail className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={`mailto:${club.facultyCoordinator?.email}`}
                    className="hover:text-blue-600 underline"
                  >
                    {club.facultyCoordinator?.email}
                  </a>
                </span>
                {club.contact && (
                  <span>
                    <strong>Phone:</strong> {club.contact}
                  </span>
                )}
                <span>
                  <strong>Founded:</strong> {club.founded || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Club Summary: 4 Core Summary Cards */}
      <section
        aria-label="Club Key Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8"
      >
        <StatCard
          title="Total Members"
          value={summary.totalMembers}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="Enrolled student members"
        />
        <StatCard
          title="Active Members"
          value={summary.activeMembers}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Engaged"
          changeType="positive"
          helperText="Active participation ratio"
        />
        <StatCard
          title="Total Activities"
          value={summary.totalActivities}
          icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="All organized club events"
        />
        <StatCard
          title="Upcoming Activities"
          value={summary.upcomingActivities}
          icon={<IconActivity className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-50 text-amber-600"
          change="Scheduled"
          changeType="positive"
          helperText="Upcoming campus events"
        />
      </section>

      {/* 4. Tab Navigation Strip */}
      <div className="border-b border-slate-200 mb-6 overflow-x-auto">
        <nav className="flex space-x-1 sm:space-x-2" aria-label="Club Details Tabs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'members', label: 'Members', count: club.members?.length },
            { id: 'activities', label: 'Activities', count: club.activities?.length },
            { id: 'registrations', label: 'Registrations', count: summary.totalRegistrations },
            { id: 'participation', label: 'Participation', count: `${summary.overallParticipationRate}%` },
            { id: 'announcements', label: 'Announcements', count: announcementsList.length },
            { id: 'resources', label: 'Resources', count: resourcesList.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`py-3 px-3.5 sm:px-4 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column (2 Cols on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 5. Club Information Card */}
            <Card title="Club Information" subtitle="Official registration and scheduling details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Club Name
                  </span>
                  <span className="font-bold text-slate-900">{club.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Category & Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="primary" size="sm">
                      {club.category}
                    </Badge>
                    <Badge variant="success" size="sm" dot>
                      {club.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Mission / Purpose
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {club.mission || 'Not provided'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Student Eligibility
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {club.eligibility || 'Open to all students'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Meeting Schedule
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <IconClock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{club.meetingSchedule || 'Not provided'}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Meeting Venue
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                    <IconMapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{club.meetingVenue || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 18. Upcoming Club Activities */}
            <Card
              title="Upcoming Club Activities"
              subtitle="Events scheduled for students in the coming weeks"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('activities')}
                >
                  View All ({club.activities?.length || 0})
                </Button>
              }
            >
              {club.activities?.filter((a) => a.status === 'Upcoming').length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No upcoming activities currently scheduled for this club.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {club.activities
                    ?.filter((a) => a.status === 'Upcoming')
                    .map((act) => {
                      const availSeats = Math.max(0, act.capacity - act.registered)

                      return (
                        <div
                          key={act.id}
                          className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {act.title}
                              </h4>
                              <Badge variant="primary" size="sm">
                                {act.type}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <IconCalendar className="w-3 h-3 text-slate-400" />
                                {act.date} ({act.time})
                              </span>
                              <span className="flex items-center gap-1">
                                <IconMapPin className="w-3 h-3 text-slate-400" />
                                {act.venue}
                              </span>
                              <span>
                                <strong>{act.registered}</strong> / {act.capacity} registered
                              </span>
                              <span className="text-emerald-600 font-medium">
                                ({availSeats} seats left)
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/faculty/activities/${act.id}`)}
                            icon={<IconEye className="w-3.5 h-3.5" />}
                          >
                            View Activity
                          </Button>
                        </div>
                      )
                    })}
                </div>
              )}
            </Card>

            {/* 16. Club Engagement Section */}
            <Card
              title="Club Engagement"
              subtitle="Membership activity, member retention, and event attendance rate"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-center">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium block">Active Members</span>
                  <span className="text-2xl font-extrabold text-blue-700 mt-1 block font-mono">
                    {summary.activeMembers}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {Math.round((summary.activeMembers / Math.max(1, summary.totalMembers)) * 100)}% active ratio
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-xs text-slate-600 font-medium block">Students Participated</span>
                  <span className="text-2xl font-extrabold text-emerald-700 mt-1 block font-mono">
                    {summary.totalParticipated}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {summary.overallParticipationRate}% turnout rate
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-xs text-slate-600 font-medium block">Events Conducted</span>
                  <span className="text-2xl font-extrabold text-indigo-700 mt-1 block font-mono">
                    {summary.totalActivities}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {summary.avgRegistrations} avg reg/event
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (1 Col on desktop) */}
          <div className="space-y-6">
            {/* 6. Faculty Coordinator Card */}
            <Card title="Faculty Coordinator" subtitle="Primary faculty steward of club affairs">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-base shrink-0 shadow-2xs">
                  {club.facultyCoordinator?.avatar || 'FC'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {club.facultyCoordinator?.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {club.facultyCoordinator?.department}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Coordinator since {club.facultyCoordinator?.since || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <a
                    href={`mailto:${club.facultyCoordinator?.email}`}
                    className="font-medium text-blue-600 hover:underline truncate ml-2"
                  >
                    {club.facultyCoordinator?.email}
                  </a>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 font-medium">Contact:</span>
                  <span className="font-medium text-slate-800">
                    {club.facultyCoordinator?.contact || 'Not provided'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center"
                onClick={() =>
                  (window.location.href = `mailto:${club.facultyCoordinator?.email}?subject=Campus%20Live%20Club%20Inquiry:%20${club.name}`)
                }
                icon={<IconMail className="w-3.5 h-3.5" />}
              >
                Contact Coordinator
              </Button>
            </Card>

            {/* 17. Recent Club Activity Timeline */}
            <Card
              title="Recent Club Activity"
              subtitle="Milestones & member interactions"
            >
              {club.timeline?.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No activity logs recorded.
                </p>
              ) : (
                <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {club.timeline?.map((item) => (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="text-xs font-semibold text-slate-800">
                        {item.event}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: MEMBERS */}
      {/* ==================================================== */}
      {activeTab === 'members' && (
        <Card
          title="Club Members"
          subtitle="Enrolled student members, volunteers, and core committee"
          padding="none"
        >
          {/* Members Search & Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members by name, student ID, or email..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              <div>
                <select
                  value={memberDept}
                  onChange={(e) => setMemberDept(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <select
                  value={memberCourse}
                  onChange={(e) => setMemberCourse(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Courses</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="M.Tech">M.Tech</option>
                </select>
              </div>
              <div>
                <select
                  value={memberYear}
                  onChange={(e) => setMemberYear(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Roles</option>
                  <option value="Core Member">Core Member</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div>
                <select
                  value={memberStatus}
                  onChange={(e) => setMemberStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={handleClearMemberFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Showing <strong>{filteredMembers.length}</strong> of{' '}
                <strong>{club.members?.length || 0}</strong> members
              </span>
            </div>
          </div>

          {/* Members Table */}
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState
                title="No members found"
                description="No club members match the current search or filters."
                icon={<IconUsers className="w-8 h-8 text-slate-400" />}
                actionText="Reset Filters"
                onAction={handleClearMemberFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Student</th>
                    <th className="py-3 px-3">Student ID</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">Club Role</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3">Membership Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.studentId}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedMemberModal(member)}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {member.avatar}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{member.name}</span>
                            <span className="text-[11px] text-slate-400 block">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                        {member.studentId}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {member.department}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {member.course}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {member.academicYear}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            member.role === 'Core Member'
                              ? 'primary'
                              : member.role === 'Volunteer'
                              ? 'secondary'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {member.joinedDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            member.status === 'Active'
                              ? 'success'
                              : member.status === 'Pending'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                          dot
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/faculty/students/${member.studentId}`)
                          }}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          View Student
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 3: ACTIVITIES */}
      {/* ==================================================== */}
      {activeTab === 'activities' && (
        <Card
          title="Club Activities"
          subtitle="Workshops, seminars, hackathons, and competitions organized by this club"
          padding="none"
        >
          {/* Activities Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activities by title, type, or venue..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Activity Types</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Competition">Competition</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <select
                  value={activityStatus}
                  onChange={(e) => setActivityStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={handleClearActivityFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Showing <strong>{filteredActivities.length}</strong> of{' '}
                <strong>{club.activities?.length || 0}</strong> activities
              </span>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState
                title="No activities found"
                description="No activities match the current filters."
                icon={<IconCalendar className="w-8 h-8 text-slate-400" />}
                actionText="Reset Filters"
                onAction={handleClearActivityFilters}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Activity Title</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Venue</th>
                    <th className="py-3 px-3 text-center">Registered</th>
                    <th className="py-3 px-3 text-center">Capacity</th>
                    <th className="py-3 px-3 text-center">Available Seats</th>
                    <th className="py-3 px-3">Registration Deadline</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.map((act) => {
                    const availSeats = Math.max(0, act.capacity - act.registered)

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          {act.title}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="primary" size="sm">
                            {act.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {act.date} ({act.time})
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{act.venue}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-blue-700">
                          {act.registered}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                          {act.capacity}
                        </td>
                        <td className="py-3.5 px-3 text-center font-semibold text-emerald-700">
                          {availSeats}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {act.registrationDeadline || 'N/A'}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={
                              act.status === 'Completed'
                                ? 'neutral'
                                : act.status === 'Upcoming'
                                ? 'success'
                                : 'warning'
                            }
                            size="sm"
                            dot
                          >
                            {act.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/faculty/activities/${act.id}`)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            View Activity
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 4: REGISTRATIONS */}
      {/* ==================================================== */}
      {activeTab === 'registrations' && (
        <div className="space-y-6">
          {/* Registration Aggregates */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            <StatCard
              title="Total Registrations"
              value={summary.totalRegistrations}
              icon={<IconClipboardCheck className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50 text-blue-600"
              helperText="Applications across all events"
            />
            <StatCard
              title="Upcoming Seats Booked"
              value={
                club.activities
                  ?.filter((a) => a.status === 'Upcoming')
                  .reduce((sum, a) => sum + a.registered, 0) || 0
              }
              icon={<IconCalendar className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50 text-indigo-600"
              helperText="Active confirmed bookings"
            />
            <StatCard
              title="Cancelled Registrations"
              value={summary.totalCancelled}
              icon={<IconClose className="w-5 h-5 text-rose-600" />}
              iconBg="bg-rose-50 text-rose-600"
              helperText="Capacity recycled to pool"
            />
            <StatCard
              title="Avg Reg / Activity"
              value={summary.avgRegistrations}
              icon={<IconTrendingUp className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50 text-emerald-600"
              helperText="Average student demand"
            />
          </div>

          {/* Registrations List */}
          <Card
            title="Activity Registration Overview"
            subtitle="Verified student applications recorded for club activities"
            padding="none"
          >
            {club.registrations?.length === 0 ? (
              <div className="p-8 text-center">
                <EmptyState
                  title="No registrations yet"
                  description="No student applications recorded for this club's activities."
                  icon={<IconClipboardCheck className="w-8 h-8 text-slate-400" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Student</th>
                      <th className="py-3 px-3">Student ID</th>
                      <th className="py-3 px-4">Activity Name</th>
                      <th className="py-3 px-3">Application Date</th>
                      <th className="py-3 px-3">Booking Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {club.registrations?.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          {reg.studentName}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-700">
                          {reg.studentId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-blue-700">
                          {reg.activityTitle}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">{reg.appliedDate}</td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={reg.status === 'Registered' ? 'success' : 'neutral'}
                            size="sm"
                            dot
                          >
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/faculty/students/${reg.studentId}`)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            View Student 360
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: PARTICIPATION */}
      {/* ==================================================== */}
      {activeTab === 'participation' && (
        <div className="space-y-6">
          {/* Participation Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Registered Students"
              value={summary.totalRegistrations}
              icon={<IconClipboardCheck className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-50 text-blue-600"
              helperText="Applications received across activities"
            />
            <StatCard
              title="Participated Students"
              value={summary.totalParticipated}
              icon={<IconUsers className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50 text-emerald-600"
              change="Verified Turnout"
              changeType="positive"
              helperText="Checked-in onsite attendance"
            />
            <StatCard
              title="Participation Rate"
              value={`${summary.overallParticipationRate}%`}
              icon={<IconTrendingUp className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-50 text-indigo-600"
              helperText="Participated / Registered × 100"
            />
          </div>

          {/* Business Rule Banner: Registered != Participated */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <IconAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">
                Strict Separation of Registration & Attendance
              </span>
              <p className="text-amber-800 leading-relaxed">
                Registration reserves a student&apos;s seat for an event; participation represents verified, on-site attendance. A student who registers does not automatically earn participation credit.
              </p>
            </div>
          </div>

          {/* 15. Activity Performance Table */}
          <Card
            title="Activity Performance"
            subtitle="Comparing application volume against verified on-site participation"
            padding="none"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Activity</th>
                    <th className="py-3 px-3 text-center">Registrations</th>
                    <th className="py-3 px-3 text-center">Capacity</th>
                    <th className="py-3 px-3 text-center">Participation</th>
                    <th className="py-3 px-4 text-center">Participation Rate</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {club.activities?.map((act) => {
                    const pRate =
                      act.registered > 0
                        ? Math.round((act.participated / act.registered) * 100)
                        : 0

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          {act.title}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {act.date} &bull; {act.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                          {act.registered}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                          {act.capacity}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-700">
                          {act.participated}
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-600 transition-all duration-300"
                                style={{ width: `${pRate}%` }}
                              />
                            </div>
                            <span className="font-bold text-emerald-700 text-[11px]">
                              {pRate}%
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
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: ANNOUNCEMENTS */}
      {/* ==================================================== */}
      {activeTab === 'announcements' && (
        <Card
          title="Club Announcements"
          subtitle="Broadcasts and communications published for club members"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAnnouncementModalOpen(true)}
              icon={<IconPlus className="w-3.5 h-3.5" />}
            >
              New Announcement
            </Button>
          }
        >
          {announcementsList.length === 0 ? (
            <EmptyState
              title="No announcements yet"
              description="No announcements have been published for this club."
              icon={<IconMail className="w-8 h-8 text-slate-400" />}
              actionText="Create First Announcement"
              onAction={() => setIsAnnouncementModalOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              {announcementsList.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                    <Badge variant="success" size="sm">
                      {ann.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {ann.preview}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>
                      Posted by <strong className="text-slate-600">{ann.postedBy}</strong>
                    </span>
                    <span>{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ==================================================== */}
      {/* TAB 7: RESOURCES */}
      {/* ==================================================== */}
      {activeTab === 'resources' && (
        <Card
          title="Club Resources & Documents"
          subtitle="Constitutions, guidelines, meeting notes, and event proposal templates"
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsResourceModalOpen(true)}
              icon={<IconPlus className="w-3.5 h-3.5" />}
            >
              Upload Resource
            </Button>
          }
        >
          {resourcesList.length === 0 ? (
            <EmptyState
              title="No resources available"
              description="No guidelines or documents have been uploaded for this club."
              icon={<IconClipboardCheck className="w-8 h-8 text-slate-400" />}
              actionText="Upload Document"
              onAction={() => setIsResourceModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resourcesList.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                      {res.type}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-xs truncate">
                        {res.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {res.size} &bull; Uploaded {res.uploadedDate} by {res.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      alert(`Downloading resource: ${res.name} (Simulated download).`)
                    }
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: Edit Club */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Club Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Club Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={editFormData.meetingSchedule}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        meetingSchedule: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Venue
                  </label>
                  <input
                    type="text"
                    value={editFormData.meetingVenue}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, meetingVenue: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mission / Purpose
                </label>
                <textarea
                  rows={2}
                  value={editFormData.mission}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, mission: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: Member Quick View */}
      {/* ==================================================== */}
      {selectedMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Member Details</h3>
              <button
                type="button"
                onClick={() => setSelectedMemberModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-base">
                  {selectedMemberModal.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {selectedMemberModal.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedMemberModal.studentId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Department
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedMemberModal.department}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Course & Year
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedMemberModal.course} &bull; {selectedMemberModal.academicYear}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Club Role
                  </span>
                  <Badge variant="primary" size="sm" className="mt-0.5">
                    {selectedMemberModal.role}
                  </Badge>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Status
                  </span>
                  <Badge variant="success" size="sm" dot className="mt-0.5">
                    {selectedMemberModal.status}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMemberModal(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const sid = selectedMemberModal.studentId
                    setSelectedMemberModal(null)
                    navigate(`/faculty/students/${sid}`)
                  }}
                  icon={<IconChevronRight className="w-3.5 h-3.5" />}
                >
                  View Student 360
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: New Announcement */}
      {/* ==================================================== */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Club Announcement</h3>
              <button
                type="button"
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  placeholder="e.g. Schedule Change for Weekly Meet"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={newAnnouncement.preview}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({ ...prev, preview: e.target.value }))
                  }
                  required
                  placeholder="Detailed announcement broadcast..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Publish Announcement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: Upload Resource */}
      {/* ==================================================== */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload Club Document</h3>
              <button
                type="button"
                onClick={() => setIsResourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) =>
                    setNewResource((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="e.g. Club Rules and Meeting Charter 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Format
                </label>
                <select
                  value={newResource.type}
                  onChange={(e) =>
                    setNewResource((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PDF">PDF Document (.pdf)</option>
                  <option value="DOCX">Word Document (.docx)</option>
                  <option value="XLSX">Spreadsheet (.xlsx)</option>
                </select>
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                <span className="block font-semibold text-slate-700 mb-0.5">
                  Select file or drag & drop here
                </span>
                <span className="text-[11px] text-slate-400">
                  Mock file selector (connects to Supabase Storage later)
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsResourceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Upload Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FacultyLayout>
  )
}
