# 🚀 Plano de Ativação Completa - OLV Intelligence System

## 🎯 OBJETIVO
Transformar o site estático deployado no Vercel em um sistema 100% funcional com todas as APIs ativas e dados reais.

---

## 📊 SITUAÇÃO ATUAL vs DESEJADA

| Componente | Status Atual | Status Desejado | Bloqueio |
|------------|--------------|-----------------|----------|
| Site Online | ✅ Deploy OK | ✅ Deploy OK | - |
| Banco de Dados | ❌ SQLite (não funciona serverless) | ✅ Supabase PostgreSQL | Migração necessária |
| ReceitaWS API | ❌ Não configurada | ✅ Ativa e funcionando | Vars ambiente |
| OpenAI API | ❌ Não configurada | ✅ Ativa e funcionando | Vars ambiente |
| Hunter.io API | ❌ Não configurada | ✅ Ativa e funcionando | Vars ambiente |
| Google Search API | ❌ Não configurada | ✅ Ativa e funcionando | Vars ambiente |
| Adicionar Empresas | ❌ Não funciona | ✅ Busca e adiciona | DB + APIs |
| Análise Inteligente | ❌ Não funciona | ✅ IA analisando | APIs + DB |
| Seções/Abas | ❌ Vazias | ✅ Com dados reais | DB + APIs |
| Relatórios | ❌ Incompletos | ✅ Completos | Todas APIs |

---

## 🗓️ CRONOGRAMA ESTRUTURADO (Mini-Blocos)

### 🔴 FASE 1: INFRAESTRUTURA (60-90 min) - CRÍTICO

#### Bloco 1.1: Configurar Supabase (30 min)
**Objetivo**: Migrar de SQLite para PostgreSQL funcional no Vercel

**Passos**:
1. Criar conta Supabase (5 min)
   - URL: https://supabase.com/dashboard/sign-up
   - Região: South America (São Paulo)
   - Nome: olv-intelligence

2. Obter credenciais (5 min)
   - Connection String (URI)
   - Anon Key
   - Service Role Key

3. Atualizar `prisma/schema.prisma` (5 min)
   ```prisma
   datasource db {
     provider = "postgresql"  // <- MUDAR de sqlite
     url      = env("DATABASE_URL")
   }
   ```

4. Aplicar schema no Supabase (10 min)
   ```bash
   # Localmente com a URL do Supabase
   DATABASE_URL="postgresql://..." npx prisma db push
   npm run db:seed  # Popular com dados iniciais
   ```

5. Verificar tabelas criadas no Supabase (5 min)

**Resultado**: Banco de dados funcional na nuvem ✅

---

#### Bloco 1.2: Configurar Variáveis de Ambiente no Vercel (30 min)
**Objetivo**: Ativar todas as APIs no ambiente de produção

**Passos**:
1. Acessar Vercel Dashboard (2 min)
   - https://vercel.com/dashboard
   - Selecionar projeto `olv-intelligence-prospect`

2. Ir em Settings → Environment Variables (2 min)

3. Adicionar TODAS as variáveis (20 min):

```env
# Database
DATABASE_URL=postgresql://postgres:[SENHA]@db.xxxxx.supabase.co:5432/postgres

# ReceitaWS
RECEITAWS_API_TOKEN=SEU_TOKEN_RECEITAWS_AQUI

# OpenAI
OPENAI_API_KEY=SEU_TOKEN_OPENAI_AQUI

# Hunter.io
HUNTER_API_KEY=SEU_TOKEN_HUNTER_AQUI

# Google Custom Search
GOOGLE_API_KEY=SEU_TOKEN_GOOGLE_AQUI
GOOGLE_CSE_ID=SEU_CSE_ID_AQUI

# NextAuth (gerar nova secret)
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=[GERAR COM: openssl rand -base64 32]
```

4. Selecionar ambientes (1 min):
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. Salvar e aguardar propagação (5 min)

