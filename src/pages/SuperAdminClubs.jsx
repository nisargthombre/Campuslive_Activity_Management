import { useState, useMemo } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Modal from '../components/common/Modal'
import Dropdown from '../components/common/Dropdown'
import EmptyState from '../components/common/EmptyState'
import {
  IconClubs,
  IconUsers,
  IconCheck,
  IconClose,
  IconSearch,
  IconEye,
  IconEdit,
  IconAlertCircle,
  IconPlus,
} from '../components/icons/Icons'
import {
  superAdminClubsSummary,
  initialSuperAdminClubs,
} from '../data/superAdminClubsData'

export default function SuperAdminClubs() {
  // Main Clubs State (Local/Mock)
  const [clubs, setClubs] = useState(initialSuperAdminClubs)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Modals & Feedback State
  const [viewingClub, setViewingClub] = useState(null)
  const [editingClub, setEditingClub] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    name: '',
    description: '',
    category: 'Technical',
    department: 'Computer Engineering',
    coordinatorName: '',
    coordinatorEmail: '',
    eligibility: 'Open to all enrolled undergraduate & postgraduate students',
  })
  const [addErrors, setAddErrors] = useState({})

  const [actionNotice, setActionNotice] = useState(null)

  // Filter clubs using strict AND logic across all dimensions
  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // 1. Search Query (Name, Category, or Coordinator)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        club.name.toLowerCase().includes(q) ||
        club.category.toLowerCase().includes(q) ||
        club.coordinatorName.toLowerCase().includes(q)

      // 2. Category Filter
      const matchesCategory =
        categoryFilter === 'all' ||
        club.category.toLowerCase() === categoryFilter.toLowerCase()

      // 3. Status Filter (Active vs Inactive)
      const matchesStatus =
        statusFilter === 'all' ||
        club.status.toLowerCase() === statusFilter.toLowerCase()

      // 4. Department Filter
      const matchesDept =
        departmentFilter === 'all' ||
        club.department.toLowerCase() === departmentFilter.toLowerCase()

      return matchesSearch && matchesCategory && matchesStatus && matchesDept
    })
  }, [clubs, searchQuery, categoryFilter, statusFilter, departmentFilter])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    departmentFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setDepartmentFilter('all')
  }

  // Handle Toggle Status (Activate / Deactivate)
  const handleToggleStatus = (targetClub) => {
    const newStatus = targetClub.status === 'Active' ? 'Inactive' : 'Active'

    setClubs((prev) =>
      prev.map((c) => (c.id === targetClub.id ? { ...c, status: newStatus } : c))
    )

    if (viewingClub && viewingClub.id === targetClub.id) {
      setViewingClub((prev) => ({ ...prev, status: newStatus }))
    }

    setActionNotice(
      `Club "${targetClub.name}" has been ${
        newStatus === 'Active' ? 'activated' : 'deactivated'
      }.`
    )
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Open Edit Modal
  const handleOpenEdit = (club) => {
    setEditingClub(club)
    setEditFormData({
      name: club.name,
      description: club.description,
      category: club.category,
      department: club.department,
      coordinatorName: club.coordinatorName,
      coordinatorEmail: club.coordinatorEmail,
      eligibility: club.eligibility,
      status: club.status,
    })
    setEditErrors({})
  }

  // Save Edit Club
  const handleSaveEdit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!editFormData.name?.trim()) {
      errors.name = 'Club name is required'
    }
    if (!editFormData.description?.trim()) {
      errors.description = 'Club description is required'
    }
    if (!editFormData.coordinatorName?.trim()) {
      errors.coordinatorName = 'Coordinator name is required'
    }
    if (!editFormData.coordinatorEmail?.trim()) {
      errors.coordinatorEmail = 'Coordinator email is required'
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editFormData.coordinatorEmail.trim())
    ) {
      errors.coordinatorEmail = 'Please enter a valid email address'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setClubs((prev) =>
      prev.map((c) =>
        c.id === editingClub.id
          ? {
              ...c,
              name: editFormData.name.trim(),
              description: editFormData.description.trim(),
              category: editFormData.category,
              department: editFormData.department,
              coordinatorName: editFormData.coordinatorName.trim(),
              coordinatorEmail: editFormData.coordinatorEmail.trim().toLowerCase(),
              eligibility: editFormData.eligibility?.trim() || c.eligibility,
              status: editFormData.status,
            }
          : c
      )
    )

    if (viewingClub && viewingClub.id === editingClub.id) {
      setViewingClub((prev) => ({
        ...prev,
        ...editFormData,
      }))
    }

    setActionNotice(`Club details for "${editFormData.name.trim()}" updated successfully.`)
    setEditingClub(null)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Open Add Club Modal
  const handleOpenAdd = () => {
    setIsAddModalOpen(true)
    setAddFormData({
      name: '',
      description: '',
      category: 'Technical',
      department: 'Computer Engineering',
      coordinatorName: '',
      coordinatorEmail: '',
      eligibility: 'Open to all enrolled undergraduate & postgraduate students',
    })
    setAddErrors({})
  }

  // Save New Club
  const handleCreateClub = (e) => {
    e.preventDefault()
    const errors = {}

    if (!addFormData.name?.trim()) {
      errors.name = 'Club name is required'
    }
    if (!addFormData.description?.trim()) {
      errors.description = 'Club description is required'
    }
    if (!addFormData.coordinatorName?.trim()) {
      errors.coordinatorName = 'Coordinator name is required'
    }
    if (!addFormData.coordinatorEmail?.trim()) {
      errors.coordinatorEmail = 'Coordinator email is required'
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(addFormData.coordinatorEmail.trim())
    ) {
      errors.coordinatorEmail = 'Please enter a valid email address'
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors)
      return
    }

    const initials = addFormData.name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

    const newClub = {
      id: `club-${Date.now()}`,
      name: addFormData.name.trim(),
      description: addFormData.description.trim(),
      category: addFormData.category,
      department: addFormData.department,
      coordinatorName: addFormData.coordinatorName.trim(),
      coordinatorEmail: addFormData.coordinatorEmail.trim().toLowerCase(),
      eligibility: addFormData.eligibility.trim(),
      membersCount: 0,
      activeMembersCount: 0,
      recentMembersCount: 0,
      status: 'Active',
      createdDate: 'Today',
      avatarText: initials || 'CL',
      gradient: 'from-blue-600 to-indigo-600',
    }

    setClubs((prev) => [newClub, ...prev])
    setIsAddModalOpen(false)
    setActionNotice('Club created successfully.')
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Category badge helper
  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case 'Technical':
        return 'primary'
      case 'Cultural':
        return 'danger'
      case 'Sports':
        return 'success'
      case 'Social':
        return 'warning'
      case 'Academic':
        return 'info'
      default:
        return 'neutral'
    }
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Clubs Management"
        subtitle="Manage campus clubs, coordinators, memberships, and club status."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Clubs' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
            <Button
              variant="primary"
              size="sm"
              icon={<IconPlus className="w-4 h-4" />}
              onClick={handleOpenAdd}
            >
              Add Club
            </Button>
          </div>
        }
      />

      {/* Action Notification Toast / Banner */}
      {actionNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer p-1"
            aria-label="Dismiss notice"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUMMARY METRIC CARDS                                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Clubs"
          value={superAdminClubsSummary.totalClubs}
          icon={<IconClubs className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All registered campus societies"
        />
        <StatCard
          title="Active Clubs"
          value={superAdminClubsSummary.activeClubs}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Chapters in active standing"
        />
        <StatCard
          title="Inactive Clubs"
          value={superAdminClubsSummary.inactiveClubs}
          icon={<IconAlertCircle className="w-5 h-5 text-slate-500" />}
          iconBg="bg-slate-100 text-slate-600"
          helperText="Archived or suspended chapters"
        />
        <StatCard
          title="Total Members"
          value={superAdminClubsSummary.totalMembers.toLocaleString()}
          icon={<IconUsers className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Enrolled student club members"
        />
      </div>

      {/* ============================================================== */}
      {/* 3. SEARCH AND FILTERS TOOLBAR                                  */}
      {/* ============================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs by name, category, or coordinator..."
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <IconClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Social">Social</option>
              <option value="Academic">Academic</option>
              <option value="Other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Filter status row & Clear Filters button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredClubs.length}</strong> of{' '}
            {clubs.length} clubs
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1"
            >
              <IconClose className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. CLUBS TABLE & EMPTY STATE                                   */}
      {/* ============================================================== */}
      {filteredClubs.length === 0 ? (
        <EmptyState
          title="No clubs found"
          description="Try changing your search or filter criteria."
          icon={<IconClubs className="w-6 h-6 text-slate-400" />}
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Club
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Category
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Coordinator
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Department
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Members
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClubs.map((club) => (
                <tr
                  key={club.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* Column 1: Club (Logo, Name, Description) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 bg-gradient-to-br ${club.gradient || 'from-blue-600 to-indigo-600'}`}
                      >
                        {club.avatarText || 'CL'}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {club.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {club.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={getCategoryBadgeVariant(club.category)}
                      size="sm"
                    >
                      {club.category}
                    </Badge>
                  </td>

                  {/* Column 3: Coordinator */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs font-medium text-slate-900">
                      {club.coordinatorName}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {club.coordinatorEmail}
                    </div>
                  </td>

                  {/* Column 4: Department */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-medium">
                    {club.department}
                  </td>

                  {/* Column 5: Members */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {club.membersCount}
                    </span>
                  </td>

                  {/* Column 6: Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={club.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {club.status}
                    </Badge>
                  </td>

                  {/* Column 7: Created Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {club.createdDate}
                  </td>

                  {/* Column 8: Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          aria-label="Open club actions"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01"
                            />
                          </svg>
                        </button>
                      }
                      items={[
                        {
                          label: 'View Details',
                          icon: <IconEye className="w-4 h-4" />,
                          onClick: () => setViewingClub(club),
                        },
                        {
                          label: 'Edit Club',
                          icon: <IconEdit className="w-4 h-4" />,
                          onClick: () => handleOpenEdit(club),
                        },
                        {
                          label:
                            club.status === 'Active'
                              ? 'Deactivate'
                              : 'Activate',
                          icon: <IconAlertCircle className="w-4 h-4" />,
                          onClick: () => handleToggleStatus(club),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. VIEW CLUB DETAILS MODAL                                     */}
      {/* ============================================================== */}
      {viewingClub && (
        <Modal
          isOpen={Boolean(viewingClub)}
          onClose={() => setViewingClub(null)}
          title="Club Details"
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = viewingClub
                  setViewingClub(null)
                  handleOpenEdit(target)
                }}
              >
                Edit Club
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingClub(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-6 text-sm">
            {/* Header info banner */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-base text-white shrink-0 bg-gradient-to-br ${viewingClub.gradient || 'from-blue-600 to-indigo-600'}`}
              >
                {viewingClub.avatarText || 'CL'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={getCategoryBadgeVariant(viewingClub.category)}
                    size="xs"
                  >
                    {viewingClub.category}
                  </Badge>
                  <Badge
                    variant={viewingClub.status === 'Active' ? 'success' : 'neutral'}
                    size="xs"
                    dot
                  >
                    {viewingClub.status}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {viewingClub.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {viewingClub.description}
                </p>
              </div>
            </div>

            {/* Membership Overview Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Membership Overview
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {viewingClub.membersCount > 0
                    ? `${Math.round(
                        (viewingClub.activeMembersCount /
                          viewingClub.membersCount) *
                          100
                      )}% active ratio`
                    : 'No members yet'}
                </span>
              </div>

              {/* Stat breakdown pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Total Members
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {viewingClub.membersCount}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Active Members
                  </span>
                  <span className="text-lg font-bold text-emerald-600">
                    {viewingClub.activeMembersCount}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                    Recent Members
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {viewingClub.recentMembersCount} this month
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <IconAlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Club membership and activity participation are separate concepts. Membership does not guarantee event attendance.
                </span>
              </p>
            </div>

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Academic Department
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingClub.department}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Created Date
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingClub.createdDate}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Faculty / Staff Coordinator
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingClub.coordinatorName}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Coordinator Contact Email
                </span>
                <span className="text-slate-800 font-medium break-all">
                  {viewingClub.coordinatorEmail}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Membership Eligibility
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingClub.eligibility}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. EDIT CLUB MODAL                                             */}
      {/* ============================================================== */}
      {editingClub && (
        <Modal
          isOpen={Boolean(editingClub)}
          onClose={() => setEditingClub(null)}
          title="Edit Club"
          size="xl"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingClub(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Club Name */}
            <Input
              label="Club Name"
              id="edit-club-name"
              name="name"
              value={editFormData.name || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={editErrors.name}
              required
            />

            {/* Description */}
            <div className="space-y-1">
              <label
                htmlFor="edit-club-description"
                className="block text-xs font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="edit-club-description"
                rows={3}
                value={editFormData.description || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
              />
              {editErrors.description && (
                <p className="text-xs text-rose-600">{editErrors.description}</p>
              )}
            </div>

            {/* Row: Category & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Category"
                id="edit-club-category"
                name="category"
                value={editFormData.category || 'Technical'}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                options={[
                  'Technical',
                  'Cultural',
                  'Sports',
                  'Social',
                  'Academic',
                  'Other',
                ]}
                required
              />

              <Select
                label="Department"
                id="edit-club-department"
                name="department"
                value={editFormData.department || 'Computer Engineering'}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                options={[
                  'Computer Engineering',
                  'Information Technology',
                  'Mechanical Engineering',
                  'Civil Engineering',
                  'Other',
                ]}
                required
              />
            </div>

            {/* Row: Coordinator Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Faculty Coordinator"
                id="edit-club-coordinator-name"
                name="coordinatorName"
                value={editFormData.coordinatorName || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    coordinatorName: e.target.value,
                  }))
                }
                error={editErrors.coordinatorName}
                required
              />

              <Input
                label="Coordinator Email"
                id="edit-club-coordinator-email"
                name="coordinatorEmail"
                type="email"
                value={editFormData.coordinatorEmail || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    coordinatorEmail: e.target.value,
                  }))
                }
                error={editErrors.coordinatorEmail}
                required
              />
            </div>

            {/* Row: Eligibility & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Membership Eligibility"
                id="edit-club-eligibility"
                name="eligibility"
                value={editFormData.eligibility || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    eligibility: e.target.value,
                  }))
                }
              />

              <Select
                label="Club Status"
                id="edit-club-status"
                name="status"
                value={editFormData.status || 'Active'}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                options={['Active', 'Inactive']}
                required
              />
            </div>

            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 7. + ADD CLUB MODAL                                            */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Club Charter"
          size="xl"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateClub}
              >
                Create Club
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateClub} className="space-y-4">
            <p className="text-xs text-slate-500">
              Provision and register a new recognized student club or society under university governance.
            </p>

            {/* Club Name */}
            <Input
              label="Club Name"
              id="add-club-name"
              name="name"
              placeholder="e.g. Artificial Intelligence Research Guild"
              value={addFormData.name}
              onChange={(e) =>
                setAddFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={addErrors.name}
              required
            />

            {/* Description */}
            <div className="space-y-1">
              <label
                htmlFor="add-club-description"
                className="block text-xs font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="add-club-description"
                rows={3}
                placeholder="State the core mission, meeting cadence, and focus areas of this society..."
                value={addFormData.description}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-colors"
              />
              {addErrors.description && (
                <p className="text-xs text-rose-600">{addErrors.description}</p>
              )}
            </div>

            {/* Row: Category & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Category"
                id="add-club-category"
                name="category"
                value={addFormData.category}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                options={[
                  'Technical',
                  'Cultural',
                  'Sports',
                  'Social',
                  'Academic',
                  'Other',
                ]}
                required
              />

              <Select
                label="Department"
                id="add-club-department"
                name="department"
                value={addFormData.department}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                options={[
                  'Computer Engineering',
                  'Information Technology',
                  'Mechanical Engineering',
                  'Civil Engineering',
                  'Other',
                ]}
                required
              />
            </div>

            {/* Row: Coordinator Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Faculty Coordinator"
                id="add-club-coordinator-name"
                name="coordinatorName"
                placeholder="e.g. Dr. Rajesh Kumar"
                value={addFormData.coordinatorName}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    coordinatorName: e.target.value,
                  }))
                }
                error={addErrors.coordinatorName}
                required
              />

              <Input
                label="Coordinator Email"
                id="add-club-coordinator-email"
                name="coordinatorEmail"
                type="email"
                placeholder="e.g. r.kumar@campuslive.edu"
                value={addFormData.coordinatorEmail}
                onChange={(e) =>
                  setAddFormData((prev) => ({
                    ...prev,
                    coordinatorEmail: e.target.value,
                  }))
                }
                error={addErrors.coordinatorEmail}
                required
              />
            </div>

            {/* Row: Eligibility */}
            <Input
              label="Membership Eligibility"
              id="add-club-eligibility"
              name="eligibility"
              placeholder="e.g. Open to all students with interest in machine learning"
              value={addFormData.eligibility}
              onChange={(e) =>
                setAddFormData((prev) => ({
                  ...prev,
                  eligibility: e.target.value,
                }))
              }
            />

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                New clubs are provisioned in Active status under university governance and made discoverable to students immediately.
              </span>
            </div>

            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
