import BaseLayout from '../components/layout/BaseLayout'
import { studentNav } from '../config/navigation'

export default function StudentLayout({ children }) {
  const studentUser = {
    name: 'Nisarg',
    role: 'Student',
    email: 'nisarg@campus.edu',
    avatar: 'N',
  }

  return (
    <BaseLayout user={studentUser} navItems={studentNav}>
      {children}
    </BaseLayout>
  )
}
