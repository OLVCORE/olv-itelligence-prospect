"use client"

import { useProject, Vendor } from '@/lib/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, Sparkles, Wrench } from 'lucide-react'

export function VendorSelector() {
  const { vendor, setVendor } = useProject()

  const vendors: { value: Vendor; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      value: 'TOTVS', 
      label: 'TOTVS', 
      icon: <Building2 className="h-3 w-3" />,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
    },
    { 
      value: 'OLV', 
      label: 'OLV', 
      icon: <Sparkles className="h-3 w-3" />,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30'
    },
    { 
      value: 'CUSTOM', 
      label: 'Custom', 
      icon: <Wrench className="h-3 w-3" />,
      color: 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
    }
  ]

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vendor:</span>
      <div className="flex gap-1">
        {vendors.map((v) => (
          <Button
            key={v.value}
            variant="ghost"
            size="sm"
            onClick={() => setVendor(v.value)}
            className={`h-7 px-2 ${
              vendor === v.value
                ? v.color
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1">
              {v.icon}
              <span className="text-xs font-medium">{v.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

