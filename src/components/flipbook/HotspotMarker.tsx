import { Hotspot } from '@/services/magazine'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus, X, ExternalLink } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

function HotspotDetails({ hotspot }: { hotspot: Hotspot }) {
  return (
    <div className="flex flex-col gap-3">
      {hotspot.description && (
        <p className="text-sm text-gray-600 leading-relaxed break-words">{hotspot.description}</p>
      )}
      {(hotspot.price || hotspot.link) && (
        <div className="pt-4 mt-1 border-t flex flex-col gap-4">
          {hotspot.price && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Preço
              </span>
              <span className="text-lg font-bold text-orange-600">{hotspot.price}</span>
            </div>
          )}
          {hotspot.link && (
            <Button className="w-full bg-black hover:bg-gray-800 text-white h-11" asChild>
              <a href={hotspot.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Link
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const markerButton = (
    <button
      className="cursor-pointer group relative border-0 bg-transparent p-0 flex items-center justify-center outline-none w-10 h-10 active:scale-90 transition-transform duration-100"
      aria-label={`Ver detalhes: ${hotspot.title}`}
    >
      <div className="w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10 border border-white/20">
        <Plus className="w-5 h-5 text-white" />
      </div>
      <div className="absolute inset-1 bg-white rounded-full opacity-40 animate-ping z-0" />
    </button>
  )

  if (isMobile) {
    return (
      <div
        className="absolute z-20 pointer-events-auto"
        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{markerButton}</DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-left pr-8 break-words">{hotspot.title}</DialogTitle>
            </DialogHeader>
            <HotspotDetails hotspot={hotspot} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{markerButton}</PopoverTrigger>
        <PopoverContent
          className="w-72 md:w-80 p-0 overflow-hidden shadow-2xl border border-gray-100 rounded-xl"
          side="right"
          align="center"
          sideOffset={16}
          onPointerDownOutside={() => setOpen(false)}
        >
          <div className="relative p-5 max-h-[70vh] overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight pr-6 mb-3 break-words">
              {hotspot.title}
            </h4>
            <HotspotDetails hotspot={hotspot} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
