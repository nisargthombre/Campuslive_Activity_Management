import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CampusLogo,
  IconMail,
  IconGoogle,
  IconAlertCircle,
  IconCheck,
  IconActivity,
  IconClubs,
  IconCalendar,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import Select from '../components/common/Select'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function Register() {
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    course: '',
    academicYear: '',
    studentId: '',
    phone: '',
  })

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [googleNotice, setGoogleNotice] = useState(null)

  // Department options
  const departmentOptions = [
    'Computer Science & Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical & Electronics Engineering',
    'Management & Business Studies',
    'Pharmacy & Health Sciences',
    'Applied Sciences & Humanities',
  ]

  // Academic Year options
  const academicYearOptions = [
    '1st Year (Semester 1 & 2)',
    '2nd Year (Semester 3 & 4)',
    '3rd Year (Semester 5 & 6)',
    '4th Year (Semester 7 & 8)',
    'Post Graduate (PG)',
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
    }

    // 2. Email
    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newErrors.email = 'Institutional email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address (e.g. name@campus.edu).'
      }
    }

    // 3. Password
    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    // 4. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.'
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match. Please verify.'
    }

    // 5. Department
    if (!formData.department) {
      newErrors.department = 'Please select your department.'
    }

    // 6. Course / Program
    if (!formData.course.trim()) {
      newErrors.course = 'Course / program is required.'
    }

    // 7. Academic Year
    if (!formData.academicYear) {
      newErrors.academicYear = 'Please select your academic year.'
    }

    // 8. Student ID
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID / Roll No. is required.'
    }

    // 9. Terms Checkbox
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms and Privacy Policy to register.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submit
  const handleRegister = (e) => {
    e.preventDefault()
    setGoogleNotice(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate mock registration
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)

      // Optionally save mock student data
      try {
        localStorage.setItem(
          'campuslive_user',
          JSON.stringify({
            name: formData.fullName.trim(),
            role: 'Student',
            email: formData.email.trim(),
            avatar: formData.fullName.trim().charAt(0).toUpperCase() || 'S',
            studentId: formData.studentId.trim(),
            department: formData.department,
            course: formData.course.trim(),
            academicYear: formData.academicYear,
            phone: formData.phone.trim(),
          })
        )
      } catch {
        // ignore
      }
    }, 700)
  }

  // Handle Google Sign Up
  const handleGoogleSignUp = () => {
    setGoogleNotice(
      'Google authentication will be connected during the authentication integration phase.'
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Campus Live Branding & Features */}
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
            <span>KPGU Student Registration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Begin your journey with Campus Live today.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-lg hidden sm:block">
            Create your student account to register for upcoming hackathons, tech workshops, sports tournaments, and student clubs.
          </p>

          {/* Highlights Grid */}
          <div className="space-y-3 pt-2 hidden sm:block">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-blue-500/30 text-white shrink-0 mt-0.5">
                <IconActivity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Instant Event Access</p>
                <p className="text-[11px] text-blue-200/80">
                  Register for campus activities with a single click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-indigo-500/30 text-white shrink-0 mt-0.5">
                <IconClubs className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Vibrant Student Clubs</p>
                <p className="text-[11px] text-blue-200/80">
                  Join cultural and technical clubs that match your passions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <div className="p-2 rounded-lg bg-purple-500/30 text-white shrink-0 mt-0.5">
                <IconCalendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Participation Records</p>
                <p className="text-[11px] text-blue-200/80">
                  Keep a centralized record of your co-curricular events.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-blue-200/70">
          <span>KPGU Vadodara Campus Portal</span>
          <span>© 2026 Campus Live</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: The Registration Form Card */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl space-y-6 my-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Create Your Account
                </h2>
                <div className="self-center sm:self-auto">
                  <Badge variant="primary" size="sm" className="font-semibold text-xs py-0.5 px-2.5">
                    Account type: Student
                  </Badge>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Join Campus Live and stay connected with campus activities.
              </p>
            </div>

            {/* Success State Banner */}
            {isSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <IconCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-emerald-900">
                    Account Created Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                    Welcome to Campus Live, <span className="font-bold">{formData.fullName}</span>! Your student registration has been processed. You can now sign in to start exploring activities.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/login')}
                    className="px-6 shadow-sm shadow-blue-500/20"
                  >
                    Proceed to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Google Notice Banner if clicked */}
                {googleNotice && (
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">Notice:</p>
                      <p className="mt-0.5 leading-relaxed">{googleNotice}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGoogleNotice(null)}
                      className="text-blue-500 hover:text-blue-700 cursor-pointer"
                      aria-label="Dismiss notice"
                    >
                      <span className="text-base font-bold leading-none">&times;</span>
                    </button>
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegister} noValidate className="space-y-5">
                  {/* Grid of Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <Input
                      label="Full Name"
                      id="reg-fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Nisarg Patel"
                      error={errors.fullName}
                      required
                    />

                    {/* Student ID */}
                    <Input
                      label="Student ID / Roll No."
                      id="reg-studentId"
                      value={formData.studentId}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      placeholder="e.g. CL-2024-8842"
                      error={errors.studentId}
                      required
                    />

                    {/* Institutional Email */}
                    <Input
                      label="Institutional Email"
                      id="reg-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="e.g. nisarg@campus.edu"
                      error={errors.email}
                      leftIcon={<IconMail className="w-4 h-4" />}
                      required
                    />

                    {/* Phone Number (Optional) */}
                    <Input
                      label="Phone Number"
                      id="reg-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98765 43210 (Optional)"
                      helperText="Optional for SMS updates"
                    />

                    {/* Department */}
                    <Select
                      label="Department"
                      id="reg-department"
                      value={formData.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      options={departmentOptions}
                      placeholder="Select Department"
                      error={errors.department}
                      required
                    />

                    {/* Academic Year */}
                    <Select
                      label="Academic Year"
                      id="reg-academicYear"
                      value={formData.academicYear}
                      onChange={(e) => handleChange('academicYear', e.target.value)}
                      options={academicYearOptions}
                      placeholder="Select Academic Year"
                      error={errors.academicYear}
                      required
                    />

                    {/* Course / Program (Span 2) */}
                    <div className="sm:col-span-2">
                      <Input
                        label="Course / Program"
                        id="reg-course"
                        value={formData.course}
                        onChange={(e) => handleChange('course', e.target.value)}
                        placeholder="e.g. B.Tech in Computer Engineering"
                        error={errors.course}
                        required
                      />
                    </div>

                    {/* Password */}
                    <PasswordInput
                      label="Password"
                      id="reg-password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="At least 6 characters"
                      error={errors.password}
                      required
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                      label="Confirm Password"
                      id="reg-confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      error={errors.confirmPassword}
                      required
                    />
                  </div>

                  {/* Informational Role Note */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800 shrink-0">Note:</span>
                    <span>
                      Public registration automatically assigns a <strong className="text-blue-700">Student</strong> account. Faculty coordinator and administrator roles are assigned through the university administration.
                    </span>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked)
                          if (errors.terms) {
                            setErrors((prev) => ({ ...prev, terms: null }))
                          }
                        }}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-slate-700 leading-snug">
                        I agree to the{' '}
                        <span className="font-semibold text-blue-600 hover:underline">
                          Campus Live Terms of Service
                        </span>{' '}
                        and{' '}
                        <span className="font-semibold text-blue-600 hover:underline">
                          Privacy Policy
                        </span>
                        . <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-xs text-rose-600 pl-6.5">{errors.terms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      fullWidth
                      isLoading={isLoading}
                      className="py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Create Account
                    </Button>
                  </div>
                </form>

                {/* Divider: OR */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                      OR
                    </span>
                  </div>
                </div>

                {/* Google Sign Up Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={handleGoogleSignUp}
                  icon={<IconGoogle className="w-4 h-4 shrink-0" />}
                  className="py-2.5 text-xs sm:text-sm font-medium border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs cursor-pointer"
                >
                  Continue with Google
                </Button>

                {/* Sign In Link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              Need help? Reach out to your department coordinator or campus support.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <Link to="/help-support" className="hover:text-slate-600 transition-colors">
                Help & Support
              </Link>
              <span>•</span>
              <Link to="/login" className="hover:text-slate-600 transition-colors">
                Sign In
              </Link>
              <span>•</span>
              <Link to="/" className="hover:text-slate-600 transition-colors">
                Campus Live Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
