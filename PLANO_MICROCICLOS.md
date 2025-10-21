# 🔄 PLANO EM MICROCICLOS - OLV INTELLIGENCE

**Objetivo:** Corrigir e conectar TUDO, módulo por módulo, com checkpoints.

---

## 📋 **MICROCICLO 1: CONTEXTO GLOBAL (SELEÇÃO DE EMPRESA)**

**Problema:** Módulos não sabem QUAL empresa analisar.

**Solução:**
1. Criar estado global `selectedCompanyId` no dashboard
2. Exibir empresa selecionada no topo (card fixo)
3. Todos os módulos recebem `companyId` do contexto
4. Botão "Selecionar Empresa" visível em cada módulo

**Arquivos:**
- `app/dashboard/page.tsx` - Estado global
- `components/CompanySelector.tsx` - Card de empresa selecionada
- Todos os módulos - Receber companyId do contexto

**Checkpoint:**
✅ Clicar em empresa → Fica selecionada
✅ Card fixo no topo mostra empresa atual
✅ Todos os módulos veem a empresa

---

## 📋 **MICROCICLO 2: BUSCA FUNCIONAL**

**Problema:** SearchHub não executa busca corretamente.

**Solução:**
1. Corrigir import `supabaseAdmin` (erro no log)
2. Conectar SearchHub ao preview
3. Preview salva empresa e atualiza contexto
4. Empresa aparece na lista

**Arquivos:**
- `lib/supabaseAdmin.ts` - Corrigir export
- `components/SearchHub.tsx` - Conectar preview
- `app/api/companies/search/route.ts` - Validar

**Checkpoint:**
✅ Buscar CNPJ → Preview abre
✅ Salvar → Empresa na lista
✅ Empresa automaticamente selecionada
✅ Capital correto (sem x1000)

---

## 📋 **MICROCICLO 3: PIPELINE EXECUTÁVEL**

**Problema:** UnifiedPipeline não executa etapas.

**Solução:**
1. Receber companyId válido
2. Botão "Executar" chama API correta
3. Mostrar loading durante execução
4. Expandir etapa ao concluir
5. Mostrar dados reais

**Arquivos:**
- `components/pipeline/UnifiedPipeline.tsx` - Corrigir execução
- APIs de intelligence - Validar responses

**Checkpoint:**
✅ Clicar "Executar Tudo" → Etapas processam
✅ Status muda: pending → running → completed
✅ Dados reais aparecem ao expandir
✅ Erros mostram botão "Tentar novamente"

---

## 📋 **MICROCICLO 4: MÓDULO FINANCEIRO**

**Problema:** Não mostra dados úteis para decisão de venda.

**Solução:**
1. Dados da ReceitaWS (capital, porte, situação)
2. Score de crédito estimado
3. Red flags (empresa suspensa, sem capital, etc)
4. Green flags (ativa, capital alto, etc)
5. Recomendação Go/No-Go

**Arquivos:**
- `components/modules/FinancialModule.tsx` - Adicionar lógica

**Checkpoint:**
✅ Mostra capital social real
✅ Mostra situação cadastral
✅ Lista red flags (se houver)
✅ Recomendação clara: GO ou NO-GO

---

## 📋 **MICROCICLO 5: MÓDULO MATURIDADE**

**Problema:** Mostra scores sem contexto da empresa.

**Solução:**
1. Header: Nome da empresa + CNPJ
2. Score geral com breakdown visual
3. Explicação de cada pilar
4. Comparação com setor
5. Sugestões de melhoria

**Arquivos:**
- `components/modules/MaturityModule.tsx` - Adicionar contexto

**Checkpoint:**
✅ Nome da empresa no topo
✅ Score geral + breakdown
✅ Explicação clara de cada pilar
✅ Sugestões baseadas nos dados

---

## 📋 **MICROCICLO 6: MÓDULO BENCHMARK**

**Problema:** Não deixa claro O QUE está comparando.

**Solução:**
1. Seletor de empresas (multi-select)
2. Tabela comparativa lado a lado
3. Métricas: Capital, Porte, Maturidade, Tech Stack
4. Highlight de diferenças
5. Conclusão: Qual empresa é melhor prospect?

**Arquivos:**
- `components/modules/BenchmarkModule.tsx` - Adicionar seletor

**Checkpoint:**
✅ Selecionar 2-5 empresas
✅ Ver tabela comparativa
✅ Highlight de vencedor por métrica
✅ Conclusão clara

---

## 📋 **MICROCICLO 7: MÓDULO FIT TOTVS**

**Problema:** Mock genérico, não conectado.

**Solução:**
1. Header: Empresa sendo analisada
2. Detectar se já usa TOTVS (real)
3. Listar produtos compatíveis por CNAE/porte
4. Priorizar oportunidades
5. Rationale clara para cada produto

