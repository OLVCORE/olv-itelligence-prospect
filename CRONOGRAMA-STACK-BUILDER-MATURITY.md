# 📅 CRONOGRAMA COMPLETO - Stack Builder & Maturity System

**Projeto:** OLV Intelligent Prospecting System  
**Módulo:** Stack Builder + Maturity Integration + Orchestrator  
**Data Início:** 20 de Outubro de 2025  
**Responsável:** Marcos Oliveira (Engenheiro Sênior)  

---

## 🎯 VISÃO GERAL

Sistema completo de **detecção automática de stack tecnológico** e **análise de maturidade** que integra dados reais de múltiplas fontes (HTTP Headers, Serper, Apollo, Hunter, PhantomBuster) para gerar:

- **Detected Stack** - ERP, CRM, Cloud, BI, DB, Integrações, Segurança
- **Maturity Scores** - 6 dimensões (Infra, Systems, Data, Security, Automation, Culture)
- **Vendor Fit** - Recomendações TOTVS/OLV contextualizadas

---

## 📊 PROGRESSO ATUAL

### ✅ FASE 1: FUNDAÇÃO (CONCLUÍDA - 20/10/2025)

**Duração:** 4 horas  
**Status:** ✅ 100% Completo

#### Entregas Completadas:

1. **Script Instalador Aditivo** ✅
   - `scripts/olv-ensure.mjs` - Criação/atualização idempotente
   - Hotfix de build routes automático
   - Zero regressão garantido

2. **Wrappers de Integração** ✅
   - `lib/integrations/serper.ts` - Google Serper API
   - `lib/integrations/apollo.ts` - Apollo.io (Company + People)
   - `lib/integrations/hunter.ts` - Hunter.io (Find + Verify)
   - `lib/integrations/phantom.ts` - PhantomBuster

3. **Stack Resolver Engine** ✅
   - `lib/stack/resolver.ts` - Motor de detecção com regex patterns
   - Suporte a 7 categorias: ERP, CRM, Cloud, BI, DB, Integrations, Security
   - 40+ produtos mapeados (TOTVS, SAP, Oracle, Microsoft, Salesforce, AWS, etc)

4. **Maturity Calculator** ✅
   - `lib/maturity/tech-maturity.ts` - Cálculo de scores ponderados
   - `lib/maturity/vendor-fit.ts` - Recomendações TOTVS/OLV

5. **API Routes** ✅
   - `POST /api/health` - Health check
   - `POST /api/integrations/http/headers` - Captura headers HTTP
   - `POST /api/stack/build` - Monta detectedStack de evidências
   - `POST /api/maturity/calculate` - Calcula maturidade + fit
   - `POST /api/stack/ingest` - **ORCHESTRATOR ONE-SHOT** 🎉

6. **Supabase Admin Client** ✅
   - `lib/supabaseAdmin.ts` - Cliente server-side com service role

---

## 🚀 FASE 2: REFINAMENTO & TESTES (EM ANDAMENTO)

**Duração Estimada:** 3 dias  
**Status:** 🟡 40% Completo

### Sprint 2.1: Validação & Testes (1 dia)

**Objetivos:**
- [ ] Testes de aceitação em produção
- [ ] Validação de dados reais (empresas piloto)
- [ ] Ajustes de confidence scores
- [ ] Error handling robusto

**Entregas:**
- [ ] Guia de testes de aceitação documentado
- [ ] 5 empresas piloto analisadas
- [ ] Relatório de accuracy (target: ≥85%)
- [ ] Logs estruturados com Winston/Pino

