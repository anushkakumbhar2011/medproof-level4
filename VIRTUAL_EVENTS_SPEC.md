# Virtual Events Module - Specification & Implementation Plan

## 📋 Overview

The Virtual Events Module enables healthcare professionals and patients to participate in scheduled verification sessions on the MedProof platform. Events can be linked to medical record verification workflows and tracked on-chain.

---

## 🏗️ Architecture

### Frontend Layer
- Event listing and discovery
- Event creation (admin/doctor only)
- Event details and participation
- Real-time participant tracking

### Smart Contract Layer
- Event metadata storage
- Participation records
- Access control (role-based)

### Service Layer
- Event CRUD operations
- Blockchain integration
- Wallet authentication

---

## 📁 File Structure

```
src/
├── components/
│   └── events/
│       ├── EventCard.jsx
│       ├── EventList.jsx
│       ├── EventForm.jsx
│       ├── ParticipantList.jsx
│       └── EventStatus.jsx
├── pages/
│   ├── EventsPage.jsx
│   ├── EventDetailPage.jsx
│   └── CreateEventPage.jsx
├── services/
│   └── eventService.js
├── context/
│   └── EventsContext.jsx
└── data/
    └── eventCategories.js

contracts/
├── events/
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs
└── deploy_events.sh
```

---

## 🔄 Data Models

### Event
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  startTime: number (timestamp),
  endTime: number (timestamp),
  organizerAddress: string (Stellar address),
  organizerRole: 'doctor' | 'admin',
  category: string,
  linkedRecordHash: string (optional IPFS CID),
  maxParticipants: number (optional),
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled',
  participants: string[] (wallet addresses),
  createdAt: number (timestamp),
  updatedAt: number (timestamp),
  onChainHash: string (optional Soroban transaction hash)
}
```

### Participant
```javascript
{
  walletAddress: string,
  joinedAt: number (timestamp),
  role: 'patient' | 'doctor' | 'admin',
  status: 'joined' | 'left' | 'completed'
}
```

---

## 🔐 Access Control

| Action | Patient | Doctor | Admin |
|--------|---------|--------|-------|
| View Events | ✅ | ✅ | ✅ |
| Join Event | ✅ | ✅ | ✅ |
| Create Event | ❌ | ✅ | ✅ |
| Edit Event | ❌ | Own only | ✅ |
| Delete Event | ❌ | Own only | ✅ |
| Cancel Event | ❌ | Own only | ✅ |

---

## 🔗 Integration Points

### With AuthContext
- Use existing wallet connection
- Leverage role information
- Maintain session state

### With RecordsContext
- Link events to medical records
- Track verification workflows
- Update record status on event completion

### With Stellar Blockchain
- Store event metadata on-chain
- Record participation
- Generate immutable audit trail

---

## 📊 Smart Contract Functions

### Records Contract (Events Extension)

```rust
// Create event
pub fn create_event(
    env: Env,
    organizer: Address,
    title: String,
    description: String,
    start_time: u64,
    end_time: u64,
    category: String,
    linked_record_hash: Option<String>,
) -> u64

// Join event
pub fn join_event(
    env: Env,
    participant: Address,
    event_id: u64,
) -> bool

// Get event
pub fn get_event(env: Env, event_id: u64) -> Event

// Get event participants
pub fn get_event_participants(env: Env, event_id: u64) -> Vec<Address>

// Cancel event
pub fn cancel_event(env: Env, event_id: u64) -> bool
```

---

## 🎨 UI Components

### EventCard
- Event title, date, time
- Organizer info
- Participant count
- Join button (if not joined)
- Status badge

### EventList
- Filterable list of events
- Search functionality
- Sort by date/status
- Pagination

### EventForm
- Title, description inputs
- Date/time pickers
- Category selector
- Optional record link
- Submit button

### ParticipantList
- List of joined participants
- Participant roles
- Join time
- Status

### EventStatus
- Event state indicator
- Time remaining
- Participant count
- Action buttons

---

## 🔄 User Flows

### Create Event (Doctor/Admin)
1. Navigate to Create Event page
2. Fill event details
3. Optionally link medical record
4. Submit form
5. Transaction signed via Freighter
6. Event stored on-chain
7. Redirect to event details

### Join Event (Patient/Doctor)
1. View events list
2. Click event card
3. View event details
4. Click "Join Event"
5. Transaction signed via Freighter
6. Participant added on-chain
7. Redirect to event details

### View Event Details
1. Click event from list
2. Display event info
3. Show participant list
4. Show join/leave buttons
5. Display linked record (if any)

---

## 🧪 Testing Scenarios

1. Create event as doctor
2. Join event as patient
3. View event details
4. List all events
5. Filter events by status
6. Cancel event as organizer
7. Verify on-chain storage
8. Check participant tracking

---

## 📈 Future Enhancements

- Real-time notifications
- Event reminders
- Video integration
- Event recordings
- Attendance certificates
- Event analytics
- Recurring events
- Event invitations

---

## ✅ Implementation Checklist

- [ ] Frontend components created
- [ ] Pages implemented
- [ ] Event service layer
- [ ] EventsContext provider
- [ ] Smart contract (events extension)
- [ ] Integration with AuthContext
- [ ] Integration with RecordsContext
- [ ] Wallet-based access control
- [ ] On-chain storage
- [ ] Error handling
- [ ] UI styling (Tailwind)
- [ ] Testing

---

## 🚀 Deployment Steps

1. Deploy events smart contract
2. Update Records contract with event functions
3. Add EventsContext to app
4. Create event pages and components
5. Integrate with existing auth system
6. Test end-to-end flows
7. Deploy to testnet
8. Verify on-chain storage

