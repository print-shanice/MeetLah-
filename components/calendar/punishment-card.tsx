"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Zap, CheckCircle2, AlertCircle } from "lucide-react"
import { EventPunishment } from "@/lib/types"
import { toast } from "sonner"

interface PunishmentCardProps {
  punishments: EventPunishment[]
  currentUserId: string
  onCompletePunishment: (punishmentId: string) => Promise<void>
}

// Format date consistently across server and client
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function PunishmentCard({ punishments, currentUserId, onCompletePunishment }: PunishmentCardProps) {
  const [completing, setCompleting] = useState<string | null>(null)

  // Debug logging
  console.log('=== PUNISHMENT CARD DEBUG ===')
  console.log('Punishments received:', punishments)
  console.log('Punishments count:', punishments.length)
  console.log('Current user ID:', currentUserId)

  // Filter punishments for the current user
  const myPunishments = punishments.filter(p => p.user_id === currentUserId)
  const pendingPunishments = myPunishments.filter(p => !p.completed)
  const completedPunishments = myPunishments.filter(p => p.completed)

  console.log('My punishments:', myPunishments)
  console.log('My punishments count:', myPunishments.length)
  console.log('Pending:', pendingPunishments.length)
  console.log('Completed:', completedPunishments.length)
  console.log('Will show card?:', myPunishments.length > 0)
  console.log('=============================')

  const handleComplete = async (punishmentId: string) => {
    setCompleting(punishmentId)
    try {
      await onCompletePunishment(punishmentId)
      toast.success("Punishment marked as completed!")
    } catch (error) {
      toast.error("Failed to mark punishment as completed")
      console.error(error)
    } finally {
      setCompleting(null)
    }
  }

  // Don't show card if no punishments
  if (myPunishments.length === 0) {
    console.log('⚠️ PUNISHMENT CARD: Not rendering - no punishments for current user')
    return null
  }

  console.log('✅ PUNISHMENT CARD: Rendering with', myPunishments.length, 'punishments')

  return (
    <Card className={pendingPunishments.length > 0 ? "border-yellow-500 border-2" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className={`h-5 w-5 ${pendingPunishments.length > 0 ? "text-yellow-500" : "text-gray-400"}`} />
          Punishments
        </CardTitle>
        <CardDescription>
          {pendingPunishments.length > 0 
            ? `You have ${pendingPunishments.length} pending punishment${pendingPunishments.length > 1 ? 's' : ''}`
            : "All punishments completed! 🎉"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pending Punishments */}
        {pendingPunishments.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Pending</h4>
            {pendingPunishments.map((punishment) => (
              <div
                key={punishment.id}
                className="flex flex-col gap-3 p-4 rounded-lg border-2 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {punishment.punishment_text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 ml-8">
                  <p className="text-xs text-muted-foreground">
                     {formatDate(punishment.assigned_at)}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleComplete(punishment.id)}
                    disabled={completing === punishment.id}
                    className="flex-shrink-0"
                  >
                    {completing === punishment.id ? "Completing..." : "Mark Done"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Punishments */}
        {completedPunishments.length > 0 && (
          <div className="space-y-3">
            {pendingPunishments.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
              </div>
            )}
            {completedPunishments.map((punishment) => (
              <div
                key={punishment.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-secondary/50"
              >
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground line-through">
                    {punishment.punishment_text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed {formatDate(punishment.completed_at!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All Group Punishments (Optional - shows what others have too) */}
        {punishments.length > myPunishments.length && (
          <details className="mt-4">
            <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              View all group punishments ({punishments.length - myPunishments.length} others)
            </summary>
            <div className="mt-3 space-y-2">
              {punishments
                .filter(p => p.user_id !== currentUserId)
                .map((punishment) => (
                  <div
                    key={punishment.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={punishment.user?.avatar_url || ""} />
                      <AvatarFallback>
                        {punishment.user?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {punishment.user?.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {punishment.punishment_text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {punishment.completed ? (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  )
}
