# OLV Intelligent Prospecting System

Sistema de inteligência executiva e prospecção B2B com IA, com telas interativas, canvas estratégico, dashboards visuais e geração automática de relatórios executivos.

## Arquitetura

### Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Canvas Colaborativo**: React Flow + Yjs (CRDT) + y-websocket para edição em tempo real
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Reports**: Puppeteer (HTML → PDF)
- **Tabelas**: TanStack Table
- **Charts**: Recharts

### Módulos (Release 1)

1. **Diagnóstico & Dados Cadastrais** - CNPJ, razão social, porte, situação fiscal
2. **Stack Tecnológico Confirmado** (Seção 3 Obrigatória) - Evidências, confiança, validação
3. **Decisores & Influência** - Contatos, fontes, scoring (1-5)
4. **Benchmark & KPIs** - Maturidade digital, comparativos setoriais
5. **Canvas Estratégico** - Colaborativo com modos Canva/Power BI
6. **Relatórios Executivos** - HTML/PDF com evidências e recomendações
7. **Alertas & Revalidações** - Monitoramento automático
8. **RBAC & Auditoria** - Controle de acesso e logs

## Pipeline de Inteligência (7 Camadas)

1. **Entrada** → Razão social, domínio e/ou CNPJ
2. **Coleta & Enriquecimento** → APIs e fontes públicas
3. **Diagnóstico 360°** → Stack Confirmado (obrigatório), cadastro, fiscal
4. **Benchmark & Maturidade** → Score 0-100, gaps setoriais
5. **Decisores & Poder** → Identificação, scoring, contatos verificados
6. **Fit & Estratégia** → Propensão, ticket, ROI, arquitetura
7. **Relatório & Playbook** → HTML/PDF + tabela consolidada

## Fontes de Dados (Externas - Fase 2)

| Finalidade | Ferramenta Sugerida | Uso |
|------------|-------------------|-----|
| Cadastral/Fiscal | ReceitaWS, Serasa API | CNPJ, razão social, CNAE |
| Enriquecimento | Clearbit | Tamanho, setor, métricas |
| Stack Web | BuiltWith, SimilarTech | Detecção de ERP/CRM/BI |
| Vagas | Google Jobs, RSS | Menções a tecnologias |
| DNS/Email | DNS Lookup | Provedores cloud/email |
| Decisores | Apollo, ZoomInfo, Lusha, Hunter | Nome, cargo, email verificado |

**Nota Legal**: Use APIs oficiais e respeite ToS/LGPD. Registre fonte, evidência, data e confiança.

## Modelo de Dados

### Entidades Principais

- **User** - Usuários do sistema (RBAC)
- **Organization** - Organizações/times
- **Project** - Projetos de prospecção
- **Company** - Empresas prospectadas
- **TechStack** - Tecnologias identificadas (Seção 3)
- **Contact** - Decisores e influenciadores
- **Benchmark** - KPIs e métricas setoriais
- **Canvas** - Canvas estratégicos (estrutura JSON)
- **Report** - Relatórios gerados (HTML/PDF)
- **Alert** - Alertas e revalidações
- **AuditLog** - Logs de auditoria

## Sistema de Scoring

### Confiança do Stack (0-100%)

- Base: 50
- +25 se detecção recente (< 6 meses)
- +25 se múltiplas fontes independentes (≥2)
- −20 se evidência antiga (> 12 meses)

### Maturidade Digital (0-100)

Média ponderada de 6 pilares:
- ERP moderno (25%)
- Cloud adoption (20%)
- CRM (15%)
- BI/Analytics (15%)
- Fiscal/Compliance (10%)
- Middleware/Integração (15%)

### Propensão de Conversão (0-100%)

- Base: 50
- Fator maturidade: (maturidade - 50) × 0.3
- Fator tamanho: +5 a +15
- Fator decisores: decisores C-Level × 5 (max +20)
- Fator stack: stacks confirmados × 2 (max +15)

### Prioridade de Ataque

P = 0.5×Propensão + 0.3×Ticket + 0.2×Urgência(gaps)

## Relatório Executivo (Estrutura Padrão)

### Seções Obrigatórias

1. **Capa** - Logo, empresa, data, build ID
2. **Sumário Executivo** - 5-7 KPIs principais
3. **Dados Cadastrais** - Tabela com CNPJ, razão social, porte
4. **Situação Financeira** - Cards com porte, situação, score
5. **⚠️ SEÇÃO 3 - STACK CONFIRMADO (OBRIGATÓRIA)**
   - Tabela: Categoria | Produto | Fornecedor | Status | Confiança | Validação
   - Evidências detalhadas (URLs, trechos, prints)
   - Fontes e data de coleta
6. **Maturidade Digital** - Radar chart + gaps
7. **Decisores & Poder** - Tabela com scoring 1-5
8. **Benchmark** - Gráficos vs. setor
9. **Fit & Recomendações** - Produtos TOTVS/OLV + justificativas
10. **Playbook** - Sequência de abordagem
11. **Anexos** - Evidências completas

## Instalação e Setup

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd olv-intelligent-prospecting

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Setup do banco de dados
npx prisma generate
npx prisma db push

# Iniciar servidor de desenvolvimento
npm run dev
```

### Servidor Canvas (y-websocket)

```bash
# Terminal separado
npx y-websocket-server --port 1234
```

### Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/olv_prospecting"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Canvas WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:1234"

# External APIs (Fase 2)
APOLLO_API_KEY=""
ZOOMINFO_API_KEY=""
LUSHA_API_KEY=""
```

## Deploy

### Vercel (Recomendado)

```bash
# Deploy automático via Git
vercel --prod

# Configurar:
# - Variáveis de ambiente
# - PostgreSQL (Neon/Supabase)
# - y-websocket em Fly.io/Render
```

### Infraestrutura

- **Frontend/API**: Vercel Pro
- **Database**: Neon PostgreSQL / RDS
- **Canvas WS**: Fly.io ou Render
- **Storage**: AWS S3 (PDFs/exports)
- **Observability**: Datadog + Sentry

## Segurança & LGPD

- Base legal: interesse legítimo B2B
- Minimização de dados pessoais
- Criptografia at-rest e in-transit
- DPA com provedores externos
- Logs de auditoria completos
- Opt-out disponível

## Roadmap

### Fase 1 (MVP) ✓
- [x] Estrutura básica e autenticação
- [x] Módulos principais (Dashboard, Stack, Decisores)
- [x] Canvas colaborativo
- [x] Relatórios executivos
- [x] Sistema de alertas
- [x] Scoring básico

### Fase 2
- [ ] Integração com APIs externas (Apollo, BuiltWith, etc.)
- [ ] Enriquecimento automático
- [ ] ML para propensão de conversão
- [ ] Integrações CRM (Salesforce, HubSpot, Engage)
- [ ] SSO/SAML
- [ ] MFA

### Fase 3
- [ ] iPaaS (n8n integration)
- [ ] Automação de campanhas
- [ ] Meeting recorder + transcription
- [ ] Advanced analytics
- [ ] Mobile app

## Licença

Propriedade de TOTVS/OLV. Uso interno.

## Suporte

Para dúvidas e suporte, contate a equipe OLV.


