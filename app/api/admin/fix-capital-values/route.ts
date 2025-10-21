import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  try {
    console.log('🔧 Iniciando correção de valores exorbitantes...')
    
    const sb = supabaseAdmin()
    
    // 1. Verificar valores problemáticos
    const { data: companies, error } = await sb
      .from('Company')
      .select('id, name, capital')
      .gt('capital', 1000000000)
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return NextResponse.json({ error: 'Erro ao buscar empresas' }, { status: 500 })
    }
    
    console.log(`📊 Encontradas ${companies?.length || 0} empresas com valores exorbitantes`)
    
    if (!companies || companies.length === 0) {
      return NextResponse.json({ 
        message: 'Nenhuma empresa com valores exorbitantes encontrada',
        fixed: 0
      })
    }
    
    let fixedCount = 0
    const corrections = []
    
    // 2. Corrigir valores
    for (const company of companies) {
      if (!company.capital) continue
      
      let newCapital = company.capital
      
      if (company.capital > 1000000000000) {
        newCapital = company.capital / 1000000  // Dividir por 1 milhão
      } else if (company.capital > 100000000000) {
        newCapital = company.capital / 100000    // Dividir por 100 mil
      } else if (company.capital > 10000000000) {
        newCapital = company.capital / 10000      // Dividir por 10 mil
      } else if (company.capital > 1000000000) {
        newCapital = company.capital / 1000        // Dividir por 1 mil
      }
      
      const { error: updateError } = await sb
        .from('Company')
        .update({ capital: newCapital })
        .eq('id', company.id)
      
      if (updateError) {
        console.error(`❌ Erro ao corrigir ${company.name}:`, updateError)
      } else {
        console.log(`✅ ${company.name}: R$ ${company.capital?.toLocaleString('pt-BR')} → R$ ${newCapital.toLocaleString('pt-BR')}`)
        corrections.push({
          id: company.id,
          name: company.name,
          oldCapital: company.capital,
          newCapital: newCapital
        })
        fixedCount++
      }
    }
    
    console.log(`🎉 Correção concluída! ${fixedCount} empresas corrigidas`)
    
    return NextResponse.json({ 
      message: `Correção concluída! ${fixedCount} empresas corrigidas`,
      fixed: fixedCount,
      corrections: corrections
    })
    
  } catch (error: any) {
    console.error('❌ Erro na correção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}