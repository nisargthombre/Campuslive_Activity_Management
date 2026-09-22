import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CampusLogo,
  IconCheck,
  IconAlertCircle,
  IconClipboardCheck,
  IconActivity,
  IconUsers,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function AdminRegister() {
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    department: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Department options for faculty & staff administrators
  const departmentOptions = [
    'Computer Science & Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Civil Engineering',
    'Applied Sciences & Humanities',
    'Management & Business Administration',
    'Pharmacy & Health Sciences',
  ]

  // Handle Input Changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Frontend Validation
  const validateForm = () => {
    const newErrors = {}

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters.'
    }

    // 2. Official College Email
    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newErrors.email = 'Official college email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid official email address (e.g. name@campus.edu).'
      }
    }

    // 3. Employee / Staff ID
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee / Staff ID is required.'
    }

    // 4. Department
    if (!formData.department) {
      newErrors.department = 'Please select your academic or administrative department.'
    }

    // 5. Password
    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    // 6. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.'
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate mock frontend submission delay
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)

      // Derive avatar initials
      const nameParts = formData.fullName.trim().split(' ')
      const initials =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : nameParts[0].slice(0, 2).toUpperCase()

      // Store mock admin session
      try {
        localStorage.setItem(
          'campuslive_user',
          JSON.stringify({
            name: formData.fullName.trim(),
            role: 'Admin',
            email: formData.email.trim(),
            avatar: initials || 'DV',
            department: formData.department,
            employeeId: formData.employeeId.trim(),
          })
        )
      } catch {
        // ignore
      }

      // Redirect to Admin Dashboard after brief success display
      setTimeout(() => {
        navigate('/faculty/dashboard')
      }, 1200)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Campus Live Admin Branding & Features           */}
      {/* ============================================================ */}
      <div className="lg:w-5/12 xl:w-4/12 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <CampusLogo className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white leading-none block">
                CAMPUS LIVE
              </span>
              <span className="text-xs text-blue-200/80 font-medium tracking-wide mt-1 block">
                Discover. Participate. Connect.
              </span>
            </div>
          </Link>
        </div>

        {/* Middle: Headline & Highlights */}
        <div className="relative z-10 py-8 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Administrative & Faculty Access</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Empower campus activities and student engagement.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-lg hidden sm:block">
            Create your official administrator account to publish events, manage student registrations, oversee chapters, and broadcast notices.
          </p>

          {/* Highlights Grid */}
          <div className="space-y-3 pt-2 hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-blue-500/30 text-white shrink-0 mt-0.5">
                <IconActivity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Event Creation & Approvals</p>
                <p className="text-[11px] text-blue-200/80">
                  Publish workshops, hackathons, and verify student completion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/30 text-white shrink-0 mt-0.5">
                <IconClipboardCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Registration & Capacity Control</p>
                <p className="text-[11px] text-blue-200/80">
                  Track real-time rosters, approvals, and seat allocations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-purple-500/30 text-white shrink-0 mt-0.5">
                <IconUsers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Club & Society Oversight</p>
                <p className="text-[11px] text-blue-200/80">
                  Mentor student clubs and monitor co-curricular achievements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-blue-200/70">
          <span>KPGU Faculty & Staff Portal</span>
          <span>© 2026 Campus Live</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: The Admin Registration Form Card               */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 my-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Create Admin Account
                </h2>
                <div className="self-center sm:self-auto">
                  <Badge variant="secondary" size="md">
                    Admin Portal
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Set up your official Campus Live administrator account.
              </p>
            </div>

            {/* Success State Alert */}
            {isSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">
                    Admin account created successfully!
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Redirecting to the Admin Dashboard...
                  </p>
                </div>
              </div>
            )}

            {/* General Form Error Alert */}
            {Object.keys(errors).length > 0 && !isSuccess && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Please correct the errors indicated below to proceed.</span>
              </div>
            )}

            {/* Admin Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Field 1: Full Name */}
              <Input
                label="Full Name"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Prof. David Vance"
                required
                error={errors.fullName}
                disabled={isLoading || isSuccess}
              />

              {/* Field 2: Official College Email */}
              <Input
                label="Official College Email"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. d.vance@campus.edu"
                required
                error={errors.email}
                disabled={isLoading || isSuccess}
                helperText="Use your institutional staff address."
              />

              {/* Field 3 & 4: Employee / Staff ID and Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Employee / Staff ID"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  placeholder="e.g. EMP-2026-089"
                  required
                  error={errors.employeeId}
                  disabled={isLoading || isSuccess}
                />

                <Select
                  label="Department"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  options={departmentOptions}
                  placeholder="Select Department"
                  required
                  error={errors.department}
                  disabled={isLoading || isSuccess}
                />
              </div>

              {/* Field 5 & 6: Password and Confirm Password with Show/Hide toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput
                  label="Password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  error={errors.password}
                  disabled={isLoading || isSuccess}
                  helperText="Minimum 6 characters."
                />

                <PasswordInput
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  error={errors.confirmPassword}
                  disabled={isLoading || isSuccess}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                  disabled={isLoading || isSuccess}
                  isLoading={isLoading}
                >
                  Create Admin Account
                </Button>
              </div>
            </form>

            {/* Footer Links */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                <span>Already have an account? </span>
                <Link
                  to="/admin/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign In
                </Link>
              </div>

              <div className="text-slate-400">
                <span>Looking for student registration? </span>
                <Link
                  to="/register"
                  className="font-medium text-slate-600 hover:text-blue-600 hover:underline"
                >
                  Student Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
