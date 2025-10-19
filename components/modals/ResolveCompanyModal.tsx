"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ExternalLink, CheckCircle2 } from "lucide-react"

interface Candidate {
  name: string
  cnpj?: string
  url: string
  confidence: number
  snippet: string
}

interface ResolveCompanyModalProps {
  isOpen: boolean
  candidates: Candidate[]
  onConfirm: (cnpj: string | null) => void
  onClose: () => void
}

export function ResolveCompanyModal({
  isOpen,
  candidates,
  onConfirm,
  onClose,
}: ResolveCompanyModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleConfirm = () => {
    if (selectedIndex !== null && candidates[selectedIndex]?.cnpj) {
      onConfirm(candidates[selectedIndex].cnpj!)
    } else {
      onConfirm(null)
    }
    setSelectedIndex(null)
  }

  const handleClose = () => {
    setSelectedIndex(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Múltiplas empresas encontradas
          </DialogTitle>
          <DialogDescription>
            Encontramos {candidates.length} possíveis correspondências para o website informado.
            Selecione a empresa correta:
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedIndex?.toString()}
          onValueChange={(val) => setSelectedIndex(Number(val))}
          className="space-y-4"
        >
          {candidates.map((candidate, index) => (
            <div
              key={index}
              className={`
                relative border rounded-lg p-4 cursor-pointer transition-all
                ${selectedIndex === index 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                  : 'border-slate-200 hover:border-primary/50'
                }
              `}
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem
                  value={index.toString()}
                  id={`candidate-${index}`}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor={`candidate-${index}`}
                    className="text-base font-semibold cursor-pointer flex items-center gap-2"
                  >
                    {candidate.name}
                    {selectedIndex === index && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </Label>

                  <div className="flex flex-wrap gap-2">
                    {candidate.cnpj && (
                      <Badge variant="default" className="font-mono">
                        CNPJ: {candidate.cnpj}
                      </Badge>
                    )}
                    {!candidate.cnpj && (
                      <Badge variant="secondary">
                        CNPJ não detectado
                      </Badge>
                    )}
                    <Badge
                      variant={candidate.confidence > 60 ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {candidate.confidence}% confiança
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {candidate.snippet}
                  </p>

                  <a
                    href={candidate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {candidate.url.length > 60 
                      ? candidate.url.substring(0, 60) + '...' 
                      : candidate.url
                    }
                  </a>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIndex === null || !candidates[selectedIndex]?.cnpj}
          >
            Confirmar Seleção
          </Button>
        </div>

        {selectedIndex !== null && !candidates[selectedIndex]?.cnpj && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            ⚠️ Esta opção não possui CNPJ detectado. Por favor, selecione outra ou informe o CNPJ manualmente.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}

