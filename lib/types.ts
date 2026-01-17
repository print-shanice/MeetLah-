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
  meetup_frequency: 'weekly' | 'monthly' | 'yearly'
  target_met: boolean
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

// Punishment templates - randomly generated for late arrivals
export const PUNISHMENT_LIST = [
  // Original punishments
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
  "Create a funny TikTok/Reel for the group 📱",
  
  // New creative punishments
  "Buy coffee for everyone—while apologizing loudly to the barista for being late ☕😅",
  "Deliver a formal 'late arrival apology speech' in front of the group 🎤",
  "Set a phone alarm titled 'I Am Always Late' and let it ring publicly ⏰",
  "Wear a paper sign saying 'I Respect Other People's Time (Eventually)' 📄",
  "Take a group selfie holding a clock as proof of lateness 📸⏰",
  "Text 'I'm on my way' every minute for the next ten minutes—accurately 📱",
  "Be the designated note-taker for the entire meetup 📝",
  "Post a public apology in the group chat written like a legal disclaimer ⚖️",
  "Do ten dramatic bow apologies, one for each minute late 🙇",
  "Speak only in overly polite customer-service language for 15 minutes 🎭",
  "Buy snacks—but only after asking everyone individually what they want 🍿",
  "Be renamed 'ETA' in the group chat for the rest of the day 📱",
  "Set all future meetups 15 minutes earlier—just for them ⏰",
  "Carry everyone's bags or drinks for the next 10 minutes 🎒",
  "Reenact their excuse as a short theatrical performance 🎭",
  "Sing a brief apology song (lyrics can be improvised) 🎵",
  "Let the group choose their ringtone for one day 📱",
  "Take responsibility for timing all future meetups (ironically) ⏱️",
  "Write 'I will not be late' ten times like a school punishment ✍️",
  "Let someone else order food for them—no complaints allowed 🍔",
  "Be the designated photographer for the entire outing 📷",
  "Stand while everyone else sits for the first five minutes 🧍",
  "Change their contact name to 'Running Late' temporarily 📱",
  "Deliver a TED-Talk-style explanation of why punctuality matters 🎤",
  "Buy dessert, but pretend it was planned all along 🍰",
  "Do a dramatic slow-motion entrance redo 🎬",
  "Wear mismatched socks chosen by the group 🧦",
  "Let the group set their next alarm time ⏰",
  "Publicly thank everyone for 'waiting so patiently' 🙏",
  "Be last in line for everything that day 👥",
  "Carry a timer labeled 'Time I Owe Everyone' ⏲️",
  "Send a calendar invite titled 'My Apology Meeting' 📅",
  "Do a weather-report-style recap of events they missed 🌤️",
  "Be the human GPS for the rest of the outing 🗺️",
  "Write a haiku about being late 🖋️",
  "Speak in the third person for five minutes 🗣️",
  "Let the group choose their profile picture for one day 📸",
  "Pay a 'lateness tax' of snacks or drinks 💰",
  "Do five squats or stretches per minute late (safely) 🏋️",
  "Announce their arrival time every time someone new joins 📢",
  "Wear a watch on the outside of their sleeve ⌚",
  "Be responsible for calling out the time every 10 minutes ⏰",
  "Give everyone a compliment as an apology 💬",
  "Be the designated errand runner for the next task 🏃",
  "Set a reminder titled 'Leave Earlier Than You Think' 📲",
  "Let the group choose the next song played 🎵",
  "Take blame jokingly for the next minor inconvenience 😅",
  "Carry a printed 'Certificate of Lateness' 📜",
  "Promise punctuality with a mock oath 🤝",
  "Buy the next round and toast to punctuality 🥂"
]
