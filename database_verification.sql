-- PUNCTUALITY PUNISHER FEATURE - DATABASE VERIFICATION QUERIES
-- Run these in your Supabase SQL Editor to verify the feature is working

-- 1. Check if you have any past meetup events
SELECT 
  id,
  title,
  start_time,
  end_time,
  type,
  CASE 
    WHEN end_time < NOW() THEN 'PAST (should be clickable)'
    ELSE 'FUTURE (opens event modal)'
  END as event_status
FROM events
WHERE type = 'meetup'
ORDER BY start_time DESC;

-- 2. Check meetup participants (who attended)
SELECT 
  e.title as event_name,
  e.end_time,
  p.full_name as participant_name,
  mp.was_late,
  mp.marked_at,
  CASE 
    WHEN mp.was_late IS NULL THEN 'Not marked yet'
    WHEN mp.was_late = true THEN 'Marked LATE'
    WHEN mp.was_late = false THEN 'Marked ON TIME'
  END as attendance_status
FROM meetup_participants mp
JOIN events e ON mp.event_id = e.id
JOIN profiles p ON mp.user_id = p.id
WHERE e.type = 'meetup'
ORDER BY e.end_time DESC, p.full_name;

-- 3. Check assigned punishments
SELECT 
  e.title as event_name,
  e.end_time as event_ended,
  p.full_name as punished_user,
  ep.punishment_text,
  ep.completed,
  ep.assigned_at,
  ep.completed_at,
  CASE 
    WHEN ep.completed THEN '✓ Completed'
    ELSE '⚠️ Pending'
  END as status
FROM event_punishments ep
JOIN events e ON ep.event_id = e.id
JOIN profiles p ON ep.user_id = p.id
ORDER BY ep.assigned_at DESC;

-- 4. Get count of pending punishments per user
SELECT 
  p.full_name,
  p.email,
  COUNT(*) as pending_punishments
FROM event_punishments ep
JOIN profiles p ON ep.user_id = p.id
WHERE ep.completed = false
GROUP BY p.id, p.full_name, p.email
ORDER BY pending_punishments DESC;

-- 5. Create a test past meetup event (modify as needed)
-- IMPORTANT: Replace 'YOUR_CALENDAR_ID' and 'YOUR_USER_ID' with actual values
/*
INSERT INTO events (calendar_id, user_id, title, start_time, end_time, type, location)
VALUES (
  'YOUR_CALENDAR_ID',
  'YOUR_USER_ID',
  'Test Past Meetup',
  NOW() - INTERVAL '2 hours',  -- Started 2 hours ago
  NOW() - INTERVAL '1 hour',   -- Ended 1 hour ago
  'meetup',
  'Test Location'
)
RETURNING id;

-- After creating event, create participants
-- Replace EVENT_ID with the ID returned from above
INSERT INTO meetup_participants (event_id, user_id)
SELECT 'EVENT_ID', user_id
FROM calendar_members
WHERE calendar_id = 'YOUR_CALENDAR_ID';
*/

-- 6. Verify Row Level Security (RLS) policies
-- Check if RLS is enabled on critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('events', 'meetup_participants', 'event_punishments')
ORDER BY tablename;

-- 7. Get your current user ID (for testing)
-- Run this to find your user ID for creating test data
SELECT 
  id as user_id,
  email,
  full_name
FROM profiles
WHERE email = 'YOUR_EMAIL@example.com';  -- Replace with your email

-- 8. Quick cleanup (if needed during testing)
-- CAUTION: This deletes ALL punishments - use only for testing!
/*
DELETE FROM event_punishments WHERE event_id IN (
  SELECT id FROM events WHERE title LIKE '%Test%'
);
*/
