import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FacultyLayout from '../layouts/FacultyLayout'
import PageHeader from '../components/common/PageHeader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import Textarea from '../components/common/Textarea'
import EmptyState from '../components/common/EmptyState'
import {
  IconArrowLeft,
  IconCheck,
  IconActivity,
} from '../components/icons/Icons'
import {
  getFacultyActivityById,
  updateFacultyActivity,
  activityTypes,
  activityStatuses,
} from '../data/facultyActivitiesData'

export default function FacultyEditActivity() {
  const { id } = useParams()
  const navigate = useNavigate()

  const activity = useMemo(() => getFacultyActivityById(id), [id])

  const [formData, setFormData] = useState(() => ({
    title: activity?.title || '',
    type: activity?.type || 'Workshop',
    status: activity?.status || 'Published',
    date: activity?.date || '',
    startTime: activity?.startTime || '10:00 AM',
    endTime: activity?.endTime || '1:00 PM',
    venue: activity?.venue || '',
    address: activity?.address || '',
    organizer: activity?.organizer || '',
    contactEmail: activity?.contactEmail || '',
    contactPhone: activity?.contactPhone || '',
    maxParticipants: activity?.maxParticipants || 100,
    registrationDeadline: activity?.registrationDeadline || '',
    description: activity?.description || '',
  }))

  const [isSaving, setIsSaving] = useState(false)
  const [successNotice, setSuccessNotice] = useState(null)

  if (!activity) {
    return (
      <FacultyLayout>
        <PageHeader
          title="Activity Not Found"
          breadcrumb={[
            { label: 'Campus Live', to: '/' },
            { label: 'Admin', to: '/faculty/dashboard' },
            { label: 'Activities', to: '/faculty/activities' },
            { label: 'Edit' },
          ]}
        />
        <EmptyState
          title="Activity not found"
          description="The activity you are trying to edit does not exist."
          icon={<IconActivity className="w-8 h-8 text-slate-400" />}
          actionText="Back to Activities"
          onAction={() => navigate('/faculty/activities')}
        />
      </FacultyLayout>
    )
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setIsSaving(true)

    updateFacultyActivity(activity.id, {
      ...formData,
      maxParticipants: Number(formData.maxParticipants) || 100,
      time: `${formData.startTime} - ${formData.endTime}`,
    })

    setSuccessNotice('Activity details updated successfully.')
    setTimeout(() => {
      setIsSaving(false)
      navigate(`/faculty/activities/${activity.id}`)
    }, 1000)
  }

  const typeOptions = activityTypes
    .filter((t) => t !== 'All Types')
    .map((t) => ({ value: t, label: t }))

  const statusOptions = activityStatuses
    .filter((s) => s !== 'All Statuses')
    .map((s) => ({ value: s, label: s }))

  return (
    <FacultyLayout>
      <PageHeader
        title={`Edit: ${activity.title}`}
        subtitle="Update activity schedule, venue, capacity limits, and descriptions"
        breadcrumb={[
          { label: 'Campus Live', to: '/' },
          { label: 'Admin', to: '/faculty/dashboard' },
          { label: 'Activities', to: '/faculty/activities' },
          { label: activity.title, to: `/faculty/activities/${activity.id}` },
          { label: 'Edit' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/faculty/activities/${activity.id}`)}
            icon={<IconArrowLeft className="w-3.5 h-3.5" />}
          >
            Cancel & Return
          </Button>
        }
      />

      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-200 shadow-2xs">
          <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successNotice}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <Card title="Basic Information" subtitle="Event title, category, and administrative status">
            <div className="space-y-4">
              <Input
                label="Activity Title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                placeholder="e.g. AI & Future Technology Workshop"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Activity Type"
                  value={formData.type}
                  onChange={(val) => handleChange('type', val)}
                  options={typeOptions}
                />

                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(val) => handleChange('status', val)}
                  options={statusOptions}
                />
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                required
                placeholder="Provide a detailed description of the event, learning objectives, and agenda..."
              />
            </div>
          </Card>

          {/* Schedule & Timing */}
          <Card title="Schedule & Timing" subtitle="Event date, times, and registration cutoff">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                placeholder="e.g. 24 Sep 2026"
              />
              <Input
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
                placeholder="e.g. 10:00 AM"
              />
              <Input
                label="End Time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
                placeholder="e.g. 1:00 PM"
              />
              <div className="sm:col-span-3">
                <Input
                  label="Registration Deadline"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  placeholder="e.g. 23 Sep 2026, 11:59 PM"
                />
              </div>
            </div>
          </Card>

          {/* Venue & Location */}
          <Card title="Venue & Location" subtitle="Room numbers, halls, and campus navigation details">
            <div className="space-y-4">
              <Input
                label="Venue Name"
                value={formData.venue}
                onChange={(e) => handleChange('venue', e.target.value)}
                required
                placeholder="e.g. Seminar Hall, Main Campus"
              />

              <Input
                label="Full Address / Directions"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g. Academic Block A, Floor 2, Main Campus"
              />
            </div>
          </Card>

          {/* Capacity & Organizer Details */}
          <Card title="Capacity & Organizer Contacts" subtitle="Seat limits and faculty coordination contacts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Maximum Participants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => handleChange('maxParticipants', e.target.value)}
                required
                min={1}
                placeholder="100"
              />

              <Input
                label="Organizer Entity"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                required
                placeholder="e.g. Dept. of Computer Science & Engineering"
              />

              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="coordinator@campus.edu"
              />

              <Input
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate(`/faculty/activities/${activity.id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              icon={<IconCheck className="w-4 h-4" />}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </FacultyLayout>
  )
}
