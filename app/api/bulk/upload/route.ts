import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj'

export const runtime = 'nodejs'
export const maxDuration = 30 // Upload + validação: 30s

const schema = z.object({
  items: z.array(z.object({
    cnpj: z.string().optional(),
    website: z.string().optional(),
    name: z.string().optional()
  })).max(100, "Máximo 100 empresas por upload")
})

/**
 * POST /api/bulk/upload
 * Upload de CSV para processamento em massa
 * 
 * Limite: 100 empresas
 * Processamento: lotes de 50 com concorrência 5
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await req.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error.issues[0].message
        }
      }, { status: 422 })
    }

    const { items } = validation.data
    const sb = supabaseAdmin()

    console.log('[BulkUpload] 📤 Upload iniciado:', items.length, 'empresas')

    // Validar e normalizar itens
    const validatedItems = []
    const errors = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      // Priorizar CNPJ
      if (item.cnpj) {
        const normalized = normalizeCnpj(item.cnpj)
        
        if (!isValidCnpj(normalized)) {
          errors.push({
            line: i + 1,
            error: 'CNPJ inválido',
            data: item
          })
          continue
        }

        validatedItems.push({
          cnpj: normalized,
          website: item.website || null,
          name: item.name || null,
          status: 'pending'
        })
      } else if (item.website) {
        // TODO: Implementar busca por website
        errors.push({
          line: i + 1,
          error: 'Busca por website não implementada ainda. Forneça CNPJ.',
          data: item
        })
      } else {
        errors.push({
          line: i + 1,
          error: 'CNPJ ou website obrigatório',
          data: item
        })
      }
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({
        ok: false,
        error: {
          code: 'NO_VALID_ITEMS',
          message: 'Nenhum item válido encontrado',
          errors
        }
      }, { status: 422 })
    }

    // Criar job no banco
    const now = new Date().toISOString()
    const jobId = `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const { error: jobError } = await sb.from('BulkJobs').insert({
      id: jobId,
      total: validatedItems.length,
      processed: 0,
      succeeded: 0,
      failed: 0,
      status: 'queued',
      createdAt: now,
      updatedAt: now
    })

    if (jobError) {
      console.error('[BulkUpload] ❌ Erro ao criar job:', jobError)
      return NextResponse.json({
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar job'
        }
      }, { status: 500 })
    }

    // Criar itens do job
    const bulkItems = validatedItems.map((item, index) => ({
      jobId,
      index,
      cnpj: item.cnpj,
      website: item.website,
      name: item.name,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    }))

    const { error: itemsError } = await sb.from('BulkItems').insert(bulkItems)

    if (itemsError) {
      console.error('[BulkUpload] ❌ Erro ao criar itens:', itemsError)
      
      // Deletar job se falhou
      await sb.from('BulkJobs').delete().eq('id', jobId)
      
      return NextResponse.json({
        ok: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erro ao criar itens do job'
        }
      }, { status: 500 })
    }

    // Iniciar processamento em background
    // A implementação real seria usando uma fila (ex: BullMQ, Redis Queue)
    // Por enquanto, apenas criar o job e retornar
    // O processamento será feito via polling do frontend ou worker separado

    const latency = Date.now() - startTime
    console.log(`[BulkUpload] ✅ Job criado em ${latency}ms - ID: ${jobId}`)

    return NextResponse.json({
      ok: true,
      data: {
        jobId,
        total: validatedItems.length,
        errors: errors.length > 0 ? errors : undefined,
        latency
      }
    })

  } catch (error: any) {
    const latency = Date.now() - startTime
    console.error(`[BulkUpload] ❌ Erro em ${latency}ms:`, error.message)

    return NextResponse.json({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
      }
    }, { status: 500 })
  }
}

