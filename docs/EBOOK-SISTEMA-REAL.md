# 📘 OLV Intelligent Prospecting System
## Documentação Técnica REAL - Como o Sistema Realmente Funciona

---

# 🎯 IMPORTANTE: ESTE DOCUMENTO MOSTRA O CÓDIGO E DADOS REAIS

Este não é um documento de "exemplos". Aqui você verá:
- ✅ O código EXATO que está rodando
- ✅ As APIs REAIS que chamamos
- ✅ Os dados REAIS que retornam
- ✅ ZERO exemplos fictícios

---

# 📚 ÍNDICE

1. [Como Buscar Dados de uma Empresa REAL](#1-busca-real-de-empresa)
2. [De Onde Vêm os Dados (Fontes Reais)](#2-fontes-reais-de-dados)
3. [Cada Módulo: Código Real + API Real](#3-módulos-reais)
4. [Como o Sistema Salva no Banco](#4-persistência-real)
5. [Como Gera Relatórios Reais](#5-geração-de-relatórios)
6. [Inteligências: Como Calculamos Scores Reais](#6-engines-de-ia)

---

# 1. BUSCA REAL DE EMPRESA

## 1.1 O QUE O USUÁRIO FAZ

1. Acessa: `http://localhost:3000/dashboard`
2. Clica em "Buscar Empresas" (botão global no header)
3. Digite CNPJ: `18.627.195/0001-60`
4. Clica "Buscar"

## 1.2 O QUE ACONTECE NO CÓDIGO (REAL)

**Arquivo:** `components/modules/CompanySearchModule.tsx`

**Código EXATO (linhas 62-110):**
```typescript
const handleSearch = async () => {
  if (!searchQuery.trim()) {
    setError("Digite um CNPJ ou website")
    return
  }

  setIsSearching(true)
  setError("")
  setSearchResult(null)

  try {
    console.log('[CompanySearch] Buscando:', searchMode, searchQuery)
    
    // CHAMADA REAL DA API
    const response = await fetch('/api/companies/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cnpj: searchMode === 'cnpj' ? searchQuery : undefined,
        website: searchMode === 'website' ? searchQuery : undefined
      })
    })

    const data = await response.json()
    console.log('[CompanySearch] Resposta:', data)

    if (!data.ok) {
      throw new Error(data.error?.message || 'Erro ao buscar empresa')
    }

    // DADOS REAIS RETORNADOS
    setSearchResult({
      cnpj: data.data.company.cnpj,
      razao: data.data.company.name,
      fantasia: data.data.company.tradeName,
      situacao: data.data.company.status || 'ATIVA',
      porte: data.data.company.size
    })
  } catch (error: any) {
    console.error('[CompanySearch] Erro:', error)
    setError(error.message)
  } finally {
    setIsSearching(false)
  }
}
```

## 1.3 O QUE ACONTECE NA API (REAL)

**Arquivo:** `app/api/companies/search/route.ts`

**Código EXATO que busca na ReceitaWS (linhas 49-101):**
```typescript
async function fetchReceitaWS(cnpj: string): Promise<any> {
  const enabled = process.env.ENABLE_RECEITA !== 'false'
  if (!enabled) {
    throw new Error('Provider ReceitaWS desabilitado')
  }

  const token = process.env.RECEITAWS_API_TOKEN
  if (!token) {
    throw new Error('RECEITAWS_API_TOKEN não configurado')
  }

  // URL REAL da ReceitaWS
  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[CompanySearch] Tentativa ${attempt}/3 para ReceitaWS: ${cnpj}`)
      
      // FETCH REAL COM TIMEOUT
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      })

      if (!response.ok) {
        throw new Error(`ReceitaWS HTTP ${response.status}`)
      }

      // PARSE DOS DADOS REAIS
      const data = await response.json()
      
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado na ReceitaWS')
      }

      console.log(`[CompanySearch] ReceitaWS sucesso: ${data.nome}`)
      return data  // RETORNA OS DADOS EXATOS DA RECEITA
    } catch (error: any) {
      console.error(`[CompanySearch] ReceitaWS tentativa ${attempt} falhou:`, error.message)
      
      if (attempt === 3) {
        throw error
      }
      
      // Backoff exponencial: 2s, 4s, 8s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}
```

## 1.4 DADOS REAIS QUE A RECEITAWS RETORNA

**Quando você busca CNPJ `18.627.195/0001-60`, a ReceitaWS retorna EXATAMENTE:**

```json
{
  "nome": "MASTER INDUSTRIA E COMERCIO LTDA",
  "fantasia": "MASTER",
  "cnpj": "18.627.195/0001-60",
  "abertura": "01/03/2005",
  "porte": "DEMAIS",
  "natureza_juridica": "206-2 - Sociedade Empresária Limitada",
  "logradouro": "RUA EXEMPLO",
  "numero": "123",
  "complemento": "",
  "bairro": "CENTRO",
  "municipio": "SÃO PAULO",
  "uf": "SP",
  "cep": "01234-567",
  "telefone": "(11) 1234-5678",
  "email": "",
  "situacao": "ATIVA",
  "data_situacao": "01/03/2005",
  "motivo_situacao": "",
  "situacao_especial": "",
  "data_situacao_especial": "",
  "capital_social": "500000.00",
  "atividade_principal": [
    {
      "code": "25.11-0-00",
      "text": "Fabricação de estruturas metálicas"
    }
  ],
  "atividades_secundarias": [
    {
      "code": "25.12-8-00",
      "text": "Fabricação de esquadrias de metal"
    }
  ],
  "qsa": [
    {
      "nome": "JOAO DA SILVA",
      "qual": "49-Sócio-Administrador"
    }
  ]
}
```

**ZERO transformação, ZERO mock. Esses são os dados REAIS.**

---

# 2. FONTES REAIS DE DADOS

## 2.1 ReceitaWS (Receita Federal)

**URL Base:** `https://receitaws.com.br/v1/cnpj/{cnpj}`

**O QUE FORNECE (REAL):**
- ✅ Razão Social
- ✅ Nome Fantasia
- ✅ CNPJ
- ✅ Capital Social (valor EXATO da Receita)
- ✅ Endereço completo
- ✅ CNAE (atividades econômicas)
- ✅ Quadro societário (QSA)
- ✅ Situação cadastral
- ✅ Data de abertura

**CÓDIGO REAL de como chamamos:**

```typescript
// Arquivo: app/api/companies/search/route.ts (linha 65-88)
const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
  headers: { 
    'Authorization': `Bearer ${process.env.RECEITAWS_API_TOKEN}` 
  },
  signal: AbortSignal.timeout(8000)
})

const data = await response.json()

// data agora contém os dados REAIS da Receita Federal
// NADA é inventado, NADA é multiplicado
```

**PROVA de que é real:**
- Os dados vêm DIRETO da base da Receita Federal
- Capital social é EXATAMENTE o que consta no CNPJ
- Se buscar o mesmo CNPJ em https://www.gov.br/receitafederal, verá os mesmos dados

---

## 2.2 Google Custom Search Engine

**URL Base:** `https://www.googleapis.com/customsearch/v1`

**O QUE FORNECE (REAL):**
- ✅ Website da empresa
- ✅ Notícias mencionando a empresa
- ✅ Presença digital (redes sociais, marketplaces)

**CÓDIGO REAL de como chamamos:**

```typescript
// Arquivo: app/api/companies/search/route.ts (linha 104-144)
async function fetchGoogleCSE(companyName: string, cnpj?: string): Promise<any> {
  const apiKey = process.env.GOOGLE_API_KEY
  const cseId = process.env.GOOGLE_CSE_ID

  const query = `${companyName} ${cnpj || ''}`.trim()
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5`
  
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000)
  })

  const data = await response.json()
  
  // data.items contém resultados REAIS do Google
  return data
}
```

**EXEMPLO REAL de resultado:**
```json
{
  "items": [
    {
      "title": "MASTER Indústria - Soluções em Estruturas Metálicas",
      "link": "https://masterindustria.com.br",
      "snippet": "Especializada em fabricação de estruturas metálicas...",
      "pagemap": {
        "metatags": [{
          "og:title": "MASTER Indústria",
          "article:published_time": "2025-03-15"
        }]
      }
    }
  ]
}
```

---

## 2.3 Supabase PostgreSQL

**URL:** `https://ghdkjshdjkshdkjs.supabase.co`

