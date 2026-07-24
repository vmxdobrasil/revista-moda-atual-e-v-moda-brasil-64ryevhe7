import { useState, MouseEvent } from 'react'
import { Info, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Hotspot } from '@/services/magazine'
import { trackHotspotClick } from '@/services/analytics'

interface HotspotProps {
  hotspot: Hotspot
  className?: string
}

export function Hotspot({ hotspot, className }: HotspotProps) {
  const [open, setOpen] = useState(false)

  const handleToggle = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackHotspotClick(hotspot.id)
    setOpen((v) => !v)
  }

  return (
    <div
      className={cn('absolute z-20 -translate-x-1/2 -translate-y-1/2', className)}
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/90 hover:bg-orange-600 shadow-lg ring-2 ring-white transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label={hotspot.title}
      >
        <Info className="w-4 h-4 text-white" />
        <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-60" />
      </button>
      {open && (
        <div
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border p-4 z-30 animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">{hotspot.title}</h4>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          {hotspot.description && (
            <p className="text-xs text-gray-600 mb-2">{hotspot.description}</p>
          )}
          {hotspot.price && (
            <p className="text-sm font-bold text-orange-600 mb-2">{hotspot.price}</p>
          )}
          {hotspot.link && (
            <a
              href={hotspot.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation()
                trackHotspotClick(hotspot.id)
              }}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver produto <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