**Resultado**: Todas as APIs configuradas no Vercel ✅

---

#### Bloco 1.3: Redeploy com Configurações (10 min)
**Objetivo**: Fazer o sistema reconhecer as novas configurações

**Passos**:
1. Ir em Deployments → Latest Deployment
2. Clicar nos 3 pontinhos → "Redeploy"
3. Confirmar redeploy
4. Aguardar build (5-7 min)
5. Verificar logs: "Build completed successfully"

**Resultado**: Sistema rodando com banco e APIs ✅

---

### 🟡 FASE 2: VALIDAÇÃO FUNCIONAL (30-45 min)

#### Bloco 2.1: Testar Login e Autenticação (10 min)

**Passos**:
1. Acessar https://seu-dominio.vercel.app
2. Login com credenciais demo:
   - Email: `admin@olv.com`
   - Senha: `admin123`
3. Verificar redirecionamento para `/dashboard`
4. Verificar nome de usuário no header

**Resultado**: Login funcional ✅

---

#### Bloco 2.2: Testar Busca e Adição de Empresas (15 min)

**Passos**:
1. No dashboard, localizar módulo "Adicionar Empresa"
2. Inserir CNPJ de teste: `34.338.165/0001-90` (XRP)
3. Clicar em "Buscar"
4. Verificar preview com dados ReceitaWS:
   - ✅ Razão social
   - ✅ Capital social
   - ✅ Situação cadastral
   - ✅ Insights da IA
   - ✅ Red flags
   - ✅ Score de confiabilidade
5. Clicar em "Adicionar ao Sistema"
6. Verificar empresa aparecendo na lista
7. Repetir com CNPJ: `67.867.580/0001-90` (OLV)

**Resultado**: Busca e adição funcionando ✅

---

#### Bloco 2.3: Testar Análise Inteligente (20 min)

**Passos**:
1. Clicar em uma empresa adicionada
2. Verificar que a análise automática foi iniciada
3. Aguardar 30-60 segundos
4. Verificar dados nas abas:
   - **Dashboard**: KPIs e gráficos
   - **Tech Stack**: Tecnologias detectadas (Google Search)
   - **Decisores**: E-mails encontrados (Hunter.io)
   - **Financeiro**: Dados ReceitaWS
   - **Maturidade**: Score calculado
   - **Fit TOTVS**: Propensão de conversão
5. Verificar logs no console (F12)

**Resultado**: Análise IA funcionando ✅

---

### 🟢 FASE 3: ATIVAÇÃO DE FUNCIONALIDADES (60-90 min)

#### Bloco 3.1: Ativar Módulo Tech Stack (30 min)

**Objetivo**: Detectar tecnologias reais usando Google Custom Search

**Arquivos a verificar**:
- `lib/services/google-search.ts`
- `lib/intelligence-engine.ts`

**Ações**:
1. Verificar se Google API está sendo chamada
2. Adicionar logs de debug:
   ```typescript
   console.log('[GoogleSearch] Buscando tech stack para:', domain)
   console.log('[GoogleSearch] Resultados:', results)
   ```
3. Testar busca manual:
   ```
   site:xrp.com.br ERP OR Salesforce OR SAP OR Microsoft
   ```
4. Verificar rate limits (100/dia)
5. Implementar cache para economizar requisições

**Resultado**: Tech Stack real detectado ✅

---

#### Bloco 3.2: Ativar Módulo Decisores (30 min)

**Objetivo**: Encontrar e-mails de decisores usando Hunter.io

**Arquivos a verificar**:
- `lib/services/hunter.ts`
- `lib/intelligence-engine.ts`

**Ações**:
1. Verificar se Hunter API está sendo chamada
2. Testar busca por domínio:
   ```typescript
   await hunter.searchEmails('xrp.com.br')
   ```
