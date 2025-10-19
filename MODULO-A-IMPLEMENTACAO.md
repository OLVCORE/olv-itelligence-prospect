# 📋 MÓDULO A - Relatórios por Empresa (Prompt Master)
## 10 Seções Obrigatórias para Decisão C-Level

---

## 🎯 OBJETIVO

Criar relatórios executivos completos, auditáveis e acionáveis para cada empresa.  
Cada seção deve ter **evidências rastreáveis** (fonte, URL, data de coleta).

---

## ✅ SEÇÕES OBRIGATÓRIAS

### 1. **Identificação e Dados Cadastrais**
**Fonte:** ReceitaWS API  
**Campos:**
- Razão Social
- Nome Fantasia
- CNPJ (formatado)
- Status (Ativa/Inativa)
- Data de Abertura (dd/MM/yyyy)
- Natureza Jurídica
- Regime (Simples/MEI/Lucro Real)
- Endereço completo (logradouro, bairro, cidade, UF, CEP)
- Capital Social (R$ exato, sem k/M)

**UI:**
- Cartão limpo com formatação pt-BR
- Botão "Ver fonte" → EvidenceButton
- Tooltip explicando "Capital Social" (se necessário)

**Evidência:**
```typescript
createReceitaEvidence(cnpj, receitaData)
```

---

### 2. **Presença Digital 360º**
**Fontes:** Multi-API (Google CSE → Serper → Bing) + Validação Assertiva  

**Campos:**
- **Website Oficial:**
  - URL validada (score + reasons)
  - "Não encontrado" se não validar
  - Evidência com validation_score

- **Redes Sociais Oficiais:**
  - LinkedIn (company page)
  - Instagram (perfil validado)
  - Facebook (página)
  - YouTube (canal)
  - X/Twitter (perfil)
  - Cada um com score + reasons + handle
  - Desambiguação se múltiplos perfis

- **Marketplaces B2B/Portais:**
  - Apenas vinculados (score >= 40)
  - Excluir varejo genérico (Americanas, Magazine Luiza, etc)
  - Com evidência de validação

- **Notícias Recentes:**
  - 3 itens máximo
  - ≤ 12 meses
  - Título, data, snippet, link
  - Classificação: positivo/neutro/negativo (IA simples)

- **Regulatórios (Jusbrasil):**
  - Manter SOMENTE se citar CNPJ/razão oficial
  - Link + snippet + data
  - Evidência com validation

**UI:**
- Lista com badges "validado" (verde) ou "pendente" (amarelo)
- Score de validação em cada item
- EvidenceButton em cada seção (website, redes, notícias, etc)
- SocialDisambiguationModal quando necessário

---

### 3. **Tech Stack (Lite nesta fase)**
**Fonte:** FIT TOTVS (já implementado) ✅  

**Campos:**
- totvs_detected (bool)
- produtos[] (Protheus/Fluig/RM/etc)
- confidence_score (0-100)
- evidences (A/B/C)
- lead_temperature
- recommendations
- pitches por estágio

**UI:** FitTotvsModule (já funcional) ✅

---

### 4. **Financeiro (Básico e Confiável)**
**Fonte:** ReceitaWS (não mock) + IA (opcional)  

**Campos REAIS:**
- Capital Social (ReceitaWS) → formatCurrency()
- Porte (ReceitaWS.porte) → formatCompanySize()
- Nº funcionários (se disponível) → formatNumber()
- Situação cadastral (Ativa/Baixada/Suspensa)

**PROIBIDO nesta fase:**
- Mock de Serasa
- Indicadores sem fonte (liquidez, endividamento, etc)
- Faturamento sem fonte oficial

**UI:**
- Exibir SOMENTE o que tem fonte
- Tooltip em cada campo: "Fonte: ReceitaWS • Coletado em: [data]"
- EvidenceButton → ReceitaWS evidence

---

### 5. **Notícias e Sinais (Resumo Executivo)**
**Fonte:** Google CSE + IA para sumarização  

**Campos:**
- 3 bullet points (IA) com principais fatos (6-12 meses)
- Cada bullet com:
  - Título da notícia
  - Data
  - Link para fonte
  - Sentimento (positivo/neutro/negativo)
  
**Regra IA:**
- Não inventar. Apenas sumarizar notícias reais.
- Cada insight deve referenciar ≥1 notícia
- Prompt: "Resuma os 3 principais fatos sobre {empresa} com base nestas notícias: [...]. Seja objetivo e cite a data."

**UI:**
- Cards com badge de sentimento
- Link "Ver notícia completa"
- EvidenceButton com todas as notícias

---

### 6. **Score de Propensão (Explicável)**
**Fonte:** Cálculo ponderado multi-critério  

**Ponderação Base (ajustável por flag):**
- Receita/porte: 25% (se disponível)
- Presença Digital: 20%
- Notícias: 15%
- Stack/TOTVS-lite: 20%
- Regulatórios: 10%
- Setor/Benchmark: 10% (placeholder nesta fase)

