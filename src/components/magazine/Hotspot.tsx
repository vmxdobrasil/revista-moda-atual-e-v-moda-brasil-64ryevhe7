import { useState, MouseEvent } from 'react'
import { Info, X, ExternalLink, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Hotspot } from '@/services/magazine'
import { trackHotspotClick, trackWhatsAppClick } from '@/services/analytics'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface HotspotProps {
  hotspot: Hotspot
  className?: string
}

function getWhatsAppUrl(hotspot: Hotspot): string | null {
  if (hotspot.link_origin !== 'whatsapp') return null
  if (hotspot.link && hotspot.link.includes('wa.me')) return hotspot.link
  const message = `Olá! Vim da Revista MODA ATUAL e tenho interesse em: ${hotspot.title}`
  return `https://wa.me/5562900000000?text=${encodeURIComponent(message)}`
}

export function Hotspot({ hotspot, className }: HotspotProps) {
  const [open, setOpen] = useState(false)
  const whatsappUrl = getWhatsAppUrl(hotspot)
  const isWhatsApp = hotspot.link_origin === 'whatsapp'

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
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg ring-2 ring-white transition-all duration-200 hover:scale-110 active:scale-95',
          isWhatsApp
            ? 'bg-green-500/90 hover:bg-green-600'
            : 'bg-orange-500/90 hover:bg-orange-600',
        )}
        aria-label={hotspot.title}
      >
        {isWhatsApp ? (
          <MessageCircle className="w-4 h-4 text-white" />
        ) : (
          <Info className="w-4 h-4 text-white" />
        )}
        <span
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-60',
            isWhatsApp ? 'bg-green-400' : 'bg-orange-400',
          )}
        />
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
          {hotspot.cta_variant && (
            <Badge variant="secondary" className="text-xs mb-2">
              CTA: {hotspot.cta_variant}
            </Badge>
          )}
          <div className="flex flex-col gap-2 mt-2">
            {whatsappUrl && (
              <Button
                asChild
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => trackWhatsAppClick(hotspot.id)}
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-1" /> Pedir no WhatsApp
                </a>
              </Button>
            )}
            {!whatsappUrl && hotspot.link && (
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
        </div>
      )}
    </div>
  )
}
