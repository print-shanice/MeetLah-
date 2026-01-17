-- Add streak tracking table for calendars
CREATE TABLE IF NOT EXISTS calendar_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_meetup_month TEXT, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add punctuality tracking for meetup participants
ALTER TABLE meetup_participants
ADD COLUMN IF NOT EXISTS was_late BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marked_at TIMESTAMPTZ DEFAULT NULL;

-- Add punishment tracking for events
CREATE TABLE IF NOT EXISTS event_punishments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  punishment_text TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE calendar_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_punishments ENABLE ROW LEVEL SECURITY;

-- Calendar streaks policies
CREATE POLICY "Members can view calendar streaks" ON calendar_streaks
  FOR SELECT USING (
    calendar_id IN (SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can manage streaks" ON calendar_streaks
  FOR ALL USING (true);

-- Event punishments policies
CREATE POLICY "Members can view punishments in their calendars" ON event_punishments
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE calendar_id IN (
        SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own punishments" ON event_punishments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Event creators can assign punishments" ON event_punishments
  FOR INSERT WITH CHECK (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

CREATE POLICY "Event creators can delete punishments" ON event_punishments
  FOR DELETE USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_streaks_calendar ON calendar_streaks(calendar_id);
CREATE INDEX IF NOT EXISTS idx_event_punishments_event ON event_punishments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_punishments_user ON event_punishments(user_id);

-- Function to update calendar streak
CREATE OR REPLACE FUNCTION update_calendar_streak(p_calendar_id UUID, p_event_date TIMESTAMPTZ)
RETURNS VOID AS $$
DECLARE
  v_event_month TEXT;
  v_current_streak INT;
  v_last_month TEXT;
  v_expected_month TEXT;
BEGIN
  -- Get the month of the event
  v_event_month := TO_CHAR(p_event_date, 'YYYY-MM');
  
  -- Get or create streak record
  INSERT INTO calendar_streaks (calendar_id, current_streak, last_meetup_month)
  VALUES (p_calendar_id, 0, NULL)
  ON CONFLICT (calendar_id) DO NOTHING;
  
  -- Get current streak data
  SELECT current_streak, last_meetup_month
  INTO v_current_streak, v_last_month
  FROM calendar_streaks
  WHERE calendar_id = p_calendar_id;
  
  -- If this is the first meetup or same month, just update
  IF v_last_month IS NULL OR v_last_month = v_event_month THEN
    UPDATE calendar_streaks
    SET last_meetup_month = v_event_month,
        current_streak = CASE WHEN v_last_month IS NULL THEN 1 ELSE current_streak END,
        longest_streak = GREATEST(longest_streak, CASE WHEN v_last_month IS NULL THEN 1 ELSE current_streak END),
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
    RETURN;
  END IF;
  
  -- Calculate expected month (last month + 1)
  v_expected_month := TO_CHAR(
    (TO_DATE(v_last_month || '-01', 'YYYY-MM-DD') + INTERVAL '1 month'),
    'YYYY-MM'
  );
  
  -- Check if this is the consecutive month
  IF v_event_month = v_expected_month THEN
    -- Continue streak
    UPDATE calendar_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_meetup_month = v_event_month,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE calendar_streaks
    SET current_streak = 1,
        last_meetup_month = v_event_month,
        updated_at = NOW()
    WHERE calendar_id = p_calendar_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on new tables
CREATE TRIGGER update_calendar_streaks_updated_at
  BEFORE UPDATE ON calendar_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
