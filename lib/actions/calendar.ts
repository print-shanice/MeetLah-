"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// Get all calendars for the current user
export async function getUserCalendars() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  const { data, error } = await supabase
    .from("calendar_members")
    .select(
      `
      calendar_id,
      calendars (
        id,
        name,
        owner_id,
        share_code,
        created_at
      )
    `,
    )
    .eq("user_id", user.id)

  if (error) return { error: error.message, data: null }

  const calendars = data?.map((item) => item.calendars).filter(Boolean)
  return { error: null, data: calendars }
}

// Create a new calendar
export async function createCalendar(name: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  // Create the calendar
  const { data: calendar, error: calendarError } = await supabase
    .from("calendars")
    .insert({ name, owner_id: user.id })
    .select()
    .single()

  if (calendarError) return { error: calendarError.message, data: null }

  // Add the creator as a member
  const { error: memberError } = await supabase.from("calendar_members").insert({
    calendar_id: calendar.id,
    user_id: user.id,
    color: "#3b82f6",
  })

  if (memberError) return { error: memberError.message, data: null }

  revalidatePath("/calendar")
  return { error: null, data: calendar }
}

// Join a calendar via share code
export async function joinCalendarByCode(shareCode: string, shouldRevalidate: boolean = false) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  // Find the calendar
  const { data: calendar, error: findError } = await supabase
    .from("calendars")
    .select("id")
    .eq("share_code", shareCode)
    .single()

  if (findError || !calendar) return { error: "Calendar not found", data: null }

  // Check if already a member
  const { data: existing } = await supabase
    .from("calendar_members")
    .select("id")
    .eq("calendar_id", calendar.id)
    .eq("user_id", user.id)
    .single()

  if (existing) return { error: "Already a member", data: calendar }

  // Generate a random color
  const colors = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]
  const color = colors[Math.floor(Math.random() * colors.length)]

  // Join the calendar
  const { error: joinError } = await supabase.from("calendar_members").insert({
    calendar_id: calendar.id,
    user_id: user.id,
    color,
  })

  if (joinError) return { error: joinError.message, data: null }

  if (shouldRevalidate) {
    revalidatePath("/calendar")
  }
  return { error: null, data: calendar }
}

// Get calendar details with members and events
export async function getCalendarDetails(calendarId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  // Get calendar with members and streak
  const { data: calendar, error: calendarError } = await supabase
    .from("calendars")
    .select(
      `
      *,
      calendar_members (
        id,
        user_id,
        color,
        joined_at,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      ),
      calendar_streaks (
        id,
        current_streak,
        longest_streak,
        last_meetup_month,
        meetup_frequency,
        target_met,
        last_meetup_date
      )
    `,
    )
    .eq("id", calendarId)
    .single()

  if (calendarError) return { error: calendarError.message, data: null }

  // Get events with participants and punishments
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select(
      `
      *,
      meetup_participants (
        id,
        user_id,
        was_late,
        marked_at,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      ),
      event_punishments (
        id,
        user_id,
        punishment_text,
        assigned_at,
        completed,
        completed_at,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      )
    `,
    )
    .eq("calendar_id", calendarId)
    .order("start_time", { ascending: true })

  if (eventsError) return { error: eventsError.message, data: null }

  return {
    error: null,
    data: {
      calendar,
      events,
      currentUserId: user.id,
    },
  }
}

// Create a personal event
export async function createEvent(
  calendarId: string,
  data: {
    title: string
    start_time: string
    end_time: string
    location?: string
  },
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      calendar_id: calendarId,
      user_id: user.id,
      title: data.title,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location || null,
      type: "personal",
    })
    .select()
    .single()

  if (error) return { error: error.message, data: null }

  revalidatePath("/calendar")
  return { error: null, data: event }
}

