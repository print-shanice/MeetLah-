-- Fix infinite recursion in RLS policies by using security definer functions
-- The issue is that calendar_members policy references itself

-- Create a security definer function to get user's calendar IDs
-- This bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION get_user_calendar_ids(user_uuid UUID)
RETURNS SETOF UUID AS $$
  SELECT calendar_id FROM calendar_members WHERE user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Members can view calendar members" ON calendar_members;
DROP POLICY IF EXISTS "Users can view calendars they are members of" ON calendars;
DROP POLICY IF EXISTS "Members can view events in their calendars" ON events;
DROP POLICY IF EXISTS "Members can create events" ON events;
DROP POLICY IF EXISTS "Members can view meetup participants" ON meetup_participants;

-- Recreate calendar_members SELECT policy using the function
CREATE POLICY "Members can view calendar members" ON calendar_members
  FOR SELECT USING (
    calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
  );

-- Recreate calendars SELECT policy using the function
CREATE POLICY "Users can view calendars they are members of" ON calendars
  FOR SELECT USING (
    id IN (SELECT get_user_calendar_ids(auth.uid()))
    OR owner_id = auth.uid()
  );

-- Recreate events SELECT policy using the function
CREATE POLICY "Members can view events in their calendars" ON events
  FOR SELECT USING (
    calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
  );

-- Recreate events INSERT policy using the function
CREATE POLICY "Members can create events" ON events
  FOR INSERT WITH CHECK (
    calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
    AND user_id = auth.uid()
  );

-- Recreate meetup_participants SELECT policy using the function
CREATE POLICY "Members can view meetup participants" ON meetup_participants
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE calendar_id IN (SELECT get_user_calendar_ids(auth.uid()))
    )
  );
