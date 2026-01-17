# TESTING GUIDE - Punctuality Punisher Feature

## Prerequisites
- MeetLah! app is running locally or deployed
- You have access to the calendar with multiple users
- You have access to Supabase dashboard (for creating test data)

## Quick Test Setup

### Option 1: Manual UI Testing (Recommended)

#### Step 1: Create a Past Meetup Event
Since we can't create past events through the UI, we need to use the database:

1. Go to Supabase Dashboard → SQL Editor
2. Find your calendar ID and user ID:
```sql
SELECT 
  c.id as calendar_id,
  c.name as calendar_name,
  p.id as user_id,
  p.email
FROM calendars c
JOIN calendar_members cm ON c.id = cm.calendar_id
JOIN profiles p ON cm.user_id = p.id
WHERE p.email = 'your-email@example.com';  -- Replace with your email
```

3. Create a past meetup event:
```sql
-- Save these IDs first
DO $$
DECLARE
  v_calendar_id uuid := 'PASTE_CALENDAR_ID_HERE';
  v_user_id uuid := 'PASTE_USER_ID_HERE';
  v_event_id uuid;
BEGIN
  -- Create the past meetup event
  INSERT INTO events (calendar_id, user_id, title, start_time, end_time, type, location)
  VALUES (
    v_calendar_id,
    v_user_id,
    'Test Lunch Meetup - Yesterday',
    NOW() - INTERVAL '25 hours',  -- Started 25 hours ago
    NOW() - INTERVAL '24 hours',  -- Ended 24 hours ago
    'meetup',
    'Downtown Cafe'
  )
  RETURNING id INTO v_event_id;
  
  -- Create participants for all calendar members
  INSERT INTO meetup_participants (event_id, user_id)
  SELECT v_event_id, user_id
  FROM calendar_members
  WHERE calendar_id = v_calendar_id;
  
  RAISE NOTICE 'Created event ID: %', v_event_id;
END $$;
```

#### Step 2: Test Event Clickability

1. **Refresh the calendar page** in your browser
2. **Navigate to yesterday** (or the day you created the test event)
3. **Verify you see the purple meetup event** "Test Lunch Meetup - Yesterday"
4. **Click on the event** - it should be clickable!

**Expected Result**: 
- ✅ Attendance Modal opens (NOT the regular Event Modal)
- ✅ Modal shows all participants with checkboxes for "On Time" and "Late"
- ✅ Modal title shows "Mark Attendance" or similar

**If it fails**:
- Check browser console for errors
- Verify the event's `end_time` is in the past
- Verify the event `type` is 'meetup'

#### Step 3: Test Attendance Marking

1. In the Attendance Modal, **mark at least one user as "Late"**
2. **Click Save or Submit**
3. **Modal should close**
4. **Page should refresh** (or data should update)

**Expected Result**:
- ✅ Modal closes successfully
- ✅ No errors in console
- ✅ A punishment is automatically assigned to the late user

**Verify in Database**:
```sql
SELECT 
  p.full_name,
  mp.was_late,
  ep.punishment_text,
  ep.completed
FROM meetup_participants mp
JOIN profiles p ON mp.user_id = p.id
LEFT JOIN event_punishments ep ON ep.user_id = mp.user_id 
  AND ep.event_id = mp.event_id
WHERE mp.event_id = 'YOUR_EVENT_ID';  -- Replace with your test event ID
```

#### Step 4: Test Punishment Card Display

1. **Look at the sidebar** (left side of screen)
2. **Find the "Punishments" card** (should be below "Streak Tracker")

**Expected Result**:
- ✅ Punishment Card is visible
- ✅ Card has yellow/orange border (indicating pending punishment)
- ✅ Shows message "You have X pending punishment(s)"
- ✅ Lists the punishment text (e.g., "Buy everyone bubble tea 🧋")
- ✅ Shows "Mark Done" button

**If card doesn't show**:
- Verify you're logged in as the user who was marked late
- Check that punishment was actually created in database
- Check browser console for errors
- Verify `currentUserId` matches the late user's ID

#### Step 5: Test Punishment Completion

1. **Click "Mark Done"** on one of your pending punishments
2. **Wait for confirmation/refresh**

**Expected Result**:
- ✅ Button shows loading state
- ✅ Punishment moves to "Completed" section
- ✅ Shows checkmark icon
- ✅ Shows completion date
- ✅ No longer has yellow border
- ✅ Text is grayed out or crossed out

**Verify in Database**:
```sql
SELECT 
  punishment_text,
  completed,
  completed_at
FROM event_punishments
WHERE user_id = 'YOUR_USER_ID'
ORDER BY assigned_at DESC;
```

#### Step 6: Test Multi-User Scenarios

