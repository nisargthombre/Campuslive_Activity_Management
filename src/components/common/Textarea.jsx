export default function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = '',
  error = null,
  helperText = null,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const textareaId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        <textarea
          id={textareaId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`
            w-full rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 text-sm p-3 transition-colors focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 focus:border-blue-500 focus:ring-blue-100'
            }
          `.trim()}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}
