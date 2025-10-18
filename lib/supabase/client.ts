'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!anon) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')

  browserClient = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { 'x-olv-client': 'web' } }
  })
  return browserClient
}

// Client para uso no browser (public) - DEPRECATED, use getSupabaseBrowser()
export const supabase = getSupabaseBrowser()

// Client para uso server-side (admin)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)