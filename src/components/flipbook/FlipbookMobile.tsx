import { EditionPage, Hotspot } from '@/services/magazine'
import { PageRenderer } from './PageRenderer'
import { useEffect, useRef } from 'react'

export function FlipbookMobile({
  pages,
  hotspots,
  onPageChange,
}: {
  pages: EditionPage[]
  hotspots: Hotspot[]
  onPageChange: (page: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0
        let maxTarget = null
        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio
            maxTarget = entry.target
          }
        })
        if (maxTarget) {
          const pageNum = parseInt((maxTarget as HTMLElement).getAttribute('data-page') || '0', 10)
          onPageChange(pageNum)
        }
      },
      { threshold: [0.3, 0.6, 0.9] },
    )

    const elements = containerRef.current?.querySelectorAll('.mobile-page')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [onPageChange])

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex bg-gray-50"
    >
      {pages.map((p, i) => (
        <div
          key={p.id}
          data-page={i}
          className="mobile-page w-full h-full flex-shrink-0 snap-center p-4 flex flex-col items-center justify-center"
        >
          <div
            className="w-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-sm overflow-hidden shrink-0 mx-auto relative"
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
  )
}
