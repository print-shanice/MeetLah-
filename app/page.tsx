import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Share2, Clock } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/calendar")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative max-w-6xl mx-auto px-4 py-24">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">MeetLah!</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
              Plan Meetups with Friends, Effortlessly
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Create shared calendars, find common free times, and schedule meetups without the back-and-forth. MeetLah!
              makes coordinating with friends simple.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Everything You Need to Meet Up</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={Calendar}
            title="Shared Calendars"
            description="Create calendars and invite friends to share their availability"
          />
          <FeatureCard
            icon={Users}
            title="Color-Coded Events"
            description="Each member picks their color for easy visual identification"
          />
          <FeatureCard
            icon={Share2}
            title="Easy Sharing"
            description="Share via link - anyone can join your calendar instantly"
          />
          <FeatureCard
            icon={Clock}
            title="Availability Check"
            description="Find when everyone is free and create meetups with one click"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-muted-foreground">
          <p>Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