**Output:**
- score: 0-100
- breakdown: { criterio: peso, valor, contribuicao }
- sinais: lista de fatores positivos/negativos

**UI:**
- Gauge com faixas (0-39 vermelho, 40-69 amarelo, 70-100 verde)
- SmartTooltip com:
  - Pesos de cada critério
  - Checklist de sinais que contribuíram
  - Link para evidências de cada critério

---

### 7. **Insights IA (Curtos e Auditáveis)**
**Fonte:** OpenAI + Evidências  

**Regras:**
- 3-5 insights objetivos
- Cada insight deve referenciar ≥1 evidência
- Não citar dados sem fonte
- Se não houver fonte, não inferir além do razoável
- Prompt: "Com base nas evidências fornecidas, gere 3-5 insights executivos. Cada insight deve citar a evidência usada."

**Estrutura:**
```typescript
interface AIInsight {
  id: string
  text: string
  evidence_ids: string[] // IDs das evidências
  confidence: 'high' | 'medium' | 'low'
}
```

**UI:**
- Lista numerada com ícone
- Link para evidência em cada insight (inline)
- Badge de confidence

---

### 8. **Pontos de Atenção**
**Fonte:** Validação + IA  

**Regras:**
- 3 alertas sucintos
- Baseado em:
  - "Website não validado" (se score < 40)
  - "Jusbrasil sem CNPJ oficial" (se não passou validação)
  - "Redes sociais ambíguas – aguarda desambiguação"
  - "Sem notícias recentes (> 12 meses)"
  - "Capital social baixo para porte"
  - "Regulatórios com processos" (se Jusbrasil tem muitos processos)

**UI:**
- Cards com ícone de alerta
- Badge de severidade (alta/média/baixa)
- Ação sugerida inline (ex: "Solicitar confirmação manual")

---

### 9. **Recomendação Executiva (Go/No-Go)**
**Fonte:** Score + Evidências + Pontos de Atenção  

**Lógica:**
- **GO** se:
  - Score >= 70
  - Website validado (score >= 60)
  - ≥2 notícias recentes
  - Sem alertas críticos
  
- **NO-GO** se:
  - Score < 40
  - Website não validado
  - Sem notícias há >24 meses
  - Alertas críticos (processos, situação irregular)

- **QUALIFICAR MELHOR** se entre 40-69

**Output:**
- decisao: 'GO' | 'NO-GO' | 'QUALIFICAR'
- justificativa: 1-2 frases
- referencias: IDs de evidências que suportam

**UI:**
- Badge grande (verde GO, vermelho NO-GO, amarelo QUALIFICAR)
- Justificativa em destaque
- Links para evidências que suportam

---

### 10. **Ações Sugeridas (CTAs)**
**Fonte:** IA contextualizada  

**Regras:**
- 3 próximos passos claros
- Baseado em:
  - Decisão Go/No-Go
  - Temperatura do lead (se TOTVS detectado)
  - Pontos de atenção
  - Decisor identificado (se houver)

**Exemplos por cenário:**

**GO + TOTVS Detectado:**
1. Contatar [decisor] via LinkedIn/Email
2. Apresentar upgrade de [produto detectado]
3. Agendar demo focada em [pain point]

**GO sem TOTVS:**
1. Executar desambiguação de redes sociais
2. Confirmar website oficial com cliente
3. Rodar scan TOTVS lite

**QUALIFICAR:**
1. Buscar notícias mais recentes (últimos 6 meses)
2. Validar presença digital (redes sociais)
3. Executar deep-scan completo

**NO-GO:**
1. Aguardar sinais mais fortes (notícias, eventos)
2. Monitorar empresa trimestralmente
3. Verificar situação cadastral

**UI:**
- Checklist com ícones
- Botões inline de ação quando aplicável
  - "Executar Deep-Scan"
  - "Desambiguar Redes"
  - "Ir para Oportunidades"

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### Passo 1: Expandir `/api/companies/preview`

