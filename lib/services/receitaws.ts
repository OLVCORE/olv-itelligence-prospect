/**
 * ReceitaWS API Integration - COMPLETO
 * API GRATUITA da Receita Federal do Brasil
 * Documentação: https://receitaws.com.br/api
 * 
 * RATE LIMITS: 3 consultas por minuto
 * TIMEOUT: Retorna 504 se precisar buscar em tempo real
 */

export interface ReceitaWSResponse {
  status: string
  message?: string
  ultima_atualizacao: string
  cnpj: string
  tipo: 'MATRIZ' | 'FILIAL'
  porte: string
  nome: string
  fantasia: string
  abertura: string
  atividade_principal: Array<{
    code: string
    text: string
  }>
  atividades_secundarias: Array<{
    code: string
    text: string
  }>
  natureza_juridica: string
  logradouro: string
  numero: string
  complemento: string
  cep: string
  bairro: string
  municipio: string
  uf: string
  email: string
  telefone: string
  efr: string
  situacao: string
  data_situacao: string
  motivo_situacao: string
  situacao_especial: string
  data_situacao_especial: string
  capital_social: string
  qsa: Array<{
    nome: string
    qual: string
    pais_origem?: string
    nome_rep_legal?: string
    qual_rep_legal?: string
  }>
  simples?: {
    optante: boolean
    data_opcao: string
    data_exclusao: string
    ultima_atualizacao: string
  }
  simei?: {
    optante: boolean
    data_opcao: string
    data_exclusao: string
    ultima_atualizacao: string
  }
  billing?: {
    free: boolean
    database: boolean
  }
}

export class ReceitaWSService {
  private baseURL = 'https://receitaws.com.br/v1'
  private apiToken = process.env.RECEITAWS_API_TOKEN || ''
  private requestCount = 0
  private lastRequestTime = 0
  
