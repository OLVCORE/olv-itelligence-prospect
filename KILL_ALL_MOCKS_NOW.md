# 🔥 KILL ALL MOCKS - AÇÃO IMEDIATA

**Arquivos com mocks identificados:**
- components/modules/BenchmarkModule.tsx (linha 42: `const data: BenchmarkItem[] = []`)
- components/modules/TechStackModule.tsx (chama APIs antigas)
- components/modules/AIAnalysisModule.tsx
- components/modules/CompanySearchModule.tsx
- components/modules/ReportsModule.tsx

**APIs com TODOs/FIXMEs:**
- 8 arquivos no app/api com comentários TODO

---

## 🎯 **ESTRATÉGIA DE REMOÇÃO**

### **1. BenchmarkModule - REMOVER mock vazio**

**Problema:** `const data: BenchmarkItem[] = []`

**Solução:** Buscar empresas reais do Supabase e comparar

### **2. TechStackModule - CONECTAR ao /api/intelligence/techstack**

**Problema:** Chama `/api/tech-stack` (antigo)

**Solução:** Usar `/api/intelligence/techstack` (novo, real)

### **3. Todos os módulos - VERIFICAR companyId presente**

**Problema:** Módulos não validam se têm companyId

**Solução:** Mostrar mensagem clara "Selecione uma empresa"

---

## 📋 **ARQUIVO POR ARQUIVO**

### **A) BenchmarkModule.tsx**

```tsx
// ANTES (mock):
const data: BenchmarkItem[] = []

// DEPOIS (real):
useEffect(() => {
  if (companies.length > 0) {
    loadBenchmarkData()
  }
}, [companies])

async function loadBenchmarkData() {
  const metrics = await Promise.all(
    companies.map(c => fetch(`/api/intelligence/maturity`, {
      method: 'POST',
      body: JSON.stringify({ companyId: c.id })
    }))
  )
  // Processar e comparar
}
```

### **B) TechStackModule.tsx**

```tsx
// ANTES:
const response = await fetch(`/api/tech-stack?companyId=${companyId}`)

// DEPOIS:
const response = await fetch('/api/intelligence/techstack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyId })
})
```

### **C) AIAnalysisModule.tsx**

Verificar se usa mocks ou dados reais do Supabase.

### **D) CompanySearchModule.tsx**

Conectar ao `/api/companies/search` (já criado).

### **E) ReportsModule.tsx**

Conectar ao `/api/reports/generate` (já existe).

---

## 🚀 **EXECUTANDO AGORA**

