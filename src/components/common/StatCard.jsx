export default function StatCard({
  title,
  value,
  icon,
  iconBg = 'bg-blue-50 text-blue-600',
  change,
  changeType = 'positive',
  helperText,
  className = '',
}) {
  const changeColors = {
    positive: 'text-emerald-700 bg-emerald-50',
    negative: 'text-rose-700 bg-rose-50',
    neutral: 'text-slate-600 bg-slate-100',
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeColors[changeType] || changeColors.neutral
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  )
}
