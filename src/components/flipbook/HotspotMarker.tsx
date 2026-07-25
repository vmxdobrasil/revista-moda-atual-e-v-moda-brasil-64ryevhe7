import { useState, MouseEvent } from 'react'
import { MapPin, X, ExternalLink, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Hotspot, getFileUrl } from '@/services/magazine'
import { trackHotspotClick } from '@/services/analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HotspotMarkerProps {
  hotspot: Hotspot
  className?: string
}

export function HotspotMarker({ hotspot, className }: HotspotMarkerProps) {
  const [open, setOpen] = useState(false)
  const [productOpen, setProductOpen] = useState(false)

  const handleToggle = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    trackHotspotClick(hotspot.id)
    if (hotspot.expand?.product) {
      setProductOpen(true)
    } else {
      setOpen((v) => !v)
    }
  }

  const product = hotspot.expand?.product

  return (
    <>
      <div
        className={cn('absolute z-20 -translate-x-1/2 -translate-y-1/2', className)}
        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
      >
        <button
          onClick={handleToggle}
          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/90 hover:bg-orange-600 shadow-lg ring-2 ring-white transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={hotspot.title}
        >
          {product ? (
            <ShoppingBag className="w-4 h-4 text-white" />
          ) : (
            <MapPin className="w-4 h-4 text-white" />
          )}
          <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-60" />
        </button>
        {open && !product && (
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

      {product && (
        <Dialog open={productOpen} onOpenChange={setProductOpen}>
          <DialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between gap-2">
                <span>{product.name}</span>
                <Badge className="bg-orange-500 text-white border-none">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: product.currency || 'BRL',
                  }).format(product.price)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {product.image_file ? (
                <img
                  src={getFileUrl(product, product.image_file)}
                  alt={product.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                </div>
              )}
              {product.description && (
                <p className="text-sm text-gray-600">{product.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-400">Fornecedor:</span>{' '}
                  <span className="font-medium text-gray-700">{product.vendor}</span>
                </div>
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
              </div>
              {product.link && (
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                  <a href={product.link} target="_blank" rel="noopener noreferrer">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Comprar agora
                  </a>
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
