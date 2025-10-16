"use client"

import { useModuleContext } from "@/lib/contexts/ModuleContext"
import { Loader2 } from "lucide-react"

export function GlobalLoadingIndicator() {
  const { isLoading } = useModuleContext()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <span className="text-white font-medium">Processando análise...</span>
      </div>
    </div>
  )
}

