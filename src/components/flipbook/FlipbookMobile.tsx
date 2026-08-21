import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FlipbookMobileProps {
  pages: EditionPage[]
  hotspots: Hotspot[]
  onPageChange: (page: number) => void
  targetPage?: number
}

const DEBOUNCE_MS = 250
const FLICK_VELOCITY = 0.4
const DRAG_THRESHOLD_RATIO = 0.2

export function FlipbookMobile({ pages, hotspots, onPageChange, targetPage }: FlipbookMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isCurlActive, setIsCurlActive] = useState(false)
  const [curlDirection, setCurlDirection] = useState<'next' | 'prev' | null>(null)

  const touchData = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    direction: null as 'horizontal' | 'vertical' | null,
  })
  const isAnimating = useRef(false)
  const lastSwipeTime = useRef(0)
  const currentIndexRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const onPageChangeRef = useRef(onPageChange)
  onPageChangeRef.current = onPageChange

  const goToPage = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(pages.length - 1, index))
      setCurrentIndex(clamped)
      currentIndexRef.current = clamped
      setDragOffset(0)
      setIsCurlActive(false)
      setCurlDirection(null)
      onPageChangeRef.current(clamped)
      isAnimating.current = true
      setTimeout(() => {
        isAnimating.current = false
      }, 350)
    },
    [pages.length],
  )

  useEffect(() => {
    if (targetPage !== undefined && targetPage !== currentIndexRef.current) {
      goToPage(targetPage)
    }
  }, [targetPage, goToPage])

  useEffect(() => {
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setDragOffset(0)
    setIsCurlActive(false)
    setCurlDirection(null)
    onPageChangeRef.current(0)
  }, [pages])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating.current) return
    if (Date.now() - lastSwipeTime.current < DEBOUNCE_MS) return
    const t = e.touches[0]
    touchData.current = {
      startX: t.clientX,
      startY: t.clientY,
      startTime: Date.now(),
      lastX: t.clientX,
      direction: null,
    }
    setIsSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const td = touchData.current
    if (!td.direction) {
      const t = e.touches[0]
      const dx = Math.abs(t.clientX - td.startX)
      const dy = Math.abs(t.clientY - td.startY)
      if (dx < 6 && dy < 6) return
      td.direction = dx > dy ? 'horizontal' : 'vertical'
    }
    if (td.direction !== 'horizontal') return

    const t = e.touches[0]
    let delta = t.clientX - td.startX

    // Elastic resistance at the ends
    if (
      (currentIndexRef.current === 0 && delta > 0) ||
      (currentIndexRef.current === pages.length - 1 && delta < 0)
    ) {
      delta = delta * 0.25
    }

    td.lastX = t.clientX
    setDragOffset(delta)

    if (delta < -15 && currentIndexRef.current < pages.length - 1) {
      setIsCurlActive(true)
      setCurlDirection('next')
    } else if (delta > 15 && currentIndexRef.current > 0) {
      setIsCurlActive(true)
      setCurlDirection('prev')
    } else {
      setIsCurlActive(false)
      setCurlDirection(null)
    }
  }

  const handleTouchEnd = () => {
    const td = touchData.current
    if (td.direction !== 'horizontal') {
      setIsSwiping(false)
      setDragOffset(0)
      setIsCurlActive(false)
      setCurlDirection(null)
      return
    }

    const elapsed = Date.now() - td.startTime
    const delta = td.lastX - td.startX
    const velocity = elapsed > 0 ? Math.abs(delta) / elapsed : 0
    const width = containerRef.current?.offsetWidth || 320

    let move = 0
    if (velocity > FLICK_VELOCITY || Math.abs(delta) > width * DRAG_THRESHOLD_RATIO) {
      move = delta < 0 ? 1 : -1
    }

    lastSwipeTime.current = Date.now()
    setIsSwiping(false)
    setIsCurlActive(false)
    setCurlDirection(null)
    setDragOffset(0)

    goToPage(currentIndexRef.current + move)
  }

  const currentPageObj = pages[currentIndex] || null
  const nextPageObj = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null
  const prevPageObj = currentIndex > 0 ? pages[currentIndex - 1] : null

  const getHotspotsForPage = (pageId?: string) =>
    pageId ? hotspots.filter((h) => h.page === pageId) : []

  // Dynamic curl calculation for mobile
  const width = containerRef.current?.offsetWidth || 340
  const dragRatio = Math.min(1, Math.abs(dragOffset) / width)
  const curlAngle = dragRatio * 45
  const curlShadow = Math.sin(dragRatio * Math.PI) * 0.5

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center select-none"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Container aspect ratio */}
      <div
        className="relative w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-center p-3"
        style={{
          aspectRatio: '0.7118',
          maxHeight: '74vh',
        }}
      >
        {/* Soft background glow */}
        <div className="absolute -inset-2 bg-black/30 blur-xl -z-10 rounded-lg pointer-events-none" />

        {/* UNDERLYING NEXT PAGE (visible when dragging NEXT) */}
        {nextPageObj && curlDirection === 'next' && (
          <div className="absolute inset-3 rounded-md overflow-hidden bg-white shadow-xl z-0 pointer-events-none">
            <PageRenderer page={nextPageObj} hotspots={getHotspotsForPage(nextPageObj.id)} />
            {/* Shadow cast over the underlying page by the curled overlay */}
            <div
              className="absolute inset-0 bg-black/40 pointer-events-none"
              style={{ opacity: (1 - dragRatio) * 0.6 }}
            />
          </div>
        )}

        {/* UNDERLYING PREV PAGE (visible when dragging PREV) */}
        {prevPageObj && curlDirection === 'prev' && (
          <div className="absolute inset-3 rounded-md overflow-hidden bg-white shadow-xl z-0 pointer-events-none">
            <PageRenderer page={prevPageObj} hotspots={getHotspotsForPage(prevPageObj.id)} />
            <div
              className="absolute inset-0 bg-black/40 pointer-events-none"
              style={{ opacity: dragRatio * 0.4 }}
            />
          </div>
        )}

        {/* MAIN / CURRENT PAGE with dynamic Page Curl */}
        <div
          className={cn(
            'w-full h-full bg-white rounded-md overflow-hidden shadow-2xl relative z-10 will-change-transform',
            !isSwiping && 'transition-transform duration-300 ease-out',
          )}
          style={{
            transform: isSwiping
              ? curlDirection === 'next'
                ? `translateX(${dragOffset * 0.85}px) rotateZ(${-curlAngle * 0.15}deg) skewY(${curlAngle * 0.08}deg)`
                : curlDirection === 'prev'
                  ? `translateX(${dragOffset * 0.85}px) rotateZ(${curlAngle * 0.15}deg) skewY(${-curlAngle * 0.08}deg)`
                  : `translateX(${dragOffset}px)`
              : 'translateX(0px)',
            transformOrigin: curlDirection === 'next' ? 'left bottom' : 'right bottom',
            clipPath:
              isSwiping && isCurlActive && curlDirection === 'next'
                ? `polygon(0% 0%, ${100 - dragRatio * 35}% 0%, 100% 100%, 0% 100%)`
                : isSwiping && isCurlActive && curlDirection === 'prev'
                  ? `polygon(${dragRatio * 35}% 0%, 100% 0%, 100% 100%, 0% 100%)`
                  : undefined,
          }}
        >
          <PageRenderer page={currentPageObj} hotspots={getHotspotsForPage(currentPageObj?.id)} />

          {/* Dynamic Page Curl Lighting & Shadow Shading on swipe */}
          {isSwiping && isCurlActive && (
            <>
              {/* Spine / Curl depth shadow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    curlDirection === 'next'
                      ? `linear-gradient(to left, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${curlShadow}) 60%, rgba(0,0,0,${curlShadow * 1.5}) 100%)`
                      : `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${curlShadow}) 60%, rgba(0,0,0,${curlShadow * 1.5}) 100%)`,
                }}
              />
              {/* Crease line reflection */}
              <div
                className={cn(
                  'absolute inset-y-0 w-8 pointer-events-none',
                  curlDirection === 'next' ? 'right-0' : 'left-0',
                )}
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.2), rgba(255,255,255,0.5), rgba(0,0,0,0.2))',
                  opacity: Math.sin(dragRatio * Math.PI),
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Floating subtle previous/next buttons for mobile comfort */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goToPage(currentIndex - 1)
          }}
          className="absolute left-2 z-20 w-9 h-9 rounded-full bg-slate-900/70 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {currentIndex < pages.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            goToPage(currentIndex + 1)
          }}
          className="absolute right-2 z-20 w-9 h-9 rounded-full bg-slate-900/70 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
