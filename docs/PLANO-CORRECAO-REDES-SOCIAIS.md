# 🔧 PLANO DE CORREÇÃO - Redes Sociais e Presença Digital

**Status:** Em Diagnóstico  
**Empresa Teste:** Kelludy (CNPJ: 34.438.456/0001-50)  
**Problema:** Redes sociais existentes não são detectadas

---

## 🐛 PROBLEMAS IDENTIFICADOS

### 1. Capital Social
- ❌ **ANTES:** R$ 5.000.000,00 (multiplicado 1000x)
- ✅ **DEPOIS:** Parser correto implementado (commit `7fe1d6d`)
- 🎯 **ESPERADO:** R$ 5.000,00

### 2. Redes Sociais (CRÍTICO)
- ❌ **ATUAL:** "0% - Nenhuma presença digital encontrada"
- 🔍 **REALIDADE:**
  - Instagram: https://www.instagram.com/kelludy/
  - LinkedIn: https://www.linkedin.com/in/kelludy-festas-570620bb/
- 🎯 **ESPERADO:** Detectar e validar ambas

### 3. Score de Propensão
- ❌ **PESOS EXIBIDOS:** 1.500,0% (multiplicados 100x)
- 🎯 **ESPERADO:** 15,0% ou 15%

---

## 🔍 DIAGNÓSTICO (Em Andamento)

### Hipóteses:
1. **Validação assertiva muito restritiva?**
   - Instagram/LinkedIn podem ter score < 40 (threshold)
   - Sem menção a CNPJ em perfis sociais (esperado)

2. **Busca não está sendo executada?**
   - Timeout na busca?
   - Quota do Google excedida?
   - Erro não logado?

3. **Resultados não estão sendo salvos?**
   - `redesSociais` retornado mas não passado para UI?

### Logs Adicionados (commit `565675f`):
- Params de entrada
- Score de validação por plataforma
- URLs encontradas
- Motivo de aceitação/rejeição

---

## 🎯 PRÓXIMOS PASSOS

### 1. TESTE DIAGNÓSTICO (Aguardando deploy)
**Ação:**
1. Acessar sistema em produção
2. Buscar CNPJ: `34438456000150` (Kelludy)
3. Abrir DevTools → Console
4. Verificar logs:
   ```
   [DigitalPresence] 📱 INICIANDO BUSCA DE REDES SOCIAIS
   [DigitalPresence] 📝 Params: {...}
   [DigitalPresence] 🔍 instagram - Validação: VÁLIDO/REJEITADO
   [DigitalPresence] 📊 instagram - Score: XX% | Reason: ...
   ```

### 2. AJUSTAR VALIDAÇÃO (Se necessário)
Se score < 40 mas link é legítimo:
- Reduzir threshold de 40 para 30
- OU adicionar score +30 para redes sociais (boost)
- OU criar regra especial: "perfil social com nome match = válido"

### 3. HANDLES EXPLÍCITOS (Recomendado)
Permitir que usuário forneça handles conhecidos:
```typescript
// No formulário de busca ou na edição de empresa
socialHandles: {
  instagram: '@kelludy',
  linkedin: 'kelludy-festas-570620bb'
}
```

Tratar como "evidência autoritativa" (confidence: 'A', score: 100)

---

## 📊 CHECKLIST DE VALIDAÇÃO

Após cada correção, testar:

- [ ] Capital exato: R$ 5.000,00
- [ ] Instagram detectado e validado
- [ ] LinkedIn detectado e validado
- [ ] Score presença digital > 0
- [ ] Pesos exibidos corretamente (15% não 1.500,0%)
- [ ] Go/No-Go reflete dados reais

---

**Status:** Aguardando logs de produção para próximo passo

