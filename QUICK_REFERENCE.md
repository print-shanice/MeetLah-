# MeetLah! Quick Reference Card

## 🚀 Quick Start
```bash
cd /Users/shanice/Downloads/MatchLah!
pnpm install
cp .env.local.example .env.local
# Add Supabase credentials to .env.local
pnpm dev
```

## 📋 Supabase Setup Checklist
- [ ] Create Supabase project
- [ ] Copy Project URL → .env.local
- [ ] Copy anon key → .env.local  
- [ ] Run scripts/001-create-tables.sql
- [ ] Run scripts/002-fix-profile-trigger.sql
- [ ] Run scripts/003-fix-rls-recursion.sql
- [ ] Run scripts/004-add-streaks-and-punctuality.sql
- [ ] Enable Google OAuth provider
- [ ] Enable Facebook OAuth provider (optional)

## 🎯 Core Features
| Feature | Description | Location |
|---------|-------------|----------|
| Shared Calendars | Create & join calendars | Sidebar dropdown |
| Personal Events | Add your schedule | Click any date |
| Meetup Events | Plan group gatherings | "Create Meetup" button |
| Availability | Find free times | "Check Availability" |
| Streak Tracking | Monthly meetup counter | Sidebar (top) |
| Attendance | Mark who was late | Click past meetup |
| Punishments | Fun consequences | Auto after attendance |

## 📁 Important Files
| File | Purpose |
|------|---------|
| `/app/calendar/[id]/page.tsx` | Calendar page |
| `/components/calendar-app.tsx` | Main component |
| `/lib/actions/calendar.ts` | Server actions |
| `/lib/types.ts` | TypeScript types |
| `/scripts/*.sql` | Database migrations |

## 🔑 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 💻 Useful Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production  
pnpm start        # Start production
pnpm lint         # Run linter
pnpm type-check   # Check TypeScript
```

## 🗄️ Database Tables
| Table | Purpose |
|-------|---------|
| profiles | User accounts |
| calendars | Shared calendars |
| calendar_members | Calendar membership |
| calendar_streaks | Monthly streak data |
| events | Personal & meetup events |
| meetup_participants | Who's in each meetup |
| event_punishments | Assigned punishments |

## 🎨 New Components (v2)
| Component | File |
|-----------|------|
| `<AttendanceModal>` | attendance-modal.tsx |
| `<PunishmentModal>` | attendance-modal.tsx |
| `<StreakDisplay>` | streak-display.tsx |

## 🔧 New Server Actions
```typescript
markAttendance(participantId, wasLate)
assignPunishment(eventId, userId, text)
completePunishment(punishmentId)
```

## 📖 Documentation
| File | For |
|------|-----|
| README.md | Everyone - Overview |
| SETUP_GUIDE.md | Setup instructions |
| FEATURES.md | Users - How to use |
| DEVELOPER_GUIDE.md | Developers - Code ref |
| CHANGELOG.md | What changed |

## 🐛 Troubleshooting
| Issue | Solution |
|-------|----------|
| Not authenticated | Check .env.local |
| Can't sign in | Verify OAuth setup |
| Events not showing | Refresh page |
| Streak not updating | Check event type is "meetup" |

## 🚢 Deploy to Vercel
1. Push to GitHub
2. Import on Vercel
3. Add env vars
4. Update Supabase auth URLs
5. Update OAuth redirect URIs

## 🎮 Punishment Examples
- Buy everyone bubble tea 🧋
- Do 20 push-ups 💪
- Sing a song 🎤
- Share embarrassing story 😳
- Dance for 30 seconds 💃
- Post embarrassing photo 📸
- _+ 14 more!_

## 🏆 Achievement Badges
| Badge | Requirement |
|-------|-------------|
| 🥉 3-Month Warrior | 3+ month streak |
| 🥈 Half-Year Hero | 6+ month streak |
| 🥇 Year-Long Legend | 12+ month streak |
| 💎 2-Year Champion | 24+ month streak |
| 📈 Record Holder | Current = Longest |

## 📱 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔗 Useful Links
- Supabase: https://app.supabase.com
- Google OAuth: https://console.cloud.google.com
- Facebook OAuth: https://developers.facebook.com
- Vercel: https://vercel.com

## 📊 Key Numbers
- **20+** punishment options
- **5** achievement badges
- **7** database tables
- **3** calendar views
- **2** auth providers
- **1** awesome app! 🎉

## ✅ Testing Checklist
- [ ] Create calendar
- [ ] Share & join calendar
- [ ] Add personal event
- [ ] Create meetup
- [ ] Check availability
- [ ] Mark attendance
- [ ] Assign punishment
- [ ] Verify streak update
- [ ] Test mobile view
- [ ] Deploy to Vercel

---

**Need help?** Check the full docs:
- SETUP_GUIDE.md for setup
- FEATURES.md for features  
- DEVELOPER_GUIDE.md for code

**Ready to go?** `pnpm dev` 🚀
