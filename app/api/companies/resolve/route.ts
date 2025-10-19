import { NextResponse } from 'next/server'
import { normalizeDomain } from '@/lib/utils/cnpj'

interface Candidate {
  name: string
  cnpj?: string
  url: string
  confidence: number
  snippet: string
}

/**
 * POST /api/companies/resolve
 * Resolve múltiplos CNPJs possíveis para um website/domínio
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { website } = body

    if (!website) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Parâmetro "website" é obrigatório',
        },
        { status: 400 }
      )
    }

    const domain = normalizeDomain(website)
    console.log('[API /resolve] 🔍 Resolvendo website:', domain)

    // Buscar no Google CSE
    const searchQuery = `site:${domain} OR ${domain} (sobre OR empresa OR contato OR cnpj)`
    const apiKey = process.env.GOOGLE_API_KEY
    const cseId = process.env.GOOGLE_CSE_ID

    if (!apiKey || !cseId) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Google CSE não configurado',
        },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(searchQuery)}&num=5`,
      { next: { revalidate: 3600 } } // Cache 1 hora
    )

    if (!response.ok) {
      console.error('[API /resolve] ❌ Google CSE error:', response.status)
      return NextResponse.json(
        {
          status: 'error',
          message: 'Erro ao buscar informações no Google',
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    const items = data.items || []

    if (items.length === 0) {
      console.log('[API /resolve] ⚠️ Nenhum resultado encontrado')
      return NextResponse.json({
        status: 'empty',
        message: 'Nenhuma empresa encontrada para este website',
      })
    }

    // Processar candidatos
    const candidates: Candidate[] = items.map((item: any) => {
      const snippet = item.snippet || ''
      const title = item.title || ''
      const url = item.link || ''

      // Tentar extrair CNPJ
      const cnpjRegex = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b|\b\d{14}\b/g
      const cnpjMatches = (snippet + ' ' + title).match(cnpjRegex)
      const cnpj = cnpjMatches ? cnpjMatches[0].replace(/\D/g, '') : undefined

      // Calcular confiança
      let confidence = 0
      if (cnpj) confidence += 40
      if (url.includes(domain)) confidence += 30
      if (/(sobre|empresa|contato|cnpj)/i.test(snippet + title)) confidence += 20
      if (/matriz|sede/i.test(snippet + title)) confidence += 10

      return {
        name: title.replace(/\s*-.*$/, '').trim(), // Remove sufixos do título
        cnpj,
        url,
        confidence: Math.min(confidence, 100),
        snippet: snippet.substring(0, 200),
      }
    })

    // Ordenar por confiança
    candidates.sort((a, b) => b.confidence - a.confidence)

    console.log('[API /resolve] ✅ Encontrados', candidates.length, 'candidatos')

    return NextResponse.json({
      status: 'success',
      candidates,
    })
  } catch (error: any) {
    console.error('[API /resolve] ❌ Erro:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro interno ao resolver website',
      },
      { status: 500 }
    )
  }
}

