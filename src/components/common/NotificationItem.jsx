import Badge from './Badge'
import Button from './Button'
import {
  IconBell,
  IconActivity,
  IconClipboardCheck,
  IconAlertCircle,
  IconCheck,
  IconClubs,
} from '../icons/Icons'

export default function NotificationItem({
  title,
  message,
  time,
  type = 'info',
  category,
  isUnread = false,
  action = null,
  onAction,
  onToggleRead,
  onClick,
  className = '',
}) {
  const iconTypes = {
    info: {
      icon: <IconBell className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
    },
    success: {
      icon: <IconClipboardCheck className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    warning: {
      icon: <IconAlertCircle className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
    },
    activity: {
      icon: <IconActivity className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
    },
    club: {
      icon: <IconClubs className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-100',
    },
  }

  const currentType = iconTypes[type] || iconTypes.info

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 p-4 rounded-xl border transition-all
        ${
          isUnread
            ? 'bg-blue-50/40 border-blue-200/80 shadow-xs hover:border-blue-300'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
        }
        ${className}
      `.trim()}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Type Icon */}
        <div
          className={`p-2.5 rounded-xl shrink-0 border ${currentType.bg} shadow-2xs mt-0.5`}
        >
          {currentType.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {category && (
              <Badge variant="neutral" size="sm" className="font-semibold text-[10px] py-0 px-1.5">
                {category}
              </Badge>
            )}
            <p
              className={`text-sm ${
                isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
              }`}
            >
              {title}
            </p>
            {isUnread && (
              <span
                className="w-2 h-2 rounded-full bg-blue-600 shrink-0"
                title="Unread notification"
              />
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {message}
          </p>

          <span className="text-[11px] text-slate-400 block pt-0.5 font-medium">
            {time}
          </span>
        </div>
      </div>

      {/* Action and Toggle controls if provided */}
      {(action || onToggleRead) && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAction?.(action)
              }}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              {action.label}
            </Button>
          )}

          {onToggleRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggleRead()
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
              title={isUnread ? 'Mark as read' : 'Mark as unread'}
            >
              <IconCheck className={`w-3.5 h-3.5 ${isUnread ? 'text-slate-400' : 'text-emerald-600'}`} />
              <span className="hidden md:inline">
                {isUnread ? 'Mark read' : 'Read'}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
