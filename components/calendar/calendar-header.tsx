"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { CalendarView } from "@/lib/types"

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  onNavigate: (date: Date) => void
  onToday: () => void
}

export function CalendarHeader({ currentDate, view, onViewChange, onNavigate, onToday }: CalendarHeaderProps) {
  const navigatePrev = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    onNavigate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    onNavigate(newDate)
  }

  const formatHeader = () => {
    const options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" }
    if (view === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }
    return currentDate.toLocaleDateString("en-US", options)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">{formatHeader()}</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>

      <div className="flex items-center bg-muted rounded-lg p-1">
        {(["month", "week", "day"] as CalendarView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </header>
  )
}
