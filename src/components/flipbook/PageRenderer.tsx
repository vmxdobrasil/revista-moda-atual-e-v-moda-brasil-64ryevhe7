import { EditionPage, Hotspot, getFileUrl } from '@/services/magazine'
import { HotspotMarker } from './HotspotMarker'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PageRendererProps {
  page: EditionPage | null
  hotspots?: Hotspot[]
  isLeft?: boolean
}

export function PageRenderer({ page, hotspots = [], isLeft = false }: PageRendererProps) {
  const [zoom, setZoom] = useState(1)
  const [origin, setOrigin] = useState('center')

  if (!page) {
    return (
      <div
        className={cn(
          'w-full h-full bg-[#f4f4f4] flex items-center justify-center',
          isLeft ? 'rounded-l-md' : 'rounded-r-md',
        )}
      >
        <div className="w-12 h-full bg-gradient-to-r from-black/5 to-transparent absolute right-0" />
      </div>
    )
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoom === 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setOrigin(`${x}% ${y}%`)
      setZoom(2.5)
    } else {
      setZoom(1)
    }
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-white"
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center"
        style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
      >
        <img
          src={page.image_file ? getFileUrl(page, page.image_file) : page.image_url}
          alt={`Página ${page.page_number}`}
          className="w-full h-full object-contain select-none pointer-events-none"
        />
        {zoom === 1 && hotspots.map((h) => <HotspotMarker key={h.id} hotspot={h} />)}

        {/* Book shadow effect */}
        {isLeft ? (
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
        ) : (
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Page Number */}
      <div
        className={cn(
          'absolute bottom-4 text-xs font-medium text-gray-500 bg-white/50 px-2 py-1 rounded-sm backdrop-blur-sm pointer-events-none',
          isLeft ? 'left-4' : 'right-4',
        )}
      >
        {page.page_number > 0 ? page.page_number : ''}
      </div>
    </div>
  )
}
