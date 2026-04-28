import { v4 as uuidv4 } from 'uuid'
import { executeTransaction, getContractId } from './stellarContract'
import { getConnectedPublicKey } from './stellarWallet'

/**
 * In-memory event storage (simulating blockchain storage)
 * In production, this would be stored on Stellar Soroban
 */
const eventStorage = new Map()

/**
 * Create a new event
 */
export async function createEvent(eventData, walletAddress) {
  try {
    console.log('[EventService] Creating event:', eventData.title)

    const eventId = uuidv4()
    const now = Math.floor(Date.now() / 1000)

    const event = {
      id: eventId,
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      organizerAddress: walletAddress,
      organizerRole: eventData.organizerRole || 'doctor',
      category: eventData.category,
      linkedRecordHash: eventData.linkedRecordHash || null,
      maxParticipants: eventData.maxParticipants || null,
      status: 'scheduled',
      participants: [walletAddress], // Organizer is automatically a participant
      createdAt: now,
      updatedAt: now,
      onChainHash: null
    }

    // Store in memory
    eventStorage.set(eventId, event)
    console.log('[EventService] Event created:', eventId)

    // TODO: In production, store on Stellar Soroban
    // const contractId = await getContractId()
    // const transaction = {
    //   method: 'create_event',
    //   params: [
    //     walletAddress,
    //     eventData.title,
    //     eventData.description,
    //     eventData.startTime,
    //     eventData.endTime,
    //     eventData.category,
    //     eventData.linkedRecordHash
    //   ]
    // }
    // const result = await executeTransaction(transaction, walletAddress)
    // event.onChainHash = result.hash

    return event
  } catch (error) {
    console.error('[EventService] Create event error:', error)
    throw new Error(`Failed to create event: ${error.message}`)
  }
}

/**
 * Join an event
 */
export async function joinEvent(eventId, walletAddress) {
  try {
    console.log('[EventService] Joining event:', eventId)

    const event = eventStorage.get(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Check if already a participant
    if (event.participants.includes(walletAddress)) {
      console.log('[EventService] Already a participant')
      return event
    }

    // Check max participants
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      throw new Error('Event is full')
    }

    // Add participant
    event.participants.push(walletAddress)
    event.updatedAt = Math.floor(Date.now() / 1000)

    console.log('[EventService] Participant added:', walletAddress)

    // TODO: In production, update on Stellar Soroban
    // const transaction = {
    //   method: 'join_event',
    //   params: [walletAddress, eventId]
    // }
    // const result = await executeTransaction(transaction, walletAddress)

    return event
  } catch (error) {
    console.error('[EventService] Join event error:', error)
    throw new Error(`Failed to join event: ${error.message}`)
  }
}

/**
 * Get all events
 */
export async function getEvents() {
  try {
    console.log('[EventService] Fetching all events')

    // TODO: In production, fetch from Stellar Soroban
    // const contractId = await getContractId()
    // const result = await executeTransaction({
    //   method: 'get_all_events',
    //   params: []
    // }, null)
    // return result.events

    const events = Array.from(eventStorage.values())
    console.log('[EventService] Events fetched:', events.length)
    return events
  } catch (error) {
    console.error('[EventService] Fetch events error:', error)
    throw new Error(`Failed to fetch events: ${error.message}`)
  }
}

/**
 * Get event by ID
 */
