"use client"

import { Button } from "@/components/ui/button"
import { X, Check, AlertCircle } from "lucide-react"
import type { CalendarEvent, User } from "@/lib/types"

interface AvailabilityViewProps {
  users: User[]
  events: CalendarEvent[]
  currentDate: Date
  onClose: () => void
  onSelectSlot: (date: Date) => void
}

export function AvailabilityView({ users, events, currentDate, onClose, onSelectSlot }: AvailabilityViewProps) {
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

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)
  const weekDays = getWeekDays()

  const getAvailability = (date: Date, hour: number) => {
    const busyUsers: string[] = []

    events.forEach((event) => {
      const eventDate = new Date(event.date)
      const eventEndDate = new Date(event.endDate)

      if (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      ) {
        const startHour = eventDate.getHours()
        const endHour = eventEndDate.getHours()

        if (hour >= startHour && hour < endHour) {
          if (!busyUsers.includes(event.userId)) {
            busyUsers.push(event.userId)
          }
        }
      }
    })

    return {
      busyUsers,
      availableUsers: users.filter((u) => !busyUsers.includes(u.id)),
      allFree: busyUsers.length === 0,
    }
  }

  const formatHour = (hour: number) => {
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return "12 PM"
    return `${hour - 12} PM`
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Check Availability</h2>
          <p className="text-sm text-muted-foreground">Find a time when everyone is free to meet</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500" />
            <span className="text-sm text-muted-foreground">All free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500" />
            <span className="text-sm text-muted-foreground">Some busy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500" />
            <span className="text-sm text-muted-foreground">All busy</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 border-b border-border bg-muted/50 sticky top-0">
          <div className="py-3 px-2" />
          {weekDays.map((day, index) => (
            <div key={index} className="py-3 text-center">
              <p className="text-xs text-muted-foreground">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
              <p className="text-lg font-semibold text-foreground">{day.getDate()}</p>
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-border">
            <div className="px-2 py-3 text-xs text-muted-foreground text-right pr-4 border-r border-border">
              {formatHour(hour)}
            </div>
            {weekDays.map((day, dayIndex) => {
              const availability = getAvailability(day, hour)
              const allBusy = availability.busyUsers.length === users.length

              let bgColor = "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30"
              if (allBusy) {
                bgColor = "bg-red-500/10 border-red-500/30"
              } else if (availability.busyUsers.length > 0) {
                bgColor = "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
              }

              return (
                <button
                  key={dayIndex}
                  onClick={() => {
                    if (!allBusy) {
                      const selectedDate = new Date(day)
                      selectedDate.setHours(hour)
                      onSelectSlot(selectedDate)
                    }
                  }}
                  disabled={allBusy}
                  className={`border-r border-b border-border p-1 transition-colors ${bgColor} ${
                    allBusy ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="h-full flex flex-col items-center justify-center gap-1">
                    {availability.allFree ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : allBusy ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="flex -space-x-1">
                        {availability.busyUsers.slice(0, 3).map((userId) => {
                          const user = users.find((u) => u.id === userId)
                          return (
                            <div
                              key={userId}
                              className="w-4 h-4 rounded-full border-2 border-card"
                              style={{ backgroundColor: user?.color }}
                              title={`${user?.name} is busy`}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
