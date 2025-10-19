# 🚨 URGENTE: Preciso Ver os Logs da Vercel

## 🎯 Objetivo

Identificar POR QUE a presença digital está retornando vazia mesmo com:
- ✅ Keys do Google configuradas no Vercel
- ✅ Import correto de `fetchDigitalPresence`
- ✅ API respondendo com sucesso

---

## 📋 Como Ver os Logs

### Passo 1: Acessar Logs da Vercel
1. Vá em: https://vercel.com/seu-workspace/olv-itelligence-prospect
2. Clique em **"Logs"** no menu lateral
3. Ou acesse direto: https://vercel.com/seu-workspace/olv-itelligence-prospect/logs

### Passo 2: Filtrar por Preview
Na barra de busca dos logs, digite: `preview`

### Passo 3: Fazer uma Busca Nova
1. Abra o dashboard
2. Pesquise um CNPJ novo: `33.683.111/0001-07` (TOTVS)
3. Aguarde o relatório abrir
4. Volte para os logs da Vercel

### Passo 4: Copiar os Logs Completos

**Procure por estes logs (que adicionei no último commit):**

```
[API /preview] 📥 Request: { cnpj: "...", ... }
[API /preview] ✅ CNPJ validado: ...
[API /preview] 📊 Buscando ReceitaWS...
[API /preview] ⏱️ ReceitaWS concluído em XXms

[API /preview] 🔍 Buscando presença digital completa (modo otimizado)...
[API /preview] 🔑 GOOGLE_API_KEY presente? true
[API /preview] 🔑 GOOGLE_CSE_ID presente? true
[API /preview] ⏱️ Presença digital concluída em XXms
[API /preview] 📊 RESULTADO PRESENÇA DIGITAL: {...}

[API /preview] 📰 Buscando notícias...
[API /preview] ⏱️ Notícias concluídas em XXms
[API /preview] 📰 NOTÍCIAS encontradas: X

[API /preview] 🧠 Gerando análise preliminar...
[API /preview] 🔑 OPENAI_API_KEY presente? true
[API /preview] ✅ Análise de IA gerada. Score: XX

[API /preview] ✅ Preview COMPLETO gerado em XXXms
```

**E TAMBÉM estes logs do `digital-presence.ts`:**

```
[DigitalPresence] 🔍 Buscando presença digital para: NOME_EMPRESA
[DigitalPresence] 🏠 Buscando website...
[DigitalPresence] 📱 Buscando redes sociais...
[DigitalPresence] ⚖️ Buscando Jusbrasil...
[DigitalPresence] 🛒 Buscando marketplaces...
[DigitalPresence] ✅ Presença digital mapeada em XXms
```

**Se houver ERROS, procure por:**

```
[DigitalPresence] ⚠️ Google CSE não configurado
[DigitalPresence] ❌ Erro: ...
[API /preview] ❌ ERRO na busca de presença digital: ...
```

---

## 🔍 O Que Procurar

### Cenário 1: Keys não estão sendo lidas
```
[API /preview] 🔑 GOOGLE_API_KEY presente? false  ❌
[API /preview] 🔑 GOOGLE_CSE_ID presente? false   ❌
```
**Solução:** Redeployar com as variáveis

### Cenário 2: Google CSE retorna erro
```
[DigitalPresence] ❌ Erro ao buscar website: 403 Forbidden
[DigitalPresence] ❌ Erro: API key not valid
```
**Solução:** Regenerar API key do Google

### Cenário 3: Quota excedida
```
[DigitalPresence] ❌ Erro: Quota exceeded
```
**Solução:** Aguardar reset da quota ou criar novo projeto

### Cenário 4: Timeout
```
[DigitalPresence] ⏱️ Timeout ao verificar website
```
**Solução:** Já está com FAST_MODE, verificar se está ativo

### Cenário 5: Retorna vazio silenciosamente
```
[API /preview] 📊 RESULTADO PRESENÇA DIGITAL: {
  "website": null,
  "redesSociais": {},
  "marketplaces": [],
  ...
}
```
**Solução:** Ver logs anteriores de `[DigitalPresence]` para descobrir por que não encontrou nada

---

## ⚡ AÇÃO IMEDIATA

**ME ENVIE:**
1. Print dos logs da Vercel filtrados por `preview`
2. OU copie e cole o texto dos logs aqui no chat

**Com os logs, vou:**
- Identificar o problema EXATO
- Corrigir cirurgicamente
- Fazer funcionar de vez

---

**SEM OS LOGS, estou atirando no escuro!** 🎯

Por favor, me envie os logs da última busca.