// Create a meetup event
export async function createMeetup(
  calendarId: string,
  data: {
    title: string
    start_time: string
    end_time: string
    location: string
    participantIds: string[]
  },
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }


  // Create the meetup event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      calendar_id: calendarId,
      user_id: user.id,
      title: data.title,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      type: "meetup",
    })
    .select()
    .single()

  if (eventError) return { error: eventError.message, data: null }


  // Add participants
  const participants = data.participantIds.map((userId) => ({
    event_id: event.id,
    user_id: userId,
  }))

  const { error: participantsError } = await supabase.from("meetup_participants").insert(participants)

  if (participantsError) {
    console.error('Failed to add participants:', participantsError)
    return { error: participantsError.message, data: null }
  }


  // Check if the meetup is in the past or present (already happened or happening now)
  const meetupDate = new Date(data.start_time)
  const now = new Date()
  const isPastOrPresent = meetupDate <= now


  // Only update streak if the meetup is in the past or present
  // (Future meetups shouldn't count toward the streak yet)
  if (isPastOrPresent) {
    
    // Try to call the database function
    const { data: streakData, error: streakError } = await supabase.rpc(
      'update_calendar_streak_with_frequency', 
      {
        p_calendar_id: calendarId,
        p_event_date: data.start_time
      }
    )
    
    if (streakError) {
      console.error('Database function error:', streakError)
      
      // Fallback: manually update the streak if function doesn't exist
      
      // Get current streak data
      const { data: streakRecord } = await supabase
        .from("calendar_streaks")
        .select("*")
        .eq("calendar_id", calendarId)
        .single()
      
      if (streakRecord) {
        const currentStreak = streakRecord.current_streak || 0
        const newStreak = currentStreak + 1
        
        const { error: updateError } = await supabase
          .from("calendar_streaks")
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(streakRecord.longest_streak || 0, newStreak),
            last_meetup_date: data.start_time,
            last_meetup_month: new Date(data.start_time).toISOString().substring(0, 7), // YYYY-MM
            target_met: true,
            updated_at: new Date().toISOString()
          })
          .eq("calendar_id", calendarId)
        
        if (updateError) {
          console.error('Fallback update also failed:', updateError)
        } else {
        }
      }
    } else {
    }
  } else {
  }

  revalidatePath(`/calendar/${calendarId}`)
  revalidatePath("/calendar")
  
  return { error: null, data: event }
}

// Delete an event (works for both personal and meetup events)
export async function deleteEvent(eventId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  // Get the event to check permissions
  const { data: event } = await supabase
    .from("events")
    .select("user_id, type, calendar_id")
    .eq("id", eventId)
    .single()

  if (!event) return { error: "Event not found" }

  // For personal events, only the creator can delete
  // For meetup events, any member can delete
  if (event.type === "personal" && event.user_id !== user.id) {
    return { error: "You can only delete your own events" }
  }

  if (event.type === "meetup") {
    // Check if user is a member of the calendar
    const { data: membership } = await supabase
      .from("calendar_members")
      .select("id")
      .eq("calendar_id", event.calendar_id)
      .eq("user_id", user.id)
      .single()

    if (!membership) {
      return { error: "You must be a calendar member to delete this meetup" }
    }
  }

  const { error } = await supabase.from("events").delete().eq("id", eventId)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { error: null }
}

// Update member color
export async function updateMemberColor(calendarId: string, color: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("calendar_members")
    .update({ color })
    .eq("calendar_id", calendarId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { error: null }
}

// Mark attendance for a participant
export async function markAttendance(
  participantId: string,
  wasLate: boolean
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("meetup_participants")
    .update({ 
      was_late: wasLate,
      marked_at: new Date().toISOString()
    })
    .eq("id", participantId)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { error: null }
}

// Assign punishment to a late participant
export async function assignPunishment(
  eventId: string,
  userId: string,
  punishmentText: string
) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated", data: null }

  const { data, error } = await supabase
    .from("event_punishments")
    .insert({
      event_id: eventId,
      user_id: userId,
      punishment_text: punishmentText,
    })
    .select()
    .single()

  if (error) return { error: error.message, data: null }

  revalidatePath("/calendar")
  return { error: null, data }
}

// Mark punishment as completed
export async function completePunishment(punishmentId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("event_punishments")
    .update({ 
      completed: true,
      completed_at: new Date().toISOString()
    })
    .eq("id", punishmentId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/calendar")
  return { error: null }
}

// Update meetup frequency for a calendar
export async function setMeetupFrequency(
  calendarId: string,
  frequency: 'weekly' | 'monthly' | 'yearly'
) {
  
  return { error: null }
}

// Recalculate streaks for a calendar (useful for fixing data or testing)
export async function recalculateStreaks(calendarId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Not authenticated" }

  // Verify user is a member of the calendar
  const { data: membership } = await supabase
    .from("calendar_members")
    .select("id")
    .eq("calendar_id", calendarId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return { error: "You must be a calendar member to recalculate streaks" }
  }

  // Call the recalculation function
  const { data, error } = await supabase.rpc('recalculate_calendar_streaks', {
    p_calendar_id: calendarId
  })

  if (error) {
    console.error('Recalculation error:', error)
    return { error: error.message, data: null }
  }

  revalidatePath(`/calendar/${calendarId}`)
  return { error: null, data }
}

// Logout
export async function signOut() {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath("/")
}
