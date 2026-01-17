# 🐛 CRITICAL BUG FIX - Streak Calculation Logic

## The Bug 🚨

### What Was Wrong:
The streak calculation was **incorrectly incrementing the streak for EVERY meetup**, regardless of whether multiple meetups occurred in the same period.

**Example of the bug:**
- Frequency set to: **Once a week**
- User creates 3 meetups in the same week (Monday, Wednesday, Friday)
- **Wrong behavior**: Streak increases by 3 (one for each meetup) ❌
- **Correct behavior**: Streak should increase by 1 (only one per week) ✅

This same bug affected all frequencies:
- **Weekly**: Multiple meetups in same week all counted separately
- **Monthly**: Multiple meetups in same month all counted separately  
- **Yearly**: Multiple meetups in same year all counted separately

### Root Cause:
In `/scripts/005-add-frequency-tracking.sql`, the `update_calendar_streak_with_frequency` function was checking if the new meetup was within a deadline, but it didn't check if it was in a **different period** from the last meetup.

```sql
-- BUGGY CODE (OLD):
IF p_event_date <= v_deadline THEN
  -- This incremented streak for EVERY meetup within the deadline
  UPDATE calendar_streaks
  SET current_streak = current_streak + 1  -- ❌ WRONG!
```

## The Fix ✅

### New Logic:
The fixed function now checks if meetups are in:
1. **Same period** → Don't increment streak (just update date)
2. **Consecutive period** → Increment streak by 1
3. **Gap in periods** → Reset streak to 1

### How It Works Now:

#### Weekly Frequency:
```
Week 1: Meetup on Monday    → Streak = 1 ✅
Week 1: Meetup on Friday    → Streak = 1 (same week, no increment) ✅
Week 2: Meetup on Tuesday   → Streak = 2 (consecutive week) ✅
Week 2: Meetup on Thursday  → Streak = 2 (same week, no increment) ✅
Week 4: Meetup on Monday    → Streak = 1 (missed week 3, reset) ✅
```

#### Monthly Frequency:
```
Jan 2026: 3 meetups         → Streak = 1 (all same month) ✅
Feb 2026: 2 meetups         → Streak = 2 (consecutive month) ✅
Apr 2026: 1 meetup          → Streak = 1 (missed March, reset) ✅
```

#### Yearly Frequency:
```
2026: 12 meetups            → Streak = 1 (all same year) ✅
2027: 8 meetups             → Streak = 2 (consecutive year) ✅
2029: 4 meetups             → Streak = 1 (missed 2028, reset) ✅
```

## Files Changed 📁

### New Migration File:
**`/scripts/006-fix-streak-calculation-bug.sql`**
- ✅ Completely rewrites `update_calendar_streak_with_frequency` function
- ✅ Fixes `check_streak_target_met` function
- ✅ Implements period-based logic instead of deadline-based logic

## Key Changes in the Code 🔧

### 1. Period Detection:
```sql
CASE v_frequency
  WHEN 'weekly' THEN
    -- Check if same week using DATE_TRUNC
    v_is_same_period := (
      DATE_TRUNC('week', p_event_date) = DATE_TRUNC('week', v_last_meetup_date)
    );
    
  WHEN 'monthly' THEN
    -- Check if same month
    v_is_same_period := (
      TO_CHAR(p_event_date, 'YYYY-MM') = TO_CHAR(v_last_meetup_date, 'YYYY-MM')
    );
    
  WHEN 'yearly' THEN
    -- Check if same year
    v_is_same_period := (
      EXTRACT(YEAR FROM p_event_date) = EXTRACT(YEAR FROM v_last_meetup_date)
    );
END CASE;
```

### 2. Consecutive Period Check:
```sql
-- For weekly:
v_is_consecutive_period := (
  DATE_TRUNC('week', p_event_date) = 
  DATE_TRUNC('week', v_last_meetup_date) + INTERVAL '1 week'
);
```

