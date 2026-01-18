# Punishment RLS Policy Fix

## Problem
When trying to assign punishments to users who were late for meetup events, you encountered this error:
```
Failed to assign punishment: "new row violates row-level security policy for table 'event_punishments'"
```

## Root Cause
The Row Level Security (RLS) policy on the `event_punishments` table was too restrictive. The original policy only allowed the event **creator** to assign punishments:

```sql
CREATE POLICY "Event creators can assign punishments" ON event_punishments
  FOR INSERT WITH CHECK (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );
```

This meant that only the user who created a meetup event could assign punishments, but in a shared calendar, **any member** should be able to assign punishments for late participants.

## Solution
Updated the RLS policy to allow **any calendar member** to assign and delete punishments for events in calendars they belong to.

## How to Apply the Fix

### Option 1: Manual Application (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your MeetLah! project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy the entire contents of `scripts/008-fix-punishment-rls-policy.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** or press Ctrl/Cmd + Enter
7. You should see "Success. No rows returned"

### Option 2: Using the Script (If configured)

If you have the Supabase service role key configured:

```bash
node scripts/apply-punishment-fix.js
```

## What Changed

### Old Policy (Restrictive):
- Only event creators could assign punishments
- Only event creators could delete punishments

### New Policy (Collaborative):
- **Any calendar member** can assign punishments to late participants
- **Any calendar member** can delete punishments
- Users can still only update their own punishment completion status

## SQL Changes

The migration does the following:

1. **Drops the old INSERT policy:**
   ```sql
   DROP POLICY IF EXISTS "Event creators can assign punishments" ON event_punishments;
   ```

2. **Creates new INSERT policy for calendar members:**
   ```sql
   CREATE POLICY "Calendar members can assign punishments" ON event_punishments
     FOR INSERT WITH CHECK (
       event_id IN (
         SELECT e.id FROM events e
         WHERE e.calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
       )
     );
   ```

3. **Updates DELETE policy:**
   ```sql
   DROP POLICY IF EXISTS "Event creators can delete punishments" ON event_punishments;
   
   CREATE POLICY "Calendar members can delete punishments" ON event_punishments
     FOR DELETE USING (
       event_id IN (
         SELECT e.id FROM events e
         WHERE e.calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
       )
     );
   ```

## Testing the Fix

After applying the fix:

1. Create a meetup event with multiple participants
2. Have any calendar member (not just the event creator) try to assign punishments
3. The punishment should be assigned successfully without RLS errors

## Security Considerations

This change maintains security because:
- Users can only assign punishments in calendars they are members of
- Users can only modify (complete) their own punishments
- The policy uses the `get_user_calendar_ids()` security definer function to avoid RLS recursion
- Non-members cannot assign punishments to events they don't have access to

## Rollback (If Needed)

If you need to revert to the old behavior:

```sql
-- Restore original restrictive policy
DROP POLICY IF EXISTS "Calendar members can assign punishments" ON event_punishments;

CREATE POLICY "Event creators can assign punishments" ON event_punishments
  FOR INSERT WITH CHECK (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Calendar members can delete punishments" ON event_punishments;

CREATE POLICY "Event creators can delete punishments" ON event_punishments
  FOR DELETE USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );
```
