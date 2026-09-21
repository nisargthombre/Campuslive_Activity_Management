import { Link } from 'react-router-dom'
import { IconChevronRight } from '../icons/Icons'

export default function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null

  return (
    <nav className={`flex items-center text-xs text-slate-500 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={idx} className="flex items-center">
              {idx > 0 && <IconChevronRight className="w-3.5 h-3.5 mx-1 text-slate-400 shrink-0" />}
              {isLast || (!item.to && !item.href) ? (
                <span className="font-medium text-slate-800" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : item.to ? (
                <Link
                  to={item.to}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
