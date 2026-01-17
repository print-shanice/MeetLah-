"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Share2, Users, Plus, Check, LogOut, ChevronDown, Loader2 } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { StreakDisplay } from "./streak-display"
import { PunishmentCard } from "./punishment-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CalendarStreak, EventPunishment } from "@/lib/types"

interface User {
  id: string
  name: string
  color: string
  isOwner: boolean
}

interface SidebarProps {
  users: User[]
  visibleUsers: string[]
  onToggleUser: (userId: string) => void
  onColorChange: (userId: string, color: string) => void
  onShare: () => void
  onCheckAvailability: () => void
  onCreateMeetup: () => void
  onSignOut: () => void
  calendarName: string
  allCalendars: any[]
  currentCalendarId: string
  onCreateCalendar: (name: string) => void
  onJoinCalendar: (code: string) => Promise<any>
  isPending: boolean
  streak: CalendarStreak | null
  isOwner?: boolean
  onUpdateFrequency?: (frequency: 'weekly' | 'monthly' | 'yearly') => Promise<void>
  punishments: EventPunishment[]
  currentUserId: string
  onCompletePunishment: (punishmentId: string) => Promise<void>
}

export function Sidebar({
  users,
  visibleUsers,
  onToggleUser,
  onColorChange,
  onShare,
  onCheckAvailability,
  onCreateMeetup,
  onSignOut,
  calendarName,
  allCalendars,
  currentCalendarId,
  onCreateCalendar,
  onJoinCalendar,
  isPending,
  streak,
  isOwner = false,
  onUpdateFrequency,
  punishments,
  currentUserId,
  onCompletePunishment,
}: SidebarProps) {
  const [newCalendarName, setNewCalendarName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  const handleCreateCalendar = () => {
    if (newCalendarName.trim()) {
      onCreateCalendar(newCalendarName.trim())
      setNewCalendarName("")
      setShowCreateDialog(false)
    }
  }

  const handleJoinCalendar = async () => {
    if (joinCode.trim()) {
      setJoinError(null)
      const result = await onJoinCalendar(joinCode.trim())
      if (result?.error) {
        setJoinError(result.error)
      } else {
        setJoinCode("")
        setShowJoinDialog(false)
      }
    }
  }

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="font-semibold text-foreground">{calendarName}</h2>
                <p className="text-xs text-muted-foreground">{users.length} members</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {allCalendars.map((cal: any) => (
              <DropdownMenuItem key={cal.id} asChild>
                <Link href={`/calendar/${cal.id}`} className={cal.id === currentCalendarId ? "bg-muted" : ""}>
                  {cal.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Calendar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Calendar name"
                    value={newCalendarName}
                    onChange={(e) => setNewCalendarName(e.target.value)}
                  />
                  <Button onClick={handleCreateCalendar} disabled={isPending || !newCalendarName.trim()}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Calendar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Users className="h-4 w-4 mr-2" />
                  Join Calendar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join a Calendar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Enter share code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  {joinError && <p className="text-sm text-destructive">{joinError}</p>}
                  <Button onClick={handleJoinCalendar} disabled={isPending || !joinCode.trim()}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Join Calendar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4 space-y-2">
        <Button onClick={onCreateMeetup} className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Create Meetup
        </Button>
        <Button variant="outline" onClick={onCheckAvailability} className="w-full justify-start gap-2 bg-transparent">
          <Users className="h-4 w-4" />
          Check Availability
        </Button>
        <Button variant="outline" onClick={onShare} className="w-full justify-start gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          Share Calendar
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Streak Display */}
        <div>
          <StreakDisplay 
            streak={streak} 
            calendarName={calendarName} 
            isOwner={isOwner}
            onUpdateFrequency={onUpdateFrequency}
          />
        </div>

        {/* Punishment Card */}
        <div>
          <PunishmentCard 
            punishments={punishments}
            currentUserId={currentUserId}
            onCompletePunishment={onCompletePunishment}
          />
        </div>

        {/* Members List */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Members</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <button
                  onClick={() => onToggleUser(user.id)}
                  className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  style={{
                    borderColor: user.color,
                    backgroundColor: visibleUsers.includes(user.id) ? user.color : "transparent",
                  }}
                >
                  {visibleUsers.includes(user.id) && <Check className="h-3 w-3 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                    {user.isOwner && <span className="ml-1 text-xs text-muted-foreground">(You)</span>}
                  </p>
                </div>

                {user.isOwner && <ColorPicker color={user.color} onChange={(color) => onColorChange(user.id, color)} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
          <span className="text-xs text-muted-foreground">Purple = Meetup events</span>
        </div>
        <Button variant="ghost" onClick={onSignOut} className="w-full justify-start gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
