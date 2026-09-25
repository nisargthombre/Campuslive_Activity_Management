import { Link } from 'react-router-dom'
import { CampusLogo, IconChevronRight } from '../components/icons/Icons'
import Badge from '../components/common/Badge'

function Home() {
  const roles = [
    {
      title: 'Student Portal',
      description: 'Explore campus events, manage registrations, participate in activities, and join clubs.',
      path: '/student/dashboard',
      badge: 'Student',
      badgeVariant: 'primary',
      borderHover: 'hover:border-blue-400',
    },
    {
      title: 'Admin Portal',
      description: 'Create activities, manage student attendance, track registrations, and guide student clubs.',
      path: '/faculty/dashboard',
      badge: 'Admin',
      badgeVariant: 'secondary',
      borderHover: 'hover:border-indigo-400',
    },
    {
      title: 'Super Admin Portal',
      description: 'System-wide campus governance, user management, event approvals, and institutional reports.',
      path: '/admin/dashboard',
      badge: 'Super Admin',
      badgeVariant: 'danger',
      borderHover: 'hover:border-rose-400',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <CampusLogo className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CAMPUS LIVE</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Discover. Participate. Connect.</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="neutral" size="sm">
              Internal Testing & Dev Selector
            </Badge>
          </div>
        </div>

        {/* Role Cards */}
        <div className="space-y-3 mb-6">
          {roles.map((role, idx) => (
            <Link
              key={idx}
              to={role.path}
              className={`
                block bg-white rounded-xl border border-slate-200 p-4 shadow-xs transition-all duration-150 hover:shadow-md ${role.borderHover} group
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {role.title}
                  </span>
                  <Badge variant={role.badgeVariant} size="sm">
                    {role.badge}
                  </Badge>
                </div>
                <IconChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{role.description}</p>
            </Link>
          ))}
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            Go to Login Page &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
