import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { ClientResponseError } from 'pocketbase'
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
import { getAllSocialPosts, type SocialPost } from '@/services/social-posts'
import { FlipbookDesktop } from '@/components/flipbook/FlipbookDesktop'
import { FlipbookMobile } from '@/components/flipbook/FlipbookMobile'
import { FlipbookThumbnails } from '@/components/flipbook/FlipbookThumbnails'
import { SmartImage } from '@/components/flipbook/SmartImage'
import { useIsMobile } from '@/hooks/use-mobile'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SocialShare } from '@/components/SocialShare'
import { SocialGallery } from '@/components/magazine/SocialGallery'
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
import { LayoutGrid, List, Loader2, Instagram, Maximize2, Sparkles, Download } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { BrandLogo } from '@/components/BrandLogo'
import { FullscreenImageViewer } from '@/components/FullscreenImageViewer'
import { SubscriberCoverBadge } from '@/components/SubscriberCoverBadge'
import { TemplateRenderer } from '@/components/flipbook/TemplateRenderer'
import { ExportDialog } from '@/components/magazine/ExportDialog'

function isNotFoundResponseError(err: unknown): boolean {
  if (err instanceof ClientResponseError) {
    return err.status === 404
  }
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>
    const status = e.status as number | undefined
    const origStatus = (e.originalError as Record<string, unknown> | undefined)?.status as
      | number
      | undefined
    const respStatus = (e.response as Record<string, unknown> | undefined)?.status as
      | number
      | undefined
    const msg = typeof e.message === 'string' ? e.message : ''
    return (
      status === 404 ||
      origStatus === 404 ||
      respStatus === 404 ||
      msg.includes("wasn't found") ||
      msg.includes('not found')
    )
  }
  return false
}

