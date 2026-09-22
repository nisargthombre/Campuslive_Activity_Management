import { useLocation, Link } from 'react-router-dom'
import {
  IconDashboard,
  IconCalendar,
  IconClipboardCheck,
  IconActivity,
  IconUsers,
  IconUser,
  IconClubs,
  IconChart,
  IconReports,
  IconSettings,
  IconBell,
  IconSupport,
  IconLogOut,
  IconPlus,
} from '../icons/Icons'

const iconMap = {
  dashboard: IconDashboard,
  calendar: IconCalendar,
  clipboard: IconClipboardCheck,
  activity: IconActivity,
  users: IconUsers,
  user: IconUser,
  clubs: IconClubs,
  chart: IconChart,
  reports: IconReports,
  settings: IconSettings,
  bell: IconBell,
  support: IconSupport,
  logout: IconLogOut,
  plus: IconPlus,
}

export default function Sidebar({
  items = [],
  isMobileOpen = false,
  onCloseMobile,
}) {
  const location = useLocation()

  const renderNavItem = (item, idx) => {
    const IconComponent = iconMap[item.icon] || IconActivity
    const isActive = location.pathname === item.path

    return (
      <div key={idx} className={item.isAction ? 'pt-2 mt-2 border-t border-slate-100' : ''}>
        <Link
          to={item.path}
          onClick={onCloseMobile}
          className={`
            group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
            ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : item.isAction
                  ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }
          `}
        >
        <div className="flex items-center gap-3 min-w-0">
          <IconComponent
            className={`w-5 h-5 shrink-0 transition-colors ${
              isActive
                ? 'text-blue-600'
                : item.isAction
                  ? 'text-slate-400 group-hover:text-rose-500'
                  : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge && (
          <span
            className={`
              ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full
              ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
              }
            `}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </div>
  )
  }

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto py-4 px-3 space-y-1">
      {items.map((entry, index) => {
        // Section header with items
        if (entry.section && Array.isArray(entry.items)) {
          return (
            <div key={index} className="pt-3 first:pt-0">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {entry.section}
              </p>
              <div className="space-y-1">
                {entry.items.map((subItem, subIdx) => renderNavItem(subItem, subIdx))}
              </div>
            </div>
          )
        }

        // Single item
        return renderNavItem(entry, index)
      })}
    </div>
  )

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 ease-in-out lg:hidden
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
      </aside>
    </>
  )
}
