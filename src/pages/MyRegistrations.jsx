import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Tabs from '../components/common/Tabs'
import SearchBar from '../components/common/SearchBar'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconClose,
  IconAlertCircle,
  IconSearch,
  IconClipboardCheck,
  IconActivity,
} from '../components/icons/Icons'
import { initialRegistrations } from '../data/registrationsData'

export default function MyRegistrations() {
  const navigate = useNavigate()

  // Registrations state
  const [registrations, setRegistrations] = useState(initialRegistrations)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state for cancel registration
  const [cancelModalItem, setCancelModalItem] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Counts calculated dynamically
  const upcomingCount = useMemo(
    () => registrations.filter((r) => r.status === 'Registered').length,
    [registrations]
  )
  const completedCount = useMemo(
    () => registrations.filter((r) => r.status === 'Completed').length,
    [registrations]
  )
  const cancelledCount = useMemo(
    () => registrations.filter((r) => r.status === 'Cancelled').length,
    [registrations]
  )

  // Tab definitions with dynamic counts
  const tabItems = [
    { id: 'all', label: 'All Registrations', count: registrations.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
    { id: 'completed', label: 'Completed', count: completedCount },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
  ]

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Tab filter
      if (activeTab === 'upcoming' && reg.status !== 'Registered') return false
      if (activeTab === 'completed' && reg.status !== 'Completed') return false
      if (activeTab === 'cancelled' && reg.status !== 'Cancelled') return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          reg.title.toLowerCase().includes(q) ||
          reg.category.toLowerCase().includes(q) ||
          reg.venue.toLowerCase().includes(q) ||
          reg.registrationId.toLowerCase().includes(q) ||
          reg.organizer.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [registrations, activeTab, searchQuery])

  // Confirm cancel registration
  const handleConfirmCancel = () => {
    if (!cancelModalItem) return

    setRegistrations((prev) =>
      prev.map((item) =>
        item.id === cancelModalItem.id
          ? {
              ...item,
              status: 'Cancelled',
              statusVariant: 'neutral',
              tabGroup: 'cancelled',
              cancellationReason: 'Cancelled by student',
            }
          : item
      )
    )

    setToastMessage(`Registration for "${cancelModalItem.title}" has been cancelled.`)
    setCancelModalItem(null)
    setTimeout(() => setToastMessage(''), 4000)
  }

  return (
    <StudentLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in duration-200">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <IconAlertCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="My Registrations"
        subtitle="Track and manage the campus activities and workshops you have registered for."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'My Registrations' },
        ]}
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/student/activities')}
            className="shadow-xs"
          >
            Explore More Activities &rarr;
          </Button>
        }
      />

      {/* 3 Summary Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
        <StatCard
          title="Upcoming Activities"
          value={String(upcomingCount)}
          icon={<IconCalendar className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50 text-blue-600"
          change="Registered"
          changeType="positive"
          helperText="Workshops & hackathons scheduled"
        />

        <StatCard
          title="Completed Activities"
          value={String(completedCount)}
          icon={<IconCheck className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Participated"
          changeType="positive"
          helperText="Verified attendance recorded"
        />

        <StatCard
          title="Cancelled Registrations"
          value={String(cancelledCount)}
          icon={<IconClose className="w-5 h-5 text-slate-500" />}
          iconBg="bg-slate-100 text-slate-600"
          change="Withdrawn"
          changeType="neutral"
          helperText="Registration cancelled prior to event"
        />
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
            variant="pills"
          />

          {/* Search Bar */}
          <div className="w-full lg:w-80">
            <SearchBar
              size="md"
              placeholder="Search by title, venue, or REG ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
        </div>

        {/* Active Filter Helper Tag */}
        {(searchQuery || activeTab !== 'all') && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {filteredRegistrations.length} result
              {filteredRegistrations.length === 1 ? '' : 's'}
              {activeTab !== 'all' ? ` in ${activeTab}` : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all')
                setSearchQuery('')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Registrations List */}
      {filteredRegistrations.length === 0 ? (
        /* Empty State */
        <EmptyState
          title={
            searchQuery
              ? 'No matching registrations found'
              : activeTab === 'upcoming'
              ? 'No upcoming registrations'
              : activeTab === 'completed'
              ? 'No completed activities yet'
              : activeTab === 'cancelled'
              ? 'No cancelled registrations'
              : 'No registrations found'
          }
          description={
            searchQuery
              ? 'Try modifying your search term or selecting a different tab.'
              : activeTab === 'upcoming'
              ? 'You have not registered for any upcoming events. Explore campus workshops and hackathons!'
              : activeTab === 'completed'
              ? 'Your completed and attended activities will appear here once faculty verifies attendance.'
              : activeTab === 'cancelled'
              ? 'You have not cancelled any registrations.'
              : 'Discover workshops, competitions, and seminars happening on campus.'
          }
          actionText={
            searchQuery
              ? 'Clear Search'
              : activeTab !== 'all'
              ? 'View All Registrations'
              : 'Explore Activities'
          }
          onAction={
            searchQuery
              ? () => setSearchQuery('')
              : activeTab !== 'all'
              ? () => setActiveTab('all')
              : () => navigate('/student/activities')
          }
          icon={
            searchQuery ? (
              <IconSearch className="w-6 h-6 text-slate-400" />
            ) : (
              <IconClipboardCheck className="w-6 h-6 text-slate-400" />
            )
          }
          className="my-8 bg-white"
        />
      ) : (
        /* Registration Cards Grid / List */
        <div className="space-y-4 mb-12">
          {filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch"
            >
              {/* Thumbnail Strip */}
              <div
                className={`w-full sm:w-44 md:w-52 bg-gradient-to-br ${reg.thumbnailGradient} p-4 flex flex-col justify-between shrink-0 relative overflow-hidden text-white`}
              >
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                <div className="absolute right-3 top-3 text-white/20 pointer-events-none">
                  <IconActivity className="w-10 h-10" />
                </div>

                <div className="relative z-10">
                  <Badge variant="primary" size="sm" className="bg-white/20 backdrop-blur-xs text-white font-semibold">
                    {reg.category}
                  </Badge>
                </div>

                <div className="relative z-10 mt-6 sm:mt-0">
                  <span className="text-[10px] text-white/80 uppercase tracking-wider block font-semibold">
                    Department
                  </span>
                  <span className="text-xs font-medium text-white line-clamp-1">
                    {reg.department}
                  </span>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {reg.title}
                    </h3>

                    {/* Status Badge */}
                    {reg.status === 'Registered' && (
                      <Badge variant="primary" size="md" dot>
                        Registered
                      </Badge>
                    )}
                    {reg.status === 'Completed' && (
                      <Badge variant="success" size="md" dot>
                        Completed &bull; Attended
                      </Badge>
                    )}
                    {reg.status === 'Cancelled' && (
                      <Badge variant="neutral" size="md">
                        Cancelled
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-3.5">
                    Organized by <span className="font-medium text-slate-700">{reg.organizer}</span>
                  </p>

                  {/* Date, Time, Venue, and Reg ID Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-slate-800">{reg.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconClock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{reg.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{reg.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">ID:</span>
                      <code className="font-mono text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                        {reg.registrationId}
                      </code>
                    </div>
                  </div>

                  {/* Attendance Note / Cancellation Reason */}
                  {reg.attendanceNote && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>{reg.attendanceNote}</span>
                    </div>
                  )}

                  {reg.cancellationReason && (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <IconAlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{reg.cancellationReason}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Registered on {reg.registeredOn}
                  </span>

                  <div className="flex items-center gap-2.5">
                    {reg.status === 'Registered' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelModalItem(reg)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        Cancel Registration
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/student/activities/${reg.activityId}`)}
                      className="hover:border-blue-600 hover:text-blue-600"
                    >
                      View Activity &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalItem && (
        <Modal
          isOpen={Boolean(cancelModalItem)}
          onClose={() => setCancelModalItem(null)}
          title="Cancel Registration"
          size="md"
          footer={
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalItem(null)}
              >
                Keep Registration
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Cancellation
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              Are you sure you want to cancel your registration for:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">{cancelModalItem.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {cancelModalItem.date} &bull; {cancelModalItem.venue}
              </p>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                Registration ID: {cancelModalItem.registrationId}
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your reserved seat will be released for other students on the waitlist. You can re-register from Explore Activities if spots remain open.
            </p>
          </div>
        </Modal>
      )}
    </StudentLayout>
  )
}
