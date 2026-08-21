import React, { useState, useRef, useEffect, useCallback } from 'react'
import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, FileText, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DesktopViewMode = 'single' | 'double'

export interface FlipbookDesktopProps {
  pages: EditionPage[]
  hotspots: Hotspot[]
  currentPage: number
  onPageChange: (page: number) => void
  viewMode?: DesktopViewMode
  onViewModeChange?: (mode: DesktopViewMode) => void
  /** Backwards compatibility alias if passed */
  currentSpread?: number
  onSpreadChange?: (spread: number) => void
}

export function FlipbookDesktop({
  pages,
  hotspots,
  currentPage: propCurrentPage,
  onPageChange,
  viewMode = 'single',
  onViewModeChange,
  currentSpread,
  onSpreadChange,
}: FlipbookDesktopProps) {
  const pageIndex = propCurrentPage !== undefined ? propCurrentPage : (currentSpread ?? 0)
  const maxPage = Math.max(0, pages.length - 1)

  const handlePageSelect = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(maxPage, nextIdx))
      if (onPageChange) {
        onPageChange(clamped)
      } else if (onSpreadChange) {
        onSpreadChange(clamped)
      }
    },
    [maxPage, onPageChange, onSpreadChange],
  )

  // ==========================================
  // SINGLE PAGE MODE TURNING STATE & ANIMATION
  // ==========================================
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null)
  const [turnProgress, setTurnProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [cornerHover, setCornerHover] = useState<'right' | 'left' | null>(null)

  // ==========================================
  // DOUBLE PAGE SPREAD CALCULATION
  // Cover (page 0) is displayed alone on the right side or as spread
  // Pages 1-2, 3-4, 5-6, ... form pairs [left, right]
  // ==========================================
  const isDoubleMode = viewMode === 'double'

  // Double mode spread index:
  // spread 0: [null, page 0] (Cover alone)
  // spread 1: [page 1, page 2]
  // spread 2: [page 3, page 4]
  // ...
  const currentDoubleSpread = pageIndex === 0 ? 0 : Math.floor((pageIndex - 1) / 2) + 1
  const maxDoubleSpread = Math.ceil(maxPage / 2)

  const getSpreadPages = (spreadIdx: number): [EditionPage | null, EditionPage | null] => {
    if (spreadIdx === 0) {
      return [null, pages[0] || null]
    }
    const leftIdx = (spreadIdx - 1) * 2 + 1
    const rightIdx = leftIdx + 1
    return [pages[leftIdx] || null, pages[rightIdx] || null]
  }

  const [leftPage, rightPage] = isDoubleMode
    ? getSpreadPages(currentDoubleSpread)
    : [null, pages[pageIndex] || null]

  const dragStartRef = useRef<{
    x: number
    y: number
    direction: 'next' | 'prev'
    startPage: number
    startSpread: number
  } | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const magazineRef = useRef<HTMLDivElement>(null)

  const currPageObj = pages[pageIndex] || null
  const nextPageObj = pageIndex < maxPage ? pages[pageIndex + 1] : null
  const prevPageObj = pageIndex > 0 ? pages[pageIndex - 1] : null

  const getHotspotsForPage = (pageId?: string) =>
    pageId ? hotspots.filter((h) => h.page === pageId) : []

  // Smooth flip animation helper
  const animateFlip = useCallback(
    (
      direction: 'next' | 'prev',
      fromProgress: number,
      toProgress: number,
      durationMs: number,
      onComplete?: () => void,
    ) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      const startTime = performance.now()

      const step = (time: number) => {
        const elapsed = time - startTime
        const t = Math.min(1, elapsed / durationMs)
        // Smooth editorial ease (cubic out-in)
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const current = fromProgress + (toProgress - fromProgress) * ease

        setTurnProgress(current)

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step)
        } else {
          setTurnProgress(toProgress)
          if (onComplete) onComplete()
        }
      }

      animFrameRef.current = requestAnimationFrame(step)
    },
    [],
  )

  const canGoNext = isDoubleMode ? currentDoubleSpread < maxDoubleSpread : pageIndex < maxPage

  const canGoPrev = isDoubleMode ? currentDoubleSpread > 0 : pageIndex > 0

  const triggerNext = useCallback(() => {
    if (turnDirection !== null || !canGoNext) return

    if (isDoubleMode) {
      setTurnDirection('next')
      setTurnProgress(0.01)
      animateFlip('next', 0.01, 1, 550, () => {
        const nextSpread = currentDoubleSpread + 1
        const targetPage = nextSpread === 1 ? 1 : (nextSpread - 1) * 2 + 1
        handlePageSelect(Math.min(maxPage, targetPage))
        setTurnDirection(null)
        setTurnProgress(0)
      })
    } else {
      setTurnDirection('next')
      setTurnProgress(0.01)
      animateFlip('next', 0.01, 1, 600, () => {
        handlePageSelect(pageIndex + 1)
        setTurnDirection(null)
        setTurnProgress(0)
      })
    }
  }, [
    turnDirection,
    canGoNext,
    isDoubleMode,
    animateFlip,
    currentDoubleSpread,
    maxPage,
    handlePageSelect,
    pageIndex,
  ])

  const triggerPrev = useCallback(() => {
    if (turnDirection !== null || !canGoPrev) return

    if (isDoubleMode) {
      setTurnDirection('prev')
      setTurnProgress(0.01)
      animateFlip('prev', 0.01, 1, 550, () => {
        const prevSpread = currentDoubleSpread - 1
        const targetPage = prevSpread === 0 ? 0 : (prevSpread - 1) * 2 + 1
        handlePageSelect(Math.max(0, targetPage))
        setTurnDirection(null)
        setTurnProgress(0)
      })
    } else {
      setTurnDirection('prev')
      setTurnProgress(0.01)
      animateFlip('prev', 0.01, 1, 600, () => {
        handlePageSelect(pageIndex - 1)
        setTurnDirection(null)
        setTurnProgress(0)
      })
    }
  }, [
    turnDirection,
    canGoPrev,
    isDoubleMode,
    animateFlip,
    currentDoubleSpread,
    handlePageSelect,
    pageIndex,
  ])

  // Pointer/Drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || turnDirection !== null) return
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('.pointer-events-auto')) {
      return
    }

    if (!magazineRef.current) return
    const rect = magazineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const halfWidth = rect.width / 2

    if (clickX > halfWidth && canGoNext) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'next',
        startPage: pageIndex,
        startSpread: currentDoubleSpread,
      }
      setTurnDirection('next')
      setIsDragging(true)
      setTurnProgress(0.05)
    } else if (clickX <= halfWidth && canGoPrev) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'prev',
        startPage: pageIndex,
        startSpread: currentDoubleSpread,
      }
      setTurnDirection('prev')
      setIsDragging(true)
      setTurnProgress(0.05)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !magazineRef.current) return
    const rect = magazineRef.current.getBoundingClientRect()
    const width = rect.width
    const deltaX = e.clientX - dragStartRef.current.x

    if (dragStartRef.current.direction === 'next') {
      const ratio = Math.max(0, Math.min(1, -deltaX / (width * 0.75)))
      setTurnProgress(ratio)
    } else {
      const ratio = Math.max(0, Math.min(1, deltaX / (width * 0.75)))
      setTurnProgress(ratio)
    }
  }

  const handlePointerUp = () => {
    if (!isDragging || !dragStartRef.current) return
    setIsDragging(false)
    const { direction, startPage, startSpread } = dragStartRef.current
    dragStartRef.current = null

    if (turnProgress > 0.25) {
      animateFlip(direction, turnProgress, 1, 350 * (1 - turnProgress) + 100, () => {
        if (isDoubleMode) {
          if (direction === 'next') {
            const nextSpread = startSpread + 1
            const target = nextSpread === 1 ? 1 : (nextSpread - 1) * 2 + 1
            handlePageSelect(Math.min(maxPage, target))
          } else {
            const prevSpread = startSpread - 1
            const target = prevSpread === 0 ? 0 : (prevSpread - 1) * 2 + 1
            handlePageSelect(Math.max(0, target))
          }
        } else {
          if (direction === 'next') {
            handlePageSelect(startPage + 1)
          } else {
            handlePageSelect(startPage - 1)
          }
        }
        setTurnDirection(null)
        setTurnProgress(0)
      })
    } else {
      animateFlip(direction, turnProgress, 0, 300 * turnProgress + 50, () => {
        setTurnDirection(null)
        setTurnProgress(0)
      })
    }
  }

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        triggerNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        triggerPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerNext, triggerPrev])

  // Realistic Page Curl math (0 to 1)
  const p = Math.max(0, Math.min(1, turnProgress))
  const rotateYNext = -p * 180
  const rotateYPrev = p * 180
  const curlArch = Math.sin(p * Math.PI) * 25
  const peelShadowOpacity = Math.sin(p * Math.PI) * 0.6

  // Next and prev spreads for double page flip transitions
  const nextSpreadPages =
    isDoubleMode && currentDoubleSpread < maxDoubleSpread
      ? getSpreadPages(currentDoubleSpread + 1)
      : [null, null]
  const prevSpreadPages =
    isDoubleMode && currentDoubleSpread > 0 ? getSpreadPages(currentDoubleSpread - 1) : [null, null]

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center select-none p-2 sm:p-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Mode Switcher Floating Pill in Canvas Top-Right */}
      {onViewModeChange && (
        <div className="absolute top-3 right-4 z-40 hidden md:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-full p-1 shadow-xl backdrop-blur-md">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onViewModeChange('single')
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
              viewMode === 'single'
                ? 'bg-[#ea580c] text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60',
            )}
            title="Modo Página Única Vertical (A4 Retrato)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Página Única</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onViewModeChange('double')
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
              viewMode === 'double'
                ? 'bg-[#ea580c] text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60',
            )}
            title="Modo Duas Páginas Lado a Lado (Livro Aberto 3D)"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Livro Aberto (2 Páginas)</span>
          </button>
        </div>
      )}

      {/* Left Navigation Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute left-4 md:left-8 lg:left-12 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-2xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          !canGoPrev || turnDirection !== null
            ? 'opacity-20 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerPrev()
        }}
        disabled={!canGoPrev || turnDirection !== null}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </Button>

      {/* ========================================================================= */}
      {/* MODE 1: SINGLE PAGE VERTICAL (A4 Portrait - 210/295 ratio)               */}
      {/* ========================================================================= */}
      {!isDoubleMode ? (
        <div
          ref={magazineRef}
          className={cn(
            'relative perspective-book rounded-lg shadow-2xl mx-auto transition-shadow duration-300',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            aspectRatio: '210 / 295',
            height: 'calc(100vh - 105px)',
            maxHeight: 'calc(100vh - 105px)',
            width: 'calc((100vh - 105px) * 210 / 295)',
            maxWidth: 'min(85vw, calc((100vh - 105px) * 210 / 295))',
            perspective: '2200px',
          }}
        >
          {/* Soft underneath ambient shadow for realism */}
          <div className="absolute -inset-4 bg-black/50 blur-2xl -z-10 rounded-2xl pointer-events-none" />

          {/* UNDERLYING NEXT PAGE (visible beneath current page while flipping NEXT) */}
          {nextPageObj && turnDirection === 'next' && (
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-white shadow-xl z-0 pointer-events-none">
              <PageRenderer page={nextPageObj} hotspots={getHotspotsForPage(nextPageObj.id)} />
              <div
                className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity"
                style={{ opacity: (1 - p) * 0.5 }}
              />
            </div>
          )}

          {/* UNDERLYING PREV PAGE (visible beneath when flipping PREV) */}
          {prevPageObj && turnDirection === 'prev' && (
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-white shadow-xl z-0 pointer-events-none">
              <PageRenderer page={prevPageObj} hotspots={getHotspotsForPage(prevPageObj.id)} />
              <div
                className="absolute inset-0 bg-black/40 pointer-events-none transition-opacity"
                style={{ opacity: p * 0.4 }}
              />
            </div>
          )}

          {/* CURRENT STATIC BASE PAGE (when not turning) */}
          {turnDirection === null && (
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-white shadow-2xl z-10">
              <PageRenderer page={currPageObj} hotspots={getHotspotsForPage(currPageObj?.id)} />
            </div>
          )}

          {/* REALISTIC PAGE CURL: NEXT PAGE */}
          {turnDirection === 'next' && (
            <div
              className="absolute inset-0 transform-style-3d origin-left z-20 pointer-events-none"
              style={{
                transform: `rotateY(${rotateYNext}deg) rotateZ(${-curlArch * 0.1}deg) skewY(${curlArch * 0.07}deg)`,
                transformOrigin: 'left center',
                transition: isDragging ? 'none' : 'transform 80ms linear',
              }}
            >
              {/* FRONT FACE (currPageObj turning away) */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-lg overflow-hidden shadow-[-16px_0_30px_rgba(0,0,0,0.4)]"
                style={{
                  clipPath:
                    p < 0.5 ? `polygon(0% 0%, 100% 0%, ${100 - p * 30}% 100%, 0% 100%)` : undefined,
                }}
              >
                <PageRenderer page={currPageObj} hotspots={[]} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to left, rgba(255,255,255,0.45) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                  }}
                />
                <div
                  className="absolute right-0 inset-y-0 w-12 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,0,0,0.15), rgba(255,255,255,0.4), rgba(0,0,0,0.2))',
                    opacity: Math.sin(p * Math.PI),
                  }}
                />
              </div>

              {/* BACK FACE (backside of turned page showing nextPageObj reverse) */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-lg overflow-hidden shadow-[16px_0_30px_rgba(0,0,0,0.4)]"
                style={{
                  transform: 'rotateY(180deg)',
                  clipPath:
                    p > 0.5
                      ? `polygon(0% 0%, 100% 0%, 100% 100%, ${(1 - p) * 30}% 100%)`
                      : undefined,
                }}
              >
                <PageRenderer page={nextPageObj} hotspots={[]} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* REALISTIC PAGE CURL: PREV PAGE */}
          {turnDirection === 'prev' && (
            <div
              className="absolute inset-0 transform-style-3d origin-right z-20 pointer-events-none"
              style={{
                transform: `rotateY(${rotateYPrev}deg) rotateZ(${curlArch * 0.1}deg) skewY(${-curlArch * 0.07}deg)`,
                transformOrigin: 'right center',
                transition: isDragging ? 'none' : 'transform 80ms linear',
              }}
            >
              {/* FRONT FACE (currPageObj) */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-lg overflow-hidden shadow-[16px_0_30px_rgba(0,0,0,0.4)]"
                style={{
                  clipPath:
                    p < 0.5 ? `polygon(0% 0%, 100% 0%, 100% 100%, ${p * 30}% 100%)` : undefined,
                }}
              >
                <PageRenderer page={currPageObj} hotspots={[]} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0.45) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                  }}
                />
              </div>

              {/* BACK FACE (prevPageObj) */}
              <div
                className="absolute inset-0 backface-hidden bg-white rounded-lg overflow-hidden shadow-[-16px_0_30px_rgba(0,0,0,0.4)]"
                style={{
                  transform: 'rotateY(180deg)',
                  clipPath:
                    p > 0.5
                      ? `polygon(0% 0%, 100% 0%, 100% 100%, ${100 - (1 - p) * 30}% 100%)`
                      : undefined,
                }}
              >
                <PageRenderer page={prevPageObj} hotspots={[]} />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(to left, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Interactive corner curl cues */}
          {pageIndex < maxPage && turnDirection === null && (
            <div
              className="absolute bottom-0 right-0 w-20 h-20 z-20 cursor-pointer overflow-hidden rounded-br-lg group"
              onMouseEnter={() => setCornerHover('right')}
              onMouseLeave={() => setCornerHover(null)}
              onClick={(e) => {
                e.stopPropagation()
                triggerNext()
              }}
              title="Próxima página"
            >
              <div
                className={cn(
                  'absolute bottom-0 right-0 w-14 h-14 bg-gradient-to-tl from-[#ea580c]/60 via-white/80 to-transparent',
                  'transition-all duration-300 transform',
                  cornerHover === 'right'
                    ? 'translate-x-0 translate-y-0 shadow-[-4px_-4px_10px_rgba(0,0,0,0.2)]'
                    : 'translate-x-8 translate-y-8 opacity-40 group-hover:opacity-100 group-hover:translate-x-4 group-hover:translate-y-4',
                )}
                style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }}
              />
            </div>
          )}

          {pageIndex > 0 && turnDirection === null && (
            <div
              className="absolute bottom-0 left-0 w-20 h-20 z-20 cursor-pointer overflow-hidden rounded-bl-lg group"
              onMouseEnter={() => setCornerHover('left')}
              onMouseLeave={() => setCornerHover(null)}
              onClick={(e) => {
                e.stopPropagation()
                triggerPrev()
              }}
              title="Página anterior"
            >
              <div
                className={cn(
                  'absolute bottom-0 left-0 w-14 h-14 bg-gradient-to-tr from-[#ea580c]/60 via-white/80 to-transparent',
                  'transition-all duration-300 transform',
                  cornerHover === 'left'
                    ? 'translate-x-0 translate-y-0 shadow-[4px_-4px_10px_rgba(0,0,0,0.2)]'
                    : '-translate-x-8 translate-y-8 opacity-40 group-hover:opacity-100 group-hover:-translate-x-4 group-hover:translate-y-4',
                )}
                style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}
              />
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* MODE 2: DOUBLE PAGE EXPANDED "OPEN BOOK" (3D Spine & Curvature)          */
        /* ========================================================================= */
        <div
          ref={magazineRef}
          className={cn(
            'relative perspective-book flex items-center justify-center transition-all duration-300',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            height: 'calc(100vh - 110px)',
            maxHeight: 'calc(100vh - 110px)',
            width:
              currentDoubleSpread === 0
                ? 'calc((100vh - 110px) * 210 / 295)'
                : 'calc((100vh - 110px) * 420 / 295)',
            maxWidth:
              currentDoubleSpread === 0
                ? 'min(85vw, calc((100vh - 110px) * 210 / 295))'
                : 'min(94vw, calc((100vh - 110px) * 420 / 295))',
            aspectRatio: currentDoubleSpread === 0 ? '210 / 295' : '420 / 295',
            perspective: '2600px',
          }}
        >
          {/* Ambient 3D Shadow underneath the open book */}
          <div className="absolute -inset-6 bg-black/65 blur-3xl -z-10 rounded-3xl pointer-events-none" />

          {/* Book Spine Outer 3D Binder Shadow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-xl shadow-2xl -z-5 opacity-90" />

          {/* Spread container (2 pages side-by-side with 3D Book Fold Effect) */}
          <div className="relative w-full h-full flex rounded-lg overflow-hidden bg-stone-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border border-stone-800/80">
            {/* COVER ONLY (Spread 0) */}
            {currentDoubleSpread === 0 ? (
              <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl">
                <PageRenderer page={rightPage} hotspots={getHotspotsForPage(rightPage?.id)} />
                {/* Book right side edge gradient */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              /* TWO PAGES OPEN BOOK (Left & Right Spreads) */
              <div className="relative w-full h-full flex items-stretch">
                {/* ----------------------------------------------------------------- */}
                {/* LEFT PAGE CONTAINER (with inner spine curvature & 3D book lighting) */}
                {/* ----------------------------------------------------------------- */}
                <div
                  className="relative flex-1 h-full bg-[#fdfcf9] rounded-l-lg overflow-hidden origin-right"
                  style={{
                    transform: 'rotateY(2.2deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: 'inset -20px 0 35px -10px rgba(0,0,0,0.3)',
                  }}
                >
                  <PageRenderer
                    page={leftPage}
                    hotspots={getHotspotsForPage(leftPage?.id)}
                    isLeft={true}
                  />

                  {/* Left Page Curvature Highlight: subtle light on the peak of the page curve */}
                  <div
                    className="absolute inset-y-0 right-0 w-32 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.12) 50%, rgba(0,0,0,0.35) 94%, rgba(0,0,0,0.55) 100%)',
                    }}
                  />

                  {/* Left outer page edge feathering shadow */}
                  <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-20" />
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* CENTER SPINE (Lombada Central 3D com profundidade de livro real)  */}
                {/* ----------------------------------------------------------------- */}
                <div
                  className="relative w-7 h-full z-30 shrink-0 pointer-events-none flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(15,15,15,0.85) 45%, rgba(10,10,10,0.95) 50%, rgba(15,15,15,0.85) 55%, rgba(0,0,0,0.55) 100%)',
                    boxShadow: '0 0 15px rgba(0,0,0,0.7)',
                  }}
                >
                  {/* Spine Crease Line / Stitch effect */}
                  <div className="w-[1.5px] h-full bg-stone-950/90 shadow-[0_0_2px_rgba(255,255,255,0.15)]" />
                  {/* Subtle stitch dash markers */}
                  <div className="absolute inset-y-4 w-px flex flex-col justify-between opacity-30">
                    <span className="w-1 h-2 bg-amber-600/60 block -ml-0.5 rounded-full" />
                    <span className="w-1 h-2 bg-amber-600/60 block -ml-0.5 rounded-full" />
                    <span className="w-1 h-2 bg-amber-600/60 block -ml-0.5 rounded-full" />
                    <span className="w-1 h-2 bg-amber-600/60 block -ml-0.5 rounded-full" />
                  </div>
                </div>

                {/* ----------------------------------------------------------------- */}
                {/* RIGHT PAGE CONTAINER (with inner spine curvature & 3D book lighting) */}
                {/* ----------------------------------------------------------------- */}
                <div
                  className="relative flex-1 h-full bg-[#fdfcf9] rounded-r-lg overflow-hidden origin-left"
                  style={{
                    transform: 'rotateY(-2.2deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: 'inset 20px 0 35px -10px rgba(0,0,0,0.3)',
                  }}
                >
                  <PageRenderer
                    page={rightPage}
                    hotspots={getHotspotsForPage(rightPage?.id)}
                    isLeft={false}
                  />

                  {/* Right Page Curvature Highlight */}
                  <div
                    className="absolute inset-y-0 left-0 w-32 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(to left, transparent 0%, rgba(255,255,255,0.12) 50%, rgba(0,0,0,0.35) 94%, rgba(0,0,0,0.55) 100%)',
                    }}
                  />

                  {/* Right outer page edge feathering shadow */}
                  <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/20 via-black/5 to-transparent pointer-events-none z-20" />
                </div>
              </div>
            )}

            {/* Turning Page Overlay in Double Page Mode */}
            {turnDirection === 'next' && isDoubleMode && (
              <div
                className="absolute inset-y-0 right-0 w-1/2 origin-left z-40 pointer-events-none"
                style={{
                  transform: `rotateY(${rotateYNext}deg)`,
                  transformOrigin: 'left center',
                  transition: isDragging ? 'none' : 'transform 80ms linear',
                  perspective: '2200px',
                }}
              >
                <div className="relative w-full h-full bg-white rounded-r-lg overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
                  <PageRenderer page={rightPage} hotspots={[]} />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to left, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity * 0.9}) 70%, rgba(0,0,0,${peelShadowOpacity * 1.4}) 100%)`,
                    }}
                  />
                </div>
              </div>
            )}

            {turnDirection === 'prev' && isDoubleMode && currentDoubleSpread > 0 && (
              <div
                className="absolute inset-y-0 left-0 w-1/2 origin-right z-40 pointer-events-none"
                style={{
                  transform: `rotateY(${rotateYPrev}deg)`,
                  transformOrigin: 'right center',
                  transition: isDragging ? 'none' : 'transform 80ms linear',
                  perspective: '2200px',
                }}
              >
                <div className="relative w-full h-full bg-white rounded-l-lg overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
                  <PageRenderer page={leftPage} hotspots={[]} isLeft={true} />
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity * 0.9}) 70%, rgba(0,0,0,${peelShadowOpacity * 1.4}) 100%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Navigation Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute right-4 md:right-8 lg:right-12 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-2xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          !canGoNext || turnDirection !== null
            ? 'opacity-20 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerNext()
        }}
        disabled={!canGoNext || turnDirection !== null}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </Button>
    </div>
  )
}
