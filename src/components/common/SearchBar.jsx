import { IconSearch, IconClose } from '../icons/Icons'

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search activities, clubs, events...',
  size = 'md',
  shortcut = null,
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'py-1.5 pl-9 pr-8 text-xs',
    md: 'py-2 pl-10 pr-9 text-sm',
    lg: 'py-2.5 pl-11 pr-10 text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-3',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-5 h-5 left-4',
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${
          iconSizes[size] || iconSizes.md
        }`}
      >
        <IconSearch className="w-full h-full" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-xl border border-slate-200/90 bg-slate-100/60 text-slate-900 placeholder:text-slate-400/90 transition-all duration-150 hover:bg-slate-100/90 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-2xs font-normal
          ${sizeStyles[size] || sizeStyles.md}
        `.trim()}
        {...props}
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <IconClose className="w-4 h-4" />
        </button>
      ) : shortcut ? (
        <div className="absolute inset-y-0 right-0 pr-3 hidden sm:flex items-center pointer-events-none">
          <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200/80 rounded-md shadow-2xs">
            {shortcut}
          </kbd>
        </div>
      ) : null}
    </div>
  )
}
