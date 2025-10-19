/**
 * MÓDULO 9 - SocialDisambiguationModal
 * Modal para desambiguação quando múltiplos perfis sociais são encontrados
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, AlertTriangle } from 'lucide-react'

interface SocialCandidate {
  platform: string
  handle: string
  url: string
  score: number
  confidence: 'high' | 'medium' | 'low'
  reasons: string[]
  snippet?: string
}

interface SocialDisambiguationModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (candidate: SocialCandidate) => void
  platform: string
  candidates: SocialCandidate[]
  companyName: string
}

export function SocialDisambiguationModal({
  isOpen,
  onClose,
  onSelect,
  platform,
  candidates,
  companyName,
}: SocialDisambiguationModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleSelect = () => {
    if (selectedId !== null && candidates[selectedId]) {
      onSelect(candidates[selectedId])
      onClose()
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <Badge className="bg-green-500">Alta Confiança</Badge>
      case 'medium':
        return <Badge className="bg-yellow-500">Média Confiança</Badge>
      case 'low':
        return <Badge variant="destructive">Baixa Confiança</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getPlatformIcon = (platform: string) => {
    // Pode adicionar ícones específicos por plataforma
    return '🔗'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Múltiplos perfis {platform} encontrados
          </DialogTitle>
          <DialogDescription>
            Encontramos {candidates.length} perfis no {platform} que podem pertencer a{' '}
            <strong>{companyName}</strong>. Selecione o perfil oficial correto:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div
              key={index}
              onClick={() => setSelectedId(index)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${
                  selectedId === index
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Info principal */}
                <div className="flex-1 space-y-2">
                  {/* Handle e Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-semibold flex items-center gap-2">
                      {getPlatformIcon(candidate.platform)}
                      {candidate.handle}
                    </span>
                    {getConfidenceBadge(candidate.confidence)}
                    <Badge variant="outline" className="text-xs">
                      Score: {candidate.score}
                    </Badge>
                  </div>

                  {/* URL */}
                  <a
                    href={candidate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {candidate.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  {/* Snippet (se disponível) */}
                  {candidate.snippet && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic line-clamp-2">
                      "{candidate.snippet}"
                    </p>
                  )}

                  {/* Razões */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Razões para seleção:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {candidate.reasons.map((reason, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Radio button visual */}
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${
                      selectedId === index
                        ? 'border-primary bg-primary'
                        : 'border-slate-300 dark:border-slate-600'
                    }
                  `}
                >
                  {selectedId === index && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                onSelect({ ...candidates[0], score: 0, confidence: 'low' })
                onClose()
              }}
            >
              Nenhum é oficial
            </Button>
            <Button onClick={handleSelect} disabled={selectedId === null}>
              Confirmar Seleção
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

