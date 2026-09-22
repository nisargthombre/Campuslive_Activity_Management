import BaseLayout from '../components/layout/BaseLayout'
import { facultyNav } from '../config/navigation'

export default function FacultyLayout({ children }) {
  const facultyUser = {
    name: 'Prof. David Vance',
    role: 'Admin',
    email: 'd.vance@campus.edu',
    avatar: 'DV',
  }

  return (
    <BaseLayout user={facultyUser} navItems={facultyNav}>
      {children}
    </BaseLayout>
  )
}
