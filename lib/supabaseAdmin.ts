import { createClient } from '@supabase/supabase-js'

// Singleton para evitar múltiplas instâncias
let adminClient: ReturnType<typeof createClient> | null = null

export function supabaseAdmin() {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!url || !service) {
    throw new Error('Supabase envs ausentes')
  }

  adminClient = createClient(url, service, {
    auth: { persistSession: false }
  })

  return adminClient
}

// Export nomeado também para compatibilidade
export const getSupabaseAdmin = supabaseAdmin
