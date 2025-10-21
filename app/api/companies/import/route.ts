import { NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { normalizeCnpj } from '@/lib/utils/format'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        ok: false,
        error: { message: 'Arquivo CSV ausente' }
      }, { status: 422 })
    }

    const buf = Buffer.from(await file.arrayBuffer())
    const rows = parse(buf.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true
    })

    if (!Array.isArray(rows)) {
      return NextResponse.json({
        ok: false,
        error: { message: 'CSV inválido' }
      }, { status: 422 })
    }

    // Limite de 80 empresas por importação
    const batch = rows.slice(0, 80)
    const results: any[] = []

    console.log(`[Import] Processando ${batch.length} empresas...`)

    for (const r of batch) {
      const cnpj = r.CNPJ ? normalizeCnpj(r.CNPJ) : null
      const body = JSON.stringify({
        cnpj,
        website: r.Website ?? null
      })

      try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/companies/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })

        const json = await res.json()
        
        results.push({
          input: r,
          ok: json.ok,
          error: json?.error?.message ?? null,
          company: json.ok ? json.data.company : null
        })

        console.log(`[Import] ${json.ok ? '✅' : '❌'} ${r.CNPJ || r.Website}`)
      } catch (e: any) {
        results.push({
          input: r,
          ok: false,
          error: e.message,
          company: null
        })
      }

      // Delay para respeitar rate limits
      await new Promise(resolve => setTimeout(resolve, 250))
    }

    const succeeded = results.filter(r => r.ok).length
    const failed = results.filter(r => !r.ok).length

    console.log(`[Import] ✅ Concluído: ${succeeded} sucesso, ${failed} falhas`)

    return NextResponse.json({
      ok: true,
      imported: batch.length,
      succeeded,
      failed,
      results
    })
  } catch (e: any) {
    console.error('[Import] Erro:', e.message)
    return NextResponse.json({
      ok: false,
      error: { message: e.message }
    }, { status: 500 })
  }
}

