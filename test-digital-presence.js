/**
 * Script de teste para diagnosticar presença digital
 * Simula a busca para OLV Internacional
 */

const companyName = "OLV INTERNACIONAL COMERCIO IMPORTACAO E EXPORTACAO LTDA"
const cnpj = "67867580000190"
const fantasia = "OLV INTERNACIONAL"

console.log('========================================')
console.log('TESTE DE PRESENÇA DIGITAL')
console.log('========================================')
console.log('Empresa:', companyName)
console.log('CNPJ:', cnpj)
console.log('Fantasia:', fantasia)
console.log('========================================\n')

// Simular validação
const testCases = [
  {
    name: 'Instagram OLV',
    url: 'https://www.instagram.com/olvinternacional',
    title: 'OLV Internacional (@olvinternacional) • Instagram',
    snippet: 'Seguidores, seguindo, publicações - Veja as fotos e vídeos do Instagram de OLV Internacional',
  },
  {
    name: 'LinkedIn OLV',
    url: 'https://www.linkedin.com/company/26251289',
    title: 'OLV Internacional | LinkedIn',
    snippet: 'OLV Internacional - Comércio Internacional, Importação e Exportação',
  },
  {
    name: 'B2Brazil',
    url: 'https://b2brazil.com.br/company/olv-internacional',
    title: 'OLV Internacional - B2Brazil',
    snippet: 'OLV Internacional - Empresa de comércio exterior',
  },
  {
    name: 'Americanas (genérico)',
    url: 'https://www.americanas.com.br/produto/123456',
    title: 'Produto XYZ - Americanas',
    snippet: 'Compre online Produto XYZ',
  },
]

console.log('TESTE DE VALIDAÇÃO:\n')

testCases.forEach((test, i) => {
  console.log(`${i + 1}. ${test.name}`)
  console.log(`   URL: ${test.url}`)
  
  // Simular score
  let score = 0
  const reasons = []
  
  const text = `${test.url} ${test.title} ${test.snippet}`.toLowerCase()
  
  // Domínio oficial (simulando que já foi detectado)
  const domain = 'olvinternacional.com.br'
  
  // REGRA A: Domínio oficial
  if (text.includes(domain)) {
    score += 50
    reasons.push('Domínio oficial detectado')
  }
  
  // REGRA A: CNPJ
  if (text.includes(cnpj)) {
    score += 40
    reasons.push('CNPJ encontrado')
  }
  
  // REGRA B: Nome da empresa
  const nameWords = ['olv', 'internacional']
  const hasName = nameWords.some(w => text.includes(w))
  if (hasName) {
    score += 20
    reasons.push('Nome da empresa encontrado')
  }
  
  // REGRA B: Redes sociais vinculadas
  const isSocial = /instagram\.com|facebook\.com|linkedin\.com|twitter\.com|youtube\.com/i.test(test.url)
  if (isSocial) {
    const domainPart = domain.split('.')[0] // 'olvinternacional'
    if (text.includes(domainPart)) {
      score += 25
      reasons.push('Rede social vinculada ao domínio')
    }
  }
  
  // REGRA C: Marketplace genérico
  const genericMarketplace = /americanas|magazineluiza|shopee|mercadolivre/i.test(test.url)
  if (genericMarketplace && !text.includes(domain) && !text.includes(cnpj)) {
    score -= 100
    reasons.push('Marketplace genérico sem vínculo (REJEITADO)')
  }
  
  const isValid = score >= 50
  const confidence = score >= 60 ? 'ALTA' : score >= 40 ? 'MÉDIA' : 'BAIXA'
  
  console.log(`   Score: ${score}`)
  console.log(`   Confiança: ${confidence}`)
  console.log(`   Válido: ${isValid ? '✅ SIM' : '❌ NÃO'}`)
  console.log(`   Razões: ${reasons.join('; ')}`)
  console.log('')
})

console.log('========================================')
console.log('RESULTADO ESPERADO:')
console.log('========================================')
console.log('1. Instagram: ✅ VÁLIDO (score 45+)')
console.log('2. LinkedIn: ✅ VÁLIDO (score 45+)')
console.log('3. B2Brazil: ✅ VÁLIDO (score 20+)')
console.log('4. Americanas: ❌ REJEITADO (score -100)')
console.log('========================================')

