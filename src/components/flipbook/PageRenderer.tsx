import { EditionPage, Hotspot, getFileUrl } from '@/services/magazine'
import { HotspotMarker } from './HotspotMarker'
import { TemplateRenderer } from './TemplateRenderer'
import { SmartImage } from './SmartImage'
import { SubscriberCoverBadge } from '@/components/SubscriberCoverBadge'
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
          'w-full h-full bg-[#fdfcf9] flex items-center justify-center',
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

  const imageSrc = page.image_file ? getFileUrl(page, page.image_file) : page.image_url
  const hasImage = Boolean(imageSrc && imageSrc.trim() !== '')
  const hasTemplate = Boolean(
    (page.template && page.template !== 'default') ||
    (page.template === 'default' &&
      page.template_data &&
      Object.keys(page.template_data).length > 0),
  )

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#fdfcf9]"
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out flex items-center justify-center bg-[#fdfcf9]"
        style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
      >
        {/* Base off-white layer always present so there are never black gaps */}
        <div className="absolute inset-0 w-full h-full bg-[#fdfcf9] shadow-inner pointer-events-none" />

        {hasImage && (
          <SmartImage
            src={imageSrc}
            alt={`Página ${page.page_number}`}
            className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
            imgClassName="w-full h-full object-contain select-none"
          />
        )}

        {/* Template Overlay / Content */}
        {hasTemplate && (
          <div
            className={cn(
              'absolute inset-0 w-full h-full flex flex-col pointer-events-none overflow-hidden z-[2]',
              hasImage ? 'p-6 md:p-10' : 'p-4 md:p-8',
            )}
          >
            <div className="w-full h-full pointer-events-auto">
              <TemplateRenderer page={page} />
            </div>
          </div>
        )}

        {/* Cover subscriber badge for cover page */}
        {page.page_number <= 1 && zoom === 1 && (
          <div className="absolute top-4 right-4 z-40 pointer-events-auto">
            <SubscriberCoverBadge variant="floating" />
          </div>
        )}

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
