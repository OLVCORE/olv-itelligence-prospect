/**
 * MÓDULO 9 - GaugePointer
 * Ponteiro circular para scores/confiança (estilo velocímetro)
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface GaugePointerProps {
  value: number // 0-100
  label?: string
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  className?: string
}

export function GaugePointer({
  value,
  label,
  size = 'md',
  tooltip,
  className,
}: GaugePointerProps) {
  // Normalizar valor entre 0-100
  const normalizedValue = Math.max(0, Math.min(100, value))

  // Calcular ângulo (0° = vermelho à esquerda, 180° = verde à direita)
  const angle = (normalizedValue / 100) * 180 - 90 // -90° a +90°

  // Determinar cor baseada no valor
  const getColor = (val: number): string => {
    if (val >= 60) return 'text-green-500'
    if (val >= 30) return 'text-yellow-500'
    return 'text-red-500'
  }

  // Tamanhos
  const sizes = {
    sm: 'w-24 h-12',
    md: 'w-32 h-16',
    lg: 'w-40 h-20',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)} title={tooltip}>
      {/* Gauge (semi-círculo) */}
      <div className={cn('relative', sizes[size])}>
        {/* Background arc (cinza) */}
        <svg
          className="w-full h-full"
          viewBox="0 0 100 50"
          style={{ overflow: 'visible' }}
        >
          {/* Arco de fundo */}
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-700"
          />

          {/* Marcadores de faixa */}
          {/* Vermelho (0-30) */}
          <path
            d="M 10 45 A 40 40 0 0 1 33.6 14.64"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-red-200 dark:text-red-900"
            opacity="0.5"
          />
          {/* Amarelo (30-60) */}
          <path
            d="M 33.6 14.64 A 40 40 0 0 1 66.4 14.64"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-yellow-200 dark:text-yellow-900"
            opacity="0.5"
          />
          {/* Verde (60-100) */}
          <path
            d="M 66.4 14.64 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-green-200 dark:text-green-900"
            opacity="0.5"
          />

          {/* Ponteiro */}
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={cn('transition-transform duration-500', getColor(normalizedValue))}
            style={{
              transformOrigin: '50px 45px',
              transform: `rotate(${angle}deg)`,
            }}
          />

          {/* Centro do ponteiro */}
          <circle
            cx="50"
            cy="45"
            r="3"
            fill="currentColor"
            className={getColor(normalizedValue)}
          />
        </svg>

        {/* Valor numérico */}
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn('font-bold', textSizes[size], getColor(normalizedValue))}>
            {normalizedValue}
          </span>
        </div>
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
          {label}
        </span>
      )}

      {/* Tooltip */}
      {tooltip && (
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
          {tooltip}
        </p>
      )}
    </div>
  )
}

