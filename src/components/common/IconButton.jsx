export default function IconButton({
  icon,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  badge = null,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  }

  const variantStyles = {
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus:ring-blue-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm',
    danger: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:ring-rose-300',
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.ghost}
        ${className}
      `.trim()}
      {...props}
    >
      {icon}
      {badge !== null && badge !== undefined && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
          {badge}
        </span>
      )}
    </button>
  )
}
