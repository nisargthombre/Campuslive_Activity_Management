import SuperAdminLayout from '../layouts/SuperAdminLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Card from '../components/common/Card'

function AdminDashboard() {
  return (
    <SuperAdminLayout>
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Institution-wide activity administration, user access control, and campus analytics."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Super Admin', to: '/admin/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <Badge variant="danger" dot>
            Super Admin Active
          </Badge>
        }
      />

      <Card padding="lg" className="border-dashed">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Super Admin Dashboard Layout Active</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            This route is mounted inside <code className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono text-xs">SuperAdminLayout</code> with sectioned Super Admin navigation and top navigation bar.
          </p>
        </div>
      </Card>
    </SuperAdminLayout>
  )
}

export default AdminDashboard
