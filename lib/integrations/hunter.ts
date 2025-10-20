/**
 * Hunter.io Integration - Email Finder & Verifier
 * Docs: https://hunter.io/api-documentation
 */

interface HunterFindParams {
  domain: string
  first_name?: string
  last_name?: string
  full_name?: string
}

interface HunterVerifyParams {
  email: string
}

export async function hunterEmailFinder(params: HunterFindParams): Promise<any> {
  const apiKey = process.env.HUNTER_API_KEY
  
  if (!apiKey) {
    throw new Error('HUNTER_API_KEY não configurado')
  }

  console.log('[Hunter] 📧 Buscando email:', params.full_name, '@', params.domain)

  try {
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      domain: params.domain,
      ...(params.full_name ? { full_name: params.full_name } : {}),
      ...(params.first_name ? { first_name: params.first_name } : {}),
      ...(params.last_name ? { last_name: params.last_name } : {})
    })

    const response = await fetch(
      `https://api.hunter.io/v2/email-finder?${searchParams}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) {
      throw new Error(`Hunter HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[Hunter] ✅ Email encontrado:', data.data?.email || 'Não encontrado')
    
    return data
  } catch (error: any) {
    console.error('[Hunter] ❌ Erro:', error.message)
    throw error
  }
}

export async function hunterEmailVerifier(params: HunterVerifyParams): Promise<any> {
  const apiKey = process.env.HUNTER_API_KEY
  
  if (!apiKey) {
    throw new Error('HUNTER_API_KEY não configurado')
  }

  console.log('[Hunter] ✅ Verificando email:', params.email)

  try {
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      email: params.email
    })

    const response = await fetch(
      `https://api.hunter.io/v2/email-verifier?${searchParams}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) {
      throw new Error(`Hunter HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[Hunter] ✅ Resultado:', data.data?.result || 'unknown')
    
    return data
  } catch (error: any) {
    console.error('[Hunter] ❌ Erro:', error.message)
    throw error
  }
}

