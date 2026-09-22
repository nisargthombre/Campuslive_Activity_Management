import { useState, useMemo, useEffect } from 'react'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import {
  IconSearch,
  IconBell,
  IconPlus,
  IconCheck,
  IconClose,
  IconEye,
  IconClock,
  IconAlertCircle,
  IconClipboardCheck,
  IconActivity,
  IconUsers,
  IconFilter,
} from '../components/icons/Icons'
import { initialFacultyActivities } from '../data/facultyActivitiesData'
import {
  getStoredFacultyReceivedNotifications,
  saveStoredFacultyReceivedNotifications,
  getStoredFacultySentNotifications,
  saveStoredFacultySentNotifications,
  FACULTY_NOTIFICATIONS_EVENT_KEY,
  facultyNotificationTypes,
  createNotificationTypes,
  targetAudienceOptions,
  departmentOptions,
  courseOptions,
  academicYearOptions,
} from '../data/facultyNotificationsData'

export default function FacultyNotifications() {
  // 1. Data States
  const [receivedNotifications, setReceivedNotifications] = useState(
    getStoredFacultyReceivedNotifications
  )
  const [sentNotifications, setSentNotifications] = useState(
    getStoredFacultySentNotifications
  )

  // 2. Tab & Filter States
  const [activeTab, setActiveTab] = useState('received') // 'received' | 'sent'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Unread' | 'Read'
  const [typeFilter, setTypeFilter] = useState('All') // 'All' | 'Announcement' | 'Administrative' | 'System' | 'Activity'

  // 3. Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // 4. Toast / Alert state
  const [toastMessage, setToastMessage] = useState(null)

  // 5. Create Notification Form State
  const initialFormState = {
    title: '',
    message: '',
    type: 'General Announcement',
    targetAudience: 'All Students',
    department: departmentOptions[0],
    course: courseOptions[0],
    academicYear: academicYearOptions[0],
    relatedActivityId: '',
  }
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Sync state if storage updates externally
  useEffect(() => {
    const handleSync = () => {
      setReceivedNotifications(getStoredFacultyReceivedNotifications())
      setSentNotifications(getStoredFacultySentNotifications())
    }
    window.addEventListener(FACULTY_NOTIFICATIONS_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(FACULTY_NOTIFICATIONS_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Auto dismiss toast message after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // ==============================================================
  // METRICS & COUNTERS
  // ==============================================================
  const unreadCount = useMemo(
    () => receivedNotifications.filter((n) => n.isUnread).length,
    [receivedNotifications]
  )

  const highPriorityCount = useMemo(
    () =>
      receivedNotifications.filter(
        (n) => n.priority === 'High' || n.priority === 'Urgent'
      ).length,
    [receivedNotifications]
  )

  // ==============================================================
  // FILTERING LOGIC
  // ==============================================================
  const filteredReceived = useMemo(() => {
    return receivedNotifications.filter((item) => {
      // Status filter
      if (statusFilter === 'Unread' && !item.isUnread) return false
      if (statusFilter === 'Read' && item.isUnread) return false

      // Type filter
      if (typeFilter !== 'All' && item.type !== typeFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesMessage = item.message.toLowerCase().includes(q)
        const matchesSender = item.sender?.toLowerCase().includes(q)
        const matchesType = item.type.toLowerCase().includes(q)
        if (!matchesTitle && !matchesMessage && !matchesSender && !matchesType) {
          return false
        }
      }

      return true
    })
  }, [receivedNotifications, statusFilter, typeFilter, searchQuery])

  const filteredSent = useMemo(() => {
    return sentNotifications.filter((item) => {
      // Type filter (match substring or type)
      if (typeFilter !== 'All') {
        const matchesType = item.type
          .toLowerCase()
          .includes(typeFilter.toLowerCase())
        if (!matchesType) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesMessage = item.message.toLowerCase().includes(q)
        const matchesAudience = item.audience?.toLowerCase().includes(q)
        const matchesActivity = item.relatedActivity?.toLowerCase().includes(q)
        if (
          !matchesTitle &&
          !matchesMessage &&
          !matchesAudience &&
          !matchesActivity
        ) {
          return false
        }
      }

      return true
    })
  }, [sentNotifications, typeFilter, searchQuery])

  // ==============================================================
  // ACTIONS: Mark as read / Mark all as read
  // ==============================================================
  const handleToggleReadStatus = (id, e) => {
    if (e) e.stopPropagation()
    const updated = receivedNotifications.map((notif) =>
      notif.id === id ? { ...notif, isUnread: !notif.isUnread } : notif
    )
    setReceivedNotifications(updated)
    saveStoredFacultyReceivedNotifications(updated)
  }

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      setToastMessage('All notifications are already marked as read.')
      return
    }
    const updated = receivedNotifications.map((notif) => ({
      ...notif,
      isUnread: false,
    }))
    setReceivedNotifications(updated)
    saveStoredFacultyReceivedNotifications(updated)
    setToastMessage('All received notifications marked as read.')
  }

  // Open detail modal
  const handleOpenDetail = (notif) => {
    setSelectedNotification(notif)
    setIsDetailModalOpen(true)

    // If it's a received unread notification, automatically mark as read
    if (notif.isUnread) {
      const updated = receivedNotifications.map((item) =>
        item.id === notif.id ? { ...item, isUnread: false } : item
      )
      setReceivedNotifications(updated)
      saveStoredFacultyReceivedNotifications(updated)
    }
  }

  // ==============================================================
  // CREATE NOTIFICATION (Admin -> Students)
  // ==============================================================
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSendNotification = (e) => {
    e.preventDefault()

    // Validation
    const errors = {}
    if (!formData.title.trim()) {
      errors.title = 'Notification title is required.'
    }
    if (!formData.message.trim()) {
      errors.message = 'Notification message cannot be empty.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Determine target audience label
    let audienceLabel = 'All Students'
    let targetVal = 'All Students'
    if (formData.targetAudience === 'Department') {
      audienceLabel = `Department: ${formData.department}`
      targetVal = formData.department
    } else if (formData.targetAudience === 'Course') {
      audienceLabel = `Course: ${formData.course}`
      targetVal = formData.course
    } else if (formData.targetAudience === 'Academic Year') {
      audienceLabel = `Year: ${formData.academicYear}`
      targetVal = formData.academicYear
    }

    // Related activity title
    let relatedActivityTitle = null
    if (formData.relatedActivityId) {
      const act = initialFacultyActivities.find(
        (a) => a.id === formData.relatedActivityId
      )
      if (act) relatedActivityTitle = act.title
    }

    const now = new Date()
    const timeString = `Today, ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`

    const newNotification = {
      id: `notif-sent-${Date.now()}`,
      title: formData.title.trim(),
      message: formData.message.trim(),
      type: formData.type,
      audience: audienceLabel,
      targetType: formData.targetAudience,
      targetValue: targetVal,
      relatedActivity: relatedActivityTitle,
      date: timeString,
      timestamp: now.toISOString(),
      status: 'Sent',
      recipientCount:
        formData.targetAudience === 'All Students'
          ? 1250
          : formData.targetAudience === 'Department'
          ? 340
          : 180,
      sender: 'Prof. David Vance (Admin)',
    }

    const updatedSent = [newNotification, ...sentNotifications]
    setSentNotifications(updatedSent)
    saveStoredFacultySentNotifications(updatedSent)

    // Reset and close
    setFormData(initialFormState)
    setFormErrors({})
    setIsCreateModalOpen(false)

    // Switch to 'sent' tab so Admin sees their newly sent notification
    setActiveTab('sent')
    setToastMessage('Notification sent successfully.')
  }

  // Type badge helper
  const renderTypeBadge = (type) => {
    switch (type) {
      case 'Announcement':
      case 'General Announcement':
        return (
          <Badge variant="primary" size="sm">
            {type}
          </Badge>
        )
      case 'Administrative':
      case 'Important Notice':
        return (
          <Badge variant="secondary" size="sm">
            {type}
          </Badge>
        )
      case 'System':
      case 'Deadline Reminder':
        return (
          <Badge variant="warning" size="sm">
            {type}
          </Badge>
        )
      case 'Activity':
      case 'Activity Update':
        return (
          <Badge variant="success" size="sm">
            {type}
          </Badge>
        )
      case 'Registration Reminder':
        return (
          <Badge variant="primary" size="sm">
            {type}
          </Badge>
        )
      default:
        return (
          <Badge variant="neutral" size="sm">
            {type}
          </Badge>
        )
    }
  }

  // Type icon helper
  const renderTypeIcon = (type) => {
    if (type === 'Announcement' || type === 'General Announcement') {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0">
          <IconBell className="w-5 h-5" />
        </div>
      )
    }
    if (type === 'Administrative' || type === 'Important Notice') {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shrink-0">
          <IconClipboardCheck className="w-5 h-5" />
        </div>
      )
    }
    if (type === 'System' || type === 'Deadline Reminder') {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shrink-0">
          <IconAlertCircle className="w-5 h-5" />
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
        <IconActivity className="w-5 h-5" />
      </div>
    )
  }

  return (
    <FacultyLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                  */}
      {/* ============================================================== */}
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with administrative communications and keep students informed."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<IconPlus className="w-4 h-4" />}
              onClick={() => {
                setFormData(initialFormState)
                setFormErrors({})
                setIsCreateModalOpen(true)
              }}
              className="shadow-sm font-semibold cursor-pointer"
            >
              Create Notification
            </Button>
          </div>
        }
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 rounded-lg hover:bg-emerald-100/60 cursor-pointer"
            aria-label="Dismiss alert"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. STATS OVERVIEW CARDS                                        */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Received */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Received Inbox
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <IconBell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {receivedNotifications.length}
            </span>
            <span className="text-xs text-slate-500">total alerts</span>
          </div>
        </div>

        {/* Card 2: Unread Notices */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unread Action Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <IconAlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-600">
              {unreadCount}
            </span>
            <span className="text-xs text-slate-500">require attention</span>
          </div>
        </div>

        {/* Card 3: Announcements Sent */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sent to Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {sentNotifications.length}
            </span>
            <span className="text-xs text-slate-500">broadcasts</span>
          </div>
        </div>

        {/* Card 4: High Priority */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              High Priority Notices
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600">
              {highPriorityCount}
            </span>
            <span className="text-xs text-slate-500">urgent notices</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DIRECTION TABS: Received vs Sent to Students                */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 px-4 sm:px-6 pt-3 pb-0 bg-slate-50/50 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Tab 1: Received Communications */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('received')
                setStatusFilter('All')
                setTypeFilter('All')
              }}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'received'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Received Communications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-700 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </button>

            {/* Tab 2: Sent to Students */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('sent')
                setStatusFilter('All')
                setTypeFilter('All')
              }}
              className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sent'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Sent to Students</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-full">
                {sentNotifications.length}
              </span>
            </button>
          </div>

          {/* Subtext info */}
          <div className="pb-3 text-xs text-slate-400 font-medium hidden md:block">
            {activeTab === 'received'
              ? 'Super Admin & Campus Administration alerts to Faculty'
              : 'Official broadcasts and reminders sent to students'}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. SEARCH AND FILTERS TOOLBAR                                */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'received'
                    ? 'Search notifications by title, sender, or content...'
                    : 'Search sent notices by title, cohort, or activity...'
                }
                className="w-full pl-10 pr-9 py-2 rounded-xl text-sm border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <IconClose className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Status Filters (Only applicable for Received Tab) */}
              {activeTab === 'received' && (
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
                  {['All', 'Unread', 'Read'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        statusFilter === status
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}

              {/* Type Filter Dropdown */}
              <div className="relative flex items-center">
                <IconFilter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-8 pr-8 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  aria-label="Filter by notification type"
                >
                  {facultyNotificationTypes.map((t) => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'All Notification Types' : `${t} Notices`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mark All As Read Button (For Received Tab) */}
              {activeTab === 'received' && unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<IconCheck className="w-3.5 h-3.5" />}
                  onClick={handleMarkAllAsRead}
                  className="text-xs cursor-pointer"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. NOTIFICATION CARDS LIST                                    */}
        {/* ============================================================ */}
        <div className="divide-y divide-slate-100">
          {activeTab === 'received' ? (
            // ==========================================
            // TAB 1: RECEIVED NOTIFICATIONS
            // ==========================================
            filteredReceived.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <IconBell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No notifications found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
                    ? 'No communications match your current filter criteria.'
                    : 'You are all caught up! There are no received notifications.'}
                </p>
                {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('All')
                      setTypeFilter('All')
                    }}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>
            ) : (
              filteredReceived.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleOpenDetail(notif)}
                  className={`p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-50/90 ${
                    notif.isUnread
                      ? 'bg-blue-50/25 border-l-4 border-l-blue-600'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Left: Icon Container */}
                  {renderTypeIcon(notif.type)}

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {renderTypeBadge(notif.type)}
                      {notif.priority === 'Urgent' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                          Urgent
                        </span>
                      )}
                      {notif.priority === 'High' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                          High Priority
                        </span>
                      )}
                      {notif.isUnread && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm tracking-tight text-slate-900 ${
                        notif.isUnread ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-500">
                        From: {notif.sender}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <IconClock className="w-3.5 h-3.5 text-slate-400" />
                        {notif.date}
                      </span>
                      {notif.relatedActivity && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[10px]">
                          Related: {notif.relatedActivity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleReadStatus(notif.id, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        notif.isUnread
                          ? 'border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100/70'
                          : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-100'
                      }`}
                    >
                      {notif.isUnread ? 'Mark read' : 'Mark unread'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(notif)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="View details"
                      aria-label="View notification details"
                    >
                      <IconEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            // ==========================================
            // TAB 2: SENT ANNOUNCEMENTS (Admin -> Students)
            // ==========================================
            filteredSent.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <IconUsers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No sent announcements found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || typeFilter !== 'All'
                    ? 'No announcements match your search or filter.'
                    : 'You have not broadcasted any notifications to students yet.'}
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<IconPlus className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setFormData(initialFormState)
                      setFormErrors({})
                      setIsCreateModalOpen(true)
                    }}
                    className="cursor-pointer"
                  >
                    Create Notification
                  </Button>
                </div>
              </div>
            ) : (
              filteredSent.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleOpenDetail(notif)}
                  className="p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-50/90 border-l-4 border-l-indigo-500"
                >
                  {/* Left: Icon Container */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shrink-0">
                    <IconUsers className="w-5 h-5" />
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {renderTypeBadge(notif.type)}
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                        <IconCheck className="w-3 h-3 text-emerald-600" />
                        Sent
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full">
                        Audience: {notif.audience}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                      {notif.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-500">
                        By: {notif.sender}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <IconClock className="w-3.5 h-3.5 text-slate-400" />
                        {notif.date}
                      </span>
                      <span className="font-medium text-slate-500">
                        Recipients: ~{notif.recipientCount} students
                      </span>
                      {notif.relatedActivity && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[10px]">
                          Related: {notif.relatedActivity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(notif)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-slate-200 text-slate-600 bg-white hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <IconEye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. CREATE NOTIFICATION MODAL (Admin -> Students)               */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3
                  id="modal-title"
                  className="text-lg font-bold text-slate-900 tracking-tight"
                >
                  Create Notification
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Send a campus announcement or activity update to student cohorts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                aria-label="Close modal"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendNotification} className="mt-4 space-y-4">
              {/* Field 1: Notification Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Notification Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="e.g. Workshop Venue & Timing Confirmation"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                    formErrors.title
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Field 2: Notification Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Notification Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {createNotificationTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Target Audience */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Target Audience <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      handleFormChange('targetAudience', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {targetAudienceOptions.map((aud) => (
                      <option key={aud} value={aud}>
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Conditional Audience Selector */}
              {formData.targetAudience === 'Department' && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Select Target Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      handleFormChange('department', e.target.value)
                    }
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-blue-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {departmentOptions.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetAudience === 'Course' && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Select Target Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleFormChange('course', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-blue-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {courseOptions.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.targetAudience === 'Academic Year' && (
                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
                    Select Target Academic Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) =>
                      handleFormChange('academicYear', e.target.value)
                    }
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-blue-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {academicYearOptions.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Field 4: Related Activity (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Related Activity (Optional)
                </label>
                <select
                  value={formData.relatedActivityId}
                  onChange={(e) =>
                    handleFormChange('relatedActivityId', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">None / General Announcement</option>
                  {initialFacultyActivities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.title} ({act.type})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Connect this notification to an active campus event or registration.
                </span>
              </div>

              {/* Field 5: Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleFormChange('message', e.target.value)}
                  placeholder="Provide detailed instructions, venue revisions, timing updates, or prerequisites for students..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all leading-relaxed ${
                    formErrors.message
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {formErrors.message ? (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {formErrors.message}
                  </p>
                ) : (
                  <span className="text-[11px] text-slate-400 mt-0.5 block text-right">
                    {formData.message.length} characters
                  </span>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={<IconCheck className="w-4 h-4" />}
                  className="font-semibold shadow-sm cursor-pointer"
                >
                  Send Notification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. NOTIFICATION DETAIL MODAL                                   */}
      {/* ============================================================== */}
      {isDetailModalOpen && selectedNotification && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-title"
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                {renderTypeBadge(selectedNotification.type)}
                {selectedNotification.priority && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full">
                    Priority: {selectedNotification.priority}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
                aria-label="Close dialog"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-4 space-y-3">
              <h3
                id="detail-title"
                className="text-base font-bold text-slate-900 tracking-tight leading-snug"
              >
                {selectedNotification.title}
              </h3>

              {/* Sender & Timestamp Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">
                    {selectedNotification.sender ? 'From:' : 'Author:'}
                  </span>
                  <span>{selectedNotification.sender || 'Faculty Admin'}</span>
                </div>
                {selectedNotification.audience && (
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">To:</span>
                    <span>{selectedNotification.audience}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 ml-auto">
                  <IconClock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedNotification.date}</span>
                </div>
              </div>

              {/* Message text */}
              <div className="py-2">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Connected Activity */}
              {selectedNotification.relatedActivity && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-blue-900 block">
                      Connected Activity:
                    </span>
                    <span className="text-blue-700">
                      {selectedNotification.relatedActivity}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedNotification.isUnread !== undefined ? (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleReadStatus(selectedNotification.id)
                    setSelectedNotification((prev) => ({
                      ...prev,
                      isUnread: !prev.isUnread,
                    }))
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {selectedNotification.isUnread
                    ? 'Mark as read'
                    : 'Mark as unread'}
                </button>
              ) : (
                <div />
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </FacultyLayout>
  )
}