3. Verificar limite (50 grátis/mês)
4. Extrair nomes e cargos dos e-mails
5. Calcular score de influência (1-5)

**Resultado**: Decisores encontrados ✅

---

#### Bloco 3.3: Ativar Análise com OpenAI (30 min)

**Objetivo**: Gerar insights inteligentes com GPT-4

**Arquivos a verificar**:
- `lib/services/openai.ts`
- `lib/intelligence-engine.ts`

**Ações**:
1. Verificar se OpenAI API está sendo chamada
2. Ajustar prompt para análise:
   ```typescript
   Analise a empresa ${company.name}:
   - Setor: ${company.industry}
   - Porte: ${company.size}
   - Tech Stack: ${techStack}
   - Decisores: ${decisionMakers}
   
   Forneça:
   1. Insights estratégicos
   2. Oportunidades TOTVS
   3. Abordagem recomendada
   4. Ticket estimado
   ```
3. Implementar retry em caso de erro
4. Adicionar cache (7 dias)

**Resultado**: Insights IA gerados ✅

---

### 🔵 FASE 4: COMPLETAR RELATÓRIOS E SEÇÕES (60 min)

#### Bloco 4.1: Completar Seção Tech Stack (20 min)

**Dados a preencher**:
- Categoria (ERP, CRM, Cloud, BI, etc.)
- Produto detectado
- Fornecedor
- Status (Confirmado/Indeterminado)
- Confiança (0-100%)
- Evidências (URLs, screenshots conceituais)
- Data de validação

**Ações**:
1. Consolidar dados do Google Search
2. Categorizar automaticamente:
   - Salesforce → CRM
   - SAP → ERP
   - AWS → Cloud
3. Calcular confiança baseado em múltiplas fontes
4. Gerar evidências com URLs reais

**Resultado**: Seção 3 (Tech Stack) completa ✅

---

#### Bloco 4.2: Completar Seção Decisores (20 min)

**Dados a preencher**:
- Nome completo
- Cargo/Título
- Departamento
- E-mail
- LinkedIn
- Score de influência (1-5)
- Fonte

**Ações**:
1. Processar dados do Hunter.io
2. Inferir departamento do cargo:
   - CTO/CIO → TI
   - CFO → Financeiro
   - CEO → Executivo
3. Atribuir score de influência:
   - C-level → 5
   - Diretor → 4
   - Gerente → 3
4. Buscar perfil LinkedIn (se disponível)

**Resultado**: Decisores identificados ✅

---

#### Bloco 4.3: Completar Seção Maturidade (20 min)

**Dados a calcular**:
- Score geral (0-100)
- 6 pilares:
  1. Infraestrutura Cloud
  2. Automação
  3. Analytics e BI
  4. Integração
  5. Mobilidade
  6. Segurança

**Ações**:
1. Analisar tech stack detectado
2. Atribuir pontos por tecnologia:
   - Cloud (AWS/Azure/GCP) → +20
   - BI (Power BI/Tableau) → +15
   - Automação (n8n/Zapier) → +15
3. Calcular média ponderada
4. Gerar recomendações por gap

**Resultado**: Score de maturidade calculado ✅

---

### 🟣 FASE 5: OTIMIZAÇÃO E POLISH (30-45 min)

#### Bloco 5.1: Implementar Cache Inteligente (15 min)

**Objetivo**: Reduzir custos de API

**Ações**:
1. Cache ReceitaWS: 30 dias
2. Cache Google Search: 7 dias
3. Cache Hunter.io: 14 dias
4. Cache OpenAI: 7 dias

**Implementação**:
```typescript
// Em cada serviço
const cacheKey = `${service}:${identifier}`
const cached = await cache.get(cacheKey)
if (cached) return cached

const result = await fetchFromAPI()
await cache.set(cacheKey, result, TTL)
return result
```

**Resultado**: Economia de 70%+ em chamadas API ✅

---

#### Bloco 5.2: Adicionar Logs e Monitoramento (15 min)