**As User A:**
1. Mark User B as late in a past event
2. Verify User B gets a punishment

**As User B:**
1. Login and check sidebar
2. Should see the punishment assigned by User A

**As User C:**
1. Click on the same past event
2. Can change User B's attendance status (anti-cheat feature)
3. Or can mark themselves as late

### Option 2: Automated Database Testing

Run the verification queries in `database_verification.sql`:

```bash
# In your Supabase SQL Editor, run each query section:
1. Check past events
2. Check participants
3. Check punishments
4. Check pending counts
```

## Common Issues and Solutions

### Issue: "Past event is not clickable"
**Solutions**:
- Verify event `type = 'meetup'` in database
- Verify `end_time < NOW()` in database
- Check browser console for JavaScript errors
- Verify `initialEvents` has the event data
- Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: "Punishment card doesn't show"
**Solutions**:
- Verify punishment exists: `SELECT * FROM event_punishments WHERE user_id = 'YOUR_USER_ID'`
- Verify you're logged in as the correct user
- Check that `allPunishments` array has data (React DevTools)
- Verify `punishments` prop is being passed to Sidebar
- Check browser console for errors

### Issue: "Attendance modal doesn't have participants"
**Solutions**:
- Verify participants exist: `SELECT * FROM meetup_participants WHERE event_id = 'EVENT_ID'`
- Check that data transformation is correct in `page.tsx`
- Verify database query includes `meetup_participants` join
- Check RLS policies allow reading participants

### Issue: "Cannot mark punishment as complete"
**Solutions**:
- Verify RLS policy allows updates to `event_punishments`
- Check that `completePunishment` action is working
- Verify user is logged in
- Check browser console for errors
- Verify `onCompletePunishment` handler is connected

### Issue: "Modal doesn't close after saving"
**Solutions**:
- Check browser console for errors
- Verify action (markAttendance) completes successfully
- Check that `router.refresh()` is called
- Verify modal state is properly reset

## Expected User Flow

```
1. User creates/joins a calendar ✅
2. Multiple meetups are scheduled ✅
3. A meetup ends (becomes past event) ✅
4. Any user clicks on the past meetup ✅
5. Attendance Modal opens ✅
6. User marks who was late/on time ✅
7. Late users get random punishments assigned ✅
8. Punishment Card shows in sidebar ✅
9. Late user sees their punishment ✅
10. Late user marks punishment complete ✅
11. Punishment moves to completed section ✅
12. All data persists across refreshes ✅
```

## Testing Checklist

- [ ] Past meetup events are clickable in Month view
- [ ] Past meetup events are clickable in Week view
- [ ] Past meetup events are clickable in Day view
- [ ] Clicking past meetup opens Attendance Modal (not Event Modal)
- [ ] Future meetups open Event Modal (not Attendance Modal)
- [ ] Personal events open Event Modal
- [ ] Attendance Modal shows all participants
- [ ] Can mark users as late/on time
- [ ] Other users can change attendance (anti-cheat)
- [ ] Punishment auto-assigned when user marked late
- [ ] Random punishment selected from list
- [ ] Punishment Card shows in sidebar
- [ ] Yellow border when pending punishments
- [ ] "Mark Done" button works
- [ ] Completed punishments show with checkmark
- [ ] All punishments completed shows success message
- [ ] "View all group punishments" works
- [ ] Data persists after page refresh
- [ ] Mobile responsive (punishment card, modals)

## Performance Testing

1. **Test with 10+ past events** - verify loading time
2. **Test with 20+ punishments** - verify card performance
3. **Test with 10+ users** - verify attendance modal performance
4. **Test rapid clicking** - verify no duplicate punishments created
5. **Test concurrent users** - two users marking attendance at same time

## Security Testing

1. **Try to complete someone else's punishment** - should fail
2. **Try to mark attendance without being calendar member** - should fail
3. **Try to delete event_punishments directly** - RLS should prevent
4. **Verify RLS policies are enabled** on all tables
5. **Check that sensitive data isn't exposed** in client-side code

## Success Criteria

The feature is working correctly when:

✅ All past meetup events are clickable
✅ Attendance Modal opens for past meetups only
✅ Punishments are automatically assigned to late users
✅ Punishment Card displays correctly in sidebar
✅ Users can mark punishments as complete
✅ All data persists correctly
✅ No console errors
✅ Anti-cheat measures work (others can change attendance)
✅ Mobile responsive
✅ Performance is acceptable

## Need Help?

If issues persist:
1. Check `PUNCTUALITY_PUNISHER_FIX.md` for detailed fix information
2. Run database verification queries
3. Check browser console for errors
4. Verify database RLS policies
5. Check Supabase logs for server errors

Good luck testing! 🎉
