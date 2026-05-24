import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getEdition,
  getLatestEdition,
  getEditionPages,
  getHotspots,
  Edition,
  EditionPage,
  Hotspot,
} from '@/services/magazine'
import { FlipbookDesktop } from '@/components/flipbook/FlipbookDesktop'
import { FlipbookMobile } from '@/components/flipbook/FlipbookMobile'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { LayoutGrid, List, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export default function MagazineReader({ isLatest }: { isLatest?: boolean }) {
  const { id: paramId } = useParams<{ id: string }>()
  const isMobile = useIsMobile()

  const [edition, setEdition] = useState<Edition | null>(null)
  const [pages, setPages] = useState<EditionPage[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const [errorEmpty, setErrorEmpty] = useState(false)

  const [currentSpread, setCurrentSpread] = useState(0)
  const [currentPage, setCurrentPage] = useState(0) // for mobile

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setErrorEmpty(false)
        let ed: Edition | null = null

        if (isLatest) {
          ed = await getLatestEdition()
          if (!ed) {
            setErrorEmpty(true)
            setLoading(false)
            return
          }
        } else if (paramId) {
          ed = await getEdition(paramId)
        }

        if (!ed) {
          setLoading(false)
          return
        }

        const [pgs, hts] = await Promise.all([getEditionPages(ed.id), getHotspots(ed.id)])

        setEdition(ed)
        setPages(pgs)
        setHotspots(hts)
        document.title = `Revista Moda Atual - ${ed.title}`
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [paramId, isLatest])

  if (loading)
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-6">
        <img
          src="https://img.usecurling.com/i?q=v%20moda%20brasil%20logo&color=orange&shape=outline"
          alt="Revista Moda Atual"
          className="h-16 md:h-24 animate-pulse opacity-80"
        />
        <div className="flex items-center gap-3 text-orange-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium tracking-wide">Carregando edição...</span>
        </div>
      </div>
    )

  if (errorEmpty)
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center px-4">
          Nenhuma edição disponível no momento
        </h2>
        <Link
          to="/"
          className="px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
        >
          Voltar para Home
        </Link>
      </div>
    )

  if (!edition)
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center px-4">
          Edição não encontrada.
        </h2>
        <Link
          to="/"
          className="px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
        >
          Voltar para Home
        </Link>
      </div>
    )

  if (pages.length === 0)
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center px-4">
          Nenhuma página encontrada para esta edição.
        </h2>
        <Link
          to="/"
          className="px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
        >
          Voltar para Home
        </Link>
      </div>
    )

  const totalPages = pages.length
  const displayPage = isMobile ? currentPage : Math.min(currentSpread * 2, totalPages - 1)
  const progress = totalPages > 1 ? (displayPage / (totalPages - 1)) * 100 : 0

  const handleSpreadChange = (spread: number) => setCurrentSpread(spread)
  const handlePageChange = (page: number) => setCurrentPage(page)

  const jumpToPage = (pageNum: number) => {
    if (isMobile) {
      const el = document.querySelector(`[data-page="${pageNum}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
    } else {
      setCurrentSpread(Math.floor((pageNum + 1) / 2))
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f4f4f4] overflow-hidden text-gray-900 font-sans">
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="https://img.usecurling.com/i?q=v%20moda%20brasil%20logo&color=orange&shape=outline"
              alt="V MODA BRASIL"
              className="h-6 md:h-8"
            />
          </Link>
          <div className="h-6 w-px bg-gray-300 hidden md:block" />
          <h1 className="font-semibold text-gray-800 text-sm md:text-lg hidden md:block truncate max-w-sm">
            Revista Moda Atual
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <List className="w-4 h-4" />
                <span className="hidden md:inline">Índice</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Índice da Edição</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {pages
                  .filter((p) => p.toc_title)
                  .map((p) => (
                    <SheetClose asChild key={p.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-3 border border-transparent hover:border-gray-200"
                        onClick={() => jumpToPage(pages.indexOf(p))}
                      >
                        <span className="font-medium text-gray-700">{p.toc_title}</span>
                        <span className="ml-auto text-gray-400 text-sm">Pág {p.page_number}</span>
                      </Button>
                    </SheetClose>
                  ))}
              </div>
            </SheetContent>
          </Sheet>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden md:inline">Páginas</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 md:p-8 h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
                  {pages.map((p, index) => (
                    <DrawerClose asChild key={p.id}>
                      <div
                        className="cursor-pointer group flex flex-col gap-3"
                        onClick={() => jumpToPage(index)}
                      >
                        <div className="relative aspect-[0.7118] overflow-hidden rounded-sm shadow-sm group-hover:shadow-lg group-hover:ring-2 ring-orange-500 transition-all">
                          <img
                            src={p.image_url}
                            alt={`Página ${p.page_number}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-center text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                          Página {p.page_number || 'Capa'}
                        </p>
                      </div>
                    </DrawerClose>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {isMobile ? (
          <FlipbookMobile pages={pages} hotspots={hotspots} onPageChange={handlePageChange} />
        ) : (
          <FlipbookDesktop
            pages={pages}
            hotspots={hotspots}
            currentSpread={currentSpread}
            onSpreadChange={handleSpreadChange}
          />
        )}
      </main>

      <footer className="h-12 bg-white border-t flex flex-col shrink-0 relative z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div
          className="h-2 w-full cursor-pointer group"
          onClick={(e) => {
            if (totalPages <= 1) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = x / rect.width
            const targetPage = Math.round(percent * (totalPages - 1))
            jumpToPage(targetPage)
          }}
        >
          <Progress
            value={progress}
            className="h-1 group-hover:h-2 bg-gray-200 rounded-none [&>div]:bg-orange-500 transition-all cursor-pointer"
          />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 text-xs md:text-sm font-medium text-gray-500 tracking-wide uppercase">
          Página {displayPage} de {totalPages - 1}
        </div>
      </footer>
    </div>
  )
}
