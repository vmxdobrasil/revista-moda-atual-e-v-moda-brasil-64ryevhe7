import { Hotspot } from '@/services/magazine'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Tag } from 'lucide-react'

export function HotspotMarker({ hotspot }: { hotspot: Hotspot }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="absolute z-20 cursor-pointer group pointer-events-auto"
        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
          <Tag className="w-4 h-4 text-white" />
        </div>
        <div className="absolute inset-0 bg-orange-500 rounded-full opacity-60 animate-ping -z-10" />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle className="text-2xl">{hotspot.title}</SheetTitle>
            <SheetDescription className="text-base text-gray-600">
              {hotspot.description}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 flex flex-col gap-6">
            {hotspot.price && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-800 uppercase tracking-wider font-semibold mb-1">
                  Preço Atacado
                </p>
                <p className="text-3xl font-bold text-orange-600">{hotspot.price}</p>
              </div>
            )}
            {hotspot.link && (
              <Button className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700" asChild>
                <a href={hotspot.link} target="_blank" rel="noopener noreferrer">
                  Ver no V MODA BRASIL
                </a>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
