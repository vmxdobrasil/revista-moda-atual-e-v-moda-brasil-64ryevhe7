import React, { useState, useRef, useEffect, useCallback } from 'react'
import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlipbookDesktopProps {
  pages: EditionPage[]
  hotspots: Hotspot[]
  currentSpread: number
  onSpreadChange: (spread: number) => void
}

export function FlipbookDesktop({
  pages,
  hotspots,
  currentSpread,
  onSpreadChange,
}: FlipbookDesktopProps) {
  // Padded pages so index 0 is null (left side of closed cover)
  // Spread 0: [null, page0 (Cover)]
  // Spread 1: [page1, page2]
  // Spread 2: [page3, page4], etc.
  const paddedPages = [null, ...pages]
  const maxSpread = Math.ceil(paddedPages.length / 2) - 1

  // Turning state: progress from 0 (not turned) to 1 (fully turned)
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null)
  const [turnProgress, setTurnProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [cornerHover, setCornerHover] = useState<'right' | 'left' | null>(null)

  const dragStartRef = useRef<{
    x: number
    y: number
    direction: 'next' | 'prev'
    startSpread: number
  } | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const bookRef = useRef<HTMLDivElement>(null)

  const L_curr = paddedPages[2 * currentSpread] || null
  const R_curr = paddedPages[2 * currentSpread + 1] || null

  const L_next = paddedPages[2 * (currentSpread + 1)] || null
  const R_next = paddedPages[2 * (currentSpread + 1) + 1] || null

  const L_prev = paddedPages[2 * (currentSpread - 1)] || null
  const R_prev = paddedPages[2 * (currentSpread - 1) + 1] || null

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
    if (turnDirection !== null || currentSpread >= maxSpread) return
    setTurnDirection('next')
    setTurnProgress(0.01)
    animateFlip('next', 0.01, 1, 650, () => {
      onSpreadChange(currentSpread + 1)
      setTurnDirection(null)
      setTurnProgress(0)
    })
  }, [turnDirection, currentSpread, maxSpread, animateFlip, onSpreadChange])

  const triggerPrev = useCallback(() => {
    if (turnDirection !== null || currentSpread <= 0) return
    setTurnDirection('prev')
    setTurnProgress(0.01)
    animateFlip('prev', 0.01, 1, 650, () => {
      onSpreadChange(currentSpread - 1)
      setTurnDirection(null)
      setTurnProgress(0)
    })
  }, [turnDirection, currentSpread, animateFlip, onSpreadChange])

  // Drag handling
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary button and if not clicking a button/hotspot
    if (e.button !== 0 || turnDirection !== null) return
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('.pointer-events-auto')) {
      return
    }

    if (!bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const halfWidth = rect.width / 2

    // Determine direction by which side was pressed
    if (clickX > halfWidth && currentSpread < maxSpread) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'next',
        startSpread: currentSpread,
      }
      setTurnDirection('next')
      setIsDragging(true)
      setTurnProgress(0.05)
    } else if (clickX <= halfWidth && currentSpread > 0) {
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        direction: 'prev',
        startSpread: currentSpread,
      }
      setTurnDirection('prev')
      setIsDragging(true)
      setTurnProgress(0.05)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !bookRef.current) return
    const rect = bookRef.current.getBoundingClientRect()
    const halfWidth = rect.width / 2
    const deltaX = e.clientX - dragStartRef.current.x

    if (dragStartRef.current.direction === 'next') {
      // Dragging from right to left (deltaX is negative)
      const ratio = Math.max(0, Math.min(1, -deltaX / (halfWidth * 0.95)))
      setTurnProgress(ratio)
    } else {
      // Dragging from left to right (deltaX is positive)
      const ratio = Math.max(0, Math.min(1, deltaX / (halfWidth * 0.95)))
      setTurnProgress(ratio)
    }
  }

  const handlePointerUp = () => {
    if (!isDragging || !dragStartRef.current) return
    setIsDragging(false)
    const { direction, startSpread } = dragStartRef.current
    dragStartRef.current = null

    // Threshold for completing the turn
    if (turnProgress > 0.3) {
      // Complete turn forward
      animateFlip(direction, turnProgress, 1, 350 * (1 - turnProgress) + 100, () => {
        if (direction === 'next') {
          onSpreadChange(startSpread + 1)
        } else {
          onSpreadChange(startSpread - 1)
        }
        setTurnDirection(null)
        setTurnProgress(0)
      })
    } else {
      // Revert turn back to 0
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
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        triggerNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        triggerPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerNext, triggerPrev])

  // Realistic Page Curl math
  // p ranges from 0 to 1
  const p = Math.max(0, Math.min(1, turnProgress))

  // Geometry calculations:
  // Base angle rotates from 0deg (flat) to -180deg (fully flipped)
  // During mid-curl, there is an elastic parabolic bend and realistic page peel
  const rotateYNext = -p * 180
  const rotateYPrev = p * 180

  // Curvature intensity peaking around p = 0.5
  const curlArch = Math.sin(p * Math.PI) * 28 // degrees of curl fold
  const peelShadowOpacity = Math.sin(p * Math.PI) * 0.65
  const spineShadowIntensity = 0.35 + Math.sin(p * Math.PI) * 0.25

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none"
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
          'absolute left-3 lg:left-10 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          currentSpread === 0 || turnDirection !== null
            ? 'opacity-30 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerPrev()
        }}
        disabled={currentSpread === 0 || turnDirection !== null}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </Button>

      {/* Book Container with 3D perspective and subtle depth */}
      <div
        ref={bookRef}
        className={cn(
          'relative perspective-book rounded-md shadow-2xl mx-auto transition-shadow duration-300',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        style={{
          aspectRatio: '1.4237',
          height: '76vh',
          maxHeight: '76vh',
          width: 'calc(76vh * 1.4237)',
          maxWidth: 'min(92vw, calc(76vh * 1.4237))',
          perspective: '2400px',
        }}
      >
        {/* Soft underneath ambient shadow for realism */}
        <div className="absolute -inset-4 bg-black/40 blur-2xl -z-10 rounded-2xl pointer-events-none" />

        {/* LEFT BASE PAGE */}
        <div className="absolute left-0 top-0 w-1/2 h-full rounded-l-md overflow-hidden bg-white shadow-[inset_-12px_0_24px_rgba(0,0,0,0.06)]">
          <PageRenderer
            page={turnDirection === 'prev' ? L_prev : L_curr}
            hotspots={getHotspotsForPage(turnDirection === 'prev' ? L_prev?.id : L_curr?.id)}
            isLeft
          />
          {/* Subtle shadow falling from turning right page */}
          {turnDirection === 'next' && p > 0.5 && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/30 pointer-events-none transition-opacity"
              style={{ opacity: (p - 0.5) * 2 * 0.4 }}
            />
          )}
        </div>

        {/* RIGHT BASE PAGE */}
        <div className="absolute right-0 top-0 w-1/2 h-full rounded-r-md overflow-hidden border-l border-black/10 bg-white shadow-[inset_12px_0_24px_rgba(0,0,0,0.06)]">
          <PageRenderer
            page={turnDirection === 'next' ? R_next : R_curr}
            hotspots={getHotspotsForPage(turnDirection === 'next' ? R_next?.id : R_curr?.id)}
          />
          {/* Subtle shadow falling from turning left page */}
          {turnDirection === 'prev' && p > 0.5 && (
            <div
              className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/30 pointer-events-none transition-opacity"
              style={{ opacity: (p - 0.5) * 2 * 0.4 }}
            />
          )}
        </div>

        {/* ========================================================================= */}
        {/* REALISTIC PAGE CURL: NEXT SPREAD (Right page curls and flips over to Left) */}
        {/* ========================================================================= */}
        {turnDirection === 'next' && (
          <div
            className="absolute right-0 top-0 w-1/2 h-full transform-style-3d origin-left z-20 pointer-events-none"
            style={{
              transform: `rotateY(${rotateYNext}deg) rotateZ(${-curlArch * 0.12}deg) skewY(${curlArch * 0.08}deg)`,
              transformOrigin: 'left center',
              transition: isDragging ? 'none' : 'transform 100ms linear',
            }}
          >
            {/* FRONT FACE OF TURNING PAGE (R_curr) */}
            <div
              className="absolute inset-0 backface-hidden bg-white rounded-r-md overflow-hidden shadow-[-18px_0_35px_rgba(0,0,0,0.35)]"
              style={{
                clipPath:
                  p < 0.5 ? `polygon(0% 0%, 100% 0%, ${100 - p * 30}% 100%, 0% 100%)` : undefined,
              }}
            >
              <PageRenderer page={R_curr} hotspots={[]} />
              {/* Dynamic light reflection and curling highlight on the front */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to left, rgba(255,255,255,0.45) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                }}
              />
              {/* Crease line on curl */}
              <div
                className="absolute right-0 inset-y-0 w-12 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.15), rgba(255,255,255,0.4), rgba(0,0,0,0.2))',
                  opacity: Math.sin(p * Math.PI),
                }}
              />
            </div>

            {/* BACK FACE OF TURNING PAGE (L_next) */}
            <div
              className="absolute inset-0 backface-hidden border-r border-black/10 bg-white rounded-l-md overflow-hidden shadow-[18px_0_35px_rgba(0,0,0,0.35)]"
              style={{
                transform: 'rotateY(180deg)',
                clipPath:
                  p > 0.5 ? `polygon(0% 0%, 100% 0%, 100% 100%, ${(1 - p) * 30}% 100%)` : undefined,
              }}
            >
              <PageRenderer page={L_next} hotspots={[]} isLeft />
              {/* Dynamic shadow and paper highlight on back face */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                }}
              />
              {/* Crease reflection */}
              <div
                className="absolute left-0 inset-y-0 w-12 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to left, rgba(0,0,0,0.15), rgba(255,255,255,0.4), rgba(0,0,0,0.2))',
                  opacity: Math.sin(p * Math.PI),
                }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REALISTIC PAGE CURL: PREV SPREAD (Left page curls and flips back to Right) */}
        {/* ========================================================================= */}
        {turnDirection === 'prev' && (
          <div
            className="absolute left-0 top-0 w-1/2 h-full transform-style-3d origin-right z-20 pointer-events-none"
            style={{
              transform: `rotateY(${rotateYPrev}deg) rotateZ(${curlArch * 0.12}deg) skewY(${-curlArch * 0.08}deg)`,
              transformOrigin: 'right center',
              transition: isDragging ? 'none' : 'transform 100ms linear',
            }}
          >
            {/* FRONT FACE OF TURNING PAGE (L_curr) */}
            <div
              className="absolute inset-0 backface-hidden border-r border-black/10 bg-white rounded-l-md overflow-hidden shadow-[18px_0_35px_rgba(0,0,0,0.35)]"
              style={{
                clipPath:
                  p < 0.5 ? `polygon(0% 0%, 100% 0%, 100% 100%, ${p * 30}% 100%)` : undefined,
              }}
            >
              <PageRenderer page={L_curr} hotspots={[]} isLeft />
              {/* Dynamic shadow on the front face */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, rgba(255,255,255,0.45) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
                }}
              />
              <div
                className="absolute left-0 inset-y-0 w-12 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to left, rgba(0,0,0,0.15), rgba(255,255,255,0.4), rgba(0,0,0,0.2))',
                  opacity: Math.sin(p * Math.PI),
                }}
              />
            </div>

            {/* BACK FACE OF TURNING PAGE (R_prev) */}
            <div
              className="absolute inset-0 backface-hidden bg-white rounded-r-md overflow-hidden shadow-[-18px_0_35px_rgba(0,0,0,0.35)]"
              style={{
                transform: 'rotateY(180deg)',
                clipPath:
                  p > 0.5
                    ? `polygon(0% 0%, 100% 0%, ${100 - (1 - p) * 30}% 100%, 0% 100%)`
                    : undefined,
              }}
            >
              <PageRenderer page={R_prev} hotspots={[]} />
              {/* Dynamic shadow on back face */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(to left, rgba(255,255,255,0.4) 0%, rgba(0,0,0,${peelShadowOpacity}) 60%, rgba(0,0,0,${peelShadowOpacity * 1.3}) 100%)`,
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
          </div>
        )}

        {/* Central Book Spine shadow (physical depth) */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-14 -ml-7 pointer-events-none z-30"
          style={{
            background: `linear-gradient(to right, transparent 0%, rgba(0,0,0,${spineShadowIntensity * 0.7}) 45%, rgba(0,0,0,${spineShadowIntensity}) 50%, rgba(0,0,0,${spineShadowIntensity * 0.7}) 55%, transparent 100%)`,
          }}
        />

        {/* Interactive corner curl cues when hovering near the page corner */}
        {currentSpread < maxSpread && turnDirection === null && (
          <div
            className="absolute bottom-0 right-0 w-20 h-20 z-20 cursor-pointer overflow-hidden rounded-br-md group"
            onMouseEnter={() => setCornerHover('right')}
            onMouseLeave={() => setCornerHover(null)}
            onClick={(e) => {
              e.stopPropagation()
              triggerNext()
            }}
            title="Virar página"
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

        {currentSpread > 0 && turnDirection === null && (
          <div
            className="absolute bottom-0 left-0 w-20 h-20 z-20 cursor-pointer overflow-hidden rounded-bl-md group"
            onMouseEnter={() => setCornerHover('left')}
            onMouseLeave={() => setCornerHover(null)}
            onClick={(e) => {
              e.stopPropagation()
              triggerPrev()
            }}
            title="Voltar página"
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
          'absolute right-3 lg:right-10 z-30 w-12 h-12 rounded-full',
          'bg-slate-900/80 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur',
          'active:scale-90 transition-all duration-150',
          currentSpread >= maxSpread || turnDirection !== null
            ? 'opacity-30 pointer-events-none'
            : 'opacity-90 hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation()
          triggerNext()
        }}
        disabled={currentSpread >= maxSpread || turnDirection !== null}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-7 h-7 text-white" />
      </Button>
    </div>
  )
}
