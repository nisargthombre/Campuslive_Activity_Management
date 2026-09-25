import { useLocation, useNavigate } from 'react-router-dom'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
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
  IconReports,
  IconSettings,
  IconBell,
  IconSupport,
  IconClubs,
  IconUser,
} from '../components/icons/Icons'

const routeMeta = {
  '/admin/users': {
    title: 'Users Directory',
    subtitle: 'System-wide user directory and identity management across student, staff, and admin accounts.',
    breadcrumb: 'Users',
    icon: <IconUsers className="w-6 h-6 text-blue-600" />,
  },
  '/admin/students': {
    title: 'Students Administration',
    subtitle: 'Institutional student records, department enrollments, and academic involvement tracking.',
    breadcrumb: 'Students',
    icon: <IconUser className="w-6 h-6 text-indigo-600" />,
  },
  '/admin/staff': {
    title: 'Admin & Staff Management',
    subtitle: 'Manage authorized faculty coordinators, departmental administrators, and staff access roles.',
    breadcrumb: 'Admin / Staff',
    icon: <IconUsers className="w-6 h-6 text-purple-600" />,
  },
  '/admin/activities': {
    title: 'Activities Oversight',
    subtitle: 'Institution-wide campus activities, inter-departmental workshops, and event compliance.',
    breadcrumb: 'Activities',
    icon: <IconCalendar className="w-6 h-6 text-amber-600" />,
  },
  '/admin/activities/create': {
    title: 'Create Campus Activity',
    subtitle: 'Institutional event creation with system-wide publishing, multi-department eligibility, and capacity controls.',
    breadcrumb: 'Create Activity',
    icon: <IconCalendar className="w-6 h-6 text-blue-600" />,
  },
  '/admin/clubs': {
    title: 'Clubs & Societies',
    subtitle: 'Supervise registered student chapters, society advisors, and institutional funding charters.',
    breadcrumb: 'Clubs',
    icon: <IconClubs className="w-6 h-6 text-emerald-600" />,
  },
  '/admin/registrations': {
    title: 'Registrations Master Roster',
    subtitle: 'Audit participation records, verify rosters, and export institutional enrollment data.',
    breadcrumb: 'Registrations',
    icon: <IconClipboardCheck className="w-6 h-6 text-teal-600" />,
  },
  '/admin/analytics': {
    title: 'Campus Analytics',
    subtitle: 'Executive trends, department participation rates, and institutional engagement metrics.',
    breadcrumb: 'Analytics',
    icon: <IconChart className="w-6 h-6 text-rose-600" />,
  },
  '/admin/reports': {
    title: 'Reports & Audits',
    subtitle: 'Generate and download official compliance reports, term audits, and participation summaries.',
    breadcrumb: 'Reports',
    icon: <IconReports className="w-6 h-6 text-indigo-600" />,
  },
  '/admin/notifications': {
    title: 'System Notifications & Broadcasts',
    subtitle: 'Dispatch campus-wide announcements, administrative alerts, and urgent security notices.',
    breadcrumb: 'Notifications',
    icon: <IconBell className="w-6 h-6 text-blue-600" />,
  },
  '/admin/support': {
    title: 'Support Desk & Inquiries',
    subtitle: 'Manage administrative support tickets, system issue escalations, and technical assistance.',
    breadcrumb: 'Support',
    icon: <IconSupport className="w-6 h-6 text-rose-600" />,
  },
  '/admin/settings': {
    title: 'System Settings',
    subtitle: 'Institutional parameters, academic calendar setup, and platform-wide configurations.',
    breadcrumb: 'Settings',
    icon: <IconSettings className="w-6 h-6 text-slate-600" />,
  },
  '/admin/profile': {
    title: 'Super Admin Profile',
    subtitle: 'Manage your administrator credentials, security keys, and access logs.',
    breadcrumb: 'Profile',
    icon: <IconUser className="w-6 h-6 text-blue-600" />,
  },
}

export default function SuperAdminPlaceholder() {
  const location = useLocation()
  const navigate = useNavigate()

  const meta = routeMeta[location.pathname] || {
    title: 'Super Admin Module',
    subtitle: 'Central administrative module.',
    breadcrumb: 'Module',
    icon: <IconUsers className="w-6 h-6 text-blue-600" />,
  }

  return (
    <SuperAdminLayout>
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: meta.breadcrumb },
        ]}
        actions={
          <Badge variant="danger" dot>
            Super Admin Active
          </Badge>
        }
      />

      <Card padding="lg" className="border-dashed">
        <div className="text-center py-12 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
            {meta.icon}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">{meta.title}</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              This module route is registered in the Super Admin navigation structure. Comprehensive management tools and workflows for this section will be implemented in subsequent phases.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/dashboard')}
              icon={<IconArrowLeft className="w-4 h-4" />}
            >
              Return to Super Admin Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </SuperAdminLayout>
  )
}
