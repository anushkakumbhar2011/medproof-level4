import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import EmptyState from '../components/EmptyState'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { walletAddress, role } = useAuth()
  const { fetchEventById, joinEventHandler, cancelEventHandler, isLoading, error } = useEvents()
  const [event, setEvent] = useState(null)
  const [isJoining, setIsJoining] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    console.log('[EventDetailPage] Mounting with event ID:', id)
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const eventData = await fetchEventById(id)
      setEvent(eventData)
    } catch (error) {
      console.error('[EventDetailPage] Load event error:', error)
    }
  }

  const handleJoinEvent = async () => {
    try {
      setIsJoining(true)
      console.log('[EventDetailPage] Joining event:', id)
      const updatedEvent = await joinEventHandler(id, walletAddress)
      setEvent(updatedEvent)
    } catch (error) {
      console.error('[EventDetailPage] Join event error:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCancelEvent = async () => {
    if (!window.confirm('Are you sure you want to cancel this event?')) {
      return
    }

    try {
      setIsCancelling(true)
      console.log('[EventDetailPage] Cancelling event:', id)
      const updatedEvent = await cancelEventHandler(id, walletAddress)
      setEvent(updatedEvent)
    } catch (error) {
      console.error('[EventDetailPage] Cancel event error:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <EmptyState
        icon="❌"
        title="Event not found"
        description="The event you're looking for doesn't exist or has been deleted"
        action={{
          label: 'Back to Events',
          onClick: () => navigate('/events')
        }}
      />
    )
  }

  const startDate = new Date(event.startTime * 1000)
  const endDate = new Date(event.endTime * 1000)
  const now = Date.now() / 1000
  const isUpcoming = event.startTime > now
  const isOngoing = event.startTime <= now && event.endTime > now
  const isParticipant = event.participants.includes(walletAddress)
  const isOrganizer = event.organizerAddress === walletAddress

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'ongoing':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'completed':
        return 'bg-gray-50 border-gray-200 text-gray-700'
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <button
          onClick={() => navigate('/events')}
          className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 mb-4"
        >
          ← Back to Events
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header */}
          <div className="bg-white border border-gray-200 rounded-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-lg mb-6">{event.description}</p>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Start Date & Time</p>
                <p className="text-lg text-gray-900">
                  {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">End Date & Time</p>
                <p className="text-lg text-gray-900">
                  {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Category & Organizer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Category</p>
                <p className="text-gray-900">{event.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Organizer</p>
                <p className="text-gray-900 font-mono text-sm">
                  {event.organizerAddress.slice(0, 8)}...{event.organizerAddress.slice(-8)}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Record */}
          {event.linkedRecordHash && (
            <div className="bg-white border border-gray-200 rounded-card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Linked Medical Record</h3>
              <p className="text-gray-600 font-mono text-sm break-all">{event.linkedRecordHash}</p>
            </div>
          )}

          {/* Participants */}
          <div className="bg-white border border-gray-200 rounded-card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Participants ({event.participants.length})</h3>
            <div className="space-y-2">
              {event.participants.map((participant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-input">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {participant.slice(0, 1)}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-gray-900">
                      {participant.slice(0, 8)}...{participant.slice(-8)}
                    </span>
                  </div>
                  {participant === event.organizerAddress && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Organizer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white border border-gray-200 rounded-card p-6 space-y-3">
            {!isParticipant && event.status === 'scheduled' && (
              <button
                onClick={handleJoinEvent}
                disabled={isJoining}
                className="w-full px-4 py-3 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isJoining ? 'Joining...' : 'Join Event'}
              </button>
            )}

            {isParticipant && (
              <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-button text-green-700 font-medium text-center">
                ✓ You've joined this event
              </div>
            )}

            {isOrganizer && event.status === 'scheduled' && (
              <button
                onClick={handleCancelEvent}
                disabled={isCancelling}
                className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-button font-medium hover:bg-red-100 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Event'}
              </button>
            )}

            {event.status === 'cancelled' && (
              <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-button text-red-700 font-medium text-center">
                ✕ This event has been cancelled
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="bg-white border border-gray-200 rounded-card p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Status</p>
              <p className="text-gray-900 font-medium">
                {isOngoing ? '🟢 Ongoing' : isUpcoming ? '🔵 Upcoming' : '⚪ Past'}
              </p>
            </div>

            {event.maxParticipants && (
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Capacity</p>
                <p className="text-gray-900">
                  {event.participants.length} / {event.maxParticipants}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Created</p>
              <p className="text-gray-900 text-sm">
                {new Date(event.createdAt * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
