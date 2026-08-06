import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Copy, Sparkles, Wand2, RefreshCcw, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllStoryTexts, type StoryText } from '@/services/story-texts'
import { StoryTextsPanel, type StoryTextFilters } from '@/components/StoryTextsPanel'
import { ExportModal } from '@/components/ExportModal'
import { getEditions, type Edition } from '@/services/magazine'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const MOCK_DATA = [
  { name: 'Jan', views: 4000, clicks: 2400 },
  { name: 'Fev', views: 3000, clicks: 1398 },
  { name: 'Mar', views: 2000, clicks: 9800 },
  { name: 'Abr', views: 2780, clicks: 3908 },
  { name: 'Mai', views: 1890, clicks: 4800 },
  { name: 'Jun', views: 2390, clicks: 3800 },
]

export default function Dashboard() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiContent, setAiContent] = useState<null | { reels: string; seo: string }>(null)
  const [storyTexts, setStoryTexts] = useState<StoryText[]>([])
  const [storyLoading, setStoryLoading] = useState(true)
  const [filters, setFilters] = useState<StoryTextFilters>({ dateFrom: '', dateTo: '', search: '' })
  const [exportOpen, setExportOpen] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])

  const loadStoryTexts = useCallback(async () => {
    try {
      setStoryTexts(await getAllStoryTexts())
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar textos.', variant: 'destructive' })
    } finally {
      setStoryLoading(false)
    }
  }, [toast])

  const loadEditions = useCallback(async () => {
    try {
      setEditions(await getEditions())
    } catch {
      // silently fail — editions tab is not critical
    }
  }, [])

  useEffect(() => {
    loadStoryTexts()
    loadEditions()
  }, [loadStoryTexts, loadEditions])
  useRealtime('story_texts', () => {
    loadStoryTexts()
  })
  useRealtime('editions', () => {
    loadEditions()
  })

  const filteredTexts = useMemo(
    () =>
      storyTexts.filter((t) => {
        if (filters.search && !t.subject.toLowerCase().includes(filters.search.toLowerCase()))
          return false
        if (filters.dateFrom && new Date(t.created) < new Date(filters.dateFrom)) return false
        if (filters.dateTo) {
          const d = new Date(filters.dateTo)
          d.setHours(23, 59, 59)
          if (new Date(t.created) > d) return false
        }
        return true
      }),
    [storyTexts, filters],
  )

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setAiContent({
        reels:
          '✨ [HOOK] Sabia que o atacado mudou para sempre?\n\n[BODY] Descubra as peças que vão esgotar nas vitrines nesta temporada. A nova coleção Lumina traz exclusividade e margem de lucro.\n\n[CTA] Clique no link da bio e acesse a Revista Moda Atual!',
        seo: 'Título: Tendências de Outono: Como lucrar mais com a nova coleção.\nDesc: Descubra as melhores marcas do atacado brasileiro no V MODA BRASIL.',
      })
      setIsGenerating(false)
      toast({
        title: 'Conteúdo Gerado!',
        description: 'Os roteiros e metadados foram criados pela IA.',
      })
    }, 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Hub Editorial & IA</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie publicações, acompanhe métricas e gere conteúdo com IA.
          </p>
        </div>
        <Button variant="outline" onClick={() => setExportOpen(true)}>
          <Download className="w-4 h-4 mr-2" /> Exportar
        </Button>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="editorial">Gestão Editorial</TabsTrigger>
          <TabsTrigger
            value="ai"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Automação & IA
          </TabsTrigger>
          <TabsTrigger value="textos">Textos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="editorial">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Edições</CardTitle>
              <CardDescription>Gerencie o fluxo de trabalho das revistas digitais.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Edição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Prevista</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhuma edição encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {editions.map((ed) => (
                    <TableRow key={ed.id}>
                      <TableCell className="font-medium">{ed.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Publicado</Badge>
                      </TableCell>
                      <TableCell>
                        {ed.created
                          ? format(new Date(ed.created), 'dd/MM/yyyy', { locale: ptBR })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/editions/${ed.id}`}>Editar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-5 h-5" /> Assistente IA
                </CardTitle>
                <CardDescription>
                  Selecione um artigo para gerar conteúdo multiplataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Artigo Fonte</label>
                  <Select defaultValue="art1">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um artigo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="art1">Pág 12: Tendências Outono</SelectItem>
                      <SelectItem value="art2">Pág 24: Especial Jeanswear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Gerar Conteúdo Social
                </Button>
              </CardContent>
            </Card>
            <div className="md:col-span-2 space-y-6">
              {isGenerating && (
                <div className="h-64 flex flex-col items-center justify-center space-y-4 text-muted-foreground border rounded-lg border-dashed">
                  <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
                  <p className="animate-pulse">Analisando texto e gerando roteiros...</p>
                </div>
              )}
              {aiContent && !isGenerating && (
                <div className="grid sm:grid-cols-2 gap-4 animate-fade-in-up">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Roteiro TikTok/Reels
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {aiContent.reels}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        Metadados SEO
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {aiContent.seo}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              {!aiContent && !isGenerating && (
                <div className="h-64 flex flex-col items-center justify-center border rounded-lg border-dashed bg-muted/20">
                  <Sparkles className="w-8 h-8 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-sm">O conteúdo gerado aparecerá aqui.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="textos">
          <Card>
            <CardHeader>
              <CardTitle>Textos Gerados</CardTitle>
              <CardDescription>
                Filtre e gerencie os textos para stories e legendas. Use "Exportar" no topo para
                baixar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryTextsPanel
                storyTexts={filteredTexts}
                filters={filters}
                onFiltersChange={setFilters}
                loading={storyLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Engajamento de Leitores</CardTitle>
              <CardDescription>Visualizações e cliques em produtos por mês.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  views: { label: 'Visualizações', color: 'hsl(var(--chart-1))' },
                  clicks: { label: 'Cliques', color: 'hsl(var(--chart-2))' },
                }}
                className="h-[400px] w-full"
              >
                <BarChart data={MOCK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} records={filteredTexts} />
    </div>
  )
}