  /**
   * Controlar rate limit (3 por minuto SEM token, ILIMITADO COM token)
   */
  private async checkRateLimit(): Promise<void> {
    // Se tiver token, não precisa controlar rate limit
    if (this.apiToken) {
      console.log('[ReceitaWS] ✅ Usando API Token - Sem limite de requisições')
      return
    }

    const now = Date.now()
    const oneMinute = 60 * 1000
    
    // Reset contador se passou mais de 1 minuto
    if (now - this.lastRequestTime > oneMinute) {
      this.requestCount = 0
    }
    
    // Se já fez 3 requisições no último minuto, aguardar
    if (this.requestCount >= 3) {
      const waitTime = oneMinute - (now - this.lastRequestTime)
      console.log(`[ReceitaWS] ⚠️ Rate limit atingido (sem token). Aguardando ${Math.ceil(waitTime / 1000)}s...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
      this.requestCount = 0
    }
    
    this.requestCount++
    this.lastRequestTime = now
  }
  
  /**
   * Buscar empresa por CNPJ - API REAL
   */
  async buscarPorCNPJ(cnpj: string): Promise<ReceitaWSResponse | null> {
    try {
      // Limpar CNPJ (remover pontos, traços, barras)
      const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
      
      if (cleanCNPJ.length !== 14) {
        throw new Error('CNPJ deve ter 14 dígitos')
      }

      // Controlar rate limit
      await this.checkRateLimit()

      console.log(`[ReceitaWS] Buscando CNPJ REAL: ${cleanCNPJ}`)
      console.log(`[ReceitaWS] Token disponível: ${this.apiToken ? 'SIM ✅' : 'NÃO ⚠️'}`)

      const headers: HeadersInit = {
        'Accept': 'application/json',
        'User-Agent': 'OLV-Intelligence-System/1.0'
      }

      // Adicionar token se disponível
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`
      }

      const response = await fetch(`${this.baseURL}/cnpj/${cleanCNPJ}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de 3 consultas por minuto excedido. Aguarde alguns instantes.')
        }
        if (response.status === 504) {
          throw new Error('Timeout na consulta. Os dados não estão em cache. Tente novamente em alguns minutos.')
        }
        throw new Error(`Erro na API ReceitaWS: ${response.status}`)
      }

      const data: ReceitaWSResponse = await response.json()

      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado')
      }

      console.log(`[ReceitaWS] ✅ Empresa REAL encontrada: ${data.nome}`)
      console.log(`[ReceitaWS] Tipo: ${data.tipo} | Porte: ${data.porte} | Situação: ${data.situacao}`)
      console.log(`[ReceitaWS] Sócios: ${data.qsa?.length || 0} | Simples: ${data.simples?.optante ? 'Sim' : 'Não'}`)
      
      return data

    } catch (error: any) {
      console.error('[ReceitaWS] ❌ Erro:', error.message)
      throw error
    }
  }

  /**
   * Converter dados ReceitaWS para formato interno COMPLETO
   */
  converterParaFormatoInterno(data: ReceitaWSResponse) {
    return {
      // Dados básicos
      cnpj: data.cnpj,
      razao: data.nome,
      fantasia: data.fantasia || data.nome,
      tipo: data.tipo,
      
      // Localização
      cidade: data.municipio,
      uf: data.uf,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      
      // Classificação
      porte: this.converterPorte(data.porte),
      naturezaJuridica: data.natureza_juridica,
      
      // Status
      situacao: data.situacao,
      dataSituacao: data.data_situacao,
      motivoSituacao: data.motivo_situacao,
      situacaoEspecial: data.situacao_especial,
      
      // Datas
      abertura: data.abertura,
      ultimaAtualizacao: data.ultima_atualizacao,
      
      // Financeiro
      capitalSocial: this.formatarCapitalSocial(data.capital_social),
      
      // Atividades
      cnae: data.atividade_principal?.[0]?.code || '',
      cnaeDescricao: data.atividade_principal?.[0]?.text || '',
      atividadePrincipal: data.atividade_principal,
      atividadesSecundarias: data.atividades_secundarias,
      
      // Contato
      email: data.email,
      telefone: data.telefone,
      
      // Quadro societário
      quadroSocietario: data.qsa?.map(socio => ({
        nome: socio.nome,
        qualificacao: socio.qual,
        paisOrigem: socio.pais_origem,
        representanteLegal: socio.nome_rep_legal,
        qualificacaoRepresentante: socio.qual_rep_legal
      })) || [],
      
      // Regime tributário
      simplesNacional: data.simples?.optante || false,
      mei: data.simei?.optante || false,
      
      // Metadata
      billing: data.billing
    }
  }

  /**
   * Converter porte para padrão interno
   */
  private converterPorte(porte: string): string {
    const porteMap: { [key: string]: string } = {
      '00': 'MICRO',
      '01': 'PEQUENO',
      '03': 'MÉDIO',
      '05': 'GRANDE',
      'ME': 'MICRO',
      'EPP': 'PEQUENO',
      'DEMAIS': 'MÉDIO'
    }

    return porteMap[porte] || 'MÉDIO'
  }

  /**
   * Formatar capital social para mostrar valor REAL
   */
  private formatarCapitalSocial(capital: string): string {
    if (!capital) return 'R$ 0,00'
    
    try {
      // Remover caracteres não numéricos exceto vírgula e ponto
      const cleanCapital = capital.replace(/[^\d,.-]/g, '')
      
      // Converter para número (assumindo formato brasileiro: 1.000.000,00)
      let valor = 0
      if (cleanCapital.includes(',')) {
        // Formato brasileiro: 1.000.000,00
        const parts = cleanCapital.split(',')
        const integerPart = parts[0].replace(/\./g, '')
        const decimalPart = parts[1] || '00'
        valor = parseFloat(integerPart + '.' + decimalPart)
      } else {
        // Formato simples: 1000000
        valor = parseFloat(cleanCapital)
      }
      
      return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    } catch (error) {
      console.error('[ReceitaWS] Erro ao formatar capital social:', capital, error)
      return capital // Retornar valor original se houver erro
    }
  }

  /**
   * Calcular score de confiabilidade REAL baseado nos dados
   */
  calcularScoreConfiabilidade(data: ReceitaWSResponse): number {
    let score = 50 // Base

    // Situação ativa (+20)
    if (data.situacao === 'ATIVA') score += 20

    // Tem capital social significativo (+10)
    if (data.capital_social) {
      const capital = parseFloat(data.capital_social.replace(/[^\d,]/g, '').replace(',', '.'))
      if (capital > 0) score += 10
    }

    // Tem email (+5)
    if (data.email) score += 5

    // Tem telefone (+5)
    if (data.telefone) score += 5

    // Tem quadro societário (+10)
    if (data.qsa && data.qsa.length > 0) score += 10

    // É matriz (+5)
    if (data.tipo === 'MATRIZ') score += 5

    // Dados atualizados recentemente (+10)
    if (data.ultima_atualizacao) {
      const dataAtualizacao = new Date(data.ultima_atualizacao)
      const diasDesdeAtualizacao = Math.floor((Date.now() - dataAtualizacao.getTime()) / (1000 * 60 * 60 * 24))
      if (diasDesdeAtualizacao < 30) score += 10
    }

    return Math.min(score, 100)
  }

  /**
   * Extrair insights REAIS da empresa
   */
  gerarInsights(data: ReceitaWSResponse): string[] {
    const insights: string[] = []

    // Status
    if (data.situacao === 'ATIVA') {
      insights.push('✅ Empresa em situação ATIVA e regular')
    } else {
      insights.push(`⚠️ Situação: ${data.situacao} - ${data.motivo_situacao || 'Verificar motivo'}`)
    }

    // Tipo
    insights.push(`${data.tipo === 'MATRIZ' ? '🏢 Matriz' : '🏪 Filial'} - ${data.tipo}`)

    // Tempo de atividade
    const abertura = new Date(data.abertura.split('/').reverse().join('-'))
    const anos = Math.floor((Date.now() - abertura.getTime()) / (1000 * 60 * 60 * 24 * 365))
    if (anos >= 10) {
      insights.push(`⭐ Empresa consolidada com ${anos} anos de atividade`)
    } else if (anos >= 5) {
      insights.push(`✅ Empresa estabelecida com ${anos} anos de mercado`)
    } else {
      insights.push(`🌱 Empresa em crescimento (${anos} anos)`)
    }

    // Porte
    const porteDescricao: { [key: string]: string } = {
      '00': '🏪 Microempresa - Faturamento até R$ 360k/ano',
      '01': '🏢 Pequena empresa - Faturamento até R$ 4.8M/ano',
      '03': '🏭 Média empresa - Faturamento acima de R$ 4.8M/ano',
      '05': '🏢 Grande empresa - Alto faturamento'
    }
    if (porteDescricao[data.porte]) {
      insights.push(porteDescricao[data.porte])
    }

    // Capital social
    if (data.capital_social) {
      const capital = parseFloat(data.capital_social.replace(/[^\d,]/g, '').replace(',', '.'))
      if (capital >= 10000000) {
        insights.push('💰 Alto capital social (>R$ 10M) indica solidez financeira')
      } else if (capital >= 1000000) {
        insights.push('💵 Capital social relevante (>R$ 1M)')
      }
    }

    // Quadro societário
    if (data.qsa && data.qsa.length > 0) {
      const socios = data.qsa.length
      insights.push(`👥 ${socios} sócio(s) identificado(s) - Quadro societário mapeado`)
    }

    // Regime tributário
    if (data.simples?.optante) {
      insights.push('📊 Optante pelo Simples Nacional')
    }
    if (data.simei?.optante) {
      insights.push('💼 Enquadrado como MEI (Microempreendedor Individual)')
    }

    // Atividade econômica
    if (data.atividade_principal && data.atividade_principal.length > 0) {
      const cnae = data.atividade_principal[0]
      insights.push(`🎯 CNAE Principal: ${cnae.code} - ${cnae.text}`)
    }

    // Contato
    const meiosContato = []
    if (data.email) meiosContato.push('email')
    if (data.telefone) meiosContato.push('telefone')
    if (meiosContato.length > 0) {
      insights.push(`📞 Meios de contato disponíveis: ${meiosContato.join(', ')}`)
    }

    return insights
  }

  /**
   * Detectar possíveis red flags
   */
  detectarRedFlags(data: ReceitaWSResponse): string[] {
    const redFlags: string[] = []

    // Situação não ativa
    if (data.situacao !== 'ATIVA') {
      redFlags.push(`🚨 Empresa ${data.situacao} - ${data.motivo_situacao || 'Verificar situação'}`)
    }

    // Sem capital social
    if (!data.capital_social || parseFloat(data.capital_social) === 0) {
      redFlags.push('⚠️ Capital social não informado ou zerado')
    }

    // Sem quadro societário
    if (!data.qsa || data.qsa.length === 0) {
      redFlags.push('⚠️ Quadro societário não disponível')
    }

    // Sem meios de contato
    if (!data.email && !data.telefone) {
      redFlags.push('⚠️ Sem email ou telefone cadastrado')
    }

    // Situação especial
    if (data.situacao_especial) {
      redFlags.push(`⚠️ Situação especial: ${data.situacao_especial}`)
    }

    // Empresa muito nova (menos de 1 ano)
    const abertura = new Date(data.abertura.split('/').reverse().join('-'))
    const meses = Math.floor((Date.now() - abertura.getTime()) / (1000 * 60 * 60 * 24 * 30))
    if (meses < 12) {
      redFlags.push(`⚠️ Empresa muito recente (${meses} meses) - Avaliar histórico`)
    }

    return redFlags
  }
}

export const receitaWS = new ReceitaWSService()