import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PeriodFilter } from '@/components/admin/PeriodFilter'
import type { PeriodFilter as PeriodType } from '@/services/dashboard-metrics'
import { MetricCard } from '@/components/admin/MetricCard'
import type { Subscriber } from '@/services/newsletter'
import { Users, TrendingUp, Heart, Mail } from 'lucide-react'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}

const STATUS_LABELS: Record<string, string> = {
  ativo: 'Ativo',
  descadastrado: 'Descadastrado',
  inativo: 'Inativo',
}

const SEGMENT_COLORS: Record<string, string> = {
  varejo: 'bg-orange-100 text-orange-700',
  atacado: 'bg-purple-100 text-purple-700',
  consumidora: 'bg-blue-100 text-blue-700',
}

const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  descadastrado: 'bg-red-100 text-red-700',
  inativo: 'bg-gray-100 text-gray-700',
}

export function OverviewTab({ subscribers }: { subscribers: Subscriber[] }) {
  const [period, setPeriod] = useState<PeriodType>('30d')

  const stats = useMemo(() => {
    const now = new Date()
    let compareDate = new Date(0)
    if (period === '7d') compareDate = new Date(now.getTime() - 7 * 86400000)
    else if (period === '30d') compareDate = new Date(now.getTime() - 30 * 86400000)
    else if (period === 'this_month') {
      compareDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const bySegment: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let totalScore = 0
    let newCount = 0

    for (const sub of subscribers) {
      bySegment[sub.segment] = (bySegment[sub.segment] || 0) + 1
      byStatus[sub.status] = (byStatus[sub.status] || 0) + 1
      totalScore += sub.engagement_score || 0
      if (new Date(sub.created) >= compareDate) newCount++
    }

    return {
      total: subscribers.length,
      newCount,
      avgScore:
        subscribers.length > 0 ? Math.round((totalScore / subscribers.length) * 100) / 100 : 0,
      bySegment,
      byStatus,
    }
  }, [subscribers, period])

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total de Leitoras"
          value={stats.total}
          color="hsl(24,95%,53%)"
        />
        <MetricCard
          icon={TrendingUp}
          label="Novas no Período"
          value={stats.newCount}
          color="hsl(140,70%,45%)"
        />
        <MetricCard
          icon={Heart}
          label="Score Médio"
          value={stats.avgScore}
          color="hsl(280,65%,55%)"
        />
        <MetricCard
          icon={Mail}
          label="Ativas"
          value={stats.byStatus.ativo || 0}
          color="hsl(200,80%,50%)"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Por Segmento</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.bySegment).map(([seg, count]) => (
                <Badge key={seg} variant="secondary" className={SEGMENT_COLORS[seg] || ''}>
                  {SEGMENT_LABELS[seg] || seg}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Por Status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byStatus).map(([st, count]) => (
                <Badge key={st} variant="secondary" className={STATUS_COLORS[st] || ''}>
                  {STATUS_LABELS[st] || st}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
