# Virtual Events Module - Quick Start Guide

## 🚀 Getting Started

### Access the Events Module

1. **Connect your wallet** - Use Freighter to connect to MedProof
2. **Navigate to Events** - Click "Virtual Events" in the dashboard or go to `/events`
3. **View events** - See all upcoming verification sessions

---

## 👨‍⚕️ For Doctors & Admins

### Create an Event

1. Click **"Create Event"** button on the Events page
2. Fill in the event details:
   - **Title**: Event name (e.g., "Cardiology Verification Session")
   - **Description**: Event purpose and details
   - **Start Date & Time**: When the event begins
   - **End Date & Time**: When the event ends
   - **Category**: Select from predefined categories
   - **Linked Record** (optional): Link to a medical record
   - **Max Participants** (optional): Limit attendance
3. Click **"Create Event"**
4. Event is created and stored on the blockchain
5. You're automatically added as a participant

### Manage Your Events

- **View Details**: Click any event to see full information
- **Cancel Event**: Click "Cancel Event" on event details (scheduled events only)
- **See Participants**: View all participants on the event details page

---

## 👤 For Patients

### Join an Event

1. Navigate to **Events** page
2. Browse available events or search by title
3. Click **"View Details"** on an event
4. Click **"Join Event"** button
5. You're added as a participant
6. Status changes to "✓ Joined"

### View Event Details

- **Date & Time**: When the event is scheduled
- **Organizer**: Who created the event
- **Category**: Type of verification session
- **Participants**: Who else is attending
- **Linked Record**: Medical record associated with the event

---

## 🔍 Search & Filter

### Search Events
- Use the search box to find events by title or description
- Results update in real-time

### Filter by Status
- **All Status**: Show all events
- **Scheduled**: Upcoming events
- **Ongoing**: Events currently happening
- **Completed**: Past events
- **Cancelled**: Cancelled events

### Sort Events
- **Sort by Date**: Earliest first
- **Sort by Participants**: Most participants first
- **Sort by Recent**: Newest events first

---

## 📊 Event Information

### Event Status Badges
- 🔵 **Scheduled** - Event is upcoming
- 🟢 **Ongoing** - Event is currently happening
- ⚪ **Completed** - Event has finished
- 🔴 **Cancelled** - Event was cancelled

### Event Categories
- General Verification
- Specialist Review
- Emergency Assessment
- Follow-up Session
- Training Session
- Other

---

## 🔐 Access Control

### Who Can Do What?

| Action | Patient | Doctor | Admin |
|--------|---------|--------|-------|
| View Events | ✅ | ✅ | ✅ |
| Join Event | ✅ | ✅ | ✅ |
| Create Event | ❌ | ✅ | ✅ |
| Cancel Event | ❌ | Own only | ✅ |

---

## 💡 Tips & Tricks

### Best Practices

1. **Link Medical Records** - Link events to relevant medical records for better tracking
2. **Set Capacity Limits** - Limit participants for focused discussions
3. **Use Descriptive Titles** - Make event titles clear and searchable
4. **Schedule in Advance** - Give participants time to prepare
5. **Use Categories** - Select appropriate categories for better organization

### Troubleshooting

**Can't create events?**
- Make sure you're logged in as a doctor or admin
- Check that your wallet is connected

**Can't join an event?**
- Event might be full (check max participants)
- Event might be cancelled
- You might already be a participant

**Event not showing up?**
- Try refreshing the page
- Check your search filters
- Make sure you're in the right status filter

---

## 🔗 Integration with Medical Records

### Link Events to Records

When creating an event, you can optionally link it to a medical record:

1. Have the IPFS CID or record hash ready
2. Paste it in the "Linked Medical Record" field
3. This links the event to the verification workflow

### Benefits

- Track verification sessions for specific records
- Maintain audit trail of verification events
- Link multiple events to one record
- Organize verification workflows

---

## 📱 Mobile Experience

The Virtual Events Module is fully responsive:

- **Mobile**: Single column layout, touch-friendly buttons
- **Tablet**: Two column layout
- **Desktop**: Three column grid layout

All features work seamlessly on mobile devices.

---

## 🔄 Event Lifecycle

```
Created → Scheduled → Ongoing → Completed
                   ↓
                Cancelled
```

### Event States

1. **Scheduled** - Event is created and waiting to start
2. **Ongoing** - Event start time has passed, end time hasn't
3. **Completed** - Event end time has passed
4. **Cancelled** - Event was cancelled by organizer

---

## 🎯 Common Tasks

### Task: Create a Verification Session

1. Go to `/events`
2. Click "Create Event"
3. Fill in details:
   - Title: "Cardiology Record Verification"
   - Description: "Review and verify cardiology records"
   - Date: Tomorrow at 2:00 PM
   - Category: "General Verification"
4. Click "Create Event"
5. Share event link with participants

### Task: Join a Verification Session

1. Go to `/events`
2. Find the event you want to join
3. Click "View Details"
4. Click "Join Event"
5. You're now a participant

### Task: Find Events by Category

1. Go to `/events`
2. Use the search box to find events
3. Or browse the event list
4. Filter by status if needed
5. Click on an event to see details

### Task: Cancel an Event

1. Go to `/events`
2. Find your event
3. Click "View Details"
4. Click "Cancel Event"
5. Confirm cancellation
6. Event status changes to "Cancelled"

---

## 📞 Need Help?

### Check These Resources

1. **Specification**: See `VIRTUAL_EVENTS_SPEC.md` for detailed information
2. **Implementation**: See `VIRTUAL_EVENTS_IMPLEMENTATION.md` for technical details
3. **Console Logs**: Check browser console for debugging information
4. **Error Messages**: Read error messages carefully for guidance

---

## 🚀 Next Steps

1. **Create your first event** - Try creating an event as a doctor
2. **Join an event** - Join an event as a patient
3. **Explore features** - Try searching, filtering, and sorting
4. **Link records** - Link events to medical records
5. **Invite others** - Share events with colleagues

---

## ✨ Features Overview

### Current Features ✅
- Create events (doctor/admin)
- Join events (all users)
- View event details
- Search events
- Filter by status
- Sort by date/participants/recent
- Participant tracking
- Role-based access control
- Wallet-based authentication

### Coming Soon 🔜
- Real-time notifications
- Event reminders
- Video integration
- Event recordings
- Attendance certificates
- Event analytics
- Recurring events
- Event invitations

---

**Happy event planning! 🎉**
