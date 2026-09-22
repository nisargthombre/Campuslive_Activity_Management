import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CampusLogo,
  IconMail,
  IconAlertCircle,
  IconCheck,
  IconArrowLeft,
  IconLock,
  IconActivity,
  IconClipboardCheck,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  // Validation function
  const validateEmail = (val) => {
    const trimmed = val.trim()
    if (!trimmed) {
      return 'Official college email is required.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid official email address (e.g. d.vance@campus.edu).'
    }
    return ''
  }

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsLoading(true)

    // Simulate mock frontend submission delay
    setTimeout(() => {
      setIsLoading(false)
      setSubmittedEmail(email.trim())
      setIsSubmitted(true)
    }, 700)
  }

  // Handle Try Another Email
  const handleTryAnother = () => {
    setIsSubmitted(false)
    setEmail('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* ============================================================ */}
      {/* LEFT COLUMN: Campus Live Admin Branding & Atmosphere         */}
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

        {/* Middle: Description & Highlights */}
        <div className="relative z-10 py-8 sm:py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-blue-100 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Account Recovery</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Secure password recovery for campus administrators.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal max-w-lg hidden sm:block">
            Authorized faculty coordinators and department heads can reset their administrative portal credentials using their institutional email address.
          </p>

          {/* Feature Highlights Grid (Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 hidden sm:grid">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/30 flex items-center justify-center text-white">
                <IconLock className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Encrypted Reset</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                One-time verification link sent to your college inbox.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 flex items-center justify-center text-white">
                <IconClipboardCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Identity Verified</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Authenticated against official faculty directory records.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/30 flex items-center justify-center text-white">
                <IconActivity className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-white">Immediate Access</p>
              <p className="text-[11px] text-blue-200/80 leading-snug">
                Regain access to your activities and club rosters quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Institutional Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-blue-200/70">
          <span>KPGU Faculty & Administrative Portal</span>
          <span>© 2026 Campus Live</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT COLUMN: The Admin Forgot Password Card                 */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Forgot Password?
                </h2>
                <div className="self-center sm:self-auto">
                  <Badge variant="secondary" size="md">
                    Admin Portal
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Enter your official college email and we&apos;ll help you reset your password.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success State vs Form */}
            {isSubmitted ? (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <IconCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-emerald-900">
                      Check your email
                    </h3>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      If an account exists with this email, password reset instructions will be sent.
                    </p>
                    {submittedEmail && (
                      <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-emerald-100/70 text-xs font-semibold text-emerald-900 font-mono break-all">
                        {submittedEmail}
                      </div>
                    )}
                  </div>
                </div>

                {/* Return to Admin Login CTA */}
                <div className="space-y-2 pt-1">
                  <Link
                    to="/admin/login"
                    className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Back to Admin Login
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={handleTryAnother}
                    className="py-2.5 text-xs sm:text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Try another email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Field 1: Official College Email */}
                <Input
                  label="Official College Email"
                  id="admin-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. d.vance@campus.edu"
                  leftIcon={<IconMail className="w-4 h-4" />}
                  required
                  error={error}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                  helperText="Instructions will be sent to your verified staff address."
                />

                {/* Send Reset Link Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    className="py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}

            {/* Back to Admin Login Link */}
            <div className="text-center pt-2 border-t border-slate-100">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <IconArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Login</span>
              </Link>
            </div>
          </div>

          {/* Secondary Institutional Navigation */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-slate-400">
              Need assistance with your institutional account?
            </p>
            <div className="flex items-center justify-center gap-3 text-xs">
              <Link
                to="/faculty/support"
                className="font-medium text-slate-600 hover:text-blue-600 transition-colors hover:underline"
              >
                Admin Support Desk
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/login"
                className="font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Student Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
