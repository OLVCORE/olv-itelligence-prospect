import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { serperSearch } from '@/lib/integrations/serper'

export const runtime = 'nodejs'
export const maxDuration = 10 // Headers + CSE: 10s

const schema = z.object({
  companyId: z.string().min(1, "companyId é obrigatório")
})

/**
 * POST /api/intelligence/techstack
 * Detecta stack tecnológico real da empresa
 * 
 * Fluxo:
 * 1. Busca headers HTTP do domínio
 * 2. Busca menções no CSE/Serper
 * 3. Salva em TechStack
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { companyId } = validation.data
    const sb = supabaseAdmin()

    console.log('[TechStack] 🔍 Analisando empresa:', companyId)

    // Buscar dados da empresa
    const { data: company, error: companyError } = await sb
      .from('Company')
      .select('domain, name, tradeName')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'COMPANY_NOT_FOUND',
          message: 'Empresa não encontrada'
        }
      }, { status: 404 })
    }

    const technologies: any[] = []

    // 1️⃣ Headers HTTP (se tiver domínio)
    if (company.domain) {
      try {
        console.log('[TechStack] 🌐 Analisando headers:', company.domain)
        
        const url = company.domain.startsWith('http') 
          ? company.domain 
          : `https://${company.domain}`
        
        const response = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000)
        })

        const headers: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value
        })

        // Detectar tecnologias a partir de headers
        const detectedFromHeaders = detectTechFromHeaders(headers)
        technologies.push(...detectedFromHeaders)

        console.log('[TechStack] ✅ Tecnologias detectadas nos headers:', detectedFromHeaders.length)
      } catch (headerError: any) {
        console.error('[TechStack] ⚠️ Erro ao buscar headers:', headerError.message)
      }
    }

    // 2️⃣ Busca CSE/Serper por menções
    try {
      console.log('[TechStack] 🔍 Buscando menções de tecnologias...')
      
      const companyName = company.tradeName || company.name
      const query = `${companyName} ERP OR CRM OR SAP OR Oracle OR TOTVS OR AWS OR Azure OR "Power BI" OR Salesforce site:${company.domain || ''}`
      
      const searchResults = await serperSearch(query.trim(), 10)
      const items = searchResults?.organic ?? searchResults?.results ?? searchResults?.items ?? []

      for (const item of items) {
        const text = `${item.title || ''} ${item.snippet || item.description || ''}`.toLowerCase()
        
        // Detectar menções de tecnologias
        const detectedFromText = detectTechFromText(text, item.link || item.url)
        technologies.push(...detectedFromText)
      }

      console.log('[TechStack] ✅ Tecnologias detectadas no CSE:', items.length, 'menções')
    } catch (searchError: any) {
      console.error('[TechStack] ⚠️ Erro na busca CSE:', searchError.message)
    }

    // 3️⃣ Deduplicate e consolidar
    const uniqueTechs = consolidateTechnologies(technologies)

    // 4️⃣ Salvar no banco
    const now = new Date().toISOString()
    
    for (const tech of uniqueTechs) {
      try {
        await sb.from('TechStack').insert({
          companyId,
          category: tech.category,
          product: tech.product,
          vendor: tech.vendor,
          confidence: tech.confidence,
          status: tech.status,
          evidence: tech.evidence,
          fetchedAt: now
        })
      } catch (insertError: any) {
        // Ignorar duplicatas
        if (!insertError.message?.includes('duplicate')) {
          console.error('[TechStack] ⚠️ Erro ao inserir:', insertError.message)
        }
      }
    }

    const latency = Date.now() - startTime
    console.log(`[TechStack] ✅ Análise completa em ${latency}ms - ${uniqueTechs.length} tecnologias`)

    return NextResponse.json({
      ok: true,
      data: {
        technologies: uniqueTechs,
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[TechStack] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

// Helpers
function detectTechFromHeaders(headers: Record<string, string>) {
  const technologies: any[] = []
  
  // Server
  if (headers['server']) {
    const server = headers['server'].toLowerCase()
    if (server.includes('apache')) {
      technologies.push({
        category: 'Web Server',
        product: 'Apache',
        vendor: 'Apache Foundation',
        confidence: 90,
        status: 'Confirmado',
        evidence: { source: 'http_headers', value: headers['server'] }
      })
    } else if (server.includes('nginx')) {
      technologies.push({
        category: 'Web Server',
        product: 'Nginx',
        vendor: 'Nginx Inc',
        confidence: 90,
        status: 'Confirmado',
        evidence: { source: 'http_headers', value: headers['server'] }
      })
    } else if (server.includes('iis')) {
      technologies.push({
        category: 'Web Server',
        product: 'IIS',
        vendor: 'Microsoft',
        confidence: 90,
        status: 'Confirmado',
        evidence: { source: 'http_headers', value: headers['server'] }
      })
    }
  }

  // X-Powered-By
  if (headers['x-powered-by']) {
    const powered = headers['x-powered-by'].toLowerCase()
    if (powered.includes('php')) {
      technologies.push({
        category: 'Backend',
        product: 'PHP',
        vendor: 'PHP',
        confidence: 85,
        status: 'Confirmado',
        evidence: { source: 'http_headers', value: headers['x-powered-by'] }
      })
    } else if (powered.includes('asp.net')) {
      technologies.push({
        category: 'Backend',
        product: 'ASP.NET',
        vendor: 'Microsoft',
        confidence: 85,
        status: 'Confirmado',
        evidence: { source: 'http_headers', value: headers['x-powered-by'] }
      })
    }
  }

  return technologies
}

function detectTechFromText(text: string, source?: string) {
  const technologies: any[] = []
  const keywords = {
    'SAP': { category: 'ERP', vendor: 'SAP' },
    'Oracle': { category: 'ERP', vendor: 'Oracle' },
    'TOTVS': { category: 'ERP', vendor: 'TOTVS' },
    'Protheus': { category: 'ERP', vendor: 'TOTVS' },
    'AWS': { category: 'Cloud', vendor: 'Amazon' },
    'Azure': { category: 'Cloud', vendor: 'Microsoft' },
    'Google Cloud': { category: 'Cloud', vendor: 'Google' },
    'Salesforce': { category: 'CRM', vendor: 'Salesforce' },
    'Power BI': { category: 'BI', vendor: 'Microsoft' },
    'Tableau': { category: 'BI', vendor: 'Tableau' },
  }

  for (const [keyword, info] of Object.entries(keywords)) {
    if (text.includes(keyword.toLowerCase())) {
      technologies.push({
        category: info.category,
        product: keyword,
        vendor: info.vendor,
        confidence: 60,
        status: 'Indeterminado',
        evidence: { source: 'search_mention', url: source }
      })
    }
  }

  return technologies
}

function consolidateTechnologies(technologies: any[]) {
  const map = new Map<string, any>()

  for (const tech of technologies) {
    const key = `${tech.category}-${tech.product}`
    
    if (!map.has(key)) {
      map.set(key, tech)
    } else {
      // Manter maior confiança
      const existing = map.get(key)
      if (tech.confidence > existing.confidence) {
        map.set(key, tech)
      }
    }
  }

  return Array.from(map.values())
}

