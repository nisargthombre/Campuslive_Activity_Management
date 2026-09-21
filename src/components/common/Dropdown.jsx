import { useState, useRef, useEffect } from 'react'

export default function Dropdown({
  trigger,
  items = [],
  children,
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-flex">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 focus:outline-none py-1
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          `.trim()}
        >
          {children
            ? children
            : items.map((item, idx) => {
                if (item.divider) {
                  return <div key={idx} className="my-1 border-t border-slate-100" />
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      if (item.onClick) item.onClick()
                    }}
                    className={`
                      w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors cursor-pointer
                      ${
                        item.danger
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {item.icon && <span className="text-current">{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )
              })}
        </div>
      )}
    </div>
  )
}
