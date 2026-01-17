-- Fix the streak calculation function to properly handle weekly/monthly/yearly frequencies
-- Bug: Previously counted multiple meetups in same period as separate streak increments
-- Fix: Only count ONE meetup per period (week/month/year) regardless of how many meetups happen

CREATE OR REPLACE FUNCTION update_calendar_streak_with_frequency(
  p_calendar_id UUID,
  p_event_date TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_frequency TEXT;
  v_last_meetup_date TIMESTAMPTZ;
  v_current_streak INT;
  v_target_met BOOLEAN;
  v_is_same_period BOOLEAN := FALSE;
  v_is_consecutive_period BOOLEAN := FALSE;
  v_periods_missed INT := 0;
BEGIN
  -- Get or create streak record
  INSERT INTO calendar_streaks (calendar_id, current_streak, meetup_frequency, target_met)
  VALUES (p_calendar_id, 0, 'monthly', TRUE)
  ON CONFLICT (calendar_id) DO NOTHING;
  
  -- Get current streak data
  SELECT current_streak, last_meetup_date, meetup_frequency, target_met
  INTO v_current_streak, v_last_meetup_date, v_frequency, v_target_met
  FROM calendar_streaks
  WHERE calendar_id = p_calendar_id;
  
  -- If this is the first meetup
  IF v_last_meetup_date IS NULL THEN
    UPDATE calendar_streaks
    SET current_streak = 1,
        longest_streak = GREATEST(longest_streak, 1),
        last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = TRUE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
    RETURN;
  END IF;
  
  -- Check if the new meetup is in the same period or consecutive period
  CASE v_frequency
    WHEN 'weekly' THEN
      -- Check if same week (week starts on Sunday)
      v_is_same_period := (
        DATE_TRUNC('week', p_event_date) = DATE_TRUNC('week', v_last_meetup_date)
      );
      
      -- Check if consecutive week (next week after last meetup)
      v_is_consecutive_period := (
        DATE_TRUNC('week', p_event_date) = DATE_TRUNC('week', v_last_meetup_date) + INTERVAL '1 week'
      );
      
      -- Calculate how many weeks were missed
      IF NOT v_is_same_period AND NOT v_is_consecutive_period THEN
        v_periods_missed := FLOOR(
          EXTRACT(EPOCH FROM (DATE_TRUNC('week', p_event_date) - DATE_TRUNC('week', v_last_meetup_date))) / 604800
        ) - 1; -- 604800 seconds in a week
      END IF;
      
    WHEN 'monthly' THEN
      -- Check if same month
      v_is_same_period := (
        TO_CHAR(p_event_date, 'YYYY-MM') = TO_CHAR(v_last_meetup_date, 'YYYY-MM')
      );
      
      -- Check if consecutive month
      v_is_consecutive_period := (
        DATE_TRUNC('month', p_event_date) = DATE_TRUNC('month', v_last_meetup_date) + INTERVAL '1 month'
      );
      
      -- Calculate how many months were missed
      IF NOT v_is_same_period AND NOT v_is_consecutive_period THEN
        v_periods_missed := (
          EXTRACT(YEAR FROM p_event_date) * 12 + EXTRACT(MONTH FROM p_event_date)
        ) - (
          EXTRACT(YEAR FROM v_last_meetup_date) * 12 + EXTRACT(MONTH FROM v_last_meetup_date)
        ) - 1;
      END IF;
      
    WHEN 'yearly' THEN
      -- Check if same year
      v_is_same_period := (
        EXTRACT(YEAR FROM p_event_date) = EXTRACT(YEAR FROM v_last_meetup_date)
      );
      
      -- Check if consecutive year
      v_is_consecutive_period := (
        EXTRACT(YEAR FROM p_event_date) = EXTRACT(YEAR FROM v_last_meetup_date) + 1
      );
      
      -- Calculate how many years were missed
      IF NOT v_is_same_period AND NOT v_is_consecutive_period THEN
        v_periods_missed := EXTRACT(YEAR FROM p_event_date) - EXTRACT(YEAR FROM v_last_meetup_date) - 1;
      END IF;
  END CASE;
  
  -- Handle the different scenarios
  IF v_is_same_period THEN
    -- Same period - just update the date, DON'T increment streak
    -- This is the key fix: multiple meetups in same week/month/year don't increase streak
    UPDATE calendar_streaks
    SET last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = TRUE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
    
  ELSIF v_is_consecutive_period THEN
    -- Consecutive period - increment streak by 1
    UPDATE calendar_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = TRUE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
    
  ELSE
    -- Periods were missed - reset streak to 1
    UPDATE calendar_streaks
    SET current_streak = 1,
        longest_streak = GREATEST(longest_streak, 1),
        last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = FALSE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Also need to fix the check_streak_target_met function to use period-based logic
CREATE OR REPLACE FUNCTION check_streak_target_met(p_calendar_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_frequency TEXT;
  v_last_meetup_date TIMESTAMPTZ;
  v_current_period_start TIMESTAMPTZ;
  v_last_meetup_period_start TIMESTAMPTZ;
  v_is_target_met BOOLEAN;
BEGIN
  SELECT meetup_frequency, last_meetup_date
  INTO v_frequency, v_last_meetup_date
  FROM calendar_streaks
  WHERE calendar_id = p_calendar_id;
  
  -- If no meetups yet, target is considered met
  IF v_last_meetup_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Determine the period boundaries based on frequency
  CASE v_frequency
    WHEN 'weekly' THEN
      v_current_period_start := DATE_TRUNC('week', NOW());
      v_last_meetup_period_start := DATE_TRUNC('week', v_last_meetup_date);
      
    WHEN 'monthly' THEN
      v_current_period_start := DATE_TRUNC('month', NOW());
      v_last_meetup_period_start := DATE_TRUNC('month', v_last_meetup_date);
      
    WHEN 'yearly' THEN
      v_current_period_start := DATE_TRUNC('year', NOW());
      v_last_meetup_period_start := DATE_TRUNC('year', v_last_meetup_date);
  END CASE;
  
  -- Check if last meetup was in current period or previous period
  IF v_last_meetup_period_start = v_current_period_start THEN
    -- Last meetup was in current period - target is met
    v_is_target_met := TRUE;
  ELSIF v_frequency = 'weekly' AND v_last_meetup_period_start = v_current_period_start - INTERVAL '1 week' THEN
    -- Last meetup was in previous week - target still met (grace period)
    v_is_target_met := TRUE;
  ELSIF v_frequency = 'monthly' AND v_last_meetup_period_start = v_current_period_start - INTERVAL '1 month' THEN
    -- Last meetup was in previous month - target still met (grace period)
    v_is_target_met := TRUE;
  ELSIF v_frequency = 'yearly' AND v_last_meetup_period_start = v_current_period_start - INTERVAL '1 year' THEN
    -- Last meetup was in previous year - target still met (grace period)
    v_is_target_met := TRUE;
  ELSE
    -- Last meetup was too long ago - target not met
    v_is_target_met := FALSE;
  END IF;
  
  -- Update the target_met status
  UPDATE calendar_streaks
  SET target_met = v_is_target_met,
      updated_at = NOW()
  WHERE calendar_id = p_calendar_id;
  
  RETURN v_is_target_met;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON FUNCTION update_calendar_streak_with_frequency IS 
'Updates calendar streak based on meetup frequency. Key behavior: Only ONE meetup per period (week/month/year) counts toward streak, regardless of how many meetups occur in that period.';

COMMENT ON FUNCTION check_streak_target_met IS 
'Checks if the streak target is currently being met based on the last meetup date and frequency setting.';
