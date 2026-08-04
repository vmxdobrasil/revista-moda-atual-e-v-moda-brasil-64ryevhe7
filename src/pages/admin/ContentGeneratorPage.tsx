import { useState, useEffect, useRef } from 'react'
import {
  getEditions,
  generateContent,
  saveGeneratedContent,
  type Edition,
  type GeneratedContent,
} from '@/services/content-generator'
import { GeneratedContentDisplay } from './components/GeneratedContentDisplay'
import { optimizeSeo, type SeoOptimizationResult } from '@/services/seo'
import { reviewContent, type QaParecer } from '@/services/editorial-qa'
import { QaParecerDisplay } from '@/components/QaParecerDisplay'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useToast } from '@/hooks/use-toast'
import {
  Sparkles,
  Check,
  ChevronsUpDown,
  Loader2,
  Save,
  AlertCircle,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PROGRESS_MESSAGES = [
  'Jornalista redigindo materia...',
  'Coolhunter validando tendencias...',
  'Copywriter adaptando para Instagram...',
  'Especialista em SEO otimizando...',
  'Especialista em Reels criando roteiro...',
]

export default function ContentGeneratorPage() {
  const [theme, setTheme] = useState('')
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progressIdx, setProgressIdx] = useState(0)
  const [result, setResult] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [seoResult, setSeoResult] = useState<SeoOptimizationResult | null>(null)
  const [seoLoading, setSeoLoading] = useState(false)
  const [qaResult, setQaResult] = useState<QaParecer | null>(null)
  const [qaLoading, setQaLoading] = useState(false)
  const { toast } = useToast()
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getEditions()
      .then(setEditions)
      .catch(() => {})
  }, [])

  const startProgress = () => {
    setProgressIdx(0)
    progressInterval.current = setInterval(() => {
      setProgressIdx((prev) => Math.min(prev + 1, PROGRESS_MESSAGES.length - 1))
    }, 4000)
  }

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }

  const handleGenerate = async () => {
    if (theme.trim().length < 3) {
      toast({
        title: 'Erro',
        description: 'Digite um tema com pelo menos 3 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    startProgress()
    try {
      const content = await generateContent(theme.trim(), selectedEdition || undefined)
      setResult(content)
    } catch (err: any) {
      const msg =
        err?.response?.error || err?.response?.message || err?.message || 'Falha ao gerar conteudo.'
      setError(msg)
    } finally {
      stopProgress()
      setLoading(false)
    }
  }

  const handleSelectEdition = (ed: Edition) => {
    setSelectedEdition(ed.id)
    setTheme(`${ed.title}. ${ed.description || ''}`.trim())
    setComboboxOpen(false)
  }

  const handleSeoOptimize = async () => {
    if (!result) return
    setSeoLoading(true)
    try {
      const articleText = result.materia_completa || ''
      const seo = await optimizeSeo(articleText, theme.trim())
      setSeoResult(seo)
      toast({ title: 'SEO Otimizado', description: 'Metadados SEO aplicados ao artigo.' })
    } catch (err: any) {
      toast({
        title: 'Erro SEO',
        description: err?.message || 'Falha ao otimizar SEO.',
        variant: 'destructive',
      })
    } finally {
      setSeoLoading(false)
    }
  }

  const handleQaReview = async () => {
    if (!result) return
    setQaLoading(true)
    setQaResult(null)
    try {
      const parecer = await reviewContent(result.materia_completa, 'article')
      setQaResult(parecer)
      toast({ title: 'QA concluído', description: `Classificação: ${parecer.classification}` })
    } catch (err: any) {
      toast({
        title: 'Erro QA',
        description: err?.message || 'Falha ao revisar conteúdo.',
        variant: 'destructive',
      })
    } finally {
      setQaLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      await saveGeneratedContent({
        theme: theme.trim(),
        original_edition: selectedEdition || undefined,
        content_data: result,
      })
      toast({ title: 'Sucesso', description: 'Salvo com sucesso!' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Gerador de Conteudo</h2>
        <p className="text-gray-500 mt-1">Gere conteudo completo para redes sociais em minutos.</p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tema</label>
            <Textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Digite o tema ou selecione uma edi\u00e7\u00e3o abaixo"
              rows={3}
              className="resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Usar edicao existente
            </label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                  {selectedEdition
                    ? editions.find((e) => e.id === selectedEdition)?.title
                    : 'Selecionar edicao...'}
                  <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar edicao..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma edicao encontrada.</CommandEmpty>
                    <CommandGroup>
                      {editions.map((ed) => (
                        <CommandItem
                          key={ed.id}
                          value={ed.title}
                          onSelect={() => handleSelectEdition(ed)}
                        >
                          <Check
                            className={cn(
                              'mr-2 w-4 h-4',
                              selectedEdition === ed.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {ed.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {PROGRESS_MESSAGES[progressIdx]}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Gerar Conteudo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="rounded-xl border-red-200 bg-red-50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={handleGenerate} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {result && !loading && (
        <>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleQaReview}
              disabled={qaLoading}
              variant="outline"
              className="gap-2"
            >
              {qaLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              Validar QA
            </Button>
            <Button
              onClick={handleSeoOptimize}
              disabled={seoLoading}
              variant="outline"
              className="gap-2"
            >
              {seoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Otimizar SEO
            </Button>
            <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar no historico
            </Button>
          </div>

          {seoResult && (
            <Card className="rounded-xl border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5 text-orange-500" /> SEO Metadata Aplicado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Meta Title:</span>
                  <p className="text-sm font-medium">{seoResult.meta_title}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Meta Description:</span>
                  <p className="text-sm">{seoResult.meta_description}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Slug:</span>
                  <Badge variant="outline" className="ml-2 font-mono">
                    /{seoResult.slug}
                  </Badge>
                </div>
                {seoResult.lsi_keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {seoResult.lsi_keywords.map((k, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {k}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {qaResult && <QaParecerDisplay parecer={qaResult} />}
          <GeneratedContentDisplay content={result} />
        </>
      )}
    </div>
  )
}
