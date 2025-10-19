'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (browserClient) return browserClient

  // Obter variáveis em tempo de execução do browser
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Log para debug
  if (typeof window !== 'undefined') {
    console.log('[Supabase Client] NEXT_PUBLIC_SUPABASE_URL presente?', Boolean(url))
    console.log('[Supabase Client] NEXT_PUBLIC_SUPABASE_ANON_KEY presente?', Boolean(anon))
  }
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Verifique as variáveis de ambiente no Vercel.')
  }
  if (!anon) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Verifique as variáveis de ambiente no Vercel.')
  }

  browserClient = createClient(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { 'x-olv-client': 'web' } },
  })
  
  console.log('[Supabase Client] ✅ Cliente criado com sucesso')
  return browserClient
}
