"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarHeader } from "./calendar/calendar-header"
import { CalendarGrid } from "./calendar/calendar-grid"
import { EventModal } from "./calendar/event-modal"
import { ShareModal } from "./calendar/share-modal"
import { MeetupModal } from "./calendar/meetup-modal"
import { Sidebar } from "./calendar/sidebar"
import { AvailabilityView } from "./calendar/availability-view"
import { AttendanceModal, PunishmentModal } from "./calendar/attendance-modal"
import {
  createEvent,
  createMeetup,
  deleteEvent,
  updateMemberColor,
  signOut,
  createCalendar,
  joinCalendarByCode,
  markAttendance,
  assignPunishment,
  setMeetupFrequency,
  completePunishment,
} from "@/lib/actions/calendar"
import type { CalendarView, CalendarStreak } from "@/lib/types"

interface Member {
  id: string
  name: string
  email: string
  avatar: string | null
  color: string
  isOwner: boolean
  isCurrentUser: boolean
}

interface Participant {
  id: string
  userId: string
  wasLate: boolean | null
  markedAt: string | null
  user: {
    id: string
    fullName: string
    email: string
    avatar: string | null
  }
}

interface Punishment {
  id: string
  userId: string
  punishmentText: string
  assignedAt: string
  completed: boolean
  completedAt: string | null
  user: {
    id: string
    fullName: string
    email: string
    avatar: string | null
  }
}

interface Event {
  id: string
  title: string
  startTime: string
  endTime: string
  userId: string
  type: "personal" | "meetup"
  location: string | null
  participants: Participant[]
  punishments: Punishment[]
}

interface CalendarAppProps {
  calendar: {
    id: string
    name: string
    shareCode: string
    ownerId: string
  }
  members: Member[]
  events: Event[]
  currentUserId: string
  allCalendars: any[]
  streak: CalendarStreak | null
}

