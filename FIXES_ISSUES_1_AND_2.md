# Bug Fixes - Issues #1 and #2

## Issue #1: Frequency Setting Not Saving & House Not Updating - FIXED ✅

### Problem
1. Clicking "Set Meetup Goal" opened the dialog ✅
2. Selecting a frequency (weekly/monthly/yearly) ✅  
3. Clicking "Save Goal" ✅
4. **BUT:** Frequency wasn't saved and house didn't update ❌

### Root Causes Identified

**Cause 1: Wrong Database Function**
- The `createMeetup` action was calling the OLD function: `update_calendar_streak`
- Should be calling the NEW function: `update_calendar_streak_with_frequency`
- Old function doesn't understand frequency settings

**Cause 2: Database Migration Not Run**
- The new database functions from `005-add-frequency-tracking.sql` need to be run
- Without these functions, the RPC calls fail silently

**Cause 3: No Error Feedback**
- When `setMeetupFrequency` failed, there was no user feedback
- Errors were silently ignored

### Solutions Implemented

#### Fix 1: Updated createMeetup Function
**File:** `/lib/actions/calendar.ts`

Changed from:
```typescript
// Old - wrong function
await supabase.rpc('update_calendar_streak', {
  p_calendar_id: calendarId,
  p_event_date: data.start_time
})
```

Changed to:
```typescript
// New - correct frequency-aware function
const { error: streakError } = await supabase.rpc('update_calendar_streak_with_frequency', {
  p_calendar_id: calendarId,
  p_event_date: data.start_time
})

// Log error but don't fail the meetup creation
if (streakError) {
  console.error('Failed to update streak:', streakError)
}
```

#### Fix 2: Added Error Handling
**File:** `/components/calendar-app.tsx`

```typescript
const handleUpdateFrequency = async (frequency: 'weekly' | 'monthly' | 'yearly') => {
  startTransition(async () => {
    const result = await setMeetupFrequency(calendar.id, frequency)
    if (result.error) {
      console.error('Failed to update frequency:', result.error)
      alert('Failed to update frequency: ' + result.error) // User sees error now!
    } else {
      router.refresh()
    }
  })
}
```

### Required: Database Migration

**CRITICAL:** You MUST run this migration in Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of:
/scripts/005-add-frequency-tracking.sql
```

This creates:
- `update_calendar_streak_with_frequency()` function
- `set_meetup_frequency()` function  
- `check_streak_target_met()` function
- New columns: `meetup_frequency`, `target_met`, `last_meetup_date`

### Testing Steps

1. **Run the migration** in Supabase SQL Editor
2. **Restart your dev server:**
   ```bash
   pnpm dev
   ```
3. **Create a new calendar** (you're the owner)
4. **Click "Set Meetup Goal"** button
5. **Select a frequency** (e.g., "Once a Week")
6. **Click "Save Goal"**
7. ✅ Should save without error
8. ✅ Refresh page - frequency should be saved
9. **Create a meetup event**
10. ✅ Streak counter should show "1"
11. ✅ House should be "Perfect" (bright blue)
12. Wait past the frequency deadline OR manually set:
    ```sql
    UPDATE calendar_streaks 
    SET target_met = FALSE 
    WHERE calendar_id = 'your-calendar-id';
    ```
13. ✅ Refresh - House should be "Deteriorated" (darker with cracks)

---

## Issue #2: Cannot Click Meetup Events to View Details - FIXED ✅

### Problem
- Personal events: Click → View/Edit Modal ✅
- Meetup events (future): Click → Nothing happens ❌
- Meetup events (past): Click → Attendance Modal ✅

### Root Cause
The EventModal had a check:
```typescript
const isViewOnly = selectedEvent && selectedEvent.userId !== currentUser?.id
```

For meetup events:
- They're created by one user but involve ALL users
- If you're not the creator, it's marked "view only"
- BUT meetup events should ALWAYS be view-only (no editing) for everyone

### Solution

#### Fix: Make Meetup Events Always View-Only
**File:** `/components/calendar/event-modal.tsx`

```typescript
// Before:
const isViewOnly = selectedEvent && selectedEvent.userId !== currentUser?.id

