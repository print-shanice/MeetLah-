"use client"

import { CalendarStreak } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Trophy, Calendar } from "lucide-react"

interface StreakDisplayProps {
  streak: CalendarStreak | null | undefined
  calendarName: string
}

export function StreakDisplay({ streak, calendarName }: StreakDisplayProps) {
  if (!streak) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            Monthly Streak
          </CardTitle>
          <CardDescription>
            Start a streak by having a meetup every month!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-muted-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-2">
              No streak yet - create your first meetup!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { current_streak, longest_streak, last_meetup_month } = streak

  return (
    <Card className={current_streak > 0 ? "border-orange-500 border-2" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Flame className={`h-5 w-5 ${current_streak > 0 ? "text-orange-500" : "text-gray-400"}`} />
          Monthly Streak
        </CardTitle>
        <CardDescription>
          Keep meeting every month to maintain your streak!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            {current_streak > 0 && (
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            )}
            <span className="text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {current_streak}
            </span>
            {current_streak > 0 && (
              <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {current_streak === 0 && "Start your streak!"}
            {current_streak === 1 && "month streak - keep it going!"}
            {current_streak > 1 && `months streak - on fire! 🔥`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Trophy className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{longest_streak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">
              {last_meetup_month ? formatMonth(last_meetup_month) : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Last Meetup</p>
          </div>
        </div>

        {/* Status Message */}
        {current_streak > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
            <p className="text-sm text-center">
              {getStreakMessage(current_streak)}
            </p>
          </div>
        )}

        {/* Achievements */}
        {current_streak >= 3 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {getAchievements(current_streak, longest_streak).map((achievement, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {achievement.icon} {achievement.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function getStreakMessage(streak: number): string {
  if (streak >= 12) return "🎉 Amazing! You've been meeting for over a year!"
  if (streak >= 6) return "💪 Half a year streak - you're unstoppable!"
  if (streak >= 3) return "🌟 Three months strong - keep it up!"
  return "🔥 Great start! Keep meeting to grow your streak!"
}

function getAchievements(currentStreak: number, longestStreak: number) {
  const achievements = []

  if (currentStreak >= 3) {
    achievements.push({ icon: "🥉", label: "3-Month Warrior" })
  }
  if (currentStreak >= 6) {
    achievements.push({ icon: "🥈", label: "Half-Year Hero" })
  }
  if (currentStreak >= 12) {
    achievements.push({ icon: "🥇", label: "Year-Long Legend" })
  }
  if (longestStreak >= 24) {
    achievements.push({ icon: "💎", label: "2-Year Champion" })
  }
  if (currentStreak === longestStreak && currentStreak >= 3) {
    achievements.push({ icon: "📈", label: "Record Holder" })
  }

  return achievements
}
