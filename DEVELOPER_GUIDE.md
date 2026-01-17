# Developer Quick Start

Quick reference for developers working on MeetLah!

## 🚀 Quick Setup (5 minutes)

```bash
# 1. Install dependencies
cd /Users/shanice/Downloads/MatchLah!
pnpm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start dev server
pnpm dev
```

Then set up Supabase (see SETUP_GUIDE.md for details).

## 📂 Project Structure

```
MatchLah!/
├── app/                          # Next.js 14+ App Router
│   ├── auth/callback/           # OAuth callback handler
│   ├── calendar/[id]/           # Dynamic calendar pages
│   ├── join/[code]/            # Calendar join via share code
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/
│   ├── calendar/                # Calendar-specific components
│   │   ├── attendance-modal.tsx        # NEW: Attendance & punishments
│   │   ├── streak-display.tsx          # NEW: Streak visualization
│   │   ├── calendar-grid.tsx           # Main calendar grid
│   │   ├── calendar-header.tsx         # Date navigation
│   │   ├── event-modal.tsx             # Event creation/editing
│   │   ├── meetup-modal.tsx            # Meetup creation
│   │   ├── share-modal.tsx             # Share calendar
│   │   ├── sidebar.tsx                 # Sidebar with members
│   │   └── views/                      # Month/week/day views
│   ├── ui/                      # Reusable UI components (shadcn/ui)
│   ├── calendar-app.tsx         # Main calendar orchestrator
│   └── shared-calendar.tsx      # Calendar wrapper
│
├── lib/
│   ├── actions/
│   │   └── calendar.ts          # Server actions for calendar operations
│   │                            # NEW: markAttendance, assignPunishment
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   └── server.ts           # Server-side Supabase
│   ├── types.ts                # TypeScript types
│   │                            # NEW: CalendarStreak, EventPunishment
│   └── utils.ts                # Utility functions
│
├── scripts/                     # Database migrations
│   ├── 001-create-tables.sql
│   ├── 002-fix-profile-trigger.sql
│   ├── 003-fix-rls-recursion.sql
│   └── 004-add-streaks-and-punctuality.sql  # NEW
│
└── public/                      # Static assets
```

## 🗄️ Database Schema

### New Tables (v2)

**calendar_streaks**
```sql
- id (uuid)
- calendar_id (uuid, unique)
- current_streak (int)
- longest_streak (int)
- last_meetup_month (text)  -- Format: "YYYY-MM"
```

**event_punishments**
```sql
- id (uuid)
- event_id (uuid)
- user_id (uuid)
- punishment_text (text)
- assigned_at (timestamptz)
- completed (boolean)
- completed_at (timestamptz)
```

**meetup_participants** (updated)
```sql
-- New columns:
- was_late (boolean)
- marked_at (timestamptz)
```

### Key Functions

**update_calendar_streak(calendar_id, event_date)**
- Automatically called when meetup is created
- Calculates if streak continues or resets
- Updates current_streak and longest_streak

## 🔑 Key Components

### AttendanceModal
Location: `components/calendar/attendance-modal.tsx`

Handles:
- Marking participants as late/on-time
- Shows past meetup events only
- Integrates with markAttendance server action

```tsx
<AttendanceModal
  event={meetupEvent}
  isOpen={true}
  onClose={() => {}}
  onSave={handleMarkAttendance}
  currentUserId={userId}
/>
```

### PunishmentModal
Location: `components/calendar/attendance-modal.tsx`

Handles:
- Displaying late participants
- Randomly assigning punishments
- Showing assigned punishments
- Marking punishments as complete

```tsx
<PunishmentModal
  event={meetupEvent}
  isOpen={true}
  onClose={() => {}}
  onAssignPunishment={handleAssignPunishment}
/>
```

### StreakDisplay
Location: `components/calendar/streak-display.tsx`

Displays:
- Current streak with fire animation
- Longest streak record
- Last meetup month
- Achievement badges
- Motivational messages

