/**
 * MÓDULO 9 - SmartTooltip
 * Tooltip inteligente com informações contextuais sobre scores
 */

import React from 'react'
import { cn } from '@/lib/utils'

interface SmartTooltipProps {
  score: number
  type: 'propensao' | 'confianca' | 'maturidade' | 'vendor-match' | 'custom'
  customLabel?: string
  customDescription?: string
  children: React.ReactNode
  className?: string
}

export function SmartTooltip({
  score,
  type,
  customLabel,
  customDescription,
  children,
  className,
}: SmartTooltipProps) {
  const getTooltipInfo = () => {
    switch (type) {
      case 'propensao':
        return {
          label: 'Score de Propensão',
          description: score >= 80 
            ? 'Alta probabilidade de compra - empresa em momento de crescimento'
            : score >= 60 
            ? 'Boa propensão - empresa com potencial de investimento'
            : score >= 40
            ? 'Propensão moderada - empresa estável'
            : 'Baixa propensão - empresa conservadora'
        }
      
      case 'confianca':
        return {
          label: 'Nível de Confiança',
          description: score >= 80 
            ? 'Alta confiança - dados validados e recentes'
            : score >= 60 
            ? 'Boa confiança - dados consistentes'
            : score >= 40
            ? 'Confiança moderada - dados parciais'
            : 'Baixa confiança - dados limitados'
        }
      
      case 'maturidade':
        return {
          label: 'Maturidade Digital',
          description: score >= 80 
            ? 'Alta maturidade - empresa digitalizada e inovadora'
            : score >= 60 
            ? 'Boa maturidade - empresa com presença digital sólida'
            : score >= 40
            ? 'Maturidade moderada - empresa em transição digital'
            : 'Baixa maturidade - empresa tradicional'
        }
      
      case 'vendor-match':
        return {
          label: 'Fit Comercial',
          description: score >= 80 
            ? 'Excelente fit - empresa ideal para nossos produtos'
            : score >= 60 
            ? 'Bom fit - empresa com potencial comercial'
            : score >= 40
            ? 'Fit moderado - empresa pode se beneficiar'
            : 'Baixo fit - empresa não é prioridade'
        }
      
      case 'custom':
        return {
          label: customLabel || 'Score',
          description: customDescription || `Score de ${score}/100`
        }
      
      default:
        return {
          label: 'Score',
          description: `Score de ${score}/100`
        }
    }
  }

  const { label, description } = getTooltipInfo()

  return (
    <div 
      className={cn('group relative inline-block', className)}
      title={`${label}: ${description}`}
    >
      {children}
      
      {/* Tooltip visual */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
        <div className="font-semibold">{label}</div>
        <div className="text-xs mt-1">{description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  )
}
