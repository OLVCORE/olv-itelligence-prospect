import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const maxDuration = 5

const schema = z.object({
  companyId: z.string(),
  content: z.any(),
  updatedBy: z.string().optional()
})

/**
 * POST /api/canvas/save
 * Autosave do canvas colaborativo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_INPUT', message: validation.error.issues[0].message }
      }, { status: 422 })
    }

    const { companyId, content, updatedBy } = validation.data
    const sb = supabaseAdmin()
    const now = new Date().toISOString()

    // Upsert CanvasDoc
    const { error } = await sb.from('CanvasDoc').upsert({
      companyId,
      content,
      updatedBy: updatedBy || 'system',
      updatedAt: now
    }, {
      onConflict: 'companyId'
    })

    if (error) {
      console.error('[Canvas] ❌ Erro ao salvar:', error)
      return NextResponse.json({
        ok: false,
        error: { code: 'DATABASE_ERROR', message: 'Erro ao salvar canvas' }
      }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[Canvas] ❌ Erro:', error.message)
    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno' }
    }, { status: 500 })
  }
}

/**
 * GET /api/canvas/save?companyId=xxx
 * Carregar canvas salvo
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_INPUT', message: 'companyId é obrigatório' }
      }, { status: 422 })
    }

    const sb = supabaseAdmin()

    const { data, error } = await sb
      .from('CanvasDoc')
      .select('*')
      .eq('companyId', companyId)
      .maybeSingle()

    if (error) {
      console.error('[Canvas] ❌ Erro ao carregar:', error)
      return NextResponse.json({
        ok: false,
        error: { code: 'DATABASE_ERROR', message: 'Erro ao carregar canvas' }
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      data: data || null
    })
  } catch (error: any) {
    console.error('[Canvas] ❌ Erro:', error.message)
    return NextResponse.json({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno' }
    }, { status: 500 })
  }
}

