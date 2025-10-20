import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { techStackDetector } from '@/lib/services/tech-stack-detector'

export const runtime = 'nodejs'
export const maxDuration = 20 // Tech stack detection: 20s

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json()
    
    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    console.log('[Tech Stack API] 🔍 Iniciando análise para companyId:', companyId)

    // Buscar dados da empresa no Supabase
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error('[Tech Stack API] ❌ Empresa não encontrada:', companyError)
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    console.log('[Tech Stack API] ✅ Empresa encontrada:', company.name)

    // Detectar tech stack usando engine real
    const techStackResults = await techStackDetector.detectTechStack({
      id: company.id,
      name: company.name,
      domain: company.domain,
      cnpj: company.cnpj
    })

    console.log('[Tech Stack API] ✅ Tech stack detectado:', techStackResults.length, 'tecnologias')

    // Salvar resultados no Supabase
    const techStackData = {
      companyId: company.id,
      technologies: techStackResults,
      lastAnalyzed: new Date().toISOString(),
      totalTechnologies: techStackResults.length,
      confirmedTechnologies: techStackResults.filter(t => t.status === 'Confirmado').length,
      averageConfidence: techStackResults.reduce((sum, t) => sum + t.confidence, 0) / techStackResults.length
    }

    // Atualizar ou inserir na tabela TechStack
    const { error: upsertError } = await supabaseAdmin
      .from('TechStack')
      .upsert({
        companyId: company.id,
        technologies: JSON.stringify(techStackResults),
        lastAnalyzed: new Date().toISOString(),
        totalTechnologies: techStackResults.length,
        confirmedTechnologies: techStackResults.filter(t => t.status === 'Confirmado').length,
        averageConfidence: techStackResults.reduce((sum, t) => sum + t.confidence, 0) / techStackResults.length
      }, {
        onConflict: 'companyId'
      })

    if (upsertError) {
      console.error('[Tech Stack API] ❌ Erro ao salvar tech stack:', upsertError)
      // Continuar mesmo com erro de salvamento
    } else {
      console.log('[Tech Stack API] ✅ Tech stack salvo no Supabase')
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        cnpj: company.cnpj
      },
      techStack: techStackResults,
      summary: {
        totalTechnologies: techStackResults.length,
        confirmedTechnologies: techStackResults.filter(t => t.status === 'Confirmado').length,
        averageConfidence: techStackResults.reduce((sum, t) => sum + t.confidence, 0) / techStackResults.length,
        categories: [...new Set(techStackResults.map(t => t.category))],
        vendors: [...new Set(techStackResults.map(t => t.vendor))]
      }
    })

  } catch (error) {
    console.error('[Tech Stack API] ❌ Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    console.log('[Tech Stack API] 📖 Buscando tech stack para companyId:', companyId)

    // Buscar tech stack salvo no Supabase
    const { data: techStack, error: techStackError } = await supabaseAdmin
      .from('TechStack')
      .select('*')
      .eq('companyId', companyId)
      .single()

    if (techStackError || !techStack) {
      console.log('[Tech Stack API] ⚠️ Tech stack não encontrado para companyId:', companyId)
      return NextResponse.json({ 
        success: true,
        techStack: [],
        summary: {
          totalTechnologies: 0,
          confirmedTechnologies: 0,
          averageConfidence: 0,
          categories: [],
          vendors: []
        }
      })
    }

    console.log('[Tech Stack API] ✅ Tech stack encontrado:', techStack.totalTechnologies, 'tecnologias')

    const technologies = JSON.parse(techStack.technologies || '[]')

    return NextResponse.json({
      success: true,
      techStack: technologies,
      summary: {
        totalTechnologies: techStack.totalTechnologies,
        confirmedTechnologies: techStack.confirmedTechnologies,
        averageConfidence: techStack.averageConfidence,
        lastAnalyzed: techStack.lastAnalyzed,
        categories: [...new Set(technologies.map((t: any) => t.category))],
        vendors: [...new Set(technologies.map((t: any) => t.vendor))]
      }
    })

  } catch (error) {
    console.error('[Tech Stack API] ❌ Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
