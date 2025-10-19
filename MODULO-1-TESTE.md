# ✅ MÓDULO 1 - GUIA DE TESTE

## 🎯 Objetivo
Validar que o pré-relatório agora responde em menos de 7 segundos e completa a busca profunda em background, eliminando o erro 504 Gateway Timeout.

---

## 📋 Pré-requisitos

### 1. Executar a Migration do Supabase
Antes de testar, execute a migration para criar a tabela `preview_cache`:

**Opção A - Automática:**
```bash
npx tsx scripts/run-preview-cache-migration.ts
```

**Opção B - Manual:**
Siga as instruções em `MIGRATION-PREVIEW-CACHE-GUIDE.md`

### 2. Verificar Variáveis de Ambiente
Confirme que estas variáveis estão no `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
GOOGLE_API_KEY=[sua-google-api-key]
GOOGLE_CSE_ID=[seu-google-cse-id]
```

### 3. Fazer Deploy ou Rodar Local
```bash
npm run build
npm start
# Ou
vercel --prod
```

---

## 🧪 Cenários de Teste

### Teste 1: Resposta Rápida (< 7s)
**Objetivo:** Validar que a API retorna dados parciais rapidamente

**Passos:**
1. Abra o Dashboard e use a SearchBar
2. Digite um CNPJ válido (ex: `33.683.111/0001-07` - TOTVS)
3. Clique em "Pesquisar"
4. **Esperado:**
   - O PreviewModal abre em **menos de 7 segundos**
   - Dados básicos (Receita Federal) são exibidos imediatamente
   - Um banner azul aparece: "Análise em andamento - Buscando redes sociais..."

**Resultado:**
- [ ] Modal abre rápido (< 7s)
- [ ] Dados parciais visíveis
- [ ] Banner de progresso exibido

---

### Teste 2: Polling e Progressive Loading
**Objetivo:** Validar que os dados completos são carregados em background

**Passos:**
1. Com o modal aberto (do Teste 1)
2. Observe o banner de progresso mudar:
   - "Buscando redes sociais..."
   - "Analisando marketplaces..."
   - "Verificando histórico jurídico..."
   - "Coletando notícias recentes..."
   - "Finalizando análise..."
3. **Esperado:**
   - Após 10-30 segundos, o banner desaparece
   - A seção "7. Presença Digital" é preenchida com:
     - Website oficial
     - Redes sociais (Instagram, LinkedIn, etc.)
     - Marketplaces (se houver)
     - Jusbrasil (se houver)
     - Notícias recentes

**Resultado:**
- [ ] Banner de progresso atualiza dinamicamente
- [ ] Deep-scan completa em background
- [ ] Dados completos são exibidos sem refresh

---

### Teste 3: Validação de Cache
**Objetivo:** Verificar que o resultado do deep-scan é salvo no cache

**Passos:**
1. No Supabase Dashboard, vá em "Table Editor"
2. Abra a tabela `preview_cache`
3. **Esperado:**
   - Após o deep-scan completar (Teste 2), deve haver um registro com:
     - `job_id`: UUID do job
     - `cnpj`: CNPJ da empresa buscada
     - `status`: 'completed'
     - `data`: JSON com presença digital completa

**Resultado:**
- [ ] Registro criado no cache
- [ ] Status = 'completed'
- [ ] Campo `data` contém JSON válido

---

### Teste 4: Resiliência a Timeout
**Objetivo:** Validar que o sistema não quebra se o deep-scan demorar muito

**Passos:**
1. Pesquise um CNPJ de uma empresa pequena/nova (menor presença digital)
2. Observe o comportamento
3. **Esperado:**
   - O modal abre rápido mesmo se a empresa não tiver dados completos
   - Se o deep-scan não completar em 2 minutos, o banner exibe: "Timeout - alguns dados podem estar incompletos"
   - O usuário ainda pode salvar o relatório com os dados parciais

**Resultado:**
- [ ] Não há erro 504
- [ ] Mensagem de timeout é exibida (se aplicável)
- [ ] Botão "Confirmar & Salvar" continua funcional

---

### Teste 5: Logs no Console (Desenvolvimento)
**Objetivo:** Validar os logs do fluxo de dados

**Passos:**
1. Abra o DevTools (F12) > Console
2. Pesquise um CNPJ
3. **Esperado (Logs):**
   ```
   [API /preview] 📥 Request: { cnpj: "...", ... }
   [API /preview] ✅ CNPJ validado: ...
   [API /preview] 📊 Buscando ReceitaWS...
   [API /preview] ⏱️ ReceitaWS concluído em XXXms
   [API /preview] 🏠 Busca rápida de website...
   [API /preview] ⏱️ Busca rápida concluída em XXXms
   [API /preview] ✅ Resposta parcial gerada em XXXms
   [API /preview] 🚀 Disparando deep-scan assíncrono - JobId: ...
   
   [PreviewModal] Iniciando polling para jobId: ...
   [PreviewModal] Polling tentativa 1 - jobId: ...
   [PreviewModal] Resultado do polling: pending
   ...
   [PreviewModal] Resultado do polling: completed
   [PreviewModal] Deep-scan concluído! Dados: {...}
   ```

**Resultado:**
- [ ] Logs aparecem na ordem correta
- [ ] Tempo de resposta parcial < 7000ms
- [ ] Polling completa com sucesso

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Modal não abre ou demora muito
**Causa:** Migration não executada ou tabela não existe
**Solução:**
1. Verifique se a tabela `preview_cache` existe no Supabase
2. Execute a migration manualmente (ver `MIGRATION-PREVIEW-CACHE-GUIDE.md`)

### Problema 2: Banner fica em "pending" infinitamente
**Causa:** Deep-scan falhou ou não foi disparado
**Solução:**
1. Verifique os logs no Vercel (Functions > Logs)
2. Procure por erros em `[API /deep-scan]`
3. Confirme que as variáveis `GOOGLE_API_KEY` e `GOOGLE_CSE_ID` estão corretas

### Problema 3: Erro 504 continua
**Causa:** Deploy antigo ainda ativo
**Solução:**
1. Force um novo deploy: `vercel --prod --force`
2. Aguarde 2-3 minutos para propagação
3. Limpe o cache do navegador e teste novamente

---

## 📊 Métricas de Sucesso

| Métrica | Alvo | Status |
|---------|------|--------|
| Tempo de resposta inicial | < 7s | [ ] |
| Modal abre sem erro 504 | 100% | [ ] |
| Deep-scan completa | < 60s | [ ] |
| Polling funcional | Sim | [ ] |
| Cache salva corretamente | Sim | [ ] |

---

## ✅ Checklist Final

- [ ] Migration executada no Supabase
- [ ] Teste 1 (Resposta Rápida) passou
- [ ] Teste 2 (Polling) passou
- [ ] Teste 3 (Cache) passou
- [ ] Teste 4 (Resiliência) passou
- [ ] Teste 5 (Logs) verificados
- [ ] Nenhum erro 504 observado
- [ ] Pronto para MÓDULO 2

---

**Próximo Passo:** Após validar todos os testes, podemos prosseguir para o **MÓDULO 2: Implementação da Busca ASSERTIVA**.

