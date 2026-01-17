import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getUserCalendars, createCalendar } from "@/lib/actions/calendar"

export default async function CalendarPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's calendars
  const { data: calendars } = await getUserCalendars()

  // If no calendars exist, create a default one
  if (!calendars || calendars.length === 0) {
    const { data: newCalendar } = await createCalendar("My Shared Calendar")
    if (newCalendar) {
      redirect(`/calendar/${newCalendar.id}`)
    }
  }

  // Redirect to the first calendar
  if (calendars && calendars.length > 0) {
    redirect(`/calendar/${calendars[0].id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Setting up your calendar...</p>
    </div>
  )
}
