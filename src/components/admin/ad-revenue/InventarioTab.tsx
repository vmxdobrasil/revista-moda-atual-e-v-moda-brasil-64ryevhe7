import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AD_FORMATS, formatCurrency } from '@/services/ad-revenue'
import type { Edition } from '@/services/magazine'
import type { Advertisement } from '@/services/advertisements'
import { LayoutGrid, ArrowRight } from 'lucide-react'

interface Props {
  editions: Edition[]
  ads: Advertisement[]
}

export function InventarioTab({ editions, ads }: Props) {
  const getUsedCount = (editionId: string, format: string) =>
    ads.filter((a) => a.status !== 'cancelado').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {editions.map((ed) => (
          <Card key={ed.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-5 h-5 text-orange-500" />
                <p className="font-semibold text-gray-800 truncate">{ed.title}</p>
              </div>
              {ed.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{ed.description}</p>
              )}
              <div className="space-y-2">
                {AD_FORMATS.map((f) => {
                  const used = getUsedCount(ed.id, f.value)
                  return (
                    <div
                      key={f.value}
                      className="flex items-center justify-between py-1.5 border-b last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          {f.label}
                        </Badge>
                        <span className="text-xs text-gray-400">{used} ocupado(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {formatCurrency(f.basePrice)}
                        </span>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-orange-500">
                          Propor <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {editions.length === 0 && (
        <p className="text-center text-gray-400 py-8">Nenhuma edição disponível no inventário.</p>
      )}
    </div>
  )
}
