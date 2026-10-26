import { useState, useMemo, useEffect } from 'react'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Textarea from '../components/common/Textarea'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import {
  IconBell,
  IconPlus,
  IconCheck,
  IconClose,
  IconSearch,
  IconEye,
  IconAlertCircle,
  IconLock,
} from '../components/icons/Icons'
import {
  getStoredNotifications,
  saveStoredNotifications,
  NOTIFICATIONS_EVENT_KEY,
} from '../data/notificationsData'

const departmentsList = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Comm.',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other / Applied Sciences',
]

const coursesList = ['B.Tech', 'M.Tech', 'BCA', 'MCA']

const academicYearsList = [
  'First Year (Freshmen)',
  'Second Year (Sophomores)',
  'Third Year (Juniors)',
  'Fourth Year (Seniors)',
]

const mockStudents = [
  { id: 'STU-2024-001', name: 'Nisarg Patel', dept: 'Computer Engineering' },
  { id: 'STU-2024-042', name: 'Priya Sharma', dept: 'Information Technology' },
  { id: 'STU-2023-118', name: 'Rahul Verma', dept: 'Mechanical Engineering' },
  { id: 'STU-2024-089', name: 'Ananya Desai', dept: 'Computer Engineering' },
  { id: 'STU-2023-055', name: 'Karan Mehta', dept: 'Information Technology' },
]

const mockStaff = [
  { id: 'ADM-2019-001', name: 'Dr. Sarah Jenkins', role: 'Department Coordinator', dept: 'Computer Engineering' },
  { id: 'ADM-2020-014', name: 'Prof. David Vance', role: 'Head of Department', dept: 'Information Technology' },
  { id: 'ADM-2021-032', name: 'Dr. Anita Desai', role: 'Activity Affairs Officer', dept: 'Mechanical Engineering' },
  { id: 'STF-2021-055', name: 'Michael Rodriguez', role: 'Lead Technical Assistant', dept: 'Computer Engineering' },
  { id: 'ADM-2022-045', name: 'Dr. Ramesh Iyer', role: 'Associate Dean', dept: 'Electronics & Comm.' },
]

const internalAdminCategories = [
  'System Maintenance Notice',
  'Internal Administrative Announcement',
  'Admin Meeting Reminder',
  'Platform Management Notice',
  'Important Instruction for Admin/Faculty',
  'Request for Review',
]

const normalCategories = [
  'General Announcement',
  'Activities',
  'Registrations',
  'Clubs',
  'System Advisory',
  'Urgent Notice',
]

