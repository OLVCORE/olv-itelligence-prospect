/**
 * SCRIPT DE ATIVAÇÃO - Analisar empresas e popular dados REAIS
 * Executa análise completa para cada empresa no banco
 */

import { supabaseAdmin } from '../lib/supabase/admin'

async function activateCompanies() {
  console.log('🚀 INICIANDO ATIVAÇÃO DE EMPRESAS...\n')

  try {
    // 1. Buscar empresas sem análise
    const { data: companies, error } = await supabaseAdmin
      .from('Company')
      .select('id, cnpj, name, tradeName, domain')
      .order('createdAt', { ascending: true })

    if (error || !companies) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }

    console.log(`📊 Encontradas ${companies.length} empresas\n`)

    // 2. Analisar cada empresa
    for (const company of companies) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`🔍 Analisando: ${company.tradeName || company.name}`)
      console.log(`   CNPJ: ${company.cnpj}`)
      console.log(`   Domain: ${company.domain || 'não descoberto ainda'}`)

      try {
        // Chamar API de busca (que salva análise)
        const response = await fetch('http://localhost:3000/api/companies/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cnpj: company.cnpj,
            useAI: true // Ativar análise de IA
          })
        })

        const result = await response.json()

        if (result.status === 'success') {
          console.log(`✅ SUCESSO!`)
          console.log(`   Domain descoberto: ${result.company?.domain || 'N/A'}`)
          console.log(`   Análise salva: ${result.analysis ? 'SIM' : 'NÃO'}`)
          console.log(`   Score: ${result.analysis?.score || 'N/A'}`)
        } else {
          console.log(`⚠️ AVISO: ${result.message}`)
        }

        // Rate limit: aguardar 3s entre cada empresa
        console.log(`   Aguardando 3s...`)
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error: any) {
        console.log(`❌ ERRO: ${error.message}`)
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`\n✅ ATIVAÇÃO COMPLETA!`)
    console.log(`\n📊 Resumo:`)
    console.log(`   Total de empresas: ${companies.length}`)
    console.log(`\n🎯 Próximo: Recarregar dashboard para ver dados REAIS\n`)

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message)
    process.exit(1)
  }
}

// Executar
activateCompanies()

