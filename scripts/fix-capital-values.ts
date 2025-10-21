import { supabaseAdmin } from '../lib/supabase/admin'

async function fixCapitalValues() {
  console.log('🔧 Iniciando correção de valores exorbitantes...')
  
  const sb = supabaseAdmin()
  
  // 1. Verificar valores problemáticos
  const { data: companies, error } = await sb
    .from('Company')
    .select('id, name, capital')
    .gt('capital', 1000000000)
  
  if (error) {
    console.error('❌ Erro ao buscar empresas:', error)
    return
  }
  
  console.log(`📊 Encontradas ${companies?.length || 0} empresas com valores exorbitantes:`)
  companies?.forEach(company => {
    console.log(`- ${company.name}: R$ ${company.capital?.toLocaleString('pt-BR')}`)
  })
  
  if (!companies || companies.length === 0) {
    console.log('✅ Nenhuma empresa com valores exorbitantes encontrada')
    return
  }
  
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
    }
  }
  
  console.log('🎉 Correção concluída!')
}

// Executar se chamado diretamente
if (require.main === module) {
  fixCapitalValues()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro:', error)
      process.exit(1)
    })
}

export { fixCapitalValues }
