# Guia de Uso - OLV Intelligent Prospecting System

## Visão Geral

O OLV Prospecting é um sistema de inteligência executiva B2B que transforma dados brutos de empresas em insights acionáveis através de um pipeline de 7 camadas.

## Fluxo de Trabalho

### 1. Cadastrar Nova Empresa

**Dashboard → Diagnóstico → Nova Empresa**

Preencha:
- Razão Social (obrigatório)
- CNPJ (opcional, mas recomendado)
- Domínio (opcional, mas recomendado)
- Setor/Indústria
- Porte (Pequeno/Médio/Grande)

O sistema automaticamente:
- Valida CNPJ
- Verifica se domínio resolve
- Cria registro inicial

### 2. Enriquecer Dados

**Empresa → Ações → Enriquecer**

Selecione tipo de enriquecimento:
- **Cadastral**: Busca dados fiscais (ReceitaWS)
- **Domínio**: Enriquece com dados da empresa (Clearbit)
- **Stack**: Detecta tecnologias (HTTP headers, DNS)
- **DNS**: Identifica provedores de email/cloud
- **Contatos**: Busca decisores (Apollo, ZoomInfo)
- **Tudo**: Executa todos os enriquecimentos

**Importante**: Respeite rate limits das APIs externas.

### 3. Preencher Stack Tecnológico (OBRIGATÓRIO)

**Dashboard → Stack Tecnológico → Adicionar Stack**

Para cada tecnologia:
1. Selecione **Categoria** (ERP, CRM, Cloud, etc.)
2. Informe **Produto** e **Fornecedor**
3. Defina **Status**:
   - **Confirmado**: ≥2 evidências independentes
   - **Indeterminado**: <2 evidências ou única fonte
4. Adicione **Evidências**:
   - URLs (vagas, subdomínios, docs)
   - Trechos de texto
   - Screenshots (upload)
5. Sistema calcula **Confiança** (0-100%)

**Regra de Ouro**: Seção 3 (Stack Confirmado) é OBRIGATÓRIA em todos os relatórios.

### 4. Identificar Decisores

**Dashboard → Decisores & Poder → Adicionar Contato**

Para cada decisor:
- Nome e Cargo
- Departamento (TI, Operações, Finanças, etc.)
- Email (verificar MX)
- LinkedIn profile
- Telefone (opcional)
- **Score de Influência** (1-5):
  - 1-2: Analista, Coordenador
  - 3: Gerente, Supervisor
  - 4: Diretor, VP
  - 5: C-Level (CEO, CTO, CFO, CIO)

**Meta**: Mínimo 2 decisores por empresa, preferencialmente com dupla fonte (Apollo + ZoomInfo).

### 5. Calcular Scores

**Empresa → Ações → Calcular Scores**

O sistema calcula automaticamente:
- **Maturidade Digital** (0-100): Baseado em 6 pilares
- **Propensão** (0-100%): Probabilidade de conversão
- **Prioridade**: Score de ataque comercial

**Quando recalcular**:
- Após adicionar/atualizar stacks
- Após identificar novos decisores
- Trimestralmente (revalidação)

### 6. Gerar Relatório Executivo

**Dashboard → Relatórios → Novo Relatório → Relatório Executivo Completo**

Selecione a empresa e clique **Gerar**.

O sistema cria automaticamente:
- **Capa** com logo e metadados
- **Sumário Executivo** (1 página, 5-7 KPIs)
- **1. Dados Cadastrais** (tabela)
- **2. Situação Financeira/Fiscal** (cards)
- **⚠️ 3. Stack Tecnológico Confirmado** (OBRIGATÓRIA)
  - Tabela completa por categoria
  - Evidências detalhadas
  - Fontes e datas
- **4. Maturidade Digital** (radar chart)
- **5. Decisores & Poder** (tabela com scoring)
- **6. Benchmark & Gaps** (gráficos vs. setor)
- **7. Fit & Arquitetura** (produtos TOTVS/OLV recomendados)
- **8. Playbook de Abordagem** (sequência de contatos)
- **9. Anexos** (evidências completas)

**Formatos disponíveis**:
- HTML (preview)
- PDF (download)

### 7. Criar Snapshot 1 Página

**Dashboard → Relatórios → Snapshot 1 Página**

Gera resumo executivo em 1 página com:
- 4 KPIs principais
- Stack confirmado (tags)
- Top decisores
- Recomendação chave

Ideal para: Reuniões rápidas, apresentações executivas.

### 8. Canvas Estratégico

