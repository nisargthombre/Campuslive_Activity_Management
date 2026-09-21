export default function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  className = '',
}) {
  const content = (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-slate-500 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin" />
      </div>
      {message && <p className="text-xs font-medium text-slate-500 animate-pulse">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-4">
        {content}
      </div>
    )
  }

  return content
}
