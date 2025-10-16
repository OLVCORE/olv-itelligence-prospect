"use client"

import { Button } from "@/components/ui/button"
import { Palette, BarChart3 } from "lucide-react"

interface ModeToggleProps {
  mode: "canva" | "powerbi"
  setMode: (mode: "canva" | "powerbi") => void
}

export function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      <Button
        variant={mode === "canva" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("canva")}
        className="gap-2"
      >
        <Palette className="h-4 w-4" />
        Canva
      </Button>
      <Button
        variant={mode === "powerbi" ? "default" : "ghost"}
        size="sm"
        onClick={() => setMode("powerbi")}
        className="gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Power BI
      </Button>
    </div>
  )
}

