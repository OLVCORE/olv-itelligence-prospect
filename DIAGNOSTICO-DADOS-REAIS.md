# 🔍 DIAGNÓSTICO: Por que os dados estão FICTÍCIOS?

## ❌ PROBLEMA IDENTIFICADO

**Situação:** Sistema tem toda a estrutura, mas dados ainda aparecem como mock/fictícios

**Causa Raiz:**
1. Empresas no dashboard **NÃO têm análises salvas** (tabela Analysis vazia)
2. Módulos chamam APIs mas as empresas **nunca foram analisadas**
3. detectTotvsLite funciona, MAS empresas no banco **não têm campo `domain`** preenchido
4. Score de propensão calcula, MAS sem dados de entrada válidos, retorna valores default

---

## 🔍 COMO O SISTEMA DEVERIA FUNCIONAR (Fluxo Completo)

### Fluxo Correto:
```
1. Usuário busca CNPJ → SearchBar
2. POST /api/companies/search → Busca ReceitaWS + Google CSE
3. Salva Company no Supabase com: name, cnpj, domain, capital, etc
4. Salva Analysis no Supabase com: receita, presença digital, score, etc
5. Dashboard carrega companies + last analysis
6. Módulos exibem dados REAIS da last analysis
7. TOTVS scan usa company.domain (se disponível)
```

### Fluxo Atual (PROBLEMA):
```
1. Empresas foram criadas manualmente (sem análise)
2. Tabela Company tem: name, cnpj, MAS domain=null
3. Tabela Analysis: VAZIA (sem análises salvas)
4. Módulos chamam last-analysis → retorna vazio
5. detectTotvsLite recebe domain=null → não consegue escanear
6. Score calcula mas sem dados válidos → valores baixos/default
```

---

## ✅ SOLUÇÃO IMEDIATA

### PASSO 1: Analisar as empresas existentes do dashboard

**Executar para cada empresa:**
```bash
# Buscar CNPJ da empresa 1 (OLV INTERNACIONAL)
POST /api/companies/search
{
  "cnpj": "03479371000183"
}

# Isso vai:
✅ Buscar ReceitaWS (capital, porte, endereço, QSA)
✅ Descobrir website oficial (validação assertiva)
✅ Buscar presença digital (redes, marketplaces, Jusbrasil)
✅ Buscar notícias recentes
✅ Calcular score de propensão
✅ Gerar recomendação Go/No-Go
✅ SALVAR Analysis no banco

# Resultado: Empresa agora tem dados REAIS
```

**Repetir para:**
- OLV INTERNACIONAL (03479371000183)
- LOOP GESTAO DE PATIOS
- LUPATECH S/A
- GREMIO TODOS TOTVS (se for teste, deletar)

---

### PASSO 2: Garantir que domain está salvo

**Verificar no Supabase:**
```sql
SELECT id, name, cnpj, domain, capital 
FROM "Company" 
LIMIT 10;
```

**Se domain estiver NULL:**
- API `/companies/search` JÁ salva o domain quando encontra website
- Basta re-analisar as empresas

---

### PASSO 3: Validar TOTVS scan REAL

**Como detectTotvsLite funciona:**

1. **Busca no website oficial:**
   - Acessa: `domain`, `domain/sobre`, `domain/empresa`
   - Procura termos: "TOTVS", "Protheus", "Fluig", "RM", etc
   - Se encontrar → evidência tipo A (confidence +50)

2. **Busca via Google CSE:**
   - Query: `site:domain.com.br TOTVS Protheus`
   - Top 5 resultados
   - Se encontrar menções → evidência tipo B/C

3. **Determina produtos:**
   - Mapeia termos encontrados para produtos
   - Ex: "Protheus 12" → produto "Protheus"

**Exemplo REAL:**
```typescript
// Se empresa tem domain = "olvinternacional.com.br"
detectTotvsLite({
  website: "https://olvinternacional.com.br",
  name: "OLV INTERNACIONAL"
})

// Resultado esperado:
{
  totvs_detected: false, // OLV não usa TOTVS
  produtos: [],
  confidence_score: 0,
  evidences: [],
  lead_temperature: 'frio'
}

// Se empresa REALMENTE usa TOTVS:
{
  totvs_detected: true,
  produtos: ['Protheus', 'Fluig'],
  confidence_score: 85,
  evidences: [
    { source: 'website', url: '...', snippet: 'Utilizamos TOTVS Protheus', strength: 'A' }
  ],
  lead_temperature: 'quente'
}
```

---

## 🔧 ATIVAÇÃO PASSO A PASSO

### MÉTODO 1: Via Interface (Recomendado)

1. **Abrir o sistema em produção**
2. **Ir para a barra de busca**
3. **Buscar CNPJ:** `03479371000183` (OLV)
4. **Clicar "Buscar"**
5. **Aguardar preview carregar** (10-30s)
6. **Clicar "Confirmar & Salvar"**
7. **Voltar ao dashboard** → empresa agora tem dados REAIS

**Repetir para cada empresa do dashboard.**

---

### MÉTODO 2: Via API (Rápido)

Criar script para analisar todas as empresas de uma vez:

```typescript
// scripts/analyze-all-companies.ts

import { supabaseAdmin } from '@/lib/supabase/admin'

async function analyzeAllCompanies() {
  // 1. Buscar todas as empresas
  const { data: companies } = await supabaseAdmin
    .from('Company')
    .select('id, cnpj, name')
    .is('domain', null) // Sem domain = não foi analisada

  // 2. Para cada empresa, chamar /companies/search
  for (const company of companies || []) {
    console.log(`Analisando ${company.name}...`)
    
    const response = await fetch('http://localhost:3000/api/companies/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj: company.cnpj })
    })

    const result = await response.json()
    console.log(`✅ ${company.name} analisada:`, result.status)
    
    // Aguardar 2s entre cada (rate limit)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  console.log('✅ Todas as empresas analisadas!')
}

analyzeAllCompanies()
```

---

## 📊 DADOS REAIS vs MOCK - O QUE MUDA

### Antes (MOCK):
```typescript
// lib/mock-data.ts
capitalSocial: "R$ 5.2M" // INVENTADO
faturamentoAnual: "R$ 15.8M" // INVENTADO
scoreSerasa: 850 // INVENTADO
totvs_detected: true // INVENTADO
```

### Depois (REAL):
```typescript
// De /api/companies/preview → salvo em Analysis
capitalSocial: 230000 // ReceitaWS REAL
faturamentoAnual: null // Não disponível (honesto)
scoreSerasa: null // Não disponível (honesto)
totvs_detected: false // Scan REAL no website
evidences: [
  {
    source: 'ReceitaWS API',
    url: 'https://receitaws.com.br/v1/cnpj/03479371000183',
    collected_at: '2025-10-19T14:30:00Z',
    confidence: 'high'
  }
]
```

---

## 🎯 PRÓXIMA AÇÃO URGENTE

Vou criar um **script de ativação** que:

1. Lista todas as empresas sem análise
2. Chama /companies/search para cada uma
3. Aguarda resposta e salva
4. Verifica se domain foi preenchido
5. Roda TOTVS scan se domain disponível
6. Gera relatório de ativação

**Depois disso, TODOS os dados serão REAIS!**

**Deseja que eu crie e execute esse script AGORA?** 🚀

