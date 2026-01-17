"use client"

import { useState, useEffect } from "react"
import { CalendarStreak } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { House } from "./house"
import { Calendar, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface StreakDisplayProps {
  streak: CalendarStreak | null | undefined
  calendarName: string
  isOwner?: boolean
  onUpdateFrequency?: (frequency: 'weekly' | 'monthly' | 'yearly') => Promise<void>
}

export function StreakDisplay({ streak, calendarName, isOwner = false, onUpdateFrequency }: StreakDisplayProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<'weekly' | 'monthly' | 'yearly'>(
    streak?.meetup_frequency || 'monthly'
  )
  const [saving, setSaving] = useState(false)
  
  // Add local state for optimistic updates
  const [localFrequency, setLocalFrequency] = useState<'weekly' | 'monthly' | 'yearly' | null>(
    streak?.meetup_frequency || null
  )

  // Debug logging - Enhanced
  useEffect(() => {
  }, [streak, localFrequency])

  // Update selectedFrequency when streak changes
  useEffect(() => {
    if (streak?.meetup_frequency) {
      setSelectedFrequency(streak.meetup_frequency)
      setLocalFrequency(streak.meetup_frequency)
    }
  }, [streak?.meetup_frequency])

  const handleSaveFrequency = async () => {
    if (!onUpdateFrequency) return
    setSaving(true)
    
    try {
      // Optimistically update local state
      setLocalFrequency(selectedFrequency)
      
      await onUpdateFrequency(selectedFrequency)
      setShowSettings(false)
    } catch (error) {
      console.error('Failed to update frequency:', error)
      // Revert on error
      setLocalFrequency(streak?.meetup_frequency || null)
    } finally {
      setSaving(false)
    }
  }

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Week'
      case 'monthly': return 'Month'
      case 'yearly': return 'Year'
      default: return 'Month'
    }
  }

  const getFrequencyText = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Once a Week'
      case 'monthly': return 'Once a Month'
      case 'yearly': return 'Once a Year'
      default: return 'Once a Month'
    }
  }

  // Use localFrequency if available, otherwise use streak data
  const effectiveFrequency = localFrequency || streak?.meetup_frequency
  
  // FIXED: Check if user has set a goal (frequency exists) 
  const hasSetGoal = !!effectiveFrequency
  
  // FIXED: Check if there's an active streak (has streak data AND streak >= 1)
  // Change from > 0 to >= 1 to ensure streak of 1 shows the active card
  const currentStreakValue = streak?.current_streak ?? 0
  const hasActiveStreak = hasSetGoal && currentStreakValue >= 1


  return (
    <>
      {!hasSetGoal ? (
        // STATE 1: No goal set yet - show initial setup card
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              Streak Tracker
            </CardTitle>
            <CardDescription>
              Set your meetup goal and start your streak!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <House isPerfect={false} className="mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mt-2">
                No streak yet - create your first meetup!
              </p>
              {isOwner && onUpdateFrequency && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Set Meetup Goal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : !hasActiveStreak ? (
        // STATE 2: Goal is set but no streak yet (current_streak = 0)
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              Streak Tracker
            </CardTitle>
            <CardDescription>
              <span className="font-semibold">{getFrequencyText(effectiveFrequency)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <House isPerfect={false} className="mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mt-2">
                No streak yet - create your first meetup!
              </p>
              {isOwner && onUpdateFrequency && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Change Meetup Goal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        // STATE 3: Has active streak (current_streak >= 1) - show full streak card
        <Card className={streak!.target_met ? "border-blue-500 border-2" : "border-gray-400 border-2"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className={`h-5 w-5 ${streak!.target_met ? "text-blue-500" : "text-gray-400"}`} />
                Streak Tracker
              </CardTitle>
              {isOwner && onUpdateFrequency && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            <CardDescription>
              <span className="font-semibold">{getFrequencyText(streak!.meetup_frequency)}</span>
              {' - '}Meet {getFrequencyLabel(streak!.meetup_frequency).toLowerCase()}ly to maintain your streak!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* House Visual */}
            <div className="text-center">
              <House isPerfect={streak!.target_met} className="mx-auto" />
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {streak!.target_met ? "House is Perfect! 🏡" : "House Needs Repairs! 🏚️"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {streak!.target_met 
                    ? `Keep meeting ${getFrequencyLabel(streak!.meetup_frequency).toLowerCase()}ly!`
                    : "Meet up again to restore your house!"
                  }
                </p>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-2 mb-2">
                <span className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  {streak!.current_streak}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {streak!.current_streak === 1 && `1 ${getFrequencyLabel(streak!.meetup_frequency).toLowerCase()} - keep it going!`}
                {streak!.current_streak > 1 && `${streak!.current_streak} ${getFrequencyLabel(streak!.meetup_frequency).toLowerCase()}s streak! 🎉`}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-2xl font-bold">{streak!.longest_streak}</p>
                <p className="text-xs text-muted-foreground">Record Streak</p>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <p className="text-sm font-medium">
                  {streak!.meetup_frequency === 'weekly' && '📅 Weekly'}
                  {streak!.meetup_frequency === 'monthly' && '🗓️ Monthly'}
                  {streak!.meetup_frequency === 'yearly' && '📆 Yearly'}
                </p>
                <p className="text-xs text-muted-foreground">Goal</p>
              </div>
            </div>

            {/* Change Goal Button */}
            {isOwner && onUpdateFrequency && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Meetup Goal
              </Button>
            )}

            {/* Status Message */}
            {streak!.current_streak > 0 && (
              <div className={`${
                streak!.target_met 
                  ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' 
                  : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900'
              } border rounded-lg p-4`}>
                <p className="text-sm text-center">
                  {getStreakMessage(streak!.current_streak, streak!.meetup_frequency)}
                </p>
              </div>
            )}

            {/* Achievements */}
            {streak!.current_streak >= 3 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {getAchievements(streak!.current_streak, streak!.longest_streak, streak!.meetup_frequency).map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {achievement.icon} {achievement.label}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Frequency Settings Dialog - shown for both states */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meetup Goal Settings</DialogTitle>
            <DialogDescription>
              How often do you plan to meet up with this group?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedFrequency} onValueChange={(v) => setSelectedFrequency(v as any)}>
              <div className="flex items-center space-x-2 mb-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                  <div className="font-medium">📅 Once a Week</div>
                  <div className="text-sm text-muted-foreground">Meet every 7 days</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 mb-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                  <div className="font-medium">🗓️ Once a Month</div>
                  <div className="text-sm text-muted-foreground">Meet every 30 days</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly" className="flex-1 cursor-pointer">
                  <div className="font-medium">📆 Once a Year</div>
                  <div className="text-sm text-muted-foreground">Meet every 365 days</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFrequency} disabled={saving}>
              {saving ? "Saving..." : "Save Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function getStreakMessage(streak: number, frequency: string): string {
  const unit = frequency === 'weekly' ? 'week' : frequency === 'monthly' ? 'month' : 'year'
  const plural = streak > 1 ? `${unit}s` : unit
  
  if (streak >= 12 && frequency === 'monthly') return "🎉 Amazing! A full year of meetups!"
  if (streak >= 52 && frequency === 'weekly') return "🎉 Amazing! A full year of weekly meetups!"
  if (streak >= 6 && frequency === 'monthly') return "💪 Half a year streak - you're unstoppable!"
  if (streak >= 3) return `🌟 ${streak} ${plural} strong - keep it up!`
  return `🔥 Great start! ${streak} ${plural}!`
}

function getAchievements(currentStreak: number, longestStreak: number, frequency: string) {
  const achievements = []
  const threshold = frequency === 'weekly' ? 12 : frequency === 'monthly' ? 3 : 1

  if (currentStreak >= threshold * 1) {
    achievements.push({ icon: "🥉", label: `${threshold * 1} ${frequency === 'weekly' ? 'Weeks' : frequency === 'monthly' ? 'Months' : 'Year'}` })
  }
  if (currentStreak >= threshold * 2) {
    achievements.push({ icon: "🥈", label: `${threshold * 2} ${frequency === 'weekly' ? 'Weeks' : frequency === 'monthly' ? 'Months' : 'Years'}` })
  }
  if (currentStreak >= threshold * 4) {
    achievements.push({ icon: "🥇", label: `${threshold * 4}+ Strong` })
  }
  if (currentStreak === longestStreak && currentStreak >= 3) {
    achievements.push({ icon: "📈", label: "Record Holder" })
  }

  return achievements
}
