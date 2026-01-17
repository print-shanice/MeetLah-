"use client"

import type { CalendarEvent, User } from "@/lib/types"
import { Users, MapPin } from "lucide-react"

interface DayViewProps {
  currentDate: Date
  events: CalendarEvent[]
  users: User[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function DayView({ currentDate, events, users, onDateClick, onEventClick }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getHours() === hour
      )
    })
  }

  const getUserColor = (userId: string) => {
    return users.find((u) => u.id === userId)?.color || "#6b7280"
  }

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown"
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {hours.map((hour) => {
        const hourEvents = getEventsForHour(hour)
        return (
          <div
            key={hour}
            className="flex border-b border-border min-h-[80px] hover:bg-muted/30 transition-colors cursor-pointer"
            onClick={() => {
              const clickedDate = new Date(currentDate)
              clickedDate.setHours(hour)
              onDateClick(clickedDate)
            }}
          >
            <div className="w-20 flex-shrink-0 px-4 py-2 text-sm text-muted-foreground text-right border-r border-border">
              {formatHour(hour)}
            </div>
            <div className="flex-1 p-2 space-y-2">
              {hourEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventClick(event)
                  }}
                  className="w-full text-left p-3 rounded-lg flex items-start gap-3"
                  style={{
                    backgroundColor: event.type === "meetup" ? "#8b5cf6" : getUserColor(event.userId),
                  }}
                >
                  {event.type === "meetup" && <Users className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{event.title}</p>
                    <p className="text-sm text-white/80">
                      {formatTime(new Date(event.date))} - {formatTime(new Date(event.endDate))}
                    </p>
                    {event.location && (
                      <p className="text-sm text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                    {event.type === "meetup" && event.participants && (
                      <p className="text-sm text-white/80 mt-1">
                        With: {event.participants.map((p) => getUserName(p)).join(", ")}
                      </p>
                    )}
                    {event.type === "personal" && (
                      <p className="text-sm text-white/80 mt-1">{getUserName(event.userId)}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
