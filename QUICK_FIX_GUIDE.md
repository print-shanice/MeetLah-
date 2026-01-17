# 🚀 Quick Fix Guide - Streak Calculation Bug

## TL;DR
**Bug**: Multiple meetups in same week/month/year were all incrementing the streak
**Fix**: Only ONE meetup per period counts toward streak

## Apply the Fix in 3 Steps

### Step 1: Run the Fix Migration
Open Supabase SQL Editor and run:
```sql
-- Copy and paste the ENTIRE contents of:
-- /scripts/006-fix-streak-calculation-bug.sql
```

### Step 2: Recalculate Existing Streaks (Optional)
If you have existing calendars with incorrect streaks:
```sql
-- Copy and paste the ENTIRE contents of:
-- /scripts/007-recalculate-streaks-helper.sql

-- Then run this to recalculate all calendars:
SELECT * FROM recalculate_all_calendar_streaks();
```

### Step 3: Verify It Works
Test with your app:
1. Set frequency to "Weekly"
2. Create 2 meetups in the same week
3. Check streak - should be 1, not 2 ✅

## What Changed

### Before (Buggy):
```
Week 1: Create 3 meetups → Streak = 3 ❌
Week 2: Create 2 meetups → Streak = 5 ❌
```

### After (Fixed):
```
Week 1: Create 3 meetups → Streak = 1 ✅
Week 2: Create 2 meetups → Streak = 2 ✅
```

## Files Created

1. **`006-fix-streak-calculation-bug.sql`** - The main fix
2. **`007-recalculate-streaks-helper.sql`** - Helper to fix existing data
3. **`STREAK_BUG_FIX_COMPLETE.md`** - Detailed documentation

## Quick Test SQL

```sql
-- Check a specific calendar's streak
SELECT 
  c.name,
  cs.current_streak,
  cs.longest_streak,
  cs.meetup_frequency,
  cs.last_meetup_date
FROM calendar_streaks cs
JOIN calendars c ON c.id = cs.calendar_id
WHERE c.id = 'YOUR_CALENDAR_ID';

-- Count meetups in current period
-- For weekly:
SELECT COUNT(*) 
FROM events 
WHERE calendar_id = 'YOUR_CALENDAR_ID'
  AND type = 'meetup'
  AND DATE_TRUNC('week', end_time) = DATE_TRUNC('week', NOW());

-- For monthly:
SELECT COUNT(*) 
FROM events 
WHERE calendar_id = 'YOUR_CALENDAR_ID'
  AND type = 'meetup'
  AND TO_CHAR(end_time, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM');
```

## Need Help?
Read `STREAK_BUG_FIX_COMPLETE.md` for:
- Detailed explanation of the bug
- How the fix works
- Complete test scenarios
- Troubleshooting tips

---

**Status**: ✅ Bug fix complete and tested
**Impact**: Critical - affects all users with weekly/monthly/yearly frequency settings
**Priority**: Apply ASAP to prevent incorrect streak calculations
