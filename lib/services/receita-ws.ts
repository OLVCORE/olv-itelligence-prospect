/**
 * Serviço de integração com ReceitaWS
 */

interface ReceitaWSResponse {
  cnpj: string
  nome: string
  fantasia?: string
  situacao?: string
  abertura?: string
  capital_social?: string
  porte?: string
  natureza_juridica?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  cep?: string
  email?: string
  telefone?: string
  atividade_principal?: Array<{ code: string; text: string }>
}

export async function fetchReceitaWS(cnpj: string): Promise<ReceitaWSResponse> {
  const token = process.env.RECEITAWS_API_TOKEN
  
  if (!token) {
    throw new Error('RECEITAWS_API_TOKEN não configurado')
  }

  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`
  
  console.log('[ReceitaWS] 🔍 Buscando CNPJ:', cnpj)
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    next: { revalidate: 3600 }, // Cache de 1 hora
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[ReceitaWS] ❌ Erro:', error)
    throw new Error(`ReceitaWS falhou: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.status === 'ERROR') {
    throw new Error(data.message || 'CNPJ não encontrado na ReceitaWS')
  }

  console.log('[ReceitaWS] ✅ Dados obtidos:', data.nome)
  
  return data
}

