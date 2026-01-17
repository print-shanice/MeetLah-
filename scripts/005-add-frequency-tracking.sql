-- Add new columns to calendar_streaks table for frequency-based tracking
ALTER TABLE calendar_streaks
ADD COLUMN IF NOT EXISTS meetup_frequency TEXT DEFAULT 'monthly' CHECK (meetup_frequency IN ('weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS target_met BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_meetup_date TIMESTAMPTZ;

-- Update the streak calculation function to handle different frequencies
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
  v_time_since_last INTERVAL;
  v_deadline TIMESTAMPTZ;
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
  
  -- Calculate time since last meetup
  v_time_since_last := p_event_date - v_last_meetup_date;
  
  -- Determine if target was met based on frequency
  CASE v_frequency
    WHEN 'weekly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '7 days';
    WHEN 'monthly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '1 year';
  END CASE;
  
  -- Check if the new meetup is within the deadline
  IF p_event_date <= v_deadline THEN
    -- Target met, increment streak
    UPDATE calendar_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = TRUE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
  ELSE
    -- Target missed, reset streak to 1
    UPDATE calendar_streaks
    SET current_streak = 1,
        last_meetup_date = p_event_date,
        last_meetup_month = TO_CHAR(p_event_date, 'YYYY-MM'),
        target_met = FALSE,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to set meetup frequency (called when calendar is created or settings changed)
CREATE OR REPLACE FUNCTION set_meetup_frequency(
  p_calendar_id UUID,
  p_frequency TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validate frequency
  IF p_frequency NOT IN ('weekly', 'monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid frequency. Must be weekly, monthly, or yearly';
  END IF;
  
  -- Update or insert streak record with frequency
  INSERT INTO calendar_streaks (calendar_id, meetup_frequency, current_streak, target_met)
  VALUES (p_calendar_id, p_frequency, 0, TRUE)
  ON CONFLICT (calendar_id) 
  DO UPDATE SET 
    meetup_frequency = p_frequency,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check if target is currently met
CREATE OR REPLACE FUNCTION check_streak_target_met(p_calendar_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_frequency TEXT;
  v_last_meetup_date TIMESTAMPTZ;
  v_deadline TIMESTAMPTZ;
BEGIN
  SELECT meetup_frequency, last_meetup_date
  INTO v_frequency, v_last_meetup_date
  FROM calendar_streaks
  WHERE calendar_id = p_calendar_id;
  
  -- If no meetups yet, target is considered met
  IF v_last_meetup_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate deadline based on frequency
  CASE v_frequency
    WHEN 'weekly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '7 days';
    WHEN 'monthly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '1 month';
    WHEN 'yearly' THEN
      v_deadline := v_last_meetup_date + INTERVAL '1 year';
  END CASE;
  
  -- Check if we're still within the deadline
  IF NOW() <= v_deadline THEN
    -- Update target_met to TRUE
    UPDATE calendar_streaks
    SET target_met = TRUE
    WHERE calendar_id = p_calendar_id;
    RETURN TRUE;
  ELSE
    -- Deadline passed, update target_met to FALSE
    UPDATE calendar_streaks
    SET target_met = FALSE
    WHERE calendar_id = p_calendar_id;
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON COLUMN calendar_streaks.meetup_frequency IS 'How often the group plans to meet: weekly, monthly, or yearly';
COMMENT ON COLUMN calendar_streaks.target_met IS 'Whether the current streak target is being met';
COMMENT ON COLUMN calendar_streaks.last_meetup_date IS 'The exact date and time of the last meetup';
