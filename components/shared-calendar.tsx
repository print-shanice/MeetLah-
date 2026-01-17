"use client"

import { useState } from "react"
import { CalendarHeader } from "./calendar/calendar-header"
import { CalendarGrid } from "./calendar/calendar-grid"
import { EventModal } from "./calendar/event-modal"
import { ShareModal } from "./calendar/share-modal"
import { MeetupModal } from "./calendar/meetup-modal"
import { Sidebar } from "./calendar/sidebar"
import { AvailabilityView } from "./calendar/availability-view"
import type { CalendarEvent, User, CalendarView } from "@/lib/types"

const MOCK_USERS: User[] = [
  { id: "1", name: "You", color: "#3b82f6", isOwner: true },
  { id: "2", name: "Alex Chen", color: "#10b981", isOwner: false },
  { id: "3", name: "Sarah Miller", color: "#f59e0b", isOwner: false },
]

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Standup",
    date: new Date(2026, 0, 19, 9, 0),
    endDate: new Date(2026, 0, 19, 9, 30),
    userId: "1",
    type: "personal",
    location: "",
  },
  {
    id: "2",
    title: "Lunch with Alex",
    date: new Date(2026, 0, 20, 12, 0),
    endDate: new Date(2026, 0, 20, 13, 0),
    userId: "1",
    type: "personal",
    location: "Cafe Roma",
  },
  {
    id: "3",
    title: "Project Review",
    date: new Date(2026, 0, 21, 14, 0),
    endDate: new Date(2026, 0, 21, 15, 30),
    userId: "2",
    type: "personal",
    location: "",
  },
  {
    id: "4",
    title: "Yoga Class",
    date: new Date(2026, 0, 22, 18, 0),
    endDate: new Date(2026, 0, 22, 19, 0),
    userId: "3",
    type: "personal",
    location: "Downtown Gym",
  },
  {
    id: "5",
    title: "Weekend Brunch",
    date: new Date(2026, 0, 25, 11, 0),
    endDate: new Date(2026, 0, 25, 13, 0),
    userId: "1",
    type: "meetup",
    location: "The Breakfast Club",
    participants: ["1", "2", "3"],
  },
]

export function SharedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 17))
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<CalendarView>("month")
  const [showEventModal, setShowEventModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMeetupModal, setShowMeetupModal] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState<string[]>(MOCK_USERS.map((u) => u.id))

  const handleAddEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    }
    setEvents([...events, newEvent])
    setShowEventModal(false)
    setSelectedDate(null)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId))
    setSelectedEvent(null)
    setShowEventModal(false)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setSelectedDate(event.date)
    setShowEventModal(true)
  }

  const handleCreateMeetup = (meetup: Omit<CalendarEvent, "id">) => {
    const newMeetup: CalendarEvent = {
      ...meetup,
      id: Date.now().toString(),
    }
    setEvents([...events, newMeetup])
    setShowMeetupModal(false)
  }

  const handleUserColorChange = (userId: string, color: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, color } : u)))
  }

  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const filteredEvents = events.filter((event) => {
    if (event.type === "meetup") return true
    return visibleUsers.includes(event.userId)
  })

  return (
    <div className="flex h-screen">
      <Sidebar
        users={users}
        visibleUsers={visibleUsers}
        onToggleUser={toggleUserVisibility}
        onColorChange={handleUserColorChange}
        onShare={() => setShowShareModal(true)}
        onCheckAvailability={() => setShowAvailability(true)}
        onCreateMeetup={() => setShowMeetupModal(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={setCurrentDate}
          onToday={() => setCurrentDate(new Date(2026, 0, 17))}
        />

        {showAvailability ? (
          <AvailabilityView
            users={users}
            events={events}
            currentDate={currentDate}
            onClose={() => setShowAvailability(false)}
            onSelectSlot={(date) => {
              setShowAvailability(false)
              setShowMeetupModal(true)
              setSelectedDate(date)
            }}
          />
        ) : (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            users={users}
            view={view}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {showEventModal && (
        <EventModal
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
          users={users}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
            setSelectedDate(null)
          }}
          onSave={handleAddEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}

      {showMeetupModal && (
        <MeetupModal
          selectedDate={selectedDate}
          users={users}
          events={events}
          onClose={() => {
            setShowMeetupModal(false)
            setSelectedDate(null)
          }}
          onSave={handleCreateMeetup}
        />
      )}
    </div>
  )
}
