import React, { useState, useRef, useEffect, useCallback } from 'react'
import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FlipbookDesktopProps {
  pages: EditionPage[]
  hotspots: Hotspot[]
  currentPage: number
  onPageChange: (page: number) => void
  /** Backwards compatibility alias if passed */
  currentSpread?: number
  onSpreadChange?: (spread: number) => void
}

export function FlipbookDesktop({
  pages,
  hotspots,
  currentPage: propCurrentPage,
  onPageChange,
  currentSpread,
  onSpreadChange,
}: FlipbookDesktopProps) {
  // Support either currentPage or legacy currentSpread
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

  // Turning state: progress from 0 (not turned) to 1 (fully turned)
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null)
  const [turnProgress, setTurnProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [cornerHover, setCornerHover] = useState<'right' | 'left' | null>(null)

  const dragStartRef = useRef<{
    x: number
    y: number
    direction: 'next' | 'prev'
    startPage: number
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

  const triggerNext = useCallback(() => {
    if (turnDirection !== null || pageIndex >= maxPage) return
    setTurnDirection('next')
    setTurnProgress(0.01)
    animateFlip('next', 0.01, 1, 600, () => {
      handlePageSelect(pageIndex + 1)
      setTurnDirection(null)
      setTurnProgress(0)
    })
  }, [turnDirection, pageIndex, maxPage, animateFlip, handlePageSelect])

  const triggerPrev = useCallback(() => {
    if (turnDirection !== null || pageIndex <= 0) return
    setTurnDirection('prev')
    setTurnProgress(0.01)
    animateFlip('prev', 0.01, 1, 600, () => {
      handlePageSelect(pageIndex - 1)
      setTurnDirection(null)
      setTurnProgress(0)
    })
  }, [turnDirection, pageIndex, animateFlip, handlePageSelect])

  // Drag handling
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

    if (clickX > halfWidth && pageIndex < maxPage) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'next',
        startPage: pageIndex,
      }
      setTurnDirection('next')
      setIsDragging(true)
      setTurnProgress(0.05)
    } else if (clickX <= halfWidth && pageIndex > 0) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'prev',
        startPage: pageIndex,
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
    const { direction, startPage } = dragStartRef.current
    dragStartRef.current = null

    if (turnProgress > 0.25) {
      animateFlip(direction, turnProgress, 1, 350 * (1 - turnProgress) + 100, () => {
        if (direction === 'next') {
          handlePageSelect(startPage + 1)
        } else {
          handlePageSelect(startPage - 1)
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

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none p-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Left Navigation Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute left-4 md:left-8 lg:left-12 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-2xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          pageIndex === 0 || turnDirection !== null
            ? 'opacity-20 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerPrev()
        }}
        disabled={pageIndex === 0 || turnDirection !== null}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </Button>

      {/* Vertical Magazine Container (21cm × 29.5cm portrait, ratio 210/295 ≈ 0.71186) */}
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

        {/* ========================================================================= */}
        {/* REALISTIC PAGE CURL: NEXT PAGE (Current page curls and flips over to reveal Next) */}
        {/* ========================================================================= */}
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
              {/* Dynamic lighting & shadow on curling front face */}
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
                  p > 0.5 ? `polygon(0% 0%, 100% 0%, 100% 100%, ${(1 - p) * 30}% 100%)` : undefined,
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

        {/* ========================================================================= */}
        {/* REALISTIC PAGE CURL: PREV PAGE (Curling back from left to right) */}
        {/* ========================================================================= */}
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
                    ? `polygon(0% 0%, 100% 0%, ${100 - (1 - p) * 30}% 100%, 0% 100%)`
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

        {/* Interactive corner curl cues when hovering near page corners */}
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

      {/* Right Navigation Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute right-4 md:right-8 lg:right-12 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-2xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          pageIndex >= maxPage || turnDirection !== null
            ? 'opacity-20 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerNext()
        }}
        disabled={pageIndex >= maxPage || turnDirection !== null}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </Button>
    </div>
  )
}
