# Vercel Function Invocation Timeout - Complete Resolution Guide

## ✅ 1. THE FIX - What We Changed

### Routes Fixed (14 total)
I've added `maxDuration` configurations to all API routes performing heavy operations:

```typescript
// Pattern applied:
export const runtime = 'nodejs'
export const maxDuration = XX // seconds
```

#### Fixed Routes Summary:
| Route | maxDuration | Reason |
|-------|-------------|---------|
| `/api/analyze/complete` | 60s | Multiple sequential API calls (Google, Hunter, OpenAI, Intelligence Engine) |
| `/api/company/intelligence` | 60s | Sales Navigator scraping + contact enrichment (multiple people) |
| `/api/companies/enrich` | 60s | Apollo + HTTP Headers + Social Media + Maturity calculation |
| `/api/bulk-search` | 60s | Processes multiple companies in batch |
| `/api/reports/generate` | 60s | AI report generation with OpenAI (long prompts) |
| `/api/analyze/route` | 30s | RealAnalysisEngine with database queries |
| `/api/ai-analysis` | 30s | AI classification (ICP + Propensity + Insights) |
| `/api/enrichment` | 30s | Multiple enrichment operations (cadastral, domain, tech stack, DNS, contacts) |
| `/api/playbook/generate` | 30s | Personalized playbook generation |
| `/api/persona/analyze` | 30s | Network scanning + NLP classification |
| `/api/identity/resolve` | 20s | Identity resolution across multiple platforms |
| `/api/tech-stack` | 20s | Tech stack detection with external API calls |
| `/api/analyze/simple` | 15s | ReceitaWS + basic analysis |
| `/api/maturity` | 15s | Maturity score calculation |

### Already Had Timeouts (Good ✅):
- `/api/companies/search` - 5s (quick CNPJ lookup)
- `/api/preview/deep-scan` - 30s (deep scan with TOTVS detection)
- `/api/opportunities/match` - 10s (vendor matching)

---

## 🧠 2. ROOT CAUSE ANALYSIS - What Actually Happened

### The Problem Chain:

#### **What the code was doing:**
```typescript
// ❌ BEFORE (in /api/analyze/complete):
export async function POST(req: NextRequest) {
  // No maxDuration set = default 10s timeout on Vercel
  
  const webData = await googleSearch.searchCompany(...)        // ~2-3s
  const techStackWeb = await googleSearch.searchTechStack(...) // ~2-3s
  const emailData = await hunter.searchEmails(...)             // ~3-5s
  const analysis = await engine.analyzeCompany(...)            // ~5-10s
  const aiInsights = await openai.analyzeCompany(...)          // ~5-15s
  
  // TOTAL: 17-36 seconds (way over 10s limit!)
}
```

#### **What was happening in production:**
1. User clicks "Analisar Empresa" in your dashboard
2. Frontend calls `/api/analyze/complete` or `/api/company/intelligence`
3. Route starts executing sequential API calls:
   - ReceitaWS (Brazil federal data) - 2-3s
   - Google CSE (website search) - 2-3s
   - Hunter.io (email discovery) - 3-5s
   - OpenAI (AI insights generation) - 5-15s
   - Sales Navigator scraping - 10-30s (if enabled)
4. **At 10 seconds**: Vercel kills the function
5. User sees error, no data is saved, analysis incomplete

### **The Misconception:**
You assumed **Vercel would wait as long as needed** for your function to complete, like a traditional server.

**Reality:** Vercel Serverless Functions have **hard timeouts** to protect infrastructure:
- **Hobby Plan**: 10 seconds (non-configurable)
- **Pro Plan**: 10 seconds default, **configurable up to 60s** via `maxDuration`
- **Enterprise**: Up to 15 minutes

### **Why This Error Occurred:**
1. **Sequential execution** without parallelization → operations stacked (20+ seconds)
2. **No timeout configuration** → defaulted to 10s
3. **External API dependencies** → unpredictable latency (network, rate limits, API slowness)
4. **No timeout handling** in external calls → waited indefinitely for responses

---

## 📚 3. THE UNDERLYING CONCEPT - Why Timeouts Exist

### **Serverless Architecture Philosophy:**

#### Traditional Servers (EC2, VPS):
```
┌─────────────────────┐
│   Your Server       │
│   - Always running  │──→ Can run for hours
│   - Dedicated RAM   │──→ You pay 24/7
│   - Full control    │──→ You manage everything
└─────────────────────┘
```

#### Serverless Functions (Vercel, AWS Lambda):
```
┌────────────────────────┐
│   Cold Start (0-500ms) │
│   ↓                    │
│   Your Function        │──→ Runs ONLY on request
│   ↓                    │──→ Pay per execution
│   Timeout or Complete  │──→ Provider manages infrastructure
│   ↓                    │
│   Destroyed            │
└────────────────────────┘
```

