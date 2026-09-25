import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import StudentDashboard from './pages/StudentDashboard'
import ExploreActivities from './pages/ExploreActivities'
import ActivityDetails from './pages/ActivityDetails'
import MyRegistrations from './pages/MyRegistrations'
import MyActivity from './pages/MyActivity'
import StudentClubs from './pages/StudentClubs'
import ClubDetails from './pages/ClubDetails'
import StudentNotifications from './pages/StudentNotifications'
import StudentSupport from './pages/StudentSupport'
import StudentProfile from './pages/StudentProfile'
import StudentSettings from './pages/StudentSettings'
import FacultyDashboard from './pages/FacultyDashboard'
import FacultyActivities from './pages/FacultyActivities'
import FacultyCreateActivity from './pages/FacultyCreateActivity'
import FacultyActivityDetails from './pages/FacultyActivityDetails'
import FacultyEditActivity from './pages/FacultyEditActivity'
import FacultyRegistrations from './pages/FacultyRegistrations'
import FacultyStudents from './pages/FacultyStudents'
import FacultyStudent360 from './pages/FacultyStudent360'
import FacultyClubs from './pages/FacultyClubs'
import FacultyClubDetails from './pages/FacultyClubDetails'
import FacultyAnalytics from './pages/FacultyAnalytics'
import FacultyNotifications from './pages/FacultyNotifications'
import FacultySupport from './pages/FacultySupport'
import FacultyPlaceholder from './pages/FacultyPlaceholder'
import AdminDashboard from './pages/AdminDashboard'
import AdminRegister from './pages/AdminRegister'
import AdminLogin from './pages/AdminLogin'
import AdminForgotPassword from './pages/AdminForgotPassword'
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminForgotPassword from './pages/SuperAdminForgotPassword'
import SuperAdminUsers from './pages/SuperAdminUsers'
import SuperAdminStudents from './pages/SuperAdminStudents'
import SuperAdminStaff from './pages/SuperAdminStaff'
import SuperAdminActivities from './pages/SuperAdminActivities'
import SuperAdminCreateActivity from './pages/SuperAdminCreateActivity'
import SuperAdminClubs from './pages/SuperAdminClubs'
import SuperAdminRegistrations from './pages/SuperAdminRegistrations'
import SuperAdminAnalytics from './pages/SuperAdminAnalytics'
import SuperAdminReports from './pages/SuperAdminReports'
import SuperAdminNotifications from './pages/SuperAdminNotifications'
import SuperAdminSupport from './pages/SuperAdminSupport'
import SuperAdminSettings from './pages/SuperAdminSettings'
import HelpSupport from './pages/HelpSupport'

import SuperAdminPlaceholder from './pages/SuperAdminPlaceholder'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin/forgot-password" element={<SuperAdminForgotPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/faculty/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/faculty/register" element={<AdminRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/faculty/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/activities" element={<ExploreActivities />} />
        <Route path="/student/activities/:id" element={<ActivityDetails />} />
        <Route path="/student/my-registrations" element={<MyRegistrations />} />
        <Route path="/student/registrations" element={<MyRegistrations />} />
        <Route path="/student/my-activity" element={<MyActivity />} />
        <Route path="/student/history" element={<MyActivity />} />
        <Route path="/student/clubs" element={<StudentClubs />} />
        <Route path="/student/clubs/:id" element={<ClubDetails />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/support" element={<StudentSupport />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/settings" element={<StudentSettings />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/activities" element={<FacultyActivities />} />
        <Route path="/faculty/activities/create" element={<FacultyCreateActivity />} />
        <Route path="/faculty/activities/:id" element={<FacultyActivityDetails />} />
        <Route path="/faculty/activities/:id/edit" element={<FacultyEditActivity />} />
        <Route path="/faculty/registrations" element={<FacultyRegistrations />} />
        <Route path="/faculty/students" element={<FacultyStudents />} />
        <Route path="/faculty/students/:id" element={<FacultyStudent360 />} />
        <Route path="/faculty/clubs" element={<FacultyClubs />} />
        <Route path="/faculty/clubs/:id" element={<FacultyClubDetails />} />
        <Route path="/faculty/analytics" element={<FacultyAnalytics />} />
        <Route path="/faculty/notifications" element={<FacultyNotifications />} />
        <Route path="/faculty/support" element={<FacultySupport />} />
        <Route path="/faculty/support/:id" element={<FacultySupport />} />
        <Route path="/faculty/profile" element={<FacultyPlaceholder />} />
        <Route path="/faculty/settings" element={<FacultyPlaceholder />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<SuperAdminUsers />} />
        <Route path="/super-admin/users" element={<SuperAdminUsers />} />
        <Route path="/admin/students" element={<SuperAdminStudents />} />
        <Route path="/super-admin/students" element={<SuperAdminStudents />} />
        <Route path="/admin/staff" element={<SuperAdminStaff />} />
        <Route path="/super-admin/staff" element={<SuperAdminStaff />} />
        <Route path="/admin/faculty" element={<SuperAdminStaff />} />
        <Route path="/super-admin/faculty" element={<SuperAdminStaff />} />
        <Route path="/admin/activities" element={<SuperAdminActivities />} />
        <Route path="/super-admin/activities" element={<SuperAdminActivities />} />
        <Route path="/admin/activities/create" element={<SuperAdminCreateActivity />} />
        <Route path="/super-admin/activities/create" element={<SuperAdminCreateActivity />} />
        <Route path="/admin/clubs" element={<SuperAdminClubs />} />
        <Route path="/super-admin/clubs" element={<SuperAdminClubs />} />
        <Route path="/admin/registrations" element={<SuperAdminRegistrations />} />
        <Route path="/super-admin/registrations" element={<SuperAdminRegistrations />} />
        <Route path="/admin/analytics" element={<SuperAdminAnalytics />} />
        <Route path="/super-admin/analytics" element={<SuperAdminAnalytics />} />
        <Route path="/admin/reports" element={<SuperAdminReports />} />
        <Route path="/super-admin/reports" element={<SuperAdminReports />} />
        <Route path="/admin/notifications" element={<SuperAdminNotifications />} />
        <Route path="/super-admin/notifications" element={<SuperAdminNotifications />} />
        <Route path="/admin/support" element={<SuperAdminSupport />} />
        <Route path="/super-admin/support" element={<SuperAdminSupport />} />
        <Route path="/admin/settings" element={<SuperAdminSettings />} />
        <Route path="/super-admin/settings" element={<SuperAdminSettings />} />
        <Route path="/admin/profile" element={<SuperAdminPlaceholder />} />
        <Route path="/dev-portals" element={<Home />} />
        <Route path="/dev/portals" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
