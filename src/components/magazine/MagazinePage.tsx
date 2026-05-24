import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MagazinePageProps {
  pageNumber: number
  imageUrl?: string
  children?: ReactNode
  className?: string
  side?: 'left' | 'right' | 'single'
}

export function MagazinePage({
  pageNumber,
  imageUrl,
  children,
  className,
  side = 'single',
}: MagazinePageProps) {
  return (
    <div
      className={cn(
        'relative w-full h-full bg-[#FDFDFD] text-[#0A0A0A] shadow-2xl overflow-hidden',
        side === 'left' && 'rounded-l-md',
        side === 'right' && 'rounded-r-md',
        className,
      )}
    >
      {/* Background Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`Page ${pageNumber}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Content Content */}
      <div className="relative z-10 w-full h-full">{children}</div>

      {/* Page Number */}
      <div
        className={cn(
          'absolute bottom-6 text-xs font-serif text-black/60 z-20',
          side === 'left' ? 'left-8' : 'right-8',
          side === 'single' && 'right-8',
        )}
      >
        {pageNumber}
      </div>

      {/* Realistic Spine Shadows for 3D effect */}
      {side === 'left' && (
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/30 via-black/5 to-transparent z-20 pointer-events-none mix-blend-multiply" />
      )}
      {side === 'right' && (
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/30 via-black/5 to-transparent z-20 pointer-events-none mix-blend-multiply" />
      )}

      {/* Paper texture overlay (subtle) */}
      <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/800/1200?q=paper%20texture')] opacity-[0.03] mix-blend-overlay z-10 pointer-events-none grayscale"></div>
    </div>
  )
}
