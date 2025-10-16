// lib/apis/receita-ws.ts
export interface ReceitaWSResponse {
  cnpj: string
  nome: string
  fantasia: string
  tipo: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefone: string
  email: string
  situacao: string
  abertura: string
  natureza_juridica: string
  capital_social: string
  porte: string
  qsa: Array<{
    nome: string
    qual: string
  }>
  extra: {
    cnae_principal: {
      codigo: string
      descricao: string
    }
    cnae_secundarias: Array<{
      codigo: string
      descricao: string
    }>
  }
}

export async function getCompanyByCNPJ(cnpj: string): Promise<ReceitaWSResponse> {
  try {
    const cleanCNPJ = cnpj.replace(/\D/g, '')
    const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cleanCNPJ}`)
    
    if (!response.ok) {
      throw new Error(`Erro na API ReceitaWS: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'ERROR') {
      throw new Error(data.message || 'Erro na consulta do CNPJ')
    }
    
    return data
  } catch (error) {
    console.error('Erro ao consultar ReceitaWS:', error)
    throw error
  }
}

export function transformReceitaWSData(data: ReceitaWSResponse) {
  return {
    cnpj: data.cnpj || '',
    razao: data.nome || '',
    fantasia: data.fantasia || '',
    tipo: data.tipo || '',
    endereco: data.logradouro || '',
    numero: data.numero || '',
    complemento: data.complemento || '',
    bairro: data.bairro || '',
    cidade: data.municipio || '',
    uf: data.uf || '',
    cep: data.cep || '',
    telefone1: data.telefone || '',
    telefone2: '',
    email: data.email || '',
    site: '',
    cnaePrincipal: data.extra?.cnae_principal?.codigo || '',
    textoCnaePrincipal: data.extra?.cnae_principal?.descricao || '',
    cnaeSecundario: data.extra?.cnae_secundarias?.map(c => c.codigo).join(',') || '',
    situacao: data.situacao || '',
    abertura: data.abertura || '',
    naturezaJuridica: data.natureza_juridica || '',
    capitalSocial: data.capital_social || '',
    porte: data.porte || '',
    qsa: data.qsa || []
  }
}
