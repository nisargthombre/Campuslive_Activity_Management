import { useLocation, useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import {
  IconArrowLeft,
  IconCalendar,
  IconClipboardCheck,
  IconUsers,
  IconChart,
  IconPlus,
  IconSettings,
} from '../components/icons/Icons'

const routeMeta = {
  '/faculty/activities': {
    title: 'Activities',
    subtitle: 'Manage, coordinate, and review campus activities, workshops, and competitions.',
    breadcrumb: 'Activities',
    icon: <IconCalendar className="w-6 h-6 text-indigo-600" />,
  },
  '/faculty/activities/create': {
    title: 'Create Activity',
    subtitle: 'Submit and publish a new workshop, hackathon, or seminar proposal.',
    breadcrumb: 'Create Activity',
    icon: <IconPlus className="w-6 h-6 text-blue-600" />,
  },
  '/faculty/registrations': {
    title: 'Registrations',
    subtitle: 'Review student registrations, verify eligibility, and manage attendee lists.',
    breadcrumb: 'Registrations',
    icon: <IconClipboardCheck className="w-6 h-6 text-emerald-600" />,
  },
  '/faculty/students': {
    title: 'Students',
    subtitle: 'Track student participation history and institutional engagement records.',
    breadcrumb: 'Students',
    icon: <IconUsers className="w-6 h-6 text-purple-600" />,
  },
  '/faculty/analytics': {
    title: 'Analytics',
    subtitle: 'Turnout metrics, category distributions, and participation reports.',
    breadcrumb: 'Analytics',
    icon: <IconChart className="w-6 h-6 text-rose-600" />,
  },
  '/faculty/clubs': {
    title: 'Clubs',
    subtitle: 'Admin oversight for student chapters, clubs, and societies.',
    breadcrumb: 'Clubs',
    icon: <IconUsers className="w-6 h-6 text-indigo-600" />,
  },
  '/faculty/notifications': {
    title: 'Notifications',
    subtitle: 'Activity approvals, student queries, and campus administration alerts.',
    breadcrumb: 'Notifications',
    icon: <IconCalendar className="w-6 h-6 text-amber-600" />,
  },
  '/faculty/support': {
    title: 'Help & Support',
    subtitle: 'Admin coordination support and institutional ticketing.',
    breadcrumb: 'Support',
    icon: <IconUsers className="w-6 h-6 text-teal-600" />,
  },
  '/faculty/profile': {
    title: 'Admin Profile',
    subtitle: 'Admin academic profile, designations, and permissions.',
    breadcrumb: 'Profile',
    icon: <IconUsers className="w-6 h-6 text-blue-600" />,
  },
  '/faculty/settings': {
    title: 'Account Settings',
    subtitle: 'Manage your admin account preferences, security settings, and notifications.',
    breadcrumb: 'Settings',
    icon: <IconSettings className="w-6 h-6 text-slate-600" />,
  },
}

export default function FacultyPlaceholder() {
  const location = useLocation()
  const navigate = useNavigate()

  const getRouteMeta = () => {
    if (routeMeta[location.pathname]) {
      return routeMeta[location.pathname]
    }
    if (location.pathname.endsWith('/edit')) {
      return {
        title: 'Edit Activity',
        subtitle: 'Update activity schedule, participant capacity, venue, and descriptions.',
        breadcrumb: 'Edit Activity',
        icon: <IconPlus className="w-6 h-6 text-indigo-600" />,
        backTo: '/faculty/activities',
        backLabel: 'Return to Activities List',
      }
    }
    if (location.pathname.startsWith('/faculty/activities/')) {
      return {
        title: 'Activity Overview',
        subtitle: 'Activity review, participant roster, and event coordinates.',
        breadcrumb: 'Activity Overview',
        icon: <IconCalendar className="w-6 h-6 text-blue-600" />,
        backTo: '/faculty/activities',
        backLabel: 'Return to Activities List',
      }
    }
    if (location.pathname.startsWith('/faculty/students/')) {
      const studentId = location.pathname.split('/').pop()
      return {
        title: `Student 360: ${studentId}`,
        subtitle: 'Comprehensive student profile, activity registrations, and campus participation records.',
        breadcrumb: 'Student 360',
        icon: <IconUsers className="w-6 h-6 text-purple-600" />,
        backTo: '/faculty/registrations',
        backLabel: 'Return to Registrations',
      }
    }
    return {
      title: 'Admin Workspace',
      subtitle: 'Admin portal management area.',
      breadcrumb: 'Admin',
      icon: <IconCalendar className="w-6 h-6 text-blue-600" />,
    }
  }

  const meta = getRouteMeta()

  return (
    <FacultyLayout>
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: meta.breadcrumb },
        ]}
        actions={
          <Badge variant="secondary" dot>
            Admin Portal
          </Badge>
        }
      />

      <Card padding="lg" className="border-dashed">
        <div className="text-center py-12 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-2xs">
            {meta.icon}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              This module route is connected in the Admin Portal navigation structure. Detailed management views and dedicated workflows will be implemented in subsequent phases.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(meta.backTo || '/faculty/dashboard')}
              icon={<IconArrowLeft className="w-4 h-4" />}
            >
              {meta.backLabel || 'Return to Admin Dashboard'}
            </Button>
          </div>
        </div>
      </Card>
    </FacultyLayout>
  )
}