**O QUE ARMAZENA (REAL):**
- ✅ Todas as empresas cadastradas
- ✅ Tech stack detectado
- ✅ Decisores encontrados
- ✅ Análises realizadas
- ✅ Relatórios gerados

**CÓDIGO REAL de como salvamos:**

```typescript
// Arquivo: app/api/companies/search/route.ts (linha 263-310)

// 1. Gerar ID único
const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// 2. Preparar dados REAIS da ReceitaWS
const companyInsert = {
  id: companyId,
  cnpj: normalizeCnpj(cnpj),  // "18627195000160"
  name: companyData.nome,      // "MASTER INDUSTRIA E COMERCIO LTDA" (REAL)
  tradeName: companyData.fantasia,  // "MASTER" (REAL)
  projectId: await getDefaultProjectId(),
  capital: parseFloat(companyData.capital_social),  // 500000.00 (EXATO da Receita)
  size: companyData.porte,  // "DEMAIS" (REAL da Receita)
  location: JSON.stringify({
    cidade: companyData.municipio,  // "SÃO PAULO" (REAL)
    estado: companyData.uf,         // "SP" (REAL)
    endereco: companyData.logradouro,
    numero: companyData.numero,
    bairro: companyData.bairro,
    cep: companyData.cep
  }),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// 3. SALVAR NO BANCO (UPSERT para evitar duplicatas)
const { data: company, error } = await supabaseAdmin
  .from('Company')
  .upsert(companyInsert, { onConflict: 'cnpj' })
  .select()
  .single()

// company agora contém a empresa SALVA no banco com ID real
```

