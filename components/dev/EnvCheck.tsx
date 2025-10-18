'use client'

export function EnvCheck() {
  console.log('[EnvCheck] NEXT_PUBLIC_SUPABASE_URL present?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL))
  console.log('[EnvCheck] NEXT_PUBLIC_SUPABASE_ANON_KEY present?', Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  console.log('[EnvCheck] NODE_ENV:', process.env.NODE_ENV)
  
  return null
}
