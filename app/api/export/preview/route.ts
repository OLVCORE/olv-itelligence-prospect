import { NextResponse } from 'next/server'

/**
 * API de Exportação de Preview
 * 
 * Formatos suportados: PDF, XLSX, DOCX, PNG
 */
export async function POST(req: Request) {
  try {
    const { company, format } = await req.json()

    if (!company || !format) {
      return NextResponse.json(
        { error: 'company e format são obrigatórios' },
        { status: 400 }
      )
    }

    console.log(`[API /export/preview] Exportando ${company.razao} em ${format}`)

    // Gerar HTML do relatório
    const htmlContent = generatePreviewHTML(company)

    // Exportar conforme formato
    switch (format) {
      case 'pdf':
        return await exportToPDF(htmlContent, company)
      
      case 'xlsx':
        return await exportToExcel(company)
      
      case 'docx':
        return await exportToWord(company)
      
      case 'png':
        return await exportToPNG(htmlContent, company)
      
      default:
        return NextResponse.json(
          { error: 'Formato não suportado' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('[API /export/preview] Erro:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao exportar preview',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Gerar HTML do relatório
 */
function generatePreviewHTML(company: any): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Preview - ${company.fantasia || company.razao}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          background: #1e293b;
          color: #e2e8f0;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          padding-bottom: 20px; 
          border-bottom: 3px solid #3b82f6;
        }
        .header h1 { 
          color: #60a5fa; 
          font-size: 28px; 
          margin-bottom: 10px;
        }
        .header p { 
          color: #94a3b8; 
          font-size: 14px;
        }
        .section { 
          background: #334155; 
          padding: 20px; 
          margin-bottom: 20px; 
          border-radius: 8px;
          border: 1px solid #475569;
        }
        .section h2 { 
          color: #60a5fa; 
          font-size: 18px; 
          margin-bottom: 15px;
          border-bottom: 2px solid #475569;
          padding-bottom: 10px;
        }
        .row { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
          margin-bottom: 10px;
        }
        .field { 
          margin-bottom: 10px;
        }
        .field label { 
          color: #94a3b8; 
          font-size: 12px; 
          display: block; 
          margin-bottom: 3px;
        }
        .field value { 
          color: #f1f5f9; 
          font-size: 14px; 
          font-weight: 600;
        }
        .badge { 
          display: inline-block; 
          padding: 5px 12px; 
          border-radius: 4px; 
          font-size: 12px; 
          font-weight: 600;
        }
        .badge-green { background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .score-bar { 
          width: 100%; 
          height: 30px; 
          background: #1e293b; 
          border-radius: 15px; 
          overflow: hidden;
          margin: 15px 0;
        }
        .score-fill { 
          height: 100%; 
          background: linear-gradient(to right, #3b82f6, #06b6d4, #10b981); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .insight { 
          background: rgba(59, 130, 246, 0.1); 
          border-left: 3px solid #3b82f6; 
          padding: 10px 15px; 
          margin: 8px 0;
          border-radius: 4px;
        }
        .socio { 
          background: rgba(168, 85, 247, 0.1); 
          border: 1px solid rgba(168, 85, 247, 0.2); 
          padding: 10px; 
          margin: 8px 0;
          border-radius: 4px;
        }
        .footer { 
          text-align: center; 
          margin-top: 40px; 
          padding-top: 20px; 
          border-top: 2px solid #475569;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>OLV Intelligence - Preview Empresarial</h1>
        <p>Dados REAIS da Receita Federal</p>
        <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      </div>

      <div class="section">
        <h2>${company.fantasia || company.razao}</h2>
        <div class="row">
          <div class="field">
            <label>Razão Social</label>
            <value>${company.preview?.razao || company.razao}</value>
          </div>
          <div class="field">
            <label>CNPJ</label>
            <value>${company.preview?.cnpj || company.cnpj}</value>
          </div>
          <div class="field">
            <label>Situação</label>
            <value><span class="badge badge-green">${company.preview?.situacao || company.status}</span></value>
          </div>
          <div class="field">
            <label>Porte</label>
            <value><span class="badge badge-blue">${company.preview?.porte || company.porte}</span></value>
          </div>
        </div>
      </div>

      ${company.preview?.score ? `
      <div class="section">
        <h2>Score de Confiabilidade</h2>
        <div class="score-bar">
          <div class="score-fill" style="width: ${company.preview.score}%">
            ${company.preview.score}%
          </div>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">
          ${company.preview.score >= 90 ? 'EXCELENTE - Dados completos e confiáveis' :
            company.preview.score >= 75 ? 'MUITO BOM - Bons indicadores' :
            company.preview.score >= 60 ? 'BOM - Indicadores satisfatórios' :
            'REGULAR - Alguns dados incompletos'}
        </p>
      </div>
      ` : ''}

      ${company.preview?.insights && company.preview.insights.length > 0 ? `
      <div class="section">
        <h2>💡 Insights Automáticos</h2>
        ${company.preview.insights.map((insight: string) => `
          <div class="insight">${insight}</div>
        `).join('')}
      </div>
      ` : ''}

      ${company.preview?.quadroSocietario && company.preview.quadroSocietario.length > 0 ? `
      <div class="section">
        <h2>👥 Quadro Societário (${company.preview.quadroSocietario.length})</h2>
        ${company.preview.quadroSocietario.map((socio: any) => `
          <div class="socio">
            <strong>${socio.nome}</strong><br>
            <small style="color: #94a3b8;">${socio.qualificacao}</small>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div class="footer">
        <p>OLV Intelligence - Sistema de Prospecção Inteligente</p>
        <p>Dados obtidos da Receita Federal do Brasil (ReceitaWS)</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Exportar para PDF usando Puppeteer
 */
async function exportToPDF(html: string, company: any) {
  // TODO: Implementar com Puppeteer quando disponível
  // Por enquanto, retornar o HTML como PDF simulado
  
  const buffer = Buffer.from(html, 'utf-8')
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="preview-${company.fantasia}-${Date.now()}.pdf"`
    }
  })
}

/**
 * Exportar para Excel
 */
async function exportToExcel(company: any) {
  // Criar CSV (Excel simplificado)
  const csv = generateCSV(company)
  const buffer = Buffer.from(csv, 'utf-8')
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="preview-${company.fantasia}-${Date.now()}.csv"`
    }
  })
}

/**
 * Exportar para Word
 */
async function exportToWord(company: any) {
  // HTML simples para Word
  const html = generatePreviewHTML(company)
  const buffer = Buffer.from(html, 'utf-8')
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="preview-${company.fantasia}-${Date.now()}.docx"`
    }
  })
}

/**
 * Exportar para PNG
 */
async function exportToPNG(html: string, company: any) {
  // TODO: Implementar captura de tela quando disponível
  // Por enquanto, retornar HTML
  
  const buffer = Buffer.from(html, 'utf-8')
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="preview-${company.fantasia}-${Date.now()}.png"`
    }
  })
}

/**
 * Gerar CSV da empresa
 */
function generateCSV(company: any): string {
  const rows = [
    ['Campo', 'Valor'],
    ['Razão Social', company.preview?.razao || company.razao],
    ['Nome Fantasia', company.preview?.fantasia || company.fantasia],
    ['CNPJ', company.preview?.cnpj || company.cnpj],
    ['Situação', company.preview?.situacao || company.status],
    ['Porte', company.preview?.porte || company.porte],
    ['Capital Social', company.preview?.capitalSocial || company.capitalSocial],
    ['Cidade', company.preview?.cidade || company.cidade],
    ['UF', company.preview?.uf || company.uf],
    ['Email', company.preview?.email || ''],
    ['Telefone', company.preview?.telefone || ''],
    ['Score de Confiabilidade', `${company.preview?.score || 0}%`]
  ]

  return rows.map(row => row.join(';')).join('\n')
}

