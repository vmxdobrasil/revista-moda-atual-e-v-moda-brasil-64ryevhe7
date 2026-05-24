import { Tag } from 'lucide-react'

interface HotspotProps {
  x: number
  y: number
  onClick: () => void
}

export function Hotspot({ x, y, onClick }: HotspotProps) {
  return (
    <div
      className="absolute z-30 group cursor-pointer"
      style={{ top: `${y}%`, left: `${x}%` }}
      onClick={onClick}
    >
      {/* Pulsing effect */}
      <div className="absolute inset-0 bg-brand-orange rounded-full animate-ping opacity-75 w-8 h-8 -ml-4 -mt-4"></div>

      {/* Button */}
      <button className="relative w-8 h-8 -ml-4 -mt-4 rounded-full bg-brand-orange border-2 border-white text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 focus:outline-none">
        <Tag className="w-3 h-3 fill-white" />
      </button>

      {/* Tooltip hint on hover */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Comprar Look
      </div>
    </div>
  )
}
