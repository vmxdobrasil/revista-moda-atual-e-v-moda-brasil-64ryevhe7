import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEdition,
  getEditionPages,
  getHotspots,
  getFileUrl,
  Edition,
  EditionPage,
  Hotspot,
} from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowLeft, Eye, MousePointerClick, BookOpen, ExternalLink } from 'lucide-react'

interface PageWithHotspots {
  page: EditionPage
  hotspots: Hotspot[]
  totalClicks: number
}

export default function EditionAnalyticsPage() {
  const { editionId } = useParams<{ editionId: string }>()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [pages, setPages] = useState<EditionPage[]>([])
  const [hotspotsByPage, setHotspotsByPage] = useState<Record<string, Hotspot[]>>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!editionId) return
    try {
      const ed = await getEdition(editionId)
      setEdition(ed)
      const pgs = await getEditionPages(editionId)
      setPages(pgs)
      const hts = await getHotspots(editionId, pgs)
      const hMap: Record<string, Hotspot[]> = {}
      for (const ht of hts) {
        if (!hMap[ht.page]) hMap[ht.page] = []
        hMap[ht.page].push(ht)
      }
      setHotspotsByPage(hMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [editionId])
  useRealtime('editions', () => loadData())
  useRealtime('edition_pages', () => loadData())
  useRealtime('page_hotspots', () => loadData())

  const pagesWithHotspots: PageWithHotspots[] = useMemo(() => {
    return pages.map((page) => {
      const hts = hotspotsByPage[page.id] || []
      const totalClicks = hts.reduce((s, h) => s + (h.click_count || 0), 0)
      return { page, hotspots: hts, totalClicks }
    })
  }, [pages, hotspotsByPage])

  const totalPageViews = pages.reduce((s, p) => s + (p.view_count || 0), 0)
  const totalHotspotClicks = pagesWithHotspots.reduce((s, p) => s + p.totalClicks, 0)

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-6">
          <Skeleton className="w-32 h-44 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Pág.</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Hotspots</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-8" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-8 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-8 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!edition) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
        <p className="text-gray-500">Edição não encontrada.</p>
      </div>
    )
  }

  const summaryCards = [
    { label: 'Views da Edição', value: edition.view_count || 0, icon: Eye },
    { label: 'Views de Páginas', value: totalPageViews, icon: Eye },
    { label: 'Cliques em Hotspots', value: totalHotspotClicks, icon: MousePointerClick },
  ]

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin/analytics">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Analytics
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {edition.cover_file || edition.cover_url ? (
          <img
            src={edition.cover_file ? getFileUrl(edition, edition.cover_file) : edition.cover_url}
            alt={edition.title}
            className="w-32 h-44 object-cover rounded-lg shadow-md shrink-0"
          />
        ) : (
          <div className="w-32 h-44 bg-gray-100 rounded-lg shrink-0" />
        )}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{edition.title}</h2>
          {edition.description && <p className="text-gray-500 mt-2">{edition.description}</p>}
          <p className="text-sm text-gray-400 mt-2">
            Criada em {new Date(edition.created).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 shrink-0">
                <card.icon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Páginas</h3>
        {pagesWithHotspots.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-dashed">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma página encontrada nesta edição.</p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {pagesWithHotspots.map(({ page, hotspots, totalClicks }) => (
              <AccordionItem
                key={page.id}
                value={page.id}
                className="bg-white rounded-xl border-none shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-5 py-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4 gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-sm font-medium text-gray-400 w-8 shrink-0">
                        {page.page_number || '—'}
                      </span>
                      <span className="font-medium text-gray-900 truncate">
                        {page.toc_title || `Página ${page.page_number}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        {page.view_count || 0}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MousePointerClick className="w-4 h-4" />
                        {hotspots.length}
                      </span>
                      <span className="text-sm font-medium text-orange-600">
                        {totalClicks} cliques
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-4">
                  {hotspots.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4 text-center">
                      Nenhum hotspot nesta página.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Link</TableHead>
                          <TableHead className="text-right">Cliques</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hotspots.map((ht) => (
                          <TableRow key={ht.id}>
                            <TableCell className="font-medium text-gray-700">{ht.title}</TableCell>
                            <TableCell>
                              {ht.link ? (
                                <a
                                  href={ht.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline flex items-center gap-1 text-sm"
                                >
                                  {ht.link.length > 40 ? ht.link.substring(0, 40) + '...' : ht.link}
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium text-orange-600">
                              {ht.click_count || 0}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
