"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { 
  Building2, 
  Layers, 
  Users, 
  TrendingUp, 
  Target, 
  Rocket,
  Bell,
  BarChart3
} from "lucide-react"

interface ExecutiveCardProps {
  title: string
  description: string
  icon: string
  href?: string
  stats?: Array<{ label: string; value: string | number }>
  color?: string
}

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Layers,
  Users,
  TrendingUp,
  Target,
  Rocket,
  Bell,
  BarChart3
}

export function ExecutiveCard({ 
  title, 
  description, 
  icon, 
  href, 
  stats,
  color = "bg-blue-50"
}: ExecutiveCardProps) {
  const router = useRouter()
  const IconComponent = iconMap[icon] || Building2

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
          <IconComponent className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {stats && stats.length > 0 && (
          <div className="space-y-2 mb-4">
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-sm font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
        {href && (
          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => router.push(href)}
          >
            Ver detalhes
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

