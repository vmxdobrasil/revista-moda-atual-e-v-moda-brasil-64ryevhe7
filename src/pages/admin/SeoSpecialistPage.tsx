import { useState, useEffect, useCallback } from 'react'
import {
  optimizeSeo,
  suggestKeywords,
  type SeoOptimizationResult,
  type KeywordSuggestion,
} from '@/services/seo'
import { getSeoMetrics, type SeoMetric } from '@/services/seo-metrics'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  Search,
  Loader2,
  AlertCircle,
  TrendingUp,
  Link2,
  FileSearch,
  KeyRound,
  BarChart3,
} from 'lucide-react'

export default function SeoSpecialistPage() {
  const { toast } = useToast()
  const [articleText, setArticleText] = useState('')
  const [tema, setTema] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [keywordLoading, setKeywordLoading] = useState(false)
  const [seoResult, setSeoResult] = useState<SeoOptimizationResult | null>(null)
  const [keywords, setKeywords] = useState<KeywordSuggestion[]>([])
  const [metrics, setMetrics] = useState<SeoMetric[]>([])
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    try {
      const data = await getSeoMetrics()
      setMetrics(data)
    } catch {
      // inline error, not crash
    } finally {
      setLoadingMetrics(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  useRealtime('seo_metrics', () => loadMetrics())

  const handleOptimize = async () => {
    if (!articleText.trim() && !tema.trim()) {
      toast({ title: 'Erro', description: 'Informe o artigo ou tema.', variant: 'destructive' })
      return
    }
    setOptimizing(true)
    setError(null)
    setSeoResult(null)
    try {
      const result = await optimizeSeo(articleText.trim(), tema.trim() || undefined)
      setSeoResult(result)
      toast({ title: 'Sucesso', description: 'Análise SEO concluída!' })
    } catch (err: any) {
      const msg = err?.message || 'Falha ao otimizar SEO.'
      setError(msg)
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    } finally {
      setOptimizing(false)
    }
  }

  const handleKeywords = async () => {
    if (!tema.trim()) {
      toast({ title: 'Erro', description: 'Informe um tema.', variant: 'destructive' })
      return
    }
    setKeywordLoading(true)
    try {
      const result = await suggestKeywords(tema.trim())
      setKeywords(result.keywords || [])
      toast({
        title: 'Sucesso',
        description: `${result.keywords?.length || 0} palavras-chave sugeridas.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao sugerir palavras-chave.',
        variant: 'destructive',
      })
    } finally {
      setKeywordLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <Search className="text-orange-500" /> SEO Specialist
        </h2>
        <p className="text-gray-500 mt-1">
          Otimização de conteúdo para motores de busca, palavras-chave e monitoramento de
          posicionamento.
        </p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-orange-500" /> Análise On-Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-tema">Tema</Label>
            <Input
              id="seo-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Digite o tema do artigo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-article">Conteúdo do Artigo</Label>
            <Textarea
              id="seo-article"
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Cole o conteúdo do artigo aqui..."
              rows={8}
              className="resize-y"
            />
          </div>
          <Button
            onClick={handleOptimize}
            disabled={optimizing}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Otimizar SEO
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Erro na Análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {seoResult && (
        <div className="space-y-4">
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Resultado da Otimização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Meta Title</Label>
                  <p className="text-sm font-medium text-gray-800">{seoResult.meta_title}</p>
                  <p className="text-xs text-gray-400">{seoResult.meta_title.length} caracteres</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Slug (URL)</Label>
                  <Badge variant="outline" className="font-mono">
                    /{seoResult.slug}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Meta Description</Label>
                <p className="text-sm text-gray-700">{seoResult.meta_description}</p>
                <p className="text-xs text-gray-400">
                  {seoResult.meta_description.length} caracteres
                </p>
              </div>

              {seoResult.headings && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Estrutura de Headings
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {seoResult.headings.h1?.map((h, i) => (
                      <Badge key={`h1-${i}`} className="bg-orange-500">
                        H1: {h}
                      </Badge>
                    ))}
                    {seoResult.headings.h2?.map((h, i) => (
                      <Badge key={`h2-${i}`} variant="secondary">
                        H2: {h}
                      </Badge>
                    ))}
                    {seoResult.headings.h3?.map((h, i) => (
                      <Badge key={`h3-${i}`} variant="outline">
                        H3: {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {seoResult.lsi_keywords?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Palavras-chave LSI</h4>
                  <div className="flex flex-wrap gap-2">
                    {seoResult.lsi_keywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {seoResult.internal_links?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Link2 className="w-4 h-4" /> Links Internos Sugeridos
                  </h4>
                  <ul className="space-y-1">
                    {seoResult.internal_links.map((l, i) => (
                      <li key={i} className="text-sm text-gray-600">
                        • {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {seoResult.og && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Open Graph</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">OG Title:</span> {seoResult.og.title}
                    </p>
                    <p>
                      <span className="text-gray-500">OG Description:</span>{' '}
                      {seoResult.og.description}
                    </p>
                    {seoResult.og.image && (
                      <p>
                        <span className="text-gray-500">OG Image:</span> {seoResult.og.image}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {seoResult.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recomendações</h4>
                  <ul className="space-y-1">
                    {seoResult.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500" /> Sugestão de Palavras-Chave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Tema para sugerir palavras-chave"
            />
            <Button
              onClick={handleKeywords}
              disabled={keywordLoading || !tema.trim()}
              variant="outline"
              className="gap-2 shrink-0"
            >
              {keywordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              Sugerir
            </Button>
          </div>
          {keywords.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavra-chave</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Intenção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords.map((k, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{k.keyword}</TableCell>
                      <TableCell>
                        <Badge variant={k.estimated_volume === 'alto' ? 'default' : 'secondary'}>
                          {k.estimated_volume}
                        </Badge>
                      </TableCell>
                      <TableCell>{k.difficulty}/100</TableCell>
                      <TableCell className="text-sm text-gray-500">{k.intent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" /> Métricas de Posicionamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <Skeleton className="h-32 w-full" />
          ) : metrics.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Nenhuma métrica de SEO registrada.</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Cliques</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.slice(0, 20).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.keyword}</TableCell>
                      <TableCell>
                        <Badge variant={m.position <= 10 ? 'default' : 'secondary'}>
                          {m.position || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell>{m.search_volume || '—'}</TableCell>
                      <TableCell>{m.clicks || '—'}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {m.tracked_date
                          ? new Date(m.tracked_date).toLocaleDateString('pt-BR')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
