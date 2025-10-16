# 🧠 OLV Intelligence - Motor de Inteligência

## 📋 Visão Geral

O **Motor de Inteligência OLV** é o cérebro do sistema. Ele analisa dados empresariais, calcula scores preditivos, gera insights com IA e orquestra toda a inteligência da plataforma de forma autônoma e integrada.

## 🎯 Funcionalidades do Motor

### 1. Análise Completa de Empresas
- ✅ Tech Stack Analysis (detecção de tecnologias)
- ✅ Decision Makers Profile (perfil de decisores)
- ✅ Financial Analysis (análise financeira e risco)
- ✅ Scoring Inteligente (maturidade, propensão, prioridade)
- ✅ AI Insights (insights gerados automaticamente)
- ✅ Recommendations (recomendações acionáveis)

### 2. Cálculos Inteligentes

#### Score de Maturidade Digital (0-100%)
Avalia o nível de modernização tecnológica da empresa:
- **Confiança média das tecnologias** (peso 30%)
- **Tecnologias cloud** (+15 pontos por tech)
- **Ferramentas de automação** (+12 pontos por tech)
- **ERPs modernos** (+20 pontos por sistema)
- **Ferramentas de BI** (+10 pontos por ferramenta)
- **Ajuste por porte** (Grande +10, Médio +5)

#### Score de Propensão à Compra (0-100%)
Calcula a probabilidade de conversão:
- **Base score**: 35 pontos
- **Decisores mapeados**: +20 pontos (3+ decisores +10 extra)
- **C-Level identificados**: +8 pontos por executivo
- **Porte da empresa**: Grande +20, Médio +12
- **Risco de crédito**: Baixo +10, Alto -15
- **Tecnologias legadas**: +5 pontos por sistema legado

#### Score de Prioridade (0-100%)
Define a urgência de abordagem:
- **Propensão** (peso 50%)
- **Ticket potencial** (peso 30%)
- **Urgência** = inverso da maturidade (peso 20%)

#### Score de Confiança (0-100%)
Mede a qualidade dos dados:
- **Confiança do Tech Stack** (peso 60%)
- **Confiança dos Decisores** (peso 40%)

### 3. Geração de Insights com IA

O motor analisa automaticamente e gera insights acionáveis:

| Tipo | Quando Acontece | Impacto |
|------|----------------|---------|
| **Oportunidade de Modernização** | Maturidade < 40% | Alto |
| **Rede de Decisores Mapeada** | 3+ decisores identificados | Alto |
| **Tecnologias Legadas** | Prioridade modernização > 70 | Alto |
| **Perfil Financeiro Excelente** | Grande porte + Baixo risco | Alto |

### 4. Recomendações Inteligentes

Geradas automaticamente com base na análise:

**Exemplo 1: Alta Propensão**
```typescript
{
  title: "Agendar Reunião Executiva",
  priority: 95,
  expectedROI: 250%,
  effort: "medium",
  timeline: "1-2 semanas"
}
```

**Exemplo 2: Tech Legado**
```typescript
{
  title: "Propor Migração de ERP",
  priority: 85,
  expectedROI: 180%,
  effort: "high",
  timeline: "3-6 meses"
}
```

### 5. Cálculo de Ticket Estimado

Fórmula inteligente que considera:
- **Porte da empresa** (Pequeno: R$ 50K, Médio: R$ 100K, Grande: R$ 200K)
- **Multiplicador de score** = (maturidade + propensão) / 200
- **Multiplicador de tecnologias** = min(techCount / 5, 1.5)

Retorna:
```typescript
{
  min: number,    // Ticket mínimo (70% da base)
  max: number,    // Ticket máximo (180% * multiplicadores)
  average: number // Média entre min e max
}
```

## 🔄 Fluxo de Análise

```
1. Buscar Empresa no DB
        ↓
2. Analisar Tech Stack
        ↓
3. Analisar Decision Makers
        ↓
4. Análise Financeira
        ↓
5. Calcular Scores
        ↓
6. Gerar AI Insights
        ↓
7. Gerar Recomendações
        ↓
8. Calcular Ticket Estimado
        ↓
9. Calcular Fit Score Final
        ↓
10. Retornar Análise Completa
```

## 💡 Como Usar

### Análise Completa de Uma Empresa

```typescript
import { IntelligenceEngine } from '@/lib/intelligence-engine'

// Analisar empresa
const analysis = await IntelligenceEngine.analyzeCompany(companyId)

console.log({
  scores: analysis.scores,           // { maturity, propensity, priority, confidence }
  insights: analysis.insights,       // Array de insights IA
  recommendations: analysis.recommendations,
  ticketEstimate: analysis.ticketEstimate,
  fitScore: analysis.fitScore       // Score final 0-100
})
```

### Integração com API Routes

```typescript
// app/api/analyze/route.ts
import { IntelligenceEngine } from '@/lib/intelligence-engine'

export async function POST(req: Request) {
  const { companyId } = await req.json()
  
  try {
    const analysis = await IntelligenceEngine.analyzeCompany(companyId)
    return NextResponse.json(analysis)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

### Integração com Context Global

```typescript
// lib/contexts/ModuleContext.tsx
const triggerAnalysis = async (companyId: string) => {
  setIsLoading(true)
  
  try {
    const analysis = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ companyId })
    }).then(res => res.json())
    
    setAnalysisData(analysis)
    notify("success", "Análise Concluída", "Insights gerados com sucesso!")
  } catch (error) {
    notify("error", "Erro", "Falha na análise")
  } finally {
    setIsLoading(false)
  }
}
```

## 🎨 Exemplos de Output

### Análise Completa

```json
{
  "companyId": "company-1",
  "scores": {
    "maturity": 78,
    "propensity": 85,
    "priority": 92,
    "confidence": 88
  },
  "insights": [
    {
      "type": "opportunity",
      "title": "Rede de Decisores Mapeada",
      "description": "5 decisores identificados, incluindo 3 com alta influência.",
      "confidence": 88,
      "impact": "high",
      "actionable": true
    }
  ],
  "recommendations": [
    {
      "title": "Agendar Reunião Executiva",
      "priority": 95,
      "expectedROI": 250,
      "effort": "medium",
      "timeline": "1-2 semanas"
    }
  ],
  "ticketEstimate": {
    "min": 140000,
    "max": 380000,
    "average": 260000
  },
  "fitScore": 87
}
```

## 🚀 Próximas Evoluções

1. **Machine Learning Integration**
   - Treinar modelos com histórico de vendas
   - Previsão de churn e upsell
   - Otimização de scores com feedback real

2. **Real-time Processing**
   - Análise incremental (não recalcular tudo)
   - Cache inteligente de resultados
   - Atualização automática com novos dados

3. **Advanced AI**
   - Integração com GPT-4 para insights textuais
   - Análise de sentimento em interações
   - Geração de playbooks personalizados

4. **Benchmarking Inteligente**
   - Comparação automática com mercado
   - Identificação de outliers
   - Tendências setoriais

## 📊 Métricas de Performance

O motor é otimizado para:
- ⚡ **Análise completa**: < 2 segundos
- 🎯 **Precisão de scores**: > 85%
- 💡 **Insights acionáveis**: 100% das análises
- 🔄 **Atualização incremental**: Tempo real

---

**Desenvolvido com 🧠 pela equipe OLV Intelligence**

