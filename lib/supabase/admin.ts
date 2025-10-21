// Server-side only - não usar no browser
import { createClient } from '@supabase/supabase-js'

// Validação de variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não configurada')
}

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')
}

// Singleton pattern para evitar múltiplas instâncias
let adminClient: any = null

// Função que retorna o client admin (singleton)
export const supabaseAdmin = () => {
  if (!adminClient) {
    adminClient = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }
  return adminClient
}

