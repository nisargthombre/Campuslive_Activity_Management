import Button from './Button'
import { IconCalendar } from '../icons/Icons'

export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  icon = null,
  actionText = null,
  onAction = null,
  className = '',
}) {
  return (
    <div
      className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white/60 ${className}`}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {icon || <IconCalendar className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  )
}
