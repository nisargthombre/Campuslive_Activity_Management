import Breadcrumb from './Breadcrumb'

export default function PageHeader({
  title,
  subtitle,
  breadcrumb = null,
  actions = null,
  className = '',
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumb && (
        <div className="mb-2">
          {Array.isArray(breadcrumb) ? <Breadcrumb items={breadcrumb} /> : breadcrumb}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
