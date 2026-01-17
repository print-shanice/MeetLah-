import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { joinCalendarByCode } from "@/lib/actions/calendar"

interface JoinPageProps {
  params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Redirect to login with the join code preserved
    redirect(`/login?redirect=/join/${code}`)
  }

  // Try to join the calendar
  const result = await joinCalendarByCode(code)

  if (result.error === "Already a member" && result.data) {
    redirect(`/calendar/${result.data.id}`)
  }

  if (result.data) {
    redirect(`/calendar/${result.data.id}`)
  }

  // If join failed, show error
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Unable to Join Calendar</h1>
        <p className="text-muted-foreground mb-4">{result.error || "The calendar code may be invalid or expired."}</p>
        <a href="/calendar" className="text-primary hover:underline">
          Go to your calendars
        </a>
      </div>
    </main>
  )
}
