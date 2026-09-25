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
  IconUsers,
  IconUser,
  IconClipboardCheck,
  IconCheck,
  IconSearch,
  IconEye,
  IconEdit,
  IconAlertCircle,
  IconClose,
} from '../components/icons/Icons'
import {
  superAdminUsersSummary,
  initialSuperAdminUsers,
} from '../data/superAdminUsersData'

export default function SuperAdminUsers() {
  // Main Users State (Local/Mock)
  const [users, setUsers] = useState(initialSuperAdminUsers)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Modals State
  const [viewingUser, setViewingUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [actionNotice, setActionNotice] = useState(null)

  // Filter users using AND logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)

      // 2. Role Filter
      const matchesRole =
        roleFilter === 'all' ||
        u.role.toLowerCase() === roleFilter.toLowerCase()

      // 3. Status Filter
      const matchesStatus =
        statusFilter === 'all' ||
        u.status.toLowerCase() === statusFilter.toLowerCase()

      // 4. Department Filter
      const matchesDept =
        departmentFilter === 'all' ||
        u.department.toLowerCase() === departmentFilter.toLowerCase()

      return matchesSearch && matchesRole && matchesStatus && matchesDept
    })
  }, [users, searchQuery, roleFilter, statusFilter, departmentFilter])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    roleFilter !== 'all' ||
    statusFilter !== 'all' ||
    departmentFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilter('all')
    setStatusFilter('all')
    setDepartmentFilter('all')
  }

  // Handle Activate / Deactivate
  const handleToggleStatus = (targetUser) => {
    const newStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active'
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
    )
    if (viewingUser && viewingUser.id === targetUser.id) {
      setViewingUser((prev) => ({ ...prev, status: newStatus }))
    }
    setActionNotice(
      `Account for ${targetUser.name} has been ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`
    )
    setTimeout(() => setActionNotice(null), 3500)
  }

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      course: user.course || '',
      year: user.year || '',
      designation: user.designation || '',
      phone: user.phone || '',
    })
    setEditErrors({})
  }

  // Validate & Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!editFormData.name?.trim()) {
      errors.name = 'Full name is required.'
    }
    if (!editFormData.email?.trim()) {
      errors.email = 'Email address is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editFormData.email.trim())) {
        errors.email = 'Please enter a valid email address.'
      }
    }
    if (!editFormData.department) {
      errors.department = 'Department is required.'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id ? { ...u, ...editFormData } : u
      )
    )

    if (viewingUser && viewingUser.id === editingUser.id) {
      setViewingUser((prev) => ({ ...prev, ...editFormData }))
    }

    setActionNotice(`User profile for ${editFormData.name} has been updated.`)
    setTimeout(() => setActionNotice(null), 3500)
    setEditingUser(null)
  }

  // Role Badge Variant Helper
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'danger'
      case 'Admin':
        return 'secondary'
      case 'Student':
      default:
        return 'primary'
    }
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="User Management"
        subtitle="Manage student, admin, and system user accounts across Campus Live."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Users' },
        ]}
        actions={
          <Badge variant="danger" dot>
            Super Admin Active
          </Badge>
        }
      />

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
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
          title="Total Users"
          value={superAdminUsersSummary.totalUsers}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All registered system accounts"
        />
        <StatCard
          title="Students"
          value={superAdminUsersSummary.totalStudents}
          icon={<IconUser className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Undergraduate & graduate scholars"
        />
        <StatCard
          title="Admin / Staff"
          value={superAdminUsersSummary.totalStaff}
          icon={<IconClipboardCheck className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Faculty coordinators & mentors"
        />
        <StatCard
          title="Active Users"
          value={superAdminUsersSummary.activeUsers}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Verified accounts in good standing"
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
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="col-span-2 sm:col-span-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs shrink-0 self-end lg:self-center"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{filteredUsers.length}</strong> of{' '}
            <strong className="text-slate-800">{users.length}</strong> users
          </span>
          {hasActiveFilters && (
            <span className="text-blue-600 font-medium">Filters active</span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. USER TABLE & EMPTY STATE                                    */}
      {/* ============================================================== */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try changing your search or filter criteria."
          icon={<IconUsers className="w-6 h-6 text-slate-400" />}
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  User
                </th>
                <th scope="col" className="px-6 py-3.5">
                  User ID
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Role
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Department
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Joined Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* Column 1: User (Avatar + Name + Email) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ring-1 ring-white shrink-0 ${
                          user.role === 'Super Admin'
                            ? 'bg-rose-100 text-rose-700'
                            : user.role === 'Admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.avatar || user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: User ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {user.id}
                    </span>
                  </td>

                  {/* Column 3: Role */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                      {user.role}
                    </Badge>
                  </td>

                  {/* Column 4: Department */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                    {user.department}
                  </td>

                  {/* Column 5: Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={user.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {user.status}
                    </Badge>
                  </td>

                  {/* Column 6: Joined Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {user.joinedDate}
                  </td>

                  {/* Column 7: Actions Menu */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          aria-label={`Actions for ${user.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                      }
                      items={[
                        {
                          label: 'View Profile',
                          icon: <IconEye className="w-4 h-4 text-slate-500" />,
                          onClick: () => setViewingUser(user),
                        },
                        {
                          label: 'Edit User',
                          icon: <IconEdit className="w-4 h-4 text-blue-600" />,
                          onClick: () => handleOpenEdit(user),
                        },
                        { divider: true },
                        {
                          label:
                            user.status === 'Active'
                              ? 'Deactivate Account'
                              : 'Activate Account',
                          danger: user.status === 'Active',
                          icon: (
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                user.status === 'Active'
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          ),
                          onClick: () => handleToggleStatus(user),
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
      {/* 5. VIEW PROFILE MODAL                                          */}
      {/* ============================================================== */}
      {viewingUser && (
        <Modal
          isOpen={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          title="User Details"
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant={viewingUser.status === 'Active' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleToggleStatus(viewingUser)}
              >
                {viewingUser.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const target = viewingUser
                    setViewingUser(null)
                    handleOpenEdit(target)
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewingUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Header Profile Badge Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-2xs shrink-0 ${
                  viewingUser.role === 'Super Admin'
                    ? 'bg-rose-100 text-rose-700'
                    : viewingUser.role === 'Admin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {viewingUser.avatar || viewingUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {viewingUser.name}
                  </h4>
                  <Badge variant={getRoleBadgeVariant(viewingUser.role)} size="sm">
                    {viewingUser.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {viewingUser.email}
                </p>
              </div>
            </div>

            {/* Profile Attributes Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">User ID</span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {viewingUser.id}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Account Status</span>
                <Badge
                  variant={viewingUser.status === 'Active' ? 'success' : 'neutral'}
                  size="sm"
                  dot
                >
                  {viewingUser.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">
                  {viewingUser.department}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Joined Date</span>
                <span className="font-semibold text-slate-800">
                  {viewingUser.joinedDate}
                </span>
              </div>

              {/* Student-specific Fields */}
              {viewingUser.role === 'Student' && (
                <>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-medium">Enrolled Course</span>
                    <span className="font-semibold text-slate-800">
                      {viewingUser.course || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 block font-medium">Academic Year</span>
                    <span className="font-semibold text-slate-800">
                      {viewingUser.year || 'N/A'}
                    </span>
                  </div>
                </>
              )}

              {/* Admin / Staff-specific Fields */}
              {viewingUser.role === 'Admin' && (
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 block font-medium">Designation & Role</span>
                  <span className="font-semibold text-slate-800">
                    {viewingUser.designation || 'Faculty Coordinator'}
                  </span>
                </div>
              )}

              {/* Super Admin-specific Fields */}
              {viewingUser.role === 'Super Admin' && (
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 block font-medium">Governance Portfolio</span>
                  <span className="font-semibold text-slate-800">
                    {viewingUser.designation || 'System Administrator & Registrar'}
                  </span>
                </div>
              )}

              {viewingUser.phone && (
                <div className="col-span-2 space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block font-medium">Contact Phone</span>
                  <span className="font-semibold text-slate-800">
                    {viewingUser.phone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. EDIT USER MODAL                                             */}
      {/* ============================================================== */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.name}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} noValidate className="space-y-4">
            {/* Full Name Field */}
            <Input
              label="Full Name"
              id="edit-user-name"
              name="name"
              value={editFormData.name || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={editErrors.name}
              required
            />

            {/* Email Field */}
            <Input
              label="Email Address"
              id="edit-user-email"
              name="email"
              type="email"
              value={editFormData.email || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              error={editErrors.email}
              required
            />

            {/* Department Field */}
            <Select
              label="Department"
              id="edit-user-department"
              name="department"
              value={editFormData.department || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, department: e.target.value }))
              }
              options={[
                'Computer Engineering',
                'Information Technology',
                'Mechanical Engineering',
                'Civil Engineering',
                'Other',
              ]}
              error={editErrors.department}
              required
            />

            {/* Student Specific Fields */}
            {editingUser.role === 'Student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Course / Program"
                  id="edit-user-course"
                  name="course"
                  value={editFormData.course || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, course: e.target.value }))
                  }
                  placeholder="e.g. B.Tech Computer Engineering"
                />

                <Select
                  label="Academic Year"
                  id="edit-user-year"
                  name="year"
                  value={editFormData.year || ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, year: e.target.value }))
                  }
                  options={['1st Year', '2nd Year', '3rd Year', '4th Year']}
                />
              </div>
            )}

            {/* Admin/Staff Specific Fields */}
            {(editingUser.role === 'Admin' || editingUser.role === 'Super Admin') && (
              <Input
                label="Designation / Title"
                id="edit-user-designation"
                name="designation"
                value={editFormData.designation || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    designation: e.target.value,
                  }))
                }
                placeholder="e.g. Associate Professor & Coordinator"
              />
            )}

            {/* Contact Phone */}
            <Input
              label="Phone Number (Optional)"
              id="edit-user-phone"
              name="phone"
              type="tel"
              value={editFormData.phone || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="e.g. +91 98765 43210"
            />

            {/* Security Guard Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Passwords, credential secrets, and role tier permissions are protected under system governance and cannot be modified here.
              </span>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
