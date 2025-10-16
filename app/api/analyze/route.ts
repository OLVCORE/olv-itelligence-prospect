import { NextRequest, NextResponse } from 'next/server'
import { RealAnalysisEngine } from '@/lib/real-analysis-engine'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 })
    }

    console.log(`[API /analyze] Iniciando análise para empresa ${companyId}`)

    // Buscar empresa no banco de dados
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    console.log(`[API /analyze] Empresa encontrada: ${company.name}`)

    // Executar análise REAL com o motor de inteligência
    const analysisResult = await RealAnalysisEngine.analyzeCompany(companyId)

    console.log(`[API /analyze] Análise concluída para ${company.name}`)

    // Registrar auditoria
    await prisma.auditLog.create({
      data: {
        userId: 'system-user', // Em produção, usar o ID do usuário logado
        action: `Análise completa da empresa ${company.name} (${companyId})`,
        entityType: 'Company',
        entityId: companyId,
        details: JSON.stringify({
          techStackItems: analysisResult.techStack.length,
          decisionMakers: analysisResult.decisionMakers.length,
          maturityScore: analysisResult.scores.maturity,
          propensityScore: analysisResult.scores.propensity,
          estimatedTicket: analysisResult.estimatedTicket
        })
      }
    })

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      message: `Análise concluída para ${company.name}`
    }, { status: 200 })

  } catch (error: any) {
    console.error('[API /analyze] Erro:', error)
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor ao realizar análise',
      details: error.message 
    }, { status: 500 })
  }
}