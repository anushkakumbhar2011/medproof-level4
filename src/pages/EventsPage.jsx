import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEvents } from '../context/EventsContext'
import EventList from '../components/events/EventList'
import EmptyState from '../components/EmptyState'

export default function EventsPage() {
  const navigate = useNavigate()
  const { walletAddress, role } = useAuth()
  const { events, isLoading, error, fetchEvents, joinEventHandler, clearError } = useEvents()

  useEffect(() => {
    console.log('[EventsPage] Mounting')
    fetchEvents()
  }, [])

  const handleJoinEvent = async (eventId) => {
    try {
      console.log('[EventsPage] Joining event:', eventId)
      await joinEventHandler(eventId, walletAddress)
      // Refresh events
      await fetchEvents()
    } catch (error) {
      console.error('[EventsPage] Join event error:', error)
    }
  }

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Events</h1>
          <p className="text-gray-600 mt-1">Join healthcare verification sessions</p>
        </div>
        {(role === 'doctor' || role === 'admin') && (
          <button
            onClick={handleCreateEvent}
            className="px-6 py-2.5 bg-primary text-white rounded-button font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create Event
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card text-red-700 flex items-start justify-between">
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Events List */}
      {events.length === 0 && !isLoading ? (
        <EmptyState
          icon="📅"
          title="No events yet"
          description="Check back soon for upcoming verification sessions"
          action={
            (role === 'doctor' || role === 'admin') && {
              label: 'Create First Event',
              onClick: handleCreateEvent
            }
          }
        />
      ) : (
        <EventList
          events={events}
          onJoin={handleJoinEvent}
          userAddress={walletAddress}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
