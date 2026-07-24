import { useEffect, useState } from 'react'
import {
  getEditions,
  getEditionPages,
  getHotspotsByPage,
  Edition,
  EditionPage,
  Hotspot,
} from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Eye, MousePointerClick, BookOpen, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [pagesMap, setPagesMap] = useState<Record<string, EditionPage[]>>({})
  const [loading, setLoading] = useState(true)
  const [dialogPageId, setDialogPageId] = useState<string | null>(null)
  const [dialogHotspots, setDialogHotspots] = useState<Hotspot[]>([])
  const [dialogLoading, setDialogLoading] = useState(false)

  const loadData = async () => {
    try {
      const eds = await getEditions()
      setEditions(eds)
      const map: Record<string, EditionPage[]> = {}
      for (const ed of eds) {
        map[ed.id] = await getEditionPages(ed.id)
      }
      setPagesMap(map)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadHotspots = async (pageId: string) => {
    setDialogLoading(true)
    try {
      setDialogHotspots(await getHotspotsByPage(pageId))
    } catch (err) {
      console.error(err)
    } finally {
      setDialogLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('editions', () => loadData())
  useRealtime('edition_pages', () => loadData())
  useRealtime('page_hotspots', () => {
    if (dialogPageId) loadHotspots(dialogPageId)
  })

  const totalEditionViews = editions.reduce((s, e) => s + (e.view_count || 0), 0)
  const totalPageViews = Object.values(pagesMap)
    .flat()
    .reduce((s, p) => s + (p.view_count || 0), 0)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    )
  }

  const summaryCards = [
    { label: 'Total de Edições', value: editions.length, icon: BookOpen },
    { label: 'Visualizações de Edições', value: totalEditionViews, icon: Eye },
    { label: 'Visualizações de Páginas', value: totalPageViews, icon: BarChart3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Analytics</h2>
        <p className="text-gray-500 mt-1">Acompanhe o engajamento dos leitores com suas edições.</p>
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

      <Accordion type="multiple" className="space-y-3">
        {editions.map((ed) => {
          const pages = pagesMap[ed.id] || []
          return (
            <AccordionItem
              key={ed.id}
              value={ed.id}
              className="bg-white rounded-xl border-none shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold text-gray-900 text-left">{ed.title}</span>
                  <span className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                    <Eye className="w-4 h-4" />
                    {ed.view_count || 0} views
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                {pages.length === 0 ? (
                  <p className="text-gray-400 text-sm py-4 text-center">
                    Nenhuma página encontrada.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Pág.</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead className="w-28 text-right">Views</TableHead>
                        <TableHead className="w-40 text-right">Hotspots</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pages.map((pg) => (
                        <TableRow key={pg.id}>
                          <TableCell className="font-medium text-gray-700">
                            {pg.page_number || '—'}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {pg.toc_title || `Página ${pg.page_number}`}
                          </TableCell>
                          <TableCell className="text-right font-medium text-orange-600">
                            {pg.view_count || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDialogPageId(pg.id)
                                loadHotspots(pg.id)
                              }}
                              className="gap-1.5"
                            >
                              <MousePointerClick className="w-3.5 h-3.5" />
                              Ver Hotspots
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {editions.length === 0 && (
        <div className="py-16 text-center bg-white rounded-xl border border-dashed">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhuma edição encontrada.</p>
        </div>
      )}

      <Dialog open={!!dialogPageId} onOpenChange={(open) => !open && setDialogPageId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hotspots da Página</DialogTitle>
          </DialogHeader>
          {dialogLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : dialogHotspots.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">
              Nenhum hotspot encontrado nesta página.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogHotspots.map((ht) => (
                  <TableRow key={ht.id}>
                    <TableCell className="font-medium text-gray-700">{ht.title}</TableCell>
                    <TableCell className="text-gray-600">{ht.price || '—'}</TableCell>
                    <TableCell className="text-right font-medium text-orange-600">
                      {ht.click_count || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
