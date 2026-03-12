import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Guard against placeholder / missing values so the app renders in local dev
// even before real Supabase credentials are configured.
const isValid = url && key &&
  !url.includes('placeholder') &&
  !key.includes('placeholder') &&
  url.startsWith('http')

export const supabase = isValid
  ? createClient(url, key)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key-for-dev-only')

export const supabaseReady = isValid
