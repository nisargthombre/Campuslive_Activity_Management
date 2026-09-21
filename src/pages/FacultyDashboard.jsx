import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Badge from '../components/common/Badge'
import Card from '../components/common/Card'

function FacultyDashboard() {
  return (
    <FacultyLayout>
      <PageHeader
        title="Faculty Dashboard"
        subtitle="Faculty activity oversight, student registrations, and club mentorship."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Faculty', to: '/faculty/dashboard' },
          { label: 'Dashboard' },
        ]}
        actions={
          <Badge variant="secondary" dot>
            Faculty Active
          </Badge>
        }
      />

      <Card padding="lg" className="border-dashed">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Faculty Dashboard Layout Active</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            This route is mounted inside <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono text-xs">FacultyLayout</code> with the dedicated Faculty sidebar and top navigation bar.
          </p>
        </div>
      </Card>
    </FacultyLayout>
  )
}

export default FacultyDashboard
