import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import {
  getEdition,
  getLatestEdition,
  getEditionPages,
  getHotspots,
  Edition,
  EditionPage,
  Hotspot,
  getFileUrl,
} from '@/services/magazine'
import { trackPageView } from '@/services/analytics'
import { FlipbookDesktop } from '@/components/flipbook/FlipbookDesktop'
import { FlipbookMobile } from '@/components/flipbook/FlipbookMobile'
import { SmartImage } from '@/components/flipbook/SmartImage'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SocialShare } from '@/components/SocialShare'
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
  const navigate = useNavigate()

  const [edition, setEdition] = useState<Edition | null>(null)
  const [pages, setPages] = useState<EditionPage[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loadingEdition, setLoadingEdition] = useState(true)
  const [loadingPages, setLoadingPages] = useState(true)
  const [errorEmpty, setErrorEmpty] = useState(false)

  const [currentSpread, setCurrentSpread] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const resetInactivityTimer = useCallback(() => {
    setUiVisible(true)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => setUiVisible(false), 2000)
  }, [])

  useEffect(() => {
    resetInactivityTimer()
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    }
  }, [resetInactivityTimer])

  useEffect(() => {
    if (paramId === ':id' || !paramId) {
      if (!isLatest) {
        navigate('/', { replace: true })
        return
      }
    }

    const loadEd = async () => {
      try {
        setLoadingEdition(true)
        setErrorEmpty(false)
        const ed = isLatest ? await getLatestEdition() : paramId ? await getEdition(paramId) : null

        if (!ed) {
          navigate('/', { replace: true })
          return
        }

        setEdition(ed)
        document.title = `Revista Moda Atual - ${ed.title}`
      } catch (err) {
        console.error(err)
        navigate('/', { replace: true })
      } finally {
        setLoadingEdition(false)
      }
    }
    loadEd()
  }, [paramId, isLatest, navigate])

  useEffect(() => {
    if (!edition) return
    const loadPg = async () => {
      try {
        setLoadingPages(true)
        const pgs = await getEditionPages(edition.id)
        setPages(pgs)
        setCurrentPage(0)
        try {
          const hts = await getHotspots(edition.id, pgs)
          setHotspots(hts)
        } catch (hotspotErr) {
          console.error('Failed to load hotspots:', hotspotErr)
          setHotspots([])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingPages(false)
      }
    }
    loadPg()
  }, [edition])

  const metaConfig = useMemo(() => {
    if (!edition) return null
    const coverImage = edition.cover_file
      ? getFileUrl(edition, edition.cover_file)
      : edition.cover_url || ''
    return {
      title: `Revista Moda Atual - ${edition.title}`,
      description: edition.description || 'Edição da Revista Moda Atual',
      image: coverImage,
      url: window.location.href,
      type: 'article',
    }
  }, [edition])

  useMetaTags(metaConfig)

  const currentVisiblePageIndex = isMobile
    ? currentPage
    : Math.min(currentSpread * 2, Math.max(pages.length - 1, 0))
  const currentVisiblePageId = pages[currentVisiblePageIndex]?.id

  useEffect(() => {
    if (!currentVisiblePageId) return
    trackPageView(currentVisiblePageId).catch(() => {})
  }, [currentVisiblePageId])

  const handleSpreadChange = (spread: number) => setCurrentSpread(spread)
  const handlePageChange = (page: number) => setCurrentPage(page)

  if (loadingEdition) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-6">
        <img
          src="https://img.usecurling.com/i?q=v%20moda%20brasil%20logo&color=orange&shape=outline"
          alt="Revista Moda Atual"
          className="h-16 md:h-24 animate-pulse opacity-80"
          loading="lazy"
          decoding="async"
        />
        <div className="flex items-center gap-3 text-orange-500 mt-4">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium tracking-wide">Buscando edição...</span>
        </div>
      </div>
    )
  }

  if (errorEmpty || !edition) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <h2 className="text-xl font-medium text-gray-600 text-center px-4">Redirecionando...</h2>
      </div>
    )
  }

  if (loadingPages) {
    const coverImage = edition.cover_file
      ? getFileUrl(edition, edition.cover_file)
      : edition.cover_url
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#f4f4f4] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={coverImage}
            alt="Cover Blur"
            className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="z-10 flex flex-col items-center gap-8 animate-fade-in-up">
          <div className="w-48 md:w-64 aspect-[0.7118] rounded-md shadow-2xl overflow-hidden bg-white">
            <SmartImage
              src={coverImage}
              alt={edition.title}
              className="w-full h-full"
              imgClassName="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center drop-shadow-md">
              {edition.title}
            </h2>
            <div className="flex items-center gap-2 text-orange-600 bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium tracking-wide">Carregando páginas...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-50 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 text-center px-4">
          Nenhuma página encontrada
        </h2>
        <div className="flex items-center gap-2">
          <SocialShare title={edition.title} url={window.location.href} />
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 transition-transform duration-100"
          >
            <Link to="/">Voltar para Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = pages.length
  const displayPage = isMobile ? currentPage : Math.min(currentSpread * 2, totalPages - 1)
  const progress = totalPages > 1 ? (displayPage / (totalPages - 1)) * 100 : 0

  const jumpToPage = (pageNum: number) => {
    if (isMobile) {
      setCurrentPage(pageNum)
    } else {
      setCurrentSpread(Math.floor((pageNum + 1) / 2))
    }
  }

  return (
    <div
      className="flex flex-col h-screen w-full bg-[#f4f4f4] overflow-hidden text-gray-900 font-sans"
      onPointerDown={resetInactivityTimer}
    >
      <header
        className={cn(
          'h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shrink-0 z-50 shadow-sm transition-opacity duration-300',
          isMobile && !uiVisible ? 'opacity-30' : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <img
              src="https://img.usecurling.com/i?q=v%20moda%20brasil%20logo&color=orange&shape=outline"
              alt="V MODA BRASIL"
              className="h-6 md:h-8"
              loading="lazy"
              decoding="async"
            />
          </Link>
          <div className="h-6 w-px bg-gray-300 hidden md:block" />
          <h1 className="font-semibold text-gray-800 text-sm md:text-lg hidden md:block truncate max-w-sm">
            {edition.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <SocialShare title={edition.title} url={window.location.href} />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-gray-700 active:scale-95 transition-transform duration-100"
              >
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
                        className="w-full justify-start text-left h-auto py-3 border border-transparent hover:border-gray-200 active:scale-95 transition-transform duration-100"
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
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-gray-700 active:scale-95 transition-transform duration-100"
              >
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
                        className="cursor-pointer group flex flex-col gap-3 active:scale-95 transition-transform duration-100"
                        onClick={() => jumpToPage(index)}
                      >
                        <div className="relative aspect-[0.7118] overflow-hidden rounded-sm shadow-sm group-hover:shadow-lg group-hover:ring-2 ring-orange-500 transition-all flex items-center justify-center bg-gray-50">
                          <img
                            src={p.image_file ? getFileUrl(p, p.image_file) : p.image_url}
                            alt={`Página ${p.page_number}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
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
          <FlipbookMobile
            pages={pages}
            hotspots={hotspots}
            onPageChange={handlePageChange}
            targetPage={currentPage}
          />
        ) : (
          <FlipbookDesktop
            pages={pages}
            hotspots={hotspots}
            currentSpread={currentSpread}
            onSpreadChange={handleSpreadChange}
          />
        )}
      </main>

      <footer
        className={cn(
          'h-12 bg-white border-t flex flex-col shrink-0 relative z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-opacity duration-300',
          isMobile && !uiVisible ? 'opacity-30' : 'opacity-100',
        )}
      >
        <div className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-50">
          <SocialShare title={edition.title} url={window.location.href} />
        </div>
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
        <div className="flex-1 flex items-center justify-center px-20 md:px-6 text-xs md:text-sm font-medium text-gray-500 tracking-wide uppercase">
          Página {displayPage} de {totalPages - 1}
        </div>
      </footer>
    </div>
  )
}
