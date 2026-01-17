# 🚨 QUICK FIX GUIDE - Issues #1 & #2

## ⚡ Both Issues Fixed!

### Issue #1: Frequency Not Saving ✅
### Issue #2: Can't Click Meetups ✅

---

## 🔧 What You Need To Do

### Step 1: Run Database Migration (REQUIRED!)

Open Supabase SQL Editor and run:

```sql
-- Copy/paste entire contents of this file:
/scripts/005-add-frequency-tracking.sql
```

Click **RUN** ▶️

You should see: ✅ Success

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
pnpm dev
```

### Step 3: Test!

Done! Both issues are now fixed.

---

## 🧪 Quick Tests

### Test Issue #1 Fix:
1. Create calendar (you're owner)
2. Click "Set Meetup Goal" ⚙️
3. Choose "📅 Once a Week"
4. Click "Save Goal"
5. ✅ No error!
6. Create a meetup
7. ✅ Streak shows "1"
8. ✅ House is perfect (bright blue)

### Test Issue #2 Fix:
1. Create a meetup (future date)
2. Click on it in the calendar
3. ✅ Modal opens!
4. ✅ Shows "Meetup Event" badge
5. ✅ Shows details (time, location)
6. ✅ View-only (no edit buttons)

---

## 📋 What Was Fixed

### Issue #1: Frequency Saving
**Problem:** Used wrong database function  
**Fix:** Now uses `update_calendar_streak_with_frequency`  
**Files:** `lib/actions/calendar.ts`, `calendar-app.tsx`

### Issue #2: Meetup Click
**Problem:** Meetups not treated as view-only  
**Fix:** Force meetups to always be view-only  
**Files:** `components/calendar/event-modal.tsx`

---

## ⚠️ IMPORTANT

**You MUST run the database migration!**

Without it:
- ❌ Frequency won't save
- ❌ Streak won't update
- ❌ House won't change

With it:
- ✅ Everything works!

---

## 🆘 If Something's Wrong

### Frequency still not saving?
1. Check Supabase SQL Editor - did migration run?
2. Check browser console (F12) - any errors?
3. Try setting frequency again

### Can't click meetups?
1. Did you restart dev server?
2. Clear browser cache (Cmd+Shift+R)
3. Try in incognito mode

### Still broken?
Check the full guide: `FIXES_ISSUES_1_AND_2.md`

---

**Quick Reminder:**
1. ✅ Run SQL migration
2. ✅ Restart server
3. ✅ Test it out!

Both issues are fixed! 🎉
