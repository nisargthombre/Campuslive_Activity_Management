import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import SearchBar from '../components/common/SearchBar'
import Select from '../components/common/Select'
import EmptyState from '../components/common/EmptyState'
import {
  IconUsers,
  IconUser,
  IconClipboardCheck,
  IconClubs,
  IconChevronRight,
  IconCheck,
} from '../components/icons/Icons'
import {
  facultyStudentsList,
  studentDepartments,
  studentCourses,
  studentYears,
  studentStatuses,
} from '../data/facultyStudentsData'

export default function FacultyStudents() {
  const navigate = useNavigate()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [selectedYear, setSelectedYear] = useState('All Years')
  const [selectedStatus, setSelectedStatus] = useState('All Status')

  // Helper to handle Select change whether it passes synthetic event e or string val
  const handleFilterChange = (setter) => (e) => {
    const val = typeof e === 'object' && e?.target ? e.target.value : e
    setter(val)
  }

  // Filtered Students with strict AND logic across all active criteria
  const filteredStudents = useMemo(() => {
    return facultyStudentsList.filter((student) => {
      // 1. Search Query: case-insensitive partial match on name, student ID, or college email
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesName = student.name?.toLowerCase().includes(q)
        const matchesId = student.id?.toLowerCase().includes(q)
        const matchesEmail = student.email?.toLowerCase().includes(q)
        if (!matchesName && !matchesId && !matchesEmail) {
          return false
        }
      }

      // 2. Department filter
      if (
        selectedDepartment !== 'All Departments' &&
        selectedDepartment !== 'All' &&
        student.department !== selectedDepartment
      ) {
        return false
      }

      // 3. Course filter
      if (
        selectedCourse !== 'All Courses' &&
        selectedCourse !== 'All' &&
        student.course !== selectedCourse
      ) {
        return false
      }

      // 4. Academic Year filter
      if (
        selectedYear !== 'All Years' &&
        selectedYear !== 'All' &&
        student.academicYear !== selectedYear
      ) {
        return false
      }

      // 5. Status filter
      if (
        selectedStatus !== 'All Status' &&
        selectedStatus !== 'All Statuses' &&
        selectedStatus !== 'All' &&
        student.status !== selectedStatus
      ) {
        return false
      }

      return true
    })
  }, [
    searchQuery,
    selectedDepartment,
    selectedCourse,
    selectedYear,
    selectedStatus,
  ])

  // Summary Metrics (computed from original list without mutation)
  const stats = useMemo(() => {
    const total = facultyStudentsList.length
    const active = facultyStudentsList.filter((s) => s.status === 'Active').length
    const withRegistrations = facultyStudentsList.filter(
      (s) => s.registrationsCount > 0
    ).length
    const withClubs = facultyStudentsList.filter((s) => s.clubsCount > 0).length

    return { total, active, withRegistrations, withClubs }
  }, [])

  // Check if filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    (selectedDepartment !== 'All Departments' && selectedDepartment !== 'All') ||
    (selectedCourse !== 'All Courses' && selectedCourse !== 'All') ||
    (selectedYear !== 'All Years' && selectedYear !== 'All') ||
    (selectedStatus !== 'All Status' && selectedStatus !== 'All Statuses' && selectedStatus !== 'All')

  // Clear Filters Handler
  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedDepartment('All Departments')
    setSelectedCourse('All Courses')
    setSelectedYear('All Years')
    setSelectedStatus('All Status')
  }

  return (
    <FacultyLayout>
      {/* 1. Page Header */}
      <PageHeader
        title="Students"
        subtitle="Search students and view their campus activity information."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Students' },
        ]}
        actions={
          <Badge variant="secondary" size="md" dot>
            Admin Oversight
          </Badge>
        }
      />

      {/* Summary Area (4 Summary Cards) */}
      <section
        aria-label="Student Directory Metrics"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-6"
      >
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={<IconUsers className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          helperText="Enrolled cohort directory"
        />
        <StatCard
          title="Active Students"
          value={stats.active}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Regular"
          changeType="positive"
          helperText="Valid academic status"
        />
        <StatCard
          title="Students with Registrations"
          value={stats.withRegistrations}
          icon={<IconClipboardCheck className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-50 text-indigo-600"
          helperText="Signed up for >=1 activity"
        />
        <StatCard
          title="Students with Club Memberships"
          value={stats.withClubs}
          icon={<IconClubs className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-50 text-purple-600"
          helperText="Associated with student clubs"
        />
      </section>

      {/* 2 & 3. Search and Combined Filters Card */}
      <Card className="mb-4" padding="sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Prominent Search Box */}
          <div className="flex-1 max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by name, student ID, or college email..."
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Department */}
            <div className="w-36 sm:w-40">
              <Select
                value={selectedDepartment}
                onChange={handleFilterChange(setSelectedDepartment)}
                options={studentDepartments}
              />
            </div>

            {/* Course */}
            <div className="w-28 sm:w-32">
              <Select
                value={selectedCourse}
                onChange={handleFilterChange(setSelectedCourse)}
                options={studentCourses}
              />
            </div>

            {/* Academic Year */}
            <div className="w-28 sm:w-32">
              <Select
                value={selectedYear}
                onChange={handleFilterChange(setSelectedYear)}
                options={studentYears}
              />
            </div>

            {/* Status */}
            <div className="w-28 sm:w-32">
              <Select
                value={selectedStatus}
                onChange={handleFilterChange(setSelectedStatus)}
                options={studentStatuses}
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Result Count Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
        <span>
          Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{facultyStudentsList.length}</span> students
        </span>
        {hasActiveFilters && (
          <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
            Filters active
          </span>
        )}
      </div>

      {/* 4. Student List Table / Empty State */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="Try changing your search or filters."
          icon={<IconUser className="w-6 h-6 text-slate-400" />}
          actionText={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? handleClearFilters : undefined}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-4">College Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-3">Course</th>
                  <th className="py-3.5 px-3">Year</th>
                  <th className="py-3.5 px-3 text-center">Registrations</th>
                  <th className="py-3.5 px-3 text-center">Activities Participated</th>
                  <th className="py-3.5 px-3 text-center">Clubs Joined</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Student Name & Avatar & ID */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {student.avatar}
                        </div>
                        <div>
                          <h3
                            onClick={() => navigate(`/faculty/students/${student.id}`)}
                            className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-xs cursor-pointer"
                          >
                            {student.name}
                          </h3>
                          <span className="font-mono text-[10px] text-slate-400">
                            {student.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* College Email */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                      {student.email}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-800">
                      {student.department}
                    </td>

                    {/* Course */}
                    <td className="py-4 px-3 whitespace-nowrap text-slate-600">
                      {student.course}
                    </td>

                    {/* Academic Year */}
                    <td className="py-4 px-3 whitespace-nowrap text-slate-600">
                      {student.academicYear}
                    </td>

                    {/* Registrations Count */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                        {student.registrationsCount}
                      </span>
                    </td>

                    {/* Activities Participated Count (Registered != Participated) */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {student.participatedCount}
                      </span>
                    </td>

                    {/* Clubs Joined Count */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                        {student.clubsCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <Badge
                        variant={student.status === 'Active' ? 'success' : 'neutral'}
                        size="sm"
                        dot
                      >
                        {student.status}
                      </Badge>
                    </td>

                    {/* Action: View Student */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/faculty/students/${student.id}`)}
                        className="text-xs px-2.5 py-1 text-blue-600 border-blue-200 hover:bg-blue-50/60"
                        icon={<IconChevronRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                      >
                        View Student
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-800">{filteredStudents.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{facultyStudentsList.length}</span> students
            </span>
            <span className="text-[11px] text-slate-400">
              KPGU Student Records &bull; Authorized Admin Access Only
            </span>
          </div>
        </Card>
      )}
    </FacultyLayout>
  )
}
