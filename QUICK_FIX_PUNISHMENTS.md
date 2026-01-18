# Quick Fix Guide - Punishment Assignment Error

## 🚨 The Problem
Getting this error when assigning punishments:
```
Failed to assign punishment: "new row violates row-level security policy for table 'event_punishments'"
```

## ✅ The Solution (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Click on your MeetLah! project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Fix
1. Click **"New Query"**
2. Copy the code below and paste it:

```sql
-- Fix RLS policy for event_punishments to allow calendar members to assign punishments

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Event creators can assign punishments" ON event_punishments;

-- Create new policy that allows calendar members to assign punishments
CREATE POLICY "Calendar members can assign punishments" ON event_punishments
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
    )
  );

-- Also update the delete policy to allow calendar members to delete punishments
DROP POLICY IF EXISTS "Event creators can delete punishments" ON event_punishments;

CREATE POLICY "Calendar members can delete punishments" ON event_punishments
  FOR DELETE USING (
    event_id IN (
      SELECT e.id FROM events e
      WHERE e.calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
    )
  );
```

3. Click **"Run"** (or press Ctrl/Cmd + Enter)
4. Wait for "Success. No rows returned" message

### Step 3: Test It
1. Go back to your MeetLah! app
2. Refresh the page
3. Try assigning punishments again - it should work now! 🎉

## 🤔 What This Does
- Before: Only the person who created the meetup could assign punishments
- After: **Any calendar member** can assign punishments to late participants

This makes sense because in a shared calendar, any member should be able to manage punctuality, not just the event creator.

## Need Help?
If you see any errors:
1. Make sure you're in the correct Supabase project
2. Check that all previous migrations have been run
3. See `/scripts/PUNISHMENT_FIX_README.md` for detailed troubleshooting