export function CalendarApp({
  calendar,
  members,
  events: initialEvents,
  currentUserId,
  allCalendars,
  streak,
}: CalendarAppProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [view, setView] = useState<CalendarView>("month")
  const [showEventModal, setShowEventModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMeetupModal, setShowMeetupModal] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [showPunishmentModal, setShowPunishmentModal] = useState(false)
  const [visibleUsers, setVisibleUsers] = useState<string[]>(members.map((m) => m.id))

  // Extract all punishments from all events
  const allPunishments = initialEvents.flatMap(event => 
    event.punishments.map(p => ({
      id: p.id,
      user_id: p.userId,
      punishment_text: p.punishmentText,
      assigned_at: p.assignedAt,
      completed: p.completed,
      completed_at: p.completedAt,
      user: {
        id: p.user.id,
        full_name: p.user.fullName,
        email: p.user.email,
        avatar_url: p.user.avatar,
      }
    }))
  )

  // Transform events to the format expected by calendar components
  const transformedEvents = initialEvents.map((event) => {
    const member = members.find((m) => m.id === event.userId)
    return {
      id: event.id,
      title: event.title,
      date: new Date(event.startTime),
      endDate: new Date(event.endTime),
      userId: event.userId,
      type: event.type,
      location: event.location || "",
      participants: event.participants,
      userColor: member?.color || "#3b82f6",
    }
  })

  // Transform members to User format
  const users = members.map((m) => ({
    id: m.id,
    name: m.isCurrentUser ? "You" : m.name,
    color: m.color,
    isOwner: m.isCurrentUser,
  }))

  const handleAddEvent = async (event: {
    title: string
    date: Date
    endDate: Date
    location?: string
  }) => {
    startTransition(async () => {
      const result = await createEvent(calendar.id, {
        title: event.title,
        start_time: event.date.toISOString(),
        end_time: event.endDate.toISOString(),
        location: event.location,
      })

      if (!result.error) {
        setShowEventModal(false)
        setSelectedDate(null)
        router.refresh()
      }
    })
  }

  const handleDeleteEvent = async (eventId: string) => {
    startTransition(async () => {
      const result = await deleteEvent(eventId)
      if (!result.error) {
        setSelectedEvent(null)
        setShowEventModal(false)
        router.refresh()
      }
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setShowEventModal(true)
  }

  const handleEventClick = (event: any) => {
    const originalEvent = initialEvents.find((e) => e.id === event.id)
    if (originalEvent) {
      setSelectedEvent(originalEvent)
      setSelectedDate(new Date(originalEvent.startTime))
      
      // For past meetup events, show attendance modal instead
      if (originalEvent.type === "meetup" && new Date(originalEvent.endTime) < new Date()) {
        setShowAttendanceModal(true)
      } else {
        setShowEventModal(true)
      }
    }
  }

  const handleMarkAttendance = async (participantId: string, wasLate: boolean) => {
    startTransition(async () => {
      const result = await markAttendance(participantId, wasLate)
      if (!result.error) {
        router.refresh()
      }
    })
  }

  const handleAssignPunishment = async (userId: string, punishment: string) => {
    if (!selectedEvent) return
    
    startTransition(async () => {
      const result = await assignPunishment(selectedEvent.id, userId, punishment)
      if (!result.error) {
        router.refresh()
      }
    })
  }

  const handleCompletePunishment = async (punishmentId: string) => {
    startTransition(async () => {
      const result = await completePunishment(punishmentId)
      if (!result.error) {
        router.refresh()
      }
    })
  }

  const handleCreateMeetup = async (meetup: {
    title: string
    date: Date
    endDate: Date
    location: string
  }) => {
    startTransition(async () => {
      const result = await createMeetup(calendar.id, {
        title: meetup.title,
        start_time: meetup.date.toISOString(),
        end_time: meetup.endDate.toISOString(),
        location: meetup.location,
        participantIds: members.map((m) => m.id),
      })

      if (!result.error) {
        setShowMeetupModal(false)
        router.refresh()
      }
    })
  }

  const handleUserColorChange = async (userId: string, color: string) => {
    if (userId !== currentUserId) return

    startTransition(async () => {
      await updateMemberColor(calendar.id, color)
      router.refresh()
    })
  }

  const handleUpdateFrequency = async (frequency: 'weekly' | 'monthly' | 'yearly') => {
    startTransition(async () => {
      const result = await setMeetupFrequency(calendar.id, frequency)
      if (result.error) {
        alert('Failed to update frequency: ' + result.error)
      } else {
        router.refresh()
      }
    })
  }

  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut()
      router.push("/")
      router.refresh()
    })
  }

  const handleCreateCalendar = async (name: string) => {
    startTransition(async () => {
      const result = await createCalendar(name)
      if (result.data) {
        router.push(`/calendar/${result.data.id}`)
      }
    })
  }

  const handleJoinCalendar = async (code: string) => {
    startTransition(async () => {
      const result = await joinCalendarByCode(code, true)
      if (result.data) {
        router.push(`/calendar/${result.data.id}`)
      }
      return result
    })
  }

  const filteredEvents = transformedEvents.filter((event) => {
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
        onSignOut={handleSignOut}
        calendarName={calendar.name}
        allCalendars={allCalendars}
        currentCalendarId={calendar.id}
        onCreateCalendar={handleCreateCalendar}
        onJoinCalendar={handleJoinCalendar}
        isPending={isPending}
        streak={streak}
        isOwner={calendar.ownerId === currentUserId}
        onUpdateFrequency={handleUpdateFrequency}
        punishments={allPunishments}
        currentUserId={currentUserId}
        onCompletePunishment={handleCompletePunishment}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={setCurrentDate}
          onToday={() => setCurrentDate(new Date())}
        />

        {showAvailability ? (
          <AvailabilityView
            users={users}
            events={transformedEvents}
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
          selectedEvent={
            selectedEvent
              ? {
                  id: selectedEvent.id,
                  title: selectedEvent.title,
                  date: new Date(selectedEvent.startTime),
                  endDate: new Date(selectedEvent.endTime),
                  userId: selectedEvent.userId,
                  type: selectedEvent.type,
                  location: selectedEvent.location || "",
                }
              : null
          }
          users={users}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
            setSelectedDate(null)
          }}
          onSave={handleAddEvent}
          onDelete={handleDeleteEvent}
          isPending={isPending}
        />
      )}

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} shareCode={calendar.shareCode} />}

      {showMeetupModal && (
        <MeetupModal
          selectedDate={selectedDate}
          users={users}
          events={transformedEvents}
          onClose={() => {
            setShowMeetupModal(false)
            setSelectedDate(null)
          }}
          onSave={handleCreateMeetup}
          isPending={isPending}
        />
      )}

      {showAttendanceModal && selectedEvent && selectedEvent.type === "meetup" && (
        <AttendanceModal
          event={{
            ...selectedEvent,
            participants: selectedEvent.participants?.map(p => ({
              ...p,
              user: {
                id: p.user.id,
                full_name: p.user.fullName,
                email: p.user.email,
                avatar_url: p.user.avatar,
              }
            })) || []
          }}
          isOpen={showAttendanceModal}
          onClose={() => {
            setShowAttendanceModal(false)
            setSelectedEvent(null)
          }}
          onSave={handleMarkAttendance}
          currentUserId={currentUserId}
        />
      )}

      {showPunishmentModal && selectedEvent && selectedEvent.type === "meetup" && (
        <PunishmentModal
          event={{
            ...selectedEvent,
            participants: selectedEvent.participants?.map(p => ({
              ...p,
              user: {
                id: p.user.id,
                full_name: p.user.fullName,
                email: p.user.email,
                avatar_url: p.user.avatar,
              }
            })) || [],
            punishments: selectedEvent.punishments?.map(pun => ({
              ...pun,
              user: {
                id: pun.user.id,
                full_name: pun.user.fullName,
                email: pun.user.email,
                avatar_url: pun.user.avatar,
              }
            })) || []
          }}
          isOpen={showPunishmentModal}
          onClose={() => {
            setShowPunishmentModal(false)
            setSelectedEvent(null)
          }}
          onAssignPunishment={handleAssignPunishment}
        />
      )}
    </div>
  )
}
