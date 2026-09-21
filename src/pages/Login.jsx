import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CampusLogo,
  IconMail,
  IconGoogle,
  IconAlertCircle,
  IconActivity,
  IconClubs,
  IconCalendar,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import Button from '../components/common/Button'

export default function Login() {
  const navigate = useNavigate()

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [googleNotice, setGoogleNotice] = useState(null)

  // Validation function
  const validateForm = () => {
    const newErrors = {}
    const trimmedEmail = email.trim()

    // 1. Email validation
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address (e.g. name@campus.edu).'
      }
    }

    // 2. Password validation
    if (!password) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submit
  const handleSignIn = (e) => {
    e.preventDefault()
    setGoogleNotice(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate mock frontend login delay
    setTimeout(() => {
      setIsLoading(false)
      try {
        // Set mock session for Nisarg / Student
        localStorage.setItem(
          'campuslive_user',
          JSON.stringify({
            name: 'Nisarg',
            role: 'Student',
            email: email.trim() || 'nisarg@campus.edu',
            avatar: 'N',
          })
        )
      } catch {
        // ignore
      }
      navigate('/student/dashboard')
    }, 700)
  }

  // Handle Google Login Click (UI Only)
  const handleGoogleSignIn = () => {
    setGoogleNotice(
      'Google authentication will be connected during the authentication integration phase.'
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Campus Live Branding & Atmosphere (Desktop Only on heavy details) */}
      {/* ============================================================ */}
      <div className="lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
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

        {/* Middle: Description & Highlights (Clean on desktop, compact on mobile) */}
        <div className="relative z-10 py-8 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KPGU Campus Activity Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your central platform for discovering and participating in campus activities.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-lg hidden sm:block">
            Connect with technical workshops, cultural celebrations, sports tournaments, and student clubs across the university.
          </p>

          {/* Feature Highlights Grid (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 hidden sm:grid">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-white">
                <IconActivity className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Explore Activities</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Browse workshops, competitions & hackathons.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-white">
                <IconClubs className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Join Clubs</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Find student chapters and vibrant communities.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-white">
                <IconCalendar className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Track Registrations</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Instant confirmation and status tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Note & Copyright */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-blue-200/70">
          <span>KPGU Vadodara Official Campus Portal</span>
          <span>© 2026 Campus Live. All rights reserved.</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: The Login Form Card */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            {/* Heading & Subtitle */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Sign in to continue to Campus Live.
              </p>
            </div>

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

            {/* Login Form */}
            <form onSubmit={handleSignIn} noValidate className="space-y-4">
              {/* Email Field */}
              <Input
                label="Email Address"
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: null }))
                  }
                }}
                placeholder="e.g. nisarg@campus.edu"
                error={errors.email}
                leftIcon={<IconMail className="w-4 h-4" />}
                required
              />

              {/* Password Field */}
              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  id="login-password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: null }))
                    }
                  }}
                  placeholder="Enter your password"
                  error={errors.password}
                  required
                />

                {/* Forgot Password Link */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 font-medium select-none">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isLoading}
                  className="py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Divider: OR */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
                  OR
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={handleGoogleSignIn}
              icon={<IconGoogle className="w-4 h-4 shrink-0" />}
              className="py-2.5 text-xs sm:text-sm font-medium border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs cursor-pointer"
            >
              Continue with Google
            </Button>

            {/* Register Link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Institutional Portal Notice */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              Students, Faculty, and Administrators access via institutional credentials.
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <Link to="/student/support" className="hover:text-slate-600 transition-colors">
                Help & Support
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