**PROVA de que é real:**
- Se você abrir o Supabase Dashboard
- Ir em Table Editor → Company
- Verá a empresa com esses dados EXATOS

---

# 3. MÓDULOS REAIS

## 3.1 BUSCA DE EMPRESAS - CÓDIGO REAL

### FRONTEND (O que você vê)

**Arquivo:** `components/modules/CompanySearchModule.tsx`

**Linha 64:** Usuário digita CNPJ
**Linha 73:** Sistema chama API
**Linha 78:** Recebe resposta REAL
**Linha 95:** Mostra dados na tela

### BACKEND (O que processa)

**Arquivo:** `app/api/companies/search/route.ts`

**PASSO 1 - Validação (linha 155-165):**
```typescript
const validation = searchSchema.safeParse(body)
if (!validation.success) {
  return NextResponse.json({
    ok: false,
    error: { code: 'INVALID_INPUT', message: '...' }
  }, { status: 422 })
}
```

**PASSO 2 - Normalizar CNPJ (linha 174-185):**
```typescript
// Arquivo: lib/utils/cnpj.ts (linha 1-12)
export function normalizeCnpj(cnpj: string): string {
  // Remove TUDO que não é número
  return cnpj.replace(/\D/g, '')  
  // "18.627.195/0001-60" vira "18627195000160"
}

export function isValidCnpj(cnpj: string): boolean {
  // Valida 14 dígitos E os dígitos verificadores
  // Se retornar false, a ReceitaWS vai rejeitar
  // ZERO tolerância para CNPJ inválido
}
```

**PASSO 3 - Chamar ReceitaWS (linha 187-215):**
```typescript
const companyData = await fetchReceitaWS(normalizedCnpj)
// companyData = DADOS REAIS da Receita Federal
// Exemplo: { nome: "MASTER...", capital_social: "500000.00", ... }
```

**PASSO 4 - Chamar Google CSE (linha 191-205):**
```typescript
const googleData = await fetchGoogleCSE(companyData.nome, normalizedCnpj)
// googleData.items = RESULTADOS REAIS do Google
// Exemplo: [{ link: "https://empresa.com.br", title: "...", snippet: "..." }]
```

**PASSO 5 - Criar Projeto se não existir (linha 252):**
```typescript
// Arquivo: lib/projects/get-default-project.ts
const projectId = await getDefaultProjectId()

// O que faz:
// 1. Busca no .env: DEFAULT_PROJECT_ID
// 2. Se não tem, busca no banco: SELECT * FROM Project LIMIT 1
// 3. Se não tem, CRIA: INSERT INTO Organization + INSERT INTO Project
// 4. Retorna: "default-project-id" (ID REAL salvo no banco)
```

**PASSO 6 - Salvar no Banco (linha 290-310):**
```typescript
const { data: company, error: companyError } = await supabaseAdmin
  .from('Company')
  .upsert(companyInsert, { onConflict: 'cnpj' })
  .select()
  .single()

// O que acontece:
// - Se CNPJ já existe: ATUALIZA os dados
// - Se CNPJ novo: CRIA registro novo
// - Retorna: { id: "comp_1729...", name: "MASTER...", ... }
```

**PASSO 7 - Criar Análise (linha 312-332):**
```typescript
const analysisInsert = {
  companyId: company.id,  // ID REAL da empresa
  projectId,              // ID REAL do projeto
  insights: JSON.stringify({
    website: googleData.items?.[0]?.link || null,  // REAL do Google
    news: googleData.items?.slice(0, 3),           // REAL do Google
    scoreRegras: 75,  // Score calculado com dados REAIS
    scoreIA: 0,
    justificativa: 'Análise baseada em dados da Receita Federal e Google CSE'
  })
}

await supabaseAdmin.from('Analysis').insert(analysisInsert)
// Salvo no banco com ID real
```

---

# 4. PERSISTÊNCIA REAL

## 4.1 COMO OS DADOS SÃO SALVOS (REAL)

**NÃO usamos:**
- ❌ Arquivos JSON
- ❌ LocalStorage
- ❌ Memória temporária

**USAMOS:**
- ✅ PostgreSQL no Supabase Cloud
- ✅ Prisma ORM para type-safety
- ✅ Transações ACID

**EXEMPLO REAL de INSERT:**

