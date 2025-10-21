import { NextResponse } from 'next/server'
import { sendReport } from '@/lib/mailer'

export const runtime = 'nodejs'
export const maxDuration = 10

export async function POST(req: Request) {
  try {
    const { to, pdfBase64, companyName } = await req.json()

    if (!to || !pdfBase64 || !companyName) {
      return NextResponse.json({
        ok: false,
        error: { message: 'to, pdfBase64 e companyName são obrigatórios' }
      }, { status: 422 })
    }

    await sendReport(
      to,
      `Relatório: ${companyName}`,
      pdfBase64,
      companyName
    )

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[SendReport] Erro:', e.message)
    return NextResponse.json({
      ok: false,
      error: { message: e.message }
    }, { status: 500 })
  }
}

