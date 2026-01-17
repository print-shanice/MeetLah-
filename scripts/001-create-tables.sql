-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create shared calendars table
CREATE TABLE IF NOT EXISTS calendars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Shared Calendar',
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar members table (users in a calendar)
CREATE TABLE IF NOT EXISTS calendar_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(calendar_id, user_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  calendar_id UUID REFERENCES calendars(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  type TEXT DEFAULT 'personal' CHECK (type IN ('personal', 'meetup')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meetup participants table
CREATE TABLE IF NOT EXISTS meetup_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_members_calendar ON calendar_members(calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_members_user ON calendar_members(user_id);
CREATE INDEX IF NOT EXISTS idx_events_calendar ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendars_share_code ON calendars(share_code);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view profiles of calendar members" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT cm.user_id FROM calendar_members cm
      WHERE cm.calendar_id IN (
        SELECT cm2.calendar_id FROM calendar_members cm2 WHERE cm2.user_id = auth.uid()
      )
    )
  );

-- Calendars policies
CREATE POLICY "Users can view calendars they are members of" ON calendars
  FOR SELECT USING (
    id IN (SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid())
    OR owner_id = auth.uid()
  );

CREATE POLICY "Users can create calendars" ON calendars
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their calendars" ON calendars
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their calendars" ON calendars
  FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Anyone can view calendar by share code" ON calendars
  FOR SELECT USING (share_code IS NOT NULL);

-- Calendar members policies
CREATE POLICY "Members can view calendar members" ON calendar_members
  FOR SELECT USING (
    calendar_id IN (SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join calendars" ON calendar_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON calendar_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can leave calendars" ON calendar_members
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Owners can remove members" ON calendar_members
  FOR DELETE USING (
    calendar_id IN (SELECT id FROM calendars WHERE owner_id = auth.uid())
  );

-- Events policies
CREATE POLICY "Members can view events in their calendars" ON events
  FOR SELECT USING (
    calendar_id IN (SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Members can create events" ON events
  FOR INSERT WITH CHECK (
    calendar_id IN (SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid())
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (user_id = auth.uid());

-- Meetup participants policies
CREATE POLICY "Members can view meetup participants" ON meetup_participants
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE calendar_id IN (
        SELECT calendar_id FROM calendar_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Event creators can manage participants" ON meetup_participants
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE user_id = auth.uid())
  );

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
