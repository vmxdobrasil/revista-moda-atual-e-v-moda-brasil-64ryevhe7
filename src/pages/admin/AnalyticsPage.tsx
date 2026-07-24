import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  getEditions,
  getEditionPages,
  getHotspots,
  Edition,
  EditionPage,
  Hotspot,
} from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, MousePointerClick, BookOpen, BarChart3, ChevronRight } from 'lucide-react'

interface EditionMetrics {
  totalPageViews: number
  totalHotspotClicks: number
}

export default function AnalyticsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [pagesMap, setPagesMap] = useState<Record<string, EditionPage[]>>({})
  const [hotspotsMap, setHotspotsMap] = useState<Record<string, Hotspot[]>>({})
  const [loading, setLoading] = useState(true)
  const [filterEdition, setFilterEdition] = useState<string>('all')

  const loadData = async () => {
    try {
      const eds = await getEditions()
      setEditions(eds)
      const pMap: Record<string, EditionPage[]> = {}
      const hMap: Record<string, Hotspot[]> = {}
      for (const ed of eds) {
        const pages = await getEditionPages(ed.id)
        pMap[ed.id] = pages
        const hotspots = await getHotspots(ed.id, pages)
        for (const ht of hotspots) {
          if (!hMap[ht.page]) hMap[ht.page] = []
          hMap[ht.page].push(ht)
        }
      }
      setPagesMap(pMap)
      setHotspotsMap(hMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('editions', () => loadData())
  useRealtime('edition_pages', () => loadData())
  useRealtime('page_hotspots', () => loadData())

  const metrics: Record<string, EditionMetrics> = useMemo(() => {
    const result: Record<string, EditionMetrics> = {}
    for (const ed of editions) {
      const pages = pagesMap[ed.id] || []
      const totalPageViews = pages.reduce((s, p) => s + (p.view_count || 0), 0)
      const totalHotspotClicks = pages.reduce((s, p) => {
        const hts = hotspotsMap[p.id] || []
        return s + hts.reduce((s2, h) => s2 + (h.click_count || 0), 0)
      }, 0)
      result[ed.id] = { totalPageViews, totalHotspotClicks }
    }
    return result
  }, [editions, pagesMap, hotspotsMap])

  const filteredEditions = useMemo(() => {
    if (filterEdition === 'all') return editions
    return editions.filter((e) => e.id === filterEdition)
  }, [editions, filterEdition])

  const totalEditionViews = editions.reduce((s, e) => s + (e.view_count || 0), 0)
  const totalPageViews = Object.values(pagesMap)
    .flat()
    .reduce((s, p) => s + (p.view_count || 0), 0)
  const totalHotspotClicks = Object.values(hotspotsMap)
    .flat()
    .reduce((s, h) => s + (h.click_count || 0), 0)

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
                  <TableHead>Edição</TableHead>
                  <TableHead className="text-right">Views de Páginas</TableHead>
                  <TableHead className="text-right">Cliques em Hotspots</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(4)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-5 w-12 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-28 ml-auto" />
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

  if (editions.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Analytics</h2>
          <p className="text-gray-500 mt-1">
            Acompanhe o engajamento dos leitores com suas edições.
          </p>
        </div>
        <div className="py-16 text-center bg-white rounded-xl border border-dashed">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg px-4 max-w-md mx-auto">
            Nenhum dado de análise disponível. As métricas aparecerão assim que os leitores
            começarem a interagir com a revista.
          </p>
        </div>
      </div>
    )
  }

  const summaryCards = [
    { label: 'Total de Edições', value: editions.length, icon: BookOpen },
    { label: 'Views de Edições', value: totalEditionViews, icon: Eye },
    { label: 'Views de Páginas', value: totalPageViews, icon: BarChart3 },
    { label: 'Cliques em Hotspots', value: totalHotspotClicks, icon: MousePointerClick },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Analytics</h2>
        <p className="text-gray-500 mt-1">Acompanhe o engajamento dos leitores com suas edições.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Edições</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Filtrar por edição</span>
          <Select value={filterEdition} onValueChange={setFilterEdition}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Todas as edições" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as edições</SelectItem>
              {editions.map((ed) => (
                <SelectItem key={ed.id} value={ed.id}>
                  {ed.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0">
          {filteredEditions.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">
              Nenhuma edição encontrada para o filtro selecionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edição</TableHead>
                  <TableHead className="text-right">Views de Páginas</TableHead>
                  <TableHead className="text-right">Cliques em Hotspots</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEditions.map((ed) => {
                  const m = metrics[ed.id] || { totalPageViews: 0, totalHotspotClicks: 0 }
                  return (
                    <TableRow key={ed.id}>
                      <TableCell className="font-medium text-gray-900">{ed.title}</TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        {m.totalPageViews}
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        {m.totalHotspotClicks}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline" className="gap-1.5">
                          <Link to={`/admin/analytics/${ed.id}`}>
                            Ver Detalhes
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
