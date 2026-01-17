"use client"

import type { CalendarEvent, User } from "@/lib/types"
import { Users } from "lucide-react"

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  users: User[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({ currentDate, events, users, onDateClick, onEventClick }: MonthViewProps) {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1)
      days.push(prevDate)
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getUserColor = (userId: string) => {
    return users.find((u) => u.id === userId)?.color || "#6b7280"
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const days = getDaysInMonth()
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
        {days.map((date, index) => {
          if (!date) return <div key={index} className="border-b border-r border-border" />

          const dayEvents = getEventsForDate(date)
          const isInCurrentMonth = isCurrentMonth(date)

          return (
            <div
              key={index}
              onClick={() => onDateClick(date)}
              className={`border-b border-r border-border p-2 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col ${
                !isInCurrentMonth ? "bg-muted/30" : "bg-card"
              }`}
            >
              <span
                className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday(date)
                    ? "bg-primary text-primary-foreground"
                    : !isInCurrentMonth
                      ? "text-muted-foreground"
                      : "text-foreground"
                }`}
              >
                {date.getDate()}
              </span>

              <div className="mt-1 flex-1 overflow-hidden space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs font-medium truncate flex items-center gap-1"
                    style={{
                      backgroundColor: event.type === "meetup" ? "#8b5cf6" : getUserColor(event.userId),
                      color: "white",
                    }}
                  >
                    {event.type === "meetup" && <Users className="h-3 w-3 flex-shrink-0" />}
                    <span className="truncate">{event.title}</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground px-2">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
