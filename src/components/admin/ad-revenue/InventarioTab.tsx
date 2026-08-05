import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { getProposals, AD_FORMATS, FORMAT_LABELS, type AdProposal } from '@/services/ad-proposals'
import { getEditions, type Edition } from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'

export function InventarioTab() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [proposals, setProposals] = useState<AdProposal[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [eds, props] = await Promise.all([getEditions(), getProposals()])
      setEditions(eds)
      setProposals(props)
    } catch {
      /* handled by empty state */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('ad_proposals', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  const getOccupied = (editionId: string, format: string) =>
    proposals.filter((p) => p.edition === editionId && p.format === format)

  return (
    <div className="space-y-4">
      {editions.map((edition) => (
        <Card key={edition.id}>
          <CardHeader>
            <CardTitle className="text-base">{edition.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AD_FORMATS.map((format) => {
                const occupied = getOccupied(edition.id, format)
                const isAvailable = occupied.length === 0
                return (
                  <div
                    key={format}
                    className={`rounded-lg border p-3 ${isAvailable ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {FORMAT_LABELS[format]}
                      </span>
                      {isAvailable ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    {isAvailable ? (
                      <Badge className="bg-green-100 text-green-700" variant="secondary">
                        Disponível
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        {occupied.map((o) => (
                          <div key={o.id} className="text-xs text-gray-600">
                            {o.advertiser}
                            {o.position ? ` • ${o.position}` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      {editions.length === 0 && (
        <p className="text-center text-gray-400 py-8">Nenhuma edição encontrada</p>
      )}
    </div>
  )
}
