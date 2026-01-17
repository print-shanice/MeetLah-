# MeetLah! Setup Guide

This guide will walk you through setting up MeetLah! from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Testing the Application](#testing-the-application)
6. [Deployment](#deployment)

## Prerequisites

### Required Software
- **Node.js** (version 18 or higher)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **pnpm** (recommended) or npm/yarn
  - Install pnpm: `npm install -g pnpm`
  - Verify: `pnpm --version`
- **Git** (for version control)
  - Download from: https://git-scm.com/

### Required Accounts
- **Supabase Account** - https://app.supabase.com (free tier available)
- **Google Cloud Account** - For Google OAuth (optional but recommended)
- **Facebook Developer Account** - For Facebook OAuth (optional)
- **Vercel Account** - For deployment (optional)

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in the details:
   - **Name:** MeetLah (or any name you prefer)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose the closest to your users
   - **Pricing Plan:** Free tier is sufficient for development
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be provisioned

### Step 2: Get API Credentials

1. In your Supabase project, click on **"Project Settings"** (gear icon)
2. Click on **"API"** in the left sidebar
3. You'll see two important values:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key - Copy this (long string starting with `eyJ...`)
4. Save these values - you'll need them for the `.env.local` file

### Step 3: Run Database Migrations

1. In your Supabase project, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `/scripts/001-create-tables.sql` from your project
4. Copy the entire contents and paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"
7. Repeat steps 2-6 for:
   - `002-fix-profile-trigger.sql`
   - `003-fix-rls-recursion.sql`
   - `004-add-streaks-and-punctuality.sql`

**Important:** Run the scripts in order! Each script builds on the previous one.

### Step 4: Verify Database Setup

1. Click on **"Table Editor"** in the left sidebar
2. You should see these tables:
   - profiles
   - calendars
   - calendar_members
   - calendar_streaks
   - events
   - meetup_participants
   - event_punishments

If you see all these tables, the database is set up correctly! ✅

## Local Development Setup

### Step 1: Install Dependencies

Navigate to the project directory:
```bash
cd /Users/shanice/Downloads/MatchLah!
```

Install packages:
```bash
pnpm install
```

This will install all required dependencies including Next.js, React, Supabase client, and UI components.

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in your text editor

3. Replace the placeholder values with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Save the file

### Step 3: Start Development Server

Run the development server:
```bash
pnpm dev
```

You should see:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Configuration

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click "Select a project" → "New Project"
   - Name it "MeetLah" and click "Create"

2. **Enable Google+ API**
   - In the left menu, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: MeetLah
     - User support email: Your email
     - Developer contact: Your email
   - Application type: Web application
   - Name: MeetLah Web Client
   - Authorized redirect URIs: Add these:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local testing)
   - Click "Create"
   - **Save the Client ID and Client Secret**

4. **Configure in Supabase**
   - Go to your Supabase project
   - Navigate to "Authentication" → "Providers"
   - Find "Google" and toggle it on
   - Paste your Client ID and Client Secret
   - Click "Save"

### Facebook OAuth Setup (Optional)

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Click "My Apps" → "Create App"
   - Choose "Consumer" as the type
   - Fill in app details and create

2. **Configure Facebook Login**
   - In your app dashboard, add "Facebook Login" product
   - Go to Facebook Login → Settings
   - Add Valid OAuth Redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback`
   - Save changes

3. **Get App Credentials**
   - Go to Settings → Basic
   - Copy App ID and App Secret

4. **Configure in Supabase**
   - In Supabase: Authentication → Providers
   - Find "Facebook" and toggle it on
   - Paste App ID and App Secret
   - Click "Save"

## Testing the Application

### Create Your First Account

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" or "Login"
3. Choose "Continue with Google" (or Facebook if configured)
4. Complete the OAuth flow
5. You should be redirected to the calendar creation page

### Create a Calendar

1. You'll see "Create Your First Calendar"
2. Enter a name like "Friend Group"
3. Click "Create Calendar"
4. You should see your new calendar with a month view

### Add a Personal Event

1. Click on any date in the calendar
2. Fill in:
   - Title: "Dentist Appointment"
   - Start time: Pick a time
   - End time: Pick a later time
   - Location: (optional)
3. Click "Add Event"
4. The event should appear on the calendar in your color

### Share the Calendar

1. Click "Share Calendar" in the sidebar
2. Copy the share code
3. Open an incognito/private window
4. Sign up with a different Google account
5. On the calendar page, click the dropdown menu
6. Select "Join Calendar"
7. Paste the share code and join

### Create a Meetup

1. With 2+ members in the calendar, click "Create Meetup"
2. Select a date where both members are free
3. Fill in:
   - Title: "Coffee Catchup"
   - Time: Pick a time slot
   - Location: "Starbucks Downtown"
4. Click "Create Meetup"
5. The meetup appears in purple on the calendar
6. Check the sidebar - your streak should now be 1! 🔥

### Test Attendance Tracking

To test the punctuality feature, you'll need to create a past meetup:

1. Manually create a meetup in the database with a past date, OR
2. Wait for a real meetup to pass, then:
   - Click on the past meetup event
   - The attendance modal should appear
   - Mark some participants as late
   - Assign punishments
   - View the punishments assigned

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: (leave default)
     - Environment Variables:
       - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
       - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase key
   - Click "Deploy"

3. **Update Supabase Settings**
   - Go to your Supabase project
   - Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Add to Redirect URLs: `https://your-app.vercel.app/**`

4. **Update OAuth Providers**
   - In Google Cloud Console, add: `https://your-app.vercel.app/auth/callback`
   - In Facebook App Settings, add: `https://your-app.vercel.app/auth/callback`

## Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** 
- Clear browser cache and cookies
- Make sure `.env.local` has the correct Supabase credentials
- Verify you're logged in

### Issue: Events not appearing
**Solution:**
- Refresh the page (Cmd/Ctrl + R)
- Check browser console for errors
- Verify you're a member of the calendar

### Issue: Can't sign in with Google/Facebook
**Solution:**
- Verify OAuth credentials are correct in Supabase
- Check redirect URIs match exactly (including http/https)
- Make sure providers are enabled in Supabase

### Issue: Database migration failed
**Solution:**
- Run scripts in order (001, 002, 003, 004)
- Check for error messages in SQL editor
- Try dropping tables and re-running if needed

### Issue: Streak not updating
**Solution:**
- Verify the event type is "meetup" not "personal"
- Check that the `update_calendar_streak` function exists
- Look at browser console for errors

## Next Steps

Now that you have MeetLah! running:

1. ✅ Invite friends to join your calendar
2. ✅ Add your actual schedule
3. ✅ Create real meetups
4. ✅ Track your streaks
5. ✅ Have fun with the punctuality punisher!

## Getting Help

- **Documentation:** Check README.md for feature overview
- **Issues:** Report bugs on GitHub
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

Happy planning! 🎉
