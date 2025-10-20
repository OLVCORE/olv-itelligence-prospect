"use client"

import { ModuleProvider } from "@/lib/contexts/ModuleContext"
import { ThemeProvider } from "@/lib/contexts/theme-provider"
import { ProjectProvider } from "@/lib/contexts/ProjectContext"
import { GlobalLoadingIndicator } from "@/components/GlobalLoadingIndicator"
import { NotificationSystem } from "@/components/NotificationSystem"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="olv-intelligence-theme"
    >
      <TooltipProvider>
        <ProjectProvider>
          <ModuleProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              {children}
              <GlobalLoadingIndicator />
              <NotificationSystem />
            </div>
          </ModuleProvider>
        </ProjectProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
