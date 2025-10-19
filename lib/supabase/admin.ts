// Server-side only - não usar no browser
import { createClient } from '@supabase/supabase-js'

// Client para uso server-side (admin) - apenas em API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

