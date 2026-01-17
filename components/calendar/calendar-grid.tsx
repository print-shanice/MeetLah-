"use client"

import type { CalendarEvent, User, CalendarView } from "@/lib/types"
import { MonthView } from "./views/month-view"
import { WeekView } from "./views/week-view"
import { DayView } from "./views/day-view"

interface CalendarGridProps {
  currentDate: Date
  events: CalendarEvent[]
  users: User[]
  view: CalendarView
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarGrid({ currentDate, events, users, view, onDateClick, onEventClick }: CalendarGridProps) {
  if (view === "week") {
    return (
      <WeekView
        currentDate={currentDate}
        events={events}
        users={users}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
      />
    )
  }

  if (view === "day") {
    return (
      <DayView
        currentDate={currentDate}
        events={events}
        users={users}
        onDateClick={onDateClick}
        onEventClick={onEventClick}
      />
    )
  }

  return (
    <MonthView
      currentDate={currentDate}
      events={events}
      users={users}
      onDateClick={onDateClick}
      onEventClick={onEventClick}
    />
  )
}