export default function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState(getStoredNotifications)

  // Filters
  const [channelFilter, setChannelFilter] = useState('All') // 'All' | 'normal' | 'internal_admin'
  const [audienceFilter, setAudienceFilter] = useState('All') // 'All' | 'student' | 'faculty'
  const [priorityFilter, setPriorityFilter] = useState('All') // 'All' | 'Normal' | 'Important' | 'Urgent'
  const [searchQuery, setSearchQuery] = useState('')

  // Toast banner
  const [toastMessage, setToastMessage] = useState(null)

  // Send Notification Modal State
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedNotif, setSelectedNotif] = useState(null)

  // Send Form State
  const [formChannel, setFormChannel] = useState('normal') // 'normal' | 'internal_admin'
  const [formRecipientGroup, setFormRecipientGroup] = useState('student') // 'student' | 'faculty'
  const [formStudentScope, setFormStudentScope] = useState('All Students') // 'All Students' | 'Department' | 'Course' | 'Academic Year' | 'Individual Student'
  const [formFacultyScope, setFormFacultyScope] = useState('All Admin/Faculty') // 'All Admin/Faculty' | 'Department' | 'Individual Admin/Faculty'
  const [formSelectedDept, setFormSelectedDept] = useState(departmentsList[0])
  const [formSelectedCourse, setFormSelectedCourse] = useState(coursesList[0])
  const [formSelectedYear, setFormSelectedYear] = useState(academicYearsList[0])
  const [formSelectedStudent, setFormSelectedStudent] = useState(mockStudents[0].name)
  const [formSelectedStaff, setFormSelectedStaff] = useState(mockStaff[0].name)
  const [formCategory, setFormCategory] = useState(normalCategories[0])
  const [formTitle, setFormTitle] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [formPriority, setFormPriority] = useState('Normal') // 'Normal' | 'Important' | 'Urgent'
  const [formActionLink, setFormActionLink] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Keep synced with localStorage
  useEffect(() => {
    const handleSync = () => {
      setNotifications(getStoredNotifications())
    }
    window.addEventListener(NOTIFICATIONS_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Auto dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Reset form when modal opens
  const handleOpenSendModal = () => {
    setFormChannel('normal')
    setFormRecipientGroup('student')
    setFormStudentScope('All Students')
    setFormFacultyScope('All Admin/Faculty')
    setFormSelectedDept(departmentsList[0])
    setFormSelectedCourse(coursesList[0])
    setFormSelectedYear(academicYearsList[0])
    setFormSelectedStudent(mockStudents[0].name)
    setFormSelectedStaff(mockStaff[0].name)
    setFormCategory(normalCategories[0])
    setFormTitle('')
    setFormMessage('')
    setFormPriority('Normal')
    setFormActionLink('')
    setFormErrors({})
    setIsSendModalOpen(true)
  }

  // Handle Channel Switch
  const handleSelectChannel = (channel) => {
    setFormChannel(channel)
    if (channel === 'internal_admin') {
      // Strictly restrict target to Admin/Faculty only
      setFormRecipientGroup('faculty')
      setFormFacultyScope('All Admin/Faculty')
      setFormCategory(internalAdminCategories[0])
    } else {
      setFormCategory(normalCategories[0])
    }
  }

  // Handle Send Submit
  const handleSendNotification = (e) => {
    e.preventDefault()
    const errors = {}

    if (!formTitle.trim()) {
      errors.title = 'Title is required'
    }
    if (!formMessage.trim()) {
      errors.message = 'Notification message is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Determine target audience label
    let targetSummary
    if (formChannel === 'internal_admin') {
      if (formFacultyScope === 'All Admin/Faculty') {
        targetSummary = 'All Admin/Faculty'
      } else if (formFacultyScope === 'Department') {
        targetSummary = `Admin/Faculty (${formSelectedDept})`
      } else {
        targetSummary = `Individual Admin/Faculty (${formSelectedStaff})`
      }
    } else {
      // Normal Notification
      if (formRecipientGroup === 'student') {
        if (formStudentScope === 'All Students') {
          targetSummary = 'All Students'
        } else if (formStudentScope === 'Department') {
          targetSummary = `Students (${formSelectedDept})`
        } else if (formStudentScope === 'Course') {
          targetSummary = `Students (${formSelectedCourse})`
        } else if (formStudentScope === 'Academic Year') {
          targetSummary = `Students (${formSelectedYear})`
        } else {
          targetSummary = `Individual Student (${formSelectedStudent})`
        }
      } else {
        if (formFacultyScope === 'All Admin/Faculty') {
          targetSummary = 'All Admin/Faculty'
        } else if (formFacultyScope === 'Department') {
          targetSummary = `Admin/Faculty (${formSelectedDept})`
        } else {
          targetSummary = `Individual Admin/Faculty (${formSelectedStaff})`
        }
      }
    }

    const now = new Date()
    const dateFormatted = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ` + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newNotification = {
      id: `notif-${Date.now()}`,
      channel: formChannel, // 'normal' | 'internal_admin'
      recipientRole: formChannel === 'internal_admin' ? 'faculty' : formRecipientGroup, // 'student' | 'faculty'
      targetAudience: targetSummary,
      title: formTitle.trim(),
      message: formMessage.trim(),
      category: formCategory,
      priority: formPriority,
      time: 'Just now',
      date: dateFormatted,
      isUnread: true,
      sender: formChannel === 'internal_admin' ? 'Super Admin (Internal Council)' : 'Super Admin Office',
      action: formActionLink.trim()
        ? { label: 'View Details', to: formActionLink.trim() }
        : null,
    }

    const currentList = getStoredNotifications()
    const updatedList = [newNotification, ...currentList]
    saveStoredNotifications(updatedList)
    setNotifications(updatedList)

    setIsSendModalOpen(false)
    setToastMessage({
      type: 'success',
      text:
        formChannel === 'internal_admin'
          ? `Internal Admin Panel notification dispatched successfully to ${targetSummary}. Visible exclusively to Admin/Faculty.`
          : `Normal notification dispatched successfully to ${targetSummary}.`,
    })
  }

  // Handle Delete Notification
  const handleDeleteNotification = (id) => {
    const currentList = getStoredNotifications()
    const updated = currentList.filter((n) => n.id !== id)
    saveStoredNotifications(updated)
    setNotifications(updated)
    setToastMessage({
      type: 'info',
      text: 'Notification revoked and removed from distribution.',
    })
  }

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Channel Filter
      if (channelFilter !== 'All' && notif.channel !== channelFilter) return false

      // Audience Filter
      if (audienceFilter === 'student' && notif.recipientRole !== 'student') return false
      if (audienceFilter === 'faculty' && notif.recipientRole !== 'faculty' && notif.recipientRole !== 'admin') return false

      // Priority Filter
      if (priorityFilter !== 'All' && notif.priority !== priorityFilter) return false

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = notif.title.toLowerCase().includes(q)
        const matchMsg = notif.message.toLowerCase().includes(q)
        const matchTarget = (notif.targetAudience || '').toLowerCase().includes(q)
        if (!matchTitle && !matchMsg && !matchTarget) return false
      }

      return true
    })
  }, [notifications, channelFilter, audienceFilter, priorityFilter, searchQuery])

  // Metrics
  const totalCount = notifications.length
  const normalCount = notifications.filter((n) => n.channel === 'normal').length
  const internalAdminCount = notifications.filter((n) => n.channel === 'internal_admin').length
  const urgentCount = notifications.filter((n) => n.priority === 'Urgent').length

  return (
    <SuperAdminLayout>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <IconCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Action Completed
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                {toastMessage.text}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 p-1 rounded-md transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Super Admin Notifications"
        subtitle="Manage user broadcasts, dispatch targeted notices, and communicate privately via Internal Admin Panel notifications."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenSendModal}
              icon={<IconPlus className="w-4 h-4" />}
            >
              Send Notification
            </Button>
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
          </div>
        }
      />

      {/* 1. TOP METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Broadcasts
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Active in system store
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Normal Notifications
          </span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {normalCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            User-facing broadcasts
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block">
              Internal Admin Panel
            </span>
            <IconLock className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-2xl font-black text-purple-700 mt-1 block">
            {internalAdminCount}
          </span>
          <span className="text-[11px] text-purple-600/80 mt-0.5 block font-medium">
            Admin/Faculty only • Private
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Urgent Priority
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            {urgentCount}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            High priority alerts
          </span>
        </div>
      </div>

      {/* 2. CHANNELS EXPLANATION CALLOUT */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <IconAlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Two Super Admin Notification Channels
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              <span className="font-semibold text-blue-700">Normal Notifications</span> reach Students or Faculty in their respective notification centers. <span className="font-semibold text-purple-700">Internal Admin Panel Notifications</span> are delivered strictly into the management portal for Admin/Faculty. Students never see internal management notices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setChannelFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              channelFilter === 'All'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              channelFilter === 'normal'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Normal ({normalCount})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('internal_admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              channelFilter === 'internal_admin'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Internal Admin ({internalAdminCount})
          </button>
        </div>
      </div>

      {/* 3. FILTERS CARD */}
      <Card className="mb-6" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <Input
            placeholder="Search by title, message or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<IconSearch className="w-4 h-4 text-slate-400" />}
          />

          <Select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            options={[
              { label: 'All Recipient Roles', value: 'All' },
              { label: 'Students', value: 'student' },
              { label: 'Admin / Faculty', value: 'faculty' },
            ]}
          />

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { label: 'All Priorities', value: 'All' },
              { label: 'Normal Priority', value: 'Normal' },
              { label: 'Important Priority', value: 'Important' },
              { label: 'Urgent Priority', value: 'Urgent' },
            ]}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                setChannelFilter('All')
                setAudienceFilter('All')
                setPriorityFilter('All')
                setSearchQuery('')
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      {/* 4. NOTIFICATIONS LIST / TABLE */}
      <Card padding="none" className="overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Notification Distribution Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active broadcast channels, targets, and delivery states
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {filteredNotifications.length} Broadcasts
          </span>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No notifications found"
              description="No notifications match the selected channel or filter criteria."
              icon={<IconSearch className="w-8 h-8 text-slate-400" />}
              actionText="Reset All Filters"
              onAction={() => {
                setChannelFilter('All')
                setAudienceFilter('All')
                setPriorityFilter('All')
                setSearchQuery('')
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Title & Message</th>
                  <th className="py-3 px-4 text-center">Channel</th>
                  <th className="py-3 px-4">Target Audience</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4">Date Dispatched</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 max-w-[280px]">
                      <div className="font-bold text-slate-900 truncate" title={notif.title}>
                        {notif.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={notif.message}>
                        {notif.message}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {notif.channel === 'internal_admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <IconLock className="w-2.5 h-2.5" />
                          Internal Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <IconBell className="w-2.5 h-2.5" />
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {notif.targetAudience || (notif.recipientRole === 'student' ? 'Students' : 'Admin/Faculty')}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {notif.recipientRole === 'student' ? 'Recipient: Student' : 'Recipient: Admin/Faculty'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {notif.category}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          notif.priority === 'Urgent'
                            ? 'danger'
                            : notif.priority === 'Important'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {notif.priority || 'Normal'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {notif.date}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedNotif(notif)
                            setDetailsModalOpen(true)
                          }}
                          icon={<IconEye className="w-3.5 h-3.5 text-blue-600" />}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNotification(notif.id)}
                          icon={<IconClose className="w-3.5 h-3.5 text-rose-600" />}
                          className="text-rose-600 hover:text-rose-800 text-xs"
                        >
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ============================================================== */}
      {/* 5. MODAL: SEND NOTIFICATION (WITH TWO CHANNELS)                */}
      {/* ============================================================== */}
      {isSendModalOpen && (
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          title="Send Notification • Super Admin Dispatch"
          size="lg"
        >
          <form onSubmit={handleSendNotification} className="space-y-5 text-xs">
            {/* STEP 1: CHANNEL SELECTION */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Select Notification Channel <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Channel A: Normal Notification */}
                <div
                  onClick={() => handleSelectChannel('normal')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    formChannel === 'normal'
                      ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <IconBell className="w-4 h-4 text-blue-600" />
                        Normal Notification
                      </span>
                      {formChannel === 'normal' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Standard user-facing notification. Can target <strong>Students</strong> or <strong>Admin/Faculty</strong>.
                    </p>
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Audience: Students OR Admin/Faculty
                  </span>
                </div>

                {/* Channel B: Internal Admin Panel Notification */}
                <div
                  onClick={() => handleSelectChannel('internal_admin')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    formChannel === 'internal_admin'
                      ? 'border-purple-600 bg-purple-50/80 ring-1 ring-purple-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <IconLock className="w-4 h-4 text-purple-600" />
                        Internal Admin Panel
                      </span>
                      {formChannel === 'internal_admin' && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Private administrative notice. Restricted exclusively to <strong>Admin/Faculty</strong> users inside the admin panel.
                    </p>
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                    Audience: Admin/Faculty ONLY (Students Excluded)
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 2: AUDIENCE & SCOPE SELECTION */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Recipient Targeting
                </span>
                {formChannel === 'internal_admin' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                    <IconLock className="w-3 h-3" />
                    Target Restricted: Admin/Faculty Only
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Normal Channel Recipient
                  </span>
                )}
              </div>

              {/* If Normal: Choose between Students and Admin/Faculty */}
              {formChannel === 'normal' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Target Recipient Role
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormRecipientGroup('student')}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors cursor-pointer text-xs ${
                        formRecipientGroup === 'student'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Students
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRecipientGroup('faculty')}
                      className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors cursor-pointer text-xs ${
                        formRecipientGroup === 'faculty'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Admin / Faculty
                    </button>
                  </div>
                </div>
              )}

              {/* If Internal Admin: Callout Banner confirming restriction */}
              {formChannel === 'internal_admin' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                  <p className="font-bold flex items-center gap-1.5">
                    <IconLock className="w-3.5 h-3.5 text-purple-600" />
                    Strict Privacy Enforcement
                  </p>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Students will <strong>NEVER</strong> receive or see this notification. It is delivered exclusively inside the Admin/Faculty management portal bell and notification center.
                  </p>
                </div>
              )}

              {/* Scope for STUDENTS (only available if normal + student) */}
              {formChannel === 'normal' && formRecipientGroup === 'student' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Student Target Scope
                    </label>
                    <Select
                      value={formStudentScope}
                      onChange={(e) => setFormStudentScope(e.target.value)}
                      options={[
                        { label: 'All Students (Campus-wide)', value: 'All Students' },
                        { label: 'By Department', value: 'Department' },
                        { label: 'By Course', value: 'Course' },
                        { label: 'By Academic Year', value: 'Academic Year' },
                        { label: 'Individual Student', value: 'Individual Student' },
                      ]}
                    />
                  </div>

                  {formStudentScope === 'Department' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Department
                      </label>
                      <Select
                        value={formSelectedDept}
                        onChange={(e) => setFormSelectedDept(e.target.value)}
                        options={departmentsList.map((d) => ({ label: d, value: d }))}
                      />
                    </div>
                  )}

                  {formStudentScope === 'Course' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Course
                      </label>
                      <Select
                        value={formSelectedCourse}
                        onChange={(e) => setFormSelectedCourse(e.target.value)}
                        options={coursesList.map((c) => ({ label: c, value: c }))}
                      />
                    </div>
                  )}

                  {formStudentScope === 'Academic Year' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Academic Year
                      </label>
                      <Select
                        value={formSelectedYear}
                        onChange={(e) => setFormSelectedYear(e.target.value)}
                        options={academicYearsList.map((y) => ({ label: y, value: y }))}
                      />
                    </div>
                  )}

                  {formStudentScope === 'Individual Student' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Specific Student
                      </label>
                      <Select
                        value={formSelectedStudent}
                        onChange={(e) => setFormSelectedStudent(e.target.value)}
                        options={mockStudents.map((s) => ({
                          label: `${s.name} (${s.id} - ${s.dept})`,
                          value: s.name,
                        }))}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Scope for ADMIN / FACULTY (available for internal_admin OR normal + faculty) */}
              {(formChannel === 'internal_admin' || (formChannel === 'normal' && formRecipientGroup === 'faculty')) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Admin / Faculty Target Scope
                    </label>
                    <Select
                      value={formFacultyScope}
                      onChange={(e) => setFormFacultyScope(e.target.value)}
                      options={[
                        { label: 'All Admin / Faculty Members', value: 'All Admin/Faculty' },
                        { label: 'By Department', value: 'Department' },
                        { label: 'Individual Admin / Faculty Coordinator', value: 'Individual Admin/Faculty' },
                      ]}
                    />
                  </div>

                  {formFacultyScope === 'Department' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Faculty Department
                      </label>
                      <Select
                        value={formSelectedDept}
                        onChange={(e) => setFormSelectedDept(e.target.value)}
                        options={departmentsList.map((d) => ({ label: d, value: d }))}
                      />
                    </div>
                  )}

                  {formFacultyScope === 'Individual Admin/Faculty' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                        Select Specific Faculty Member
                      </label>
                      <Select
                        value={formSelectedStaff}
                        onChange={(e) => setFormSelectedStaff(e.target.value)}
                        options={mockStaff.map((s) => ({
                          label: `${s.name} (${s.role} - ${s.dept})`,
                          value: s.name,
                        }))}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 3: CONTENT & METADATA */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Notification Category
                  </label>
                  <Select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    options={
                      formChannel === 'internal_admin'
                        ? internalAdminCategories.map((c) => ({ label: c, value: c }))
                        : normalCategories.map((c) => ({ label: c, value: c }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <Select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    options={[
                      { label: 'Normal Priority', value: 'Normal' },
                      { label: 'Important Priority', value: 'Important' },
                      { label: 'Urgent Priority', value: 'Urgent' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Notification Title"
                  placeholder="e.g. System Maintenance Notice / Hackathon Registration Alert"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  error={formErrors.title}
                  required
                />
              </div>

              <div>
                <Textarea
                  label="Notification Message"
                  placeholder="Enter full notification body text..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  rows={4}
                  error={formErrors.message}
                  required
                />
              </div>

              <div>
                <Input
                  label="Action Link (Optional URL/Route)"
                  placeholder="e.g. /faculty/activities or /student/activities"
                  value={formActionLink}
                  onChange={(e) => setFormActionLink(e.target.value)}
                />
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSendModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={formChannel === 'internal_admin' ? 'secondary' : 'primary'}
                size="sm"
                icon={<IconPlus className="w-4 h-4" />}
              >
                {formChannel === 'internal_admin'
                  ? 'Dispatch Internal Admin Notice'
                  : 'Dispatch Normal Notification'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: VIEW DETAILS                                         */}
      {/* ============================================================== */}
      {detailsModalOpen && selectedNotif && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Notification Dispatch Record"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] text-slate-500">{selectedNotif.id}</span>
                {selectedNotif.channel === 'internal_admin' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    <IconLock className="w-2.5 h-2.5" />
                    Internal Admin Panel Notice
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    <IconBell className="w-2.5 h-2.5" />
                    Normal Notification
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900">{selectedNotif.title}</h4>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">{selectedNotif.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Audience</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedNotif.targetAudience || 'Broadcast'}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">Role: {selectedNotif.recipientRole}</p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority & Category</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedNotif.priority || 'Normal'} Priority</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{selectedNotif.category}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatched Date</span>
                <p className="font-mono text-slate-700 mt-0.5">{selectedNotif.date}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedNotif.sender || 'Super Admin'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailsModalOpen(false)}
              >
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
