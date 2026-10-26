import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  CampusLogo,
  IconMail,
  IconAlertCircle,
  IconLock,
  IconClipboardCheck,
  IconUsers,
  IconReports,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import PasswordInput from '../components/common/PasswordInput'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname || '/admin/dashboard'

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Frontend Validation
  const validateForm = () => {
    const newErrors = {}
    const trimmedEmail = email.trim()

    // 1. Email validation
    if (!trimmedEmail) {
      newErrors.email = 'Official Email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid official email address (e.g. s.jenkins@campus.edu).'
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

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate mock frontend login delay
    // Note: The login page itself does not grant Super Admin access.
    // Later, when Supabase/backend authentication is implemented, the authenticated
    // user's role must be checked and only users with the Super Admin role can access
    // the Super Admin Dashboard.
    setTimeout(() => {
      setIsLoading(false)
      try {
        localStorage.setItem(
          'campuslive_user',
          JSON.stringify({
            name: 'Sarah Jenkins',
            role: 'Super Admin',
            email: email.trim() || 's.jenkins@campus.edu',
            avatar: 'SJ',
            department: 'Institutional Governance & System Administration',
          })
        )
        window.dispatchEvent(new Event('campuslive_auth_updated'))
      } catch {
        // ignore
      }
      navigate(fromPath, { replace: true })
    }, 700)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Campus Live Super Admin Atmosphere              */}
      {/* ============================================================ */}
      <div className="lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle Ambient Background Glows */}
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

        {/* Middle: Description & Governance Highlights */}
        <div className="relative z-10 py-8 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>Campus Live System Administration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Institutional governance, access control, and platform administration.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-lg hidden sm:block">
            Authorized system administrators oversee university-wide activity compliance, faculty permissions, user accounts, and executive reports.
          </p>

          {/* Feature Highlights Grid (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 hidden sm:grid">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-white">
                <IconUsers className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Identity & Access</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Student and staff role management.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-white">
                <IconClipboardCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Audit & Compliance</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Master rosters and activity compliance.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-white">
                <IconReports className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Campus Analytics</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Executive analytics and term audits.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-blue-200/70">
          <span>KPGU Institutional Governance Portal</span>
          <span>© 2026 Campus Live</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: The Super Admin Login Form Card                */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Super Admin Login
                </h2>
                <div className="self-center sm:self-auto">
                  <Badge variant="danger" size="md">
                    Super Admin
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Sign in to access the Campus Live system administration portal.
              </p>
            </div>

            {/* Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Please correct the errors indicated below.</span>
              </div>
            )}

            {/* Super Admin Login Form */}
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              {/* Field 1: Official Email */}
              <Input
                label="Official Email"
                id="superadmin-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: null }))
                  }
                }}
                placeholder="e.g. s.jenkins@campus.edu"
                leftIcon={<IconMail className="w-4 h-4" />}
                error={errors.email}
                required
                disabled={isLoading}
              />

              {/* Field 2: Password with Show/Hide Toggle */}
              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  id="superadmin-password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: null }))
                    }
                  }}
                  placeholder="Enter your administrator password"
                  error={errors.password}
                  required
                  disabled={isLoading}
                />

                {/* Controls: Remember Me & Forgot Password? Row */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium select-none">
                      Remember Me
                    </span>
                  </label>

                  <Link
                    to="/super-admin/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Control: Sign In Button */}
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

            {/* Bottom: Back to Main Login & Security Isolation Notice */}
            <div className="text-center pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <IconLock className="w-3.5 h-3.5 text-slate-400" />
                <span>Restricted Access Portal</span>
              </p>
              <div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  <span>&larr; Back to Main Login</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              Campus Live University Administration & Governance
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
              <Link
                to="/help-support"
                className="hover:text-slate-600 transition-colors"
              >
                Help & Support
              </Link>
              <span>•</span>
              <Link
                to="/"
                className="hover:text-slate-600 transition-colors"
              >
                Campus Live Main
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
