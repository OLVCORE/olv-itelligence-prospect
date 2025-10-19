import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * DELETE /api/companies/delete-all
 * LIMPA TODAS AS EMPRESAS E ANÁLISES (CACHE LIMPO)
 */
export async function DELETE() {
  try {
    console.log('[DELETE-ALL] 🗑️ Iniciando limpeza completa do banco...')

    // 1. Deletar TODAS as análises primeiro (FK constraint)
    const { error: analysisError, count: analysisCount } = await supabaseAdmin
      .from('Analysis')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (analysisError) {
      console.error('[DELETE-ALL] ❌ Erro ao deletar análises:', analysisError)
    } else {
      console.log(`[DELETE-ALL] ✅ ${analysisCount || 0} análises deletadas`)
    }

    // 2. Deletar TODAS as empresas
    const { error: companyError, count: companyCount } = await supabaseAdmin
      .from('Company')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar tudo

    if (companyError) {
      console.error('[DELETE-ALL] ❌ Erro ao deletar empresas:', companyError)
      return NextResponse.json(
        { 
          status: 'error', 
          message: 'Erro ao deletar empresas',
          error: companyError.message 
        },
        { status: 500 }
      )
    }

    console.log(`[DELETE-ALL] ✅ ${companyCount || 0} empresas deletadas`)
    console.log('[DELETE-ALL] 🎉 Banco de dados LIMPO!')

    return NextResponse.json({
      status: 'success',
      message: 'Todas as empresas e análises foram deletadas',
      deleted: {
        companies: companyCount || 0,
        analyses: analysisCount || 0
      }
    })

  } catch (error: any) {
    console.error('[DELETE-ALL] ❌ ERRO:', error.message)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Erro interno ao deletar empresas',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

