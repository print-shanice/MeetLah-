-- Fix RLS policy for event_punishments to allow calendar members to assign punishments
-- The original policy only allowed event creators to assign punishments
-- For meetup events, any calendar member should be able to assign punishments

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
