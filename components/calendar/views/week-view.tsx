"use client"

import type { CalendarEvent, User } from "@/lib/types"
import { Users } from "lucide-react"

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  users: User[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function WeekView({ currentDate, events, users, onDateClick, onEventClick }: WeekViewProps) {
  const getWeekDays = () => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const weekDays = getWeekDays()

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getHours() === hour
      )
    })
  }

  const getUserColor = (userId: string) => {
    return users.find((u) => u.id === userId)?.color || "#6b7280"
  }

  const isToday = (date: Date) => {
    const today = new Date(2026, 0, 17)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM"
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="grid grid-cols-8 border-b border-border bg-muted/50">
        <div className="py-3 px-2 text-center text-sm font-medium text-muted-foreground" />
        {weekDays.map((day, index) => (
          <div key={index} className={`py-3 text-center ${isToday(day) ? "bg-primary/10" : ""}`}>
            <p className="text-xs text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className={`text-lg font-semibold ${isToday(day) ? "text-primary" : "text-foreground"}`}>
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[60px]">
            <div className="px-2 py-1 text-xs text-muted-foreground text-right pr-4 border-r border-border">
              {formatHour(hour)}
            </div>
            {weekDays.map((day, dayIndex) => {
              const hourEvents = getEventsForDateAndHour(day, hour)
              return (
                <div
                  key={dayIndex}
                  onClick={() => {
                    const clickedDate = new Date(day)
                    clickedDate.setHours(hour)
                    onDateClick(clickedDate)
                  }}
                  className={`border-r border-border p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isToday(day) ? "bg-primary/5" : ""
                  }`}
                >
                  {hourEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick(event)
                      }}
                      className="w-full text-left px-2 py-1 rounded text-xs font-medium truncate flex items-center gap-1 mb-1"
                      style={{
                        backgroundColor: event.type === "meetup" ? "#8b5cf6" : getUserColor(event.userId),
                        color: "white",
                      }}
                    >
                      {event.type === "meetup" && <Users className="h-3 w-3 flex-shrink-0" />}
                      <span className="truncate">{event.title}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
