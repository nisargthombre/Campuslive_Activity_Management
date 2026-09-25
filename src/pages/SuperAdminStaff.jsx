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
import PasswordInput from '../components/common/PasswordInput'
import {
  IconUsers,
  IconCheck,
  IconClose,
  IconSearch,
  IconEye,
  IconEdit,
  IconAlertCircle,
  IconClubs,
  IconPlus,
} from '../components/icons/Icons'
import {
  superAdminStaffSummary,
  initialSuperAdminStaff,
} from '../data/superAdminStaffData'

export default function SuperAdminStaff() {
  // Main Staff State (Local/Mock)
  const [staffList, setStaffList] = useState(initialSuperAdminStaff)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  // Modals & Feedback State
  const [viewingStaff, setViewingStaff] = useState(null)
  const [editingStaff, setEditingStaff] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    staffId: '',
    department: 'Computer Engineering',
    role: 'Admin',
    password: '',
    confirmPassword: '',
  })
  const [createErrors, setCreateErrors] = useState({})

  const [actionNotice, setActionNotice] = useState(null)

  // Filter staff using strict AND logic across all dimensions
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      // 1. Search Query (Name, Email, or Staff ID)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.staffId.toLowerCase().includes(q)

      // 2. Department Filter
      const matchesDept =
        departmentFilter === 'all' ||
        item.department.toLowerCase() === departmentFilter.toLowerCase()

      // 3. Status Filter (Active vs Inactive)
      const matchesStatus =
        statusFilter === 'all' ||
        item.status.toLowerCase() === statusFilter.toLowerCase()

      // 4. Role Filter (Admin vs Staff)
      const matchesRole =
        roleFilter === 'all' ||
        item.role.toLowerCase() === roleFilter.toLowerCase()

      return matchesSearch && matchesDept && matchesStatus && matchesRole
    })
  }, [staffList, searchQuery, departmentFilter, statusFilter, roleFilter])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    departmentFilter !== 'all' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setDepartmentFilter('all')
    setStatusFilter('all')
    setRoleFilter('all')
  }

  // Handle Toggle Status (Activate / Deactivate)
  const handleToggleStatus = (targetStaff) => {
    const newStatus = targetStaff.status === 'Active' ? 'Inactive' : 'Active'

    setStaffList((prev) =>
      prev.map((s) => (s.id === targetStaff.id ? { ...s, status: newStatus } : s))
    )

    if (viewingStaff && viewingStaff.id === targetStaff.id) {
      setViewingStaff((prev) => ({ ...prev, status: newStatus }))
    }

    setActionNotice({
      type: 'success',
      message: `Account for ${targetStaff.name} has been ${
        newStatus === 'Active' ? 'activated' : 'deactivated'
      }.`,
    })
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Handle Open Edit Modal
  const handleOpenEdit = (staff) => {
    setEditingStaff(staff)
    setEditFormData({
      name: staff.name,
      email: staff.email,
      staffId: staff.staffId,
      department: staff.department,
      role: staff.role, // 'Admin' or 'Staff' only
    })
    setEditErrors({})
  }

  // Validate & Save Edit
  const handleSaveEdit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!editFormData.name?.trim()) {
      errors.name = 'Full name is required'
    }
    if (!editFormData.email?.trim()) {
      errors.email = 'Official email is required'
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(editFormData.email.trim())
    ) {
      errors.email = 'Please enter a valid email address'
    }
    if (!editFormData.staffId?.trim()) {
      errors.staffId = 'Staff ID is required'
    }
    if (!editFormData.department) {
      errors.department = 'Department is required'
    }
    if (!['Admin', 'Staff'].includes(editFormData.role)) {
      errors.role = 'Role must be Admin or Staff'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: editFormData.name.trim(),
              email: editFormData.email.trim(),
              staffId: editFormData.staffId.trim().toUpperCase(),
              department: editFormData.department,
              role: editFormData.role,
            }
          : s
      )
    )

    if (viewingStaff && viewingStaff.id === editingStaff.id) {
      setViewingStaff((prev) => ({
        ...prev,
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        staffId: editFormData.staffId.trim().toUpperCase(),
        department: editFormData.department,
        role: editFormData.role,
      }))
    }

    setActionNotice({
      type: 'success',
      message: `Staff record for ${editFormData.name.trim()} updated successfully.`,
    })
    setEditingStaff(null)
    setTimeout(() => setActionNotice(null), 4000)
  }

  // Handle Open Create Account Modal
  const handleOpenCreate = () => {
    setIsCreateModalOpen(true)
    setCreateFormData({
      name: '',
      email: '',
      staffId: `ADM-2026-0${Math.floor(10 + Math.random() * 89)}`,
      department: 'Computer Engineering',
      role: 'Admin',
      password: '',
      confirmPassword: '',
    })
    setCreateErrors({})
  }

  // Validate & Create Account
  const handleCreateAccount = (e) => {
    e.preventDefault()
    const errors = {}

    if (!createFormData.name?.trim()) {
      errors.name = 'Full name is required'
    }
    if (!createFormData.email?.trim()) {
      errors.email = 'Official college email is required'
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(createFormData.email.trim())
    ) {
      errors.email = 'Please enter a valid email address'
    }
    if (!createFormData.staffId?.trim()) {
      errors.staffId = 'Staff ID is required'
    }
    if (!createFormData.department) {
      errors.department = 'Department is required'
    }
    if (!['Admin', 'Staff'].includes(createFormData.role)) {
      errors.role = 'Role must be Admin or Staff'
    }
    if (!createFormData.password) {
      errors.password = 'Initial password is required'
    } else if (createFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!createFormData.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required'
    } else if (createFormData.password !== createFormData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }

    // New staff member record (password is NOT stored in visible mock state)
    const newStaffMember = {
      id: `STF-2026-${Math.floor(300 + Math.random() * 699)}`,
      name: createFormData.name.trim(),
      email: createFormData.email.trim().toLowerCase(),
      staffId: createFormData.staffId.trim().toUpperCase(),
      role: createFormData.role,
      department: createFormData.department,
      designation:
        createFormData.role === 'Admin'
          ? 'Department Activity Coordinator'
          : 'Support & Program Staff',
      phone: '+91 98000 00000',
      status: 'Active',
      createdDate: '23 Sep 2026',
    }

    setStaffList((prev) => [newStaffMember, ...prev])
    setIsCreateModalOpen(false)
    setActionNotice({
      type: 'success',
      message:
        'Admin/Staff account created successfully. Provide the login credentials to the staff member securely.',
    })
    setTimeout(() => setActionNotice(null), 5000)
  }

  // Avatar Initials Hash
  const getAvatarInitials = (name) => {
    if (!name) return 'ST'
    const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Admin / Staff Management"
        subtitle="Manage authorized staff accounts and administrative access across Campus Live."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Admin / Staff' },
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
              onClick={handleOpenCreate}
            >
              Create Admin / Staff Account
            </Button>
          </div>
        }
      />

      {/* Security Architecture Information Callout */}
      <div className="mb-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
        <IconAlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <span className="font-semibold text-blue-950">Administrative Security Policy: </span>
          Admin and Staff accounts are created by authorized Super Admins. Public self-registration is not available for administrative accounts.
        </div>
      </div>

      {/* Action Notification Toast / Banner */}
      {actionNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{actionNotice.message}</span>
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
          title="Total Admin / Staff"
          value={superAdminStaffSummary.totalStaff}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="All authorized institutional accounts"
        />
        <StatCard
          title="Active Admin / Staff"
          value={superAdminStaffSummary.activeStaff}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Accounts in active standing"
        />
        <StatCard
          title="Inactive Admin / Staff"
          value={superAdminStaffSummary.inactiveStaff}
          icon={<IconAlertCircle className="w-5 h-5 text-slate-500" />}
          iconBg="bg-slate-100 text-slate-600"
          helperText="Deactivated or suspended accounts"
        />
        <StatCard
          title="Departments"
          value={superAdminStaffSummary.departments}
          icon={<IconClubs className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Covered academic divisions"
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
              placeholder="Search by name, email, or staff ID..."
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

            {/* Role Filter (Admin vs Staff) */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>

            {/* Status Filter (Active / Inactive) */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Filter status row & Clear Filters button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredStaff.length}</strong> of{' '}
            {staffList.length} staff records
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
      {/* 4. ADMIN / STAFF TABLE & EMPTY STATE                           */}
      {/* ============================================================== */}
      {filteredStaff.length === 0 ? (
        <EmptyState
          title="No Admin / Staff accounts found"
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
                  Staff Member
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Staff ID
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
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* Column 1: Staff Member (Avatar, Name, Email) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ring-1 ring-white shrink-0 ${
                          staff.role === 'Admin'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {getAvatarInitials(staff.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {staff.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {staff.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Staff ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {staff.staffId}
                    </span>
                  </td>

                  {/* Column 3: Role (Admin / Staff) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={staff.role === 'Admin' ? 'primary' : 'info'}
                      size="sm"
                    >
                      {staff.role}
                    </Badge>
                  </td>

                  {/* Column 4: Department */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700 font-medium">
                    {staff.department}
                  </td>

                  {/* Column 5: Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={staff.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {staff.status}
                    </Badge>
                  </td>

                  {/* Column 6: Created Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                    {staff.createdDate}
                  </td>

                  {/* Column 7: Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          aria-label="Open staff actions"
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
                          label: 'View Profile',
                          icon: <IconEye className="w-4 h-4" />,
                          onClick: () => setViewingStaff(staff),
                        },
                        {
                          label: 'Edit',
                          icon: <IconEdit className="w-4 h-4" />,
                          onClick: () => handleOpenEdit(staff),
                        },
                        {
                          label:
                            staff.status === 'Active'
                              ? 'Deactivate'
                              : 'Activate',
                          icon: <IconAlertCircle className="w-4 h-4" />,
                          onClick: () => handleToggleStatus(staff),
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
      {viewingStaff && (
        <Modal
          isOpen={Boolean(viewingStaff)}
          onClose={() => setViewingStaff(null)}
          title="Staff Profile Details"
          size="md"
        >
          <div className="space-y-6 text-sm">
            {/* Staff Header Avatar + Name */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 ${
                  viewingStaff.role === 'Admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {getAvatarInitials(viewingStaff.name)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {viewingStaff.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {viewingStaff.staffId}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    variant={viewingStaff.role === 'Admin' ? 'primary' : 'info'}
                    size="xs"
                  >
                    {viewingStaff.role}
                  </Badge>
                  <Badge
                    variant={viewingStaff.status === 'Active' ? 'success' : 'neutral'}
                    size="xs"
                    dot
                  >
                    {viewingStaff.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Official Email
                </span>
                <span className="text-slate-800 font-medium break-all">
                  {viewingStaff.email}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Staff ID
                </span>
                <span className="text-slate-800 font-mono font-medium">
                  {viewingStaff.staffId}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Department
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingStaff.department}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Role Privilege
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingStaff.role === 'Admin'
                    ? 'Institutional Administrator'
                    : 'Program Staff'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Designation / Title
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingStaff.designation || 'Faculty Coordinator'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Contact Phone
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingStaff.phone || 'Not provided'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                  Created Date
                </span>
                <span className="text-slate-800 font-medium">
                  {viewingStaff.createdDate}
                </span>
              </div>
            </div>

            {/* Security Audit Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Passwords, encryption keys, and session tokens are strictly concealed. All administrative access events are logged and audited.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const staffToEdit = viewingStaff
                  setViewingStaff(null)
                  handleOpenEdit(staffToEdit)
                }}
              >
                Edit Staff Details
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setViewingStaff(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. EDIT ADMIN / STAFF MODAL                                    */}
      {/* ============================================================== */}
      {editingStaff && (
        <Modal
          isOpen={Boolean(editingStaff)}
          onClose={() => setEditingStaff(null)}
          title="Edit Staff Member"
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              id="edit-staff-name"
              name="name"
              value={editFormData.name || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={editErrors.name}
              required
            />

            {/* Official Email */}
            <Input
              label="Official Email"
              id="edit-staff-email"
              name="email"
              type="email"
              value={editFormData.email || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              error={editErrors.email}
              required
            />

            {/* Staff ID */}
            <Input
              label="Staff ID"
              id="edit-staff-id"
              name="staffId"
              value={editFormData.staffId || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({
                  ...prev,
                  staffId: e.target.value.toUpperCase(),
                }))
              }
              error={editErrors.staffId}
              required
            />

            {/* Department */}
            <Select
              label="Department"
              id="edit-staff-department"
              name="department"
              value={editFormData.department || ''}
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
              error={editErrors.department}
              required
            />

            {/* Role (Admin vs Staff ONLY - Zero Super Admin exposure) */}
            <Select
              label="Role Privilege"
              id="edit-staff-role"
              name="role"
              value={editFormData.role || 'Admin'}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              options={['Admin', 'Staff']}
              error={editErrors.role}
              required
            />

            {/* Security Guard Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Super Admin privileges cannot be assigned through this interface. Passwords cannot be directly edited from this form.
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingStaff(null)}
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

      {/* ============================================================== */}
      {/* 7. CREATE ADMIN / STAFF ACCOUNT MODAL                          */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Admin / Staff Account"
          size="xl"
          footer={
            <div className="flex items-center justify-end gap-2.5 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCreateAccount}
              >
                Create Admin / Staff Account
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <p className="text-xs text-slate-500">
              Directly create and provision an authorized administrative account. Set an initial password and securely communicate the credentials to the staff member.
            </p>

            {/* Row 1: Full Name & Official College Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Full Name"
                id="create-staff-name"
                name="name"
                placeholder="e.g. Dr. Rajesh Kumar"
                value={createFormData.name}
                onChange={(e) =>
                  setCreateFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={createErrors.name}
                required
              />

              <Input
                label="Official College Email"
                id="create-staff-email"
                name="email"
                type="email"
                placeholder="e.g. r.kumar@campuslive.edu"
                value={createFormData.email}
                onChange={(e) =>
                  setCreateFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                error={createErrors.email}
                required
              />
            </div>

            {/* Row 2: Staff ID & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Staff ID"
                id="create-staff-id"
                name="staffId"
                placeholder="e.g. ADM-2026-042"
                value={createFormData.staffId}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    staffId: e.target.value.toUpperCase(),
                  }))
                }
                error={createErrors.staffId}
                required
              />

              <Select
                label="Department"
                id="create-staff-department"
                name="department"
                value={createFormData.department}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
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
                error={createErrors.department}
                required
              />
            </div>

            {/* Row 3: Role (Admin vs Staff ONLY) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Administrative Role"
                id="create-staff-role"
                name="role"
                value={createFormData.role}
                onChange={(e) =>
                  setCreateFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                options={['Admin', 'Staff']}
                error={createErrors.role}
                required
              />
            </div>

            {/* Row 4: Initial Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <PasswordInput
                label="Initial Password"
                id="create-staff-password"
                name="password"
                placeholder="Minimum 8 characters"
                value={createFormData.password}
                onChange={(e) =>
                  setCreateFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                error={createErrors.password}
                required
              />

              <PasswordInput
                label="Confirm Password"
                id="create-staff-confirm-password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={createFormData.confirmPassword}
                onChange={(e) =>
                  setCreateFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                error={createErrors.confirmPassword}
                required
              />
            </div>

            {/* Security Guard Callout */}
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Set an initial password for this account and provide the login credentials to the staff member securely.
              </span>
            </div>

            {/* Hidden submit button to support keyboard Enter submission */}
            <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
          </form>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
