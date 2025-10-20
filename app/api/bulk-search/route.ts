import { NextRequest, NextResponse } from 'next/server'
import { scalableSearchService } from '@/lib/services/scalable-search'
import { BulkSearchRequest, SearchFields } from '@/lib/types/search-fields'

export const runtime = 'nodejs'
export const maxDuration = 60 // Bulk search with multiple companies: 60s

export async function POST(request: NextRequest) {
  try {
    console.log('[API /bulk-search] 🚀 Recebendo requisição de busca em massa')
    
    const body = await request.json()
    console.log('[API /bulk-search] 📊 Dados recebidos:', {
      companiesCount: body.companies?.length || 0,
      options: body.options
    })

    // Validar estrutura da requisição
    if (!body.companies || !Array.isArray(body.companies)) {
      return NextResponse.json(
        { error: 'Campo "companies" é obrigatório e deve ser um array' },
        { status: 400 }
      )
    }

    // Validar cada empresa
    const validatedCompanies: SearchFields[] = []
    const validationErrors: string[] = []

    body.companies.forEach((company: any, index: number) => {
      if (!company.cnpj || !company.razaoSocial) {
        validationErrors.push(`Empresa ${index + 1}: CNPJ e Razão Social são obrigatórios`)
        return
      }

      validatedCompanies.push({
        cnpj: company.cnpj,
        razaoSocial: company.razaoSocial,
        website: company.website,
        nomeFantasia: company.nomeFantasia,
        marca: company.marca,
        socios: company.socios || [],
        additionalInfo: company.additionalInfo,
        metadata: company.metadata
      })
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validationErrors },
        { status: 400 }
      )
    }

    // Preparar requisição para o serviço
    const searchRequest: BulkSearchRequest = {
      companies: validatedCompanies,
      options: {
        parallel: body.options?.parallel ?? true,
        maxConcurrent: body.options?.maxConcurrent ?? 5,
        timeout: body.options?.timeout ?? 10000,
        retryAttempts: body.options?.retryAttempts ?? 2
      }
    }

    console.log('[API /bulk-search] ⚙️ Configurações:', searchRequest.options)

    // Executar busca em massa
    const startTime = Date.now()
    const results = await scalableSearchService.searchBulk(searchRequest)
    const totalTime = Date.now() - startTime

    console.log(`[API /bulk-search] ✅ Busca concluída em ${totalTime}ms`)
    console.log(`[API /bulk-search] 📊 Resumo: ${results.summary.successful}/${results.summary.total} sucessos`)

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        processedAt: new Date().toISOString(),
        totalTime: totalTime,
        version: '1.0.0'
      }
    })

  } catch (error: any) {
    console.error('[API /bulk-search] ❌ Erro:', error.message)
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Busca em Massa - OLV Intelligence',
    version: '1.0.0',
    endpoints: {
      'POST /api/bulk-search': 'Executar busca em massa para múltiplas empresas',
      'GET /api/bulk-search': 'Informações da API'
    },
    example: {
      companies: [
        {
          cnpj: '12345678000195',
          razaoSocial: 'EMPRESA EXEMPLO LTDA',
          nomeFantasia: 'Empresa Exemplo',
          website: 'https://empresaexemplo.com.br',
          socios: ['João Silva', 'Maria Santos'],
          additionalInfo: {
            aliases: ['Empresa Ex', 'Exemplo Corp'],
            socialHandles: {
              instagram: '@empresaexemplo',
              linkedin: 'empresa-exemplo'
            },
            industry: 'Tecnologia',
            keywords: ['software', 'desenvolvimento']
          }
        }
      ],
      options: {
        parallel: true,
        maxConcurrent: 5,
        timeout: 10000,
        retryAttempts: 2
      }
    }
  })
}
