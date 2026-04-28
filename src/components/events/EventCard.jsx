import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function EventCard({ event, onJoin, isParticipant }) {
  const navigate = useNavigate()
  const startDate = new Date(event.startTime * 1000)
  const now = Date.now() / 1000

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

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-card p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{event.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
          {getStatusLabel(event.status)}
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span>{startDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Category & Participants */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-input text-xs font-medium">
            {event.category}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{event.participants?.length || 0} participants</span>
        </div>
      </div>

      {/* Organizer */}
      <div className="mb-4 pb-4 border-t border-gray-200 pt-3 text-xs text-gray-600">
        <span className="font-medium">Organizer:</span> {event.organizerAddress.slice(0, 8)}...{event.organizerAddress.slice(-8)}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-button text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {!isParticipant && event.status === 'scheduled' && (
          <button
            onClick={() => onJoin(event.id)}
            className="flex-1 px-3 py-2 bg-primary text-white rounded-button text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Join Event
          </button>
        )}
        {isParticipant && (
          <div className="flex-1 px-3 py-2 bg-green-50 border border-green-200 rounded-button text-sm font-medium text-green-700 flex items-center justify-center">
            ✓ Joined
          </div>
        )}
      </div>
    </div>
  )
}