**Ações**:
1. Adicionar logs estruturados:
   ```typescript
   console.log('[Module] Action:', data)
   ```
2. Implementar tracking de erros:
   ```typescript
   try {
     // operação
   } catch (error) {
     console.error('[ERROR]', error)
     // Enviar para Sentry (futuro)
   }
   ```
3. Adicionar métricas de performance:
   ```typescript
   const start = Date.now()
   await operation()
   console.log(`[PERF] ${Date.now() - start}ms`)
   ```

**Resultado**: Sistema observável ✅

---

#### Bloco 5.3: Testes End-to-End (15 min)

**Checklist completo**:
- [ ] Login funciona
- [ ] Buscar empresa por CNPJ funciona
- [ ] Preview mostra dados ReceitaWS
- [ ] Adicionar empresa funciona
- [ ] Análise automática dispara
- [ ] Tech Stack detecta tecnologias
- [ ] Decisores encontra e-mails
- [ ] OpenAI gera insights
- [ ] Maturidade calcula score
- [ ] Fit TOTVS calcula propensão
- [ ] Relatório pode ser exportado
- [ ] Todas as abas têm dados
- [ ] Sistema é responsivo

**Resultado**: Sistema 100% funcional ✅

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta | Como Verificar |
|---------|-------|------|----------------|
| Empresas cadastradas | 0 | 10+ | Lista no dashboard |
| Análises completas | 0 | 10+ | Abas preenchidas |
| Tech stack detectado | 0% | 85%+ | Seção 3 completa |
| Decisores encontrados | 0 | 30+ | Aba decisores |
| Insights IA gerados | 0 | 10+ | Cards de insights |
| Relatórios exportados | 0 | 5+ | PDFs gerados |
| Uptime Vercel | 0% | 99%+ | Vercel Dashboard |
| Erros de API | - | <5% | Logs |

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Rate limit APIs | Alta | Médio | Cache + fallback |
| Erro Supabase | Baixa | Alto | Retry + backup |
| OpenAI timeout | Média | Médio | Timeout + retry |
| Hunter sem créditos | Alta | Baixo | Limitar uso + alert |
| Vercel cold start | Média | Baixo | Warm-up automático |

---

## ✅ CHECKLIST DE ENTREGA

### Infraestrutura
- [ ] Supabase configurado e funcionando
- [ ] Variáveis de ambiente no Vercel
- [ ] Deploy bem-sucedido
- [ ] Banco populado com seed

### APIs Ativas
- [ ] ReceitaWS funcionando (teste 3 CNPJs)
- [ ] OpenAI gerando insights
- [ ] Hunter.io encontrando e-mails
- [ ] Google Search detectando tech

### Funcionalidades
- [ ] Login funcional
- [ ] Busca de empresas funcional
- [ ] Adição de empresas funcional
- [ ] Análise automática funcional
- [ ] Todas as abas com dados reais
- [ ] Export de relatórios funcional

### Qualidade
- [ ] Zero placeholders ou mocks
- [ ] Todos os cálculos com dados reais
- [ ] Logs de debug removidos
- [ ] Performance < 3s por análise
- [ ] Responsivo em mobile

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**COMEÇAR AGORA COM BLOCO 1.1: Configurar Supabase (30 min)**

1. Abrir https://supabase.com/dashboard/sign-up
2. Criar projeto `olv-intelligence`
3. Copiar connection string
4. Atualizar localmente e testar
5. Aplicar no Vercel

**Após confirmar que está pronto, vamos executar passo a passo juntos!** 🚀

---

## 📞 SUPORTE

**Dúvidas durante implementação:**
- Documentação Supabase: https://supabase.com/docs
- Documentação Vercel: https://vercel.com/docs
- APIs: Ver `IMPLEMENTATION-GUIDE.md`

**Estimativa total: 4-5 horas para sistema 100% funcional**