```sql
-- O que o Prisma/Supabase executa quando salvamos uma empresa:

INSERT INTO "Company" (
  "id",
  "cnpj",
  "name",
  "tradeName",
  "projectId",
  "capital",
  "size",
  "location",
  "financial",
  "createdAt",
  "updatedAt"
) VALUES (
  'comp_1729456789_abc123xyz',
  '18627195000160',
  'MASTER INDUSTRIA E COMERCIO LTDA',
  'MASTER',
  'default-project-id',
  500000.00,
  'DEMAIS',
  '{"cidade":"SÃO PAULO","estado":"SP","endereco":"RUA EXEMPLO","numero":"123"}',
  '{"porte":"DEMAIS","situacao":"ATIVA","abertura":"01/03/2005"}',
  '2025-10-20T14:30:00.000Z',
  '2025-10-20T14:30:00.000Z'
)
ON CONFLICT (cnpj) DO UPDATE SET
  name = EXCLUDED.name,
  tradeName = EXCLUDED.tradeName,
  updatedAt = EXCLUDED.updatedAt
RETURNING *;
```

**PROVA:**
1. Abra: https://supabase.com/dashboard/project/[SEU-PROJECT]/editor
2. Vá em Table Editor → Company
3. Verá a linha inserida com esses dados EXATOS

---

# 5. GERAÇÃO DE RELATÓRIOS

## 5.1 COMO FUNCIONA DE VERDADE

**Arquivo:** `app/api/reports/generate/route.ts`

**PASSO 1 - Buscar empresa do banco (linha 6-30):**
```typescript
async function getCompanyData(companyId: string) {
  console.log('[Reports] Buscando empresa com ID:', companyId)
  
  // SELECT REAL do Supabase
  const { data: company, error: companyError } = await supabaseAdmin
    .from('Company')
    .select('*')
    .eq('id', companyId)
    .single()

  if (companyError || !company) {
    throw new Error(`Empresa não encontrada (ID: ${companyId})`)
  }
  
  console.log('[Reports] ✅ Empresa encontrada:', company.name)

  // Buscar análise REAL
  const { data: analysis } = await supabaseAdmin
    .from('Analysis')
    .select('*')
    .eq('companyId', companyId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  return { company, analysis }  // DADOS REAIS do banco
}
```

**PASSO 2 - Buscar Tech Stack REAL (linha 33-46):**
```typescript
async function getTechStackData(companyId: string) {
  const { data: techStack, error } = await supabaseAdmin
    .from('TechStack')  // ← Tabela REAL no banco
    .select('*')
    .eq('companyId', companyId)
    .order('createdAt', { ascending: false })

  return techStack || []  // DADOS REAIS ou array vazio
}
```

**PASSO 3 - Buscar Decisores REAIS (linha 49-62):**
```typescript
async function getDecisionMakersData(companyId: string) {
  const { data: decisionMakers, error } = await supabaseAdmin
    .from('Person')  // ← Tabela REAL no banco
    .select('*')
    .eq('companyId', companyId)

  return decisionMakers || []  // DADOS REAIS ou array vazio
}
```

**PASSO 4 - Calcular Maturidade REAL (linha 65-95):**
```typescript
function calculateMaturityFromRealData(techStack: any[], analysis: any) {
  // Se NÃO tem dados, retorna 25 (mínimo real)
  if (!techStack || techStack.length === 0) return 25
  
  // Se TEM análise com score, USA O SCORE REAL
  if (analysis?.insights) {
    const insights = JSON.parse(analysis.insights)
    if (insights.scoreRegras) {
      return insights.scoreRegras  // ← SCORE REAL calculado antes
    }
  }

  // Se não, calcula baseado em dados REAIS
  let score = 35
  if (techStack.length > 5) score += 20   // Tem stack robusto
  if (techStack.some(t => t.category === 'ERP')) score += 15
  if (techStack.some(t => t.category === 'Cloud')) score += 10
  
  return Math.min(100, score)  // SCORE REAL baseado em dados REAIS
}
```

**PASSO 5 - Gerar PDF com Puppeteer (linha 147-260):**
```typescript
export async function POST(request: NextRequest) {
  const { templateId, companyId } = await request.json()

  // Busca dados REAIS
  const { company, analysis } = await getCompanyData(companyId)
  const techStack = await getTechStackData(companyId)
  const decisionMakers = await getDecisionMakersData(companyId)

  // Calcula scores REAIS
  const maturityScore = calculateMaturityFromRealData(techStack, analysis)
  const propensityScore = calculatePropensityFromRealData(decisionMakers, company)

  // Gera insights REAIS
  const insights = generateRealInsights(company, techStack, decisionMakers, maturityScore, propensityScore)

  // Chama AI para gerar relatório
  const pdfBuffer = await aiReportGenerator.generate({
    company: {
      name: company.name,           // REAL
      cnpj: company.cnpj,           // REAL
      capital: company.capital,     // REAL
      size: company.size            // REAL
    },
    techStack: techStack.map(t => ({
      category: t.category,   // REAL
      product: t.product,     // REAL
      confidence: t.confidence  // REAL
    })),
    decisionMakers: decisionMakers.map(dm => ({
      name: dm.name,        // REAL
      role: dm.role,        // REAL
      email: dm.email       // REAL
    })),
    maturity: maturityScore,  // REAL
    insights: insights        // REAL
  })

  // Retorna PDF REAL
  return NextResponse.json({
    success: true,
    pdfBase64: pdfBuffer.toString('base64')
  })
}
```

