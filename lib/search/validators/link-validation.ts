/**
 * MÓDULO 9 - Validação ASSERTIVA de Links
 * Valida se um link está realmente vinculado à empresa (CNPJ/razão/fantasia/sócios/domínio)
 */

export interface LinkValidationInput {
  candidateUrl: string
  candidateTitle?: string
  candidateSnippet?: string
  company: {
    cnpj?: string
    razao?: string
    fantasia?: string
    socios?: string[]
    domain?: string
  }
}

export interface LinkValidationResult {
  linked: boolean
  score: number
  confidence: 'high' | 'medium' | 'low' | 'none'
  reasons: string[]
  warnings?: string[]
}

/**
 * Validação ASSERTIVA de vínculo empresa-link
 * 
 * REGRAS:
 * A: domínio oficial/subdomínio → +50; CNPJ na página → +40
 * B: razão/fantasia + termos corporativos → +20; sócio+empresa → +20; links sociais do site oficial → +25
 * C: marketplaces/retails genéricos sem match → score -100; linked=false
 * 
 * linked=true se score≥60 (A); entre 40–59 (B) linked=true com aviso; abaixo disso, descartar
 */
export function validateLink(input: LinkValidationInput): LinkValidationResult {
  const { candidateUrl, candidateTitle = '', candidateSnippet = '', company } = input
  
  let score = 0
  const reasons: string[] = []
  const warnings: string[] = []
  
  const text = `${candidateUrl} ${candidateTitle} ${candidateSnippet}`.toLowerCase()
  const url = candidateUrl.toLowerCase()
  
  // ========================================
  // REGRA A: Domínio oficial/CNPJ (ALTA CONFIANÇA)
  // ========================================
  
  // A1: Domínio oficial ou subdomínio
  if (company.domain) {
    const cleanDomain = company.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '')
    const domainPattern = new RegExp(`[./]${cleanDomain.replace('.', '\\.')}[/.]`, 'i')
    
    if (domainPattern.test(url) || url.includes(cleanDomain)) {
      score += 50
      reasons.push('Domínio oficial ou subdomínio detectado')
    }
  }
  
  // A2: CNPJ explícito no conteúdo
  if (company.cnpj) {
    const cnpjClean = company.cnpj.replace(/\D/g, '')
    const cnpjFormatted = company.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    
    if (text.includes(cnpjClean) || text.includes(cnpjFormatted)) {
      score += 40
      reasons.push('CNPJ encontrado no conteúdo')
    }
  }
  
  // ========================================
  // REGRA B: Razão/Fantasia + Termos Corporativos (MÉDIA CONFIANÇA)
  // ========================================
  
  // B1: Razão social + termos corporativos
  if (company.razao) {
    const razaoWords = company.razao.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const hasRazaoMatch = razaoWords.some(word => text.includes(word))
    const hasCorporateTerms = /sobre|empresa|contato|quem\s+somos|institucional|corporate/i.test(text)
    
    if (hasRazaoMatch && hasCorporateTerms) {
      score += 20
      reasons.push('Razão social + termos corporativos detectados')
    } else if (hasRazaoMatch) {
      score += 10
      reasons.push('Razão social parcialmente detectada')
    }
  }
  
  // B2: Nome fantasia + termos corporativos
  if (company.fantasia && company.fantasia !== company.razao) {
    const fantasiaWords = company.fantasia.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    const hasFantasiaMatch = fantasiaWords.some(word => text.includes(word))
    const hasCorporateTerms = /sobre|empresa|contato|quem\s+somos|institucional|corporate/i.test(text)
    
    if (hasFantasiaMatch && hasCorporateTerms) {
      score += 20
      reasons.push('Nome fantasia + termos corporativos detectados')
    } else if (hasFantasiaMatch) {
      score += 10
      reasons.push('Nome fantasia parcialmente detectado')
    }
  }
  
  // B3: Sócio + empresa
  if (company.socios && company.socios.length > 0) {
    const hasSocioMatch = company.socios.some(socio => {
      const socioWords = socio.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      return socioWords.some(word => text.includes(word))
    })
    
    const hasCompanyName = 
      (company.razao && text.includes(company.razao.toLowerCase())) ||
      (company.fantasia && text.includes(company.fantasia.toLowerCase()))
    
    if (hasSocioMatch && hasCompanyName) {
      score += 20
      reasons.push('Sócio + empresa detectados juntos')
    }
  }
  
  // B4: Links sociais a partir do site oficial
  const isSocialMedia = /instagram\.com|facebook\.com|linkedin\.com|twitter\.com|x\.com|youtube\.com/i.test(url)
  if (isSocialMedia && company.domain) {
    const cleanDomain = company.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '')
    const domainNameParts = cleanDomain.split('.')[0] // Ex.: "olvinternacional" de "olvinternacional.com.br"
    
    if (url.includes(domainNameParts)) {
      score += 25
      reasons.push('Rede social vinculada ao domínio oficial')
    }
  }
  
  // ========================================
  // REGRA C: Filtros de EXCLUSÃO (BAIXA CONFIANÇA / REJEITADO)
  // ========================================
  
  // C1: Marketplaces/retails genéricos sem vínculo oficial
  const genericMarketplaces = [
    'mercadolivre.com.br',
    'mercadolibre.com',
    'amazon.com.br',
    'magazineluiza.com.br',
    'americanas.com.br',
    'shoptime.com.br',
    'submarino.com.br',
    'shopee.com.br',
  ]
  
  const isGenericMarketplace = genericMarketplaces.some(mp => url.includes(mp))
  
  if (isGenericMarketplace) {
    // Só aceitar se tiver vínculo oficial forte (domínio ou CNPJ)
    const hasOfficialLink = 
      (company.domain && url.includes(company.domain.toLowerCase())) ||
      (company.cnpj && text.includes(company.cnpj.replace(/\D/g, '')))
    
    if (!hasOfficialLink) {
      score -= 100
      reasons.push('Marketplace genérico sem vínculo oficial (REJEITADO)')
    }
  }
  
  // C2: PDFs genéricos, documentos públicos sem contexto
  const isGenericDocument = /\.pdf$/i.test(url) || /barueri|documento|arquivo|diario\s+oficial/i.test(text)
  
  if (isGenericDocument) {
    const hasOfficialContext = 
      (company.cnpj && text.includes(company.cnpj.replace(/\D/g, ''))) ||
      (company.razao && text.includes(company.razao.toLowerCase()))
    
    if (!hasOfficialContext) {
      score -= 50
      reasons.push('Documento genérico sem contexto oficial (PENALIZADO)')
    }
  }
  
  // C3: Empresas com nomes similares (ex.: "J.A. Oliveira" vs "OLV Internacional")
  const exclusionPatterns = [
    /j\.a\.\s*oliveira/i,
    /olvglobal/i,
    /olv\s+global/i,
  ]
  
  const hasExclusionPattern = exclusionPatterns.some(pattern => pattern.test(text))
  
  if (hasExclusionPattern) {
    const isOfficialDomain = company.domain && url.includes(company.domain.toLowerCase())
    
    if (!isOfficialDomain) {
      score -= 50
      reasons.push('Padrão de exclusão detectado (empresa similar, não idêntica)')
    }
  }
  
  // ========================================
  // CALCULAR CONFIANÇA E VÍNCULO
  // ========================================
  
  let linked = false
  let confidence: LinkValidationResult['confidence'] = 'none'
  
  if (score >= 60) {
    linked = true
    confidence = 'high'
  } else if (score >= 40) {
    linked = true
    confidence = 'medium'
    warnings.push('Vínculo com confiança média - validação manual recomendada')
  } else if (score >= 20) {
    linked = false
    confidence = 'low'
    warnings.push('Vínculo fraco detectado - descartado')
  } else {
    linked = false
    confidence = 'none'
  }
  
  return {
    linked,
    score,
    confidence,
    reasons,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Validação específica para Jusbrasil (CNPJ primeiro)
 */
export function validateJusbrasil(input: LinkValidationInput): LinkValidationResult {
  const result = validateLink(input)
  
  // Para Jusbrasil, exigir CNPJ ou razão oficial explícita
  const text = `${input.candidateUrl} ${input.candidateTitle || ''} ${input.candidateSnippet || ''}`.toLowerCase()
  
  const hasCnpj = input.company.cnpj && text.includes(input.company.cnpj.replace(/\D/g, ''))
  const hasRazao = input.company.razao && text.includes(input.company.razao.toLowerCase())
  
  if (!hasCnpj && !hasRazao) {
    return {
      linked: false,
      score: 0,
      confidence: 'none',
      reasons: ['Jusbrasil: CNPJ ou razão oficial não encontrados (REJEITADO)'],
    }
  }
  
  return result
}

/**
 * Validação específica para Marketplaces B2B
 */
export function validateMarketplaceB2B(input: LinkValidationInput): LinkValidationResult {
  const result = validateLink(input)
  
  // Para marketplaces B2B, aceitar se tiver pelo menos razão/fantasia + domínio no metadados
  const text = `${input.candidateUrl} ${input.candidateTitle || ''} ${input.candidateSnippet || ''}`.toLowerCase()
  
  const hasCompanyName = 
    (input.company.razao && text.includes(input.company.razao.toLowerCase())) ||
    (input.company.fantasia && text.includes(input.company.fantasia.toLowerCase()))
  
  const hasDomainHint = input.company.domain && text.includes(input.company.domain.toLowerCase())
  
  if (hasCompanyName || hasDomainHint) {
    // Aceitar com score mínimo de 40
    if (result.score < 40) {
      result.score = 40
      result.linked = true
      result.confidence = 'medium'
      result.reasons.push('Marketplace B2B: nome ou domínio detectado (aceitável)')
    }
  }
  
  return result
}

