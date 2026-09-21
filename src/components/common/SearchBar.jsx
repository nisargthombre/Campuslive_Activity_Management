import { IconSearch, IconClose } from '../icons/Icons'

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search activities, clubs, events...',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeStyles = {
    sm: 'py-1.5 pl-8 pr-7 text-xs',
    md: 'py-2 pl-9 pr-8 text-sm',
    lg: 'py-2.5 pl-10 pr-9 text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3',
    lg: 'w-5 h-5 left-3.5',
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${iconSizes[size] || iconSizes.md}`}>
        <IconSearch className="w-full h-full" />
      </div>

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-lg border border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs
          ${sizeStyles[size] || sizeStyles.md}
        `.trim()}
        {...props}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label="Clear search"
        >
          <IconClose className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