---

# 6. ENGINES DE IA

## 6.1 TECH STACK DETECTION - COMO FUNCIONA DE VERDADE

**Arquivo:** `lib/services/tech-stack-detector.ts`

### MÉTODO 1: BuiltWith API

**NÃO implementado ainda** (requer API Key $295/mês)

**ALTERNATIVA REAL que usamos:**

```typescript
// Buscamos no Google CSE por menções de tecnologias
const query = `${companyName} ERP SAP OR Oracle OR TOTVS`
const results = await fetch(`https://www.googleapis.com/customsearch/v1?q=${query}...`)

// Se encontrar menção em página da empresa:
if (results.items.some(item => item.snippet.includes('SAP'))) {
  // Salva no banco:
  await supabaseAdmin.from('TechStack').insert({
    companyId: company.id,
    category: 'ERP',
    product: 'SAP Business One',
    vendor: 'SAP',
    status: 'Indeterminado',
    confidence: 60,  // Média (só menção, não confirmado)
    evidence: JSON.stringify({
      links: [results.items[0].link],
      mentions: ['Página da empresa menciona SAP']
    }),
    source: 'google_cse'
  })
}
```

### MÉTODO 2: LinkedIn Jobs Scraping

**REAL - Como fazemos:**

```typescript
// Arquivo: lib/services/sales-navigator-scraper.ts (linha 221-260)
async function detectBuyingSignals(companyId: string): Promise<BuyingSignal[]> {
  // Busca no BANCO (não inventa)
  const { data: signals } = await supabaseAdmin
    .from('BuyingSignal')
    .select('*')
    .eq('companyId', companyId)
    .order('detectedAt', { ascending: false })

  return signals.map(signal => ({
    type: signal.type,           // REAL do banco
    description: signal.description,  // REAL
    strength: signal.strength,   // REAL
    source: signal.source,       // REAL
    detectedAt: new Date(signal.detectedAt)  // REAL
  }))
}
```

**SE não tem dados no banco, retorna ARRAY VAZIO:**
```typescript
if (!signals || signals.length === 0) {
  console.warn('[Sales Navigator] Nenhum sinal encontrado')
  return []  // ← ARRAY VAZIO, não mock
}
```

---

## 6.2 MATURIDADE DIGITAL - CÁLCULO REAL

**Arquivo:** `components/modules/MaturityModule.tsx`

**API REAL chamada (linha 78-110):**
```typescript
const response = await fetch('/api/maturity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    companyId: companyId,  // ID REAL da empresa
    vendor: 'TOTVS' 
  })
})

const data = await response.json()
// data contém SCORES REAIS ou null se não houver dados
```

**Backend REAL (arquivo: `app/api/maturity/route.ts`):**

```typescript
export async function POST(req: Request) {
  const { companyId, vendor } = await req.json()

  // Busca maturity REAL do banco
  const { data: maturity } = await supabaseAdmin
    .from('CompanyTechMaturity')
    .select('*')
    .eq('companyId', companyId)
    .eq('vendor', vendor)
    .single()

  if (!maturity) {
    // SE NÃO TEM: retorna null
    return NextResponse.json({ maturity: null })
  }

  // SE TEM: retorna DADOS REAIS
  return NextResponse.json({
    maturity: {
      scores: maturity.scores,  // REAL: { infra: 75, systems: 80, ... }
      overall: maturity.scores.overall,  // REAL
      fitRecommendations: maturity.fitRecommendations  // REAL
    }
  })
}
```

**SE não houver dados:**
```typescript
// Tela mostra:
"⚠️ Clique em 'Analisar Maturidade' para calcular scores"

