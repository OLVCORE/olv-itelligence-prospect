/**
 * Banner de Alerta de Quota Excedida
 * Exibe quando APIs de busca falham por quota
 */

import { AlertTriangle, ExternalLink, Settings } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface QuotaWarningBannerProps {
  message?: string
  showConfigLinks?: boolean
}

export function QuotaWarningBanner({ 
  message = "APIs de busca com quota excedida",
  showConfigLinks = true 
}: QuotaWarningBannerProps) {
  return (
    <Alert variant="destructive" className="mb-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100 font-bold">
        ⚠️ Presença Digital Limitada - Quota de APIs Excedida
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-3">
        <p className="font-medium">
          {message}. A busca de presença digital pode estar incompleta.
        </p>
        
        <div className="bg-white dark:bg-slate-800 rounded-md p-3 space-y-2 text-sm">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            💡 Soluções Imediatas:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
            <li>
              <strong>Google CSE:</strong> Quota reseta às 00:00 UTC (limite: 100/dia)
            </li>
            <li>
              <strong>Configure APIs alternativas</strong> para 3.500 queries grátis/mês extras:
              <ul className="list-circle list-inside ml-6 mt-1 space-y-1">
                <li>Bing Search API: 1.000/mês grátis</li>
                <li>Serper.dev: 2.500/mês grátis</li>
              </ul>
            </li>
            <li>
              <strong>Ative billing Google:</strong> $5/1.000 queries após quota
            </li>
          </ul>
        </div>

        {showConfigLinks && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
              onClick={() => window.open('https://portal.azure.com/#create/Microsoft.CognitiveServicesBingSearch-v7', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Configurar Bing (1k grátis)
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
              onClick={() => window.open('https://serper.dev/signup', '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Configurar Serper (2.5k grátis)
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white text-amber-900 border-amber-300 hover:bg-amber-50"
              onClick={() => window.open('https://console.cloud.google.com/billing/linkedaccount', '_blank')}
            >
              <Settings className="h-3 w-3 mr-1" />
              Ativar Billing Google
            </Button>
          </div>
        )}
        
        <p className="text-xs italic pt-2 border-t border-amber-200 dark:border-amber-700">
          ℹ️ Após configurar, aguarde 5-10 minutos e faça uma nova busca
        </p>
      </AlertDescription>
    </Alert>
  )
}

