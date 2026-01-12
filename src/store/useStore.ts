import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

// --- Types based on SQL Schema ---

export interface Profile {
  id: string
  email: string | null
  role: 'admin' | 'user'
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface SiteSettings {
  id: string // UUID
  hero_title: string
  hero_subtitle: string
  hero_image_url: string | null
  marquee_text: string
  navbar_text: string | null // New field

  // About Page
  about_hero_title: string | null
  about_hero_description: string | null
  about_approach_title: string | null
  about_approach_headline: string | null
  about_approach_text_1: string | null
  about_approach_text_2: string | null
  about_image_url: string | null
  about_values_json: any | null

  // Admin Info
  admin_name: string | null
  admin_email: string | null
  admin_phone: string | null
  // Global Locations
  global_locations_json: { city: string; country: string; timezone: string; mapUrl?: string; coords?: string }[] | null
  // Maps
  google_maps_url: string | null
  created_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  description: string
  image_url: string | null
  tags: string[]
}

export interface Testimonial {
  id: string
  author_name: string
  role: string
  content: string
  image_url: string | null
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
}




interface AppState {
  // State
  user: Profile | null
  settings: SiteSettings | null
  isAdmin: boolean
  isLoading: boolean

  // Actions
  fetchSettings: () => Promise<void>
  checkUser: () => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export const useStore = create<AppState>((set) => ({
  user: null,
  settings: null,
  isAdmin: false,
  isLoading: true,

  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error) {
        // If no settings exist (first run), we might get an error, 
        // but the SQL insert should have handled the default row.
        console.error('Error fetching settings:', error)
        return
      }

      if (data) {
        set({ settings: data as SiteSettings })
      }
    } catch (error) {
      console.error('Unexpected error fetching settings:', error)
    }
  },

  checkUser: async () => {
    set({ isLoading: true })
    try {
      // 1. Get auth session
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // 2. Fetch profile to get Role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          // Fallback if profile doesn't exist for some reason (though trigger handles it)
          set({ user: null, isAdmin: false })
        } else if (profile) {
          set({
            user: profile as Profile,
            isAdmin: profile.role === 'admin',
          })
        }
      } else {
        set({ user: null, isAdmin: false })
      }
    } catch (error) {
      console.error('Error checking user:', error)
      set({ user: null, isAdmin: false })
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) return { error }

      // After signup, the profile will be created by the database trigger
      // Check user to update the store
      await useStore.getState().checkUser()

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: error as Error }
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) return { error }

      // Update the store with user data
      await useStore.getState().checkUser()

      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: error as Error }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false })
  }
}))
