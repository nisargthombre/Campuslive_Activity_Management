import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CampusLogo,
  IconLock,
  IconArrowLeft,
  IconMail,
  IconCheck,
  IconAlertCircle,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'

export default function SuperAdminForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('')

  // Validation function
  const validateEmail = (val) => {
    const trimmed = val.trim()
    if (!trimmed) {
      return 'Official Email is required.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid official administrator email (e.g. s.jenkins@campus.edu).'
    }
    return ''
  }

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
      setLastSubmittedEmail(email.trim())
      setIsSubmitted(true)
    }, 700)
  }

  const handleTryAnotherEmail = () => {
    setIsSubmitted(false)
    setEmail('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative">
      {/* Top Brand Bar */}
      <div className="w-full max-w-md pt-4 sm:pt-6 relative z-10 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-3 group focus:outline-hidden rounded-xl"
          aria-label="Campus Live Home"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <CampusLogo className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <span className="font-bold text-xl tracking-tight text-slate-900 leading-none block">
              CAMPUS LIVE
            </span>
            <span className="text-xs text-slate-500 font-medium tracking-wide mt-1 block">
              System Administration
            </span>
          </div>
        </Link>
      </div>

      {/* Center Card */}
      <main className="w-full max-w-md my-auto py-6 sm:py-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
              <IconLock className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="danger" size="md">
              Super Admin Recovery
            </Badge>
          </div>

          {/* Header Title and Subtitle */}
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter your official administrator email to receive instructions to reset your password.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form or Success State */}
          {isSubmitted ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <IconCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-sm font-bold text-emerald-900">
                    Check your email
                  </h2>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    If an account exists with this email address, password reset instructions will be sent.
                  </p>
                  {lastSubmittedEmail && (
                    <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-emerald-100/70 text-xs font-semibold text-emerald-900 font-mono break-all">
                      {lastSubmittedEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  to="/super-admin/login"
                  className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Return to Super Admin Login
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={handleTryAnotherEmail}
                  className="py-2.5 text-xs sm:text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Try another email
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Official Email Input */}
              <Input
                label="Official Email"
                id="superadmin-reset-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. s.jenkins@campus.edu"
                error={error}
                leftIcon={<IconMail className="w-4 h-4" />}
                required
                autoComplete="email"
                autoFocus
                disabled={isLoading}
                helperText="Reset instructions will be delivered to your verified institutional inbox."
              />

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
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}

          {/* Navigation Links */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-center">
            <div>
              <Link
                to="/super-admin/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1 group"
              >
                <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>&larr; Back to Super Admin Login</span>
              </Link>
            </div>
            <div>
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Back to Main Login
              </Link>
            </div>
          </div>
        </div>

        {/* Security / Governance Note */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-slate-400">
            Institutional recovery is monitored by IT Security Governance.
          </p>
        </div>
      </main>

      {/* Footer / Institutional Notice */}
      <footer className="w-full max-w-md pb-4 text-center space-y-1 relative z-10 text-[11px] text-slate-400">
        <p>KPGU Vadodara Official Campus Activity Management</p>
        <p>&copy; 2026 Campus Live. All rights reserved.</p>
      </footer>
    </div>
  )
}
