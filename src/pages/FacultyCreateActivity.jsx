import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Textarea from '../components/common/Textarea'
import Modal from '../components/common/Modal'
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
  IconAlertCircle,
  IconCamera,
  IconActivity,
} from '../components/icons/Icons'

const activityTypeOptions = [
  'Workshop',
  'Seminar',
  'Competition',
  'Hackathon',
  'Cultural',
  'Sports',
  'Technical',
  'Other',
]

const departmentOptions = [
  'All Departments',
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Other',
]

const academicYearOptions = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
]

export default function FacultyCreateActivity() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    description: '',
    bannerImage: null,
    bannerPreview: null,
    date: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    venue: '',
    address: '',
    organizer: 'Dept. of Computer Science & Engineering',
    contact_email: 'd.vance@campus.edu',
    contact_phone: '+91 98765 43210',
    department: 'All Departments',
    course: '',
    academic_year: 'All Years',
    max_participants: '100',
    registration_required: true,
    status: 'Draft', // 'Draft' | 'Published'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdSuccessData, setCreatedSuccessData] = useState(null)

  // Handle Input Changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setFormData((prev) => ({
        ...prev,
        bannerImage: file,
        bannerPreview: previewUrl,
      }))
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      bannerImage: null,
      bannerPreview: null,
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Frontend Validation Logic
  const validateForm = () => {
    const newErrors = {}

    // 1. Required text fields
    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required.'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Activity description is required.'
    }

    if (!formData.date) {
      newErrors.date = 'Activity date is required.'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required.'
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required.'
    }

    // End time must be after start time
    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        newErrors.end_time = 'End time must be after start time.'
      }
    }

    if (!formData.registration_deadline) {
      newErrors.registration_deadline = 'Registration deadline is required.'
    }

    // Registration deadline cannot be after activity date
    if (formData.date && formData.registration_deadline) {
      if (formData.registration_deadline > formData.date) {
        newErrors.registration_deadline =
          'Registration deadline cannot be after the activity date.'
      }
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue location is required.'
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Organizer name is required.'
    }

    // Valid email format
    const emailTrimmed = formData.contact_email.trim()
    if (!emailTrimmed) {
      newErrors.contact_email = 'Contact email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.contact_email = 'Please enter a valid email address.'
      }
    }

    // Maximum participants must be a positive number
    const maxNumber = Number(formData.max_participants)
    if (!formData.max_participants || isNaN(maxNumber) || maxNumber <= 0) {
      newErrors.max_participants = 'Maximum participants must be a positive number.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submit
  const handleSubmit = (targetStatus) => {
    if (!validateForm()) {
      // Scroll smoothly to the first error
      const firstErrorKey = Object.keys(errors)[0]
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    // Simulate mock save delay
    setTimeout(() => {
      setIsSubmitting(false)
      const submittedRecord = {
        ...formData,
        status: targetStatus,
        id: `act-${Date.now().toString().slice(-4)}`,
      }
      setCreatedSuccessData(submittedRecord)
    }, 600)
  }

  return (
    <FacultyLayout>
      {/* 1. Header with Back Button */}
      <PageHeader
        title="Create Activity"
        subtitle="Create a new campus activity and share it with eligible students."
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Activities', to: '/faculty/activities' },
          { label: 'Create Activity' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/faculty/activities')}
            icon={<IconArrowLeft className="w-4 h-4" />}
            className="text-slate-700"
          >
            Back to Activities
          </Button>
        }
      />

      {/* Main 2-Column Responsive Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
        {/* LEFT / CENTER: Multi-Section Form (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Activity Information */}
          <Card
            title="1. Activity Information"
            subtitle="Basic information, type, description, and event banner"
          >
            <div className="space-y-4">
              {/* Title */}
              <Input
                label="Activity Title"
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. AI & Future Technology Workshop"
                error={errors.title}
                required
              />

              {/* Type */}
              <Select
                label="Activity Type"
                id="type"
                name="type"
                value={formData.type}
                onChange={(val) => handleChange('type', val)}
                options={activityTypeOptions}
                required
              />

              {/* Description */}
              <Textarea
                label="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the activity, key learning objectives, schedule details, and what students should expect..."
                rows={4}
                error={errors.description}
                required
              />

              {/* Activity Banner / Thumbnail Upload */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-sm font-medium text-slate-700">
                  Activity Banner / Thumbnail{' '}
                  <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>

                {formData.bannerPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={formData.bannerPreview}
                      alt="Banner Preview"
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 text-slate-800"
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                      <IconCamera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Click to upload activity banner
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG or WEBP up to 5MB (16:9 ratio recommended)
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500 font-medium">
                      <span>Will connect to Supabase Storage</span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Schedule */}
          <Card
            title="2. Schedule & Deadlines"
            subtitle="Specify event timing, date, and registration cutoff"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Activity Date */}
                <Input
                  label="Activity Date"
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  error={errors.date}
                  required
                />

                {/* Registration Deadline */}
                <Input
                  label="Registration Deadline"
                  id="registration_deadline"
                  name="registration_deadline"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => handleChange('registration_deadline', e.target.value)}
                  helperText="Must be on or before the activity date"
                  error={errors.registration_deadline}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Time */}
                <Input
                  label="Start Time"
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  error={errors.start_time}
                  required
                />

                {/* End Time */}
                <Input
                  label="End Time"
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  helperText="Must be after start time"
                  error={errors.end_time}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Section 3: Location */}
          <Card
            title="3. Location"
            subtitle="Campus venue and specific room coordinates"
          >
            <div className="space-y-4">
              <Input
                label="Venue / Hall"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                placeholder="e.g. Seminar Hall, Main Academic Block or Innovation Hub"
                error={errors.venue}
                required
              />

              <Input
                label="Detailed Address / Landmark"
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Floor 2, Block C, KPGU Vadodara Campus (Optional)"
              />
            </div>
          </Card>

          {/* Section 4: Organizer & Contact */}
          <Card
            title="4. Organizer & Contact Details"
            subtitle="Official department host and student inquiries contact"
          >
            <div className="space-y-4">
              <Input
                label="Organizer Name"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                placeholder="e.g. Dept. of Computer Science & Engineering"
                error={errors.organizer}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  placeholder="name@campus.edu"
                  error={errors.contact_email}
                  required
                />

                <Input
                  label="Contact Phone"
                  id="contact_phone"
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  placeholder="+91 98765 43210 (Optional)"
                />
              </div>
            </div>
          </Card>

          {/* Section 5: Eligibility */}
          <Card
            title="5. Eligibility Criteria"
            subtitle="Target department, academic year, and student cohorts"
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                <IconAlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  These criteria act as eligibility filters for student registration, not mandatory restrictions unless selected.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Department Eligibility"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={(val) => handleChange('department', val)}
                  options={departmentOptions}
                />

                <Select
                  label="Academic Year"
                  id="academic_year"
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={(val) => handleChange('academic_year', val)}
                  options={academicYearOptions}
                />
              </div>

              <Input
                label="Course / Degree Stream"
                id="course"
                name="course"
                value={formData.course}
                onChange={(e) => handleChange('course', e.target.value)}
                placeholder="e.g. B.Tech / M.Tech / Diploma (Optional)"
              />
            </div>
          </Card>

          {/* Section 6: Registration Settings */}
          <Card
            title="6. Registration Settings"
            subtitle="Participant cap and registration requirement"
          >
            <div className="space-y-4">
              <Input
                label="Maximum Participants"
                id="max_participants"
                name="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => handleChange('max_participants', e.target.value)}
                placeholder="e.g. 100"
                error={errors.max_participants}
                required
              />

              {/* Information message per prompt requirement */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <IconCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-slate-800">Automatic Capacity Tracking:</span>{' '}
                  Available seats will be calculated automatically from registrations.
                </p>
              </div>

              {/* Registration Required Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Registration Required
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Students must submit an application before participating
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.registration_required}
                    onChange={(e) => handleChange('registration_required', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </Card>

          {/* Section 7: Publication Status */}
          <Card
            title="7. Publication Status"
            subtitle="Choose whether to publish now or keep as draft"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Draft Option */}
                <div
                  onClick={() => handleChange('status', 'Draft')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.status === 'Draft'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">Save as Draft</span>
                    <Badge variant={formData.status === 'Draft' ? 'primary' : 'neutral'} size="sm">
                      Default
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Draft activities are not visible to students until published.
                  </p>
                </div>

                {/* Publish Option */}
                <div
                  onClick={() => handleChange('status', 'Published')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.status === 'Published'
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">Publish Immediately</span>
                    <Badge variant={formData.status === 'Published' ? 'success' : 'neutral'} size="sm">
                      Live
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Visible immediately in the student catalog for registrations.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 8: Bottom Form Actions */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/faculty/activities')}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={isSubmitting && formData.status === 'Draft'}
                onClick={() => handleSubmit('Draft')}
                className="w-full sm:w-auto text-slate-700 hover:bg-slate-50"
              >
                Save as Draft
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isSubmitting && formData.status === 'Published'}
                onClick={() => handleSubmit('Published')}
                className="w-full sm:w-auto shadow-md shadow-blue-500/20 font-semibold"
              >
                Publish Activity
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Activity Card Preview (1 col wide on desktop, sticky) */}
        <div className="hidden lg:block space-y-4 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Card Preview
            </span>
            <Badge variant="secondary" size="sm">
              Live Preview
            </Badge>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
            {/* Visual Header */}
            {formData.bannerPreview ? (
              <div className="h-32 relative overflow-hidden">
                <img
                  src={formData.bannerPreview}
                  alt="Live Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-3 justify-between">
                  <Badge variant="primary" size="sm">
                    {formData.type}
                  </Badge>
                  <Badge
                    variant={formData.status === 'Published' ? 'success' : 'neutral'}
                    size="sm"
                    dot
                  >
                    {formData.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="h-28 bg-gradient-to-br from-blue-600 to-indigo-700 p-3.5 flex flex-col justify-between relative overflow-hidden text-white">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <Badge variant="primary" size="sm" className="backdrop-blur-sm">
                    {formData.type}
                  </Badge>
                  <Badge
                    variant={formData.status === 'Published' ? 'success' : 'neutral'}
                    size="sm"
                    dot
                  >
                    {formData.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <IconActivity className="w-4 h-4" />
                  <span>{formData.department}</span>
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-1 text-sm">
                  {formData.title.trim() || 'Untitled Activity Title'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {formData.organizer || 'Organized by Admin'}
                </p>
              </div>

              {formData.description.trim() && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {formData.description}
                </p>
              )}

              {/* Schedule and venue */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium text-slate-800">
                    {formData.date || 'Date not selected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {formData.start_time && formData.end_time
                      ? `${formData.start_time} - ${formData.end_time}`
                      : 'Time not configured'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IconMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{formData.venue || 'Venue TBD'}</span>
                </div>
              </div>

              {/* Capacity Preview */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Capacity</span>
                  <span className="font-semibold text-slate-800">
                    0 / {formData.max_participants || 100}{' '}
                    <span className="text-emerald-600 font-medium">
                      ({formData.max_participants || 100} seats available)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 w-0" />
                </div>
              </div>

              {/* Eligibility Badges */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-medium">
                  {formData.department}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-medium">
                  {formData.academic_year}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal after Save/Publish */}
      {createdSuccessData && (
        <Modal
          isOpen={true}
          onClose={() => navigate('/faculty/activities')}
          title={
            createdSuccessData.status === 'Published'
              ? 'Activity Published Live! 🎉'
              : 'Activity Saved as Draft 📝'
          }
          size="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <IconCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h4 className="text-base font-bold text-emerald-900">
                {createdSuccessData.title}
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {createdSuccessData.status === 'Published'
                  ? 'This activity has been published to the student portal. Eligible students can now discover and register for it.'
                  : 'Activity draft successfully preserved. You can return and edit or publish it at any time from your activities list.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-500">Activity Type:</span>
                <span className="font-semibold text-slate-800">{createdSuccessData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">{createdSuccessData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Venue:</span>
                <span className="font-semibold text-slate-800">{createdSuccessData.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-semibold text-slate-800">
                  {createdSuccessData.max_participants} Participants
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge
                  variant={createdSuccessData.status === 'Published' ? 'success' : 'neutral'}
                  size="sm"
                  dot
                >
                  {createdSuccessData.status}
                </Badge>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreatedSuccessData(null)
                  setFormData({
                    title: '',
                    type: 'Workshop',
                    description: '',
                    bannerImage: null,
                    bannerPreview: null,
                    date: '',
                    start_time: '',
                    end_time: '',
                    registration_deadline: '',
                    venue: '',
                    address: '',
                    organizer: 'Dept. of Computer Science & Engineering',
                    contact_email: 'd.vance@campus.edu',
                    contact_phone: '+91 98765 43210',
                    department: 'All Departments',
                    course: '',
                    academic_year: 'All Years',
                    max_participants: '100',
                    registration_required: true,
                    status: 'Draft',
                  })
                }}
              >
                Create Another Activity
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/faculty/activities')}
              >
                Go to Activities List &rarr;
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </FacultyLayout>
  )
}
