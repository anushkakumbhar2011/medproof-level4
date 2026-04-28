import React, { createContext, useContext, useState } from 'react'
import { createEvent, joinEvent, getEvents, getEventById, cancelEvent } from '../services/eventService'

const EventsContext = createContext()

export function EventsProvider({ children }) {
  console.log('[Events] Provider rendering')
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Fetch all events from blockchain
   */
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[Events] Fetching all events')

      const blockchainEvents = await getEvents()

      if (blockchainEvents && Array.isArray(blockchainEvents)) {
        console.log('[Events] Fetched events:', blockchainEvents.length)
        setEvents(blockchainEvents)
      } else {
        console.log('[Events] No events found')
        setEvents([])
      }

      setIsLoading(false)
    } catch (error) {
      console.error('[Events] Fetch error:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  /**
   * Fetch a single event by ID
   */
  const fetchEventById = async (eventId) => {
    try {
      console.log('[Events] Fetching event:', eventId)
      const event = await getEventById(eventId)
      return event
    } catch (error) {
      console.error('[Events] Fetch event error:', error)
      throw error
    }
  }

  /**
   * Create a new event
   */
  const createNewEvent = async (eventData, walletAddress) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[Events] Creating event:', eventData.title)

      const newEvent = await createEvent(eventData, walletAddress)
      console.log('[Events] Event created:', newEvent.id)

      // Add to local state
      setEvents(prevEvents => [newEvent, ...prevEvents])

      setIsLoading(false)
      return newEvent
    } catch (error) {
      console.error('[Events] Create event error:', error)
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }

  /**
   * Join an event
   */
  const joinEventHandler = async (eventId, walletAddress) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[Events] Joining event:', eventId)

      const updatedEvent = await joinEvent(eventId, walletAddress)
      console.log('[Events] Joined event:', eventId)

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? updatedEvent : event
        )
      )

      setIsLoading(false)
      return updatedEvent
    } catch (error) {
      console.error('[Events] Join event error:', error)
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }

  /**
   * Cancel an event
   */
  const cancelEventHandler = async (eventId, walletAddress) => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[Events] Cancelling event:', eventId)

      const updatedEvent = await cancelEvent(eventId, walletAddress)
      console.log('[Events] Event cancelled:', eventId)

      // Update local state
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === eventId ? updatedEvent : event
        )
      )

      setIsLoading(false)
      return updatedEvent
    } catch (error) {
      console.error('[Events] Cancel event error:', error)
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }

  /**
   * Get event by ID from local state
   */
  const getEventByIdLocal = (id) => {
    try {
      return events.find(event => event?.id === id) || null
    } catch (error) {
      console.error('[Events] Get event by ID error:', error)
      return null
    }
  }

  /**
   * Set selected event
   */
  const setSelectedEvent = (id) => {
    try {
      setSelectedEventId(id)
    } catch (error) {
      console.error('[Events] Set selected event error:', error)
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null)
  }

  const value = {
    events,
    selectedEventId,
    isLoading,
    error,
    fetchEvents,
    fetchEventById,
    createNewEvent,
    joinEventHandler,
    cancelEventHandler,
    getEventByIdLocal,
    setSelectedEvent,
    clearError
  }

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider')
  }
  return context
}