### **Why Timeouts Protect You:**

1. **Cost Control**: 
   - Without limits, a stuck function could run indefinitely
   - One buggy API call could cost thousands of dollars
   - Example: Infinite retry loop against a dead API = $$$

2. **Resource Fairness**:
   - Serverless platforms are **multi-tenant**
   - Your function shares infrastructure with thousands of others
   - Long-running functions hog resources, degrading service for everyone

3. **Failure Detection**:
   - If a function takes too long, something is likely **wrong**
   - Better to fail fast and alert you than wait forever
   - Forces you to design for **observable, bounded operations**

4. **User Experience**:
   - Users won't wait 5 minutes for a page to load
   - Timeout forces you to implement:
     - ✅ Async jobs (background processing)
     - ✅ Progress indicators
     - ✅ Streaming responses
     - ✅ Optimistic UI updates

### **The Mental Model:**

Think of serverless functions as **ephemeral workers**:
- They wake up when called
- Do ONE specific task quickly
- Go back to sleep
- They are NOT long-running background processes

**Design Pattern:**
```
User Action → API Route (fast, <10s) → Queue Job → Background Worker (slow, minutes)
                      ↓
                 Return immediately with job ID
                      ↓
                 Frontend polls for status
```

---

## 🚨 4. WARNING SIGNS - How to Recognize This Pattern

### **Red Flags in Your Code:**

#### 🔴 **Sequential External API Calls**
```typescript
// ⚠️ DANGER: Each call adds 2-5s
const result1 = await externalAPI1()  // 3s
const result2 = await externalAPI2()  // 4s  → TOTAL: 7s
const result3 = await externalAPI3()  // 5s  → TOTAL: 12s (TIMEOUT!)
```

**Fix:** Parallelize independent calls
```typescript
// ✅ SAFE: Executes in parallel, ~5s total
const [result1, result2, result3] = await Promise.all([
  externalAPI1(),  // 3s ┐
  externalAPI2(),  // 4s ├─ concurrent (max = 5s)
  externalAPI3()   // 5s ┘
])
```

#### 🔴 **Web Scraping / Puppeteer**
```typescript
// ⚠️ DANGER: Puppeteer is SLOW (10-30s+)
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto(url)              // 5-10s
await page.waitForSelector(...)   // 2-5s
const data = await page.evaluate() // 1-2s
```

**Fix:** Use external scraping services (PhantomBuster, Apify) or move to background jobs

#### 🔴 **No Timeout on fetch() Calls**
```typescript
// ⚠️ DANGER: If API is slow, waits forever
const response = await fetch(url)

// ✅ SAFE: Fails after 5s
const response = await fetch(url, {
  signal: AbortSignal.timeout(5000)
})
```

#### 🔴 **Large Dataset Processing**
```typescript
// ⚠️ DANGER: Processing 500 items can take minutes
for (const item of items) {        // 500 items
  await processItem(item)          // 100ms each = 50s (TIMEOUT!)
}
```

**Fix:** Batch processing or pagination
```typescript
// ✅ SAFE: Process 10 at a time
const batches = chunk(items, 10)
for (const batch of batches) {
  await Promise.all(batch.map(processItem))
  // Save checkpoint for resumption
}
```

#### 🔴 **AI/LLM Calls Without Timeouts**
```typescript
// ⚠️ DANGER: OpenAI can take 30s+ for long prompts
const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...veryLongContext] // 5000 tokens = 15-30s
})
```

**Fix:** Stream responses or use background jobs
```typescript
// ✅ SAFE: Stream and return partial results
const stream = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  stream: true  // Returns chunks as they arrive
})
```

### **When to Suspect Timeouts:**

| Symptom | Likely Cause |
|---------|--------------|
| Function works locally, fails in production | Vercel timeout (local has no limit) |
| Fails after exactly 10 seconds | Default Vercel timeout |
| Works for some companies, fails for others | Variable API latency (company with more data = slower) |
| Logs stop mid-execution | Function killed by timeout |
| "FUNCTION_INVOCATION_TIMEOUT" error | You've hit the timeout limit |
| Works in Vercel dev, fails in production | Dev has relaxed limits |

### **Monitoring Best Practices:**

```typescript
// ✅ ALWAYS log timing
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  console.log('[API] Starting operation')
  
  try {
    const step1Start = Date.now()
    await externalAPI1()
    console.log(`[API] Step 1 completed in ${Date.now() - step1Start}ms`)
    
    const step2Start = Date.now()
    await externalAPI2()
    console.log(`[API] Step 2 completed in ${Date.now() - step2Start}ms`)
    
    const totalLatency = Date.now() - startTime
    console.log(`[API] ✅ Total latency: ${totalLatency}ms`)
    
    // Alert if approaching timeout
    if (totalLatency > 8000) {
      console.warn('[API] ⚠️ Approaching timeout threshold!')
    }
    
    return NextResponse.json({ success: true, latency: totalLatency })
  } catch (error) {
    const latency = Date.now() - startTime
    console.error(`[API] ❌ Failed after ${latency}ms:`, error)
    throw error
  }
}
```

