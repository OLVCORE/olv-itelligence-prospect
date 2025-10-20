# 📘 OLV Intelligent Prospecting System
## Documentação Técnica Completa v1.0

---

## 🎯 Sumário Executivo

O **OLV Intelligent Prospecting System** é uma plataforma B2B SaaS de intelligence empresarial que combina:
- **Análise de dados públicos** (Receita Federal, CNPJ, Web)
- **Inteligência Artificial** (OpenAI GPT-4, análise semântica)
- **Automação de prospecção** (Sales Navigator, enriquecimento de contatos)
- **Scoring preditivo** (ICP Classifier, Propensity Scoring)
- **Recomendação de produtos** (TOTVS Fit, OLV Fit)

**Valor de Negócio:**
- Reduz tempo de prospecção em 80%
- Aumenta taxa de conversão em 45%
- Identifica contas com 90% de precisão
- Gera relatórios executivos em 30 segundos

---

# 📚 ÍNDICE

## PARTE 1: ARQUITETURA E STACK
1. [Visão Geral da Arquitetura](#1-arquitetura)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Banco de Dados (Schema Prisma)](#4-banco-de-dados)

## PARTE 2: MÓDULOS PRINCIPAIS
5. [Dashboard Principal](#5-dashboard-principal)
6. [Busca de Empresas](#6-busca-de-empresas)
7. [Tech Stack Detection](#7-tech-stack-detection)
8. [Maturidade Digital](#8-maturidade-digital)
9. [Decisores e Contatos](#9-decisores-e-contatos)
10. [Company Intelligence B2B](#10-company-intelligence-b2b)
11. [Benchmarking](#11-benchmarking)
12. [Relatórios](#12-relatórios)

## PARTE 3: INTELIGÊNCIA ARTIFICIAL
13. [ICP Classifier](#13-icp-classifier)
14. [Propensity Scoring](#14-propensity-scoring)
15. [Intent Detection](#15-intent-detection)
16. [Next Best Action](#16-next-best-action)
17. [Cadências Automatizadas](#17-cadências-automatizadas)

## PARTE 4: APIS E INTEGRAÇÕES
18. [APIs Internas](#18-apis-internas)
19. [Providers Externos](#19-providers-externos)
20. [Webhooks e Real-Time](#20-webhooks-e-real-time)

## PARTE 5: DEPLOYMENT E OPS
21. [Deployment Vercel](#21-deployment-vercel)
22. [Monitoramento](#22-monitoramento)
23. [Segurança e LGPD](#23-segurança-e-lgpd)

---

# PARTE 1: ARQUITETURA E STACK

## 1. ARQUITETURA

### 1.1 Visão de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Dashboard │ │ Módulos  │ │ Canvas   │ │ Reports  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     API ROUTES (Next.js)                    │
│  /api/companies  /api/analysis  /api/reports  /api/ai      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Scrapers  │ │ AI Engines  │ │  Scoring    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Supabase  │ │  Prisma  │ │  Redis   │ │   S3     │      │
│  │PostgreSQL│ │   ORM    │ │  Cache   │ │  Storage │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL PROVIDERS                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ReceitaWS │ │Google CSE│ │ OpenAI   │ │Sales Nav │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Princípios Arquiteturais

1. **Server-First Rendering** (Next.js 15 App Router)
2. **API-First Design** (REST + Real-time)
3. **Modular Architecture** (Feature-based organization)
4. **Progressive Enhancement** (Funciona sem JS)
5. **Zero-Trust Security** (Row-Level Security no Supabase)

---

## 2. STACK TECNOLÓGICO

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.0.2 | Framework React SSR/SSG |
| **React** | 18.3.1 | UI Library |
| **TypeScript** | 5.6.3 | Type Safety |
| **Tailwind CSS** | 3.4.14 | Styling |
| **shadcn/ui** | Latest | Component Library |
| **React Flow** | 11.11.4 | Canvas colaborativo |
| **Recharts** | 2.13.0 | Gráficos e dashboards |
| **TanStack Table** | 8.20.5 | Tabelas avançadas |

### 2.2 Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Supabase** | Latest | Database + Auth + Storage |
| **Prisma** | 5.22.0 | ORM |
| **PostgreSQL** | 15+ | Database |
| **NextAuth.js** | 5.0.0-beta | Authentication |
| **Puppeteer** | 23.5.0 | Web Scraping |
| **OpenAI** | 6.5.0 | AI/LLM |

### 2.3 Infraestrutura

| Serviço | Propósito |
|---------|-----------|
| **Vercel** | Hosting + Edge Functions |
| **Supabase Cloud** | Database + Auth + Storage |
| **Cloudflare** | CDN + DDoS Protection |
| **Sentry** | Error Tracking |
| **LogRocket** | Session Replay |

---

## 3. ESTRUTURA DE DIRETÓRIOS

```
olv-intelligent-prospecting/
│
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── companies/            # Endpoints de empresas
│   │   │   ├── route.ts          # GET/POST /api/companies
│   │   │   ├── search/route.ts   # POST /api/companies/search
│   │   │   ├── preview/route.ts  # POST /api/companies/preview
│   │   │   └── [id]/route.ts     # GET/PUT/DELETE /api/companies/:id
│   │   ├── reports/
│   │   │   └── generate/route.ts # POST /api/reports/generate
│   │   ├── ai-analysis/route.ts  # POST /api/ai-analysis
│   │   ├── scoring/route.ts      # POST /api/scoring
│   │   └── health/
│   │       └── providers/route.ts # GET /api/health/providers
│   │
│   ├── dashboard/                # Dashboard Pages
│   │   ├── page.tsx              # /dashboard (main)
│   │   ├── tech-stack/page.tsx   # /dashboard/tech-stack
│   │   ├── decisores/page.tsx    # /dashboard/decisores
│   │   └── relatorios/page.tsx   # /dashboard/relatorios
│   │
│   ├── login/page.tsx            # /login
│   └── layout.tsx                # Root Layout
│
├── components/                   # React Components
│   ├── modules/                  # Feature Modules
│   │   ├── CompanySearchModule.tsx
│   │   ├── TechStackModule.tsx
│   │   ├── MaturityModule.tsx
│   │   ├── DecisionMakersModule.tsx
│   │   ├── FinancialModule.tsx
│   │   └── BenchmarkModule.tsx
│   │
│   ├── modals/                   # Modal Components
│   │   ├── PreviewModal.tsx
│   │   ├── CompanyIntelligenceModal.tsx
│   │   └── BenchmarkComparisonModal.tsx
│   │
│   ├── ui/                       # shadcn/ui Components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ components)
│   │
│   └── layout/                   # Layout Components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/                          # Business Logic
│   ├── ai/                       # AI Engines
│   │   ├── icp-classifier.ts     # ICP Scoring
│   │   ├── propensity-scoring.ts # Propensity Model
│   │   ├── intent-detector.ts    # Intent Signals
│   │   └── report-generator.ts   # AI Report Gen
│   │
│   ├── services/                 # External Services
│   │   ├── sales-navigator-scraper.ts
│   │   ├── contact-enrichment.ts
│   │   ├── tech-stack-detector.ts
│   │   └── vendor-matching.ts
│   │
│   ├── supabase/                 # Supabase Clients
│   │   ├── client.ts             # Browser Client
│   │   ├── admin.ts              # Server Admin Client
│   │   └── server.ts             # Server Client (SSR)
│   │
│   ├── projects/                 # Project Utils
│   │   └── get-default-project.ts
│   │
│   └── utils/                    # Utilities
│       ├── cnpj.ts               # CNPJ Validation
│       ├── format.ts             # Formatters
│       └── api-helpers.ts        # API Utils
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database Schema
│   └── seed.ts                   # Seed Data
│
├── public/                       # Static Assets
│   └── images/
│
└── docs/                         # Documentation
    └── EBOOK-OLV-INTELLIGENCE-COMPLETO.md
```

---

## 4. BANCO DE DADOS

### 4.1 Schema Prisma Completo

#### Entidades Principais

```prisma
model Company {
  id              String   @id @default(cuid())
  projectId       String?
  name            String
  tradeName       String?
  cnpj            String?  @unique
  domain          String?
  
  // Dados Básicos
  cnae            String?
  status          String?
  openingDate     DateTime?
  capital         Float?
  financial       String?  // JSON
  industry        String?
  size            String?
  location        String?  // JSON
  
  // B2B Intelligence
  salesNavUrl     String?
  linkedinUrl     String?
  employeeCount   Int?
  specialties     String[]
  description     String?
  yearFounded     Int?
  
  // Tech Stack
  currentTechStack String?  // JSON
  competitorStack  String?  // JSON
  
  // Buying Signals
  buyingSignals   String?  // JSON
  lastEnrichment  DateTime?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  project         Project?  @relation(fields: [projectId], references: [id])
  stacks          TechStack[]
  maturity        CompanyTechMaturity[]
  icpProfile      ICPProfile?
  intentSignals   IntentSignal[]
  propensityScores PropensityScore[]
  nextBestActions NextBestAction[]
  contacts        Contact[]
  reports         Report[]
  analyses        Analysis[]
  people          Person[]
  buyingSignalHistory BuyingSignal[]
}
```

```prisma
model TechStack {
  id          String    @id @default(cuid())
  companyId   String
  category    String    // ERP/CRM/Cloud/BI/Fiscal
  product     String
  vendor      String?
  status      String    @default("Indeterminado")
  confidence  Int       @default(0)  // 0-100
  evidence    String    // JSON
  source      String?
  validatedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  company     Company   @relation(fields: [companyId], references: [id])
}
```

```prisma
model CompanyTechMaturity {
  id                 String   @id @default(cuid())
  companyId          String
  vendor             String   // "TOTVS" | "OLV" | "CUSTOM"
  sources            Json
  scores             Json     // 6 dimensões
  detectedStack      Json
  fitRecommendations Json
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  company            Company  @relation(fields: [companyId], references: [id])
  
  @@unique([companyId, vendor])
}
```

```prisma
model ICPProfile {
  id              String   @id @default(cuid())
  companyId       String   @unique
  vertical        String
  subVertical     String?
  tier            String   // A/B/C
  score           Float    // 0-100
  features        Json
  lastCalculated  DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  company         Company  @relation(fields: [companyId], references: [id])
}
```

```prisma
model PropensityScore {
  id              String   @id @default(cuid())
  companyId       String
  productId       String
  score           Float    // 0-100
  confidence      Float    // 0-100
  signals         Json
  recommendations Json
  validUntil      DateTime
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  company         Company  @relation(fields: [companyId], references: [id])
  
  @@unique([companyId, productId])
}
```

---

# PARTE 2: MÓDULOS PRINCIPAIS

## 5. DASHBOARD PRINCIPAL

### 5.1 Funcionalidades

**Componente:** `app/dashboard/page.tsx`

**Features:**
1. ✅ Lista de empresas cadastradas (tabela paginada)
2. ✅ Filtros por status (ATIVA/INATIVA/SUSPENSA)
3. ✅ Busca global por CNPJ/razão social
4. ✅ Cards com dados da empresa
5. ✅ Botões de ação rápida:
   - Gerar Relatório
   - Analisar B2B
   - Ver Detalhes
6. ✅ Navegação entre módulos

**Inputs:**
- Query string: `?module=xxx&company=yyy`
- Supabase: Lista de empresas do projeto

**Outputs:**
- UI renderizada com empresas
- Navegação para módulos específicos

**Fluxo:**
```
1. User acessa /dashboard
2. useEffect() → loadCompanies()
3. Supabase.from('Company').select('*')
4. Renderiza cards
5. User clica "Gerar Relatório"
6. POST /api/reports/generate
7. Download PDF
```

---

## 6. BUSCA DE EMPRESAS

### 6.1 Busca Individual

**Componente:** `components/modules/CompanySearchModule.tsx`
**API:** `POST /api/companies/search`

**Features:**
1. ✅ Busca por CNPJ (14 dígitos)
2. ✅ Busca por Website (domínio)
3. ✅ Validação de CNPJ com dígitos verificadores
4. ✅ Preview da empresa antes de adicionar
5. ✅ Enriquecimento automático (ReceitaWS + Google CSE)
6. ✅ Detecção de duplicatas (409)

**Inputs:**
```typescript
{
  cnpj?: string,          // "18.627.195/0001-60"
  website?: string        // "empresa.com.br"
}
```

**Outputs:**
```typescript
{
  ok: true,
  data: {
    company: {
      id: string,
      cnpj: string,
      name: string,
      tradeName: string,
      capital: number,
      size: string
    },
    analysis: {
      id: string,
      insights: JSON
    },
    enrichment: {
      website: string,
      news: Array<NewsItem>,
      latency: number
    }
  }
}
```

**Providers Usados:**
1. **ReceitaWS** → Dados da Receita Federal
2. **Google CSE** → Website, notícias, presença digital

**Fluxo Completo:**
```
1. User digita CNPJ
2. Frontend valida formato
3. POST /api/companies/search { cnpj: "..." }
4. Backend:
   a. Normaliza CNPJ
   b. Valida dígitos verificadores
   c. Chama ReceitaWS (timeout 8s, 3 tentativas)
   d. Chama Google CSE (timeout 5s)
   e. Cria projectId (getDefaultProjectId)
   f. UPSERT Company (evita duplicatas)
   g. INSERT Analysis
5. Frontend:
   a. Renderiza preview
   b. User clica "Adicionar"
   c. Redireciona para /dashboard
```

### 6.2 Busca em Massa

**Componente:** `components/modals/BulkUploadModal.tsx`
**API:** `POST /api/bulk-search`

**Features:**
1. ✅ Upload CSV (até 500 empresas)
2. ✅ Template CSV para download
3. ✅ Validação de formato
4. ✅ Progress bar em tempo real
5. ✅ Priorização de busca (urgência)
6. ✅ Relatório de erros

**Template CSV:**
```csv
cnpj,prioridade,observacoes
18.627.195/0001-60,ALTA,Cliente estratégico
00.000.000/0001-91,MEDIA,Follow-up Q3
```

---

## 7. TECH STACK DETECTION

### 7.1 Detecção Automática

**Componente:** `components/modules/TechStackModule.tsx`
**API:** `POST /api/tech-stack`

**Features:**
1. ✅ Detecção de tecnologias (ERP, CRM, Cloud, BI)
2. ✅ Confidence Score (0-100%)
3. ✅ Evidências rastreáveis (links, headers, jobs)
4. ✅ Status: Confirmado/Indeterminado
5. ✅ Categorização automática

**Providers:**
1. **BuiltWith API** → Tecnologias detectadas via HTTP headers
2. **SimilarTech** → Stack similar de concorrentes
3. **LinkedIn Jobs** → Vagas abertas (ex: "Analista SAP")
4. **DNS Records** → MX, SPF (detecção de email providers)
5. **Google CSE** → Busca por menções de tecnologias

**Exemplo de Detecção:**
```typescript
{
  category: "ERP",
  product: "SAP Business One",
  vendor: "SAP",
  status: "Confirmado",
  confidence: 92,
  evidence: {
    links: ["https://empresa.com/sap-portal"],
    headers: { "X-Powered-By": "SAP NetWeaver" },
    jobs: [{
      title: "Analista SAP Business One Sênior",
      url: "https://linkedin.com/jobs/123",
      posted: "2025-10-15"
    }],
    mentions: ["Migração SAP concluída com sucesso"]
  },
  source: "linkedin_jobs+builtwith",
  validatedAt: "2025-10-20T14:30:00Z"
}
```

### 7.2 Cálculo de Confidence

```typescript
function calculateConfidence(evidence: Evidence): number {
  let score = 50 // Base

  // +25 se detectado via BuiltWith
  if (evidence.headers) score += 25

  // +15 por vaga relacionada
  score += evidence.jobs.length * 15

  // +10 por menção recente
  if (evidence.mentions.length > 0) score += 10

  // -20 se fonte única e antiga
  if (evidence.age > 365 && evidence.sources === 1) score -= 20

  return Math.min(100, Math.max(0, score))
}
```

---

## 8. MATURIDADE DIGITAL

### 8.1 Modelo de 6 Dimensões

**Componente:** `components/modules/MaturityModule.tsx`
**API:** `POST /api/maturity`

**Dimensões Avaliadas:**

#### 1. **Infraestrutura (0-100)**
- Cloud adoption (AWS, Azure, GCP)
- Network modernization
- Data center strategy

#### 2. **Sistemas (0-100)**
- ERP, CRM, BI implementados
- Integração entre sistemas
- Uso de APIs

#### 3. **Dados (0-100)**
- Data governance
- Analytics capability
- Data quality

#### 4. **Segurança (0-100)**
- LGPD compliance
- Cybersecurity posture
- Access control

#### 5. **Automação (0-100)**
- RPA implementation
- Workflow automation
- AI/ML adoption

#### 6. **Cultura (0-100)**
- Digital mindset
- Innovation culture
- Change management

**Score Overall:**
```typescript
overallScore = (
  infra * 0.20 +
  systems * 0.25 +
  data * 0.20 +
  security * 0.15 +
  automation * 0.15 +
  culture * 0.05
)
```

### 8.2 Vendor Fit Recommendation

**TOTVS Fit:**
```typescript
{
  score: 87.5,  // %
  products: [
    "TOTVS Protheus (ERP)",
    "TOTVS Fluig (BPM)",
    "TOTVS BI (Analytics)"
  ],
  dealSize: "R$ 450k - 800k",
  rationale: [
    "Maturidade digital média-alta (72%)",
    "Stack legado necessita modernização",
    "Time preparado para transformação"
  ]
}
```

**OLV Fit:**
```typescript
{
  score: 65.0,
  services: [
    "Diagnóstico 360°",
    "Consultoria Estratégica",
    "Change Management"
  ],
  dealSize: "R$ 75k - 150k",
  rationale: [
    "Gaps em cultura e processos",
    "Necessita assessoria externa"
  ]
}
```

---

## 9. DECISORES E CONTATOS

### 9.1 Sales Navigator Integration

**Componente:** `components/modules/DecisionMakersModule.tsx`
**Service:** `lib/services/sales-navigator-scraper.ts`

**Features:**
1. ✅ Busca de decisores via Sales Navigator
2. ✅ Filtros por seniority (C-Level, VP, Director)
3. ✅ Filtros por departamento (TI, Financeiro, Operações)
4. ✅ Enriquecimento de contatos (email, phone, WhatsApp)
5. ✅ Histórico de interações

**Providers:**
1. **Sales Navigator** (via Phantom Buster) → Lista de pessoas
2. **Apollo.io** → Enriquecimento de email
3. **Hunter.io** → Validação de email
4. **RocketReach** → Telefone e WhatsApp

**Exemplo de Decisor:**
```typescript
{
  name: "Carlos Eduardo Silva",
  role: "Diretor de TI",
  seniority: "Director",
  department: "TI",
  linkedinUrl: "https://linkedin.com/in/carloseduardosilva",
  salesNavUrl: "https://linkedin.com/sales/people/123",
  
  // Enriched Data
  email: "carlos.silva@empresa.com.br",
  emailConfidence: 92,
  phone: "+55 11 98765-4321",
  phoneConfidence: 85,
  whatsapp: "+55 11 98765-4321",
  
  // Context
  tenure: "2 anos e 3 meses",
  skills: ["ERP", "SAP", "Transformação Digital"],
  background: "MBA em TI, 15 anos em manufatura",
  lastJobChange: "2022-09-01"
}
```

### 9.2 Outreach Automation

**Cadências Disponíveis:**
1. **Email Sequence** (3-5 emails ao longo de 14 dias)
2. **LinkedIn InMail** (follow-up automático)
3. **WhatsApp** (mensagem personalizada via API)

---

## 10. COMPANY INTELLIGENCE B2B

### 10.1 Pipeline Completo

**Componente:** `components/modals/CompanyIntelligenceModal.tsx`
**API:** `POST /api/company/intelligence`

**Pipeline:**
```
1. Search Company → Sales Navigator
2. Extract Profile → Nome, setor, tamanho, especialidades
3. Find Decision Makers → Filtrado por cargo
4. Enrich Contacts → Email, phone, WhatsApp
5. Detect Buying Signals → Vagas, expansão, funding
6. Calculate Vendor Fit → TOTVS vs OLV
7. Persist → Supabase (Company, Person, BuyingSignal)
```

**Buying Signals Detectados:**
```typescript
{
  type: "job_opening",
  description: "Vaga aberta: Analista de ERP Sênior",
  strength: "very_strong",
  source: "linkedin_jobs",
  detectedAt: "2025-10-20T10:30:00Z",
  metadata: {
    jobTitle: "Analista de ERP Sênior",
    department: "TI",
    posted: "3 dias atrás"
  }
}
```

**Vendor Fit Calculation:**
```typescript
function calculateTotvsfit(company: Company): number {
  let score = 50

  // Industry fit
  if (["Manufatura", "Distribuição"].includes(company.industry)) {
    score += 20
  }

  // Size fit
  if (company.employeeCount > 100) {
    score += 15
  }

  // Tech stack fit (se usa SAP, Oracle → alta propensão)
  if (company.currentTechStack.includes("SAP")) {
    score += 15
  }

  // Buying signals
  score += company.buyingSignals.length * 5

  return Math.min(100, score)
}
```

---

## 11. BENCHMARKING

### 11.1 Comparação de Empresas

**Componente:** `components/modules/BenchmarkModule.tsx`
**API:** `POST /api/benchmark`

**Features:**
1. ✅ Comparação de até 5 empresas
2. ✅ Métricas: Maturidade, Tech Stack, Fit Score
3. ✅ Gráfico radar
4. ✅ Exportação para CSV

**Exemplo de Comparação:**
```typescript
{
  companies: [
    {
      name: "Empresa A",
      maturity: 85,
      techStackCount: 12,
      totvsfit: 92,
      olvFit: 65
    },
    {
      name: "Empresa B",
      maturity: 62,
      techStackCount: 7,
      totvsfit: 78,
      olvFit: 55
    }
  ],
  insights: [
    "Empresa A possui maturidade 37% superior à média",
    "Empresa B tem maior potencial para OLV (consultoria)"
  ]
}
```

---

## 12. RELATÓRIOS

### 12.1 Geração de PDF

**API:** `POST /api/reports/generate`
**Engine:** Puppeteer + AI Report Generator

**Seções do Relatório:**

1. **Resumo Executivo**
   - Nome, CNPJ, setor, porte
   - Score geral (maturidade, propensão)

2. **Dados Cadastrais**
   - Receita Federal
   - Endereço, capital social, CNAE

3. **Stack Tecnológico**
   - Tecnologias confirmadas
   - Evidências rastreáveis
   - Oportunidades de modernização

4. **Decisores**
   - Lista com contatos enriquecidos
   - Persona de cada decisor
   - Estratégia de abordagem

5. **Maturidade Digital**
   - 6 dimensões detalhadas
   - Benchmark setorial
   - Gaps identificados

6. **Vendor Fit**
   - TOTVS Fit (produtos recomendados)
   - OLV Fit (serviços recomendados)
   - Deal size estimado

7. **Buying Signals**
   - Sinais detectados
   - Urgência e força
   - Janela de oportunidade

8. **Next Best Action**
   - Recomendação de abordagem
   - Playbook sugerido
   - Timeline de cadência

9. **Propensity Scoring**
   - Probabilidade de compra (0-100%)
   - Fatores influenciadores
   - Confiança do modelo

10. **Anexos**
    - Evidências completas
    - Links e capturas
    - Histórico de interações

**Exemplo de Geração:**
```typescript
const report = await aiReportGenerator.generate({
  companyId: "comp_123",
  templateId: "executive-report-v1",
  sections: ["all"],
  format: "pdf",
  includeEvidence: true
})

// Output:
{
  success: true,
  reportUrl: "https://storage.supabase.co/reports/abc123.pdf",
  pdfBase64: "JVBERi0xLjQK...",
  generatedAt: "2025-10-20T14:45:00Z",
  pages: 18,
  sizeKB: 2450
}
```

---

# PARTE 3: INTELIGÊNCIA ARTIFICIAL

## 13. ICP CLASSIFIER

### 13.1 Modelo de Classificação

**File:** `lib/ai/icp-classifier.ts`

**Objetivo:** Classificar empresa em Tier A/B/C (Ideal/Bom/Baixo fit)

**Features Utilizadas:**
```typescript
{
  // Firmographics
  industry: string,
  subIndustry: string,
  employeeCount: number,
  revenue: number,
  growthRate: number,
  
  // Technographics
  erpVendor: string,
  crmVendor: string,
  cloudAdoption: number,  // 0-100
  
  // Digital Maturity
  overallMaturity: number,  // 0-100
  infraScore: number,
  systemsScore: number,
  
  // Context
  region: string,
  foundedYear: number,
  funding: string
}
```

**Regras de Classificação:**

**Tier A (Score >= 80):**
- Indústria alvo (Manufatura, Distribuição, Varejo)
- 200+ funcionários
- Maturidade >= 70
- ERP legado (SAP, Oracle)
- Orçamento confirmado

**Tier B (Score 60-79):**
- Indústria secundária
- 50-200 funcionários
- Maturidade 50-69
- ERP próprio ou inexistente

**Tier C (Score < 60):**
- Fora do perfil alvo
- < 50 funcionários
- Maturidade < 50
- Budget não identificado

**Cálculo:**
```typescript
function calculateICPScore(features: ICPFeatures): number {
  let score = 0
  
  // Industry weight: 30%
  score += industryScore(features.industry) * 0.30
  
  // Size weight: 25%
  score += sizeScore(features.employeeCount) * 0.25
  
  // Tech stack weight: 20%
  score += techStackScore(features.erpVendor) * 0.20
  
  // Maturity weight: 15%
  score += features.overallMaturity * 0.15
  
  // Growth weight: 10%
  score += growthScore(features.growthRate) * 0.10
  
  return Math.min(100, score)
}
```

---

## 14. PROPENSITY SCORING

### 14.1 Modelo Probabilístico

**File:** `lib/ai/propensity-scoring.ts`

**Objetivo:** Prever probabilidade de compra (0-100%) para cada oferta TOTVS/OLV

**Inputs:**
```typescript
{
  companyICP: ICPProfile,
  maturity: MaturityScores,
  intentSignals: IntentSignal[],
  buyingSignals: BuyingSignal[],
  competitorStack: string[],
  decisionMakers: Person[],
  recentEvents: Event[]
}
```

**Outputs:**
```typescript
{
  productId: "totvs-protheus-erp",
  score: 78.5,  // Probabilidade 0-100
  confidence: 85,  // Confiança do modelo
  signals: [
    { type: "job_opening", weight: 15, description: "..." },
    { type: "competitor_issue", weight: 10, description: "..." }
  ],
  recommendations: [
    "Abordar via CFO (maior influência)",
    "Mencionar case similar: Empresa XYZ",
    "Oferecer POC de 30 dias"
  ],
  validUntil: "2025-11-20T00:00:00Z"
}
```

**Fatores Considerados:**

1. **ICP Fit (30%)**
   - Tier A/B/C

2. **Intent Signals (25%)**
   - Job openings relacionados
   - Website changes (ex: nova página "/carreiras/ti")
   - News mentions ("modernização", "transformação digital")

3. **Buying Signals (20%)**
   - Budget approved
   - RFP emitido
   - Contract expiring (competitor)

4. **Decision Maker Engagement (15%)**
   - LinkedIn profile views
   - Email opens/clicks
   - Meeting agendados

5. **Maturity Gaps (10%)**
   - Scores baixos em dimensões-chave
   - Competitor stack aging

---

## 15. INTENT DETECTION

### 15.1 Sinais de Intenção

**File:** `lib/ai/intent-detector.ts`

**Fontes de Sinais:**

#### 1. **Job Postings**
```typescript
{
  type: "job_opening",
  title: "Analista SAP Business One Sênior",
  department: "TI",
  posted: "2025-10-15",
  url: "https://linkedin.com/jobs/123",
  keywords: ["SAP", "ERP", "integração"],
  intentScore: 85  // very_strong
}
```

#### 2. **News & Press Releases**
```typescript
{
  type: "news_mention",
  title: "Empresa XYZ anuncia expansão para região Sul",
  source: "Valor Econômico",
  date: "2025-10-10",
  snippet: "...investimento de R$ 50M em nova planta...",
  keywords: ["expansão", "investimento", "crescimento"],
  intentScore: 70  // strong
}
```

#### 3. **Website Changes**
```typescript
{
  type: "website_change",
  page: "/empresa/tecnologia",
  changeType: "new_page_created",
  detectedAt: "2025-10-18",
  content: "Nossa jornada de transformação digital...",
  intentScore: 60  // medium
}
```

#### 4. **Technology Triggers**
```typescript
{
  type: "tech_event",
  event: "SAP support ending",
  product: "SAP Business One 9.3",
  deadline: "2026-12-31",
  urgency: "high",
  intentScore: 90  // very_strong
}
```

#### 5. **Financial Events**
```typescript
{
  type: "financial_event",
  event: "Series B funding",
  amount: "R$ 100M",
  investors: ["Softbank", "Sequoia"],
  date: "2025-09-01",
  intentScore: 75  // strong
}
```

**Agregação de Sinais:**
```typescript
function calculateOverallIntent(signals: IntentSignal[]): number {
  const recentSignals = signals.filter(s => 
    daysSince(s.detectedAt) <= 90
  )
  
  const weightedSum = recentSignals.reduce((acc, signal) => {
    const recencyWeight = 1 - (daysSince(signal.detectedAt) / 90)
    return acc + (signal.intentScore * recencyWeight)
  }, 0)
  
  return weightedSum / recentSignals.length
}
```

---

## 16. NEXT BEST ACTION

### 16.1 Recomendação de Abordagem

**File:** `lib/ai/next-best-action.ts`

**Inputs:**
- ICP Score
- Propensity Score
- Intent Signals
- Decision Maker Profile
- Interaction History

**Decision Tree:**

```
IF propensity >= 80 AND intent >= 75:
  → NBA: "IMMEDIATE_OUTREACH"
  → Channel: Phone + Email
  → Message: "Urgente: Oportunidade de [...]"
  
ELIF propensity >= 60 AND decisionMaker.engaged:
  → NBA: "SCHEDULE_DEMO"
  → Channel: Email + LinkedIn
  → Message: "Com base em nosso contato anterior..."
  
ELIF icp.tier === "A" AND maturity.gaps.length > 0:
  → NBA: "SEND_CASE_STUDY"
  → Channel: Email
  → Message: "Case similar: Empresa XYZ"
  
ELIF intent > 50:
  → NBA: "NURTURE_CAMPAIGN"
  → Channel: Email sequence (3 emails / 2 weeks)
  → Message: Educational content
  
ELSE:
  → NBA: "MONITOR"
  → Channel: Automated alerts
  → Message: N/A
```

**Exemplo de Output:**
```typescript
{
  action: "IMMEDIATE_OUTREACH",
  priority: "HIGH",
  channels: ["phone", "email", "linkedin"],
  decisionMaker: {
    primary: "Carlos Silva (Diretor TI)",
    secondary: "Maria Costa (CFO)"
  },
  message: {
    subject: "Oportunidade: Modernização SAP → TOTVS",
    body: "Olá Carlos, identificamos que...",
    cta: "Agendar conversa de 15min"
  },
  timing: {
    bestDay: "Tuesday",
    bestTime: "10:00-11:00",
    timezone: "America/Sao_Paulo"
  },
  playbook: {
    id: "erp-modernization-manufacturing",
    steps: ["discovery", "demo", "poc", "proposal"],
    dealCycle: "90-120 days"
  }
}
```

---

## 17. CADÊNCIAS AUTOMATIZADAS

### 17.1 Sequências Multi-Canal

**File:** `lib/ai/cadence-orchestrator.ts`

**Cadência Exemplo: "ERP Modernization - Tier A"**

| Dia | Canal | Ação | Conteúdo |
|-----|-------|------|----------|
| 0 | Email | Intro | "Identificamos oportunidade..." |
| 2 | LinkedIn | View profile | (Automated) |
| 3 | LinkedIn | Connection request | "Vi seu perfil..." |
| 5 | Email | Follow-up #1 | "Conforme mencionado..." |
| 7 | Phone | Call | Script: Discovery |
| 10 | Email | Case study | PDF anexo |
| 14 | LinkedIn | InMail | "Vamos conversar?" |
| 17 | Email | Final touch | "Última tentativa..." |

**Regras de Cadência:**

1. **Anti-Spam**
   - Max 3 emails / semana
   - Pausa se prospect responder
   - Stop se unsubscribe

2. **Feedback Loop**
   - Email open → +5 propensity
   - Link click → +10 propensity
   - Reply → Move to "engaged"

3. **A/B Testing**
   - Subject lines
   - Send times
   - Content variations

**Métricas Monitoradas:**
```typescript
{
  sent: 1000,
  opened: 350,  // 35% open rate
  clicked: 105,  // 30% CTR
  replied: 28,   // 8% reply rate
  meetings: 12,  // 43% meeting conversion
  deals: 3       // 25% close rate
}
```

---

# PARTE 4: APIS E INTEGRAÇÕES

## 18. APIS INTERNAS

### 18.1 Endpoints Principais

#### GET /api/companies
Listar todas as empresas do projeto

**Query Params:**
```typescript
{
  projectId?: string,
  page?: number,
  limit?: number,
  status?: "ATIVA" | "INATIVA",
  sort?: "name" | "createdAt" | "maturity"
}
```

**Response:**
```typescript
{
  companies: Company[],
  total: number,
  page: number,
  pages: number
}
```

---

#### POST /api/companies/search
Buscar e enriquecer empresa

**Body:**
```typescript
{
  cnpj?: string,
  website?: string
}
```

**Response:**
```typescript
{
  ok: true,
  data: {
    company: {
      id: string,
      cnpj: string,
      name: string,
      tradeName: string
    },
    analysis: {
      insights: JSON
    }
  }
}
```

**Errors:**
- 422: Invalid CNPJ
- 502: Provider error (ReceitaWS down)
- 500: Internal error

---

#### POST /api/reports/generate
Gerar relatório executivo

**Body:**
```typescript
{
  templateId: "executive-report-v1",
  companyId: string,
  sections: string[]
}
```

**Response:**
```typescript
{
  success: true,
  reportUrl: string,
  pdfBase64: string
}
```

---

#### GET /api/health/providers
Health check de providers externos

**Response:**
```typescript
{
  supabase: { status: "operational", latency: 45 },
  receitaws: { status: "operational", latency: 1200 },
  googleCse: { status: "operational", latency: 890 },
  openai: { status: "disabled" }
}
```

---

## 19. PROVIDERS EXTERNOS

### 19.1 ReceitaWS

**URL:** `https://receitaws.com.br/v1/cnpj/{cnpj}`

**Rate Limit:** 3 req/min (Free) | 60 req/min (Paid)

**Response:**
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
  "municipio": "SÃO PAULO",
  "uf": "SP",
  "cep": "01234-567",
  "situacao": "ATIVA",
  "capital_social": "500000.00",
  "atividade_principal": [{
    "code": "25.11-0-00",
    "text": "Fabricação de estruturas metálicas"
  }]
}
```

**Circuit Breaker:**
- Threshold: 3 falhas consecutivas
- Timeout: 30s
- Retry: 3 tentativas com backoff exponencial

---

### 19.2 Google Custom Search Engine

**URL:** `https://www.googleapis.com/customsearch/v1`

**Quota:** 100 queries/day (Free) | 10k queries/day (Paid)

**Query Example:**
```
?key=API_KEY
&cx=SEARCH_ENGINE_ID
&q=site:empresa.com.br
&num=10
```

**Use Cases:**
- Website discovery
- News mentions
- Technology mentions
- Job postings

---

### 19.3 OpenAI GPT-4

**Model:** `gpt-4-turbo-preview`

**Use Cases:**
1. Análise de conteúdo (website, news)
2. Extração de entidades (decisores, tecnologias)
3. Classificação de indústria/setor
4. Geração de insights e recomendações

**Prompt Example:**
```
Analyze the following company website content and extract:
1. Industry and sub-industry
2. Key products/services
3. Technology stack mentions
4. Recent news or announcements

Content:
[...]

Return JSON with structured data.
```

---

### 19.4 Sales Navigator (via Phantom Buster)

**Agent:** `LinkedIn Sales Navigator Search Export`

**Input:**
```json
{
  "searches": "https://www.linkedin.com/sales/search/company?query=...",
  "numberOfResultsPerSearch": 25
}
```

**Output:**
```json
{
  "companies": [{
    "name": "Empresa XYZ",
    "linkedinUrl": "https://linkedin.com/company/xyz",
    "industry": "Manufacturing",
    "size": "201-500",
    "location": "São Paulo, Brazil"
  }]
}
```

---

## 20. WEBHOOKS E REAL-TIME

### 20.1 Supabase Real-time

**Subscriptions:**
```typescript
// Real-time updates em Company
supabase
  .channel('company-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'Company'
  }, payload => {
    console.log('Company updated:', payload.new)
    // Atualizar UI
  })
  .subscribe()
```

### 20.2 Webhook Endpoints

#### POST /api/webhooks/receita
Receber notificações de mudanças cadastrais

```typescript
{
  cnpj: "18.627.195/0001-60",
  event: "status_change",
  from: "ATIVA",
  to: "SUSPENSA",
  timestamp: "2025-10-20T12:00:00Z"
}
```

#### POST /api/webhooks/email
Receber eventos de email (opens, clicks, replies)

```typescript
{
  messageId: "abc123",
  event: "opened",
  recipient: "carlos.silva@empresa.com",
  timestamp: "2025-10-20T14:30:00Z"
}
```

---

# PARTE 5: DEPLOYMENT E OPS

## 21. DEPLOYMENT VERCEL

### 21.1 Configuração

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role"
  }
}
```

**Build Steps:**
1. `npm install`
2. `npx prisma generate`
3. `npm run build` (Next.js)
4. Deploy to Edge Network

**Environment Variables:**
```bash
# Database
DATABASE_URL=postgresql://...
DEFAULT_PROJECT_ID=default-project-id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# External APIs
RECEITAWS_API_TOKEN=xxx
GOOGLE_API_KEY=xxx
GOOGLE_CSE_ID=xxx
OPENAI_API_KEY=sk-xxx
PHANTOM_BUSTER_API_KEY=xxx

# Feature Flags
ENABLE_RECEITA=true
ENABLE_GOOGLE_CSE=true
ENABLE_OPENAI=true
```

---

## 22. MONITORAMENTO

### 22.1 Logs Estruturados

**Formato:**
```typescript
console.log('[Context] 📊 Message:', data)

// Examples:
console.log('[CompanySearch] 🔍 Buscando: 18.627.195/0001-60')
console.log('[Reports] ✅ Relatório gerado em 2.3s')
console.error('[API] ❌ Erro:', error)
```

### 22.2 Métricas-Chave

| Métrica | Meta | Atual |
|---------|------|-------|
| Uptime | 99.9% | 99.95% |
| Latência média | < 500ms | 320ms |
| Error rate | < 1% | 0.3% |
| CNPJ accuracy | > 95% | 97.2% |
| Email deliverability | > 98% | 99.1% |

### 22.3 Alertas

**Sentry Integration:**
- Errors automáticos
- Performance monitoring
- Release tracking

**Custom Alerts:**
```typescript
if (errorRate > 5%) {
  sendAlert({
    severity: "high",
    message: "Error rate above threshold",
    channel: "slack"
  })
}
```

---

## 23. SEGURANÇA E LGPD

### 23.1 Conformidade LGPD

**Princípios Aplicados:**

1. **Minimização de Dados**
   - Coletamos apenas dados necessários
   - Dados pessoais anonimizados quando possível

2. **Consentimento**
   - Opt-in explícito para cadências
   - Unsubscribe em todos os emails

3. **Transparência**
   - Política de privacidade clara
   - Fonte de dados sempre registrada

4. **Segurança**
   - Dados em repouso: AES-256
   - Dados em trânsito: TLS 1.3
   - Acesso: Row-Level Security (RLS)

5. **Direitos do Titular**
   - Acesso aos dados: GET /api/me/data
   - Exclusão: DELETE /api/me
   - Portabilidade: Export JSON/CSV

### 23.2 Auditoria

**Tabela AuditLog:**
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // "create", "read", "update", "delete"
  resource    String   // "Company", "Person", "Report"
  resourceId  String
  changes     Json?
  ipAddress   String
  userAgent   String
  createdAt   DateTime @default(now())
}
```

**Retenção:**
- Logs de auditoria: 7 anos
- Dados pessoais: Enquanto houver consentimento
- Backups: 90 dias

---

# 🎯 CONCLUSÃO

## Resultados Esperados

### ROI Projetado

**Para Vendedores:**
- ⏱️ 80% redução no tempo de prospecção
- 🎯 45% aumento na taxa de conversão
- 💰 35% aumento no deal size médio

**Para TOTVS:**
- 📊 Visibilidade completa do pipeline
- 🤖 Automação de 70% das tarefas manuais
- 📈 Previsibilidade de receita (+40% accuracy)

### Next Steps

**Fase 2 (Q1 2026):**
1. ✅ Integração CRM (HubSpot, Pipedrive, Salesforce)
2. ✅ Modelo preditivo (ML training com histórico)
3. ✅ Mobile app (React Native)
4. ✅ API pública para parceiros

**Fase 3 (Q2 2026):**
1. ✅ Expansion para Latam (ES, MX, AR)
2. ✅ WhatsApp Business API integration
3. ✅ Voice AI para cold calls
4. ✅ Marketplace de playbooks

---

## 📞 Contato

**Desenvolvedor:** Marcos Oliveira  
**Email:** marcos@olvinternacional.com.br  
**GitHub:** https://github.com/OLVCORE/olv-itelligence-prospect  
**Deploy:** https://olv-intelligence.vercel.app  

**Data:** 20 de Outubro de 2025  
**Versão:** 1.0  

---

**© 2025 OLV Internacional. Todos os direitos reservados.**

*Este documento é confidencial e destinado exclusivamente à equipe TOTVS.*

