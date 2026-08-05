import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/admin/MetricCard'
import { formatCurrency, PROPOSAL_STATUSES, AD_STATUSES } from '@/services/ad-revenue'
import type { AdProposal } from '@/services/ad-revenue'
import type { Advertisement } from '@/services/advertisements'
import type { Edition } from '@/services/magazine'
import { DollarSign, FileText, Truck, LayoutGrid } from 'lucide-react'

interface Props {
  proposals: AdProposal[]
  ads: Advertisement[]
  editions: Edition[]
}

export function OverviewTab({ proposals, ads, editions }: Props) {
  const stats = useMemo(() => {
    const totalRevenue = proposals.reduce((sum, p) => sum + (p.suggested_price || 0), 0)
    const byStatus: Record<string, number> = {}
    for (const p of proposals) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
    }
    const inDelivery = proposals.filter((p) => ['contrato', 'entregue'].includes(p.status)).length
    const adsInDelivery = ads.filter((a) =>
      ['em_entrega', 'entregue'].includes(a.status || ''),
    ).length
    const inventoryCount = editions.length * 6
    return { totalRevenue, byStatus, inDelivery: inDelivery + adsInDelivery, inventoryCount }
  }, [proposals, ads, editions])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          label="Receita Potencial"
          value={formatCurrency(stats.totalRevenue)}
          color="hsl(140,70%,45%)"
        />
        <MetricCard
          icon={FileText}
          label="Propostas"
          value={proposals.length}
          color="hsl(24,95%,53%)"
        />
        <MetricCard
          icon={Truck}
          label="Em Entrega"
          value={stats.inDelivery}
          color="hsl(280,65%,55%)"
        />
        <MetricCard
          icon={LayoutGrid}
          label="Espaços Inventário"
          value={stats.inventoryCount}
          color="hsl(200,80%,50%)"
        />
      </div>
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Propostas por Status</p>
          <div className="flex flex-wrap gap-2">
            {PROPOSAL_STATUSES.map((s) => (
              <Badge key={s} variant="secondary" className="bg-gray-100 text-gray-700">
                {s}: {stats.byStatus[s] || 0}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Anúncios por Status</p>
          <div className="flex flex-wrap gap-2">
            {AD_STATUSES.map((s) => (
              <Badge key={s} variant="secondary" className="bg-gray-100 text-gray-700">
                {s}: {ads.filter((a) => a.status === s).length}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
