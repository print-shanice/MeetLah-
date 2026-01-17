export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
}

export interface CalendarMember {
  id: string
  user_id: string
  calendar_id: string
  color: string
  joined_at: string
  // Joined from profiles
  user?: User
}

export interface Calendar {
  id: string
  name: string
  owner_id: string
  share_code: string
  created_at: string
  updated_at: string
  // Relations
  members?: CalendarMember[]
  streak?: CalendarStreak
}

export interface CalendarStreak {
  id: string
  calendar_id: string
  current_streak: number
  longest_streak: number
  last_meetup_month: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  calendar_id: string
  user_id: string
  title: string
  start_time: string
  end_time: string
  location: string | null
  type: "personal" | "meetup"
  created_at: string
  updated_at: string
  // Relations
  participants?: MeetupParticipant[]
  punishments?: EventPunishment[]
}

export interface MeetupParticipant {
  id: string
  event_id: string
  user_id: string
  was_late: boolean | null
  marked_at: string | null
  user?: User
}

export interface EventPunishment {
  id: string
  event_id: string
  user_id: string
  punishment_text: string
  assigned_at: string
  completed: boolean
  completed_at: string | null
  user?: User
}

export type CalendarView = "month" | "week" | "day"

// UI-specific types
export interface CalendarMemberWithUser extends CalendarMember {
  user: User
  isOwner: boolean
}

export interface CalendarEventWithDetails extends CalendarEvent {
  userColor: string
  userName: string
}

// Punishment templates
export const PUNISHMENT_LIST = [
  "Buy everyone bubble tea next meetup 🧋",
  "Do 20 push-ups right now 💪",
  "Share an embarrassing story 😳",
  "Sing a song of the group's choice 🎤",
  "Dance for 30 seconds 💃",
  "Post an embarrassing photo on social media 📸",
  "Treat everyone to dessert 🍰",
  "Do an impression of another group member 🎭",
  "Tell 5 jokes (must make at least one person laugh) 😂",
  "Wear a silly hat for the rest of the meetup 🎩",
  "Speak in an accent for the next 10 minutes 🗣️",
  "Do 10 burpees 🏃",
  "Give everyone a genuine compliment 💝",
  "Pay for the next group activity 💰",
  "Write a haiku about being late 📝",
  "Balance a book on your head for 5 minutes 📚",
  "Do your best celebrity impression 🌟",
  "Planks for 1 minute ⏱️",
  "Buy coffee for everyone next time ☕",
  "Create a funny TikTok/Reel for the group 📱"
]
