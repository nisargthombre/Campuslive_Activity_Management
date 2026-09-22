import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import {
  IconClubs,
  IconUsers,
  IconCalendar,
  IconActivity,
  IconSearch,
  IconFilter,
  IconPlus,
  IconCheck,
  IconClose,
  IconEdit,
} from '../components/icons/Icons'
import {
  getAllClubs,
  clubCategories,
  clubStatuses,
} from '../data/facultyClubsData'

export default function FacultyClubs() {
  const navigate = useNavigate()
  const [clubsList, setClubsList] = useState(getAllClubs)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCoordinator, setSelectedCoordinator] = useState('All')

  // Create Club Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newClubForm, setNewClubForm] = useState({
    name: '',
    category: 'Technical',
    status: 'Active',
    coordinatorName: '',
    coordinatorDept: '',
    description: '',
    meetingSchedule: '',
    meetingVenue: '',
  })

  // Edit Modal State
  const [editingClub, setEditingClub] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    status: '',
    description: '',
    coordinatorName: '',
    coordinatorDept: '',
    meetingSchedule: '',
    meetingVenue: '',
  })

  const [successNotice, setSuccessNotice] = useState(null)

  // Dynamic Coordinators List
  const coordinatorsList = useMemo(() => {
    const coords = clubsList.map((c) => c.facultyCoordinator?.name).filter(Boolean)
    return ['All', ...Array.from(new Set(coords))]
  }, [clubsList])

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalClubs = clubsList.length
    const activeClubs = clubsList.filter((c) => c.status === 'Active').length
    const totalMembers = clubsList.reduce((sum, c) => sum + (c.members?.length || 0), 0)
    const totalActivities = clubsList.reduce(
      (sum, c) => sum + (c.activities?.length || 0),
      0
    )
    return { totalClubs, activeClubs, totalMembers, totalActivities }
  }, [clubsList])

  // Real-time Filtering
  const filteredClubs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    return clubsList.filter((club) => {
      // 1. Search Query
      if (q) {
        const nameMatch = club.name?.toLowerCase().includes(q)
        const catMatch = club.category?.toLowerCase().includes(q)
        const coordMatch = club.facultyCoordinator?.name?.toLowerCase().includes(q)
        const descMatch = club.description?.toLowerCase().includes(q)
        if (!nameMatch && !catMatch && !coordMatch && !descMatch) {
          return false
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'All' && club.category !== selectedCategory) {
        return false
      }

      // 3. Status Filter
      if (selectedStatus !== 'All' && club.status !== selectedStatus) {
        return false
      }

      // 4. Coordinator Filter
      if (
        selectedCoordinator !== 'All' &&
        club.facultyCoordinator?.name !== selectedCoordinator
      ) {
        return false
      }

      return true
    })
  }, [clubsList, searchQuery, selectedCategory, selectedStatus, selectedCoordinator])

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedStatus !== 'All' ||
    selectedCoordinator !== 'All'

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedStatus('All')
    setSelectedCoordinator('All')
  }

  // Create Club Handler
  const handleCreateClubSubmit = (e) => {
    e.preventDefault()
    if (!newClubForm.name.trim()) return

    const id = newClubForm.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `club-${Date.now()}`

    const initials =
      newClubForm.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CL'

    const createdClub = {
      id,
      name: newClubForm.name,
      category: newClubForm.category,
      status: newClubForm.status,
      description: newClubForm.description,
      meetingSchedule: newClubForm.meetingSchedule || 'Not scheduled',
      meetingVenue: newClubForm.meetingVenue || 'TBD',
      avatarText: initials,
      gradient: 'from-blue-600 to-indigo-600',
      facultyCoordinator: {
        name: newClubForm.coordinatorName || 'Faculty Coordinator',
        department: newClubForm.coordinatorDept || 'Academic Affairs',
        email: 'faculty@campus.edu',
        contact: '+91 98765 43210',
        since: '2026',
        avatar: initials,
      },
      members: [],
      activities: [],
    }

    setClubsList((prev) => [createdClub, ...prev])
    setIsCreateModalOpen(false)
    setNewClubForm({
      name: '',
      category: 'Technical',
      status: 'Active',
      coordinatorName: '',
      coordinatorDept: '',
      description: '',
      meetingSchedule: '',
      meetingVenue: '',
    })

    setSuccessNotice(`Club "${createdClub.name}" has been created successfully.`)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  // Open Edit Modal
  const handleOpenEdit = (club, e) => {
    e.stopPropagation()
    setEditingClub(club)
    setEditFormData({
      name: club.name,
      category: club.category,
      status: club.status,
      description: club.description || '',
      coordinatorName: club.facultyCoordinator?.name || '',
      coordinatorDept: club.facultyCoordinator?.department || '',
      meetingSchedule: club.meetingSchedule || '',
      meetingVenue: club.meetingVenue || '',
    })
  }

  // Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingClub) return

    setClubsList((prev) =>
      prev.map((c) =>
        c.id === editingClub.id
          ? {
              ...c,
              name: editFormData.name,
              category: editFormData.category,
              status: editFormData.status,
              description: editFormData.description,
              facultyCoordinator: {
                ...c.facultyCoordinator,
                name: editFormData.coordinatorName || c.facultyCoordinator?.name,
                department: editFormData.coordinatorDept || c.facultyCoordinator?.department,
              },
              meetingSchedule: editFormData.meetingSchedule,
              meetingVenue: editFormData.meetingVenue,
            }
          : c
      )
    )

    setSuccessNotice(`Updated details for "${editFormData.name}" successfully.`)
    setEditingClub(null)
    setTimeout(() => setSuccessNotice(null), 4000)
  }

  return (
    <FacultyLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Clubs"
        subtitle="Manage campus clubs, members, coordinators, and club activities."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Clubs' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={<IconPlus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-xs font-semibold"
            >
              + Create Club
            </Button>
          </div>
        }
      />

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Summary Cards */}
      <section
        aria-label="Clubs Summary Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8"
      >
        <StatCard
          title="Total Clubs"
          value={summaryMetrics.totalClubs}
          icon={<IconClubs className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="Recognized student organizations"
        />
        <StatCard
          title="Active Clubs"
          value={summaryMetrics.activeClubs}
          icon={<IconActivity className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Operational"
          changeType="positive"
          helperText="Actively hosting campus programs"
        />
        <StatCard
          title="Total Club Members"
          value={summaryMetrics.totalMembers}
          icon={<IconUsers className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Enrolled student memberships"
        />
        <StatCard
          title="Total Club Activities"
          value={summaryMetrics.totalActivities}
          icon={<IconCalendar className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Workshops, competitions & events"
        />
      </section>

      {/* 3. Search and Multi-Filter Area */}
      <Card className="mb-6" padding="sm">
        <div className="space-y-4">
          {/* Search Row */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <IconClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {clubCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {clubStatuses.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinator Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Faculty Coordinator
              </label>
              <select
                value={selectedCoordinator}
                onChange={(e) => setSelectedCoordinator(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer truncate"
              >
                {coordinatorsList.map((coord) => (
                  <option key={coord} value={coord}>
                    {coord === 'All' ? 'All Coordinators' : coord}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant={isFiltered ? 'outline' : 'ghost'}
                size="sm"
                onClick={handleClearFilters}
                disabled={!isFiltered}
                icon={<IconFilter className="w-3.5 h-3.5" />}
                className="w-full justify-center text-xs"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Results Count Bar */}
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900 font-semibold">{filteredClubs.length}</strong> of{' '}
              <strong className="text-slate-900 font-semibold">{clubsList.length}</strong> clubs
            </span>
            {isFiltered && (
              <span className="text-[11px] text-blue-600 font-medium">
                Active filters applied
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Clubs Responsive Grid */}
      {filteredClubs.length === 0 ? (
        <EmptyState
          title="No clubs found"
          description="No campus clubs match your current search or filter criteria."
          icon={<IconClubs className="w-8 h-8 text-slate-400" />}
          actionText="Clear All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredClubs.map((club) => {
            const totalMembers = club.members?.length || 0
            const totalActivities = club.activities?.length || 0
            const latestOrUpcomingActivity =
              club.activities?.find((a) => a.status === 'Upcoming') ||
              club.activities?.[0]

            return (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Club Logo, Name & Badges */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 bg-gradient-to-br ${
                          club.gradient || 'from-blue-600 to-indigo-600'
                        }`}
                      >
                        {club.avatarText || 'CL'}
                      </div>
                      <div className="min-w-0">
                        <h3
                          onClick={() => navigate(`/faculty/clubs/${club.id}`)}
                          className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate cursor-pointer leading-snug"
                        >
                          {club.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
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
                        </div>
                      </div>
                    </div>

                    {/* Edit Shortcut Button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(club, e)}
                      title="Edit Club"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                    {club.description}
                  </p>

                  {/* Faculty Coordinator Info */}
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs mb-3.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Faculty Coordinator
                    </span>
                    <span className="font-bold text-slate-800 block truncate">
                      {club.facultyCoordinator?.name || 'Faculty Advisor'}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {club.facultyCoordinator?.department || 'University Faculty'}
                    </span>
                  </div>

                  {/* Member & Activity Counter Strip */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/60 rounded-xl border border-slate-100 mb-3.5 text-center">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block font-mono">
                        {totalMembers}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Members</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-blue-600 block font-mono">
                        {totalActivities}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">Activities</span>
                    </div>
                  </div>

                  {/* Latest/Upcoming Activity Preview */}
                  {latestOrUpcomingActivity ? (
                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-600 mb-4 flex items-center gap-2">
                      <IconCalendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 block">
                          {latestOrUpcomingActivity.status === 'Upcoming'
                            ? 'Upcoming Activity'
                            : 'Latest Activity'}
                        </span>
                        <span className="font-medium text-slate-800 truncate block">
                          {latestOrUpcomingActivity.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {latestOrUpcomingActivity.date}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 text-xs text-slate-400 mb-4 text-center">
                      No activities recorded yet
                    </div>
                  )}
                </div>

                {/* Card Dual Actions: [View Club] [View Members] */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="justify-center text-xs"
                    onClick={() => navigate(`/faculty/clubs/${club.id}`)}
                  >
                    View Club
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-center text-xs"
                    onClick={() => navigate(`/faculty/clubs/${club.id}?tab=members`)}
                  >
                    View Members
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 5. Create Club Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Club</h3>
                <p className="text-xs text-slate-500">
                  Register a student club or society on Campus Live
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClubSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  value={newClubForm.name}
                  onChange={(e) =>
                    setNewClubForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  placeholder="e.g. Robotics & AI Club"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={newClubForm.category}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {clubCategories
                      .filter((c) => c !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={newClubForm.status}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={newClubForm.coordinatorName}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({
                        ...prev,
                        coordinatorName: e.target.value,
                      }))
                    }
                    placeholder="Dr. Coordinator Name"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coordinator Dept.
                  </label>
                  <input
                    type="text"
                    value={newClubForm.coordinatorDept}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({
                        ...prev,
                        coordinatorDept: e.target.value,
                      }))
                    }
                    placeholder="Dept. of Computer Science"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={newClubForm.description}
                  onChange={(e) =>
                    setNewClubForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  placeholder="Short summary of club objectives and student activities..."
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
                    value={newClubForm.meetingSchedule}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({
                        ...prev,
                        meetingSchedule: e.target.value,
                      }))
                    }
                    placeholder="e.g. Fridays at 5:00 PM"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meeting Venue
                  </label>
                  <input
                    type="text"
                    value={newClubForm.meetingVenue}
                    onChange={(e) =>
                      setNewClubForm((prev) => ({
                        ...prev,
                        meetingVenue: e.target.value,
                      }))
                    }
                    placeholder="e.g. Tech Annex Lab 3"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create Club
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Club Modal */}
      {editingClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Club Details</h3>
                <p className="text-xs text-slate-500">{editingClub.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClub(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
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
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {clubCategories
                      .filter((c) => c !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.coordinatorName}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        coordinatorName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coordinator Dept.
                  </label>
                  <input
                    type="text"
                    value={editFormData.coordinatorDept}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        coordinatorDept: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description
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
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingClub(null)}
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
    </FacultyLayout>
  )
}
