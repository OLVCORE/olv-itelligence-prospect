/**
 * Hook simples de toast notifications
 * Para produção, considere usar sonner ou react-hot-toast
 */

import { useState, useCallback } from 'react'

export interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Por enquanto, usar console.log
    // TODO: Implementar toast UI real (Sonner ou react-hot-toast)
    console.log(`[Toast ${options.variant || 'default'}]`, options.title, options.description)
    
    // Fallback para alert (temporário)
    if (typeof window !== 'undefined') {
      const message = options.description 
        ? `${options.title}\n${options.description}`
        : options.title
      
      if (options.variant === 'destructive') {
        console.error(message)
      } else {
        console.log(message)
      }
    }
  }, [])

  return { toast }
}