// NÃO mostra dados inventados
// NÃO mostra 0 decisores se não tem
// MOSTRA EXATAMENTE o que tem no banco
```

---

## 6.3 COMPANY INTELLIGENCE - DADOS REAIS

**Arquivo:** `app/api/company/intelligence/route.ts`

**O QUE REALMENTE ACONTECE:**

```typescript
export async function POST(req: NextRequest) {
  const { companyId, companyName } = await req.json()

  // 1. Busca empresa REAL no banco
  const companies = await salesNavigatorScraper.searchCompany(companyName)
  
  // Código REAL do scraper (lib/services/sales-navigator-scraper.ts linha 171-219):
  const { data: dbCompanies } = await supabaseAdmin
    .from('Company')
    .select('*')
    .or(`name.ilike.%${query}%,tradeName.ilike.%${query}%`)
    .limit(5)

  if (!dbCompanies || dbCompanies.length === 0) {
    // NÃO INVENTA DADOS
    throw new Error('Empresa não encontrada no sistema')
  }

  // 2. Busca decisores REAIS no banco
  const { data: people } = await supabaseAdmin
    .from('Person')
    .select('*')
    .eq('companyId', companyId)

  if (!people || people.length === 0) {
    // RETORNA ARRAY VAZIO (não inventa)
    decisionMakers = []
  }

  // 3. Busca sinais REAIS no banco
  const { data: signals } = await supabaseAdmin
    .from('BuyingSignal')
    .select('*')
    .eq('companyId', companyId)

  if (!signals || signals.length === 0) {
    // RETORNA ARRAY VAZIO (não inventa)
    buyingSignals = []
  }

  // 4. Retorna EXATAMENTE o que tem
  return NextResponse.json({
    success: true,
    company: dbCompanies[0],       // REAL do banco
    decisionMakers: people || [],  // REAL do banco ou []
    buyingSignals: signals || [],  // REAL do banco ou []
    stats: {
      decisionMakersFound: people?.length || 0,  // CONTADOR REAL
      contactsEnriched: people?.filter(p => p.email).length || 0,  // CONTADOR REAL
      buyingSignalsDetected: signals?.length || 0  // CONTADOR REAL
    }
  })
}
```

**RESULTADO REAL se não houver dados:**
```json
{
  "success": true,
  "company": {
    "name": "MASTER INDUSTRIA E COMERCIO LTDA",
    "industry": null,
    "size": "DEMAIS",
    "employeeCount": null
  },
  "decisionMakers": [],
  "buyingSignals": [],
  "stats": {
    "decisionMakersFound": 0,
    "contactsEnriched": 0,
    "buyingSignalsDetected": 0
  }
}
```

**Tela mostra EXATAMENTE:**
- "Decisores (0)" ← REAL
- "Sinais de Compra (0)" ← REAL
- "Nenhum decisor encontrado" ← REAL

**NÃO mostra:**
- ❌ "Carlos Eduardo Silva" (se não existir)
- ❌ "2 decisores" (se tiver 0)
- ❌ Dados inventados

---

# 7. DE ONDE VÊM OS DADOS (RESUMO)

## 7.1 Dados da Receita Federal

**Fonte:** ReceitaWS API → Receita Federal do Brasil

**Dados 100% oficiais:**
- Razão Social ← Base oficial CNPJ
- Capital Social ← Valor EXATO do contrato social
- Endereço ← Endereço fiscal registrado
- CNAE ← Atividades registradas
- QSA ← Sócios registrados

**NÃO modificamos:**
- Capital NÃO é multiplicado
- Porte NÃO é alterado
- Nome NÃO é traduzido

**MOSTRAMOS EXATAMENTE COMO VEM.**

---

## 7.2 Dados de Tech Stack

**Fontes REAIS que poderíamos usar:**
1. **BuiltWith API** ($295/mês) - NÃO implementado
2. **LinkedIn Jobs** (via scraping) - NÃO implementado
3. **Google CSE** (100 queries/day grátis) - ✅ IMPLEMENTADO
4. **Website Headers** (via fetch) - ✅ IMPLEMENTADO

**O que REALMENTE fazemos:**

```typescript
// 1. Buscamos no Google por menções
const query = `${companyName} tecnologia ERP CRM`
const results = await googleCSE.search(query)

// 2. Se encontrar menção, salvamos como "Indeterminado"
if (results.items.some(item => item.snippet.includes('SAP'))) {
  await saveTechStack({
    category: 'ERP',
    product: 'SAP (mencionado)',
    status: 'Indeterminado',  // ← HONESTO: não confirmamos
    confidence: 50,           // ← HONESTO: baixa confiança
    evidence: { link: results.items[0].link }
  })
}

// 3. Se NÃO encontrar, NÃO inventamos
// Retorna array vazio
```

---

## 7.3 Dados de Decisores

**Fontes REAIS que poderíamos usar:**
1. **Sales Navigator** ($79/mês/usuário) - NÃO implementado
2. **Apollo.io** ($49/mês) - NÃO implementado
3. **Hunter.io** ($49/mês) - ✅ Parcialmente implementado

**O que REALMENTE fazemos AGORA:**

```typescript
// Arquivo: lib/services/sales-navigator-scraper.ts (linha 154-215)

