import { Hotspot } from '@/services/magazine'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus } from 'lucide-react'

export function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="absolute z-20 pointer-events-auto"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="cursor-pointer group relative border-0 bg-transparent p-0 flex items-center justify-center outline-none"
            aria-label="Ver detalhes do produto"
          >
            <div className="w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10 border border-white/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-white rounded-full opacity-40 animate-ping -z-10" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 md:w-80 p-0 overflow-hidden shadow-2xl border-0 rounded-xl"
          side="right"
          align="center"
          sideOffset={16}
          onPointerDownOutside={() => setOpen(false)}
        >
          <div className="p-5 flex flex-col gap-3 bg-white">
            <div className="space-y-1.5">
              <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {hotspot.title}
              </h4>
              {hotspot.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{hotspot.description}</p>
              )}
            </div>

            {(hotspot.price || hotspot.link) && (
              <div className="pt-4 mt-2 border-t flex flex-col gap-4">
                {hotspot.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Preço
                    </span>
                    <span className="text-lg font-bold text-orange-600">{hotspot.price}</span>
                  </div>
                )}
                {hotspot.link && (
                  <Button
                    className="w-full bg-black hover:bg-gray-800 text-white shadow-none h-11"
                    asChild
                  >
                    <a href={hotspot.link} target="_blank" rel="noopener noreferrer">
                      Ver Produto
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
