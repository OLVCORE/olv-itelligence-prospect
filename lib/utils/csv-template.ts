/**
 * Gerador de Template CSV para Upload em Massa
 * 
 * ESTRUTURA DO CSV:
 * - CNPJ (obrigatório)
 * - Razão Social (opcional - será preenchido pela ReceitaWS)
 * - Nome Fantasia (opcional)
 * - Prioridade (1-5, padrão: 3)
 * - Instagram (handle sem @)
 * - LinkedIn (company handle)
 * - Facebook (page name)
 * - YouTube (channel name)
 * - X/Twitter (handle sem @)
 * - Website (URL completa)
 * - Observações (texto livre)
 */

export interface CSVTemplateRow {
  cnpj: string
  razao_social?: string
  nome_fantasia?: string
  prioridade?: 1 | 2 | 3 | 4 | 5
  instagram?: string
  linkedin?: string
  facebook?: string
  youtube?: string
  twitter?: string
  website?: string
  observacoes?: string
}

/**
 * Gera CSV template para download
 */
export function generateCSVTemplate(): string {
  const headers = [
    'CNPJ',
    'Razao Social',
    'Nome Fantasia',
    'Prioridade (1-5)',
    'Instagram',
    'LinkedIn',
    'Facebook',
    'YouTube',
    'X/Twitter',
    'Website',
    'Observacoes'
  ]

  const exampleRows = [
    [
      '00000000000191', // CNPJ Exemplo (Receita Federal)
      '', // Será preenchido automaticamente
      'Nome Fantasia Exemplo',
      '3', // Prioridade média
      'exemploempresa', // Instagram (sem @)
      'exemploempresa', // LinkedIn (company)
      'exemploempresa', // Facebook
      'exemploempresa', // YouTube
      'exemploempresa', // X/Twitter (sem @)
      'https://www.exemplo.com.br',
      'Observações opcionais sobre a empresa'
    ],
    [
      '', // CNPJ vazio para usuário preencher
      '',
      '',
      '3',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ]
  ]

  // Gerar CSV com BOM UTF-8 para Excel
  const BOM = '\uFEFF'
  const headerLine = headers.join(',')
  const dataLines = exampleRows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  )

  return BOM + [headerLine, ...dataLines].join('\n')
}

/**
 * Download do template CSV
 */
export function downloadCSVTemplate() {
  const csv = generateCSVTemplate()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `olv-prospeccao-template-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Parse CSV uploaded
 */
export function parseCSVFile(file: File): Promise<CSVTemplateRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        // Remover BOM e header
        const dataLines = lines.slice(1)
        
        const rows: CSVTemplateRow[] = dataLines.map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim())
          
          return {
            cnpj: values[0],
            razao_social: values[1] || undefined,
            nome_fantasia: values[2] || undefined,
            prioridade: (parseInt(values[3]) || 3) as 1 | 2 | 3 | 4 | 5,
            instagram: values[4] || undefined,
            linkedin: values[5] || undefined,
            facebook: values[6] || undefined,
            youtube: values[7] || undefined,
            twitter: values[8] || undefined,
            website: values[9] || undefined,
            observacoes: values[10] || undefined
          }
        }).filter(row => row.cnpj && row.cnpj !== '') // Apenas rows com CNPJ

        resolve(rows)
      } catch (error: any) {
        reject(new Error(`Erro ao fazer parse do CSV: ${error.message}`))
      }
    }
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsText(file, 'UTF-8')
  })
}

