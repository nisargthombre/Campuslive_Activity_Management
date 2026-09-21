import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import PageHeader from '../components/common/PageHeader'
import StatCard from '../components/common/StatCard'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import NotificationItem from '../components/common/NotificationItem'
import {
  IconBell,
  IconCheck,
  IconClock,
  IconClose,
} from '../components/icons/Icons'
import {
  notificationCategories,
  getStoredNotifications,
  saveStoredNotifications,
  NOTIFICATIONS_EVENT_KEY,
} from '../data/notificationsData'

export default function StudentNotifications() {
  const navigate = useNavigate()

  // Notifications state synced with header/storage
  const [notifications, setNotifications] = useState(getStoredNotifications)
  const [activeFilter, setActiveFilter] = useState('All')
  const [toast, setToast] = useState(null)

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

  // Counts
  const totalCount = notifications.length
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isUnread).length,
    [notifications]
  )
  const readCount = totalCount - unreadCount

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = {
      All: notifications.length,
      Unread: notifications.filter((n) => n.isUnread).length,
    }
    notificationCategories.forEach((cat) => {
      if (cat !== 'All' && cat !== 'Unread') {
        counts[cat] = notifications.filter(
          (n) => n.category.toLowerCase() === cat.toLowerCase()
        ).length
      }
    })
    return counts
  }, [notifications])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      if (activeFilter === 'All') return true
      if (activeFilter === 'Unread') return notif.isUnread
      return notif.category.toLowerCase() === activeFilter.toLowerCase()
    })
  }, [notifications, activeFilter])

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 4000)
  }

  // Mark a single notification as read/unread
  const handleToggleRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.isUnread
          showToast(
            nextState ? 'Marked as unread.' : 'Notification marked as read.',
            'info'
          )
          return { ...n, isUnread: nextState }
        }
        return n
      })
      saveStoredNotifications(updated)
      return updated
    })
  }

  // Mark all as read
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      showToast('All notifications are already marked as read.', 'info')
      return
    }
    const updated = notifications.map((n) => ({ ...n, isUnread: false }))
    setNotifications(updated)
    saveStoredNotifications(updated)
    showToast(`Marked ${unreadCount} notification${unreadCount > 1 ? 's' : ''} as read.`, 'success')
  }

  // Handle click on related action
  const handleAction = (action) => {
    if (action?.to) {
      navigate(action.to)
    }
  }

  return (
    <StudentLayout>
      {/* Toast Notification Banner */}
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
        title="Notifications"
        subtitle="Stay updated with activities, registrations, clubs, and important campus announcements."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs shadow-2xs gap-1.5"
              icon={<IconCheck className="w-3.5 h-3.5 text-blue-600" />}
            >
              Mark All as Read
            </Button>
          )
        }
      />

      {/* Notification Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Notifications"
          value={totalCount}
          subtitle="All received alerts"
          icon={<IconBell className="w-5 h-5" />}
          badge={{
            text: 'Inbox',
            variant: 'primary',
          }}
        />

        <StatCard
          title="Unread Notifications"
          value={unreadCount}
          subtitle={unreadCount > 0 ? 'Requires attention' : 'Caught up'}
          icon={<IconClock className="w-5 h-5" />}
          badge={{
            text: unreadCount > 0 ? `${unreadCount} New` : 'All Read',
            variant: unreadCount > 0 ? 'warning' : 'success',
          }}
        />

        <StatCard
          title="Read Notifications"
          value={readCount}
          subtitle="Archived alerts"
          icon={<IconCheck className="w-5 h-5" />}
          badge={{
            text: 'Acknowledged',
            variant: 'neutral',
          }}
        />
      </div>

      {/* Notification Filter Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 mb-6 shadow-xs flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Filter:</span>
          {notificationCategories.map((cat) => {
            const isSelected = activeFilter.toLowerCase() === cat.toLowerCase()
            const count = categoryCounts[cat] ?? 0
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }
                `}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-blue-700 text-blue-100'
                      : cat === 'Unread' && count > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {activeFilter !== 'All' && (
          <button
            type="button"
            onClick={() => setActiveFilter('All')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer underline"
          >
            Show All
          </button>
        )}
      </div>

      {/* Notification List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              title={notif.title}
              message={notif.message}
              time={notif.time}
              type={notif.type}
              category={notif.category}
              isUnread={notif.isUnread}
              action={notif.action}
              onAction={handleAction}
              onToggleRead={() => handleToggleRead(notif.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications found"
          description={
            activeFilter === 'Unread'
              ? 'You are all caught up! There are no unread notifications.'
              : `There are currently no notifications in the "${activeFilter}" category.`
          }
          actionLabel="View All Notifications"
          onAction={() => setActiveFilter('All')}
        />
      )}
    </StudentLayout>
  )
}
