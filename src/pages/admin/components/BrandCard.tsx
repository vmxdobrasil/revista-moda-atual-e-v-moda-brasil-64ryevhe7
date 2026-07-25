import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus, Star, ExternalLink } from 'lucide-react'
import { getLogoUrl, type Top60Brand } from '@/services/top60'

interface BrandCardProps {
  brand: Top60Brand
  onEdit?: (brand: Top60Brand) => void
}

export function BrandCard({ brand }: BrandCardProps) {
  const logoUrl = getLogoUrl(brand, brand.logo_file)
  const prevPos = brand.previous_position
  const movedUp = prevPos !== null && prevPos !== undefined && brand.position < prevPos
  const movedDown = prevPos !== null && prevPos !== undefined && brand.position > prevPos
  const isNew = prevPos === null || prevPos === undefined
  const noChange = prevPos !== null && prevPos !== undefined && brand.position === prevPos

  return (
    <Card className="overflow-hidden group hover:border-orange-400/50 transition-colors bg-white border border-gray-200">
      <div className="flex items-start gap-3 p-4">
        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
          {logoUrl ? (
            <img src={logoUrl} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-gray-400">{brand.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-orange-500">#{brand.position}</span>
            {isNew && <Badge className="bg-blue-100 text-blue-700 border-none text-xs">NOVO</Badge>}
            {movedUp && <ArrowUp className="w-4 h-4 text-green-600" />}
            {movedDown && <ArrowDown className="w-4 h-4 text-red-600" />}
            {noChange && <Minus className="w-4 h-4 text-gray-400" />}
          </div>
          <h4 className="font-bold text-gray-900 truncate">{brand.name}</h4>
          {brand.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{brand.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {brand.score > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{' '}
                {brand.score.toFixed(1)}
              </span>
            )}
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Site
              </a>
            )}
            {brand.social_handle && (
              <span className="text-xs text-gray-400">@{brand.social_handle}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
