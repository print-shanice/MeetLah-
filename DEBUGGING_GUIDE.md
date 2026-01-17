# DEBUGGING GUIDE - Immediate Steps

## Step 1: Check Console Output

1. Open your MeetLah! app in the browser
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to the Console tab
4. Look for these debug messages:

```
=== PUNISHMENT DEBUG ===
Initial events count: X
All punishments extracted: X
Current user ID: ...
User punishments: [...]
========================
```

**What to check:**
- Are there any events? (events count > 0)
- Are there any punishments? (punishments extracted > 0)
- Does your user have punishments? (User punishments array length)

## Step 2: Click on a Past Event

1. Find a meetup event that has ended (purple color)
2. Click on it
3. Watch the console for:

```
=== EVENT CLICK DEBUG ===
Clicked event: {...}
Event type: meetup
Is past?: true
Opening Attendance Modal
========================
```

**What to check:**
- Does the click register? (You should see the debug output)
- Is "Event type" showing "meetup"?
- Is "Is past?" showing "true"?
- Does it say "Opening Attendance Modal" or "Opening Event Modal"?

## Step 3: Check if Events Exist

Run this in your browser console:

```javascript
// Check if there are any events on the page
document.querySelectorAll('[class*="rounded"]').forEach(el => {
  if (el.textContent && el.textContent.length < 50) {
    console.log('Found element:', el.textContent, el);
  }
});
```

## Step 4: Check Database

In Supabase SQL Editor, run:

```sql
-- Check for past meetup events
SELECT 
  id,
  title,
  type,
  end_time,
  end_time < NOW() as is_past
FROM events
WHERE type = 'meetup'
ORDER BY end_time DESC
LIMIT 5;

-- Check for punishments
SELECT 
  ep.*,
  p.full_name as user_name
FROM event_punishments ep
JOIN profiles p ON ep.user_id = p.id
ORDER BY assigned_at DESC
LIMIT 10;
```

## Step 5: Create Test Data

If you don't have any past events, create one:

```sql
-- Get your calendar and user IDs
SELECT 
  c.id as calendar_id,
  p.id as user_id,
  p.email
FROM calendars c
JOIN calendar_members cm ON c.id = cm.calendar_id
JOIN profiles p ON cm.user_id = p.id
WHERE p.email = 'YOUR_EMAIL@example.com';  -- Replace with your email

-- Then create a past event (use the IDs from above)
DO $$
DECLARE
  v_calendar_id uuid := 'PASTE_CALENDAR_ID_HERE';
  v_user_id uuid := 'PASTE_USER_ID_HERE';
  v_event_id uuid;
BEGIN
  -- Create past meetup
  INSERT INTO events (calendar_id, user_id, title, start_time, end_time, type, location)
  VALUES (
    v_calendar_id,
    v_user_id,
    'Test Past Meetup',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    'meetup',
    'Test Location'
  )
  RETURNING id INTO v_event_id;
  
  -- Create participants
  INSERT INTO meetup_participants (event_id, user_id)
  SELECT v_event_id, user_id
  FROM calendar_members
  WHERE calendar_id = v_calendar_id;
  
  RAISE NOTICE 'Created event ID: %', v_event_id;
END $$;
```

## Step 6: Create Test Punishment

To test the punishment card:

```sql
-- Get an event ID and user ID
SELECT 
  e.id as event_id,
  p.id as user_id,
  p.full_name
FROM events e
CROSS JOIN profiles p
WHERE e.type = 'meetup'
  AND p.email = 'YOUR_EMAIL@example.com'  -- Replace with your email
LIMIT 1;

-- Create a test punishment (use IDs from above)
INSERT INTO event_punishments (event_id, user_id, punishment_text, completed)
VALUES (
  'EVENT_ID_HERE',
  'USER_ID_HERE',
  'Buy everyone bubble tea next meetup 🧋',
  false
);
```

## Step 7: Verify Punishment Card

After creating the punishment:

1. Refresh the page
2. Check console for:
```
=== PUNISHMENT DEBUG ===
All punishments extracted: 1  <-- Should be > 0
User punishments: [...]       <-- Should show your punishment
```

3. Look at the sidebar
4. You should see the Punishment Card with a yellow border

## Common Issues & Fixes

### Issue: "Events are not clickable"

**Check:**
1. Console shows "EVENT CLICK DEBUG" when clicking? 
   - NO → Event click handler not firing (CSS/z-index issue)
   - YES → Continue to next check

2. Console shows "Is past?: true"?
   - NO → Event is not in the past, create a past event
   - YES → Continue to next check

3. Console shows "Opening Attendance Modal"?
   - NO → Check event type, should be "meetup"
   - YES → Modal should open

### Issue: "Punishment card not showing"

**Check:**
1. Console shows "All punishments extracted: X" where X > 0?
   - NO → No punishments in database, create one
   - YES → Continue to next check

2. Console shows your punishment in "User punishments: [...]"?
   - NO → Punishment exists but not for your user
   - YES → Should show in sidebar

3. Check React DevTools:
   - Find `PunishmentCard` component
   - Check props: `punishments` should have data

### Issue: "Modal doesn't open"

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Check if `showAttendanceModal` state is true (React DevTools)

## Expected Console Output

When everything is working:

```
=== PUNISHMENT DEBUG ===
Initial events count: 5
All punishments extracted: 2
Current user ID: abc-123-def
User punishments: [{id: "...", punishment_text: "Buy bubble tea", ...}]
========================

[Click on past event]

=== EVENT CLICK DEBUG ===
Clicked event: {id: "...", title: "Test Past Meetup", type: "meetup", ...}
Event type: meetup
Event end date: [Date object]
Current time: [Date object]
Is past?: true
Found original event: {id: "...", ...}
Original event type: meetup
Has ended?: true
Opening Attendance Modal
========================
```

## Need More Help?

If after following all steps above it still doesn't work:

1. Screenshot the console output
2. Screenshot the sidebar (to show if punishment card is there)
3. Run the database queries and screenshot results
4. Check browser network tab for any failed requests
5. Share the error messages

The debug logs I added will help us pinpoint exactly where the issue is!
