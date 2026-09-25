import { useState, useMemo, useEffect } from 'react'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Textarea from '../components/common/Textarea'
import EmptyState from '../components/common/EmptyState'
import {
  IconSupport,
  IconPlus,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconClose,
  IconCalendar,
} from '../components/icons/Icons'
import {
  supportCategories,
  supportPriorities,
  supportStatuses,
  initialTickets,
  getStoredSupportTickets,
  saveStoredSupportTickets,
  SUPPORT_EVENT_KEY,
} from '../data/supportData'

export default function StudentSupport() {
  // Tickets state connected to unified support store
  const [tickets, setTickets] = useState(() => getStoredSupportTickets())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Listen for Super Admin / Faculty updates in real-time
  useEffect(() => {
    const handleSync = () => {
      const fresh = getStoredSupportTickets()
      setTickets(fresh)
      setSelectedTicket((prev) => {
        if (!prev) return null
        return fresh.find((t) => t.id === prev.id) || prev
      })
    }
    window.addEventListener(SUPPORT_EVENT_KEY, handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener(SUPPORT_EVENT_KEY, handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [toast, setToast] = useState(null)

  // Create Ticket Form State
  const [newTicketCategory, setNewTicketCategory] = useState(supportCategories[0])
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  const [newTicketPriority, setNewTicketPriority] = useState('Medium')
  const [newTicketAttachment, setNewTicketAttachment] = useState('')
  const [formError, setFormError] = useState('')

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Summary counts
  const openCount = useMemo(
    () => tickets.filter((t) => t.status === 'Open' || t.status === 'Assigned').length,
    [tickets]
  )
  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === 'In Progress').length,
    [tickets]
  )
  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === 'Resolved').length,
    [tickets]
  )
  const closedCount = useMemo(
    () => tickets.filter((t) => t.status === 'Closed').length,
    [tickets]
  )

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Open') {
          if (ticket.status !== 'Open' && ticket.status !== 'Assigned') return false
        } else if (ticket.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false
        }
      }

      // Search query (matches ticketNumber, subject, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.subject.toLowerCase().includes(q) ||
          ticket.category.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [tickets, statusFilter, searchQuery])

  // Priority badge config
  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Badge variant="danger" size="sm">High</Badge>
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>
      case 'low':
      default:
        return <Badge variant="neutral" size="sm">Low</Badge>
    }
  }

  // Status badge config
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <Badge variant="info" size="sm">Open</Badge>
      case 'assigned':
        return <Badge variant="secondary" size="sm">Assigned</Badge>
      case 'in progress':
        return <Badge variant="warning" size="sm">In Progress</Badge>
      case 'resolved':
        return <Badge variant="success" size="sm">Resolved</Badge>
      case 'closed':
      default:
        return <Badge variant="neutral" size="sm">Closed</Badge>
    }
  }

  // Handle Create Ticket Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault()
    if (!newTicketSubject.trim()) {
      setFormError('Please enter a ticket subject.')
      return
    }
    if (!newTicketDescription.trim()) {
      setFormError('Please provide a description of the issue.')
      return
    }

    const now = new Date()
    const dateString = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ` + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const nextIdNum = 426 + tickets.length
    const newTicketId = `TICK-2026-0${nextIdNum}`

    const newTicket = {
      id: newTicketId,
      ticketNumber: newTicketId,
      origin: 'student',
      subject: newTicketSubject.trim(),
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'Open',
      createdDate: dateString,
      lastUpdated: dateString,
      description: newTicketDescription.trim(),
      attachmentName: newTicketAttachment.trim() || null,
      creator: {
        name: 'Alex Rivera',
        role: 'Student',
        email: 'alex.rivera@campus.edu',
        department: 'Computer Science',
        studentId: 'STU-2024-001',
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: 'You (Alex Rivera)',
          senderRole: 'Student',
          role: 'Student',
          avatar: 'AR',
          text: newTicketDescription.trim(),
          message: newTicketDescription.trim(),
          timestamp: dateString,
          time: dateString,
          isStaff: false,
        },
      ],
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    saveStoredSupportTickets(updated)
    setIsCreateOpen(false)

    // Reset form fields
    setNewTicketSubject('')
    setNewTicketDescription('')
    setNewTicketCategory(supportCategories[0])
    setNewTicketPriority('Medium')
    setNewTicketAttachment('')
    setFormError('')

    showToast(`Support ticket ${newTicketId} created successfully!`, 'success')
  }

  // Handle Send Reply in Ticket Details
  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return

    const now = new Date()
    const timestamp = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ` + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderName: 'You (Alex Rivera)',
      senderRole: 'Student',
      role: 'Student',
      avatar: 'AR',
      text: replyText.trim(),
      message: replyText.trim(),
      timestamp,
      time: timestamp,
      isStaff: false,
    }

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          lastUpdated: timestamp,
          messages: [...(t.messages || []), newMsg],
        }
      }
      return t
    })

    setTickets(updatedTickets)
    saveStoredSupportTickets(updatedTickets)
    setSelectedTicket((prev) => ({
      ...prev,
      lastUpdated: timestamp,
      messages: [...(prev.messages || []), newMsg],
    }))

    setReplyText('')
    showToast('Your reply has been submitted.', 'success')
  }

  return (
    <StudentLayout>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-white border-slate-200 text-slate-800">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'info'
                ? 'bg-blue-500'
                : 'bg-amber-500'
            }`}
          />
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Support"
        subtitle="Create a support ticket or check the status of your existing requests."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Support' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="shadow-xs gap-1.5"
            icon={<IconPlus className="w-4 h-4" />}
          >
            Create Support Ticket
          </Button>
        }
      />

      {/* Ticket Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Open"
          value={openCount}
          subtitle="Awaiting response"
          icon={<IconAlertCircle className="w-5 h-5 text-blue-600" />}
          badge={{ text: 'Queued', variant: 'primary' }}
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Being handled by staff"
          icon={<IconClock className="w-5 h-5 text-amber-600" />}
          badge={{ text: 'Active', variant: 'warning' }}
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Solution provided"
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          badge={{ text: 'Completed', variant: 'success' }}
        />

        <StatCard
          title="Closed"
          value={closedCount}
          subtitle="Archived tickets"
          icon={<IconSupport className="w-5 h-5 text-slate-600" />}
          badge={{ text: 'Historical', variant: 'neutral' }}
        />
      </div>

      {/* Tickets Toolbar: Search & Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="w-full md:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Search by ticket #, subject, or category..."
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between md:justify-end gap-2">
            <span>
              Showing <strong className="text-slate-800">{filteredTickets.length}</strong> of{' '}
              {tickets.length} tickets
            </span>
            {(searchQuery || statusFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All')
                }}
                className="text-blue-600 hover:text-blue-800 font-medium ml-1 underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 shrink-0 mr-1">Status:</span>
          {supportStatuses.map((status) => {
            const isSelected = statusFilter.toLowerCase() === status.toLowerCase()
            const count =
              status === 'All'
                ? tickets.length
                : status === 'Open'
                ? openCount
                : status === 'In Progress'
                ? inProgressCount
                : status === 'Resolved'
                ? resolvedCount
                : closedCount

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }
                `}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                {/* Header tags: Ticket Number, Category, Status, Priority */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {ticket.ticketNumber}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {ticket.category}
                  </Badge>
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>

                {/* Subject */}
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-1">
                  {ticket.subject}
                </h3>

                {/* Date and Logistics metadata */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <IconCalendar className="w-3.5 h-3.5 text-slate-400" />
                    Created: {ticket.createdDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5 text-slate-400" />
                    Updated: {ticket.lastUpdated}
                  </span>
                  {ticket.messages && (
                    <span className="text-slate-400">
                      • {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full sm:w-auto text-xs"
                >
                  View Ticket
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No support tickets found"
          description={
            searchQuery || statusFilter !== 'All'
              ? 'No tickets match your search or status filter. Try clearing the filter or search query.'
              : 'You have not submitted any support tickets yet. Need assistance with an activity or your account?'
          }
          actionLabel={
            searchQuery || statusFilter !== 'All' ? 'Clear Filters' : 'Create Support Ticket'
          }
          onAction={() => {
            if (searchQuery || statusFilter !== 'All') {
              setSearchQuery('')
              setStatusFilter('All')
            } else {
              setIsCreateOpen(true)
            }
          }}
        />
      )}

      {/* Create Support Ticket Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false)
            setFormError('')
          }}
          title="Create Support Ticket"
          size="lg"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false)
                  setFormError('')
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateSubmit}>
                Submit Ticket
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                name="category"
                value={newTicketCategory}
                onChange={(e) => setNewTicketCategory(e.target.value)}
                options={supportCategories}
                required
              />

              <Select
                label="Priority"
                name="priority"
                value={newTicketPriority}
                onChange={(e) => setNewTicketPriority(e.target.value)}
                options={supportPriorities}
                required
              />
            </div>

            <Input
              label="Subject"
              placeholder="Brief summary of your query or issue"
              value={newTicketSubject}
              onChange={(e) => setNewTicketSubject(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              rows={4}
              placeholder="Describe the issue in detail (activity title, registration ID, steps to reproduce)..."
              value={newTicketDescription}
              onChange={(e) => setNewTicketDescription(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attachment (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., error-screenshot.png or certificate-scan.pdf"
                value={newTicketAttachment}
                onChange={(e) => setNewTicketAttachment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm py-2 px-3.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                You can attach filenames or reference logs to assist resolution.
              </p>
            </div>
          </form>
        </Modal>
      )}

      {/* Ticket Details & Conversation Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => {
            setSelectedTicket(null)
            setReplyText('')
          }}
          title={selectedTicket.ticketNumber}
          size="lg"
          footer={
            <div className="w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Status: <strong className="text-slate-800">{selectedTicket.status}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTicket(null)
                  setReplyText('')
                }}
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Header metadata */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="neutral" size="sm">
                    {selectedTicket.category}
                  </Badge>
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <div className="text-xs text-slate-400">
                  Updated: {selectedTicket.lastUpdated}
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {selectedTicket.subject}
              </h3>

              {selectedTicket.attachmentName && (
                <div className="text-xs text-blue-600 flex items-center gap-1.5 pt-1">
                  <span>Attachment:</span>
                  <span className="font-mono underline bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100 text-[11px]">
                    {selectedTicket.attachmentName}
                  </span>
                </div>
              )}
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Support Conversation ({selectedTicket.messages?.length || 0})
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      msg.isStaff
                        ? 'bg-blue-50/40 border-blue-100 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            msg.isStaff
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.avatar || 'U'}
                        </div>
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        {msg.role && (
                          <Badge
                            variant={msg.isStaff ? 'secondary' : 'neutral'}
                            size="sm"
                            className="text-[10px] py-0 px-1.5"
                          >
                            {msg.role}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <p className="text-slate-700 pl-8">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Send a reply to support
              </label>
              <textarea
                rows={3}
                placeholder="Type your reply message here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <div className="flex items-center justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="text-xs"
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </StudentLayout>
  )
}
