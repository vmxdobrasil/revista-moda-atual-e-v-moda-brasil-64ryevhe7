import { useRef, useEffect } from 'react'
import { EditionPage, getFileUrl } from '@/services/magazine'
import { SmartImage } from './SmartImage'
import { TemplateRenderer } from './TemplateRenderer'
import { cn } from '@/lib/utils'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageThumbnailProps {
  page: EditionPage | null
  pageNumber: number
  isCover?: boolean
  isActive: boolean
  onClick: () => void
  layout?: 'vertical' | 'horizontal'
}

export function PageThumbnail({
  page,
  pageNumber,
  isCover = false,
  isActive,
  onClick,
  layout = 'vertical',
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

  const isVertical = layout === 'vertical'

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex items-center flex-shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ea580c] rounded-md p-1.5 cursor-pointer',
        isVertical ? 'w-full flex-col' : 'flex-col',
        isActive ? 'bg-slate-800/80 shadow-sm' : 'hover:bg-slate-800/40 text-slate-400',
      )}
      title={isCover ? 'Capa' : `Página ${pageNumber}`}
      aria-label={isCover ? 'Ir para Capa' : `Ir para Página ${pageNumber}`}
    >
      <div
        className={cn(
          'relative rounded overflow-hidden bg-slate-800 transition-all duration-200 shadow-md',
          isVertical ? 'w-full aspect-[210/295]' : 'w-12 sm:w-14 md:w-16 h-16 sm:h-20 md:h-22',
          isActive
            ? 'ring-2 ring-[#ea580c] ring-offset-2 ring-offset-slate-900 shadow-[0_0_14px_rgba(234,88,12,0.45)]'
            : 'opacity-70 hover:opacity-100 hover:ring-1 hover:ring-white/40 group-hover:scale-[1.02]',
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
            <span className="text-[9px] font-bold tracking-wider text-orange-500/90 uppercase font-mono">
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

      <div className="mt-1 flex items-center justify-between w-full px-0.5">
        <span
          className={cn(
            'text-[10px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150',
            isActive ? 'text-[#ea580c] font-semibold' : 'text-slate-400 group-hover:text-slate-200',
          )}
        >
          {isCover ? 'Capa' : `Pág ${pageNumber}`}
        </span>
        {page?.toc_title && isVertical && (
          <span className="text-[9px] text-slate-500 truncate ml-1 max-w-[60px] text-right font-normal">
            {page.toc_title}
          </span>
        )}
      </div>
    </button>
  )
}

export interface FlipbookThumbnailsProps {
  pages: EditionPage[]
  currentPage: number
  onSelectPage: (index: number) => void
  layout?: 'vertical' | 'horizontal'
  collapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
  viewMode?: 'single' | 'double'
}

export function FlipbookThumbnails({
  pages,
  currentPage,
  onSelectPage,
  layout = 'vertical',
  collapsed = false,
  onToggleCollapse,
  className,
  viewMode = 'single',
}: FlipbookThumbnailsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const isPageActive = (index: number) => {
    if (viewMode === 'double') {
      if (index === 0) return currentPage === 0
      // In double mode, if currentPage is 1 or 2, both pages 1 & 2 belong to the active spread
      const activeSpread = currentPage === 0 ? 0 : Math.floor((currentPage - 1) / 2) + 1
      const itemSpread = index === 0 ? 0 : Math.floor((index - 1) / 2) + 1
      return activeSpread === itemSpread
    }
    return index === currentPage
  }

  if (layout === 'horizontal') {
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
                layout="horizontal"
                onClick={() => onSelectPage(index)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'h-full bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-md flex flex-col shrink-0 select-none z-30 transition-all duration-300 relative',
        collapsed ? 'w-12' : 'w-36 sm:w-40 md:w-44 lg:w-48',
        className,
      )}
      aria-label="Miniaturas de páginas"
    >
      {/* Sidebar Header with collapse button */}
      <div className="h-10 px-2.5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/90">
        {!collapsed && (
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            Páginas ({pages.length})
          </span>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              'h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
              collapsed && 'mx-auto',
            )}
            title={collapsed ? 'Expandir miniaturas' : 'Recolher barra lateral'}
            aria-label={collapsed ? 'Expandir miniaturas' : 'Recolher barra lateral'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#ea580c]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Vertical Thumbnails List */}
      {!collapsed ? (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
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
                layout="vertical"
                onClick={() => onSelectPage(index)}
              />
            )
          })}
        </div>
      ) : (
        /* Collapsed minimal quick rail indicator */
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col items-center gap-2 scrollbar-none">
          {pages.map((p, index) => {
            const active = isPageActive(index)
            return (
              <button
                key={p.id || `dot-${index}`}
                onClick={() => onSelectPage(index)}
                className={cn(
                  'w-6 h-6 rounded flex items-center justify-center text-[10px] font-mono transition-all duration-150 cursor-pointer',
                  active
                    ? 'bg-[#ea580c] text-white font-bold shadow-[0_0_8px_rgba(234,88,12,0.6)] scale-110'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
                )}
                title={index === 0 ? 'Capa' : `Pág ${p.page_number || index + 1}`}
              >
                {index === 0 ? 'C' : p.page_number || index + 1}
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