export async function getEventById(eventId) {
  try {
    console.log('[EventService] Fetching event:', eventId)

    // TODO: In production, fetch from Stellar Soroban
    // const contractId = await getContractId()
    // const result = await executeTransaction({
    //   method: 'get_event',
    //   params: [eventId]
    // }, null)
    // return result.event

    const event = eventStorage.get(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    console.log('[EventService] Event fetched:', eventId)
    return event
  } catch (error) {
    console.error('[EventService] Fetch event error:', error)
    throw new Error(`Failed to fetch event: ${error.message}`)
  }
}

/**
 * Cancel an event
 */
export async function cancelEvent(eventId, walletAddress) {
  try {
    console.log('[EventService] Cancelling event:', eventId)

    const event = eventStorage.get(eventId)
    if (!event) {
      throw new Error('Event not found')
    }

    // Check authorization
    if (event.organizerAddress !== walletAddress) {
      throw new Error('Only organizer can cancel event')
    }

    event.status = 'cancelled'
    event.updatedAt = Math.floor(Date.now() / 1000)

    console.log('[EventService] Event cancelled:', eventId)

    // TODO: In production, update on Stellar Soroban
    // const transaction = {
    //   method: 'cancel_event',
    //   params: [eventId]
    // }
    // const result = await executeTransaction(transaction, walletAddress)

    return event
  } catch (error) {
    console.error('[EventService] Cancel event error:', error)
    throw new Error(`Failed to cancel event: ${error.message}`)
  }
}

/**
 * Get events by organizer
 */
export async function getEventsByOrganizer(organizerAddress) {
  try {
    console.log('[EventService] Fetching events by organizer:', organizerAddress)

    const events = Array.from(eventStorage.values()).filter(
      event => event.organizerAddress === organizerAddress
    )

    console.log('[EventService] Events fetched:', events.length)
    return events
  } catch (error) {
    console.error('[EventService] Fetch events by organizer error:', error)
    throw new Error(`Failed to fetch events: ${error.message}`)
  }
}

/**
 * Get events by participant
 */
export async function getEventsByParticipant(participantAddress) {
  try {
    console.log('[EventService] Fetching events by participant:', participantAddress)

    const events = Array.from(eventStorage.values()).filter(
      event => event.participants.includes(participantAddress)
    )

    console.log('[EventService] Events fetched:', events.length)
    return events
  } catch (error) {
    console.error('[EventService] Fetch events by participant error:', error)
    throw new Error(`Failed to fetch events: ${error.message}`)
  }
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents() {
  try {
    console.log('[EventService] Fetching upcoming events')

    const now = Math.floor(Date.now() / 1000)
    const events = Array.from(eventStorage.values()).filter(
      event => event.startTime > now && event.status === 'scheduled'
    )

    console.log('[EventService] Upcoming events fetched:', events.length)
    return events
  } catch (error) {
    console.error('[EventService] Fetch upcoming events error:', error)
    throw new Error(`Failed to fetch upcoming events: ${error.message}`)
  }
}

/**
 * Initialize with mock events (for testing)
 */
export function initializeMockEvents() {
  const now = Math.floor(Date.now() / 1000)
  const mockEvents = [
    {
      id: uuidv4(),
      title: 'Cardiology Verification Session',
      description: 'General cardiology record verification and discussion',
      startTime: now + 86400, // Tomorrow
      endTime: now + 90000,
      organizerAddress: 'GBRPYHIL2CI3WHZDTOOQFC6EB4NCCCOB5QTJLSUW26THUDPGSRDEUAL7',
      organizerRole: 'doctor',
      category: 'General Verification',
      linkedRecordHash: null,
      maxParticipants: 10,
      status: 'scheduled',
      participants: ['GBRPYHIL2CI3WHZDTOOQFC6EB4NCCCOB5QTJLSUW26THUDPGSRDEUAL7'],
      createdAt: now,
      updatedAt: now,
      onChainHash: null
    },
    {
      id: uuidv4(),
      title: 'Emergency Assessment Review',
      description: 'Review of emergency assessment procedures and protocols',
      startTime: now + 172800, // In 2 days
      endTime: now + 176400,
      organizerAddress: 'GBRPYHIL2CI3WHZDTOOQFC6EB4NCCCOB5QTJLSUW26THUDPGSRDEUAL7',
      organizerRole: 'doctor',
      category: 'Emergency Assessment',
      linkedRecordHash: null,
      maxParticipants: 20,
      status: 'scheduled',
      participants: ['GBRPYHIL2CI3WHZDTOOQFC6EB4NCCCOB5QTJLSUW26THUDPGSRDEUAL7'],
      createdAt: now,
      updatedAt: now,
      onChainHash: null
    }
  ]

  mockEvents.forEach(event => {
    eventStorage.set(event.id, event)
  })

  console.log('[EventService] Mock events initialized:', mockEvents.length)
}