```typescript
// app/api/companies/preview/route.ts

// Já retorna:
// - receita (ReceitaWS)
// - presencaDigital (website, redes, marketplaces, jusbrasil, notícias)
// - opportunities (vendor match)
// - ai (análise OpenAI)

// ADICIONAR:
const preview = {
  // ... existente
  
  // Nova seção: Score de Propensão
  propensityScore: {
    overall: calculatePropensityScore({...}),
    breakdown: {
      receita_porte: { peso: 0.25, valor: 80, contribuicao: 20 },
      presenca_digital: { peso: 0.20, valor: 90, contribuicao: 18 },
      noticias: { peso: 0.15, valor: 70, contribuicao: 10.5 },
      stack_totvs: { peso: 0.20, valor: 85, contribuicao: 17 },
      regulatorios: { peso: 0.10, valor: 60, contribuicao: 6 },
      setor: { peso: 0.10, valor: 50, contribuicao: 5 },
    },
    sinais: {
      positivos: ['Website validado', 'Notícias recentes', ...],
      negativos: ['Sem TOTVS detectado', ...],
    },
    evidences: [...]
  },
  
  // Nova seção: Insights IA
  aiInsights: {
    insights: [
      { 
        id: '1', 
        text: 'Empresa em fase de crescimento...',
        evidence_ids: ['news-1', 'news-2'],
        confidence: 'high'
      },
      ...
    ],
    methodology: 'Análise baseada em evidências com modelo GPT-4'
  },
  
  // Nova seção: Pontos de Atenção
  attentionPoints: [
    {
      id: '1',
      text: 'Website não validado oficialmente',
      severity: 'medium',
      action: 'Solicitar confirmação manual do domínio',
      evidence_ids: [...]
    },
    ...
  ],
  
  // Nova seção: Recomendação Go/No-Go
  recommendation: {
    decision: 'GO' | 'NO-GO' | 'QUALIFICAR',
    justification: 'Empresa com forte presença digital...',
    evidence_ids: [...],
    confidence: 'high'
  },
  
  // Nova seção: Ações Sugeridas
  suggestedActions: [
    {
      id: '1',
      text: 'Contatar [decisor] via LinkedIn',
      priority: 'alta',
      actionable: true,
      handler: 'OPEN_LINKEDIN' // Para botão inline
    },
    ...
  ]
}
```

### Passo 2: Criar Helpers

```typescript
// lib/scoring/propensity-calculator.ts

export function calculatePropensityScore(params: {
  receita: any
  presencaDigital: any
  noticias: any[]
  totvsScan?: any
  jusbrasil?: any
}): {
  overall: number
  breakdown: Record<string, { peso: number, valor: number, contribuicao: number }>
  sinais: { positivos: string[], negativos: string[] }
} {
  // Implementação dos pesos
}

// lib/ai/insights-generator.ts

export async function generateExecutiveInsights(params: {
  company: any
  evidences: Evidence[]
  maxInsights: number
}): Promise<AIInsight[]> {
  // Prompt OpenAI explicável
}

// lib/ai/recommendation-engine.ts

export function generateRecommendation(params: {
  score: number
  evidences: Evidence[]
  attentionPoints: AttentionPoint[]
}): Recommendation {
  // Lógica Go/No-Go
}
```

### Passo 3: Atualizar PreviewModal

```typescript
// components/modals/PreviewModal.tsx

// Adicionar seções:
// - Score de Propensão (gauge + tooltip com breakdown)
// - Insights IA (lista com evidências linkadas)
// - Pontos de Atenção (cards com ações)
// - Recomendação Go/No-Go (badge + justificativa)
// - Ações Sugeridas (checklist com botões inline)
```

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Backend (1 dia)
- [ ] Criar `lib/scoring/propensity-calculator.ts`
- [ ] Criar `lib/ai/insights-generator.ts`
- [ ] Criar `lib/ai/recommendation-engine.ts`
- [ ] Expandir `/api/companies/preview` response
- [ ] Testes unitários dos calculadores
- [ ] Commit: `feat(core): propensity score + IA insights + Go/No-Go`

### Fase 2: UI - Parte 1 (meio dia)
- [ ] Adicionar seção "Score de Propensão" no PreviewModal
  - Gauge principal
  - Tooltip com breakdown de pesos
  - EvidenceButton
- [ ] Adicionar seção "Insights IA"
  - Lista numerada
  - Link para evidências inline
  - Badge de confidence
- [ ] Commit: `feat(ui): propensity score + AI insights no PreviewModal`

### Fase 3: UI - Parte 2 (meio dia)
- [ ] Adicionar seção "Pontos de Atenção"
  - Cards com ícone de alerta
  - Badge de severidade
  - Ação sugerida inline
- [ ] Adicionar seção "Recomendação Go/No-Go"
  - Badge grande (verde/amarelo/vermelho)
  - Justificativa em destaque
  - Links para evidências
- [ ] Adicionar seção "Ações Sugeridas"
  - Checklist numerado
  - Botões inline quando aplicável
- [ ] Commit: `feat(ui): attention points + Go/No-Go + suggested actions`

### Fase 4: Testes E2E (meio dia)
- [ ] Testar com 3 empresas reais do dashboard
- [ ] Validar cada seção
- [ ] Garantir evidências em tudo
- [ ] Imprimir e verificar CSS
- [ ] Commit: `test: validar 10 seções em empresas reais`

---

## 🎯 CRITÉRIOS DE ACEITE

- [ ] Todas as 10 seções preenchidas quando houver dados
- [ ] Score de Propensão com tooltip explicativo
- [ ] Insights IA referenciando evidências
- [ ] Recomendação Go/No-Go justificada
- [ ] Ações sugeridas contextualizadas
- [ ] EvidenceButton em cada seção principal
- [ ] Números formatados pt-BR
- [ ] Imprimir funciona corretamente
- [ ] Console limpo (sem erros)

---

## ⚡ PRÓXIMA AÇÃO

**Criar `lib/scoring/propensity-calculator.ts` AGORA**