**Comandos de Teste:**
```bash
# 1) Orchestrator completo
curl -X POST https://app.vercel.app/api/stack/ingest \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId":"proj_xxx",
    "companyId":"comp_xxx",
    "vendor":"TOTVS",
    "domain":"empresa.com.br",
    "companyName":"Empresa S.A.",
    "linkedinUrl":"https://linkedin.com/company/empresa",
    "verifyEmails": true
  }'

# 2) Só maturidade (usa evidências já salvas)
curl -X POST https://app.vercel.app/api/maturity/calculate \
  -H 'Content-Type: application/json' \
  -d '{"projectId":"proj_xxx","companyId":"comp_xxx","vendor":"TOTVS"}'

# 3) Debug stack builder
curl -X POST https://app.vercel.app/api/stack/build \
  -H 'Content-Type: application/json' \
  -d '{"companyId":"comp_xxx"}'
```

---

### Sprint 2.2: UI Integration (1 dia)

**Objetivos:**
- [ ] Card de Maturidade com visualização dos 6 scores
- [ ] Breakdown visual (radar chart)
- [ ] Botão "Analisar Maturidade" integrado
- [ ] Evidências clicáveis (fonte + URL + data)

**Entregas:**
- [ ] Componente `TechMaturityCard.tsx` atualizado
- [ ] Modal de detalhes com evidências
- [ ] Export para CSV/PDF
- [ ] Histórico de análises (timeline)

**Componentes:**
```tsx
<TechMaturityCard 
  companyId="comp_xxx" 
  vendor="TOTVS"
  onAnalyze={() => callOrchestrator()}
/>
```

---

### Sprint 2.3: Cache & Performance (1 dia)

**Objetivos:**
- [ ] Cache de TechSignals (24h TTL)
- [ ] Cache de Firmographics (7 dias TTL)
- [ ] Debounce de chamadas repetidas (300ms)
- [ ] Rate limiting (50 req/min por projeto)

**Entregas:**
- [ ] Tabela `SearchCache` otimizada
- [ ] Redis/Upstash opcional
- [ ] Métricas de hit rate
- [ ] Retry com exponential backoff

---

## 📈 FASE 3: AUTOMAÇÃO & ESCALABILIDADE (PRÓXIMA SEMANA)

**Duração Estimada:** 4 dias  
**Status:** 🟢 30% Completo

### Sprint 3.1: Background Jobs (2 dias) - ✅ INICIADO

**Objetivos:**
- [x] Cron job de re-ingest configurável (6h/daily/weekly)
- [x] Sistema de monitoramento por empresa
- [x] Job status tracking com IngestRun
- [x] Concorrência e rate-limiting configuráveis
- [ ] Dashboard de jobs (admin)
- [ ] Alertas de falhas (webhook)

**Entregas Completadas:**
- [x] `POST /api/monitor/register` - Cadastra empresa para monitoramento
- [x] `GET /api/cron/reingest` - Executado por Vercel Cron (6/6h)
- [x] `POST /api/cron/reingest` - Disparo manual com parâmetros
- [x] `lib/jobs/reingest.ts` - Engine de reingest em lotes
- [x] Modelos Prisma: CompanyMonitor, IngestRun
- [x] vercel.json com cron configurada

**Entregas Pendentes:**
- [ ] Dashboard de jobs (admin)
- [ ] Alertas de falhas (webhook)

**Arquitetura Implementada:**
```
Vercel Cron (6/6h) → /api/cron/reingest → lib/jobs/reingest.ts
                          ↓                         ↓
                  CompanyMonitor (queue)    Concurrency Control
                          ↓                         ↓
                    /api/stack/ingest      IngestRun (logs)
                          ↓                         ↓
                   TechSignals, Firmographics   CompanyTechMaturity
```

**Parâmetros Configuráveis:**
- `batchLimit`: quantas empresas processar por execução (default: 10)
- `concurrency`: quantas em paralelo (default: 2)
- `delayMs`: delay entre disparos (default: 800ms)
- `verifyEmails`: ativar Hunter verification (default: false)

---

### Sprint 3.2: Bulk Processing (1 dia)

**Objetivos:**
- [ ] Upload CSV com lista de empresas
- [ ] Processamento assíncrono em lote
- [ ] Progress tracking
- [ ] Export resultado em CSV

