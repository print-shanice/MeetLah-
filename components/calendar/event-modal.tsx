"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Clock, MapPin, Trash2, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  color: string
  isOwner: boolean
}

interface CalendarEvent {
  id: string
  title: string
  date: Date
  endDate: Date
  userId: string
  type: "personal" | "meetup"
  location?: string
}

interface EventModalProps {
  selectedDate: Date | null
  selectedEvent: CalendarEvent | null
  users: User[]
  onClose: () => void
  onSave: (event: { title: string; date: Date; endDate: Date; location?: string }) => void
  onDelete: (eventId: string) => void
  isPending?: boolean
}

export function EventModal({
  selectedDate,
  selectedEvent,
  users,
  onClose,
  onSave,
  onDelete,
  isPending,
}: EventModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [location, setLocation] = useState("")

  const currentUser = users.find((u) => u.isOwner)
  const isViewOnly = selectedEvent && selectedEvent.userId !== currentUser?.id

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title)
      const eventDate = new Date(selectedEvent.date)
      setDate(eventDate.toISOString().split("T")[0])
      setStartTime(
        eventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )
      const endEventDate = new Date(selectedEvent.endDate)
      setEndTime(
        endEventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      )
      setLocation(selectedEvent.location || "")
    } else if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0])
      const hours = selectedDate.getHours()
      if (hours > 0) {
        setStartTime(`${hours.toString().padStart(2, "0")}:00`)
        setEndTime(`${(hours + 1).toString().padStart(2, "0")}:00`)
      }
    }
  }, [selectedEvent, selectedDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !currentUser) return

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const eventDate = new Date(date)
    eventDate.setHours(startHour, startMin, 0, 0)

    const eventEndDate = new Date(date)
    eventEndDate.setHours(endHour, endMin, 0, 0)

    onSave({
      title,
      date: eventDate,
      endDate: eventEndDate,
      location: location || undefined,
    })
  }

  const getEventOwner = () => {
    if (!selectedEvent) return null
    return users.find((u) => u.id === selectedEvent.userId)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedEvent ? (isViewOnly ? "Event Details" : "Edit Event") : "Add Event"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {isViewOnly ? (
          <div className="p-4 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{selectedEvent?.title}</h3>
              {getEventOwner() && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEventOwner()?.color }} />
                  <span className="text-sm text-muted-foreground">{getEventOwner()?.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {new Date(selectedEvent!.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at{" "}
                {new Date(selectedEvent!.date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>

            {selectedEvent?.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{selectedEvent.location}</span>
              </div>
            )}

            <Button variant="outline" onClick={onClose} className="w-full bg-transparent">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className="mt-1"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
                required
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="mt-1"
                disabled={isPending}
              />
            </div>

            <div className="flex gap-2 pt-2">
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(selectedEvent.id)}
                  className="gap-2"
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {selectedEvent ? "Update" : "Add Event"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
