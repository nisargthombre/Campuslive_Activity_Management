import BaseLayout from '../components/layout/BaseLayout'
import { adminNav } from '../config/navigation'

export default function SuperAdminLayout({ children }) {
  const adminUser = {
    name: 'Sarah Jenkins',
    role: 'Super Admin',
    email: 's.jenkins@campus.edu',
    avatar: 'SJ',
  }

  return (
    <BaseLayout user={adminUser} navItems={adminNav}>
      {children}
    </BaseLayout>
  )
}
