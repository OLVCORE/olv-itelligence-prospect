/**
 * MÓDULO 9 - GaugeBar
 * Barra de indicador visual para scores/confiança
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface GaugeBarProps {
  value: number // 0-100
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  className?: string
}

export function GaugeBar({
  value,
  label,
  showValue = true,
  size = 'md',
  tooltip,
  className,
}: GaugeBarProps) {
  // Normalizar valor entre 0-100
  const normalizedValue = Math.max(0, Math.min(100, value))

  // Determinar cor baseada no valor
  const getColor = (val: number): string => {
    if (val >= 60) return 'bg-green-500' // Verde
    if (val >= 30) return 'bg-yellow-500' // Amarelo
    return 'bg-red-500' // Vermelho
  }

  const getTextColor = (val: number): string => {
    if (val >= 60) return 'text-green-600 dark:text-green-400'
    if (val >= 30) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  // Tamanhos
  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('w-full space-y-1', className)}>
      {/* Label e Valor */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span
              className={cn('font-medium text-slate-700 dark:text-slate-300', textSizes[size])}
              title={tooltip}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span className={cn('font-semibold', textSizes[size], getTextColor(normalizedValue))}>
              {normalizedValue}%
            </span>
          )}
        </div>
      )}

      {/* Barra */}
      <div
        className={cn(
          'w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden',
          heights[size]
        )}
        title={tooltip}
      >
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full', getColor(normalizedValue))}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>

      {/* Tooltip (se fornecido) */}
      {tooltip && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tooltip}</p>
      )}
    </div>
  )
}

