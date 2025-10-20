'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, XCircle, Download, Play } from 'lucide-react'
import { SearchFields, BulkSearchResponse } from '@/lib/types/search-fields'

interface BulkUploadProps {
  onResults?: (results: BulkSearchResponse) => void
}

export function BulkUploadComponent({ onResults }: BulkUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [companies, setCompanies] = useState<SearchFields[]>([])
  const [results, setResults] = useState<BulkSearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'))
      
      setUploadProgress(25)
      
      // LIMITE MÁXIMO: 50 empresas
      const MAX_COMPANIES = 50
      
      // Parse CSV completo com todas as colunas padronizadas
      const parsedCompanies: SearchFields[] = []
      const errors: string[] = []
      
      lines.forEach((line, index) => {
        if (index === 0) return // Pular cabeçalho
        if (parsedCompanies.length >= MAX_COMPANIES) return // Respeitar limite
        
        // Parse CSV respeitando aspas
        const columns = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(col => 
          col.trim().replace(/^"(.*)"$/, '$1')
        ) || []
        
        // Validar CNPJ e Razão Social (obrigatórios)
        if (!columns[0] || !columns[1]) {
          errors.push(`Linha ${index + 1}: CNPJ e Razão Social são obrigatórios`)
          return
        }
        
        // Validar CNPJ (14 dígitos)
        const cnpj = columns[0].replace(/\D/g, '')
        if (cnpj.length !== 14) {
          errors.push(`Linha ${index + 1}: CNPJ inválido (${columns[0]})`)
          return
        }
        
        // Extrair sócios
        const socios = columns[5] ? columns[5].split(';').map(s => s.trim()).filter(Boolean) : []
        
        // Extrair palavras-chave
        const keywords = columns[13] ? columns[13].split(';').map(k => k.trim()).filter(Boolean) : []
        
        parsedCompanies.push({
          cnpj,
          razaoSocial: columns[1],
          nomeFantasia: columns[2] || undefined,
          website: columns[3] || undefined,
          marca: columns[4] || undefined,
          socios,
          additionalInfo: {
            socialHandles: {
              instagram: columns[6] || undefined,
              linkedin: columns[7] || undefined,
              facebook: columns[8] || undefined,
              twitter: columns[9] || undefined,
              youtube: columns[10] || undefined,
            },
            industry: columns[11] || undefined,
            location: columns[12] || undefined,
            keywords,
          },
          metadata: {
            source: 'bulk-upload',
            lastUpdated: new Date().toISOString(),
            confidence: 100,
            notes: columns[14] || undefined
          }
        })
      })
      
      setUploadProgress(100)
      
      if (errors.length > 0) {
        setError(`⚠️ ${errors.length} linha(s) com erro:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... e mais ${errors.length - 5}` : ''}`)
      }
      
      if (parsedCompanies.length === 0) {
        setError('❌ Nenhuma empresa válida encontrada no arquivo')
        return
      }
      
      if (lines.length - 1 > MAX_COMPANIES) {
        setError(`⚠️ Arquivo contém ${lines.length - 1} empresas. Limite: ${MAX_COMPANIES}. Apenas as primeiras ${MAX_COMPANIES} serão processadas.`)
      }
      
      setCompanies(parsedCompanies)
      
      console.log(`[BulkUpload] ✅ ${parsedCompanies.length} empresas carregadas`)
      console.log(`[BulkUpload] 📊 Tempo estimado: ~${Math.round(parsedCompanies.length * 17)}s`)
      
    } catch (err: any) {
      setError(`❌ Erro ao processar arquivo: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleBulkSearch = async () => {
    if (companies.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/bulk-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companies,
          options: {
            parallel: true,
            maxConcurrent: 5,
            timeout: 15000,
            retryAttempts: 2
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na busca em massa')
      }

      const data = await response.json()
      setResults(data.data)
      onResults?.(data.data)
      
      console.log(`[BulkUpload] ✅ Busca concluída: ${data.data.summary.successful}/${data.data.summary.total} sucessos`)
      
    } catch (err: any) {
      setError(`Erro na busca: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = () => {
    // Template CSV completo com todas as colunas padronizadas
    const csvContent = [
      '# TEMPLATE PARA BUSCA EM MASSA - OLV INTELLIGENCE',
      '# INSTRUÇÕES:',
      '# 1. CNPJ (obrigatório): Apenas números, 14 dígitos',
      '# 2. Razão Social (obrigatório): Nome oficial da empresa',
      '# 3. Nome Fantasia (opcional): Nome comercial/marca',
      '# 4. Website (opcional): URL completa (https://exemplo.com.br)',
      '# 5. Marca (opcional): Nome da marca se diferente da fantasia',
      '# 6. Sócios (opcional): Nomes separados por ponto-e-vírgula (;)',
      '# 7. Instagram (opcional): Handle sem @ (exemplo: empresaexemplo)',
      '# 8. LinkedIn (opcional): Slug da empresa (exemplo: empresa-exemplo)',
      '# 9. Facebook (opcional): Nome da página',
      '# 10. Twitter (opcional): Handle sem @ (exemplo: empresaexemplo)',
      '# 11. YouTube (opcional): Nome do canal',
      '# 12. Setor (opcional): Ramo de atividade',
      '# 13. Localização (opcional): Cidade/Estado',
      '# 14. Palavras-chave (opcional): Termos separados por ponto-e-vírgula (;)',
      '# 15. Observações (opcional): Notas do hunter/analista',
      '#',
      '# LIMITE MÁXIMO: 50 empresas por arquivo',
      '# TEMPO ESTIMADO: ~15-20 segundos por empresa',
      '# PROCESSAMENTO: Paralelo (5 empresas simultâneas)',
      '#',
      'CNPJ,Razão Social,Nome Fantasia,Website,Marca,Sócios,Instagram,LinkedIn,Facebook,Twitter,YouTube,Setor,Localização,Palavras-chave,Observações',
      '12345678000195,EMPRESA EXEMPLO LTDA,Empresa Exemplo,https://empresaexemplo.com.br,Exemplo,"João Silva;Maria Santos",empresaexemplo,empresa-exemplo,EmpresaExemplo,empresaexemplo,EmpresaExemplo,Tecnologia,"São Paulo/SP","software;desenvolvimento;inovação","Cliente potencial identificado pelo time comercial"',
      '98765432000196,ACME CORPORATION S.A,ACME,https://acme.com.br,ACME Corp,"Maria Oliveira;Pedro Costa",acmecorp,acme-corporation,AcmeCorp,acmecorp,ACMECorporation,Indústria,"Rio de Janeiro/RJ","manufatura;exportação","Contato via LinkedIn - decisor confirmado"',
      '11122233000197,TECH SOLUTIONS EIRELI,TechSol,https://techsolutions.com.br,TechSol,"Carlos Mendes",techsolutions,tech-solutions,TechSolutions,techsol,TechSolutionsOficial,Serviços,"Belo Horizonte/MG","consultoria;TI;cloud","Participou de evento TOTVS em 2024"'
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template-empresas-olv-intelligence.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadResults = () => {
    if (!results) return

    const csvContent = [
      'CNPJ,Razão Social,Website,Instagram,LinkedIn,Facebook,Twitter,YouTube,Marketplaces,Jusbrasil,Confiança,Tempo Busca',
      ...results.results.map(result => [
        result.cnpj,
        result.razaoSocial,
        result.website?.url || '',
        result.redesSociais.instagram?.url || '',
        result.redesSociais.linkedin?.url || '',
        result.redesSociais.facebook?.url || '',
        result.redesSociais.twitter?.url || '',
        result.redesSociais.youtube?.url || '',
        result.marketplaces.map(m => m.plataforma).join(';'),
        result.jusbrasil?.url || '',
        result.searchMetadata.confidence,
        result.searchMetadata.searchTime
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resultados-busca-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Instruções Detalhadas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Como Funciona - Busca em Massa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-blue-900">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">📋 Passo a Passo:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Baixe o template CSV padronizado</li>
                <li>Preencha com os dados das empresas</li>
                <li>Faça upload do arquivo preenchido</li>
                <li>Revise as empresas carregadas</li>
                <li>Clique em "Iniciar Busca"</li>
                <li>Aguarde o processamento</li>
                <li>Exporte os resultados em CSV</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚙️ Especificações Técnicas:</h4>
              <ul className="space-y-1">
                <li><strong>Limite:</strong> Máximo 50 empresas por arquivo</li>
                <li><strong>Tempo médio:</strong> 15-20 segundos por empresa</li>
                <li><strong>Processamento:</strong> 5 empresas em paralelo</li>
                <li><strong>Tempo total (50 empresas):</strong> ~15 minutos</li>
                <li><strong>Formato:</strong> CSV UTF-8 com vírgula</li>
                <li><strong>Campos obrigatórios:</strong> CNPJ + Razão Social</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-blue-200 pt-4 mt-4">
            <h4 className="font-semibold mb-2">✅ Campos Disponíveis (15 colunas):</h4>
            <div className="grid md:grid-cols-3 gap-2 text-xs">
              <div><Badge variant="secondary">CNPJ</Badge> <span className="text-red-600">*obrigatório</span></div>
              <div><Badge variant="secondary">Razão Social</Badge> <span className="text-red-600">*obrigatório</span></div>
              <div><Badge variant="outline">Nome Fantasia</Badge></div>
              <div><Badge variant="outline">Website</Badge></div>
              <div><Badge variant="outline">Marca</Badge></div>
              <div><Badge variant="outline">Sócios</Badge></div>
              <div><Badge variant="outline">Instagram</Badge></div>
              <div><Badge variant="outline">LinkedIn</Badge></div>
              <div><Badge variant="outline">Facebook</Badge></div>
              <div><Badge variant="outline">Twitter</Badge></div>
              <div><Badge variant="outline">YouTube</Badge></div>
              <div><Badge variant="outline">Setor</Badge></div>
              <div><Badge variant="outline">Localização</Badge></div>
              <div><Badge variant="outline">Palavras-chave</Badge></div>
              <div><Badge variant="outline">Observações</Badge></div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-blue-900">
              <strong>💡 Dica:</strong> Quanto mais informações você fornecer (website, handles sociais, sócios, palavras-chave), 
              mais precisa e assertiva será a busca. Os campos opcionais ajudam a validar os resultados encontrados.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            1. Upload do Arquivo CSV
          </CardTitle>
          <CardDescription>
            Baixe o template, preencha e faça upload para processar até 50 empresas simultaneamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isUploading ? 'Carregando...' : 'Selecionar Arquivo'}
            </Button>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={isUploading}
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {companies.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{companies.length}</strong> empresas carregadas com sucesso
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Processing Section */}
      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              2. Executar Busca em Massa
            </CardTitle>
            <CardDescription>
              {companies.length} empresa{companies.length > 1 ? 's' : ''} pronta{companies.length > 1 ? 's' : ''} para processamento • 
              Tempo estimado: ~{Math.round(companies.length * 17)}s ({Math.round(companies.length * 17 / 60)} min)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{companies.length} empresas</Badge>
                <Badge variant="outline">Processamento paralelo</Badge>
              </div>
              <Button
                onClick={handleBulkSearch}
                disabled={isProcessing}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Busca
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Buscando presença digital...</span>
                  <span>Processando em paralelo</span>
                </div>
                <Progress value={undefined} className="animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              3. Resultados da Busca em Massa
            </CardTitle>
            <CardDescription>
              Processamento concluído • {results.summary.successful}/{results.summary.total} empresas analisadas com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{results.summary.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{results.summary.successful}</div>
                <div className="text-sm text-gray-600">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                <div className="text-sm text-gray-600">Falhas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(results.summary.totalTime / 1000)}s</div>
                <div className="text-sm text-gray-600">Tempo Total</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {results.errors && results.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{results.errors.length}</strong> empresas falharam na busca:
                  <ul className="mt-2 space-y-1">
                    {results.errors.slice(0, 3).map((error, index) => (
                      <li key={index} className="text-sm">
                        {error.razaoSocial} ({error.cnpj}): {error.error}
                      </li>
                    ))}
                    {results.errors.length > 3 && (
                      <li className="text-sm">... e mais {results.errors.length - 3} erros</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
