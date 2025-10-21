import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { parseBRLToNumber } from '@/lib/utils/format'

export const runtime = 'nodejs'
export const maxDuration = 10

/**
 * API para buscar dados completos de empresa já cadastrada
 * Retorna estrutura igual ao /api/companies/preview para PreviewModal
 */
export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()
    
    if (!companyId) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_COMPANY_ID', message: 'ID da empresa é obrigatório' }
      }, { status: 400 })
    }

    console.log('[CompanyPreview] 🔍 Buscando empresa:', companyId)

    const sb = supabaseAdmin()

    // Buscar empresa completa
    const { data: company, error: companyError } = await sb
      .from('Company')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      return NextResponse.json({
        ok: false,
        error: { code: 'COMPANY_NOT_FOUND', message: 'Empresa não encontrada' }
      }, { status: 404 })
    }

    // Buscar dados raw_data (ReceitaWS)
    const rawData = company.rawData || {}
    const receita = rawData.receita || {}

    // Buscar presença digital
    const { data: digitalPresence } = await sb
      .from('CompanyDigitalPresence')
      .select('*')
      .eq('companyId', companyId)
      .maybeSingle()

    // Buscar maturidade digital
    const { data: maturity } = await sb
      .from('CompanyTechMaturity')
      .select('*')
      .eq('companyId', companyId)
      .maybeSingle()

    // Montar resposta no formato do PreviewModal
    const response = {
      ok: true,
      data: {
        company: {
          id: company.id,
          name: company.name,
          cnpj: company.cnpj,
          tradeName: company.tradeName || company.name,
          domain: company.domain,
          status: company.status,
          capital: company.capital,
          size: company.size,
          city: company.location?.cidade || receita.municipio,
          state: company.location?.estado || receita.uf,
        },
        // RAW DATA COMPLETO
        receita: {
          identificacao: {
            razaoSocial: receita.nome || company.name,
            nomeFantasia: receita.fantasia || company.tradeName,
            cnpj: receita.cnpj || company.cnpj,
            tipo: receita.tipo || 'MATRIZ',
            porte: receita.porte || company.size,
            naturezaJuridica: receita.natureza_juridica,
            dataAbertura: receita.abertura,
            situacao: receita.situacao || company.status,
            dataSituacao: receita.data_situacao,
          },
          capital: {
            valor: company.capital || parseBRLToNumber(receita.capital_social),
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
          website: digitalPresence?.website ? {
            url: digitalPresence.website,
            titulo: company.name,
            descricao: `Website oficial da ${company.name}`,
            status: 'ativo',
            validado: true
          } : null,
          noticias: digitalPresence?.noticias || [],
          redesSociais: {
            linkedin: digitalPresence?.linkedin || null,
            instagram: digitalPresence?.instagram || null,
            facebook: digitalPresence?.facebook || null,
            youtube: digitalPresence?.youtube || null,
            twitter: digitalPresence?.twitter || null,
          },
          outrosLinks: digitalPresence?.outrosLinks || []
        },
        // MATURIDADE DIGITAL
        maturidadeDigital: maturity ? {
          score: maturity.overallScore || 0,
          infraestrutura: maturity.infrastructureScore || 0,
          sistemas: maturity.systemsScore || 0,
          processos: maturity.processesScore || 0,
          seguranca: maturity.securityScore || 0,
          inovacao: maturity.innovationScore || 0,
        } : null,
        // METADATA
        timestamp: new Date().toISOString()
      }
    }

    console.log('[CompanyPreview] ✅ Dados montados com sucesso')
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('[CompanyPreview] ❌ Erro:', error.message)

    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' }
    }, { status: 500 })
  }
}
