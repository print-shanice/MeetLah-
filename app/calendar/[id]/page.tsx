import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getCalendarDetails, getUserCalendars } from "@/lib/actions/calendar"
import { CalendarApp } from "@/components/calendar-app"

interface CalendarPageProps {
  params: Promise<{ id: string }>
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await getCalendarDetails(id)
  const { data: allCalendars } = await getUserCalendars()

  if (error || !data) {
    notFound()
  }

  // Transform data for the CalendarApp component
  const members = data.calendar.calendar_members.map((member: any) => ({
    id: member.user_id,
    name: member.profiles?.full_name || member.profiles?.email || "Unknown",
    email: member.profiles?.email || "",
    avatar: member.profiles?.avatar_url || null,
    color: member.color,
    isOwner: member.user_id === data.calendar.owner_id,
    isCurrentUser: member.user_id === data.currentUserId,
  }))

  const events = data.events.map((event: any) => ({
    id: event.id,
    title: event.title,
    startTime: event.start_time,
    endTime: event.end_time,
    userId: event.user_id,
    type: event.type,
    location: event.location,
    participants: event.meetup_participants?.map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      wasLate: p.was_late,
      markedAt: p.marked_at,
      user: {
        id: p.profiles?.id,
        fullName: p.profiles?.full_name,
        email: p.profiles?.email,
        avatar: p.profiles?.avatar_url,
      }
    })) || [],
    punishments: event.event_punishments?.map((pun: any) => ({
      id: pun.id,
      userId: pun.user_id,
      punishmentText: pun.punishment_text,
      assignedAt: pun.assigned_at,
      completed: pun.completed,
      completedAt: pun.completed_at,
      user: {
        id: pun.profiles?.id,
        fullName: pun.profiles?.full_name,
        email: pun.profiles?.email,
        avatar: pun.profiles?.avatar_url,
      }
    })) || [],
  }))

  // Get streak data - handle both array and object formats
  let streak = null
  if (Array.isArray(data.calendar.calendar_streaks)) {
    streak = data.calendar.calendar_streaks[0] || null
  } else if (data.calendar.calendar_streaks) {
    streak = data.calendar.calendar_streaks
  }

  return (
    <CalendarApp
      calendar={{
        id: data.calendar.id,
        name: data.calendar.name,
        shareCode: data.calendar.share_code,
        ownerId: data.calendar.owner_id,
      }}
      members={members}
      events={events}
      currentUserId={data.currentUserId}
      allCalendars={allCalendars || []}
      streak={streak}
    />
  )
}
