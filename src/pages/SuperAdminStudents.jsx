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
  IconUser,
  IconUsers,
  IconCheck,
  IconClose,
  IconCalendar,
  IconSearch,
  IconEye,
  IconEdit,
  IconAlertCircle,
} from '../components/icons/Icons'
import {
  superAdminStudentsSummary,
  initialSuperAdminStudents,
} from '../data/superAdminStudentsData'

export default function SuperAdminStudents() {
  // Main Students State (Local/Mock)
  const [students, setStudents] = useState(initialSuperAdminStudents)

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modals & Feedback State
  const [viewingStudent, setViewingStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [actionNotice, setActionNotice] = useState(null)

  // Filter students using strict AND logic across all dimensions
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Query (Name, Email, or Student ID)
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)

      // 2. Department Filter
      const matchesDept =
        departmentFilter === 'all' ||
        s.department.toLowerCase() === departmentFilter.toLowerCase()

      // 3. Course Filter
      const matchesCourse =
        courseFilter === 'all' ||
        s.course.toLowerCase() === courseFilter.toLowerCase()

      // 4. Academic Year Filter
      const matchesYear =
        yearFilter === 'all' ||
        s.year.toLowerCase() === yearFilter.toLowerCase()

      // 5. Account Status Filter
      const matchesStatus =
        statusFilter === 'all' ||
        s.status.toLowerCase() === statusFilter.toLowerCase()

      return (
        matchesSearch &&
        matchesDept &&
        matchesCourse &&
        matchesYear &&
        matchesStatus
      )
    })
  }, [students, searchQuery, departmentFilter, courseFilter, yearFilter, statusFilter])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    departmentFilter !== 'all' ||
    courseFilter !== 'all' ||
    yearFilter !== 'all' ||
    statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setDepartmentFilter('all')
    setCourseFilter('all')
    setYearFilter('all')
    setStatusFilter('all')
  }

  // Handle Activate / Deactivate
  const handleToggleStatus = (targetStudent) => {
    const newStatus = targetStudent.status === 'Active' ? 'Inactive' : 'Active'
    setStudents((prev) =>
      prev.map((s) => (s.id === targetStudent.id ? { ...s, status: newStatus } : s))
    )
    if (viewingStudent && viewingStudent.id === targetStudent.id) {
      setViewingStudent((prev) => ({ ...prev, status: newStatus }))
    }
    setActionNotice(
      `Student record for ${targetStudent.name} (${targetStudent.id}) has been ${
        newStatus === 'Active' ? 'activated' : 'deactivated'
      }.`
    )
    setTimeout(() => setActionNotice(null), 3500)
  }

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student)
    setEditFormData({
      name: student.name,
      email: student.email,
      id: student.id,
      department: student.department,
      course: student.course,
      year: student.year,
      phone: student.phone || '',
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
    if (!editFormData.id?.trim()) {
      errors.id = 'Student ID is required.'
    }
    if (!editFormData.department) {
      errors.department = 'Department is required.'
    }
    if (!editFormData.course) {
      errors.course = 'Course is required.'
    }
    if (!editFormData.year) {
      errors.year = 'Academic year is required.'
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id ? { ...s, ...editFormData } : s
      )
    )

    if (viewingStudent && viewingStudent.id === editingStudent.id) {
      setViewingStudent((prev) => ({ ...prev, ...editFormData }))
    }

    setActionNotice(
      `Student details for ${editFormData.name} have been updated successfully.`
    )
    setTimeout(() => setActionNotice(null), 3500)
    setEditingStudent(null)
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Students Administration"
        subtitle="Manage institutional student records, academic details, and account status."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Students' },
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
          title="Total Students"
          value={superAdminStudentsSummary.totalStudents}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="Enrolled across university programs"
        />
        <StatCard
          title="Active Students"
          value={superAdminStudentsSummary.activeStudents}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          helperText="Active accounts in good standing"
        />
        <StatCard
          title="Inactive Students"
          value={superAdminStudentsSummary.inactiveStudents}
          icon={<IconClose className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-50 text-rose-600"
          helperText="Suspended or deactivated profiles"
        />
        <StatCard
          title="Departments"
          value={superAdminStudentsSummary.departmentsCount}
          icon={<IconCalendar className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Recognized academic branches"
        />
      </div>

      {/* ============================================================== */}
      {/* 3. SEARCH AND MULTI-FILTER TOOLBAR                             */}
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
              placeholder="Search by student name, email, or student ID..."
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

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:w-auto">
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Other">Other</option>
            </select>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BCA">BCA</option>
              <option value="MCA">MCA</option>
              <option value="Other">Other</option>
            </select>

            {/* Academic Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Years</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
              <option value="Third Year">Third Year</option>
              <option value="Fourth Year">Fourth Year</option>
            </select>

            {/* Account Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs sm:text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800">{students.length}</strong> students
          </span>
          {hasActiveFilters && (
            <span className="text-blue-600 font-medium">Filters active</span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. STUDENT TABLE & EMPTY STATE                                 */}
      {/* ============================================================== */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try changing your search or filter criteria."
          icon={<IconUser className="w-6 h-6 text-slate-400" />}
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Student
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Student ID
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Department
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Course
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Year
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  Registered Activities
                </th>
                <th scope="col" className="px-6 py-3.5 text-center">
                  Clubs Joined
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Account Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  {/* Column 1: Student (Avatar + Name + Email) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center ring-1 ring-white shrink-0">
                        {student.avatar || student.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {student.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Student ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {student.id}
                    </span>
                  </td>

                  {/* Column 3: Department */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-700">
                    {student.department}
                  </td>

                  {/* Column 4: Course */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-800">
                    {student.course}
                  </td>

                  {/* Column 5: Year */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                    {student.year}
                  </td>

                  {/* Column 6: Registered Activities */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {student.registeredActivities}
                    </span>
                  </td>

                  {/* Column 7: Clubs Joined */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      {student.clubsJoined}
                    </span>
                  </td>

                  {/* Column 8: Account Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={student.status === 'Active' ? 'success' : 'neutral'}
                      size="sm"
                      dot
                    >
                      {student.status}
                    </Badge>
                  </td>

                  {/* Column 9: Actions Menu */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <Dropdown
                      align="right"
                      trigger={
                        <button
                          type="button"
                          aria-label={`Actions for ${student.name}`}
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
                          label: 'View Student Profile',
                          icon: <IconEye className="w-4 h-4 text-slate-500" />,
                          onClick: () => setViewingStudent(student),
                        },
                        {
                          label: 'Edit Student',
                          icon: <IconEdit className="w-4 h-4 text-blue-600" />,
                          onClick: () => handleOpenEdit(student),
                        },
                        { divider: true },
                        {
                          label:
                            student.status === 'Active'
                              ? 'Deactivate Account'
                              : 'Activate Account',
                          danger: student.status === 'Active',
                          icon: (
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                student.status === 'Active'
                                  ? 'bg-rose-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          ),
                          onClick: () => handleToggleStatus(student),
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
      {/* 5. VIEW STUDENT PROFILE MODAL                                  */}
      {/* ============================================================== */}
      {viewingStudent && (
        <Modal
          isOpen={Boolean(viewingStudent)}
          onClose={() => setViewingStudent(null)}
          title="Student Profile"
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant={viewingStudent.status === 'Active' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleToggleStatus(viewingStudent)}
              >
                {viewingStudent.status === 'Active' ? 'Deactivate' : 'Activate'}
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const target = viewingStudent
                    setViewingStudent(null)
                    handleOpenEdit(target)
                  }}
                >
                  Edit Student
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewingStudent(null)}
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
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-2xs shrink-0">
                {viewingStudent.avatar || viewingStudent.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {viewingStudent.name}
                  </h4>
                  <Badge variant="primary" size="sm">
                    Student
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {viewingStudent.email}
                </p>
              </div>
            </div>

            {/* Academic & Identity Attributes Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Student ID</span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block">
                  {viewingStudent.id}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Account Status</span>
                <Badge
                  variant={viewingStudent.status === 'Active' ? 'success' : 'neutral'}
                  size="sm"
                  dot
                >
                  {viewingStudent.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.department}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Course Program</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.course}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Academic Year</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.year}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Enrollment Date</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.joinedDate}
                </span>
              </div>

              {viewingStudent.phone && (
                <div className="col-span-2 space-y-1">
                  <span className="text-slate-400 block font-medium">Contact Phone</span>
                  <span className="font-semibold text-slate-800">
                    {viewingStudent.phone}
                  </span>
                </div>
              )}
            </div>

            {/* Academic & Activity Overview Card */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Academic & Activity Overview
                </span>
                <span className="text-[11px] text-slate-400">Activity Analytics</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-center space-y-1">
                  <span className="text-xs text-blue-700 block font-medium">Registered</span>
                  <div className="text-lg font-extrabold text-blue-900">
                    {viewingStudent.registeredActivities}
                  </div>
                  <span className="text-[10px] text-blue-600 block">Total Signups</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
                  <span className="text-xs text-emerald-700 block font-medium">Participated</span>
                  <div className="text-lg font-extrabold text-emerald-900">
                    {viewingStudent.participatedActivities}
                  </div>
                  <span className="text-[10px] text-emerald-600 block">Verified Attended</span>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-center space-y-1">
                  <span className="text-xs text-purple-700 block font-medium">Clubs Joined</span>
                  <div className="text-lg font-extrabold text-purple-900">
                    {viewingStudent.clubsJoined}
                  </div>
                  <span className="text-[10px] text-purple-600 block">Active Societies</span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 text-center space-y-1">
                  <span className="text-xs text-amber-700 block font-medium">Upcoming</span>
                  <div className="text-lg font-extrabold text-amber-900">
                    {viewingStudent.upcomingActivities}
                  </div>
                  <span className="text-[10px] text-amber-600 block">Future Events</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug pt-1">
                Note: Registered and Participated activities represent separate metrics. Registration reserves an event slot; participation is recorded after event confirmation.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. EDIT STUDENT MODAL                                          */}
      {/* ============================================================== */}
      {editingStudent && (
        <Modal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.name}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} noValidate className="space-y-4">
            {/* Full Name Field */}
            <Input
              label="Full Name"
              id="edit-student-name"
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
              id="edit-student-email"
              name="email"
              type="email"
              value={editFormData.email || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              error={editErrors.email}
              required
            />

            {/* Student ID Field */}
            <Input
              label="Student ID / Enrollment Number"
              id="edit-student-id"
              name="id"
              value={editFormData.id || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, id: e.target.value }))
              }
              error={editErrors.id}
              required
            />

            {/* Department Field */}
            <Select
              label="Department"
              id="edit-student-department"
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

            {/* Course & Academic Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Course Program"
                id="edit-student-course"
                name="course"
                value={editFormData.course || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, course: e.target.value }))
                }
                options={['B.Tech', 'BCA', 'MCA', 'Other']}
                error={editErrors.course}
                required
              />

              <Select
                label="Academic Year"
                id="edit-student-year"
                name="year"
                value={editFormData.year || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, year: e.target.value }))
                }
                options={[
                  'First Year',
                  'Second Year',
                  'Third Year',
                  'Fourth Year',
                ]}
                error={editErrors.year}
                required
              />
            </div>

            {/* Contact Phone */}
            <Input
              label="Phone Number (Optional)"
              id="edit-student-phone"
              name="phone"
              type="tel"
              value={editFormData.phone || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="e.g. +91 98765 43210"
            />

            {/* Policy & Integrity Guard */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-start gap-2">
              <IconAlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Passwords, activity participation records, and registration histories cannot be altered from this academic profile interface.
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingStudent(null)}
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
