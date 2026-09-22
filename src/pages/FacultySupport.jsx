import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import {
  IconSearch,
  IconPlus,
  IconClose,
  IconCheck,
  IconClock,
  IconArrowLeft,
  IconAlertCircle,
  IconClipboardCheck,
} from '../components/icons/Icons'
import {
  getStoredFacultySupportTickets,
  saveStoredFacultySupportTickets,
  FACULTY_SUPPORT_EVENT_KEY,
  supportCategoriesList,
  supportPrioritiesList,
  supportStatusesList,
  supportAssigneesList,
} from '../data/facultySupportData'

export default function FacultySupport() {
  const { id: paramTicketId } = useParams()
  const navigate = useNavigate()

  // 1. Core Data State
  const [tickets, setTickets] = useState(getStoredFacultySupportTickets)

  // 2. Filter & Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // 3. UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [replyText, setReplyText] = useState('')

  // 4. Create Ticket Form State
  const initialFormState = {
    subject: '',
    category: 'Technical Issue',
    priority: 'Medium',
    description: '',
    attachmentFile: null,
    attachmentName: '',
  }
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const fileInputRef = useRef(null)

  // Sync state if storage updates externally
  useEffect(() => {
    const handleSync = () => {
      setTickets(getStoredFacultySupportTickets())
    }
    window.addEventListener(FACULTY_SUPPORT_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(FACULTY_SUPPORT_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Selected Ticket for Details (either from route param or null)
  const selectedTicket = useMemo(() => {
    if (!paramTicketId) return null
    return (
      tickets.find(
        (t) =>
          t.id === paramTicketId ||
          t.ticketNumber.replace('#', '') === paramTicketId
      ) || null
    )
  }, [tickets, paramTicketId])

  // ==============================================================
  // METRICS & SUMMARY CARDS
  // ==============================================================
  const openCount = useMemo(
    () =>
      tickets.filter(
        (t) => t.status === 'OPEN' || t.status === 'ASSIGNED'
      ).length,
    [tickets]
  )

  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    [tickets]
  )

  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === 'RESOLVED').length,
    [tickets]
  )

  const totalCount = tickets.length

  // ==============================================================
  // FILTERING LOGIC (AND logic between filters)
  // ==============================================================
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        const formattedStatus = statusFilter.toUpperCase().replace(/\s+/g, '_')
        if (ticket.status !== formattedStatus) return false
      }

      // 2. Priority Filter
      if (priorityFilter !== 'All') {
        if (
          ticket.priority.toLowerCase() !== priorityFilter.toLowerCase()
        ) {
          return false
        }
      }

      // 3. Category Filter
      if (categoryFilter !== 'All') {
        if (ticket.category !== categoryFilter) return false
      }

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesNumber = ticket.ticketNumber.toLowerCase().includes(q)
        const matchesSubject = ticket.subject.toLowerCase().includes(q)
        const matchesUser = ticket.user?.toLowerCase().includes(q)
        const matchesDesc = ticket.description?.toLowerCase().includes(q)
        if (!matchesNumber && !matchesSubject && !matchesUser && !matchesDesc) {
          return false
        }
      }

      return true
    })
  }, [tickets, statusFilter, priorityFilter, categoryFilter, searchQuery])

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

  // ==============================================================
  // STATUS & PRIORITY BADGE RENDERERS
  // ==============================================================
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Open
          </span>
        )
      case 'ASSIGNED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Assigned
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            In Progress
          </span>
        )
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        )
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        )
    }
  }

  const renderPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Urgent
          </span>
        )
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            High
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Medium
          </span>
        )
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Low
          </span>
        )
    }
  }

  // ==============================================================
  // TICKET DETAIL ACTIONS (Status, Priority, Assignment, Reply)
  // ==============================================================
  const handleUpdateStatus = (ticketId, newStatus) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            status: newStatus,
            lastUpdated: 'Just now',
          }
        : t
    )
    setTickets(updated)
    saveStoredFacultySupportTickets(updated)
    setToastMessage(`Ticket status updated to ${newStatus.replace('_', ' ')}.`)
  }

  const handleUpdatePriority = (ticketId, newPriority) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            priority: newPriority,
            lastUpdated: 'Just now',
          }
        : t
    )
    setTickets(updated)
    saveStoredFacultySupportTickets(updated)
    setToastMessage(`Ticket priority updated to ${newPriority}.`)
  }

  const handleUpdateAssignment = (ticketId, newAssignee) => {
    const updated = tickets.map((t) =>
      t.id === ticketId
        ? {
            ...t,
            assignedTo: newAssignee,
            status:
              newAssignee !== 'Unassigned' && t.status === 'OPEN'
                ? 'ASSIGNED'
                : t.status,
            lastUpdated: 'Just now',
          }
        : t
    )
    setTickets(updated)
    saveStoredFacultySupportTickets(updated)
    setToastMessage(`Ticket assigned to ${newAssignee}.`)
  }

  const handleSendReply = (ticketId, e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    const now = new Date()
    const timeFormatted = `Today, ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderName: 'Prof. David Vance',
      senderRole: 'Admin',
      avatar: 'DV',
      message: replyText.trim(),
      time: timeFormatted,
    }

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...(t.messages || []), newMsg],
          lastUpdated: timeFormatted,
          status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
        }
      }
      return t
    })

    setTickets(updated)
    saveStoredFacultySupportTickets(updated)
    setReplyText('')
    setToastMessage('Reply sent successfully.')
  }

  // ==============================================================
  // CREATE SUPPORT TICKET MODAL
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachmentFile: file,
        attachmentName: file.name,
      }))
    }
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()

    const errors = {}
    if (!formData.subject.trim()) {
      errors.subject = 'Ticket subject is required.'
    }
    if (!formData.description.trim()) {
      errors.description = 'Please provide a detailed description.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Generate unique ticket number: #SUP-1025, #SUP-1026, etc.
    const highestNum = tickets.reduce((max, t) => {
      const match = t.ticketNumber.match(/\d+/)
      const val = match ? parseInt(match[0], 10) : 1000
      return Math.max(max, val)
    }, 1024)

    const nextNum = highestNum + 1
    const newTicketId = `SUP-${nextNum}`
    const ticketNumber = `#SUP-${nextNum}`

    const now = new Date()
    const timeFormatted = `Today, ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`

    const newTicket = {
      id: newTicketId,
      ticketNumber,
      subject: formData.subject.trim(),
      user: 'Prof. David Vance (Admin)',
      userRole: 'Admin',
      category: formData.category,
      priority: formData.priority,
      status: 'OPEN',
      assignedTo: 'Super Admin',
      createdDate: timeFormatted,
      lastUpdated: timeFormatted,
      description: formData.description.trim(),
      attachmentName: formData.attachmentName || null,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'Prof. David Vance',
          senderRole: 'Admin',
          avatar: 'DV',
          message: formData.description.trim(),
          time: timeFormatted,
        },
      ],
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    saveStoredFacultySupportTickets(updated)

    // Reset and close
    setFormData(initialFormState)
    setFormErrors({})
    setIsCreateModalOpen(false)
    setToastMessage('Support ticket created successfully.')

    // Navigate to ticket detail view
    navigate(`/faculty/support/${newTicketId}`)
  }

  return (
    <FacultyLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                  */}
      {/* ============================================================== */}
      <PageHeader
        title="Support"
        subtitle="Get help, track support requests, and communicate with the support team."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Support' },
          ...(selectedTicket ? [{ label: selectedTicket.ticketNumber }] : []),
        ]}
        actions={
          <div className="flex items-center gap-3">
            {selectedTicket && (
              <Button
                variant="outline"
                size="md"
                icon={<IconArrowLeft className="w-4 h-4" />}
                onClick={() => navigate('/faculty/support')}
                className="cursor-pointer"
              >
                Back to Tickets
              </Button>
            )}
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
              Create Support Ticket
            </Button>
          </div>
        }
      />

      {/* Toast Alert */}
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
      {/* VIEW A: TICKET DETAIL INTERFACE (/faculty/support/:id)         */}
      {/* ============================================================== */}
      {selectedTicket ? (
        <div className="space-y-6">
          {/* Ticket Header & Control Bar */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {selectedTicket.ticketNumber}
                  </span>
                  {renderStatusBadge(selectedTicket.status)}
                  {renderPriorityBadge(selectedTicket.priority)}
                  <Badge variant="neutral" size="sm">
                    {selectedTicket.category}
                  </Badge>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                  {selectedTicket.subject}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>
                    Initiated by:{' '}
                    <strong className="text-slate-700">
                      {selectedTicket.user}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Created: <strong>{selectedTicket.createdDate}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Last Updated: <strong>{selectedTicket.lastUpdated}</strong>
                  </span>
                </div>
              </div>

              {/* Status, Priority & Assignee Quick-Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedTicket.id, e.target.value)
                    }
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                {/* Priority Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedTicket.priority.toUpperCase()}
                    onChange={(e) =>
                      handleUpdatePriority(selectedTicket.id, e.target.value)
                    }
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                {/* Assignee Dropdown */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={selectedTicket.assignedTo || 'Unassigned'}
                    onChange={(e) =>
                      handleUpdateAssignment(selectedTicket.id, e.target.value)
                    }
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {supportAssigneesList.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ticket Description & Attachment */}
            <div className="pt-4 text-sm text-slate-700 leading-relaxed">
              <p className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-1">
                Original Request Description:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800 border border-slate-100 leading-relaxed whitespace-pre-line">
                {selectedTicket.description}
              </div>

              {selectedTicket.attachmentName && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-700 font-medium">
                  <span>📎 Attachment:</span>
                  <span className="font-semibold">
                    {selectedTicket.attachmentName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Thread */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
              <span>Support Conversation</span>
              <span className="text-xs font-medium text-slate-400">
                {selectedTicket.messages?.length || 0} message
                {(selectedTicket.messages?.length || 0) === 1 ? '' : 's'}
              </span>
            </h3>

            {/* Messages List */}
            <div className="space-y-4 mb-6">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((msg) => {
                  const isAdmin =
                    msg.senderRole === 'Admin' || msg.senderRole === 'Faculty'
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3.5 ${
                        isAdmin ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {msg.avatar || 'U'}
                        </div>
                      )}

                      <div
                        className={`max-w-xl rounded-2xl p-4 text-sm shadow-2xs ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-100/90 text-slate-800 rounded-tl-xs'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-between gap-3 text-[11px] mb-1.5 pb-1 border-b ${
                            isAdmin
                              ? 'border-blue-500/50 text-blue-100'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{msg.senderName}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                isAdmin
                                  ? 'bg-blue-700 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {msg.senderRole}
                            </span>
                          </div>
                          <span>{msg.time}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">
                          {msg.message}
                        </p>
                      </div>

                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {msg.avatar || 'DV'}
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No conversation messages yet.
                </p>
              )}
            </div>

            {/* Reply Area */}
            <form
              onSubmit={(e) => handleSendReply(selectedTicket.id, e)}
              className="pt-4 border-t border-slate-100"
            >
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Write a reply...
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the support ticket..."
                className="w-full p-3.5 rounded-xl text-sm border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  Replying as{' '}
                  <strong className="text-slate-700">Prof. David Vance</strong>{' '}
                  (Admin)
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!replyText.trim()}
                  className="font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // ==============================================================
        // VIEW B: MAIN SUPPORT TICKETS LIST & FILTERS                    //
        // ==============================================================
        <div className="space-y-6">
          {/* 2. SUPPORT SUMMARY CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Open Tickets */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Open Tickets
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <IconAlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600">
                  {openCount}
                </span>
                <span className="text-xs text-slate-500">pending response</span>
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  In Progress
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <IconClock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600">
                  {inProgressCount}
                </span>
                <span className="text-xs text-slate-500">being resolved</span>
              </div>
            </div>

            {/* Card 3: Resolved */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resolved
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IconCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600">
                  {resolvedCount}
                </span>
                <span className="text-xs text-slate-500">completed</span>
              </div>
            </div>

            {/* Card 4: Total Tickets */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Tickets
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <IconClipboardCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {totalCount}
                </span>
                <span className="text-xs text-slate-500">all submissions</span>
              </div>
            </div>
          </div>

          {/* 3. SEARCH & FILTERS BAR */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IconSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tickets by number, subject, user..."
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

              {/* Filters Group (AND Logic) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by Status"
                  >
                    {supportStatusesList.map((st) => (
                      <option key={st} value={st}>
                        {st === 'All' ? 'All Statuses' : st}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by Priority"
                  >
                    <option value="All">All Priorities</option>
                    {supportPrioritiesList.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr} Priority
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by Category"
                  >
                    <option value="All">All Categories</option>
                    {supportCategoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Count Bar */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of{' '}
                <strong className="text-slate-800">{tickets.length}</strong> tickets
              </span>
              {hasActiveFilters && (
                <span className="text-[11px] text-blue-600 font-medium">
                  Filters active (Combined with AND logic)
                </span>
              )}
            </div>
          </div>

          {/* 4. SUPPORT TICKET LIST / TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {filteredTickets.length === 0 ? (
              // 13. EMPTY STATE
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <IconClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  No support tickets found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'No support tickets match the selected filters or search query.'
                    : 'Create a support ticket when you need help from the support team.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="cursor-pointer"
                    >
                      Clear Filters
                    </Button>
                  )}
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
                    Create Support Ticket
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Ticket</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created</th>
                        <th className="py-3 px-4">Last Updated</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() =>
                            navigate(`/faculty/support/${ticket.id}`)
                          }
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Ticket Number */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {ticket.ticketNumber}
                          </td>

                          {/* Subject */}
                          <td className="py-3.5 px-4 max-w-xs font-semibold text-slate-800">
                            <span className="line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {ticket.subject}
                            </span>
                            <span className="text-[11px] font-normal text-slate-400 block mt-0.5">
                              {ticket.user}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {ticket.category}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderPriorityBadge(ticket.priority)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderStatusBadge(ticket.status)}
                          </td>

                          {/* Created */}
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {ticket.createdDate}
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {ticket.lastUpdated}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/faculty/support/${ticket.id}`)
                              }}
                              className="px-3 py-1.5 rounded-lg font-semibold text-xs text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 transition-all cursor-pointer shadow-2xs"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => navigate(`/faculty/support/${ticket.id}`)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {ticket.ticketNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {renderStatusBadge(ticket.status)}
                          {renderPriorityBadge(ticket.priority)}
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {ticket.subject}
                      </h4>

                      <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>{ticket.category}</span>
                        <span className="font-semibold text-blue-600">
                          View Details →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 11. CREATE SUPPORT TICKET MODAL                                */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-ticket-title"
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3
                  id="create-ticket-title"
                  className="text-lg font-bold text-slate-900 tracking-tight"
                >
                  Create Support Ticket
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit a request or technical issue to the campus administration and support desk.
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
            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              {/* Field 1: Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleFormChange('subject', e.target.value)}
                  placeholder="e.g. Unable to register students for workshop"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                    formErrors.subject
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {formErrors.subject && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              {/* Field 2 & 3: Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleFormChange('category', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {supportCategoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleFormChange('priority', e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {supportPrioritiesList.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field 4: Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange('description', e.target.value)
                  }
                  placeholder="Describe the issue, steps to reproduce, or administrative assistance required..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all leading-relaxed ${
                    formErrors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Field 5: Optional Attachment UI (Frontend Visual Phase) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Optional Attachment
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Choose File...
                  </button>
                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    {formData.attachmentName || 'No file chosen'}
                  </span>
                  {formData.attachmentName && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          attachmentFile: null,
                          attachmentName: '',
                        }))
                      }
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Remove attachment"
                    >
                      <IconClose className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  PNG, JPG, PDF, or DOCX files accepted.
                </span>
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
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FacultyLayout>
  )
}