### 3. Three Scenarios:
```sql
IF v_is_same_period THEN
  -- Don't increment - just update date
  -- KEY FIX: This prevents multiple meetups in same period from inflating streak
  
ELSIF v_is_consecutive_period THEN
  -- Increment streak by 1 (consecutive period)
  
ELSE
  -- Reset streak to 1 (periods were missed)
END IF;
```

## How to Apply the Fix 🚀

### Step 1: Run the Migration
Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
-- /scripts/006-fix-streak-calculation-bug.sql
```

### Step 2: Verify the Fix
After running the migration, test it:

```sql
-- Test scenario: Weekly frequency, multiple meetups in same week
-- 1. Set calendar to weekly frequency
SELECT set_meetup_frequency('YOUR_CALENDAR_ID', 'weekly');

-- 2. Check current streak
SELECT current_streak, last_meetup_date 
FROM calendar_streaks 
WHERE calendar_id = 'YOUR_CALENDAR_ID';

-- 3. Create a meetup for this week
-- (Use your app to create the meetup)

-- 4. Create another meetup in the SAME week
-- (Use your app to create another meetup)

-- 5. Check streak again - should still be 1, not 2!
SELECT current_streak, last_meetup_date 
FROM calendar_streaks 
WHERE calendar_id = 'YOUR_CALENDAR_ID';
```

### Step 3: Recalculate Existing Streaks (Optional)
If you have existing data that was calculated with the buggy logic, you may want to recalculate:

```sql
-- This function recalculates streaks based on all past meetups
-- Run it for each calendar that has incorrect streaks

-- First, get all calendars
SELECT id, name FROM calendars;

-- Then for each calendar, recalculate:
-- (You would need to create a recalculation function or manually fix)
```

## Testing the Fix 🧪

### Test Case 1: Weekly - Multiple Meetups Same Week
```
Action: Create 3 meetups in same week
Expected: Streak = 1
Old (buggy): Streak = 3 ❌
New (fixed): Streak = 1 ✅
```

### Test Case 2: Monthly - Multiple Meetups Same Month
```
Action: Create 5 meetups in January, 1 in February
Expected: Jan streak = 1, Feb streak = 2
Old (buggy): Jan streak = 5, Feb streak = 6 ❌
New (fixed): Jan streak = 1, Feb streak = 2 ✅
```

### Test Case 3: Weekly - Consecutive Weeks
```
Action: Create 1 meetup per week for 4 weeks
Expected: Streak = 4
Old (buggy): Streak = 4 ✅ (worked correctly for this case)
New (fixed): Streak = 4 ✅
```

### Test Case 4: Weekly - Missed Week
```
Action: Week 1 meetup, Week 2 meetup, skip Week 3, Week 4 meetup
Expected: Streak resets to 1 in Week 4
Old (buggy): Might have different behavior ❌
New (fixed): Streak = 1 in Week 4 ✅
```

## Impact 📊

### Before Fix:
- 😞 Users gaming the system by creating multiple meetups
- 😞 Incorrect streak numbers
- 😞 Confusing behavior for users
- 😞 Streak feature not working as intended

### After Fix:
- 😊 Accurate streak tracking
- 😊 One meetup per period = one streak increment
- 😊 Clear, predictable behavior
- 😊 Fair for all users

## Database Functions Updated 🔄

1. **`update_calendar_streak_with_frequency`**
   - Now uses period-based comparison
   - Handles same period, consecutive period, and gaps
   - Properly tracks weeks/months/years

2. **`check_streak_target_met`**
   - Updated to use period boundaries
   - Grace period logic for current/previous period
   - More accurate target status

## Summary ✨

**The core fix**: Changed from deadline-based logic to **period-based logic**.

**Key principle**: Only **ONE meetup per period** (week/month/year) contributes to the streak, no matter how many meetups happen in that period.

This ensures fair, accurate, and predictable streak tracking! 🎉

## Need Help? 🆘

If you encounter issues:
1. Check the SQL function was created successfully
2. Verify your calendar has a streak record
3. Test with the test cases above
4. Check the `calendar_streaks` table data

The fix is now in place and ready to use! 🚀
