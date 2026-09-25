import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CampusLogo,
  IconSearch,
  IconChevronDown,
  IconCheck,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconUser,
  IconCalendar,
  IconClipboardCheck,
  IconClubs,
  IconBell,
  IconSettings,
  IconSupport,
  IconLock,
} from '../components/icons/Icons'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Textarea from '../components/common/Textarea'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { createPublicInquiry } from '../data/unifiedSupportData'

// 1. FAQ Data Definitions
const FAQ_LIST = [
  {
    id: 'faq-1',
    category: 'Registration',
    question: 'How do I create a student account?',
    answer:
      "To create a student account, navigate to the Main Login page and click 'Create Student Account' (or go to /register). Provide your full name, official college email, student enrollment number, academic department, and choose a secure password. Once submitted, your student profile is created immediately and you can log in.",
  },
  {
    id: 'faq-2',
    category: 'Activities & Events',
    question: 'How do I register for an activity?',
    answer:
      "Sign in with your student credentials and visit the 'Explore Activities' section from your dashboard. Browse open workshops, technical symposiums, hackathons, and cultural events. Click on any event to view complete details, rules, and schedules, then click 'Register Now' to reserve your spot.",
  },
  {
    id: 'faq-3',
    category: 'Account & Login',
    question: 'I forgot my password. What should I do?',
    answer:
      "On the login page, click the 'Forgot Password?' link (or visit /forgot-password). Enter your registered college email address and submit the form. You will receive instructions and a secure password reset link in your email inbox.",
  },
  {
    id: 'faq-4',
    category: 'Clubs',
    question: 'How do I join a club?',
    answer:
      "From your Student Portal, select 'Clubs' in the sidebar to view all recognized university chapters and student societies. You can review club objectives, active leadership, faculty advisors, and upcoming events. Click on a club card to submit a membership registration request.",
  },
  {
    id: 'faq-5',
    category: 'Notifications',
    question: 'Why am I not receiving notifications?',
    answer:
      "First, check your notification center in the top navigation bar when logged in. Ensure your email notifications are enabled in your Account Settings. Also verify that your registered college email is spelled correctly and that automated notifications are not filtered into your spam or promotions folder.",
  },
  {
    id: 'faq-6',
    category: 'Account & Login',
    question: 'How can Admin/Staff access the Admin Portal?',
    answer:
      "Faculty coordinators and departmental administrators can access their dedicated portal by navigating to 'Staff / Admin Login' at /admin/login. Sign in using your verified institutional staff email and administrative password.",
  },
  {
    id: 'faq-7',
    category: 'Account & Login',
    question: 'Who can create an Admin account?',
    answer:
      "Admin and faculty coordinator accounts are strictly provisioned for authorized university personnel, departmental heads, and recognized activity mentors. Administrative access is managed through university departmental onboarding and approved by institutional administrators.",
  },
  {
    id: 'faq-8',
    category: 'General Information',
    question: 'How can I contact Campus Live support?',
    answer:
      "You can submit an inquiry directly using the 'Still need help?' contact form at the bottom of this page. You do not need to be logged in to contact our team. Our support desk responds to queries within 24 to 48 business hours.",
  },
]

// 2. Category Definitions
const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: IconSupport },
  { id: 'Account & Login', label: 'Account & Login', icon: IconLock },
  { id: 'Registration', label: 'Registration', icon: IconClipboardCheck },
  { id: 'Activities & Events', label: 'Activities & Events', icon: IconCalendar },
  { id: 'Clubs', label: 'Clubs', icon: IconClubs },
  { id: 'Notifications', label: 'Notifications', icon: IconBell },
  { id: 'Technical Problem', label: 'Technical Problem', icon: IconSettings },
  { id: 'General Information', label: 'General Information', icon: IconSupport },
]