---

## 🔄 5. ALTERNATIVE APPROACHES - Trade-offs & Best Practices

### **Approach A: Increase Timeout (What We Did)**

**When to use:**
- Simple, immediate fix
- Total operation time < 60s
- Operations are atomic (must complete together)

**Pros:**
- ✅ Easy to implement (add 2 lines of code)
- ✅ No architecture changes needed
- ✅ Works for 80% of cases

**Cons:**
- ❌ Still has a ceiling (60s on Pro, 10s on Hobby)
- ❌ Ties up function for entire duration (not scalable)
- ❌ User waits entire time (poor UX for 30s+)

**Code:**
```typescript
export const maxDuration = 60
```

---

### **Approach B: Async/Background Jobs (Recommended for Long Operations)**

**When to use:**
- Operation takes > 30 seconds
- Multiple independent sub-tasks
- User doesn't need immediate results

**Architecture:**
```
┌──────────┐      ┌─────────────┐      ┌──────────────┐
│  User    │─────▶│  API Route  │─────▶│  Job Queue   │
│          │      │  (returns   │      │  (Redis/SQS) │
│          │      │   job ID)   │      └──────┬───────┘
│          │      └─────────────┘             │
│          │            ▲                     │
│          │            │                     ▼
│          │      ┌─────┴────────┐    ┌──────────────┐
│  Polls   │◀─────│  Status API  │◀───│   Worker     │
│  Status  │      └──────────────┘    │  (processes  │
└──────────┘                           │   async)     │
                                       └──────────────┘
```

**Implementation with Vercel + Upstash (Redis):**

```typescript
// 1. Queue the job (fast, <1s)
export async function POST(req: NextRequest) {
  const { companyId } = await req.json()
  
  const jobId = `analysis_${companyId}_${Date.now()}`
  
  // Store job metadata
  await redis.set(jobId, JSON.stringify({
    status: 'queued',
    companyId,
    createdAt: new Date().toISOString()
  }))
  
  // Trigger background worker (webhook, cron, or direct call)
  await fetch(`${process.env.WORKER_URL}/process`, {
    method: 'POST',
    body: JSON.stringify({ jobId, companyId })
  })
  
  return NextResponse.json({ jobId })
}

// 2. Status endpoint (fast, <100ms)
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  const job = await redis.get(jobId)
  return NextResponse.json(JSON.parse(job))
}

// 3. Worker function (separate endpoint, maxDuration: 300s)
export const maxDuration = 300 // 5 minutes on Enterprise
export async function POST(req: NextRequest) {
  const { jobId, companyId } = await req.json()
  
  // Update status
  await redis.set(jobId, JSON.stringify({ status: 'processing' }))
  
  try {
    // Do heavy work
    const result = await longRunningAnalysis(companyId)
    
    // Update with result
    await redis.set(jobId, JSON.stringify({
      status: 'completed',
      result,
      completedAt: new Date().toISOString()
    }))
  } catch (error) {
    await redis.set(jobId, JSON.stringify({
      status: 'failed',
      error: error.message
    }))
  }
}
```

**Frontend Integration:**
```typescript
// Submit job
const { jobId } = await fetch('/api/analyze', { method: 'POST', ... })

// Poll for status
const pollStatus = async () => {
  const { status, result } = await fetch(`/api/analyze/status?jobId=${jobId}`)
  
  if (status === 'completed') {
    showResults(result)
  } else if (status === 'failed') {
    showError()
  } else {
    // Poll again in 2s
    setTimeout(pollStatus, 2000)
  }
}
pollStatus()
```

**Pros:**
- ✅ No timeout limits (workers can run for hours if needed)
- ✅ User gets immediate feedback
- ✅ Can show progress (e.g., "Analyzed 3/10 steps")
- ✅ Resilient (can retry failed steps)
- ✅ Scalable (multiple workers in parallel)

**Cons:**
- ❌ More complex architecture
- ❌ Needs queue infrastructure (Redis, AWS SQS, etc.)
- ❌ Frontend needs polling or WebSocket logic

---

### **Approach C: Parallelization (Best for Independent Operations)**

**Before (Sequential - 15s total):**
```typescript
const receita = await fetchReceitaWS(cnpj)        // 5s
const google = await fetchGoogleCSE(company.name) // 5s
const apollo = await fetchApollo(domain)          // 5s
// TOTAL: 15 seconds
```