**Entregas:**
- [ ] `POST /api/stack/ingest/bulk` - Upload + enqueue
- [ ] `GET /api/stack/ingest/bulk/:batchId` - Progress
- [ ] UI de upload com drag&drop
- [ ] Template CSV para download

---

### Sprint 3.3: Webhooks & Integrações (1 dia)

**Objetivos:**
- [ ] Webhook listener para PhantomBuster (async)
- [ ] Webhook listener para Apollo (enrichment automático)
- [ ] Slack notifications (opcionais)
- [ ] Zapier integration

**Entregas:**
- [ ] `POST /api/webhooks/phantom` - Recebe jobs do Phantom
- [ ] `POST /api/webhooks/apollo` - Recebe enrichment
- [ ] Autenticação via HMAC signature
- [ ] Logs de eventos

---

## 🔒 FASE 4: SEGURANÇA & COMPLIANCE (PARALELO)

**Duração Contínua**  
**Status:** 🟢 Implementação Contínua

### Checklist de Segurança:

- [x] Service Role Key no server-side apenas
- [x] Validação de inputs (Zod schemas)
- [ ] Rate limiting por projeto
- [ ] IP whitelist (opcional)
- [ ] Audit logs de uso de APIs
- [ ] LGPD compliance (consentimento + fonte rastreável)
- [ ] Rotate keys periodicamente
- [ ] Secrets no Vercel env (nunca no código)

### Compliance LGPD:

**Obrigatório:**
- [ ] Fonte + URL + data em toda evidência
- [ ] Consentimento de uso de dados
- [ ] Right to be forgotten (soft delete)
- [ ] Data retention policy (90 dias)
- [ ] Encryption at rest (Supabase)

---

## 📚 FASE 5: DOCUMENTAÇÃO & TREINAMENTO (FIM DO MÊS)

**Duração Estimada:** 2 dias  
**Status:** 🔴 0% Completo

### Entregas:

1. **Documentação Técnica** (1 dia)
   - [ ] Architecture Decision Records (ADRs)
   - [ ] API Reference (OpenAPI/Swagger)
   - [ ] Diagrams (C4 Model)
   - [ ] Troubleshooting guide

2. **Guias de Uso** (1 dia)
   - [ ] Quick Start Guide
   - [ ] Video tutorials (Loom)
   - [ ] FAQ
   - [ ] Best practices

3. **Treinamento da Equipe**
   - [ ] Session hands-on (2h)
   - [ ] Onboarding checklist
   - [ ] Certificação interna

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Técnicos:

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| **Accuracy Stack Detection** | ≥85% | TBD | 🟡 |
| **API Response Time (p95)** | <3s | TBD | 🟡 |
| **Cache Hit Rate** | ≥60% | TBD | 🔴 |
| **Job Success Rate** | ≥95% | TBD | 🔴 |
| **Uptime** | 99.5% | TBD | 🟢 |

### KPIs de Negócio:

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| **Empresas Analisadas** | 500/mês | 0 | 🔴 |
| **Conversion to Leads** | 15% | TBD | 🔴 |
| **Avg. Deal Size** | R$ 150k | TBD | 🔴 |
| **Time to First Analysis** | <5min | TBD | 🟡 |

---

## 🛠️ STACK TECNOLÓGICA

### Backend:
- **Next.js 15** (App Router) - Server Actions + API Routes
- **TypeScript** (strict mode)
- **Supabase** - PostgreSQL + RLS
- **Prisma ORM** - Type-safe queries

### Integrações:
- **Serper API** - Google search
- **Apollo.io** - Company + People enrichment
- **Hunter.io** - Email verification
- **PhantomBuster** - LinkedIn scraping

### Ferramentas:
- **Git** - Version control
- **Vercel** - Deploy + Cron
- **Winston/Pino** - Logging
- **Sentry** - Error tracking (futuro)

