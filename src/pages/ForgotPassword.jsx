import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CampusLogo, IconLock, IconArrowLeft, IconMail, IconCheck } from '../components/icons/Icons'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your institutional email address.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setError('Please enter a valid email format (e.g. name@campus.edu).')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <CampusLogo className="w-10 h-10 text-blue-600 group-hover:scale-105 transition-transform" />
            <div className="text-left">
              <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                CAMPUS LIVE
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-normal block">
                Discover. Participate. Connect.
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <Card className="shadow-lg border-slate-200/80">
          <div className="p-6 sm:p-8 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto shadow-2xs">
              <IconLock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-slate-900">
                Reset Password
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Enter your registered student or faculty email address to receive password reset instructions.
              </p>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center animate-in fade-in duration-200">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <IconCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-900">
                    Reset Link Dispatched
                  </p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    If an account is associated with <span className="font-semibold">{email}</span>, we have sent instructions to reset your password.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                  className="text-xs mt-2"
                >
                  Send to a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Institutional Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="name@campus.edu"
                  error={error}
                  leftIcon={<IconMail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isLoading}
                >
                  Send Reset Link
                </Button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <IconArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
