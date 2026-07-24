import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface FlipbookMobileProps {
  pages: EditionPage[]
  hotspots: Hotspot[]
  onPageChange: (page: number) => void
  targetPage?: number
}

const DEBOUNCE_MS = 300
const FLICK_VELOCITY = 0.5
const FAST_FLICK_VELOCITY = 1.5
const DRAG_RATIO = 0.25
const EDGE_RESISTANCE = 0.3

export function FlipbookMobile({ pages, hotspots, onPageChange, targetPage }: FlipbookMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [peekRight, setPeekRight] = useState(false)
  const [peekLeft, setPeekLeft] = useState(false)

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
      setTranslateX(0)
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
    setTranslateX(0)
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
      if (dx < 5 && dy < 5) return
      td.direction = dx > dy ? 'horizontal' : 'vertical'
    }
    if (td.direction !== 'horizontal') return
    const t = e.touches[0]
    let delta = t.clientX - td.startX
    if ((currentIndex === 0 && delta > 0) || (currentIndex === pages.length - 1 && delta < 0)) {
      delta = delta * EDGE_RESISTANCE
    }
    td.lastX = t.clientX
    setTranslateX(delta)
    setPeekRight(delta < -10 && currentIndex < pages.length - 1)
    setPeekLeft(delta > 10 && currentIndex > 0)
  }

  const handleTouchEnd = () => {
    const td = touchData.current
    if (td.direction !== 'horizontal') {
      setIsSwiping(false)
      setPeekLeft(false)
      setPeekRight(false)
      return
    }
    const elapsed = Date.now() - td.startTime
    const delta = td.lastX - td.startX
    const velocity = elapsed > 0 ? Math.abs(delta) / elapsed : 0
    const width = containerRef.current?.offsetWidth || 300
    let move = 0
    if (velocity > FAST_FLICK_VELOCITY) move = 2
    else if (velocity > FLICK_VELOCITY || Math.abs(delta) > width * DRAG_RATIO) move = 1
    if (delta > 0) move = -move
    lastSwipeTime.current = Date.now()
    setIsSwiping(false)
    setPeekLeft(false)
    setPeekRight(false)
    goToPage(currentIndexRef.current + move)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-50"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full will-change-transform"
        style={{
          transform: `translateX(calc(${-currentIndex * 100}% + ${translateX}px))`,
          transition: isSwiping ? 'none' : 'transform 350ms ease-out',
        }}
      >
        {pages.map((p) => (
          <div
            key={p.id}
            className="w-full h-full flex-shrink-0 p-4 flex flex-col items-center justify-center"
          >
            <div
              className="w-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden relative"
              style={{
                aspectRatio: '0.7118',
                maxHeight: '80vh',
                maxWidth: 'min(100%, calc(80vh * 0.7118))',
              }}
            >
              <PageRenderer page={p} hotspots={hotspots.filter((h) => h.page === p.id)} />
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none transition-opacity duration-150',
          peekRight ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none transition-opacity duration-150',
          peekLeft ? 'opacity-100' : 'opacity-0',
        )}
      />

      {isSwiping &&
        ((currentIndex === 0 && translateX > 0) ||
          (currentIndex === pages.length - 1 && translateX < 0)) && (
          <div className="absolute inset-0 pointer-events-none border-2 border-orange-400/30 rounded-lg" />
        )}
    </div>
  )
}
