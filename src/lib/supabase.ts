import { createClient } from '@supabase/supabase-js'

// `||` (not `??`) so an empty env var falls back too; createClient throws on '' and blanks the page.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(url, key)
