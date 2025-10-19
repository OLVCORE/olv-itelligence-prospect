# 🛡️ DEFENSIVE CODING STANDARDS - OLV Intelligence

**DOCUMENTO OBRIGATÓRIO PARA TODOS OS DESENVOLVEDORES**

## ⚠️ PROBLEMA QUE ESTAMOS RESOLVENDO

Durante o desenvolvimento, encontramos **múltiplos crashes** causados por:
- `Cannot read properties of undefined (reading 'filter')`
- `Cannot read properties of undefined (reading 'map')`
- `Cannot read properties of undefined (reading 'length')`

**CAUSA RAIZ:** Assumir que dados externos sempre existem.

---

## ✅ REGRAS OBRIGATÓRIAS

### 1. NUNCA ASSUMA QUE DADOS EXISTEM

**❌ ERRADO:**
```typescript
function MyComponent({ data }: { data: Item[] }) {
  return data.map(item => <div>{item.name}</div>)
}
```

**✅ CORRETO:**
```typescript
import { SafeArray } from '@/lib/utils/defensive'

function MyComponent({ data }: { data?: Item[] }) {
  return SafeArray(data).map(item => <div>{item.name}</div>)
}
```

---

### 2. SEMPRE USE OPTIONAL CHAINING EM ARRAYS/OBJETOS EXTERNOS

**❌ ERRADO:**
```typescript
const count = data.filter(x => x.active).length
const names = data.map(x => x.name)
```

**✅ CORRETO:**
```typescript
const count = data?.filter(x => x.active).length || 0
const names = data?.map(x => x.name) || []
```

---

### 3. PROPS DE COMPONENTES SEMPRE OPCIONAIS (EXCETO ID)

**❌ ERRADO:**
```typescript
interface ModuleProps {
  data: Item[]      // Obrigatório = crash se undefined
  title: string     // Obrigatório = crash se undefined
}
```

**✅ CORRETO:**
```typescript
interface ModuleProps {
  companyId?: string     // Optional
  companyName?: string   // Optional
  data?: Item[]          // Optional com fallback
  title?: string         // Optional com fallback
}

export function Module({ data = [], title = 'Título Padrão' }: ModuleProps) {
  // Fallbacks garantem segurança
}
```

---

### 4. USE UTILITÁRIOS DEFENSIVOS

Importar de `@/lib/utils/defensive`:

```typescript
import { SafeArray, SafeString, SafeNumber, hasValidData } from '@/lib/utils/defensive'

// Em vez de data.map()
SafeArray(data).map(item => ...)

// Em vez de obj.prop
SafeString(obj?.prop, 'N/A')

// Verificar se tem dados antes de renderizar
{hasValidData(data) ? (
  <List items={data} />
) : (
  <EmptyState />
)}
```

---

### 5. EMPTY STATES SEMPRE PRESENTES

**❌ ERRADO:**
```typescript
return (
  <div>
    {data.map(item => <Card key={item.id} {...item} />)}
  </div>
)
```

**✅ CORRETO:**
```typescript
return (
  <div>
    {hasValidData(data) ? (
      data.map(item => <Card key={item.id} {...item} />)
    ) : (
      <div className="text-center text-muted-foreground p-8">
        <Info className="h-12 w-12 mx-auto mb-4" />
        <p>Nenhum item encontrado</p>
      </div>
    )}
  </div>
)
```

---

### 6. CONTADORES COM FALLBACK ZERO

**❌ ERRADO:**
```typescript
<Badge>{data.filter(x => x.active).length} Ativos</Badge>
```

**✅ CORRETO:**
```typescript
<Badge>{data?.filter(x => x.active).length || 0} Ativos</Badge>
```

---

### 7. VALIDAÇÃO EM APIS (Server-Side)

```typescript
// app/api/example/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  
  // Validar entrada
  if (!id) {
    return NextResponse.json(
      { error: 'ID é obrigatório' }, 
      { status: 400 }
    )
  }
  
  const result = await fetchData(id)
  
  // Validar saída
  if (!result) {
    return NextResponse.json(
      { error: 'Não encontrado' }, 
      { status: 404 }
    )
  }
  
  return NextResponse.json({ status: 'success', data: result })
}
```

---

## 🚫 ANTI-PADRÕES PROIBIDOS

### ❌ 1. Array/Object methods sem validação
```typescript
data.map()           // 🔴 PROIBIDO
data.filter()        // 🔴 PROIBIDO
data.reduce()        // 🔴 PROIBIDO
obj.prop.subprop     // 🔴 PROIBIDO
```

### ❌ 2. Props obrigatórias sem necessidade
```typescript
interface Props {
  data: Item[]  // 🔴 Deve ser opcional: data?: Item[]
}
```

### ❌ 3. Renderização sem empty state
```typescript
{data.map(...)}  // 🔴 E se data for undefined?
```

### ❌ 4. Assumir formato de dados
```typescript
const first = data[0]  // 🔴 E se data estiver vazio?
```

---

## ✅ CHECKLIST ANTES DE COMMIT

- [ ] Todos os `.map()` têm `?.`
- [ ] Todos os `.filter()` têm `?.`
- [ ] Todos os `.length` têm fallback `|| 0`
- [ ] Props opcionais com `?` e valores default
- [ ] Empty states implementados
- [ ] APIs validam entrada e saída
- [ ] Nenhum `any` sem validação
- [ ] Erros têm mensagens claras

---

## 🎯 EXEMPLO COMPLETO DE COMPONENTE SEGURO

```typescript
import { SafeArray, hasValidData } from '@/lib/utils/defensive'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

interface Item {
  id: string
  name: string
  active: boolean
}

interface SafeModuleProps {
  companyId?: string
  data?: Item[]
  title?: string
}

export function SafeModule({ 
  companyId,
  data = [],  // Fallback para array vazio
  title = 'Módulo'  // Fallback para título
}: SafeModuleProps) {
  
  // Contadores seguros
  const totalCount = SafeArray(data).length
  const activeCount = data?.filter(x => x.active).length || 0
  
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2>{title}</h2>
        <div className="flex gap-2">
          <Badge>{totalCount} Total</Badge>
          <Badge variant="secondary">{activeCount} Ativos</Badge>
        </div>
      </div>
      
      {/* Empty state primeiro */}
      {!hasValidData(data) ? (
        <div className="text-center p-8 text-muted-foreground">
          <Info className="h-12 w-12 mx-auto mb-4" />
          <p>Nenhum item encontrado</p>
          <p className="text-sm">Aguardando dados...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {SafeArray(data).map(item => (
            <Card key={item.id}>
              <p>{item.name}</p>
              {item.active && <Badge>Ativo</Badge>}
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
```

---

## 📊 MÉTRICAS DE QUALIDADE

**OBJETIVO:** Zero crashes em produção

**KPIs:**
- ✅ 100% dos array methods com validação
- ✅ 100% das props opcionais (exceto IDs)
- ✅ 100% dos componentes com empty state
- ✅ 100% das APIs com validação I/O

---

## 🔧 FERRAMENTAS

1. **ESLint rules** (futuramente):
   - `no-unsafe-optional-chaining`
   - `no-unsafe-member-access`

2. **TypeScript strict mode** (já ativo):
   - `strict: true`
   - `noUncheckedIndexedAccess: true`

3. **Testes unitários** (obrigatório):
   - Testar com `undefined`
   - Testar com `null`
   - Testar com `[]`
   - Testar com `{}`

---

**DOCUMENTO VIVO** - Atualizar sempre que novos padrões forem identificados.

**Última atualização:** 19/10/2025 - Após múltiplos crashes em produção

