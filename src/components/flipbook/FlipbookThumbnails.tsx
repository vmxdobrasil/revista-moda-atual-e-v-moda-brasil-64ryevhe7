import { useRef, useEffect } from 'react'
import { EditionPage, getFileUrl } from '@/services/magazine'
import { SmartImage } from './SmartImage'
import { TemplateRenderer } from './TemplateRenderer'
import { cn } from '@/lib/utils'

interface PageThumbnailProps {
  page: EditionPage | null
  pageNumber: number
  isCover?: boolean
  isActive: boolean
  onClick: () => void
}

export function PageThumbnail({
  page,
  pageNumber,
  isCover = false,
  isActive,
  onClick,
}: PageThumbnailProps) {
  const itemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isActive && itemRef.current) {
      itemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [isActive])

  const rawImageUrl = page?.image_file ? getFileUrl(page, page.image_file) : page?.image_url || ''
  const imageUrl = rawImageUrl && rawImageUrl.trim() !== '' ? rawImageUrl : ''
  const hasTemplate = Boolean(
    page &&
    ((page.template && page.template !== 'default') ||
      (page.template === 'default' &&
        page.template_data &&
        Object.keys(page.template_data).length > 0)),
  )

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center flex-shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c]',
        'cursor-pointer active:scale-95',
      )}
      title={isCover ? 'Capa' : `Página ${pageNumber}`}
      aria-label={isCover ? 'Ir para Capa' : `Ir para Página ${pageNumber}`}
    >
      <div
        className={cn(
          'relative w-12 sm:w-14 md:w-16 h-16 sm:h-20 md:h-22 rounded-sm overflow-hidden bg-slate-800 transition-all duration-200 shadow-md',
          isActive
            ? 'ring-2 ring-[#ea580c] ring-offset-2 ring-offset-slate-900 scale-105 shadow-[0_0_12px_rgba(234,88,12,0.4)]'
            : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-white/40 group-hover:scale-102',
        )}
      >
        {imageUrl ? (
          <SmartImage
            src={imageUrl}
            alt={isCover ? 'Capa' : `Pág ${pageNumber}`}
            className="w-full h-full pointer-events-none"
            imgClassName="w-full h-full object-cover select-none"
          />
        ) : hasTemplate && page ? (
          /* Template-only preview */
          <div className="w-full h-full relative bg-[#fdfcf9] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left transform scale-[0.25] overflow-hidden p-2 pointer-events-none">
              <TemplateRenderer page={page} />
            </div>
          </div>
        ) : (
          /* Visual styled fallback placeholder when no image and no template */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-slate-700/50 text-slate-300">
            <span className="text-[10px] font-bold tracking-wider text-orange-500/90 uppercase font-mono">
              PÁG
            </span>
            <span className="text-xs font-black text-slate-100 font-mono leading-none mt-0.5">
              {pageNumber}
            </span>
          </div>
        )}

        {/* Scaled template overlay preview for pages that have BOTH image and template */}
        {imageUrl && hasTemplate && page && (
          <div className="absolute inset-0 w-[400%] h-[400%] origin-top-left transform scale-[0.25] pointer-events-none overflow-hidden opacity-90 p-2">
            <TemplateRenderer page={page} />
          </div>
        )}

        {/* Highlight badge overlay */}
        {isActive && <div className="absolute bottom-0 inset-x-0 h-1 bg-[#ea580c]" />}
      </div>

      <span
        className={cn(
          'mt-1 text-[10px] sm:text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150',
          isActive ? 'text-[#ea580c] font-semibold' : 'text-slate-400 group-hover:text-slate-200',
        )}
      >
        {isCover ? 'Capa' : `Pág ${pageNumber}`}
      </span>
    </button>
  )
}

interface FlipbookThumbnailsProps {
  pages: EditionPage[]
  currentPage: number
  currentSpread?: number
  isMobile?: boolean
  onSelectPage: (index: number) => void
  className?: string
}

export function FlipbookThumbnails({
  pages,
  currentPage,
  currentSpread = 0,
  isMobile = false,
  onSelectPage,
  className,
}: FlipbookThumbnailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // In desktop mode, a spread corresponds to left & right page
  const isPageActive = (index: number) => {
    if (isMobile) {
      return index === currentPage
    }
    if (currentSpread === 0) {
      return index === 0 // Cover is spread 0
    }
    const leftIndex = 2 * currentSpread - 1
    const rightIndex = 2 * currentSpread
    return index === leftIndex || index === rightIndex
  }

  return (
    <div
      className={cn(
        'w-full bg-slate-900/95 border-t border-slate-800 backdrop-blur-md px-3 sm:px-6 py-2 shrink-0 select-none z-30 transition-all duration-200',
        className,
      )}
    >
      <div
        ref={containerRef}
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent py-1 px-2 max-w-7xl mx-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 transparent',
        }}
      >
        {pages.map((p, index) => {
          const isCover = index === 0
          const displayNum = p.page_number > 0 ? p.page_number : index + 1
          const active = isPageActive(index)

          return (
            <PageThumbnail
              key={p.id || `page-${index}`}
              page={p}
              pageNumber={displayNum}
              isCover={isCover}
              isActive={active}
              onClick={() => onSelectPage(index)}
            />
          )
        })}
      </div>
    </div>
  )
}
