#!/usr/bin/env node

/**
 * This script applies the RLS policy fix for event_punishments
 * Run with: node scripts/apply-punishment-fix.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function applyFix() {
  // Load environment variables
  const envPath = join(__dirname, '..', '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim()
    }
  })

  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  console.log('🔧 Connecting to Supabase...')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Read the SQL file
  const sqlPath = join(__dirname, '008-fix-punishment-rls-policy.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('📝 Applying RLS policy fix...')
  
  try {
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Error applying fix:', error.message)
      console.log('\n⚠️  Please apply the SQL manually in Supabase Dashboard:')
      console.log('1. Go to https://app.supabase.com')
      console.log('2. Select your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Copy and paste the contents of scripts/008-fix-punishment-rls-policy.sql')
      console.log('5. Click "Run"')
      process.exit(1)
    }

    console.log('✅ RLS policy fix applied successfully!')
    console.log('\nThe following changes were made:')
    console.log('- Dropped old "Event creators can assign punishments" policy')
    console.log('- Created new "Calendar members can assign punishments" policy')
    console.log('- Updated delete policy to allow all calendar members')
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    console.log('\n⚠️  Please apply the SQL manually in Supabase Dashboard:')
    console.log('1. Go to https://app.supabase.com')
    console.log('2. Select your project')
    console.log('3. Go to SQL Editor')
    console.log('4. Copy and paste the contents of scripts/008-fix-punishment-rls-policy.sql')
    console.log('5. Click "Run"')
  }
}

applyFix()