```tsx
<StreakDisplay 
  streak={calendarStreak} 
  calendarName="Friend Group" 
/>
```

## 🛠️ Server Actions

### New Actions

**markAttendance(participantId, wasLate)**
```typescript
// Mark a participant's attendance
await markAttendance(participantId, true) // Late
await markAttendance(participantId, false) // On time
```

**assignPunishment(eventId, userId, punishmentText)**
```typescript
// Assign a punishment to a late user
await assignPunishment(
  eventId, 
  userId, 
  "Buy everyone bubble tea 🧋"
)
```

**completePunishment(punishmentId)**
```typescript
// Mark a punishment as completed
await completePunishment(punishmentId)
```

## 🎨 Styling

Uses Tailwind CSS 4 with:
- Dark mode support (next-themes)
- Custom color variables
- Responsive breakpoints
- shadcn/ui component library

Color scheme:
- Primary: Calendar brand color
- Secondary: Muted backgrounds
- Destructive: Error states, late indicators
- Meetup events: Purple (#8b5cf6)
- Member events: Custom user colors

## 🧪 Testing Checklist

### Feature Testing

- [ ] Create calendar
- [ ] Add members via share code
- [ ] Create personal event
- [ ] Create meetup event
- [ ] Check availability view
- [ ] Mark attendance on past meetup
- [ ] Assign punishments
- [ ] Verify streak updates
- [ ] Test with multiple calendars
- [ ] Test on mobile viewport

### Edge Cases

- [ ] Creating meetup with conflicts
- [ ] Marking same participant twice
- [ ] Deleting events
- [ ] Leaving calendar
- [ ] Invalid share codes
- [ ] Past event attendance
- [ ] Skipping a month (streak reset)
- [ ] Meeting multiple times in one month

## 🐛 Common Issues

**Streak not updating:**
- Check event type is "meetup" not "personal"
- Verify update_calendar_streak function exists
- Check Supabase logs for errors

**Attendance modal not showing:**
- Event must be type "meetup"
- Event end_time must be in the past
- Verify participants exist

**Authentication errors:**
- Check .env.local credentials
- Verify Supabase RLS policies
- Clear browser cookies

## 📝 Code Conventions

### File Naming
- Components: PascalCase (e.g., `EventModal.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Server actions: camelCase (e.g., `createEvent`)

### Component Structure
```tsx
"use client" // If using hooks/state

import { ... } from "..."

interface ComponentProps {
  ...
}

export function Component({ ... }: ComponentProps) {
  // State
  // Handlers
  // Effects
  // Render
}
```

### Server Actions
```typescript
"use server"

export async function actionName(params) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: "Not authenticated" }
  
  // ... action logic
  
  revalidatePath("/calendar")
  return { error: null, data }
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Vercel will auto-deploy
# Set env vars in Vercel dashboard
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Post-Deployment
1. Update Supabase Auth URLs
2. Update OAuth redirect URIs
3. Test authentication flow
4. Verify all features work

## 🔧 Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter

# Database
# Run in Supabase SQL Editor
SELECT * FROM calendar_streaks;
SELECT * FROM event_punishments;

# Clear all data (careful!)
TRUNCATE calendars CASCADE;
```

## 📚 Key Dependencies

- **next**: 16.0.10 - Framework
- **react**: 19.2.0 - UI library
- **@supabase/supabase-js**: latest - Database & auth
- **tailwindcss**: ^4.1.9 - Styling
- **lucide-react**: ^0.454.0 - Icons
- **date-fns**: 4.1.0 - Date utilities
- **sonner**: ^1.7.4 - Toast notifications
- **@radix-ui/**: Various - UI primitives

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

## 📖 Documentation

- **README.md** - Project overview
- **SETUP_GUIDE.md** - Detailed setup
- **FEATURES.md** - Feature descriptions
- **This file** - Developer reference

---

**Happy coding! 🎉**
