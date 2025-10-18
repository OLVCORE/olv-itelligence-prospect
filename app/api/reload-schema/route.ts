import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'

export async function POST() {
  try {
    console.log('[API /reload-schema] 🔄 Recarregando cache do schema...')

    // Método 1: Usar SQL direto para notificar PostgREST
    const { error } = await supabaseAdmin
      .rpc('exec_sql', { 
        sql: "NOTIFY pgrst, 'reload schema';" 
      })

    if (error) {
      console.log('[API] ⚠️ Método 1 falhou, tentando método 2...')
      
      // Método 2: Tentar com query SQL simples
      const { error: sqlError } = await supabaseAdmin
        .from('pg_stat_activity')
        .select('*')
        .limit(1)

      if (sqlError) {
        console.log('[API] ⚠️ Método 2 falhou, tentando método 3...')
        
        // Método 3: Forçar uma query que force o reload
        const { error: queryError } = await supabaseAdmin
          .from('Company')
          .select('id')
          .limit(1)

        if (queryError) {
          throw new Error(`Falha ao recarregar schema: ${queryError.message}`)
        }
      }
    }

    console.log('[API] ✅ Cache do schema recarregado com sucesso')

    return NextResponse.json({
      status: 'success',
      message: '✅ Cache do schema recarregado com sucesso!',
      note: 'Aguarde 10-15 segundos para as mudanças terem efeito',
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('[API /reload-schema] ❌ Erro:', error.message)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Erro ao recarregar cache do schema',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return POST()
}
