import Badge from './Badge'
import Button from './Button'
import { IconUsers, IconActivity, IconCheck, IconClock } from '../icons/Icons'

export default function ClubCard({
  club,
  name,
  category = 'Student Club',
  description,
  facultyCoordinator,
  leadName,
  membersCount = 0,
  activitiesCount = 0,
  membershipStatus = 'Not Joined',
  avatarText,
  gradient = 'from-blue-600 to-indigo-600',
  onView,
  onJoin,
  onLeave,
  onCancelRequest,
  className = '',
}) {
  // Support both passing individual props or a combined `club` object
  const clubData = club || {
    name,
    category,
    description,
    facultyCoordinator,
    leadName,
    membersCount,
    activitiesCount,
    membershipStatus,
    avatarText,
    gradient,
  }

  const resolvedName = clubData.name || 'Unnamed Club'
  const resolvedCategory = clubData.category || 'General'
  const resolvedDescription = clubData.description || ''
  const resolvedFaculty = clubData.facultyCoordinator || clubData.leadName || 'Faculty Advisor'
  const resolvedMembers = clubData.membersCount ?? 0
  const resolvedActivities = clubData.activitiesCount ?? 0
  const resolvedStatus = clubData.membershipStatus || 'Not Joined'
  const initials =
    clubData.avatarText ||
    resolvedName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'CL'
  const resolvedGradient = clubData.gradient || 'from-blue-600 to-indigo-600'

  // Membership status badge config
  const statusConfig = {
    Joined: {
      variant: 'success',
      label: 'Joined',
      icon: <IconCheck className="w-3 h-3 text-emerald-600 inline" />,
    },
    Pending: {
      variant: 'warning',
      label: 'Pending',
      icon: <IconClock className="w-3 h-3 text-amber-600 inline" />,
    },
    'Not Joined': {
      variant: 'neutral',
      label: 'Not Joined',
      icon: null,
    },
  }

  const currentStatusConfig = statusConfig[resolvedStatus] || statusConfig['Not Joined']

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Top Header: Logo + Name/Category + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Club Logo / Avatar with gradient */}
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resolvedGradient} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0 tracking-wider transition-transform duration-200 group-hover:scale-105`}
              aria-label={`${resolvedName} logo`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {resolvedName}
              </h3>
              <Badge variant="secondary" size="sm" className="mt-0.5">
                {resolvedCategory}
              </Badge>
            </div>
          </div>

          {/* Membership Status Badge */}
          <Badge
            variant={currentStatusConfig.variant}
            size="sm"
            className="shrink-0"
          >
            {currentStatusConfig.icon}
            <span>{currentStatusConfig.label}</span>
          </Badge>
        </div>

        {/* Short Description */}
        {resolvedDescription && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 leading-relaxed min-h-[32px]">
            {resolvedDescription}
          </p>
        )}

        {/* Faculty Coordinator */}
        <div className="bg-slate-50/80 rounded-lg p-2.5 mb-3.5 border border-slate-100 flex items-start gap-2">
          <div className="text-[11px] text-slate-500 font-medium shrink-0 pt-0.5">Faculty:</div>
          <div className="text-xs font-medium text-slate-800 truncate" title={resolvedFaculty}>
            {resolvedFaculty}
          </div>
        </div>

        {/* Member and Activity Counters */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          <div className="flex items-center gap-1.5" title="Total active members">
            <IconUsers className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">{resolvedMembers}</span>
            <span>members</span>
          </div>

          <div className="flex items-center gap-1.5" title="Organized campus activities">
            <IconActivity className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="font-medium text-slate-700">{resolvedActivities}</span>
            <span>activities</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(clubData)}
          className="text-xs"
        >
          View Club
        </Button>

        {resolvedStatus === 'Joined' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLeave?.(clubData)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            Leave Club
          </Button>
        )}

        {resolvedStatus === 'Pending' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => (onCancelRequest ? onCancelRequest(clubData) : onLeave?.(clubData))}
            className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
          >
            Cancel Request
          </Button>
        )}

        {resolvedStatus === 'Not Joined' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onJoin?.(clubData)}
            className="text-xs"
          >
            Join Club
          </Button>
        )}
      </div>
    </div>
  )
}
