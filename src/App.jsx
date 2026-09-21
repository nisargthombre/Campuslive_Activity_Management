import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
