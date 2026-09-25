import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CampusLogo,
  IconBell,
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
  IconSearch,
} from '../icons/Icons'
import SearchBar from '../common/SearchBar'
import Badge from '../common/Badge'
import {
  getStoredNotifications,
  saveStoredNotifications,
  getNotificationsForRole,
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => getNotificationsForRole(user?.role || 'Student'))

  const notificationsRef = useRef(null)
  const profileRef = useRef(null)
  const navigate = useNavigate()

  // Keep notifications in sync with other components and tabs
  useEffect(() => {
    const handleNotificationsUpdate = () => {
      setNotifications(getNotificationsForRole(user?.role || 'Student'))
    }
    window.addEventListener(NOTIFICATIONS_EVENT_KEY, handleNotificationsUpdate)
    window.addEventListener('storage', handleNotificationsUpdate)
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT_KEY, handleNotificationsUpdate)
      window.removeEventListener('storage', handleNotificationsUpdate)
    }
  }, [user?.role])

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
        setIsMobileSearchOpen(false)
      }
    }

    if (isNotificationsOpen || isProfileOpen || isMobileSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNotificationsOpen, isProfileOpen, isMobileSearchOpen])

  const unreadCount = notifications.filter((n) => n.isUnread).length

  const roleBadgeVariants = {
    Student: 'primary',
    Admin: 'secondary',
    Faculty: 'secondary',
    'Super Admin': 'danger',
  }

  const notificationPath =
    user.role === 'Admin' || user.role === 'Faculty'
      ? '/faculty/notifications'
      : user.role === 'Super Admin'
      ? '/admin/notifications'
      : '/student/notifications'

  const profilePath =
    user.role === 'Admin' || user.role === 'Faculty'
      ? '/faculty/profile'
      : user.role === 'Super Admin'
      ? '/admin/profile'
      : '/student/profile'

  const settingsPath =
    user.role === 'Admin' || user.role === 'Faculty'
      ? '/faculty/settings'
      : user.role === 'Super Admin'
      ? '/admin/settings'
      : '/student/settings'

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
    const all = getStoredNotifications()
    const currentIds = new Set(notifications.map((n) => n.id))
    const updated = all.map((n) => (currentIds.has(n.id) ? { ...n, isUnread: false } : n))
    saveStoredNotifications(updated)
    setNotifications(getNotificationsForRole(user?.role || 'Student'))
  }

  // Click single notification item
  const handleNotificationClick = (notif) => {
    const all = getStoredNotifications()
    const updated = all.map((n) => (n.id === notif.id ? { ...n, isUnread: false } : n))
    saveStoredNotifications(updated)
    setNotifications(getNotificationsForRole(user?.role || 'Student'))
    setIsNotificationsOpen(false)
    navigate(notificationPath)
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
      const searchTarget =
        user.role === 'Admin' || user.role === 'Faculty'
          ? `/faculty/activities?search=${encodeURIComponent(searchValue.trim())}`
          : `/student/activities?search=${encodeURIComponent(searchValue.trim())}`
      navigate(searchTarget)
      setIsMobileSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs h-[72px] transition-all">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 md:gap-4 lg:gap-6">
        {/* ============================================================== */}
        {/* LEFT SECTION: Branding & Mobile Menu Toggle                    */}
        {/* ============================================================== */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <IconClose className="w-5 h-5" />
              ) : (
                <IconMenu className="w-5 h-5" />
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group shrink-0">
            {/* Clean compact container for logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/90 flex items-center justify-center text-blue-600 shadow-2xs group-hover:border-blue-200 group-hover:bg-blue-100/60 transition-all duration-150 shrink-0">
              <CampusLogo className="w-6 h-6 text-blue-600 group-hover:scale-105 transition-transform" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 leading-none group-hover:text-blue-600 transition-colors">
                CAMPUS LIVE
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-normal block leading-tight mt-1 whitespace-nowrap hidden sm:block">
                Discover. Participate. Connect.
              </span>
            </div>
          </Link>

          {/* Section Divider between Branding and Center Search */}
          <div className="hidden lg:block h-6 w-px bg-slate-200/80 ml-3 lg:ml-5 shrink-0" />
        </div>

        {/* ============================================================== */}
        {/* CENTER SECTION: Global Search Component                        */}
        {/* ============================================================== */}
        <div className="flex-1 flex items-center justify-center px-2 md:px-4 min-w-0">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg hidden sm:block">
            <SearchBar
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
              onKeyDown={handleSearchKeyDown}
              size="sm"
              placeholder="Search activities, clubs, events..."
              shortcut="⌘K"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT SECTION: Notifications & Profile (No Support/Help Icon)  */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Section Divider between Search and Actions on Desktop */}
          <div className="hidden lg:block h-6 w-px bg-slate-200/80 mr-1 shrink-0" />

          {/* Mobile Search Button (Compact toggle on small screens) */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle search"
            className={`sm:hidden p-2 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isMobileSearchOpen
                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <IconSearch className="w-5 h-5" />
          </button>

          {/* 1. NOTIFICATION BELL & POPOVER */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-haspopup="dialog"
              aria-expanded={isNotificationsOpen}
              title="Notifications"
              className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isNotificationsOpen
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/90'
              }`}
            >
              <IconBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotificationsOpen && (
              <div
                role="dialog"
                aria-label="Recent notifications"
                className="absolute right-0 mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Popover Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                        {unreadCount} new
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">All caught up</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Popover Body List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                          notif.isUnread ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                          {notif.type === 'activity' ? (
                            <IconActivity className="w-4 h-4 text-blue-600" />
                          ) : notif.type === 'registration' ? (
                            <IconClipboardCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <IconAlertCircle className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          {notif.channel === 'internal_admin' && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider mb-1">
                              Internal Admin Notice
                            </span>
                          )}
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs truncate ${
                                notif.isUnread
                                  ? 'font-bold text-slate-900'
                                  : 'font-medium text-slate-700'
                              }`}
                            >
                              {notif.title}
                            </span>
                            {notif.isUnread && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Popover Footer */}
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    navigate(notificationPath)
                  }}
                  className="w-full py-2.5 px-4 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1.5 border-t border-slate-100 cursor-pointer bg-white"
                >
                  <span>View all notifications</span>
                  <IconChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Separator between Notification Bell and Profile */}
          <div className="h-6 w-px bg-slate-200/80 hidden sm:block mx-1 shrink-0" />

          {/* 2. PROFILE AREA & DROPDOWN MENU */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={toggleProfile}
              aria-label={`Open profile menu for ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={isProfileOpen}
              className={`flex items-center gap-2.5 sm:gap-3 p-1 sm:px-2 rounded-xl transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isProfileOpen
                  ? 'bg-slate-100 ring-1 ring-slate-200'
                  : 'hover:bg-slate-100/80'
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
                    className="text-[10px] py-0 px-1.5 font-medium"
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
                className="absolute right-0 mt-2.5 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
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
                        className="text-[10px] py-0 px-1.5 font-medium"
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Navigation Items: My Profile, Account Settings, Notifications */}
                <div className="py-1">
                  {/* My Profile */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation(profilePath)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconUser className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">My Profile</span>
                  </button>

                  {/* Account Settings */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation(settingsPath)}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                  >
                    <IconSettings className="w-4 h-4 text-slate-400 shrink-0 pointer-events-none" />
                    <span className="font-medium flex-1 pointer-events-none">Account Settings</span>
                  </button>

                  {/* Notifications */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => handleProfileNavigation(notificationPath)}
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

      {/* Mobile Search Expandable Bar (Below 72px Header on small screens) */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 py-2.5 bg-white border-t border-slate-200/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <SearchBar
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={() => setSearchValue('')}
            onKeyDown={handleSearchKeyDown}
            size="sm"
            autoFocus
            placeholder="Search activities, clubs, events..."
          />
        </div>
      )}
    </header>
  )
}
