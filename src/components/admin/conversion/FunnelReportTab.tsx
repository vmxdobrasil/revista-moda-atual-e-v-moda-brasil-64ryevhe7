import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getFunnelReport, type FunnelReport, type FunnelFilters } from '@/services/conversion'
import { FunnelCharts } from '@/components/admin/conversion/FunnelCharts'
import { TopContentsTable } from '@/components/admin/conversion/TopContentsTable'

const PERIODS = ['2026-05', '2026-06', '2026-07']
const CONTENT_TYPES = ['materia', 'legenda', 'story', 'banner', 'hotspot']
const ORIGINS = ['revista', 'hotspot', 'whatsapp']
const VARIANTS = ['A', 'B', 'C']

export function FunnelReportTab() {
  const [report, setReport] = useState<FunnelReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FunnelFilters>({})

  const loadData = useCallback(async () => {
    try {
      const data = await getFunnelReport(filters)
      setReport(data)
    } catch {
      toast.error('Erro ao carregar relatório do funil.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('conversion_metrics', () => loadData())

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const k = report.kpis

  const kpiCards = [
    { label: 'Impressões', value: k.impressions.toLocaleString('pt-BR'), color: 'text-blue-600' },
    { label: 'Cliques', value: k.clicks.toLocaleString('pt-BR'), color: 'text-green-600' },
    { label: 'Pedidos', value: k.orders.toLocaleString('pt-BR'), color: 'text-orange-600' },
    {
      label: 'Taxa de Conversão',
      value: `${k.conversion_rate.toFixed(2)}%`,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select
          onValueChange={(v) => setFilters((f) => ({ ...f, period: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {PERIODS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, content_type: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CONTENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, link_origin: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ORIGINS.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, cta_variant: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Variante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {VARIANTS.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FunnelCharts byOrigin={report.by_link_origin} byVariant={report.by_cta_variant} />

      <TopContentsTable contents={report.top_contents} />
    </div>
  )
}
