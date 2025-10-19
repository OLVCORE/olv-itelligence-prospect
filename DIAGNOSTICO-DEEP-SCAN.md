# 🔍 DIAGNÓSTICO: Por que a Presença Digital não está sendo carregada?

## ❌ Problema Identificado

O usuário vê:
```
🌐 7. Presença Digital e Canais de Venda
⚠️ Nenhuma presença digital encontrada. A empresa pode não ter canais online ativos.
```

**Isso está ERRADO!** Deveria mostrar:
- ✅ Redes sociais (Instagram, LinkedIn, Facebook)
- ✅ Marketplaces (se houver)
- ✅ Jusbrasil
- ✅ Notícias recentes
- ✅ Análise de IA

---

## 🔎 Possíveis Causas

### 1. **Deep-Scan não está sendo disparado**
- O `fetch` para `/api/preview/deep-scan` pode estar falhand o
- Variável `VERCEL_URL` ou `NEXT_PUBLIC_API_URL` pode estar incorreta

### 2. **Deep-Scan está falhando silenciosamente**
- Google CSE keys (`GOOGLE_API_KEY`, `GOOGLE_CSE_ID`) podem estar faltando
- OpenAI key (`OPENAI_API_KEY`) pode estar faltando
- Erro na busca não está sendo tratado

### 3. **Polling não está encontrando o resultado**
- Tabela `preview_cache` pode não estar salvando
- JobId pode estar incorreto

---

## 🛠️ PLANO DE DIAGNÓSTICO E CORREÇÃO

### ✅ PASSO 1: Verificar Variáveis de Ambiente no Vercel

**CRÍTICO:** Confirme que estas variáveis estão no Vercel:

```bash
# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=https://qtcwetabhhkhvomcrqgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[sua-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]

# Google CSE (OBRIGATÓRIO para busca)
GOOGLE_API_KEY=[sua-google-api-key]
GOOGLE_CSE_ID=[seu-cse-id]

# OpenAI (opcional, mas recomendado)
OPENAI_API_KEY=[sua-openai-key]

# Deploy URL
VERCEL_URL=[gerado-automaticamente]
```

**Como verificar:**
1. Vá em: https://vercel.com/seu-workspace/seu-projeto/settings/environment-variables
2. Confirme que `GOOGLE_API_KEY` e `GOOGLE_CSE_ID` existem
3. Se faltarem, adicione e faça redeploy

---

### ✅ PASSO 2: Verificar Logs da API Deep-Scan

**Vá em:** https://vercel.com/seu-workspace/seu-projeto/logs

**Filtre por:** `/api/preview/deep-scan`

**Procure por:**
- `[API /deep-scan] 🚀 Iniciando deep-scan`
- `[API /deep-scan] ✅ Deep-scan concluído`
- `[API /deep-scan] ❌ Erro` (SE HOUVER ERRO)

**Se houver erro, copie e me envie para corrigir!**

---

### ✅ PASSO 3: Testar Manualmente a API Deep-Scan

Execute no console do browser ou Postman:

```javascript
fetch('https://seu-deploy.vercel.app/api/preview/deep-scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jobId: 'test-123',
    cnpj: '67867580000190',
    companyName: 'OLV INTERNACIONAL',
    fantasia: 'OLV INTERNACIONAL',
    website: null,
    useAI: true
  })
})
.then(r => r.json())
.then(console.log)
```

**Esperado:**
```json
{
  "status": "completed",
  "jobId": "test-123",
  "data": {
    "presencaDigital": {
      "website": {...},
      "redesSociais": {...},
      "marketplaces": [...],
      "jusbrasil": {...},
      "noticias": [...]
    }
  }
}
```

---

### ✅ PASSO 4: Verificar se o Cache está sendo salvo

No Supabase Dashboard, execute:

```sql
SELECT 
  job_id,
  cnpj,
  status,
  created_at,
  data->'presencaDigital' as presenca_digital
FROM preview_cache
ORDER BY created_at DESC
LIMIT 5;
```

**Se estiver vazio:** O deep-scan não está salvando no cache.
**Se houver registros com `status='error'`:** Há um erro no deep-scan.

---

## 🚨 AÇÕES IMEDIATAS

### 1️⃣ **AGORA** - Você precisa fazer:

1. Acesse: https://vercel.com/seu-workspace/seu-projeto/settings/environment-variables
2. Confirme se `GOOGLE_API_KEY` e `GOOGLE_CSE_ID` existem
3. Se não existirem:
   - Vá em: https://console.cloud.google.com/apis/credentials
   - Crie uma API Key
   - Vá em: https://programmablesearchengine.google.com/
   - Crie um CSE (Custom Search Engine)
   - Adicione as variáveis no Vercel
   - Faça redeploy

### 2️⃣ **Depois** - Me envie:

Os logs da Vercel filtrados por `/api/preview/deep-scan` para eu ver o erro exato.

---

## 🎯 PRÓXIMOS PASSOS

Após confirmar que as variáveis estão corretas e ver os logs:

1. **Se faltarem keys do Google:** Vou criar um guia para obter e configurar
2. **Se houver erro no código:** Vou corrigir imediatamente
3. **Se estiver tudo OK mas não funcionar:** Vou investigar o fluxo completo

---

**Me envie um print das variáveis de ambiente ou os logs de erro, e eu corrijo imediatamente!**

