import { prisma } from "./db"
import { receitaWS } from "./services/receitaws"

export interface CompanySearchResult {
  cnpj: string
  razao: string
  fantasia: string
  cidade: string
  uf: string
  porte: string
  situacao: string
  abertura: string
  naturezaJuridica: string
  capitalSocial: string
  cnae: string
  email?: string
  telefone?: string
  website?: string
}

export class CompanySearchEngine {
  
  /**
   * Buscar empresa por CNPJ usando ReceitaWS REAL
   */
  static async searchByCNPJ(cnpj: string): Promise<CompanySearchResult | null> {
    try {
      console.log('[CompanySearchEngine] Buscando empresa na ReceitaWS REAL:', cnpj)
      
      // Buscar DADOS REAIS na ReceitaWS
      const receitaData = await receitaWS.buscarPorCNPJ(cnpj)
      
      if (!receitaData) {
        return null
      }

      // Converter para formato interno
      const companyData = receitaWS.converterParaFormatoInterno(receitaData)

      console.log('[CompanySearchEngine] Empresa REAL encontrada:', companyData.razao)

      return {
        cnpj: companyData.cnpj,
        razao: companyData.razao,
        fantasia: companyData.fantasia,
        cidade: companyData.cidade,
        uf: companyData.uf,
        porte: companyData.porte,
        situacao: companyData.situacao,
        abertura: companyData.abertura,
        naturezaJuridica: companyData.naturezaJuridica,
        capitalSocial: companyData.capitalSocial,
        cnae: companyData.cnae,
        email: companyData.email,
        telefone: companyData.telefone,
        website: '' // TODO: Buscar website via Google/BuiltWith
      }
    } catch (error: any) {
      console.error('[CompanySearchEngine] Erro ao buscar empresa por CNPJ:', error)
      throw error
    }
  }

  /**
   * Buscar empresa por website/domínio
   */
  static async searchByWebsite(website: string): Promise<CompanySearchResult | null> {
    try {
      // Limpar website
      const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      
      // Simular busca por domínio (em produção seria uma chamada real)
      const mockData = await this.simulateWebsiteSearch(cleanWebsite)
      
      if (!mockData) {
        return null
      }

      return {
        cnpj: mockData.cnpj,
        razao: mockData.nome,
        fantasia: mockData.fantasia || mockData.nome,
        cidade: mockData.municipio,
        uf: mockData.uf,
        porte: this.determineCompanySize(mockData.capital_social),
        situacao: mockData.situacao,
        abertura: mockData.abertura,
        naturezaJuridica: mockData.natureza_juridica,
        capitalSocial: `R$ ${mockData.capital_social?.toLocaleString('pt-BR') || '0'}`,
        cnae: mockData.cnae_fiscal_principal?.codigo || '',
        email: mockData.email,
        telefone: mockData.telefone,
        website: cleanWebsite
      }
    } catch (error) {
      console.error('Erro ao buscar empresa por website:', error)
      return null
    }
  }

  /**
   * Salvar empresa no banco de dados
   */
  static async saveCompany(companyData: CompanySearchResult, projectId: string): Promise<string> {
    try {
      const company = await prisma.company.create({
        data: {
          projectId,
          name: companyData.razao,
          cnpj: companyData.cnpj,
          domain: companyData.website || '',
          cnae: companyData.cnae,
          industry: this.determineIndustry(companyData.cnae),
          size: companyData.porte.toLowerCase(),
          financial: JSON.stringify({
            receita: this.parseCapitalSocial(companyData.capitalSocial),
            porte: companyData.porte,
            risco: this.determineRiskLevel(companyData.porte),
            faturamento: this.parseCapitalSocial(companyData.capitalSocial)
          }),
          location: JSON.stringify({
            cidade: companyData.cidade,
            estado: companyData.uf,
            pais: 'Brasil'
          })
        }
      })

      return company.id
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      throw error
    }
  }

  // Métodos de simulação removidos - agora usamos APIs REAIS

  /**
   * Determinar porte da empresa baseado no capital social
   */
  private static determineCompanySize(capitalSocial: number): string {
    if (capitalSocial >= 50000000) return 'GRANDE'
    if (capitalSocial >= 10000000) return 'MÉDIO'
    return 'PEQUENO'
  }

  /**
   * Determinar indústria baseado no CNAE
   */
  private static determineIndustry(cnae: string): string {
    if (cnae.startsWith('62')) return 'Tecnologia'
    if (cnae.startsWith('70')) return 'Consultoria'
    if (cnae.startsWith('47')) return 'Comércio'
    if (cnae.startsWith('41')) return 'Construção'
    return 'Outros'
  }

  /**
   * Determinar nível de risco
   */
  private static determineRiskLevel(porte: string): string {
    switch (porte) {
      case 'GRANDE': return 'BAIXO'
      case 'MÉDIO': return 'MÉDIO'
      case 'PEQUENO': return 'ALTO'
      default: return 'MÉDIO'
    }
  }

  /**
   * Converter capital social para número
   */
  private static parseCapitalSocial(capitalSocial: string): number {
    return parseFloat(capitalSocial.replace(/[^\d,]/g, '').replace(',', '.')) || 0
  }
}

export const companySearchEngine = CompanySearchEngine
