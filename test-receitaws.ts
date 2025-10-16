/**
 * Teste rápido da API ReceitaWS
 * Execute: npx tsx test-receitaws.ts
 */

import { receitaWS } from './lib/services/receitaws'

async function testar() {
  console.log('🔍 Testando ReceitaWS...\n')
  
  // Testar com CNPJ do Banco do Brasil
  const cnpj = '27865757000102'
  
  try {
    console.log(`Buscando CNPJ: ${cnpj}`)
    const resultado = await receitaWS.buscarPorCNPJ(cnpj)
    
    if (resultado) {
      console.log('\n✅ SUCESSO! Dados recebidos:')
      console.log('━'.repeat(50))
      console.log(`Razão Social: ${resultado.nome}`)
      console.log(`Nome Fantasia: ${resultado.fantasia}`)
      console.log(`Tipo: ${resultado.tipo}`)
      console.log(`Porte: ${resultado.porte}`)
      console.log(`Situação: ${resultado.situacao}`)
      console.log(`Cidade: ${resultado.municipio}/${resultado.uf}`)
      console.log(`Email: ${resultado.email || 'Não informado'}`)
      console.log(`Telefone: ${resultado.telefone || 'Não informado'}`)
      console.log(`Sócios: ${resultado.qsa?.length || 0}`)
      console.log('━'.repeat(50))
      
      // Converter para formato interno
      const dadosInternos = receitaWS.converterParaFormatoInterno(resultado)
      console.log('\n📊 Dados convertidos para formato interno:')
      console.log(JSON.stringify(dadosInternos, null, 2))
      
      // Gerar insights
      const insights = receitaWS.gerarInsights(resultado)
      console.log('\n💡 Insights gerados:')
      insights.forEach(insight => console.log(`  ${insight}`))
      
      // Detectar red flags
      const redFlags = receitaWS.detectarRedFlags(resultado)
      if (redFlags.length > 0) {
        console.log('\n⚠️ Red Flags detectados:')
        redFlags.forEach(flag => console.log(`  ${flag}`))
      } else {
        console.log('\n✅ Nenhum red flag detectado!')
      }
      
      // Score de confiabilidade
      const score = receitaWS.calcularScoreConfiabilidade(resultado)
      console.log(`\n🎯 Score de Confiabilidade: ${score}%`)
      
    } else {
      console.log('❌ Nenhum resultado retornado')
    }
    
  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message)
    console.error('Stack:', error.stack)
  }
}

testar()

