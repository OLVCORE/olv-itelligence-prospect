import { createClient } from '@supabase/supabase-js'
import { useEffect, useCallback } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function useRealtimeCanvas(
  canvasId: string,
  onChange: (payload: any) => void
) {
  useEffect(() => {
    const channel = supabase
      .channel(`canvas:${canvasId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Canvas',
          filter: `id=eq.${canvasId}`,
        },
        (payload) => {
          console.log('[Canvas Realtime] Mudança:', payload)
          onChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [canvasId, onChange])

  const saveCanvas = useCallback(
    async (content: any) => {
      try {
        const { error } = await supabase
          .from('Canvas')
          .upsert({
            id: canvasId,
            content,
            updatedAt: new Date().toISOString(),
          })

        if (error) throw error
        console.log('[Canvas] Salvo com sucesso')
      } catch (e: any) {
        console.error('[Canvas] Erro ao salvar:', e.message)
      }
    },
    [canvasId]
  )

  return { saveCanvas }
}