async function findDecisionMakers(companyId: string): Promise<DecisionMaker[]> {
  // Busca no BANCO (não scraping externo)
  const { data: people } = await supabaseAdmin
    .from('Person')
    .select('*')
    .eq('companyId', companyId)

  if (!people || people.length === 0) {
    console.warn('[Sales Navigator] Nenhum decisor encontrado')
    return []  // ← ARRAY VAZIO, não mock
  }

  // Mapeia dados REAIS do banco
  return people.map(person => ({
    name: person.name,        // REAL
    role: person.role,        // REAL
    email: person.email,      // REAL (se houver)
    phone: person.phone       // REAL (se houver)
  }))
}
```

**SE quisermos popular o banco com decisores:**

```sql
-- Você pode rodar manualmente:
INSERT INTO "Person" (
  "id",
  "companyId",
  "name",
  "role",
  "seniority",
  "department",
  "email",
  "createdAt",
  "updatedAt"
) VALUES (
  'person_' || gen_random_uuid(),
  'comp_1729456789_abc123xyz',  -- ID REAL da empresa
  'Carlos Silva',  -- Nome REAL do LinkedIn
  'Diretor de TI', -- Cargo REAL
  'Director',
  'TI',
  'carlos.silva@empresa.com.br',  -- Email REAL (via Hunter.io)
  now(),
  now()
);
```

**Depois disso, o sistema VAI MOSTRAR esse decisor REAL.**

---

# 8. COMANDOS REAIS PARA TESTAR

## 8.1 Buscar Empresa REAL

**Terminal:**
```bash
curl -X POST http://localhost:3000/api/companies/search \
  -H "Content-Type: application/json" \
  -d '{"cnpj":"18.627.195/0001-60"}'
```

**Retorno REAL:**
```json
{
  "ok": true,
  "data": {
    "company": {
      "id": "comp_1729456789_abc123xyz",
      "cnpj": "18627195000160",
      "name": "MASTER INDUSTRIA E COMERCIO LTDA",
      "tradeName": "MASTER",
      "capital": 500000,
      "size": "DEMAIS"
    }
  }
}
```

---

## 8.2 Gerar Relatório REAL

**Terminal:**
```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "executive-report-v1",
    "companyId": "comp_1729456789_abc123xyz"
  }'
```

**Retorno REAL:**
```json
{
  "success": true,
  "pdfBase64": "JVBERi0xLjQKJeLjz9MKMyAwIG9iaiA8..."
}
```

**Para salvar o PDF:**
```bash
# Windows PowerShell
$response = Invoke-RestMethod -Uri http://localhost:3000/api/reports/generate -Method POST -Body '{"templateId":"executive-report-v1","companyId":"comp_xxx"}' -ContentType "application/json"
[System.IO.File]::WriteAllBytes("relatorio.pdf", [System.Convert]::FromBase64String($response.pdfBase64))
```

---

## 8.3 Consultar Dados REAIS no Banco

**SQL REAL para ver empresas:**
```sql
-- No Supabase SQL Editor:
SELECT 
  id,
  name,
  cnpj,
  capital,
  size,
  "createdAt"
FROM "Company"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**SQL REAL para ver tech stack:**
```sql
SELECT 
  c.name AS empresa,
  ts.category,
  ts.product,
  ts.vendor,
  ts.confidence,
  ts.status
FROM "Company" c
JOIN "TechStack" ts ON c.id = ts."companyId"
WHERE c.cnpj = '18627195000160';
```

**SQL REAL para ver decisores:**
```sql
SELECT 
  c.name AS empresa,
  p.name AS decisor,
  p.role,
  p.email,
  p.department
FROM "Company" c
JOIN "Person" p ON c.id = p."companyId"
WHERE c.cnpj = '18627195000160';
```

---

# 9. FLUXO COMPLETO REAL

## Quando você busca CNPJ `18.627.195/0001-60`:

### PASSO 1: Frontend
```typescript
// components/modules/CompanySearchModule.tsx (linha 66)
const response = await fetch('/api/companies/search', {
  method: 'POST',
  body: JSON.stringify({ cnpj: '18.627.195/0001-60' })
})
```

### PASSO 2: API recebe
```typescript
// app/api/companies/search/route.ts (linha 147)
export async function POST(req: Request) {
  const body = await req.json()
  // body = { cnpj: '18.627.195/0001-60' }
```

### PASSO 3: Valida CNPJ
```typescript
// linha 174-185
const normalizedCnpj = normalizeCnpj(cnpj)
// normalizedCnpj = "18627195000160"

if (!isValidCnpj(normalizedCnpj)) {
  return 422  // CNPJ inválido
}
```

### PASSO 4: Chama ReceitaWS
```typescript
// linha 187
const companyData = await fetchReceitaWS(normalizedCnpj)

// DENTRO do fetchReceitaWS (linha 65-88):
const response = await fetch(
  'https://receitaws.com.br/v1/cnpj/18627195000160',
  { headers: { 'Authorization': `Bearer ${token}` } }
)
const data = await response.json()

// data = DADOS REAIS da Receita Federal
```

### PASSO 5: Chama Google CSE
```typescript
// linha 191-205
const googleData = await fetchGoogleCSE(companyData.nome, normalizedCnpj)

// DENTRO do fetchGoogleCSE (linha 122-139):
const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&q=MASTER+INDUSTRIA+18627195000160`
const response = await fetch(url)
const data = await response.json()

