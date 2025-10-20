/**
 * HTTP Headers Detection - Tech Stack via Response Headers
 */

interface HeadersResponse {
  url: string
  status: number
  headers: Record<string, string>
  detectedTech: Array<{
    technology: string
    confidence: number
    evidence: string
  }>
}

export async function fetchHeaders(url: string): Promise<HeadersResponse> {
  console.log('[HTTP Headers] 🔍 Analisando:', url)

  try {
    // Garantir protocolo
    const fullUrl = url.startsWith('http') ? url : `https://${url}`

    const response = await fetch(fullUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      redirect: 'follow'
    })

    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })

    console.log('[HTTP Headers] ✅ Headers recebidos:', Object.keys(headers).length)

    // Detectar tecnologias baseado em headers
    const detectedTech = detectTechFromHeaders(headers)

    return {
      url: fullUrl,
      status: response.status,
      headers,
      detectedTech
    }
  } catch (error: any) {
    console.error('[HTTP Headers] ❌ Erro:', error.message)
    throw error
  }
}

function detectTechFromHeaders(headers: Record<string, string>): Array<any> {
  const detected: Array<any> = []

  // Server detection
  if (headers['server']) {
    const server = headers['server'].toLowerCase()
    
    if (server.includes('apache')) {
      detected.push({
        technology: 'Apache HTTP Server',
        confidence: 95,
        evidence: `Server: ${headers['server']}`
      })
    } else if (server.includes('nginx')) {
      detected.push({
        technology: 'Nginx',
        confidence: 95,
        evidence: `Server: ${headers['server']}`
      })
    } else if (server.includes('iis')) {
      detected.push({
        technology: 'Microsoft IIS',
        confidence: 95,
        evidence: `Server: ${headers['server']}`
      })
    }
  }

  // Powered-by detection
  if (headers['x-powered-by']) {
    const poweredBy = headers['x-powered-by'].toLowerCase()
    
    if (poweredBy.includes('php')) {
      detected.push({
        technology: 'PHP',
        confidence: 90,
        evidence: `X-Powered-By: ${headers['x-powered-by']}`
      })
    } else if (poweredBy.includes('asp.net')) {
      detected.push({
        technology: 'ASP.NET',
        confidence: 90,
        evidence: `X-Powered-By: ${headers['x-powered-by']}`
      })
    }
  }

  // CDN detection
  if (headers['cf-ray']) {
    detected.push({
      technology: 'Cloudflare',
      confidence: 100,
      evidence: `CF-Ray: ${headers['cf-ray']}`
    })
  }

  if (headers['x-amz-cf-id']) {
    detected.push({
      technology: 'Amazon CloudFront',
      confidence: 100,
      evidence: 'X-Amz-Cf-Id header present'
    })
  }

  // Framework detection
  if (headers['x-nextjs-cache']) {
    detected.push({
      technology: 'Next.js',
      confidence: 100,
      evidence: 'X-Nextjs-Cache header present'
    })
  }

  console.log('[HTTP Headers] 🎯 Detectadas', detected.length, 'tecnologias')

  return detected
}

