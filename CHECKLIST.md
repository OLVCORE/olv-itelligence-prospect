# Checklist de Execução - OLV Prospecting

## Para cada Empresa Prospectada

### 1. Entrada e Validação
- [ ] CNPJ/Razão social/Domínio coletados
- [ ] CNPJ válido (regex + dígitos verificadores)
- [ ] Domínio resolve (DNS A/AAAA)
- [ ] Empresa cadastrada no sistema

### 2. Coleta & Enriquecimento
- [ ] Dados cadastrais obtidos (ReceitaWS)
- [ ] Porte e situação fiscal validados
- [ ] Domínio enriquecido (Clearbit/similar)
- [ ] Setor/indústria identificado

### 3. Diagnóstico 360° - SEÇÃO 3 OBRIGATÓRIA
- [ ] **Stack Tecnológico Confirmado preenchido**
- [ ] ERP identificado (Confirmado/Indeterminado)
- [ ] Cloud provider detectado
- [ ] CRM identificado (se houver)
- [ ] BI/Analytics identificado (se houver)
- [ ] Fiscal/Contábil identificado
- [ ] Middleware/ETL identificado (se houver)
- [ ] **Evidências documentadas para cada stack**
  - [ ] URL/fonte da evidência
  - [ ] Trecho ou screenshot
  - [ ] Data de coleta
  - [ ] Nível de confiança (0-100%)
- [ ] Status atribuído (Confirmado ≥2 evidências)
- [ ] Última validação registrada

### 4. Benchmark & Maturidade Digital
- [ ] Score de maturidade calculado (0-100)
- [ ] Radar chart por pilar gerado
- [ ] Comparativo setorial aplicado
- [ ] Gaps identificados e documentados
- [ ] Oportunidades listadas

### 5. Decisores & Poder
- [ ] **Mínimo 2 decisores identificados**
- [ ] Contatos com dupla fonte (Apollo + ZoomInfo/Lusha)
- [ ] Emails verificados (formato + MX)
- [ ] Scoring de influência atribuído (1-5)
- [ ] LinkedIn profile linkado
- [ ] Departamento/área mapeado
- [ ] Senioridade confirmada (C-Level, VP, Manager)

### 6. Fit TOTVS/OLV & Predição
- [ ] Score de propensão calculado (0-100%)
- [ ] Ticket potencial estimado (R$)
- [ ] ROI projetado
- [ ] Produtos aderentes listados
- [ ] Arquitetura recomendada desenhada
- [ ] Riscos e premissas documentados

### 7. Playbook & Ação Comercial
- [ ] Narrativa consultiva gerada
- [ ] Hipóteses de dor identificadas
- [ ] Sequência de contatos definida
  - [ ] Dia 1: Email executivo
  - [ ] Dia 3: Ligação follow-up
  - [ ] Dia 5: Case setorial
  - [ ] Dia 7: Demo personalizada
- [ ] Objeções e respostas preparadas
- [ ] Materiais de apoio selecionados

### 8. Relatório Executivo
- [ ] **Seção 3 - Stack Confirmado PRESENTE**
- [ ] Sumário executivo (1 página)
- [ ] 5-7 KPIs principais
- [ ] Tabela de dados cadastrais
- [ ] Situação financeira/fiscal
- [ ] Evidências anexadas
- [ ] Maturidade digital com radar
- [ ] Decisores com scoring
- [ ] Benchmark setorial
- [ ] Fit & recomendações
- [ ] Playbook de abordagem
- [ ] HTML gerado
- [ ] PDF exportado
- [ ] Snapshot 1 página criado

### 9. Registro de Fontes
- [ ] Todas as fontes citadas
- [ ] Datas de coleta registradas
- [ ] Build ID único atribuído
- [ ] Hash de integridade gerado
- [ ] Evidências arquivadas (S3/storage)

### 10. Qualidade e Conformidade
- [ ] Precisão tecnológica ≥ 85%
- [ ] Decisores com confiança ≥ 90%
- [ ] LGPD: base legal documentada
- [ ] LGPD: minimização de dados respeitada
- [ ] LGPD: fontes autorizadas
- [ ] DPA assinado com provedores externos
- [ ] Logs de auditoria registrados

### 11. Alertas e Monitoramento
- [ ] Alerta de revalidação agendado (90 dias - stack)
- [ ] Alerta de revalidação agendado (180 dias - decisores)
- [ ] Monitoring rules ativas
- [ ] Webhook configurado (se necessário)

---

## Checklist de Qualidade (Pré-Entrega)

### Relatório Executivo
- [ ] Capa com logo, empresa, data, build ID
- [ ] Sumário executivo completo
- [ ] **SEÇÃO 3 - OBRIGATÓRIA PRESENTE E COMPLETA**
- [ ] Todas as seções numeradas corretamente
- [ ] Gráficos e tabelas legíveis
- [ ] Fontes citadas em cada seção
- [ ] Evidências linkadas/anexadas
- [ ] Formatação consistente
- [ ] PDF < 10MB
- [ ] Sem erros de renderização

### Dados
- [ ] Nenhum campo crítico em branco
- [ ] Datas no formato DD/MM/AAAA
- [ ] Valores monetários em R$ formatados
- [ ] Porcentagens com 0-100%
- [ ] Scores validados (0-100)
- [ ] CNPJs formatados corretamente
- [ ] Emails com formato válido
- [ ] URLs completas e acessíveis

### Conformidade
- [ ] Nenhuma informação sensível exposta
- [ ] Dados de contato de fontes autorizadas
- [ ] Disclaimers de LGPD incluídos
- [ ] Consentimento registrado (quando aplicável)
- [ ] Período de retenção definido
- [ ] Opt-out disponível

---

## Checklist de Entrega Final

- [ ] Relatório Executivo OLV (PDF)
- [ ] Snapshot 1 página (PDF)
- [ ] Lista de Decisores Confirmados (CSV)
- [ ] Tabela Consolidada (se múltiplas empresas)
- [ ] Canvas Estratégico (PNG/PDF)
- [ ] Registro de fontes e evidências (JSON/ZIP)
- [ ] Email de entrega enviado
- [ ] Apresentação agendada (se aplicável)

---

## Frequência de Revisão

- **Trimestral**: Revalidação de stack web
- **Semestral**: Revalidação de decisores
- **Anual**: Revisão completa de benchmark e fit

---

## Métricas de Sucesso

- Precisão tecnológica: **≥ 85%** (auditoria mensal)
- Decisores identificados: **≥ 90%** (dupla fonte)
- Tempo médio de enriquecimento: **< 2 horas** por empresa
- Completude dos dados: **≥ 95%** dos campos críticos
- Taxa de conversão pós-entrega: **≥ 40%**

---

## Contato e Suporte

Em caso de dúvidas sobre o checklist ou processo, contate:
- Equipe OLV: [email interno]
- Documentação: `README.md` e `DEPLOYMENT.md`