**Dashboard → Canvas → Criar Canvas**

**Modo Canva** (brainstorming):
- Fundo claro
- Blocos livres
- Conexões visuais
- Ideal para: Workshops, mapping de oportunidades

**Modo Power BI** (dashboard):
- Fundo escuro
- Gráficos e KPIs
- Layout estruturado
- Ideal para: Apresentações executivas, tracking

**Colaboração em Tempo Real**:
- Veja quem está online
- Edições sincronizadas automaticamente
- Cursor de cada usuário visível

### 9. Monitoramento e Alertas

**Dashboard → Alertas**

Tipos de alertas:
- **Revalidação**: Stack não atualizado há 90 dias
- **Nova Evidência**: Vaga/menção detectada
- **Mudança de Cargo**: Decisor promovido/moveu
- **Benchmark Update**: Novos dados setoriais

**Ações**:
1. **Reconhecer**: Marca como visto
2. **Resolver**: Fecha o alerta
3. **Ver Detalhes**: Abre contexto completo

### 10. Tabela Consolidada (Múltiplas Empresas)

**Dashboard → Diagnóstico → Exportar → Tabela Consolidada**

Gera comparativo de múltiplas empresas com:
- Scores lado a lado
- Priorização automática
- Filtros por setor/porte
- Export para Excel/CSV

Ideal para: Portfolio review, reuniões de pipeline.

---

## Atalhos e Dicas

### Produtividade

- **CTRL+K**: Busca global
- **CTRL+E**: Enriquecimento rápido
- **CTRL+R**: Gerar relatório da empresa atual
- **CTRL+S**: Salvar canvas

### Boas Práticas

1. **Sempre preencha Stack (Seção 3)** antes de gerar relatórios
2. **Documente evidências** imediatamente após identificação
3. **Recalcule scores** após atualizações significativas
4. **Revalide dados** trimestralmente (stack) e semestralmente (decisores)
5. **Mantenha notas** sobre conversas e interações no campo "notes" dos contatos

### Qualidade dos Dados

✅ **BOM**:
- Stack com 2+ evidências independentes
- Emails verificados (MX check)
- Datas de validação recentes
- Fontes diversificadas

❌ **RUIM**:
- Stack baseado em única menção antiga
- Emails sem verificação
- Dados sem data de coleta
- Única fonte para tudo

---

## Integrações (Fase 2)

### APIs Externas

Configure em **Settings → Integrações**:
- Apollo.io (contatos)
- BuiltWith (stack web)
- ZoomInfo (decisores)
- Lusha (emails)
- Clearbit (enriquecimento)

### CRM

Sincronize com:
- Salesforce
- HubSpot
- Engage CRM (in-house)

### Automação

n8n workflows para:
- Enriquecimento agendado
- Campanhas de email sequenciais
- Notificações Slack/Teams
- Updates automáticos de oportunidades no CRM

---

## Troubleshooting

### "Seção 3 vazia no relatório"
→ Adicione pelo menos 1 stack na categoria ERP ou Cloud antes de gerar relatório.

### "Confiança muito baixa (< 50%)"
→ Adicione mais evidências ou fontes independentes.

### "Canvas não sincroniza"
→ Verifique conexão WebSocket (deve estar em wss://...)

### "Erro ao gerar PDF"
→ Relatório muito grande (>10MB) ou timeout. Reduza número de evidências anexadas.

### "Email não verificado"
→ Domínio sem MX records. Confirme manualmente ou use fonte alternativa.

---

## Suporte e Documentação

- **README.md**: Visão geral e arquitetura
- **DEPLOYMENT.md**: Guia de deploy e infraestrutura
- **CHECKLIST.md**: Checklist completo de execução
- **API Docs**: `/api/docs` (quando autenticado)

**Contato**: Equipe OLV via Slack #olv-prospecting

---

## Glossário

- **Stack**: Conjunto de tecnologias (ERP, CRM, Cloud, etc.)
- **Confiança**: Score 0-100% baseado em evidências
- **Propensão**: Probabilidade de conversão (0-100%)
- **Maturidade**: Score de digitalização da empresa (0-100)
- **C-Level**: Executivos de topo (CEO, CTO, CFO, CIO, COO)
- **Fit**: Aderência entre necessidades da empresa e soluções TOTVS/OLV
- **Playbook**: Sequência estruturada de abordagem comercial
- **Snapshot**: Resumo executivo de 1 página
- **Pipeline**: Funil de prospecção (7 camadas)

