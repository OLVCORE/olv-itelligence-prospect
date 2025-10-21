import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj'
import { parseBRLToNumber } from '@/lib/utils/format'

export const runtime = 'nodejs'
export const maxDuration = 20

const previewSchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
  mode: z.enum(['cnpj', 'website'])
})

// ReceitaWS API
async function fetchReceitaWS(cnpj: string) {
  const token = process.env.RECEITAWS_API_TOKEN
  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`
  
  const headers: any = { 'Accept': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  })
  
  if (!res.ok) throw new Error(`ReceitaWS HTTP ${res.status}`)
  
  const data = await res.json()
  if (data.status === 'ERROR') throw new Error(data.message || 'CNPJ não encontrado')
  
  return data
}

// Serper API (presença digital)
async function fetchSerper(companyName: string, domain: string) {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) return null
  
  const q = `${companyName} ${domain} site:${domain} OR site:linkedin.com OR site:instagram.com`
  
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ q, num: 10 }),
    signal: AbortSignal.timeout(8000)
  })
  
  if (!res.ok) return null
  return res.json()
}

// Google CSE fallback
async function fetchGoogleCSE(companyName: string) {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID
  
  if (!apiKey || !cseId) return null
  
  const q = encodeURIComponent(companyName)
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${q}&num=10`
  
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) return null
  
  return res.json()
}

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const validation = previewSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_INPUT', message: validation.error.issues[0].message }
      }, { status: 422 })
    }

    const { query, mode } = validation.data

    if (mode === 'cnpj') {
      const cnpj = normalizeCnpj(query)
      
      if (!isValidCnpj(cnpj)) {
        return NextResponse.json({
          ok: false,
          error: { code: 'INVALID_CNPJ', message: 'CNPJ inválido' }
        }, { status: 422 })
      }

      console.log('[Preview] 🔍 Buscando CNPJ:', cnpj)

      // 1️⃣ RECEITA FEDERAL
      let receita: any
      try {
        receita = await fetchReceitaWS(cnpj)
        console.log('[Preview] ✅ ReceitaWS:', receita.nome)
      } catch (e: any) {
        console.error('[Preview] ❌ ReceitaWS:', e.message)
        return NextResponse.json({
          ok: false,
          error: { code: 'RECEITA_ERROR', message: e.message }
        }, { status: 502 })
      }

      // 2️⃣ PRESENÇA DIGITAL (Serper ou Google CSE)
      let digitalPresence: any = null
      try {
        // Tentar extrair domain do email ou buscar
        const domain = receita.email?.split('@')[1] || `${receita.nome.toLowerCase().replace(/\s+/g, '')}.com.br`
        
        console.log('[Preview] 🌐 Buscando presença digital:', domain)
        digitalPresence = await fetchSerper(receita.nome, domain)
        
        if (!digitalPresence) {
          digitalPresence = await fetchGoogleCSE(receita.nome)
        }
        
        console.log('[Preview] ✅ Presença:', digitalPresence?.organic?.length || digitalPresence?.items?.length || 0, 'resultados')
      } catch (e: any) {
        console.error('[Preview] ⚠️ Presença digital:', e.message)
      }

      const latency = Date.now() - startTime

      // 3️⃣ MONTAR RESPOSTA COMPLETA (formato que PreviewModal espera)
      const response = {
        ok: true,
        data: {
          company: {
            id: `preview_${Date.now()}`,
            name: receita.nome,
            cnpj: receita.cnpj,
            tradeName: receita.fantasia || receita.nome,
            domain: digitalPresence?.organic?.[0]?.link?.match(/https?:\/\/([^\/]+)/)?.[1] || null,
            status: receita.situacao,
            capital: parseBRLToNumber(receita.capital_social),
            size: convertPorte(receita.porte),
            city: receita.municipio,
            state: receita.uf,
          },
          // RAW DATA COMPLETO
          receita: {
            identificacao: {
              razaoSocial: receita.nome,
              nomeFantasia: receita.fantasia || receita.nome,
              cnpj: receita.cnpj,
              tipo: receita.tipo,
              porte: receita.porte,
              naturezaJuridica: receita.natureza_juridica,
              dataAbertura: receita.abertura,
              situacao: receita.situacao,
              dataSituacao: receita.data_situacao,
            },
            capital: {
              valor: parseBRLToNumber(receita.capital_social),
              valorOriginal: receita.capital_social
            },
            endereco: {
              logradouro: receita.logradouro,
              numero: receita.numero,
              complemento: receita.complemento,
              bairro: receita.bairro,
              municipio: receita.municipio,
              uf: receita.uf,
              cep: receita.cep,
            },
            contato: {
              telefone: receita.telefone,
              email: receita.email,
            },
            cnae: {
              principal: receita.atividade_principal?.[0] || null,
              secundarias: receita.atividades_secundarias || [],
            },
            qsa: receita.qsa || [],
            simples: {
              optante: receita.simples?.optante || false,
              dataOpcao: receita.simples?.data_opcao,
            },
            mei: {
              optante: receita.simei?.optante || false,
            }
          },
          // PRESENÇA DIGITAL
          presencaDigital: {
            website: digitalPresence?.organic?.[0] ? {
              url: digitalPresence.organic[0].link,
              titulo: digitalPresence.organic[0].title,
              descricao: digitalPresence.organic[0].snippet,
              status: 'ativo',
              validado: true
            } : null,
            noticias: (digitalPresence?.organic || digitalPresence?.items || []).slice(0, 5).map((item: any) => ({
              titulo: item.title,
              link: item.link || item.url,
              descricao: item.snippet || item.description,
              data: item.date || new Date().toISOString(),
              fonte: new URL(item.link || item.url).hostname
            })),
            redesSociais: {
              linkedin: (digitalPresence?.organic || []).find((r: any) => r.link?.includes('linkedin.com')) || null,
              instagram: (digitalPresence?.organic || []).find((r: any) => r.link?.includes('instagram.com')) || null,
              facebook: (digitalPresence?.organic || []).find((r: any) => r.link?.includes('facebook.com')) || null,
              youtube: (digitalPresence?.organic || []).find((r: any) => r.link?.includes('youtube.com')) || null,
              twitter: (digitalPresence?.organic || []).find((r: any) => r.link?.includes('twitter.com') || r.link?.includes('x.com')) || null,
            },
            outrosLinks: digitalPresence?.organic || digitalPresence?.items || []
          },
          // METADATA
          latency,
          timestamp: new Date().toISOString()
        }
      }

      console.log('[Preview] ✅ Resposta montada com sucesso')
      return NextResponse.json(response)
    }

    // Se mode = website, retornar erro por enquanto
    return NextResponse.json({
      ok: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Busca por website não implementada. Use CNPJ.' }
    }, { status: 501 })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[Preview] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' }
    }, { status: 500 })
  }
}

// Helpers
function parseBRLToNumber(input?: string | number | null): number {
  if (!input) return 0
  if (typeof input === 'number') return input
  
  let s = String(input).trim().replace(/^R\$\s?/, '')
  
  // Detectar formato BR: 52.000.000,00 ou 52000000.00
  if (/\,\d{2}$/.test(s)) {
    s = s.replace(/\./g, '').replace(',', '.')
  }
  
  const n = Number(s)
  return Number.isNaN(n) ? 0 : n
}

function convertPorte(porte: string): string {
  const map: Record<string, string> = {
    '00': 'MICRO',
    '01': 'PEQUENO',
    '03': 'MÉDIO',
    '05': 'GRANDE',
    'ME': 'MICRO',
    'EPP': 'PEQUENO',
    'DEMAIS': 'MÉDIO'
  }
  return map[porte] || 'MÉDIO'
}
