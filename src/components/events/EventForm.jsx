import React, { useState } from 'react'

const EVENT_CATEGORIES = [
  'General Verification',
  'Specialist Review',
  'Emergency Assessment',
  'Follow-up Session',
  'Training Session',
  'Other'
]

export default function EventForm({ onSubmit, isLoading, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || '',
    startTime: initialData?.startTime || '',
    endDate: initialData?.endDate || '',
    endTime: initialData?.endTime || '',
    category: initialData?.category || 'General Verification',
    linkedRecordHash: initialData?.linkedRecordHash || '',
    maxParticipants: initialData?.maxParticipants || ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

    if (endDateTime <= startDateTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    if (startDateTime < new Date()) {
      newErrors.startDate = 'Event cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

    onSubmit({
      title: formData.title,
      description: formData.description,
      startTime: Math.floor(startDateTime.getTime() / 1000),
      endTime: Math.floor(endDateTime.getTime() / 1000),
      category: formData.category,
      linkedRecordHash: formData.linkedRecordHash || null,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Cardiology Verification Session"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
          style={{ borderWidth: '0.5px' }}
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the purpose and details of this event..."
          rows="4"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors resize-none"
          style={{ borderWidth: '0.5px' }}
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
            style={{ borderWidth: '0.5px' }}
          />
          {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Time
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
            style={{ borderWidth: '0.5px' }}
          />
          {errors.startTime && <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
            style={{ borderWidth: '0.5px' }}
          />
          {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Time
          </label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
            style={{ borderWidth: '0.5px' }}
          />
          {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors bg-white"
          style={{ borderWidth: '0.5px' }}
        >
          {EVENT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Linked Record Hash (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Linked Medical Record (Optional)
        </label>
        <input
          type="text"
          name="linkedRecordHash"
          value={formData.linkedRecordHash}
          onChange={handleChange}
          placeholder="Enter IPFS CID or record hash"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors font-mono text-sm"
          style={{ borderWidth: '0.5px' }}
        />
        <p className="text-xs text-gray-500 mt-1">Link this event to a specific medical record for verification workflow</p>
      </div>

      {/* Max Participants (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Participants (Optional)
        </label>
        <input
          type="number"
          name="maxParticipants"
          value={formData.maxParticipants}
          onChange={handleChange}
          placeholder="Leave empty for unlimited"
          min="1"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
          style={{ borderWidth: '0.5px' }}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Creating Event...
          </>
        ) : (
          'Create Event'
        )}
      </button>
    </form>
  )
}
