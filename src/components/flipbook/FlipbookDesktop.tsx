import { useState } from 'react'
import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null)

  // Pad pages so index 0 is null (left side of cover)
  const paddedPages = [null, ...pages]
  const maxSpread = Math.ceil(paddedPages.length / 2) - 1

  const L_curr = paddedPages[2 * currentSpread] || null
  const R_curr = paddedPages[2 * currentSpread + 1] || null

  const handleNext = () => {
    if (isFlipping || currentSpread >= maxSpread) return
    setFlipDirection('next')
    setIsFlipping(true)
    setTimeout(() => {
      onSpreadChange(currentSpread + 1)
      setIsFlipping(false)
      setFlipDirection(null)
    }, 700)
  }

  const handlePrev = () => {
    if (isFlipping || currentSpread <= 0) return
    setFlipDirection('prev')
    setIsFlipping(true)
    setTimeout(() => {
      onSpreadChange(currentSpread - 1)
      setIsFlipping(false)
      setFlipDirection(null)
    }, 700)
  }

  const isNext = flipDirection === 'next'
  const isPrev = flipDirection === 'prev'

  const L_next = isNext ? paddedPages[2 * (currentSpread + 1)] || null : null
  const R_next = isNext ? paddedPages[2 * (currentSpread + 1) + 1] || null : null

  const L_prev = isPrev ? paddedPages[2 * (currentSpread - 1)] || null : null
  const R_prev = isPrev ? paddedPages[2 * (currentSpread - 1) + 1] || null : null

  const getHotspotsForPage = (pageId?: string) =>
    pageId ? hotspots.filter((h) => h.page === pageId) : []

  const [startX, setStartX] = useState(0)
  const handlePointerDown = (e: React.PointerEvent) => setStartX(e.clientX)
  const handlePointerUp = (e: React.PointerEvent) => {
    const delta = e.clientX - startX
    if (delta < -100) handleNext()
    else if (delta > 100) handlePrev()
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 lg:left-12 z-10 w-12 h-12 rounded-full bg-white/50 hover:bg-white/90 backdrop-blur shadow-md active:scale-90 transition-transform duration-100"
        onClick={(e) => {
          e.stopPropagation()
          handlePrev()
        }}
        disabled={currentSpread === 0 || isFlipping}
      >
        <ChevronLeft className="w-8 h-8 text-gray-700" />
      </Button>

      <div
        className="relative perspective-book shadow-2xl rounded-md bg-[#f4f4f4] mx-auto transition-transform w-[90vw] lg:w-auto"
        style={{ aspectRatio: '1.4237', maxHeight: '85vh', maxWidth: 'calc(85vh * 1.4237)' }}
      >
        {/* Left Base */}
        <div className="absolute left-0 top-0 w-1/2 h-full rounded-l-md overflow-hidden bg-white">
          <PageRenderer
            page={isPrev ? L_prev : L_curr}
            hotspots={getHotspotsForPage(isPrev ? L_prev?.id : L_curr?.id)}
            isLeft
          />
        </div>

        {/* Right Base */}
        <div className="absolute right-0 top-0 w-1/2 h-full rounded-r-md overflow-hidden border-l border-black/10 bg-white">
          <PageRenderer
            page={isNext ? R_next : R_curr}
            hotspots={getHotspotsForPage(isNext ? R_next?.id : R_curr?.id)}
          />
        </div>

        {/* Flipping Page */}
        {isFlipping && isNext && (
          <div className="absolute right-0 top-0 w-1/2 h-full transform-style-3d origin-left animate-flip-next z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] rounded-l-md rounded-r-md">
            <div className="absolute inset-0 backface-hidden bg-white rounded-r-md overflow-hidden">
              <PageRenderer page={R_curr} hotspots={[]} />
              <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent opacity-0 animate-flip-shadow-front pointer-events-none" />
            </div>
            <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] border-r border-black/10 bg-white rounded-l-md overflow-hidden">
              <PageRenderer page={L_next} hotspots={[]} isLeft />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-100 animate-flip-shadow-back pointer-events-none" />
            </div>
          </div>
        )}

        {isFlipping && isPrev && (
          <div className="absolute left-0 top-0 w-1/2 h-full transform-style-3d origin-right animate-flip-prev z-20 shadow-[10px_0_20px_rgba(0,0,0,0.2)] rounded-r-md rounded-l-md">
            <div className="absolute inset-0 backface-hidden border-r border-black/10 bg-white rounded-l-md overflow-hidden">
              <PageRenderer page={L_curr} hotspots={[]} isLeft />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 animate-flip-shadow-front pointer-events-none" />
            </div>
            <div className="absolute inset-0 backface-hidden [transform:rotateY(180deg)] bg-white rounded-r-md overflow-hidden">
              <PageRenderer page={R_prev} hotspots={[]} />
              <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent opacity-100 animate-flip-shadow-back pointer-events-none" />
            </div>
          </div>
        )}

        {/* Spine shadow */}
        <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-transparent via-black/40 to-transparent pointer-events-none z-30" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 lg:right-12 z-10 w-12 h-12 rounded-full bg-white/50 hover:bg-white/90 backdrop-blur shadow-md active:scale-90 transition-transform duration-100"
        onClick={(e) => {
          e.stopPropagation()
          handleNext()
        }}
        disabled={currentSpread >= maxSpread || isFlipping}
      >
        <ChevronRight className="w-8 h-8 text-gray-700" />
      </Button>
    </div>
  )
}
