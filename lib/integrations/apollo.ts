/**
 * Apollo.io Integration - B2B Contact & Company Data
 * Docs: https://apolloio.github.io/apollo-api-docs/
 */

interface ApolloCompanySearchParams {
  domain?: string
  organization_name?: string
  page?: number
  per_page?: number
}

interface ApolloPeopleSearchParams {
  organization_ids?: string[]
  person_titles?: string[]
  person_seniorities?: string[]
  q_organization_domains?: string
  page?: number
  per_page?: number
}

export async function apolloCompanyEnrich(params: ApolloCompanySearchParams): Promise<any> {
  const apiKey = process.env.APOLLO_API_KEY
  
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY não configurado')
  }

  console.log('[Apollo] 🏢 Enriquecendo empresa:', params.domain || params.organization_name)

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: apiKey,
        ...params,
        page: params.page || 1,
        per_page: params.per_page || 10
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`Apollo HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[Apollo] ✅ Retornou', data.organizations?.length || 0, 'empresas')
    
    return data
  } catch (error: any) {
    console.error('[Apollo] ❌ Erro:', error.message)
    throw error
  }
}

export async function apolloPeopleSearch(params: ApolloPeopleSearchParams): Promise<any> {
  const apiKey = process.env.APOLLO_API_KEY
  
  if (!apiKey) {
    throw new Error('APOLLO_API_KEY não configurado')
  }

  console.log('[Apollo] 👥 Buscando pessoas...')

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: apiKey,
        ...params,
        page: params.page || 1,
        per_page: params.per_page || 25
      }),
      signal: AbortSignal.timeout(15000)
    })

    if (!response.ok) {
      throw new Error(`Apollo HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log('[Apollo] ✅ Retornou', data.people?.length || 0, 'pessoas')
    
    return data
  } catch (error: any) {
    console.error('[Apollo] ❌ Erro:', error.message)
    throw error
  }
}

