export default function Card({
  children,
  title,
  subtitle,
  action,
  footer,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const hasHeader = title || subtitle || action

  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200 shadow-xs transition-all duration-200
        ${hoverable ? 'hover:shadow-md hover:border-slate-300' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={paddingStyles[padding] || paddingStyles.md}>{children}</div>

      {footer && (
        <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  )
}
