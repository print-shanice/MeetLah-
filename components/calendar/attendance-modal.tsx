"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarEvent, MeetupParticipant, EventPunishment, PUNISHMENT_LIST } from "@/lib/types"
import { Clock, CheckCircle2, XCircle, Zap } from "lucide-react"
import { toast } from "sonner"

interface AttendanceModalProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
  onSave: (participantId: string, wasLate: boolean) => Promise<void>
  currentUserId: string
}

export function AttendanceModal({
  event,
  isOpen,
  onClose,
  onSave,
  currentUserId,
}: AttendanceModalProps) {
  const [marking, setMarking] = useState<{ [key: string]: boolean | null }>({})
  const [saving, setSaving] = useState(false)

  const isPastEvent = new Date(event.end_time) < new Date()
  
  if (!isPastEvent) {
    return null
  }

  const handleMarkAttendance = async (participantId: string, wasLate: boolean) => {
    setMarking((prev) => ({ ...prev, [participantId]: wasLate }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Save all marked attendance
      for (const [participantId, wasLate] of Object.entries(marking)) {
        if (wasLate !== null) {
          await onSave(participantId, wasLate)
        }
      }
      toast.success("Attendance marked successfully!")
      onClose()
    } catch (error) {
      toast.error("Failed to mark attendance")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Who was late to "{event.title}"?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {event.participants?.map((participant) => {
            const markedStatus = marking[participant.id] ?? participant.was_late
            const alreadyMarked = participant.was_late !== null

            return (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user?.avatar_url || ""} />
                    <AvatarFallback>
                      {participant.user?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {participant.user?.full_name || "Unknown"}
                    </p>
                    {alreadyMarked && (
                      <p className="text-xs text-muted-foreground">
                        Already marked
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={markedStatus === false ? "default" : "outline"}
                    onClick={() => handleMarkAttendance(participant.id, false)}
                    disabled={alreadyMarked}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    On Time
                  </Button>
                  <Button
                    size="sm"
                    variant={markedStatus === true ? "destructive" : "outline"}
                    onClick={() => handleMarkAttendance(participant.id, true)}
                    disabled={alreadyMarked}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Late
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? "Saving..." : "Save Attendance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PunishmentModalProps {
  event: CalendarEvent
  isOpen: boolean
  onClose: () => void
  onAssignPunishment: (userId: string, punishment: string) => Promise<void>
}

export function PunishmentModal({
  event,
  isOpen,
  onClose,
  onAssignPunishment,
}: PunishmentModalProps) {
  const [assigning, setAssigning] = useState(false)

  const lateParticipants = event.participants?.filter((p) => p.was_late === true) || []

  const getRandomPunishment = () => {
    return PUNISHMENT_LIST[Math.floor(Math.random() * PUNISHMENT_LIST.length)]
  }

  const handleAssignPunishments = async () => {
    setAssigning(true)
    try {
      for (const participant of lateParticipants) {
        // Check if already has punishment
        const existingPunishment = event.punishments?.find(
          (p) => p.user_id === participant.user_id
        )
        
        if (!existingPunishment) {
          const punishment = getRandomPunishment()
          await onAssignPunishment(participant.user_id, punishment)
        }
      }
      toast.success("Punishments assigned!")
      onClose()
    } catch (error) {
      toast.error("Failed to assign punishments")
      console.error(error)
    } finally {
      setAssigning(false)
    }
  }

  if (lateParticipants.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>🎉 Everyone was on time!</DialogTitle>
            <DialogDescription>
              No punishments needed for this meetup.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Punctuality Punisher
          </DialogTitle>
          <DialogDescription>
            Time to assign random punishments to the latecomers!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {lateParticipants.map((participant) => {
            const existingPunishment = event.punishments?.find(
              (p) => p.user_id === participant.user_id
            )

            return (
              <div
                key={participant.id}
                className="flex items-start gap-3 p-4 border rounded-lg bg-red-50 dark:bg-red-950/20"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.user?.avatar_url || ""} />
                  <AvatarFallback>
                    {participant.user?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">
                    {participant.user?.full_name || "Unknown"}
                  </p>
                  {existingPunishment ? (
                    <div className="mt-2">
                      <Badge variant="destructive" className="mb-2">
                        Punishment Assigned
                      </Badge>
                      <p className="text-sm bg-white dark:bg-gray-900 p-2 rounded border">
                        {existingPunishment.punishment_text}
                      </p>
                      {existingPunishment.completed && (
                        <Badge variant="outline" className="mt-2">
                          ✓ Completed
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Waiting for punishment assignment...
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!event.punishments?.length && (
            <Button
              onClick={handleAssignPunishments}
              disabled={assigning}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {assigning ? "Assigning..." : "Assign Random Punishments"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
