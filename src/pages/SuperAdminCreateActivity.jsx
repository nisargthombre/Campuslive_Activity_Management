import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SuperAdminLayout from '../layouts/SuperAdminLayout'
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
  IconUsers,
  IconMail,
  IconPhone,
} from '../components/icons/Icons'
import {
  superAdminActivitiesSummary,
  initialSuperAdminActivities,
} from '../data/superAdminActivitiesData'

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
  'Computer Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
]

const academicYearOptions = [
  'All Years',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate',
]

const defaultFacultyOrganizers = [
  'Dr. Sarah Jenkins (Computer Engineering)',
  'Prof. David Vance (Information Technology)',
  'Dr. Rajesh Pillai (Mechanical Engineering)',
  'Prof. Meera Kulkarni (Civil Engineering)',
  'Cultural Affairs Committee',
  'Department of Physical Education',
  'Central Student Council',
  'Other / Custom Organizer',
]

export default function SuperAdminCreateActivity() {
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
    hosting_department: 'Computer Engineering',
    organizer: 'Dr. Sarah Jenkins (Computer Engineering)',
    custom_organizer: '',
    contact_email: 'admin@campuslive.edu',
    contact_phone: '+91 98765 43210',
    eligibility_department: 'All Departments',
    course_criteria: 'Open to All Enrolled Programs',
    academic_year: 'All Years',
    eligibility_notes: 'Open to all students in good academic standing',
    max_participants: '100',
    registration_required: true,
    status: 'Published', // 'Draft' | 'Published'
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

    // 1. Title
    if (!formData.title.trim()) {
      newErrors.title = 'Activity title is required.'
    }

    // 2. Description
    if (!formData.description.trim()) {
      newErrors.description = 'Activity description is required.'
    }

    // 3. Date
    if (!formData.date) {
      newErrors.date = 'Activity date is required.'
    }

    // 4. Start & End Time
    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required.'
    }
    if (!formData.end_time) {
      newErrors.end_time = 'End time is required.'
    }
    if (formData.start_time && formData.end_time) {
      if (formData.end_time <= formData.start_time) {
        newErrors.end_time = 'End time must be later than start time.'
      }
    }

    // 5. Registration Deadline
    if (!formData.registration_deadline) {
      newErrors.registration_deadline = 'Registration deadline is required.'
    } else if (formData.date && formData.registration_deadline > formData.date) {
      newErrors.registration_deadline = 'Registration deadline cannot be after activity date.'
    }

    // 6. Venue
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue location is required.'
    }

    // 7. Organizer
    const effectiveOrganizer =
      formData.organizer === 'Other / Custom Organizer'
        ? formData.custom_organizer.trim()
        : formData.organizer
    if (!effectiveOrganizer) {
      newErrors.organizer = 'Organizer name or designation is required.'
    }

    // 8. Contact Email
    const emailTrimmed = formData.contact_email.trim()
    if (!emailTrimmed) {
      newErrors.contact_email = 'Contact email is required.'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.contact_email = 'Please provide a valid email address.'
      }
    }

    // 9. Maximum Participants
    const maxNum = Number(formData.max_participants)
    if (!formData.max_participants || isNaN(maxNum) || maxNum <= 0) {
      newErrors.max_participants = 'Maximum participants must be a positive integer.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle Form Submit
  const handleSubmit = (targetStatus) => {
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      if (firstError) {
        const el = document.getElementById(firstError)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    const effectiveOrganizer =
      formData.organizer === 'Other / Custom Organizer'
        ? formData.custom_organizer.trim()
        : formData.organizer

    const newActivityRecord = {
      id: `ACT-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title.trim(),
      category: formData.type,
      description: formData.description.trim(),
      department: formData.hosting_department,
      date: formData.date,
      isUpcoming: new Date(formData.date) >= new Date(),
      startTime: formData.start_time,
      endTime: formData.end_time,
      venue: formData.venue.trim(),
      address: formData.address.trim(),
      organizer: effectiveOrganizer,
      eligibility: `${formData.eligibility_department} | ${formData.academic_year} | ${formData.course_criteria}`,
      registeredCount: 0,
      maxCapacity: Number(formData.max_participants) || 100,
      registrationDeadline: formData.registration_deadline,
      contactInfo: `${formData.contact_email} ${formData.contact_phone ? '| ' + formData.contact_phone : ''}`.trim(),
      status: targetStatus,
      bannerPreview: formData.bannerPreview,
    }

    // Append into mock database array for live persistence across Super Admin pages
    initialSuperAdminActivities.unshift(newActivityRecord)
    superAdminActivitiesSummary.totalActivities += 1
    if (newActivityRecord.isUpcoming) {
      superAdminActivitiesSummary.upcomingActivities += 1
    }
    if (targetStatus === 'Published') {
      superAdminActivitiesSummary.activeActivities += 1
    }

    setTimeout(() => {
      setIsSubmitting(false)
      setCreatedSuccessData(newActivityRecord)
    }, 450)
  }

  // Type badge styling helper
  const getActivityTypeBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'workshop':
        return 'info'
      case 'seminar':
        return 'primary'
      case 'competition':
        return 'warning'
      case 'hackathon':
        return 'secondary'
      case 'cultural':
        return 'danger'
      case 'sports':
        return 'success'
      case 'technical':
        return 'info'
      default:
        return 'neutral'
    }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ============================================================== */}
        {/* 1. PAGE HEADER                                                 */}
        {/* ============================================================== */}
        <PageHeader
          title="Create Campus Activity"
          subtitle="Create and publish system-wide campus activities across departments, assign organizers, and configure participation capacity."
          breadcrumb={[
            { label: 'Campus Live', to: '/' },
            { label: 'Super Admin', to: '/admin/dashboard' },
            { label: 'Activities', to: '/admin/activities' },
            { label: 'Create Activity' },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Badge variant="danger" dot>
                Super Admin Active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/activities')}
                icon={<IconArrowLeft className="w-4 h-4" />}
                className="text-slate-700 bg-white"
              >
                Back to Activities
              </Button>
            </div>
          }
        />

        {/* ============================================================== */}
        {/* 2. CORE BUSINESS RULE BANNER (REGISTERED != PARTICIPATED)      */}
        {/* ============================================================== */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <IconAlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                Institutional Policy: Activity Registration ≠ Participation
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Creating an activity allocates seat capacity and registration parameters. Participation and attendance validation are managed separately upon activity execution. Zero Activity Points are assigned.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white text-blue-800 rounded-full border border-blue-200 shrink-0">
            System Policy
          </span>
        </div>

        {/* ============================================================== */}
        {/* 3. MULTI-COLUMN FORM LAYOUT (FORM + LIVE PREVIEW)              */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT / CENTER: Multi-Section Form (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Activity Basic Info */}
            <Card
              title="1. Activity Information"
              subtitle="Title, activity category, description, and event banner"
            >
              <div className="space-y-4">
                <Input
                  label="Activity Title"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. AI & Next-Gen Cloud Architecture Workshop"
                  error={errors.title}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Activity Type"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    options={activityTypeOptions}
                    required
                  />

                  <Select
                    label="Hosting Department"
                    id="hosting_department"
                    name="hosting_department"
                    value={formData.hosting_department}
                    onChange={(e) => handleChange('hosting_department', e.target.value)}
                    options={departmentOptions}
                    required
                  />
                </div>

                <Textarea
                  label="Activity Description"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide comprehensive details about the activity objectives, hands-on syllabus, speaker credentials, and attendee expectations..."
                  rows={4}
                  error={errors.description}
                  required
                />

                {/* Banner / Thumbnail Upload */}
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
                        Click to upload event banner or thumbnail
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PNG, JPG, or WEBP up to 5MB (16:9 ratio recommended)
                      </p>
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

            {/* Section 2: Organizer & Contact Information */}
            <Card
              title="2. Organizer & Faculty Coordination"
              subtitle="Designated faculty coordinator and public contact channels"
            >
              <div className="space-y-4">
                <Select
                  label="Faculty / Administrative Organizer"
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={(e) => handleChange('organizer', e.target.value)}
                  options={defaultFacultyOrganizers}
                  error={errors.organizer}
                  required
                />

                {formData.organizer === 'Other / Custom Organizer' && (
                  <Input
                    label="Custom Organizer Name / Department"
                    id="custom_organizer"
                    name="custom_organizer"
                    value={formData.custom_organizer}
                    onChange={(e) => handleChange('custom_organizer', e.target.value)}
                    placeholder="e.g. Prof. Alan Walker (Special Projects)"
                    error={errors.organizer}
                    required
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Contact Email"
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="coordinator@campus.edu"
                    error={errors.contact_email}
                    leftIcon={<IconMail className="w-4 h-4 text-slate-400" />}
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
                    leftIcon={<IconPhone className="w-4 h-4 text-slate-400" />}
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Schedule & Deadlines */}
            <Card
              title="3. Schedule & Deadlines"
              subtitle="Activity calendar date, timings, and registration closing deadline"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Section 4: Venue & Location */}
            <Card
              title="4. Venue & Location"
              subtitle="Physical or virtual campus hall and building landmarks"
            >
              <div className="space-y-4">
                <Input
                  label="Venue / Hall Name"
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={(e) => handleChange('venue', e.target.value)}
                  placeholder="e.g. Main Auditorium, Innovation & Tech Wing"
                  error={errors.venue}
                  required
                />

                <Input
                  label="Detailed Address / Landmark (Optional)"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. Floor 2, Block C, Central Campus Quad"
                />
              </div>
            </Card>

            {/* Section 5: Eligibility Criteria */}
            <Card
              title="5. Eligibility & Academic Criteria"
              subtitle="Specify department, academic year, and cohort participation scope"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Target Department Scope"
                    id="eligibility_department"
                    name="eligibility_department"
                    value={formData.eligibility_department}
                    onChange={(e) => handleChange('eligibility_department', e.target.value)}
                    options={departmentOptions}
                  />

                  <Select
                    label="Academic Year Eligibility"
                    id="academic_year"
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={(e) => handleChange('academic_year', e.target.value)}
                    options={academicYearOptions}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Course / Degree Stream Criteria"
                    id="course_criteria"
                    name="course_criteria"
                    value={formData.course_criteria}
                    onChange={(e) => handleChange('course_criteria', e.target.value)}
                    placeholder="e.g. B.Tech / BCA / MCA (or Open to All)"
                  />

                  <Input
                    label="General Eligibility Note"
                    id="eligibility_notes"
                    name="eligibility_notes"
                    value={formData.eligibility_notes}
                    onChange={(e) => handleChange('eligibility_notes', e.target.value)}
                    placeholder="e.g. Open to all registered students with laptops"
                  />
                </div>
              </div>
            </Card>

            {/* Section 6: Capacity & Registration Settings */}
            <Card
              title="6. Capacity & Registration Settings"
              subtitle="Participant limits and seat reservation rules"
            >
              <div className="space-y-4">
                <Input
                  label="Maximum Participants (Capacity Limit)"
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

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    <span className="font-semibold text-slate-800">Dynamic Capacity Formula:</span>{' '}
                    Available Seats = Maximum Participants - valid active registrations. Cancelled registrations do not occupy active capacity.
                  </p>
                </div>

                {/* Registration Required Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Registration Required
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Students must explicitly register through Campus Live before attending
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

            {/* Section 7: Publication Status Selection */}
            <Card
              title="7. Publication Status"
              subtitle="Choose publication visibility for the student catalog"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Activity will immediately be visible to eligible students in the discovery catalog.
                  </p>
                </div>

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
                      Internal
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Draft activities are visible only to Super Admin and Faculty coordinators.
                  </p>
                </div>
              </div>
            </Card>

            {/* Section 8: Form Actions Toolbar */}
            <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/admin/activities')}
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

          {/* RIGHT COLUMN: Live Card Preview (Desktop Sticky) */}
          <div className="hidden lg:block space-y-4 sticky top-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Card Preview
              </span>
              <Badge variant="secondary" size="sm">
                Super Admin Preview
              </Badge>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
              {/* Visual Banner Header */}
              {formData.bannerPreview ? (
                <div className="h-32 relative overflow-hidden">
                  <img
                    src={formData.bannerPreview}
                    alt="Live Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-3 justify-between">
                    <Badge variant={getActivityTypeBadgeVariant(formData.type)} size="sm">
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
                <div className="h-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-3.5 flex flex-col justify-between relative overflow-hidden text-white">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10 blur-xs pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <Badge variant="primary" size="sm" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
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
                    <span>{formData.hosting_department}</span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 text-sm">
                    {formData.title.trim() || 'Untitled Campus Activity'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {formData.organizer === 'Other / Custom Organizer'
                      ? formData.custom_organizer || 'Custom Faculty Coordinator'
                      : formData.organizer}
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
                        : 'Timings not configured'}
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
                        ({formData.max_participants || 100} available)
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
                    {formData.eligibility_department}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-medium">
                    {formData.academic_year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. SUCCESS CONFIRMATION MODAL                                  */}
        {/* ============================================================== */}
        {createdSuccessData && (
          <Modal
            isOpen={true}
            onClose={() => navigate('/admin/activities')}
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
                    ? 'Activity has been published system-wide. Eligible students across targeted departments can now register.'
                    : 'Activity has been preserved as a Draft. You can edit and publish it anytime from the Activities management dashboard.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Activity ID:</span>
                  <span className="font-mono font-medium text-slate-800">{createdSuccessData.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category & Department:</span>
                  <span className="font-semibold text-slate-800">
                    {createdSuccessData.category} • {createdSuccessData.department}
                  </span>
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
                  <span className="text-slate-500">Max Capacity:</span>
                  <span className="font-semibold text-slate-800">
                    {createdSuccessData.maxCapacity} Participants
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
                      hosting_department: 'Computer Engineering',
                      organizer: 'Dr. Sarah Jenkins (Computer Engineering)',
                      custom_organizer: '',
                      contact_email: 'admin@campuslive.edu',
                      contact_phone: '+91 98765 43210',
                      eligibility_department: 'All Departments',
                      course_criteria: 'Open to All Enrolled Programs',
                      academic_year: 'All Years',
                      eligibility_notes: 'Open to all students in good academic standing',
                      max_participants: '100',
                      registration_required: true,
                      status: 'Published',
                    })
                  }}
                >
                  Create Another Activity
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/admin/activities')}
                >
                  Go to Activities List &rarr;
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </SuperAdminLayout>
  )
}
