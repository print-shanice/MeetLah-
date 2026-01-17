-- Optional: Recalculate all calendar streaks after applying the bug fix
-- This script recalculates streaks from scratch based on historical meetup data

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS recalculate_calendar_streaks(UUID);
DROP FUNCTION IF EXISTS recalculate_all_calendar_streaks();

-- Function to recalculate streaks for a specific calendar
CREATE OR REPLACE FUNCTION recalculate_calendar_streaks(p_calendar_id UUID)
RETURNS TABLE(
  calendar_id UUID,
  new_current_streak INT,
  new_longest_streak INT,
  events_processed INT
) AS $$
DECLARE
  v_frequency TEXT;
  v_event RECORD;
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_last_period_start TIMESTAMPTZ := NULL;
  v_events_count INT := 0;
BEGIN
  -- Get frequency setting
  SELECT meetup_frequency INTO v_frequency
  FROM calendar_streaks
  WHERE calendar_streaks.calendar_id = p_calendar_id;
  
  -- If no frequency set, default to monthly
  IF v_frequency IS NULL THEN
    v_frequency := 'monthly';
  END IF;
  
  -- Reset streak to start fresh
  UPDATE calendar_streaks
  SET current_streak = 0,
      longest_streak = 0,
      last_meetup_date = NULL,
      last_meetup_month = NULL,
      updated_at = NOW()
  WHERE calendar_streaks.calendar_id = p_calendar_id;
  
  -- Process all past meetups in chronological order
  FOR v_event IN 
    SELECT end_time
    FROM events
    WHERE events.calendar_id = p_calendar_id
      AND events.type = 'meetup'
      AND end_time < NOW()  -- Only past events
    ORDER BY end_time ASC
  LOOP
    DECLARE
      v_event_period_start TIMESTAMPTZ;
      v_is_new_period BOOLEAN;
      v_is_consecutive BOOLEAN := FALSE;
    BEGIN
      v_events_count := v_events_count + 1;
      
      -- Determine period start based on frequency
      CASE v_frequency
        WHEN 'weekly' THEN
          v_event_period_start := DATE_TRUNC('week', v_event.end_time);
        WHEN 'monthly' THEN
          v_event_period_start := DATE_TRUNC('month', v_event.end_time);
        WHEN 'yearly' THEN
          v_event_period_start := DATE_TRUNC('year', v_event.end_time);
      END CASE;
      
      -- Check if this is a new period
      v_is_new_period := (v_last_period_start IS NULL OR v_event_period_start != v_last_period_start);
      
      IF v_is_new_period THEN
        -- Check if consecutive
        IF v_last_period_start IS NOT NULL THEN
          CASE v_frequency
            WHEN 'weekly' THEN
              v_is_consecutive := (v_event_period_start = v_last_period_start + INTERVAL '1 week');
            WHEN 'monthly' THEN
              v_is_consecutive := (v_event_period_start = v_last_period_start + INTERVAL '1 month');
            WHEN 'yearly' THEN
              v_is_consecutive := (v_event_period_start = v_last_period_start + INTERVAL '1 year');
          END CASE;
        END IF;
        
        -- Update streak
        IF v_last_period_start IS NULL THEN
          -- First meetup
          v_current_streak := 1;
        ELSIF v_is_consecutive THEN
          -- Consecutive period
          v_current_streak := v_current_streak + 1;
        ELSE
          -- Gap detected, reset
          v_current_streak := 1;
        END IF;
        
        -- Update longest streak
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
        
        -- Update last period
        v_last_period_start := v_event_period_start;
      END IF;
      -- If same period, don't increment (this is the key fix!)
    END;
  END LOOP;
  
  -- Update the calendar_streaks table with recalculated values
  UPDATE calendar_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_meetup_date = (
        SELECT MAX(end_time)
        FROM events
        WHERE events.calendar_id = p_calendar_id
          AND events.type = 'meetup'
          AND end_time < NOW()
      ),
      last_meetup_month = TO_CHAR(
        (SELECT MAX(end_time)
         FROM events
         WHERE events.calendar_id = p_calendar_id
           AND events.type = 'meetup'
           AND end_time < NOW()),
        'YYYY-MM'
      ),
      target_met = TRUE,
      updated_at = NOW()
  WHERE calendar_streaks.calendar_id = p_calendar_id;
  
  -- Return results
  RETURN QUERY
  SELECT 
    p_calendar_id,
    v_current_streak,
    v_longest_streak,
    v_events_count;
END;
$$ LANGUAGE plpgsql;

-- Helper function to recalculate ALL calendars
CREATE OR REPLACE FUNCTION recalculate_all_calendar_streaks()
RETURNS TABLE(
  calendar_id UUID,
  calendar_name TEXT,
  new_current_streak INT,
  new_longest_streak INT,
  events_processed INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    r.new_current_streak,
    r.new_longest_streak,
    r.events_processed
  FROM calendars c
  CROSS JOIN LATERAL recalculate_calendar_streaks(c.id) r
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Usage examples:

-- 1. Recalculate streaks for a specific calendar
-- SELECT * FROM recalculate_calendar_streaks('your-calendar-id-here');

-- 2. Recalculate streaks for all calendars
-- SELECT * FROM recalculate_all_calendar_streaks();

-- 3. View current streaks
-- SELECT 
--   c.name as calendar_name,
--   cs.current_streak,
--   cs.longest_streak,
--   cs.meetup_frequency,
--   cs.last_meetup_date,
--   cs.target_met
-- FROM calendar_streaks cs
-- JOIN calendars c ON c.id = cs.calendar_id
-- ORDER BY c.name;

COMMENT ON FUNCTION recalculate_calendar_streaks IS 
'Recalculates streak for a specific calendar based on all historical meetup events. Use this after applying the streak bug fix to correct any inflated streaks.';

COMMENT ON FUNCTION recalculate_all_calendar_streaks IS 
'Recalculates streaks for ALL calendars. Use with caution on production databases with many calendars.';
