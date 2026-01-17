"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, AlertTriangle, Users, MapPin, Clock, Loader2 } from "lucide-react"

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

interface MeetupModalProps {
  selectedDate: Date | null
  users: User[]
  events: CalendarEvent[]
  onClose: () => void
  onSave: (meetup: { title: string; date: Date; endDate: Date; location: string }) => void
  isPending?: boolean
}

export function MeetupModal({ selectedDate, users, events, onClose, onSave, isPending }: MeetupModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("14:00")
  const [location, setLocation] = useState("")
  const [clashingUsers, setClashingUsers] = useState<User[]>([])

  useEffect(() => {
    if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0])
      const hours = selectedDate.getHours()
      if (hours > 0) {
        setStartTime(`${hours.toString().padStart(2, "0")}:00`)
        setEndTime(`${(hours + 2).toString().padStart(2, "0")}:00`)
      }
    }
  }, [selectedDate])

  useEffect(() => {
    if (!date || !startTime || !endTime) {
      setClashingUsers([])
      return
    }

    const [startHour] = startTime.split(":").map(Number)
    const [endHour] = endTime.split(":").map(Number)

    const clashes: User[] = []

    users.forEach((user) => {
      const userEvents = events.filter((e) => e.userId === user.id)

      const hasClash = userEvents.some((event) => {
        const eventDate = new Date(event.date)
        const meetupDate = new Date(date)

        if (
          eventDate.getDate() !== meetupDate.getDate() ||
          eventDate.getMonth() !== meetupDate.getMonth() ||
          eventDate.getFullYear() !== meetupDate.getFullYear()
        ) {
          return false
        }

        const eventStartHour = eventDate.getHours()
        const eventEndHour = new Date(event.endDate).getHours()

        return (
          (startHour >= eventStartHour && startHour < eventEndHour) ||
          (endHour > eventStartHour && endHour <= eventEndHour) ||
          (startHour <= eventStartHour && endHour >= eventEndHour)
        )
      })

      if (hasClash) {
        clashes.push(user)
      }
    })

    setClashingUsers(clashes)
  }, [date, startTime, endTime, users, events])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || clashingUsers.length > 0 || !location.trim()) return

    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const meetupDate = new Date(date)
    meetupDate.setHours(startHour, startMin, 0, 0)

    const meetupEndDate = new Date(date)
    meetupEndDate.setHours(endHour, endMin, 0, 0)

    onSave({
      title,
      date: meetupDate,
      endDate: meetupEndDate,
      location,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Create Meetup</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="meetup-title">Meetup Title</Label>
            <Input
              id="meetup-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Lunch, Game Night"
              className="mt-1"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="meetup-date">Date</Label>
            <Input
              id="meetup-date"
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
              <Label htmlFor="meetup-start">Start Time</Label>
              <Input
                id="meetup-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
                required
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="meetup-end">End Time</Label>
              <Input
                id="meetup-end"
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
            <Label htmlFor="meetup-location">Location</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="meetup-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter meeting place"
                className="pl-10"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground">Participants</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{ backgroundColor: `${user.color}20`, color: user.color }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: user.color }} />
                  {user.name}
                </div>
              ))}
            </div>
          </div>

          {clashingUsers.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Scheduling Conflict</p>
                  <p className="text-sm text-destructive/80 mt-1">The following members have events at this time:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {clashingUsers.map((user) => (
                      <span
                        key={user.id}
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${user.color}20`,
                          color: user.color,
                        }}
                      >
                        {user.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-destructive/70 mt-2">
                    Please choose a different time when everyone is available.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={clashingUsers.length > 0 || isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
              Schedule Meetup
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
