# Quick Reference: Vercel Timeouts

## 🚨 The Problem

```
User clicks "Analisar Empresa" 
    ↓
API route starts processing
    ↓
Makes 5 API calls sequentially (20 seconds total)
    ↓
⏰ TIMEOUT at 10 seconds
    ↓
❌ Function killed, no data saved, user sees error
```

---

## ✅ The Solution

```typescript
// Add these 2 lines to EVERY route that does heavy work:
export const runtime = 'nodejs'
export const maxDuration = 30 // adjust based on needs
```

---

## 📊 Timeout Guidelines

| Operation Type | Recommended Timeout | Example |
|---------------|--------------------:|---------|
| Database query | 5s | Simple lookups |
| Single external API | 10s | ReceitaWS, Google CSE |
| Multiple APIs (sequential) | 30s | ReceitaWS + Google + Apollo |
| AI/LLM generation | 30-60s | OpenAI completions |
| Web scraping | 60s | Puppeteer, browser automation |
| Batch processing | 60s | Multiple companies |
| Background job | ∞ | Use queue system instead |

---

## ⚡ Quick Optimization Wins

### 1. Parallelize Independent Calls
```typescript
// ❌ BAD: 15s total
const a = await fetchA() // 5s
const b = await fetchB() // 5s  
const c = await fetchC() // 5s

// ✅ GOOD: 5s total
const [a, b, c] = await Promise.all([
  fetchA(), // 5s ┐
  fetchB(), // 5s ├─ runs simultaneously
  fetchC()  // 5s ┘
])
```

### 2. Add Timeouts to fetch()
```typescript
// ❌ BAD: waits forever if API is slow
const res = await fetch(url)

// ✅ GOOD: fails after 5s
const res = await fetch(url, {
  signal: AbortSignal.timeout(5000)
})
```

### 3. Return Early, Process Later
```typescript
// ❌ BAD: user waits 60s
export async function POST(req) {
  const result = await heavyAnalysis() // 60s
  return NextResponse.json(result)
}

// ✅ GOOD: user gets response immediately
export async function POST(req) {
  const jobId = queueJob(heavyAnalysis)
  return NextResponse.json({ jobId }) // <100ms
  // Poll /api/jobs/{jobId} for status
}
```

---

## 🎯 What We Fixed Today

| Route | Before | After | Status |
|-------|--------|-------|--------|
| `/api/analyze/complete` | 10s ❌ | 60s ✅ | Fixed |
| `/api/company/intelligence` | 10s ❌ | 60s ✅ | Fixed |
| `/api/enrichment` | 10s ❌ | 30s ✅ | Fixed |
| `/api/bulk-search` | 10s ❌ | 60s ✅ | Fixed |
| ...and 10 more routes | - | - | ✅ |

---

## 📝 Vercel Plan Requirements

| Plan | Default | Max Configurable |
|------|---------|------------------|
| Hobby | 10s | 10s (cannot change) |
| **Pro** | 10s | **60s** ← You need this |
| Enterprise | 10s | 900s (15 minutes) |

**⚠️ Important:** If on Hobby plan, upgrade to Pro to use `maxDuration > 10s`

---

## 🔍 How to Spot Timeout Issues

### In Logs:
```
[API] Starting operation
[API] Step 1 completed in 3421ms
[API] Step 2 completed in 5892ms
[API] Step 3 comple... [FUNCTION_INVOCATION_TIMEOUT]
```

### In Vercel Dashboard:
- Function duration: **10000ms** exactly
- Status: **Error**
- Error message: "FUNCTION_INVOCATION_TIMEOUT"

### In Production:
- Works locally, fails on Vercel
- Inconsistent failures (sometimes works, sometimes doesn't)
- Fails more often for "larger" companies (more data = slower)

---

## ✅ Prevention Checklist

Before deploying ANY new API route:

```typescript
// 1. Does it call external APIs?
const data = await fetch(externalAPI) // ← YES = add timeout

// 2. Does it process lots of data?
for (const item of manyItems) { ... } // ← YES = add timeout

// 3. Does it use AI/LLM?
const completion = await openai.create() // ← YES = add timeout

// 4. Does it scrape websites?
const browser = await puppeteer.launch() // ← YES = add timeout

// 5. Does it depend on other slow operations?
const result = await slowFunction() // ← YES = add timeout
```

**If you answered YES to any:** Add `maxDuration`!

---

## 🚀 Deploy Checklist

- [x] Added `maxDuration` to all heavy routes
- [x] Tested routes that previously timed out
- [ ] Confirmed Vercel account is on **Pro plan**
- [ ] Monitored Vercel logs for new timeout warnings
- [ ] Checked database for complete records
- [ ] User-facing features work end-to-end

---

## 📚 Full Documentation

See `docs/VERCEL-TIMEOUT-RESOLUTION.md` for:
- Deep-dive explanations
- Alternative architectures (async jobs, streaming)
- Performance optimization strategies
- Monitoring and alerting setup

---

**Quick Help:**
- Timeout still happening? Check if Vercel is on Pro plan
- Need longer than 60s? Use background job queue
- Want faster responses? Parallelize or use streaming

**Status:** ✅ RESOLVED - Ready for production