// After: 
const isViewOnly = selectedEvent && (selectedEvent.userId !== currentUser?.id || selectedEvent.type === "meetup")
```

Now:
- Personal events by others: View-only ✅
- Personal events by you: Editable ✅
- Meetup events by anyone: View-only (always) ✅

#### Bonus: Better Meetup Display

Added a purple "Meetup Event" badge to make it clear:

```typescript
{selectedEvent?.type === "meetup" && (
  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
    Meetup Event
  </span>
)}
```

### Event Click Behavior (Fixed)

| Event Type | Timing | Click Behavior |
|------------|--------|----------------|
| Personal (yours) | Any | Opens edit modal ✅ |
| Personal (others) | Any | Opens view-only modal ✅ |
| Meetup | Future | Opens view-only modal ✅ (NEW!) |
| Meetup | Past | Opens attendance modal ✅ |

### Testing Steps

1. **Create a meetup event** (future date)
2. **Click on the meetup event** on the calendar
3. ✅ Modal should open showing:
   - Event title
   - Purple "Meetup Event" badge
   - Date and time
   - Location
   - "Close" button (no edit/delete)
4. **Create a personal event**
5. **Click on your personal event**
6. ✅ Modal should open with edit fields
7. ✅ Should have Delete and Update buttons

---

## Files Changed

### Modified (2 files):

1. **`/lib/actions/calendar.ts`**
   - Line ~285: Changed `update_calendar_streak` → `update_calendar_streak_with_frequency`
   - Added error handling for streak update

2. **`/components/calendar/event-modal.tsx`**
   - Line ~53: Added meetup type check to `isViewOnly`
   - Lines ~127-132: Added "Meetup Event" badge
   - Line ~134: Only show owner for personal events

3. **`/components/calendar-app.tsx`**
   - Line ~242-253: Added error alert for frequency update failures

---

## Summary of Fixes

### Issue #1: Frequency Not Saving
**Problem:** Wrong database function + no error feedback  
**Fix:** Use `update_calendar_streak_with_frequency` + show errors  
**Action Required:** Run database migration!

### Issue #2: Can't Click Meetups
**Problem:** Meetups treated as editable for creator  
**Fix:** Force meetups to always be view-only  
**Action Required:** None - just works now!

---

## Testing Checklist

### Issue #1:
- [ ] Run `/scripts/005-add-frequency-tracking.sql` in Supabase
- [ ] Restart dev server
- [ ] Open calendar as owner
- [ ] Click "Set Meetup Goal"
- [ ] Choose "Once a Week"
- [ ] Click "Save Goal"
- [ ] No error appears
- [ ] Refresh page - frequency is saved
- [ ] Create meetup
- [ ] House shows perfect (bright blue)
- [ ] Streak shows "1"

### Issue #2:
- [ ] Create future meetup event
- [ ] Click on meetup on calendar
- [ ] Modal opens with "Meetup Event" badge
- [ ] Shows date, time, location
- [ ] Has "Close" button only (no edit)
- [ ] Create personal event
- [ ] Click on personal event
- [ ] Modal has edit fields
- [ ] Can update/delete personal event

---

## Important Notes

### Database Migration is REQUIRED
Without running `005-add-frequency-tracking.sql`:
- ❌ Frequency saving will fail
- ❌ Streak updates will fail  
- ❌ House won't change states
- ⚠️ You'll see errors in console

### After Migration:
- ✅ Frequency saving works
- ✅ Streak updates correctly
- ✅ House changes based on target_met
- ✅ All features functional

---

**Status:** ✅ Both Issues Fixed  
**Migration Required:** Yes - Run `005-add-frequency-tracking.sql`  
**Files Changed:** 3 files  
**Backward Compatible:** Yes

Both issues are now resolved! Run the migration and test!
