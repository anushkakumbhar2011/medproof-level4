import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import EventForm from '../components/events/EventForm'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const { walletAddress, role } = useAuth()
  const { createNewEvent, isLoading, error } = useEvents()
  const [formError, setFormError] = useState(null)

  // Check authorization
  if (role !== 'doctor' && role !== 'admin') {
    return (
      <div className="text-center py-12">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-400">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Access Denied</h3>
        <p className="text-gray-600 mb-6">Only doctors and admins can create events</p>
        <button
          onClick={() => navigate('/events')}
          className="px-6 py-2 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Events
        </button>
      </div>
    )
  }

  const handleSubmit = async (formData) => {
    try {
      setFormError(null)
      console.log('[CreateEventPage] Submitting form:', formData)

      const eventData = {
        ...formData,
        organizerRole: role
      }

      const newEvent = await createNewEvent(eventData, walletAddress)
      console.log('[CreateEventPage] Event created:', newEvent.id)

      // Navigate to event details
      navigate(`/events/${newEvent.id}`)
    } catch (error) {
      console.error('[CreateEventPage] Submit error:', error)
      setFormError(error.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/events')}
          className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 mb-4"
        >
          ← Back to Events
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-1">Schedule a healthcare verification session</p>
      </div>

      {/* Error Message */}
      {(formError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{formError || error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-card p-6">
        <EventForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-card p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">💡 Tip:</span> Events are stored on the blockchain and can be linked to medical records for verification workflows.
        </p>
      </div>
    </div>
  )
}