---

## 📞 PONTOS DE CONTATO

| Fase | Responsável | Checkpoint | Próximo Review |
|------|-------------|------------|----------------|
| Fase 1 | Marcos | ✅ Completo | - |
| Fase 2 | Marcos | 40% | 22/10/2025 |
| Fase 3 | Marcos | 0% | 25/10/2025 |
| Fase 4 | Marcos | Contínuo | Semanal |
| Fase 5 | Marcos | 0% | 30/10/2025 |

---

## 🎯 PRÓXIMAS AÇÕES IMEDIATAS

### Hoje (20/10/2025):
1. ✅ Executar script `olv-ensure.mjs`
2. ✅ Commit + Push do orchestrator
3. ✅ Criar guia de testes
4. ✅ Implementar sistema de monitoramento (Vercel Cron)
5. ⏳ Testar /api/stack/ingest em staging
6. ⏳ Validar 1 empresa piloto

### Amanhã (21/10/2025):
1. Testar 5 empresas piloto
2. Ajustar confidence scores
3. Adicionar error handling robusto
4. Criar TechMaturityCard UI
5. Deploy para produção

### Esta Semana:
1. Completar Fase 2 (Refinamento & Testes)
2. Iniciar Fase 3 (Automação)
3. Documentar API Reference
4. Criar video tutorial básico

---

## 📝 NOTAS & DECISÕES

### ADR-001: Arquitetura Aditiva
**Decisão:** Todo código novo deve ser aditivo, nunca deletar funcionalidades existentes.  
**Rationale:** Evitar regressões e manter backward compatibility.  
**Status:** ✅ Implementado

### ADR-002: Server-Side Only Integrations
**Decisão:** Todas as integrações externas rodam no server (API Routes).  
**Rationale:** Segurança (keys) + controle de rate limiting.  
**Status:** ✅ Implementado

### ADR-003: JSON Strings em Prisma
**Decisão:** TechSignals.value é string JSON (não Json type).  
**Rationale:** Compatibilidade com SQLite local + Postgres prod.  
**Status:** ✅ Implementado

### ADR-004: Zero Mocks em Produção
**Decisão:** Nunca retornar dados mock. Se não houver dados, retornar null/[].  
**Rationale:** Confiança da equipe + auditoria LGPD.  
**Status:** ✅ Implementado

---

## 🔗 LINKS ÚTEIS

- [Repository](https://github.com/OLVCORE/olv-intelligence-prospect)
- [Vercel Dashboard](https://vercel.com/olv/intelligence)
- [Supabase Dashboard](https://app.supabase.com/project/olv-intelligence)
- [API Docs](./docs/API-REFERENCE.md) *(a criar)*
- [Troubleshooting](./docs/TROUBLESHOOTING.md) *(a criar)*

---

## ✅ COMMIT LOG

### 20/10/2025 - 19:00
- ✅ Criado `scripts/olv-ensure-cron.mjs`
- ✅ Criado `/api/monitor/register` (cadastro de monitoramento)
- ✅ Criado `/api/cron/reingest` (Vercel Cron)
- ✅ Criado `lib/jobs/reingest.ts` (engine de lotes)
- ✅ Modelos Prisma: CompanyMonitor, IngestRun
- ✅ vercel.json: cron 6/6h configurada
- ✅ Commit: "OLV: Scheduled Re-Ingest + Monitoring System"

### 20/10/2025 - 16:30
- ✅ Criado `scripts/olv-ensure.mjs`
- ✅ Criado `/api/stack/ingest` (orchestrator)
- ✅ Atualizado wrappers de integração
- ✅ Adicionado JSON.stringify em TechSignals
- ✅ Commit: "OLV: Stack Builder + Maturity Integration + Orchestrator"

---

**Documento mantido por:** Marcos Oliveira  
**Última atualização:** 20 de Outubro de 2025, 16:45  
**Versão:** 1.0

