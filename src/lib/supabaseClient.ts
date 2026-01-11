import { createClient } from '@supabase/supabase-js'

// Fix: Property 'env' does not exist on type 'ImportMeta'. Casting to any to access Vite environment variables.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false, // Prevents Supabase from interfering with React Router
    flowType: 'pkce',          // More secure and reliable for client-side apps
  },
})