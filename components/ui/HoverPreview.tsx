'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, DollarSign, Calendar, TrendingUp } from 'lucide-react'

interface HoverPreviewProps {
  children: React.ReactNode
  data: {
    name: string
    tradeName?: string
    cnpj?: string
    capital?: number
    porte?: string
    status?: string
    city?: string
    state?: string
    createdAt?: string
  }
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function HoverPreview({ children, data, side = 'right' }: HoverPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  function handleMouseEnter() {
    // Delay de 300ms para evitar preview acidental
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        
        // Calcular posição baseado no lado
        let x = rect.right + 10
        let y = rect.top
        
        if (side === 'left') {
          x = rect.left - 320 // 320 = largura do preview
        } else if (side === 'top') {
          x = rect.left
          y = rect.top - 10
        } else if (side === 'bottom') {
          x = rect.left
          y = rect.bottom + 10
        }

        setPosition({ x, y })
        setIsVisible(true)
      }
    }, 300)
  }

  function handleMouseLeave() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          <Card className="w-80 shadow-2xl border-2 dark:bg-slate-800 dark:border-slate-700 animate-in fade-in slide-in-from-left-2 duration-200">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div>
                <h3 className="font-bold text-lg dark:text-white line-clamp-2">
                  {data.tradeName || data.name}
                </h3>
                {data.tradeName && data.name !== data.tradeName && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.name}
                  </p>
                )}
              </div>

              {/* Status */}
              {data.status && (
                <Badge 
                  variant={data.status === 'ATIVA' || data.status === 'Ativo' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  {data.status}
                </Badge>
              )}

              {/* Informações */}
              <div className="space-y-2 text-sm">
                {data.cnpj && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      CNPJ: {data.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                    </span>
                  </div>
                )}

                {(data.city || data.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      {[data.city, data.state].filter(Boolean).join(' - ')}
                    </span>
                  </div>
                )}

                {data.capital !== undefined && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      Capital: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(data.capital)}
                    </span>
                  </div>
                )}

                {data.porte && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      Porte: {data.porte}
                    </span>
                  </div>
                )}

                {data.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">
                      Cadastrado: {new Date(data.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