**After (Parallel - 5s total):**
```typescript
const [receita, google, apollo] = await Promise.allSettled([
  fetchReceitaWS(cnpj),        // 5s ┐
  fetchGoogleCSE(company.name), // 5s ├─ concurrent
  fetchApollo(domain)           // 5s ┘
])
// TOTAL: 5 seconds (fastest operation)

// Handle individual failures gracefully
const receitaData = receita.status === 'fulfilled' ? receita.value : null
```

**When to use:**
- Operations don't depend on each other
- Willing to accept partial failures (some APIs succeed, others fail)

**Pros:**
- ✅ Dramatic speed improvement (3-5x faster)
- ✅ Simple to implement
- ✅ Works within existing architecture

**Cons:**
- ❌ Only works for independent operations
- ❌ Need to handle partial failures
- ❌ May hit rate limits faster (all APIs called simultaneously)

---

### **Approach D: Streaming Responses (Advanced)**

**For AI/LLM outputs:**
```typescript
// Server (stream chunks as they arrive)
export async function POST(req: NextRequest) {
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  
  // Start OpenAI streaming
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...],
    stream: true
  })
  
  // Write chunks to client as they arrive
  for await (const chunk of completion) {
    await writer.write(new TextEncoder().encode(
      `data: ${JSON.stringify(chunk)}\n\n`
    ))
  }
  
  await writer.close()
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

**Frontend (consume stream):**
```typescript
const response = await fetch('/api/analyze', { method: 'POST' })
const reader = response.body.getReader()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = new TextDecoder().decode(value)
  updateUI(chunk) // Show partial results immediately
}
```

**Pros:**
- ✅ User sees results immediately (no waiting)
- ✅ Feels faster (progressive enhancement)
- ✅ Works within timeout limits (connection stays open)

**Cons:**
- ❌ Complex implementation
- ❌ Not all operations support streaming
- ❌ Need to handle connection interruptions

---

## 🎯 RECOMMENDATION FOR YOUR PROJECT

### **Current State (After Our Fix):**
✅ All routes have appropriate `maxDuration` values
✅ Should eliminate immediate timeout errors

### **Next Steps (Future Optimization):**

#### **Immediate (Keep as-is):**
- Routes with `maxDuration: 5-15s` → **Keep synchronous**
- Simple operations (ReceitaWS, quick searches)

#### **Short-term (Parallelize):**
- `/api/companies/search` → Run ReceitaWS + Google CSE in parallel
- `/api/enrichment` → Parallelize apollo + httpHeaders + socialMedia

#### **Long-term (Background Jobs):**
- `/api/analyze/complete` → Move to async job queue
- `/api/company/intelligence` → Sales Navigator scraping in background
- `/api/bulk-search` → Process companies in batches via queue

#### **Monitoring:**
Add latency tracking to all routes:
```typescript
if (latency > maxDuration * 0.8) {
  console.warn(`⚠️ Route approaching timeout: ${latency}ms / ${maxDuration * 1000}ms`)
  // Send alert to Sentry/Datadog
}
```

---

## 📊 PERFORMANCE TARGETS

| Operation Type | Target Latency | Max Timeout | Strategy |
|---------------|----------------|-------------|----------|
| CNPJ Lookup | < 3s | 5s | Sync + cache |
| Basic Enrichment | < 10s | 15s | Sync + parallel |
| Full Analysis | < 30s | 60s | Sync + parallel |
| Bulk Processing | N/A | N/A | Async jobs |
| AI Report Gen | N/A | N/A | Async jobs + streaming |
| Web Scraping | N/A | N/A | External service + queue |

---

## ✅ CHECKLIST - Prevent Future Timeouts

Before deploying any new API route, verify:

- [ ] Route has `export const maxDuration = XX` configured
- [ ] Timeout value is > expected latency (with 30% buffer)
- [ ] External API calls have their own timeouts (AbortSignal)
- [ ] Independent operations are parallelized (Promise.all)
- [ ] Logging includes timing for each step
- [ ] Error handling doesn't silently fail
- [ ] Long operations (>30s) use background jobs
- [ ] Vercel plan supports your maxDuration (60s = Pro required)

---

## 🔗 RESOURCES

- [Vercel Function Timeout Docs](https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration)
- [Vercel Error: FUNCTION_INVOCATION_TIMEOUT](https://vercel.com/docs/errors/FUNCTION_INVOCATION_TIMEOUT)
- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [MDN: AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static)
- [Upstash (Redis for queues)](https://upstash.com/)
- [Vercel Cron Jobs (for background workers)](https://vercel.com/docs/cron-jobs)

---

**Last Updated:** 2025-10-20  
**Status:** ✅ All routes configured, production-ready

