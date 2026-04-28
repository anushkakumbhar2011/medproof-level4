import React, { useState } from 'react'
import EventCard from './EventCard'

export default function EventList({ events, onJoin, userAddress, isLoading }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return a.startTime - b.startTime
      case 'participants':
        return (b.participants?.length || 0) - (a.participants?.length || 0)
      case 'recent':
        return b.createdAt - a.createdAt
      default:
        return 0
    }
  })

  const isParticipant = (event) => {
    return event.participants?.includes(userAddress)
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

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-input focus:outline-none focus:border-primary transition-colors"
            style={{ borderWidth: '0.5px' }}
          />
        </div>

        {/* Filters & Sort */}
        <div className="flex gap-3 flex-wrap">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-input text-sm focus:outline-none focus:border-primary bg-white"
            style={{ borderWidth: '0.5px' }}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-input text-sm focus:outline-none focus:border-primary bg-white"
            style={{ borderWidth: '0.5px' }}
          >
            <option value="date">Sort by Date</option>
            <option value="participants">Sort by Participants</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onJoin={onJoin}
              isParticipant={isParticipant(event)}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 text-center">
        Showing {sortedEvents.length} of {events.length} events
      </div>
    </div>
  )
}
