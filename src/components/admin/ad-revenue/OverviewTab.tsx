import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, FileText, Package, Send } from 'lucide-react'
import { MetricCard } from '@/components/admin/MetricCard'
import {
  getProposals,
  PROPOSAL_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  FORMAT_LABELS,
  AD_FORMATS,
  type AdProposal,
} from '@/services/ad-proposals'
import { getAllAds, type Advertisement } from '@/services/advertisements'
import { useRealtime } from '@/hooks/use-realtime'

export function OverviewTab() {
  const [proposals, setProposals] = useState<AdProposal[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([getProposals(), getAllAds()])
      setProposals(p)
      setAds(a)
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
  useRealtime('advertisements', () => {
    loadData()
  })

  const potentialRevenue = useMemo(
    () =>
      proposals
        .filter((p) => ['aceito', 'contrato', 'entregue'].includes(p.status || ''))
        .reduce((sum, p) => sum + (p.suggested_price || 0), 0),
    [proposals],
  )

  const campaignsInDelivery = useMemo(
    () => ads.filter((a) => a.status === 'em_entrega').length,
    [ads],
  )

  const proposalsByStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    proposals.forEach((p) => {
      const s = p.status || 'rascunho'
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [proposals])

  const inventoryByFormat = useMemo(
    () =>
      AD_FORMATS.map((fmt) => ({
        format: fmt,
        occupied: proposals.filter((p) => p.format === fmt).length,
      })),
    [proposals],
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={TrendingUp}
          label="Receita Potencial"
          value={`R$ ${potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          color="#f97316"
        />
        <MetricCard
          icon={FileText}
          label="Total Propostas"
          value={proposals.length}
          color="#3b82f6"
        />
        <MetricCard icon={Send} label="Em Entrega" value={campaignsInDelivery} color="#eab308" />
        <MetricCard icon={Package} label="Total Anúncios" value={ads.length} color="#22c55e" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propostas por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(PROPOSAL_STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge
                  className={STATUS_BADGE_CLASSES[status] || 'bg-gray-100 text-gray-700'}
                  variant="secondary"
                >
                  {label}
                </Badge>
                <span className="font-semibold text-gray-700">
                  {proposalsByStatus[status] || 0}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventário por Formato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inventoryByFormat.map(({ format, occupied }) => (
              <div key={format} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{FORMAT_LABELS[format]}</span>
                <Badge
                  variant="secondary"
                  className={
                    occupied > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }
                >
                  {occupied > 0 ? `${occupied} ocupado(s)` : 'Disponível'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
