/**
 * Executive Report Templates
 * Generates HTML for PDF conversion
 */

import { formatDate, formatCurrency } from './utils'

export interface ReportData {
  company: any
  stacks: any[]
  contacts: any[]
  benchmarks: any[]
  maturityScore: number
  propensity: number
  estimatedTicket: number
  recommendations: any[]
  evidences: any[]
}

export function generateExecutiveReport(data: ReportData): string {
  const { company, stacks, contacts, benchmarks, maturityScore, propensity, estimatedTicket } = data

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Executivo - ${company.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6;
      color: #333;
      background: white;
    }
    .page { 
      padding: 40px; 
      max-width: 210mm;
      margin: 0 auto;
      page-break-after: always;
    }
    .cover {
      min-height: 297mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .cover h1 { font-size: 48px; margin-bottom: 20px; }
    .cover h2 { font-size: 32px; margin-bottom: 40px; font-weight: 300; }
    .cover .meta { font-size: 18px; margin-top: 60px; }
    
    h1 { color: #667eea; font-size: 32px; margin-bottom: 20px; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    h2 { color: #764ba2; font-size: 24px; margin: 30px 0 15px; }
    h3 { color: #555; font-size: 18px; margin: 20px 0 10px; }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .kpi-card {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
    }
    .kpi-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
    .kpi-card .value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
    .kpi-card .description { font-size: 14px; color: #888; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 14px;
    }
    th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) { background: #f8f9fa; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-confirmado { background: #d4edda; color: #155724; }
    .status-indeterminado { background: #fff3cd; color: #856404; }
    
    .confidence-high { color: #28a745; font-weight: bold; }
    .confidence-medium { color: #ffc107; font-weight: bold; }
    .confidence-low { color: #dc3545; font-weight: bold; }
    
    .section-mandatory {
      border: 3px solid #dc3545;
      padding: 20px;
      margin: 20px 0;
      background: #fff5f5;
      border-radius: 8px;
    }
    .section-mandatory h2 {
      color: #dc3545;
    }
    .section-mandatory::before {
      content: "⚠️ SEÇÃO OBRIGATÓRIA";
      display: block;
      font-size: 12px;
      font-weight: bold;
      color: #dc3545;
      margin-bottom: 10px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- CAPA -->
  <div class="page cover">
    <h1>OLV Intelligent Prospecting</h1>
    <h2>${company.name}</h2>
    <div class="meta">
      <p>Relatório Executivo de Inteligência B2B</p>
      <p>Data: ${formatDate(new Date())}</p>
      <p>Build ID: ${Date.now().toString(36).toUpperCase()}</p>
    </div>
  </div>

  <!-- SUMÁRIO EXECUTIVO -->
  <div class="page">
    <h1>Sumário Executivo</h1>
    
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="label">Maturidade Digital</div>
        <div class="value">${maturityScore}/100</div>
        <div class="description">${maturityScore >= 70 ? 'Alta' : maturityScore >= 50 ? 'Média' : 'Baixa'}</div>
      </div>
      <div class="kpi-card">
        <div class="label">Propensão</div>
        <div class="value">${propensity}%</div>
        <div class="description">Probabilidade de conversão</div>
      </div>
      <div class="kpi-card">
        <div class="label">Ticket Estimado</div>
        <div class="value">${formatCurrency(estimatedTicket)}</div>
        <div class="description">Valor potencial anual</div>
      </div>
      <div class="kpi-card">
        <div class="label">Stack Confirmado</div>
        <div class="value">${stacks.filter(s => s.status === 'Confirmado').length}</div>
        <div class="description">de ${stacks.length} tecnologias</div>
      </div>
      <div class="kpi-card">
        <div class="label">Decisores</div>
        <div class="value">${contacts.length}</div>
        <div class="description">${contacts.filter(c => c.score >= 4).length} C-Level</div>
      </div>
      <div class="kpi-card">
        <div class="label">Confiança Média</div>
        <div class="value">${Math.round(stacks.reduce((sum, s) => sum + s.confidence, 0) / stacks.length)}%</div>
        <div class="description">Qualidade dos dados</div>
      </div>
    </div>

    <h2>Principais Oportunidades</h2>
    <ul style="margin-left: 20px; line-height: 2;">
      ${data.recommendations.slice(0, 5).map(r => `<li><strong>${r.title}</strong>: ${r.description}</li>`).join('')}
    </ul>
  </div>

  <!-- 1. DADOS CADASTRAIS -->
  <div class="page">
    <h1>1. Dados Cadastrais e Identificação</h1>
    
    <table>
      <tr>
        <th style="width: 30%">Campo</th>
        <th style="width: 50%">Valor</th>
        <th style="width: 20%">Fonte</th>
      </tr>
      <tr>
        <td>Razão Social</td>
        <td><strong>${company.name}</strong></td>
        <td>ReceitaWS</td>
      </tr>
      <tr>
        <td>CNPJ</td>
        <td>${company.cnpj || 'N/A'}</td>
        <td>ReceitaWS</td>
      </tr>
      <tr>
        <td>Domínio</td>
        <td>${company.domain || 'N/A'}</td>
        <td>Manual</td>
      </tr>
      <tr>
        <td>CNAE</td>
        <td>${company.cnae || 'N/A'}</td>
        <td>ReceitaWS</td>
      </tr>
      <tr>
        <td>Setor</td>
        <td>${company.industry || 'N/A'}</td>
        <td>Clearbit</td>
      </tr>
      <tr>
        <td>Porte</td>
        <td>${company.size || 'N/A'}</td>
        <td>ReceitaWS</td>
      </tr>
    </table>
  </div>

  <!-- 3. STACK TECNOLÓGICO (OBRIGATÓRIA) -->
  <div class="page">
    <div class="section-mandatory">
      <h2>3. Stack Tecnológico Confirmado</h2>
      
      <table>
        <tr>
          <th>Categoria</th>
          <th>Produto</th>
          <th>Fornecedor</th>
          <th>Status</th>
          <th>Confiança</th>
          <th>Últ. Validação</th>
        </tr>
        ${stacks.map(stack => `
        <tr>
          <td>${stack.category}</td>
          <td><strong>${stack.product}</strong></td>
          <td>${stack.vendor || 'N/A'}</td>
          <td>
            <span class="status-badge status-${stack.status.toLowerCase().replace(' ', '-')}">
              ${stack.status}
            </span>
          </td>
          <td class="confidence-${stack.confidence >= 80 ? 'high' : stack.confidence >= 50 ? 'medium' : 'low'}">
            ${stack.confidence}%
          </td>
          <td>${stack.validatedAt ? formatDate(stack.validatedAt) : 'Pendente'}</td>
        </tr>
        `).join('')}
      </table>

      <h3>Evidências por Tecnologia</h3>
      ${stacks.map(stack => `
        <div style="margin: 15px 0; padding: 15px; background: white; border-left: 3px solid #667eea;">
          <strong>${stack.product}</strong> (${stack.category})
          <ul style="margin: 10px 0 0 20px; font-size: 13px; color: #666;">
            ${Array.isArray(stack.evidence?.sources) ? stack.evidence.sources.map((src: string) => `<li>${src}</li>`).join('') : '<li>Fonte: Manual</li>'}
          </ul>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- 5. DECISORES & PODER -->
  <div class="page">
    <h1>5. Decisores e Poder</h1>
    
    <table>
      <tr>
        <th>Nome</th>
        <th>Cargo</th>
        <th>Departamento</th>
        <th>E-mail</th>
        <th>Score</th>
        <th>Fonte</th>
      </tr>
      ${contacts.map(contact => `
      <tr>
        <td><strong>${contact.name}</strong></td>
        <td>${contact.title}</td>
        <td>${contact.department || 'N/A'}</td>
        <td>${contact.email || 'N/A'}</td>
        <td>
          ${'⭐'.repeat(contact.score)}
        </td>
        <td style="font-size: 11px">${contact.source}</td>
      </tr>
      `).join('')}
    </table>

    <h3>Clusters por Área</h3>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
      ${['TI', 'Operações', 'Finanças'].map(area => `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
          <div style="font-size: 12px; color: #666;">ÁREA ${area.toUpperCase()}</div>
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">
            ${contacts.filter(c => c.department?.includes(area)).length}
          </div>
          <div style="font-size: 11px; color: #888;">contatos identificados</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- 7. FIT & RECOMENDAÇÕES -->
  <div class="page">
    <h1>7. Fit TOTVS/OLV & Arquitetura Recomendada</h1>
    
    <table>
      <tr>
        <th>Necessidade</th>
        <th>Produto TOTVS/OLV</th>
        <th>Justificativa</th>
        <th>Valor Est.</th>
      </tr>
      ${data.recommendations.map(rec => `
      <tr>
        <td><strong>${rec.title}</strong></td>
        <td>${rec.product}</td>
        <td style="font-size: 12px">${rec.description}</td>
        <td>${formatCurrency(rec.value || 0)}</td>
      </tr>
      `).join('')}
    </table>

    <h2>ROI Estimado</h2>
    <div class="kpi-card">
      <div class="label">Retorno Esperado (3 anos)</div>
      <div class="value">3.2x</div>
      <div class="description">Com base em casos similares do setor</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="page">
    <h1>9. Anexos e Metadados</h1>
    
    <h3>Fontes Utilizadas</h3>
    <ul style="margin-left: 20px;">
      <li>ReceitaWS - Dados cadastrais e fiscais</li>
      <li>HTTP Headers - Detecção de stack web</li>
      <li>DNS/MX Records - Infraestrutura de email</li>
      <li>Apollo.io - Contatos e decisores</li>
    </ul>

    <div class="footer">
      <p><strong>OLV Intelligent Prospecting System</strong></p>
      <p>Relatório gerado em ${formatDate(new Date())} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      <p>Build ID: ${Date.now().toString(36).toUpperCase()} | Versão: 1.0</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este relatório contém informações confidenciais. Uso restrito TOTVS/OLV.<br>
        Dados coletados em conformidade com LGPD (Lei 13.709/2018)
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Snapshot 1-page report
export function generateSnapshot(data: ReportData): string {
  const { company, maturityScore, propensity, estimatedTicket, stacks, contacts } = data

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 30px;
      background: white;
    }
    .snapshot {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      background: #ddd;
      border: 1px solid #ddd;
    }
    .kpi {
      background: white;
      padding: 15px;
      text-align: center;
    }
    .kpi .label { font-size: 11px; color: #666; text-transform: uppercase; }
    .kpi .value { font-size: 24px; font-weight: bold; color: #667eea; margin: 5px 0; }
    .content {
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .section {
      margin: 15px 0;
    }
    .section h3 {
      font-size: 14px;
      color: #667eea;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="snapshot">
    <div class="header">
      <h1>${company.name}</h1>
      <p>${company.industry || 'Setor não identificado'} • ${company.size || 'Porte não definido'} • ${formatDate(new Date())}</p>
    </div>
    <div class="kpis">
      <div class="kpi">
        <div class="label">Maturidade</div>
        <div class="value">${maturityScore}</div>
      </div>
      <div class="kpi">
        <div class="label">Propensão</div>
        <div class="value">${propensity}%</div>
      </div>
      <div class="kpi">
        <div class="label">Ticket</div>
        <div class="value">${formatCurrency(estimatedTicket).replace('R$', '').trim()}</div>
      </div>
      <div class="kpi">
        <div class="label">Decisores</div>
        <div class="value">${contacts.length}</div>
      </div>
    </div>
    <div class="content">
      <div class="section">
        <h3>Stack Confirmado</h3>
        <div class="tags">
          ${stacks.filter(s => s.status === 'Confirmado').map(s => `<span class="tag">${s.product}</span>`).join('')}
        </div>
      </div>
      <div class="section">
        <h3>Top Decisores</h3>
        <div class="tags">
          ${contacts.filter(c => c.score >= 4).slice(0, 5).map(c => `<span class="tag">${c.name} - ${c.title}</span>`).join('')}
        </div>
      </div>
      <div class="section">
        <h3>Recomendação Chave</h3>
        <p style="font-size: 14px; color: #555;">${data.recommendations[0]?.description || 'Avaliação em andamento'}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

