import { Link } from 'react-router-dom'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import StatCard from '../components/common/StatCard'
import {
  IconUser,
  IconUsers,
  IconCalendar,
  IconClubs,
  IconClipboardCheck,
  IconSupport,
  IconChevronRight,
} from '../components/icons/Icons'
import {
  superAdminStats,
  systemOverviewStats,
  superAdminRecentActivities,
  superAdminRecentRegistrations,
} from '../data/superAdminDashboardData'

export default function AdminDashboard() {
  // Stat Card Icon Mapping
  const statIconMap = {
    user: <IconUser className="w-5 h-5 text-blue-600" />,
    users: <IconUsers className="w-5 h-5 text-indigo-600" />,
    calendar: <IconCalendar className="w-5 h-5 text-amber-600" />,
    clubs: <IconClubs className="w-5 h-5 text-purple-600" />,
    clipboard: <IconClipboardCheck className="w-5 h-5 text-emerald-600" />,
    support: <IconSupport className="w-5 h-5 text-rose-600" />,
  }

  return (
    <SuperAdminLayout>
      {/* ============================================================== */}
      {/* 1. PAGE HEADER                                                 */}
      {/* ============================================================== */}
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Institution-wide activity administration, user access control, and campus analytics."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
            <Badge variant="danger" dot>
              Super Admin Active
            </Badge>
          </div>
        }
      />

      {/* ============================================================== */}
      {/* 2. SUMMARY CARDS (6 METRICS)                                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {superAdminStats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={statIconMap[stat.iconType] || <IconUser className="w-5 h-5 text-blue-600" />}
            iconBg={stat.iconBg}
            change={stat.change}
            changeType={stat.changeType}
            helperText={stat.helperText}
            className="border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow"
          />
        ))}
      </div>

      {/* ============================================================== */}
      {/* 3. SYSTEM OVERVIEW SECTION                                     */}
      {/* ============================================================== */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              System Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live platform metrics, active participation workloads, and pending administrative queues.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              Academic Year 2026-27 (Odd Semester)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemOverviewStats.map((item) => (
            <Card
              key={item.id}
              padding="md"
              className="border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <Badge variant={item.badgeVariant} size="sm">
                  {item.badge}
                </Badge>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RECENT ACTIVITIES & RECENT REGISTRATIONS (GRID)             */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* RECENT ACTIVITIES */}
        <Card
          padding="none"
          className="border-slate-200/90 shadow-2xs overflow-hidden flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Activities</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus-wide events, workshops, and competitions
              </p>
            </div>
            <Link
              to="/admin/activities"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Activity Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {superAdminRecentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 min-w-[170px]">
                      <div>{act.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {act.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {act.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-xs">
                      {act.date}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Badge variant={act.statusVariant} size="sm">
                        {act.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* RECENT REGISTRATIONS */}
        <Card
          padding="none"
          className="border-slate-200/90 shadow-2xs overflow-hidden flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Registrations</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest student enrollment activity across the institution
              </p>
            </div>
            <Link
              to="/admin/registrations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-3">Activity</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {superAdminRecentRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                          {reg.studentName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div>{reg.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">
                            {reg.studentRoll}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="py-3.5 px-3 text-slate-700 text-xs font-medium max-w-[180px] truncate"
                      title={reg.activity}
                    >
                      {reg.activity}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-xs">
                      {reg.registrationDate}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Badge variant={reg.statusVariant} size="sm">
                        {reg.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SuperAdminLayout>
  )
}