**Arquivos:**
- `components/modules/FitTotvsModule.tsx` - Conectar dados reais

**Checkpoint:**
✅ Nome da empresa no topo
✅ Status: Usa TOTVS? SIM/NÃO
✅ Lista de oportunidades reais
✅ Rationale para cada produto
✅ Prioridade visual (Alta/Média/Baixa)

---

## 📋 **MICROCICLO 8: MÓDULO PLAYBOOKS**

**Problema:** Não mostra nada relevante.

**Solução:**
1. Header: Empresa
2. Listar playbooks disponíveis por tipo de venda
3. Gerar playbook com IA (usando dados reais)
4. Preview antes de gerar PDF
5. Download PDF funcional

**Arquivos:**
- `components/modules/PlaybooksModule.tsx` - Conectar geração

**Checkpoint:**
✅ Nome da empresa no topo
✅ Lista de templates de playbook
✅ Gerar com IA (dados reais)
✅ Preview do conteúdo
✅ Download PDF funciona

---

## 📋 **MICROCICLO 9: CANVAS COLABORATIVO**

**Problema:** Vazio, sem conteúdo.

**Solução:**
1. Template inicial com seções
2. Dados da empresa pré-carregados
3. Áreas editáveis
4. Autosave funcionando
5. Realtime sync
6. Comandos IA ("Resumir", "Gerar Ações")

**Arquivos:**
- `app/dashboard/canvas/page.tsx` - Adicionar template
- `components/canvas/CanvasEditor.tsx` - Criar novo

**Checkpoint:**
✅ Canvas abre com template
✅ Dados da empresa visíveis
✅ Edição funciona
✅ Autosave ativo (2s)
✅ Realtime entre abas
✅ Comandos IA funcionam

---

## 📋 **MICROCICLO 10: ALERTAS E LOGS**

**Problema:** Painel vazio.

**Solução:**
1. Criar tabela `Logs` no Supabase
2. Todas APIs gravam log (módulo, status, latência)
3. AlertsPanel carrega logs reais
4. Filtros funcionam
5. Auto-refresh

**Arquivos:**
- `sql/create_logs_table.sql` - Criar tabela
- APIs - Adicionar logging
- `components/alerts/AlertsPanel.tsx` - Conectar dados

**Checkpoint:**
✅ Tabela Logs existe
✅ APIs gravam logs
✅ AlertsPanel mostra logs reais
✅ Filtros funcionam
✅ Auto-refresh ativo

---

## 🎯 **ORDEM DE EXECUÇÃO**

```
1️⃣ MICROCICLO 1: Contexto Global (1h)
   → Estado selectedCompanyId
   → Card fixo no topo
   → Checkpoint: Selecionar empresa funciona

2️⃣ MICROCICLO 2: Busca Funcional (1h)
   → Corrigir supabaseAdmin import
   → SearchHub conectado
   → Checkpoint: Busca salva empresa

3️⃣ MICROCICLO 3: Pipeline Executável (1h)
   → Receber companyId
   → Executar etapas
   → Checkpoint: Pipeline funciona

4️⃣ MICROCICLO 4: Financeiro (30 min)
   → Red/Green flags
   → Go/No-Go
   → Checkpoint: Decisão clara

5️⃣ MICROCICLO 5: Maturidade (30 min)
   → Header com empresa
   → Breakdown visual
   → Checkpoint: Contexto claro

6️⃣ MICROCICLO 6: Benchmark (30 min)
   → Multi-select
   → Tabela comparativa
   → Checkpoint: Comparação útil

7️⃣ MICROCICLO 7: Fit TOTVS (30 min)
   → Detectar TOTVS real
   → Oportunidades priorizadas
   → Checkpoint: Análise real

8️⃣ MICROCICLO 8: Playbooks (30 min)
   → Geração com IA
   → PDF funcional
   → Checkpoint: Download funciona

9️⃣ MICROCICLO 9: Canvas (1h)
   → Template inicial
   → Realtime sync
   → Checkpoint: Colaboração funciona

🔟 MICROCICLO 10: Alertas (30 min)
   → Tabela Logs
   → Painel real
   → Checkpoint: Logs visíveis
```

**Total:** ~7 horas (1 dia de trabalho focado)

---

## 📝 **COMO VAMOS TRABALHAR**

1. Eu entrego **MICROCICLO 1**
2. Você testa e valida
3. Eu corrijo se necessário
4. Checkpoint ✅
5. Passo para MICROCICLO 2
6. Repetir até 10

**SEM PULAR ETAPAS**  
**SEM ATROPELOS**  
**CHECKPOINT POR CHECKPOINT**

---

**Marcos, concorda com esse plano? Posso começar o MICROCICLO 1 agora?**

