import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CampusLogo,
  IconLock,
  IconArrowLeft,
  IconMail,
  IconCheck,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import Button from '../components/common/Button'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('')

  // Validation function
  const validateEmail = (val) => {
    const trimmed = val.trim()
    if (!trimmed) {
      return 'Email address is required.'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@campus.edu).'
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
    }, 600)
  }

  const handleTryAnotherEmail = () => {
    setIsSubmitted(false)
    setEmail('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
              Discover. Participate. Connect.
            </span>
          </div>
        </Link>
      </div>

      {/* Center Card */}
      <main className="w-full max-w-md my-auto py-6 sm:py-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-6 sm:p-8 space-y-6">
          {/* Lock Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-2xs">
            <IconLock className="w-7 h-7 text-blue-600" />
          </div>

          {/* Header Title and Subtitle */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
              Enter your registered email address and we'll help you reset your password.
            </p>
          </div>

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
                    If an account exists with this email address, you will receive instructions to reset your password.
                  </p>
                  {lastSubmittedEmail && (
                    <div className="mt-2 inline-block px-2.5 py-1 rounded-md bg-emerald-100/70 text-xs font-semibold text-emerald-900 font-mono break-all">
                      {lastSubmittedEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Try another email button */}
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={handleTryAnotherEmail}
                className="py-2.5 text-xs sm:text-sm font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
              >
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Input */}
              <Input
                label="Email Address"
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. name@campus.edu"
                error={error}
                leftIcon={<IconMail className="w-4 h-4" />}
                required
                autoComplete="email"
                autoFocus
              />

              {/* Submit Button */}
              <div className="pt-1">
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

          {/* Back to Sign In Link */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors py-1 group"
            >
              <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

        {/* Optional Help: Still having trouble? Contact Support */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Still having trouble?{' '}
            <Link
              to="/help-support"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Contact Support
            </Link>
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