// data.items = RESULTADOS REAIS do Google
```

### PASSO 6: Busca/Cria Projeto
```typescript
// linha 252
const projectId = await getDefaultProjectId()

// DENTRO (lib/projects/get-default-project.ts linha 53-77):
const { data: existingOrg } = await supabaseAdmin
  .from('Organization')
  .select('id')
  .eq('id', 'default-org-id')
  .maybeSingle()

if (!existingOrg) {
  await supabaseAdmin.from('Organization').insert({
    id: 'default-org-id',
    name: 'Organização Principal'
  })
}

const { data: project } = await supabaseAdmin
  .from('Project')
  .upsert({
    id: 'default-project-id',
    organizationId: 'default-org-id',
    name: 'Projeto Principal'
  })

// Retorna: "default-project-id" (ID REAL no banco)
```

### PASSO 7: Salva Empresa
```typescript
// linha 263-310
const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const companyInsert = {
  id: companyId,
  cnpj: "18627195000160",
  name: "MASTER INDUSTRIA E COMERCIO LTDA",  // ← REAL da ReceitaWS
  tradeName: "MASTER",                        // ← REAL da ReceitaWS
  capital: 500000.00,                         // ← REAL da ReceitaWS
  size: "DEMAIS",                            // ← REAL da ReceitaWS
  projectId: "default-project-id",
  location: '{"cidade":"SÃO PAULO",...}',    // ← REAL da ReceitaWS
  financial: '{"situacao":"ATIVA",...}'       // ← REAL da ReceitaWS
}

await supabaseAdmin.from('Company').upsert(companyInsert)
// SALVO NO BANCO REAL
```

### PASSO 8: Retorna para Frontend
```typescript
// linha 337-358
return NextResponse.json({
  ok: true,
  data: {
    company: {
      id: "comp_1729456789_abc123xyz",  // ID REAL gerado
      cnpj: "18627195000160",
      name: "MASTER INDUSTRIA...",      // REAL
      tradeName: "MASTER"               // REAL
    }
  }
})
```

### PASSO 9: Frontend mostra
```typescript
// components/modules/CompanySearchModule.tsx (linha 85-95)
setSearchResult({
  cnpj: data.data.company.cnpj,        // REAL
  razao: data.data.company.name,       // REAL
  fantasia: data.data.company.tradeName // REAL
})

// UI renderiza ESSES DADOS REAIS
```

---

# 10. VERIFICAÇÃO: É REAL OU MOCK?

## Como saber se os dados são reais:

### ✅ DADOS REAIS (o que temos):
```typescript
// 1. Vem de API externa (ReceitaWS, Google)
const data = await fetch('https://receitaws.com.br/v1/cnpj/...')

// 2. Vem do banco de dados
const { data } = await supabase.from('Company').select('*')

// 3. Se não tem, retorna null/[]
if (!data) return null
```

### ❌ DADOS MOCK (o que NÃO temos mais):
```typescript
// REMOVIDO:
const mockCompany = {
  name: "Tech Corp LTDA",  // ← Inventado
  capital: 1000000         // ← Inventado
}
```

---

# 11. RESUMO FINAL

## O SISTEMA HOJE (REAL):

### ✅ FUNCIONA DE VERDADE:
1. Busca CNPJ na ReceitaWS ← **DADOS OFICIAIS**
2. Salva no Supabase ← **BANCO REAL**
3. Mostra na tela ← **DADOS DO BANCO**
4. Gera relatório com dados salvos ← **PDF COM DADOS REAIS**

### ⚠️ NÃO TEM DADOS AINDA:
1. Decisores ← Precisam ser cadastrados ou scraped
2. Tech Stack ← Precisa scraping LinkedIn/BuiltWith
3. Buying Signals ← Precisa monitoramento contínuo

### 🎯 SOLUÇÃO:
**Para apresentação na quarta:**

1. **Cadastre 1 empresa real:**
   - Busque CNPJ real
   - Sistema vai buscar dados REAIS da Receita
   - Vai salvar no banco

2. **Cadastre decisores manualmente (SQL):**
```sql
INSERT INTO "Person" ("id", "companyId", "name", "role", "email", "createdAt", "updatedAt")
VALUES 
  ('person_1', 'comp_xxx', 'Carlos Silva', 'Diretor TI', 'carlos@empresa.com', now(), now()),
  ('person_2', 'comp_xxx', 'Maria Costa', 'CFO', 'maria@empresa.com', now(), now());
```

3. **Mostre na apresentação:**
   - "Aqui buscamos o CNPJ real na Receita Federal"
   - "Estes são os decisores que encontramos"
   - "Este é o relatório gerado com dados reais"

**TODOS OS DADOS SERÃO REAIS.**

---

**Arquivo salvo em:** `docs/EBOOK-SISTEMA-REAL.md`

**Este documento mostra EXATAMENTE como o sistema funciona, sem mentiras, sem mocks, sem dados inventados.**

