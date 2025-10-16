"use client"

import { ModuleProvider } from "@/lib/contexts/ModuleContext"
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator"
import { NotificationSystem } from "@/components/NotificationSystem"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModuleProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900">
        {children}
        <GlobalLoadingIndicator />
        <NotificationSystem />
      </div>
    </ModuleProvider>
  )
}
