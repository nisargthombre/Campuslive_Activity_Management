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
  IconSupport,
  IconPlus,
  IconCheck,
  IconClose,
  IconSearch,
  IconClock,
} from '../components/icons/Icons'
import {
  getStoredUnifiedTickets,
  saveStoredUnifiedTickets,
  UNIFIED_SUPPORT_EVENT_KEY,
  supportCategoriesList,
  supportPrioritiesList,
  supportAssigneesList,
} from '../data/unifiedSupportData'

const ORIGIN_TABS = [
  { id: 'all', label: 'All Inquiries & Tickets' },
  { id: 'student', label: 'Student Tickets' },
  { id: 'faculty', label: 'Admin / Faculty Requests' },
  { id: 'public', label: 'Public Inquiries' },
]

export default function SuperAdminSupport() {
  // 1. Core State loaded from unified architecture
  const [tickets, setTickets] = useState(() => getStoredUnifiedTickets())
  const [selectedOrigin, setSelectedOrigin] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // 2. Modals state
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [activeTicket, setActiveTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newAssignee, setNewAssignee] = useState('')
  const [newPriority, setNewPriority] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // 3. New Ticket Form State
  const initialCreateForm = {
    origin: 'student',
    subject: '',
    category: supportCategoriesList[0],
    priority: 'Medium',
    creatorName: '',
    creatorEmail: '',
    creatorDepartment: 'Computer Engineering',
    creatorPhone: '',
    description: '',
  }
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [createErrors, setCreateErrors] = useState({})

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Real-time synchronization across Student, Faculty, and Public views
  useEffect(() => {
    const handleSync = () => {
      const fresh = getStoredUnifiedTickets()
      setTickets(fresh)
      setActiveTicket((prev) => {
        if (!prev) return null
        return fresh.find((t) => t.id === prev.id) || prev
      })
    }

    window.addEventListener(UNIFIED_SUPPORT_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(UNIFIED_SUPPORT_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // KPI Calculations
  const stats = useMemo(() => {
    const total = tickets.length
    const student = tickets.filter((t) => t.origin === 'student').length
    const faculty = tickets.filter((t) => t.origin === 'faculty').length
    const publicInquiries = tickets.filter((t) => t.origin === 'public').length
    const openActive = tickets.filter(
      (t) => t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress'
    ).length
    const resolved = tickets.filter(
      (t) => t.status === 'Resolved' || t.status === 'Closed'
    ).length

    return { total, student, faculty, publicInquiries, openActive, resolved }
  }, [tickets])

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Origin Channel Tab Filter
      if (selectedOrigin !== 'all' && ticket.origin !== selectedOrigin) {
        return false
      }

      // 2. Status Filter
      if (statusFilter !== 'All') {
        if (ticket.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false
        }
      }

      // 3. Priority Filter
      if (priorityFilter !== 'All') {
        if (ticket.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
          return false
        }
      }

      // 4. Category Filter
      if (categoryFilter !== 'All') {
        if (ticket.category !== categoryFilter) {
          return false
        }
      }

      // 5. Search query (matches ticketNumber, subject, requester name, email, department)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchNum = ticket.ticketNumber?.toLowerCase().includes(q)
        const matchSubject = ticket.subject?.toLowerCase().includes(q)
        const matchName = ticket.creator?.name?.toLowerCase().includes(q) || ticket.user?.toLowerCase().includes(q)
        const matchEmail = ticket.creator?.email?.toLowerCase().includes(q)
        const matchDept = ticket.creator?.department?.toLowerCase().includes(q)

        if (!matchNum && !matchSubject && !matchName && !matchEmail && !matchDept) {
          return false
        }
      }

      return true
    })
  }, [tickets, selectedOrigin, statusFilter, priorityFilter, categoryFilter, searchQuery])

  const hasActiveFilters =
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All' ||
    searchQuery.trim() !== ''

  const handleClearFilters = () => {
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
    setSearchQuery('')
  }

  // Open Manage & Reply Modal
  const handleOpenManageModal = (ticket) => {
    setActiveTicket(ticket)
    setNewStatus(ticket.status || 'Open')
    setNewAssignee(ticket.assignedTo || 'Super Admin')
    setNewPriority(ticket.priority || 'Medium')
    setReplyText('')
    setIsManageModalOpen(true)
  }

  // Send Super Admin Official Reply
  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeTicket) return

    const now = new Date()
    const timestamp =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ` +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const superAdminMsg = {
      id: `msg-sa-${Date.now()}`,
      senderName: 'Super Admin (Sarah Jenkins)',
      senderRole: 'Super Admin',
      role: 'Super Admin',
      avatar: 'SJ',
      text: replyText.trim(),
      message: replyText.trim(),
      timestamp,
      time: timestamp,
      isStaff: true,
    }

    const updatedStatus = newStatus || (activeTicket.status === 'Open' ? 'In Progress' : activeTicket.status)

    const updatedTickets = tickets.map((t) => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: updatedStatus,
          assignedTo: newAssignee || t.assignedTo,
          priority: newPriority || t.priority,
          lastUpdated: 'Just now',
          messages: [...(t.messages || []), superAdminMsg],
        }
      }
      return t
    })

    setTickets(updatedTickets)
    saveStoredUnifiedTickets(updatedTickets)

    setActiveTicket((prev) => ({
      ...prev,
      status: updatedStatus,
      assignedTo: newAssignee || prev.assignedTo,
      priority: newPriority || prev.priority,
      lastUpdated: 'Just now',
      messages: [...(prev.messages || []), superAdminMsg],
    }))

    setReplyText('')
    showToast(
      `Official reply sent. Live synchronization updated for ${activeTicket.creator?.name || 'requester'}.`,
      'success'
    )
  }

  // Quick Status/Assignment Update from Modal
  const handleUpdateTicketProperties = () => {
    if (!activeTicket) return

    const updatedTickets = tickets.map((t) => {
      if (t.id === activeTicket.id) {
        return {
          ...t,
          status: newStatus,
          assignedTo: newAssignee,
          priority: newPriority,
          lastUpdated: 'Just now',
        }
      }
      return t
    })

    setTickets(updatedTickets)
    saveStoredUnifiedTickets(updatedTickets)
    setActiveTicket((prev) => ({
      ...prev,
      status: newStatus,
      assignedTo: newAssignee,
      priority: newPriority,
      lastUpdated: 'Just now',
    }))

    showToast(`Ticket ${activeTicket.ticketNumber} updated to ${newStatus}.`, 'info')
  }

  // Quick Action from Table: Quick Status Change
  const handleQuickStatusChange = (ticketId, nextStatus) => {
    const updatedTickets = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: nextStatus,
          lastUpdated: 'Just now',
        }
      }
      return t
    })

    setTickets(updatedTickets)
    saveStoredUnifiedTickets(updatedTickets)
    showToast(`Status updated to ${nextStatus}.`, 'info')
  }

  // Handle Create Support Ticket Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!createForm.subject.trim()) errs.subject = 'Subject is required.'
    if (!createForm.creatorName.trim()) errs.creatorName = 'Requester name is required.'
    if (!createForm.creatorEmail.trim()) errs.creatorEmail = 'Email is required.'
    if (!createForm.description.trim()) errs.description = 'Issue description is required.'

    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs)
      return
    }

    const now = new Date()
    const dateFormatted =
      now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      `, ` +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const prefix = createForm.origin === 'student' ? 'TICK-2026-0' : createForm.origin === 'faculty' ? 'SUP-' : 'INQ-'
    const num = Math.floor(1000 + Math.random() * 9000)
    const newId = `${prefix}${num}`

    const newTicket = {
      id: newId,
      ticketNumber: newId,
      origin: createForm.origin,
      subject: createForm.subject.trim(),
      category: createForm.category,
      priority: createForm.priority,
      status: 'Open',
      assignedTo: 'Super Admin',
      createdDate: dateFormatted,
      lastUpdated: 'Just now',
      description: createForm.description.trim(),
      attachmentName: null,
      creator: {
        name: createForm.creatorName.trim(),
        role:
          createForm.origin === 'student'
            ? 'Student'
            : createForm.origin === 'faculty'
            ? 'Faculty Coordinator'
            : 'Public User',
        email: createForm.creatorEmail.trim(),
        phone: createForm.creatorPhone.trim() || '+91 98000 00000',
        department: createForm.creatorDepartment,
        studentId: createForm.origin === 'student' ? `STU-2024-${num.toString().slice(0, 3)}` : undefined,
        staffId: createForm.origin === 'faculty' ? `ADM-2021-${num.toString().slice(0, 3)}` : undefined,
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: createForm.creatorName.trim(),
          senderRole:
            createForm.origin === 'student'
              ? 'Student'
              : createForm.origin === 'faculty'
              ? 'Admin'
              : 'Public User',
          role:
            createForm.origin === 'student'
              ? 'Student'
              : createForm.origin === 'faculty'
              ? 'Admin'
              : 'Public User',
          avatar: createForm.creatorName.charAt(0).toUpperCase(),
          text: createForm.description.trim(),
          message: createForm.description.trim(),
          timestamp: dateFormatted,
          time: dateFormatted,
          isStaff: createForm.origin === 'faculty',
        },
      ],
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    saveStoredUnifiedTickets(updated)

    setCreateForm(initialCreateForm)
    setCreateErrors({})
    setIsCreateModalOpen(false)
    showToast(`Support Ticket ${newId} created successfully in central system.`, 'success')
  }

  // Badges Helpers
  const getOriginBadge = (origin) => {
    switch (origin) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Student
          </span>
        )
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Admin / Faculty
          </span>
        )
      case 'public':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Public Helpdesk
          </span>
        )
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <Badge variant="danger" size="sm">Urgent</Badge>
      case 'high':
        return <Badge variant="danger" size="sm">High</Badge>
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>
      case 'low':
      default:
        return <Badge variant="neutral" size="sm">Low</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <Badge variant="info" size="sm">Open</Badge>
      case 'assigned':
        return <Badge variant="secondary" size="sm">Assigned</Badge>
      case 'in progress':
      case 'in_progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>
      case 'closed':
      default:
        return <Badge variant="neutral" size="sm">Closed</Badge>
    }
  }

  return (
    <SuperAdminLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500'
                : toastMessage.type === 'info'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          />
          <span>{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Support Management Console"
        subtitle="Central management view uniting student tickets, faculty requests, and public helpdesk inquiries under one underlying support architecture."
        breadcrumb={[
          { label: 'Home', to: '/admin/dashboard' },
          { label: 'Support & Inquiries' },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Live Sync Active
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2"
            >
              <IconPlus className="w-4 h-4" />
              Log Support Ticket
            </Button>
          </div>
        }
      />

      {/* 1. TOP KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 mb-6">
        {/* Total Inquiries */}
        <Card className="p-4 border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Total Tickets</span>
            <IconSupport className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all origins</p>
        </Card>

        {/* Student Tickets */}
        <Card
          onClick={() => setSelectedOrigin('student')}
          className={`p-4 border-slate-200/80 cursor-pointer transition-all hover:border-purple-300 hover:bg-purple-50/20 ${
            selectedOrigin === 'student' ? 'ring-2 ring-purple-500 bg-purple-50/30' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="text-purple-700 font-semibold">Student Tickets</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.student}</div>
          <p className="text-[11px] text-purple-600 mt-1 font-medium">Student portal view</p>
        </Card>

        {/* Admin / Faculty Requests */}
        <Card
          onClick={() => setSelectedOrigin('faculty')}
          className={`p-4 border-slate-200/80 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/20 ${
            selectedOrigin === 'faculty' ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="text-blue-700 font-semibold">Faculty / Admin</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.faculty}</div>
          <p className="text-[11px] text-blue-600 mt-1 font-medium">Faculty portal view</p>
        </Card>

        {/* Public Inquiries */}
        <Card
          onClick={() => setSelectedOrigin('public')}
          className={`p-4 border-slate-200/80 cursor-pointer transition-all hover:border-emerald-300 hover:bg-emerald-50/20 ${
            selectedOrigin === 'public' ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="text-emerald-700 font-semibold">Public Helpdesk</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.publicInquiries}</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">Public inquiries</p>
        </Card>

        {/* Open & Active */}
        <Card className="p-4 border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="text-amber-700 font-semibold">Open & Active</span>
            <IconClock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.openActive}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pending resolution</p>
        </Card>

        {/* Resolved / Closed */}
        <Card className="p-4 border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span className="text-emerald-700 font-semibold">Resolved</span>
            <IconCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.resolved}</div>
          <p className="text-[11px] text-slate-400 mt-1">Archived & completed</p>
        </Card>
      </div>

      {/* 2. ORIGIN CHANNEL TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl mb-4 border border-slate-200/80 overflow-x-auto">
        {ORIGIN_TABS.map((tab) => {
          const isActive = selectedOrigin === tab.id
          let badgeCount = stats.total
          if (tab.id === 'student') badgeCount = stats.student
          if (tab.id === 'faculty') badgeCount = stats.faculty
          if (tab.id === 'public') badgeCount = stats.publicInquiries

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedOrigin(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {badgeCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* 3. FILTERS & SEARCH BAR */}
      <Card className="p-4 mb-6 border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="lg:col-span-5 relative">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, requester name, email, or subject..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="All">Status: All</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="All">Category: All</option>
              {supportCategoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="lg:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200/60"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* 4. CENTRAL TICKET ROSTER TABLE */}
      <Card className="overflow-hidden border-slate-200/80 shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Central Ticket System Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredTickets.length} of {tickets.length} total tickets
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Synchronized across Student, Faculty & Public portals</span>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={IconSupport}
              title="No tickets found"
              description="No tickets match the selected filters or search parameters."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Clear Active Filters
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Origin Channel</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((ticket) => {
                  const requesterName = ticket.creator?.name || ticket.user || 'Unknown User'
                  const requesterRole = ticket.creator?.role || ticket.userRole || 'User'
                  const requesterEmail = ticket.creator?.email || 'N/A'
                  const requesterDept = ticket.creator?.department || 'General'

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => handleOpenManageModal(ticket)}
                    >
                      {/* Ticket Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {ticket.ticketNumber}
                      </td>

                      {/* Origin Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getOriginBadge(ticket.origin)}
                      </td>

                      {/* Subject & Category */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {ticket.subject}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{ticket.category}</span>
                          {ticket.attachmentName && (
                            <span className="text-blue-500 font-medium">📎 file</span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span>{ticket.messages?.length || 1} msg(s)</span>
                        </div>
                      </td>

                      {/* Requester Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{requesterName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          {requesterEmail}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {requesterDept} ({requesterRole})
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>

                      {/* Assigned To */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {ticket.assignedTo || 'Super Admin'}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                        {ticket.lastUpdated}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenManageModal(ticket)}
                            className="text-xs py-1 px-2.5"
                          >
                            Manage & Reply
                          </Button>

                          {ticket.status !== 'Resolved' && ticket.status !== 'Closed' ? (
                            <button
                              type="button"
                              title="Quick Mark Resolved"
                              onClick={() => handleQuickStatusChange(ticket.id, 'Resolved')}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <IconCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Reopen Ticket"
                              onClick={() => handleQuickStatusChange(ticket.id, 'In Progress')}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors text-[10px] font-bold"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 5. MANAGE & REPLY MODAL (CENTRAL CONSOLE ACTION) */}
      {isManageModalOpen && activeTicket && (
        <Modal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          title={`Ticket Console: ${activeTicket.ticketNumber}`}
          size="xl"
        >
          <div className="space-y-5">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                {getOriginBadge(activeTicket.origin)}
                <span className="text-xs font-semibold text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-700">
                  Category: {activeTicket.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">•</span>
                <span className="text-xs text-slate-500">
                  Created: {activeTicket.createdDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(activeTicket.priority)}
                {getStatusBadge(activeTicket.status)}
              </div>
            </div>

            {/* Subject */}
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {activeTicket.subject}
              </h2>
            </div>

            {/* Requester Profile Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-xl bg-blue-50/40 border border-blue-100/80 text-xs">
              <div>
                <span className="block text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                  Requester Name
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {activeTicket.creator?.name || activeTicket.user || 'Unknown User'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Role: {activeTicket.creator?.role || activeTicket.userRole || 'User'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                  Contact Email
                </span>
                <span className="font-medium text-slate-800 mt-0.5 block truncate">
                  {activeTicket.creator?.email || 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500">
                  Phone: {activeTicket.creator?.phone || 'N/A'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                  Department / Unit
                </span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {activeTicket.creator?.department || 'General Campus'}
                </span>
                {activeTicket.creator?.studentId && (
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {activeTicket.creator.studentId}
                  </span>
                )}
                {activeTicket.creator?.staffId && (
                  <span className="text-[11px] font-mono text-slate-500">
                    Staff ID: {activeTicket.creator.staffId}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                  Handling Assignment
                </span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {activeTicket.assignedTo || 'Super Admin'}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Status: {activeTicket.status}
                </span>
              </div>
            </div>

            {/* Original Request Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <span className="block font-semibold text-slate-500 text-[10px] uppercase tracking-wider mb-1">
                Original Request / Issue Description
              </span>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                {activeTicket.description}
              </p>
              {activeTicket.attachmentName && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-medium text-[11px]">
                  <span>📎 Attached Document:</span>
                  <span className="font-semibold">{activeTicket.attachmentName}</span>
                </div>
              )}
            </div>

            {/* Support Conversation Thread */}
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Conversation Thread ({activeTicket.messages?.length || 1} messages)
                </span>
                <span className="text-[11px] text-slate-400">
                  Shared across student/faculty & Super Admin consoles
                </span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activeTicket.messages && activeTicket.messages.length > 0 ? (
                  activeTicket.messages.map((msg) => {
                    const isStaff = msg.isStaff || msg.senderRole === 'Super Admin' || msg.senderRole === 'Admin'
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 text-xs ${isStaff ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isStaff && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {msg.avatar || 'U'}
                          </div>
                        )}

                        <div
                          className={`max-w-md rounded-2xl p-3.5 ${
                            isStaff
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/70'
                          }`}
                        >
                          <div
                            className={`flex items-center justify-between gap-3 text-[10px] mb-1 pb-1 border-b ${
                              isStaff
                                ? 'border-blue-500/50 text-blue-100'
                                : 'border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{msg.senderName}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full font-semibold ${
                                  isStaff ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {msg.senderRole || msg.role || (isStaff ? 'Staff' : 'User')}
                              </span>
                            </div>
                            <span>{msg.timestamp || msg.time}</span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">
                            {msg.text || msg.message}
                          </p>
                        </div>

                        {isStaff && (
                          <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {msg.avatar || 'SA'}
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No conversation messages yet.</p>
                )}
              </div>
            </div>

            {/* Quick Status / Assignment / Priority Controls */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Ticket Control Panel
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Update Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Assignee Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assignee:
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {supportAssigneesList.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Priority:
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {(newStatus !== activeTicket.status ||
                newAssignee !== activeTicket.assignedTo ||
                newPriority !== activeTicket.priority) && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateTicketProperties}
                    className="text-xs"
                  >
                    Apply Status & Assignment Updates
                  </Button>
                </div>
              )}
            </div>

            {/* Official Super Admin Reply Box */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Send Official Super Admin Reply:
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write an official response to ${
                    activeTicket.creator?.name || 'requester'
                  }... (This will be immediately visible in their portal)`}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Replies are saved to the unified ticket store and instantly broadcast to user portals.
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsManageModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!replyText.trim()}
                    className="gap-1.5"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    Send Official Reply
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* 6. CREATE TICKET MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Log Support Ticket in Central System"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Origin Channel Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Ticket Origin Channel:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCreateForm((prev) => ({ ...prev, origin: 'student' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    createForm.origin === 'student'
                      ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-400'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Student Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setCreateForm((prev) => ({ ...prev, origin: 'faculty' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    createForm.origin === 'faculty'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-400'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Admin / Faculty Request
                </button>
                <button
                  type="button"
                  onClick={() => setCreateForm((prev) => ({ ...prev, origin: 'public' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    createForm.origin === 'public'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Public Inquiry
                </button>
              </div>
            </div>

            {/* Requester Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requester Full Name *
                </label>
                <Input
                  type="text"
                  value={createForm.creatorName}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, creatorName: e.target.value }))
                  }
                  placeholder="e.g. Rahul Sharma"
                />
                {createErrors.creatorName && (
                  <p className="text-[11px] text-rose-600 mt-1">{createErrors.creatorName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requester Email *
                </label>
                <Input
                  type="email"
                  value={createForm.creatorEmail}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, creatorEmail: e.target.value }))
                  }
                  placeholder="e.g. r.sharma@campus.edu"
                />
                {createErrors.creatorEmail && (
                  <p className="text-[11px] text-rose-600 mt-1">{createErrors.creatorEmail}</p>
                )}
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category:
                </label>
                <Select
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  options={supportCategoriesList.map((c) => ({ label: c, value: c }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Priority:
                </label>
                <Select
                  value={createForm.priority}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  options={supportPrioritiesList.map((p) => ({ label: p, value: p }))}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject / Issue Title *
              </label>
              <Input
                type="text"
                value={createForm.subject}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Brief summary of the issue or inquiry"
              />
              {createErrors.subject && (
                <p className="text-[11px] text-rose-600 mt-1">{createErrors.subject}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Description *
              </label>
              <Textarea
                rows={4}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Detailed explanation of the issue or inquiry..."
              />
              {createErrors.description && (
                <p className="text-[11px] text-rose-600 mt-1">{createErrors.description}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Broadcast Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </SuperAdminLayout>
  )
}
