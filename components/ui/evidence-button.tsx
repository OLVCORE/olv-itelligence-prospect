/**
 * EvidenceButton - Botão para exibir evidências de uma informação
 * Conforme Prompt Master: fonte, URL, data de coleta e snippet
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Clock,
  Users
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Evidence, formatCollectedAt } from '@/lib/types/evidence'

interface EvidenceButtonProps {
  evidences: Evidence[]
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'xs'
  className?: string
}

export function EvidenceButton({ 
  evidences, 
  label = 'Ver evidências',
  variant = 'outline',
  size = 'sm',
  className = ''
}: EvidenceButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!evidences || evidences.length === 0) {
    return null
  }

  const getConfidenceBadge = (confidence: Evidence['confidence']) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-600 text-white text-xs">Alta Confiança</Badge>
      case 'medium':
        return <Badge className="bg-yellow-600 text-white text-xs">Média Confiança</Badge>
      case 'low':
        return <Badge className="bg-orange-600 text-white text-xs">Baixa Confiança</Badge>
      case 'none':
        return <Badge className="bg-gray-600 text-white text-xs">Não Validado</Badge>
    }
  }

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'receita_ws':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'google_cse':
      case 'news':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'website':
        return <ExternalLink className="h-4 w-4 text-green-600" />
      case 'social_media':
        return <Users className="h-4 w-4 text-pink-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const highConfidenceCount = evidences.filter(e => e.confidence === 'high').length
  const validatedCount = evidences.filter(e => e.validated).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className}`}
        >
          <FileText className="h-3 w-3" />
          {label}
          <Badge variant="secondary" className="ml-1 text-xs">
            {evidences.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="border-b pb-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Evidências ({evidences.length})
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {validatedCount} validadas • {highConfidenceCount} alta confiança
            </p>
          </div>

          {/* Lista de Evidências */}
          <div className="space-y-3">
            {evidences.map((evidence) => (
              <div 
                key={evidence.id} 
                className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {/* Header da evidência */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(evidence.type)}
                    <span className="text-sm font-medium">{evidence.source}</span>
                  </div>
                  {getConfidenceBadge(evidence.confidence)}
                </div>

                {/* Snippet */}
                {evidence.snippet && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                    "{evidence.snippet}"
                  </p>
                )}

                {/* Validation Score */}
                {evidence.validation_score !== undefined && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Score de Validação:</span>
                      <span className="font-semibold">{evidence.validation_score}/100</span>
                    </div>
                    {evidence.validation_reasons && evidence.validation_reasons.length > 0 && (
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {evidence.validation_reasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Footer com URL e data */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <a
                    href={evidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver fonte
                  </a>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatCollectedAt(evidence.collected_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Todas as evidências são validadas e auditáveis
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Versão compacta - apenas ícone
 */
export function EvidenceIcon({ evidences }: { evidences: Evidence[] }) {
  if (!evidences || evidences.length === 0) return null

  const validatedCount = evidences.filter(e => e.validated).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
          <Shield className="h-3 w-3" />
          <span className="underline">{evidences.length}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Evidências ({evidences.length})</h4>
          {evidences.slice(0, 3).map((evidence) => (
            <div key={evidence.id} className="text-xs border-l-2 border-blue-600 pl-2">
              <p className="font-medium">{evidence.source}</p>
              <p className="text-muted-foreground">{formatCollectedAt(evidence.collected_at)}</p>
            </div>
          ))}
          {evidences.length > 3 && (
            <p className="text-xs text-muted-foreground">
              + {evidences.length - 3} mais evidências
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

