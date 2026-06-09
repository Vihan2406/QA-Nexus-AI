import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  console.error('[QA Nexus] ⚠️  VITE_SUPABASE_URL is missing. Check your .env file.')
}
if (!supabaseKey) {
  console.error('[QA Nexus] ⚠️  VITE_SUPABASE_PUBLISHABLE_KEY is missing. Check your .env file.')
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseKey ?? 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
