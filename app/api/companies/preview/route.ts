import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeCnpj, isValidCnpj, normalizeDomain } from '@/lib/utils/cnpj'
import { receitaWS } from '@/lib/services/receitaws'
import { fetchGoogleCSE } from '@/lib/services/google-cse'

export const runtime = 'nodejs'
export const maxDuration = 15 // Preview with ReceitaWS + Google CSE: 15s

// Schema de validação
const previewSchema = z.object({
  query: z.string().min(1, "Query é obrigatória"),
  mode: z.enum(['cnpj', 'website'], {
    errorMap: () => ({ message: "Mode deve ser 'cnpj' ou 'website'" })
  })
})

export async function POST(req: Request) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    console.log('[CompanyPreview] Input recebido:', { query: body.query?.substring(0, 20) + '...', mode: body.mode })

    // Validar input
    const validation = previewSchema.safeParse(body)
    if (!validation.success) {
      console.log('[CompanyPreview] Input inválido:', validation.error.issues)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { query, mode } = validation.data
    let receitaData: any = null
    let googleData: any = null

    // BUSCAR RECEITA FEDERAL
    if (mode === 'cnpj') {
      const normalizedCnpj = normalizeCnpj(query)
      
      if (!isValidCnpj(normalizedCnpj)) {
        return NextResponse.json({
          ok: false,
          error: {
            code: 'INVALID_CNPJ',
            message: 'CNPJ inválido. Verifique os dígitos verificadores.'
          }
        }, { status: 422 })
      }

      try {
        console.log('[CompanyPreview] 📋 Buscando ReceitaWS...')
        receitaData = await receitaWS.buscarPorCNPJ(normalizedCnpj)
        console.log('[CompanyPreview] ✅ ReceitaWS retornou:', receitaData?.nome)
      } catch (receitaError: any) {
        console.error('[CompanyPreview] ❌ ReceitaWS falhou:', receitaError.message)
        return NextResponse.json({
          ok: false,
          error: {
            code: 'PROVIDER_ERROR',
            message: `Erro ao buscar dados da Receita Federal: ${receitaError.message}`
          }
        }, { status: 502 })
      }
    }

    // BUSCAR GOOGLE CSE (se temos dados da receita)
    if (receitaData) {
      try {
        console.log('[CompanyPreview] 🌐 Buscando presença digital...')
        googleData = await fetchGoogleCSE(receitaData.nome, receitaData.cnpj)
        console.log('[CompanyPreview] ✅ Presença digital:', {
          website: googleData?.website?.url || 'não encontrado',
          news: googleData?.news?.length || 0
        })
      } catch (googleError: any) {
        console.error('[CompanyPreview] ⚠️ Google CSE falhou:', googleError.message)
        // Não é crítico - continuar sem presença digital
      }
    }

    const latency = Date.now() - startTime
    console.log(`[CompanyPreview] ✅ Preview completo em ${latency}ms`)
    
    // MONTAR RESPOSTA NO FORMATO QUE O PREVIEWMODAL ESPERA
    const response = {
      ok: true,
      data: {
        // Dados da empresa (formato simplificado)
        company: {
          id: `comp_preview_${Date.now()}`,
          cnpj: receitaData?.cnpj,
          name: receitaData?.nome,
          tradeName: receitaData?.fantasia,
          domain: googleData?.website?.url,
          status: receitaData?.situacao,
          capital: parseCapitalSocial(receitaData?.capital_social),
          size: convertPorte(receitaData?.porte)
        },
        // Dados completos da ReceitaWS (raw)
        receita: receitaData,
        // Seção 1: Identificação
        nome: receitaData?.nome,
        fantasia: receitaData?.fantasia,
        cnpj: receitaData?.cnpj,
        tipo: receitaData?.tipo,
        porte: receitaData?.porte,
        situacao: receitaData?.situacao,
        abertura: receitaData?.abertura,
        naturezaJuridica: receitaData?.natureza_juridica,
        // Seção 1: Capital
        capitalSocial: receitaData?.capital_social,
        // Seção 1: Endereço
        logradouro: receitaData?.logradouro,
        numero: receitaData?.numero,
        complemento: receitaData?.complemento,
        bairro: receitaData?.bairro,
        cep: receitaData?.cep,
        municipio: receitaData?.municipio,
        uf: receitaData?.uf,
        // Seção 1: Contato
        telefone: receitaData?.telefone,
        email: receitaData?.email,
        // Seção 1: CNAE
        cnae: receitaData?.atividade_principal?.[0]?.code,
        cnaeDescricao: receitaData?.atividade_principal?.[0]?.text,
        atividadesSecundarias: receitaData?.atividades_secundarias || [],
        // Seção 1: QSA (Quadro Societário)
        qsa: receitaData?.qsa || [],
        // Seção 1: Regime
        simplesNacional: receitaData?.simples?.optante || false,
        mei: receitaData?.simei?.optante || false,
        // Seção 2: Presença Digital
        presencaDigital: {
          website: googleData?.website || null,
          noticias: googleData?.news || [],
          redesSociais: {
            linkedin: null, // TODO: Detectar do googleData
            facebook: null,
            instagram: null,
            twitter: null,
            youtube: null
          },
          marketplaces: [], // TODO: Detectar do googleData
          outrosLinks: googleData?.news?.map((n: any) => ({
            tipo: 'Notícia',
            url: n.link,
            titulo: n.title,
            descricao: n.snippet
          })) || []
        },
        // Metadata
        mode,
        latency
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[CompanyPreview] ❌ Erro geral em ${latency}ms:`, error.message)

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
function parseCapitalSocial(capital: string | undefined): number {
  if (!capital) return 0
  
  // Remover caracteres não numéricos exceto ponto e vírgula
  const cleaned = capital.replace(/[^\d.,]/g, '')
  
  // Se tem vírgula, é formato BR: 52.000.000,00
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',')
    const integerPart = parts[0].replace(/\./g, '')
    const decimalPart = parts[1] || '00'
    return parseFloat(integerPart + '.' + decimalPart)
  }
  
  // Se tem ponto mas não vírgula, pode ser: 52000000.00
  return parseFloat(cleaned)
}

function convertPorte(porte: string | undefined): string {
  if (!porte) return 'MÉDIO'
  
  const porteMap: Record<string, string> = {
    '00': 'MICRO',
    '01': 'PEQUENO',
    '03': 'MÉDIO',
    '05': 'GRANDE',
    'ME': 'MICRO',
    'EPP': 'PEQUENO',
    'DEMAIS': 'MÉDIO'
  }

  return porteMap[porte] || 'MÉDIO'
}
