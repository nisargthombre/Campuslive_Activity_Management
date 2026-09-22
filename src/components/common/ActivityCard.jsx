import { useNavigate } from 'react-router-dom'
import Badge from './Badge'
import Button from './Button'
import { IconCalendar, IconClock, IconMapPin, IconActivity } from '../icons/Icons'

export default function ActivityCard({
  id,
  viewBasePath = '/student/activities',
  title,
  category = 'Campus Event',
  date,
  time,
  venue,
  organizer,
  description = null,
  status = null,
  statusVariant = 'primary',
  thumbnailGradient = 'from-blue-600 to-indigo-600',
  thumbnailIcon = null,
  spotsLeft = null,
  actionText = 'View Details',
  onAction,
  badgeVariant = 'primary',
  className = '',
}) {
  const navigate = useNavigate()
  const handleAction = onAction || (id ? () => navigate(`${viewBasePath}/${id}`) : undefined)
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Visual Thumbnail Header */}
        <div
          className={`h-28 bg-gradient-to-br ${thumbnailGradient} p-4 flex flex-col justify-between relative overflow-hidden`}
        >
          {/* Subtle background graphic */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10 blur-xs pointer-events-none" />
          <div className="absolute right-6 top-3 text-white/20 pointer-events-none">
            {thumbnailIcon || <IconActivity className="w-14 h-14" />}
          </div>

          <div className="flex items-center justify-between relative z-10">
            <Badge variant={badgeVariant} size="sm" className="backdrop-blur-sm shadow-xs font-semibold">
              {category}
            </Badge>
            {status && (
              <Badge variant={statusVariant} size="sm" dot className="shadow-xs font-medium">
                {status}
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
          </div>

          {organizer && <p className="text-xs text-slate-500 mb-2">Organized by {organizer}</p>}

          {description && (
            <p className="text-xs text-slate-500 mb-3.5 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="space-y-2 text-xs text-slate-600 mt-2">
            {date && (
              <div className="flex items-center gap-2.5">
                <IconCalendar className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium text-slate-700">{date}</span>
              </div>
            )}
            {time && (
              <div className="flex items-center gap-2.5">
                <IconClock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{time}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-2.5">
                <IconMapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{venue}</span>
              </div>
            )}
          </div>

          {spotsLeft !== null && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Availability</span>
              <span className={spotsLeft > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                {spotsLeft > 0 ? `${spotsLeft} seats remaining` : 'Full capacity'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 pb-5 pt-1">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleAction}
          className="hover:border-blue-600 hover:text-blue-600 transition-colors"
        >
          {actionText}
        </Button>
      </div>
    </div>
  )
}