export default function HelpSupport() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openFaqId, setOpenFaqId] = useState('faq-1')

  // Public Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    category: 'General Question',
    subject: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [inquiryId, setInquiryId] = useState('')

  // Filter FAQs based on search and selected category
  const filteredFaqs = useMemo(() => {
    return FAQ_LIST.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        faq.category.toLowerCase() === selectedCategory.toLowerCase()

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  // Form field change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Validate contact form
  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.'
      }
    }

    if (!formData.category) {
      errors.category = 'Please select an inquiry category.'
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required.'
    }

    if (!formData.message.trim()) {
      errors.message = 'Please provide details in your message.'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate mock frontend submission delay and save to unified support store
    setTimeout(() => {
      setIsSubmitting(false)
      const randomTicket = `INQ-${Math.floor(10000 + Math.random() * 90000)}`
      createPublicInquiry({
        ticketNumber: randomTicket,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })
      setInquiryId(randomTicket)
      setIsSubmitted(true)
    }, 700)
  }

  // Reset form to send another inquiry
  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      category: 'General Question',
      subject: '',
      message: '',
    })
    setFormErrors({})
    setIsSubmitted(false)
    setInquiryId('')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* ============================================================ */}
      {/* 1. PUBLIC TOP NAVIGATION BAR                                 */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
              <CampusLogo className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-none block">
                CAMPUS LIVE
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5 block">
                Help & Support
              </span>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors hidden sm:inline-block"
            >
              Create Account
            </Link>
            <Link
              to="/admin/login"
              className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO / INTRODUCTION SECTION                               */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/70 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <Badge variant="primary" size="md">
              Knowledge Base & Support Desk
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            How can we help?
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Find answers to common questions about accounts, activities, registrations, and clubs, or contact the Campus Live support team for assistance.
          </p>

          {/* Live FAQ Search Input */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative rounded-2xl shadow-md shadow-slate-200/50 bg-white">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <IconSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help topics (e.g. registration, password, clubs)..."
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="text-lg leading-none font-bold">&times;</span>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-slate-400 mt-2">
                Showing results matching &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. QUICK HELP CATEGORIES                                     */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center sm:text-left mb-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Browse by Topic
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a category to view relevant questions and guidelines.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = selectedCategory === cat.id

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id)
                  // When selecting a category other than 'all', pre-populate the inquiry form category
                  if (cat.id !== 'all') {
                    setFormData((prev) => ({
                      ...prev,
                      category:
                        cat.id === 'Technical Problem'
                          ? 'Technical Issue'
                          : cat.id,
                    }))
                  }
                }}
                className={`
                  p-3.5 rounded-xl border text-left transition-all duration-150 flex items-center gap-3 cursor-pointer group
                  ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
                  }
                `}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`block text-xs sm:text-sm font-semibold truncate ${
                      isSelected
                        ? 'text-blue-900'
                        : 'text-slate-800 group-hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FREQUENTLY ASKED QUESTIONS (ACCORDION)                    */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick answers to common questions about the Campus Live platform.
            </p>
          </div>
          {selectedCategory !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Show all FAQs
            </button>
          )}
        </div>

        {/* FAQs List Accordion */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <IconSearch className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No matching help topics found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find an answer matching &ldquo;{searchQuery}&rdquo;. Try another term or submit an inquiry using the contact form below.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id

              return (
                <div
                  key={faq.id}
                  className={`
                    bg-white rounded-xl border transition-all duration-150 overflow-hidden
                    ${
                      isOpen
                        ? 'border-blue-200 shadow-sm ring-1 ring-blue-100'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      <span className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <IconChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                        <span>Category: {faq.category}</span>
                        <span className="text-emerald-700 font-medium">Verified Campus Live Guide</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. CONTACT / ASK FOR HELP SECTION                            */}
      {/* ============================================================ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left space-y-1.5 border-b border-slate-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Still need help?
              </h2>
              <Badge variant="secondary" size="md">
                Direct Inquiry
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Send a message to the Campus Live support team. You don&apos;t need to log in to contact us.
            </p>
          </div>

          {/* Success State */}
          {isSubmitted ? (
            <div className="py-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                <IconCheck className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-slate-900">
                  Inquiry Submitted Successfully
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you! Your inquiry has been submitted. Our support team will review your message and reply to your provided email address.
                </p>
                {inquiryId && (
                  <div className="mt-3 inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-semibold text-slate-700">
                    Reference ID: {inquiryId}
                  </div>
                )}
              </div>

              <div className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleResetForm}
                >
                  Submit Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Row 1: Full Name & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="inquiry-fullname"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g. Nisarg Patel"
                  leftIcon={<IconUser className="w-4 h-4" />}
                  error={formErrors.fullName}
                  required
                  disabled={isSubmitting}
                />

                <Input
                  label="Email Address"
                  id="inquiry-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. name@campus.edu or personal email"
                  leftIcon={<IconMail className="w-4 h-4" />}
                  error={formErrors.email}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 2: Category & Optional Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  id="inquiry-category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  options={[
                    'Account & Login',
                    'Registration',
                    'Activities & Events',
                    'Clubs',
                    'Technical Issue',
                    'General Question',
                    'Other',
                  ]}
                  error={formErrors.category}
                  required
                  disabled={isSubmitting}
                />

                <Input
                  label="Phone Number (Optional)"
                  id="inquiry-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  leftIcon={<IconPhone className="w-4 h-4" />}
                  disabled={isSubmitting}
                />
              </div>

              {/* Row 3: Subject */}
              <Input
                label="Subject"
                id="inquiry-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Brief summary of your inquiry"
                error={formErrors.subject}
                required
                disabled={isSubmitting}
              />

              {/* Row 4: Message */}
              <Textarea
                label="Message"
                id="inquiry-message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Please describe your question or issue in detail..."
                error={formErrors.message}
                required
                disabled={isSubmitting}
                helperText="Do not include sensitive passwords or confidential personal codes."
              />

              {/* General Form Error Alert */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <IconAlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Please fill in all required fields indicated above.</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={isSubmitting}
                  className="py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. PUBLIC FOOTER                                             */}
      {/* ============================================================ */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Main Login
          </Link>
          <span>•</span>
          <Link to="/register" className="hover:text-blue-600 transition-colors">
            Create Student Account
          </Link>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-blue-600 transition-colors">
            Staff / Admin Login
          </Link>
          <span>•</span>
          <Link to="/super-admin/login" className="hover:text-rose-600 transition-colors">
            Super Admin Login
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 space-y-0.5">
          <p>KPGU Vadodara Official Campus Activity Management</p>
          <p>© 2026 Campus Live. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
