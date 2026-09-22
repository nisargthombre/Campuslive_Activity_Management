import Breadcrumb from './Breadcrumb'

export default function PageHeader({
  title,
  subtitle,
  breadcrumb = null,
  actions = null,
  className = '',
}) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumb && (
        <div className="mb-2.5">
          {Array.isArray(breadcrumb) ? <Breadcrumb items={breadcrumb} /> : breadcrumb}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
