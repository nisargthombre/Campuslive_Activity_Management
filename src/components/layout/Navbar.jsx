import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CampusLogo,
  IconBell,
  IconHelp,
  IconChevronDown,
  IconChevronRight,
  IconMenu,
  IconClose,
  IconLogOut,
  IconUser,
  IconSettings,
  IconActivity,
  IconClipboardCheck,
  IconAlertCircle,
} from '../icons/Icons'
import SearchBar from '../common/SearchBar'
import Badge from '../common/Badge'
import {
  getStoredNotifications,
  saveStoredNotifications,
  NOTIFICATIONS_EVENT_KEY,
} from '../../data/notificationsData'

export default function Navbar({
  user = {
    name: 'Nisarg',
    role: 'Student',
    email: 'nisarg@campus.edu',
    avatar: 'N',
  },
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) {
  const [searchValue, setSearchValue] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(getStoredNotifications)

  const notificationsRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  // Keep notifications in sync with other components and tabs
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      setNotifications(getStoredNotifications())
    }
    window.addEventListener(NOTIFICATIONS_EVENT_KEY, handleNotificationsUpdate)
    window.addEventListener('storage', handleNotificationsUpdate)
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT_KEY, handleNotificationsUpdate)
      window.removeEventListener('storage', handleNotificationsUpdate)
    }
  }, [])

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false)
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
        setIsProfileOpen(false)
      }
    }

    if (isNotificationsOpen || isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen, isProfileOpen])

  const unreadCount = notifications.filter((n) => n.isUnread).length

  const roleBadgeVariants = {
    Student: 'primary',
    Faculty: 'secondary',
    'Super Admin': 'danger',
    Admin: 'danger',
  }

  // Toggle notification popover
  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev)
    if (isProfileOpen) setIsProfileOpen(false)
  }

  // Toggle profile menu
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev)
    if (isNotificationsOpen) setIsNotificationsOpen(false)
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = (e) => {
    e.stopPropagation()
    const updated = notifications.map((n) => ({ ...n, isUnread: false }))
    setNotifications(updated)
    saveStoredNotifications(updated)
  }

  // Click single notification item
  const handleNotificationClick = (notif) => {
    const updated = notifications.map((n) =>
      n.id === notif.id ? { ...n, isUnread: false } : n
    )
    setNotifications(updated)
    saveStoredNotifications(updated)
    setIsNotificationsOpen(false)
    navigate('/student/notifications')
  }

  // Help / Support icon click
  const handleHelpClick = () => {
    setIsNotificationsOpen(false)
    setIsProfileOpen(false)
    navigate('/student/support')
  }

  // Profile navigation helper
  const handleProfileNavigation = (path) => {
    setIsProfileOpen(false)
    navigate(path)
  }

  // Mock logout
  const handleLogout = () => {
    setIsProfileOpen(false)
    try {
      localStorage.removeItem('campuslive_user')
      localStorage.removeItem('campuslive_auth_session')
      sessionStorage.clear()
    } catch {
      // ignore
    }
    navigate('/login')
  }

  // Search submit on Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/student/activities?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* LEFT: Logo + Brand + Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <IconClose className="w-6 h-6" />
              ) : (
                <IconMenu className="w-6 h-6" />
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <CampusLogo className="w-9 h-9 text-blue-600 group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                  CAMPUS LIVE
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-normal block leading-tight mt-0.5">
                Discover. Participate. Connect.
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            onKeyDown={handleSearchKeyDown}
            size="sm"
            placeholder="Search activities, clubs, events..."
          />
        </div>

        {/* RIGHT: Actions (Notifications, Help, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 1. NOTIFICATION BELL & POPOVER */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-haspopup="dialog"
              aria-expanded={isNotificationsOpen}
              title="Notifications"
              className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isNotificationsOpen
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <IconBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotificationsOpen && (
              <div
                role="dialog"
                aria-label="Recent notifications"
                className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none z-50 overflow-hidden"
              >
                {/* Popover Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                        {unreadCount} unread
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-200/70 text-slate-600 rounded-full">
                        All read
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* Popover Recent Items */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((notif) => {
                      const typeConfig = {
                        activity: {
                          icon: <IconActivity className="w-4 h-4 text-indigo-600" />,
                          bg: 'bg-indigo-50 border-indigo-100',
                        },
                        success: {
                          icon: <IconClipboardCheck className="w-4 h-4 text-emerald-600" />,
                          bg: 'bg-emerald-50 border-emerald-100',
                        },
                        warning: {
                          icon: <IconAlertCircle className="w-4 h-4 text-amber-600" />,
                          bg: 'bg-amber-50 border-amber-100',
                        },
                        info: {
                          icon: <IconBell className="w-4 h-4 text-blue-600" />,
                          bg: 'bg-blue-50 border-blue-100',
                        },
                      }
                      const config = typeConfig[notif.type] || typeConfig.info

                      return (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer border-l-4 ${
                            notif.isUnread
                              ? 'bg-blue-50/50 hover:bg-blue-50/80 border-l-blue-600'
                              : 'hover:bg-slate-50 border-l-transparent'
                          }`}
                        >
                          {/* Type Icon */}
                          <div className={`p-2 rounded-xl shrink-0 border ${config.bg} shadow-2xs mt-0.5`}>
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5">
                              <p
                                className={`text-xs truncate ${
                                  notif.isUnread
                                    ? 'font-bold text-slate-900'
                                    : 'font-medium text-slate-700'
                                }`}
                              >
                                {notif.title}
                              </p>
                              {notif.isUnread && (
                                <span
                                  className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1"
                                  title="Unread"
                                />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                              {notif.time}
                            </span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {/* Popover Footer */}
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    navigate('/student/notifications')
                  }}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1.5 border-t border-slate-100 cursor-pointer bg-white"
                >
                  <span>View all notifications</span>
                  <IconChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 2. HELP / SUPPORT ICON */}
          <button
            type="button"
            onClick={handleHelpClick}
            aria-label="Help and Support"
            title="Help & Support"
            className="relative inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors cursor-pointer hidden sm:inline-flex"
          >
            <IconHelp className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* 3. PROFILE AREA & DROPDOWN MENU */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={toggleProfile}
              aria-label={`Open profile menu for ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className={`flex items-center gap-2.5 sm:gap-3 p-1 sm:px-2 rounded-xl transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isProfileOpen ? 'bg-slate-100 ring-1 ring-slate-200' : 'hover:bg-slate-100/80'
              }`}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0">
                {user.avatar || 'N'}
              </div>

              {/* Name + Role */}
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user.name}
                </div>
                <div className="mt-0.5">
                  <Badge
                    variant={roleBadgeVariants[user.role] || 'primary'}
                    size="sm"
                    className="text-[10px] py-0 px-1.5"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>

              {/* Dropdown Arrow */}
              <IconChevronDown
                className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold text-sm flex items-center justify-center ring-2 ring-white shadow-2xs shrink-0">
                    {user.avatar || 'N'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {user.email}
                    </div>
                    <div className="mt-1">
                      <Badge
                        variant={roleBadgeVariants[user.role] || 'primary'}
                        size="sm"
                        className="text-[10px] py-0 px-1.5"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="py-1">
                  {/* View Profile */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() =>
                      handleProfileNavigation(
                        user.role === 'Student'
                          ? '/student/profile'
                          : user.role === 'Faculty'
                          ? '/faculty/dashboard'
                          : '/admin/dashboard'
                      )
                    }
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconUser className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">View Profile</span>
                  </button>

                  {/* Account Settings */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation('/student/settings')}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconSettings className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">Account Settings</span>
                  </button>

                  {/* Notifications */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation('/student/notifications')}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconBell className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full pointer-events-none">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Support */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation('/student/support')}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconHelp className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">Support</span>
                  </button>
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Logout */}
                <div className="py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                  >
                    <IconLogOut className="w-4 h-4 text-rose-500 shrink-0 pointer-events-none" />
                    <span className="font-medium pointer-events-none">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