export default function MagazineReader({ isLatest }: { isLatest?: boolean }) {
  const { id: paramId } = useParams<{ id: string }>()
  const isMobile = useIsMobile()
  const navigate = useNavigate()

  const [edition, setEdition] = useState<Edition | null>(null)
  const [pages, setPages] = useState<EditionPage[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([])
  const [loadingEdition, setLoadingEdition] = useState(true)
  const [loadingPages, setLoadingPages] = useState(true)
  const [errorEmpty, setErrorEmpty] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const [currentSpread, setCurrentSpread] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [uiVisible, setUiVisible] = useState(true)
  const [fullscreenImage, setFullscreenImage] = useState<{ src: string; alt: string } | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const resetInactivityTimer = useCallback(() => {
    setUiVisible(true)
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(
      () => setUiVisible(false),
      4000,
    ) as unknown as ReturnType<typeof setTimeout>
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
        setNotFound(false)
        setLoadError(false)
        const ed = isLatest ? await getLatestEdition() : paramId ? await getEdition(paramId) : null

        if (!ed) {
          setNotFound(true)
          return
        }

        setEdition(ed)
        document.title = `Revista Moda Atual - ${ed.title}`
      } catch (err: any) {
        if (isNotFoundResponseError(err)) {
          setNotFound(true)
        } else {
          console.error('Failed to load edition:', err)
          setLoadError(true)
        }
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
        setCurrentSpread(0)
        try {
          const hts = await getHotspots(edition.id, pgs)
          setHotspots(hts)
        } catch (hotspotErr) {
          if (!isNotFoundResponseError(hotspotErr)) {
            console.error('Failed to load hotspots:', hotspotErr)
          }
          setHotspots([])
        }
      } catch (err) {
        if (!isNotFoundResponseError(err)) {
          console.error(err)
        }
      } finally {
        setLoadingPages(false)
      }
    }
    loadPg()
  }, [edition])

  useEffect(() => {
    if (!edition) return
    getAllSocialPosts()
      .then(setSocialPosts)
      .catch(() => setSocialPosts([]))
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

  const handleSpreadChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
    setCurrentSpread(pageIndex)
  }

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex)
    setCurrentSpread(pageIndex)
  }

  const isValidEdition = !loadingEdition && !errorEmpty && !!edition
  const isValidPages = isValidEdition && !loadingPages && pages.length > 0

  const currentVisiblePageIndex = currentPage
  const currentVisiblePageId = pages[currentVisiblePageIndex]?.id

  useEffect(() => {
    if (!currentVisiblePageId || !isValidPages) return
    trackPageView(currentVisiblePageId, edition?.id).catch(() => {})
  }, [currentVisiblePageId, isValidPages, edition])

  const jumpToPage = (pageNum: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, pageNum))
    setCurrentPage(clamped)
    setCurrentSpread(clamped)
  }

  if (loadingEdition) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-slate-100 gap-6">
        <div className="h-20 md:h-28 animate-pulse">
          <BrandLogo size="hero" className="h-full w-auto" />
        </div>
        <div className="flex items-center gap-3 text-[#ea580c] mt-4">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium tracking-wide">Buscando edição...</span>
        </div>
      </div>
    )
  }

  if (notFound || errorEmpty || loadError || !edition) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-slate-100 gap-6 px-4">
        <div className="h-12 md:h-16 opacity-80">
          <BrandLogo size="lg" className="h-full w-auto" />
        </div>
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          {loadError ? (
            <>
              <h2 className="text-2xl font-bold text-slate-100">Erro ao carregar edição</h2>
              <p className="text-slate-400">
                Não foi possível carregar esta edição. Verifique sua conexão e tente novamente.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white active:scale-95 transition-transform duration-100"
                >
                  Tentar Novamente
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-orange-400 border-orange-500/30 hover:bg-orange-950/40 active:scale-95 transition-transform duration-100"
                >
                  <Link to="/">Voltar para Home</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-100">Edição não encontrada</h2>
              <p className="text-slate-400">
                A edição que você procura não existe ou foi removida. Que tal explorar outras
                edições disponíveis?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <Button
                  asChild
                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white active:scale-95 transition-transform duration-100"
                >
                  <Link to="/">Voltar para Home</Link>
                </Button>
                <Button
                  asChild
                  className="bg-slate-800 hover:bg-slate-700 text-white active:scale-95 transition-transform duration-100"
                >
                  <Link to="/reader/latest">Ler Última Edição</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="text-orange-400 border-orange-500/30 hover:bg-orange-950/40 active:scale-95 transition-transform duration-100"
                >
                  <Link to="/editions">Ver Edições</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  if (loadingPages) {
    const coverImage = edition.cover_file
      ? getFileUrl(edition, edition.cover_file)
      : edition.cover_url
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden">
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
          <div className="w-48 md:w-64 aspect-[0.7118] rounded-md shadow-2xl overflow-hidden bg-slate-900 relative ring-1 ring-white/10">
            <SmartImage
              src={coverImage}
              alt={edition.title}
              className="w-full h-full"
              imgClassName="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 pointer-events-none">
              <SubscriberCoverBadge variant="compact" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 text-center drop-shadow-md">
              {edition.title}
            </h2>
            <div className="flex items-center gap-2 text-orange-400 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-full shadow-lg backdrop-blur">
              <Loader2 className="w-5 h-5 animate-spin text-[#ea580c]" />
              <span className="font-medium tracking-wide">Carregando páginas...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <h2 className="text-2xl font-bold text-slate-100 text-center px-4">
          Nenhuma página encontrada
        </h2>
        <div className="flex items-center gap-2">
          <SocialShare title={edition.title} url={window.location.href} />
          <Button
            asChild
            className="bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 transition-transform duration-100"
          >
            <Link to="/">Voltar para Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = pages.length
  const displayPage = currentPage
  const progress = totalPages > 1 ? (displayPage / (totalPages - 1)) * 100 : 0

  return (
    <div
      className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none"
      onPointerDown={resetInactivityTimer}
      onPointerMove={resetInactivityTimer}
    >
      {/* Editorial Header (Dark theme with #ea580c accents) */}
      <header
        className={cn(
          'h-14 sm:h-16 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between px-3 md:px-6 shrink-0 z-50 shadow-md backdrop-blur-md transition-opacity duration-300',
          isMobile && !uiVisible ? 'opacity-30 hover:opacity-100' : 'opacity-100',
        )}
      >
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <Link
            to="/"
            className="shrink-0 hover:opacity-85 transition-opacity flex items-center"
            title="Voltar para a página inicial"
          >
            <div className="h-9 md:h-11 w-auto flex items-center">
              <BrandLogo size="sm" className="h-full w-auto shrink-0" />
            </div>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden md:block" />
          <h1 className="font-semibold text-slate-200 text-xs sm:text-sm md:text-base hidden sm:block truncate max-w-xs md:max-w-md">
            {edition.title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Export Dialog Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="gap-1.5 bg-slate-850 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs h-8 sm:h-9"
            title="Exportar edição (PDF ou Link)"
          >
            <Download className="w-3.5 h-3.5 text-[#ea580c]" />
            <span className="hidden md:inline">Exportar</span>
          </Button>

          {/* Social Posts Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-slate-850 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs h-8 sm:h-9"
              >
                <Instagram className="w-3.5 h-3.5 text-[#ea580c]" />
                <span className="hidden md:inline">Redes Sociais</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="overflow-y-auto bg-slate-900 text-slate-100 border-slate-800"
            >
              <SheetHeader>
                <SheetTitle className="text-slate-100">Redes Sociais</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SocialGallery posts={socialPosts} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Social Share */}
          <div className="hidden md:block">
            <SocialShare title={edition.title} url={window.location.href} />
          </div>

          {/* Table of Contents Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-slate-850 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs h-8 sm:h-9"
              >
                <List className="w-3.5 h-3.5 text-[#ea580c]" />
                <span className="hidden md:inline">Índice</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-900 text-slate-100 border-slate-800">
              <SheetHeader>
                <SheetTitle className="text-slate-100">Índice da Edição</SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-2">
                {pages
                  .filter((p) => p.toc_title)
                  .map((p) => (
                    <SheetClose asChild key={p.id}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-3 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80 active:scale-95 transition-all text-slate-300"
                        onClick={() => jumpToPage(pages.indexOf(p))}
                      >
                        <span className="font-medium text-slate-200">{p.toc_title}</span>
                        <span className="ml-auto text-[#ea580c] text-xs font-mono">
                          Pág {p.page_number || pages.indexOf(p) + 1}
                        </span>
                      </Button>
                    </SheetClose>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
          {/* Grid Overview Drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-slate-850 border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 active:scale-95 transition-all text-xs h-8 sm:h-9"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#ea580c]" />
                <span className="hidden md:inline">Páginas</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-slate-900 text-slate-100 border-slate-800">
              <div className="p-4 md:p-8 h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto">
                  {pages.map((p, index) => {
                    const pageImg = p.image_file ? getFileUrl(p, p.image_file) : p.image_url || ''
                    const hasPageImg = Boolean(pageImg && pageImg.trim() !== '')
                    const hasPageTemplate = Boolean(
                      (p.template && p.template !== 'default') ||
                      (p.template === 'default' &&
                        p.template_data &&
                        Object.keys(p.template_data).length > 0),
                    )

                    return (
                      <div key={p.id} className="group flex flex-col gap-2">
                        <div
                          className={cn(
                            'relative aspect-[0.7118] overflow-hidden rounded-md shadow-md transition-all flex items-center justify-center bg-slate-800 cursor-pointer active:scale-95',
                            index === currentPage
                              ? 'ring-2 ring-[#ea580c] ring-offset-2 ring-offset-slate-900'
                              : 'hover:ring-1 hover:ring-white/40',
                          )}
                          onClick={() => {
                            if (hasPageImg) {
                              setFullscreenImage({
                                src: pageImg,
                                alt: `Página ${p.page_number}`,
                              })
                            } else {
                              jumpToPage(index)
                            }
                          }}
                        >
                          {hasPageImg ? (
                            <SmartImage
                              src={pageImg}
                              alt={`Página ${p.page_number}`}
                              className="w-full h-full pointer-events-none"
                              imgClassName="w-full h-full object-cover"
                            />
                          ) : hasPageTemplate ? (
                            <div className="w-full h-full relative bg-[#fdfcf9] overflow-hidden pointer-events-none">
                              <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left transform scale-[0.25] overflow-hidden p-2">
                                <TemplateRenderer page={p} />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                              <span className="text-[10px] uppercase font-mono text-orange-500">
                                Pág
                              </span>
                              <span className="text-sm font-bold font-mono text-slate-200">
                                {p.page_number || index + 1}
                              </span>
                            </div>
                          )}

                          {hasPageImg && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>
                        <DrawerClose asChild>
                          <button
                            onClick={() => jumpToPage(index)}
                            className="text-center text-xs font-medium text-slate-400 group-hover:text-[#ea580c] transition-colors cursor-pointer"
                          >
                            {index === 0 ? 'Capa' : `Pág ${p.page_number || index + 1}`}
                          </button>
                        </DrawerClose>
                      </div>
                    )
                  })}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      {/* Main Flipbook Canvas with smooth fade in */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 animate-in fade-in duration-500 fill-mode-forwards">
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
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* MELHORIA B: Barra de Miniaturas fixa na parte inferior */}
      <FlipbookThumbnails pages={pages} currentPage={currentPage} onSelectPage={jumpToPage} />

      {/* Bottom Status / Progress bar */}
      <footer
        className={cn(
          'h-9 bg-slate-900 border-t border-slate-800/80 flex flex-col shrink-0 relative z-40 transition-opacity duration-300',
          isMobile && !uiVisible ? 'opacity-30' : 'opacity-100',
        )}
      >
        {/* Interactive progress bar */}
        <div
          className="h-1.5 w-full cursor-pointer group bg-slate-800"
          onClick={(e) => {
            if (totalPages <= 1) return
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percent = x / rect.width
            const target = Math.round(percent * (totalPages - 1))
            jumpToPage(target)
          }}
          title="Clique para saltar para uma página"
        >
          <Progress
            value={progress}
            className="h-1.5 bg-slate-800 rounded-none [&>div]:bg-[#ea580c] transition-all cursor-pointer"
          />
        </div>

        <div className="flex-1 flex items-center justify-between px-4 sm:px-6 text-[11px] font-medium text-slate-400 tracking-wider uppercase">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Sparkles className="w-3 h-3 text-[#ea580c]" />
            <span className="hidden sm:inline">Revista Digital Interativa</span>
          </div>
          <div className="text-slate-300 font-semibold">
            {displayPage === 0 ? 'Capa' : `Página ${displayPage + 1}`} / {totalPages}
          </div>
          <div className="text-slate-500 text-[10px]">{Math.round(progress)}%</div>
        </div>
      </footer>

      <FullscreenImageViewer
        src={fullscreenImage?.src ?? null}
        alt={fullscreenImage?.alt ?? ''}
        open={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        edition={edition}
        pages={pages}
      />
    </div>
  )
}
