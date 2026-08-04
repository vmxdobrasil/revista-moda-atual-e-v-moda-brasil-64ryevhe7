import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { DashboardRawData, DashboardMetrics } from '@/services/dashboard-metrics'

const COLORS = [
  'hsl(24, 95%, 53%)',
  'hsl(280, 65%, 55%)',
  'hsl(200, 80%, 50%)',
  'hsl(140, 70%, 45%)',
  'hsl(0, 80%, 50%)',
]

function DonutChart({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const config: ChartConfig = { value: { label: 'Total' } }
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-gray-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function toDonut(obj: Record<string, number>, labels: Record<string, string>) {
  return Object.entries(obj).map(([k, v]) => ({ name: labels[k] || k, value: v }))
}

export function DashboardCharts({
  data,
  metrics,
}: {
  data: DashboardRawData
  metrics: DashboardMetrics
}) {
  const config: ChartConfig = {
    editions: { label: 'Edições', color: 'hsl(24, 95%, 53%)' },
    socialPosts: { label: 'Social Posts', color: 'hsl(280, 65%, 55%)' },
  }

  const pubByMonth = useMemo(() => {
    const months: Record<string, { month: string; editions: number; socialPosts: number }> = {}
    const add = (date: string, field: 'editions' | 'socialPosts') => {
      if (!date) return
      const m = date.substring(0, 7)
      if (!months[m]) months[m] = { month: m, editions: 0, socialPosts: 0 }
      months[m][field]++
    }
    data.editions.forEach((e) => add(e.created, 'editions'))
    data.socialPosts.forEach((p) => add(p.post_date, 'socialPosts'))
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month))
  }, [data])

  const engagementTime = useMemo(() => {
    const days: Record<string, any> = {}
    data.socialPosts.forEach((p) => {
      const d = p.post_date?.split(' ')[0] || ''
      if (!d) return
      if (!days[d])
        days[d] = {
          date: d,
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          engagement: 0,
          count: 0,
        }
      days[d].views += p.views || 0
      days[d].likes += p.likes || 0
      days[d].comments += p.comments || 0
      days[d].shares += p.shares || 0
      days[d].saves += p.saves || 0
      days[d].engagement += p.engagement_rate || 0
      days[d].count++
    })
    return Object.values(days)
      .map((d: any) => ({ ...d, engagement: d.count > 0 ? d.engagement / d.count : 0 }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
  }, [data])

  const donuts = [
    {
      title: 'Social Posts por Status',
      data: toDonut(metrics.socialPosts.byStatus, {
        pending: 'Pendente',
        scheduled: 'Agendado',
        published: 'Publicado',
        failed: 'Falhou',
      }),
    },
    {
      title: 'Workflow por Status',
      data: toDonut(
        {
          processing: metrics.workflowResults.processing,
          completed: metrics.workflowResults.completed,
          failed: metrics.workflowResults.failed,
        },
        { processing: 'Processando', completed: 'Concluído', failed: 'Falhou' },
      ),
    },
    {
      title: 'Workflow QA',
      data: toDonut(metrics.workflowResults.byQaStatus, {
        aprovado: 'Aprovado',
        revisar: 'Revisar',
        reprovado: 'Reprovado',
      }),
    },
    {
      title: 'Pedidos',
      data: toDonut(metrics.marketplaceOrders.byStatus, {
        pending: 'Pendente',
        confirmed: 'Confirmado',
        shipped: 'Enviado',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
      }),
    },
    {
      title: 'Fila de Entrega',
      data: toDonut(metrics.deliveryQueue.byStatus, {
        rascunho: 'Rascunho',
        em_revisao: 'Em Revisão',
        aprovado: 'Aprovado',
        publicado: 'Publicado',
      }),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Publicações por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pubByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="editions" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="socialPosts" fill="hsl(280, 65%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Engajamento ao longo do tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={config} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(24, 95%, 53%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="hsl(340, 75%, 55%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="hsl(200, 80%, 50%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="hsl(140, 70%, 45%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="saves"
                    stroke="hsl(280, 65%, 55%)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {donuts.map((d) => (
          <DonutChart key={d.title} title={d.title} data={d.data} />
        ))}
      </div>
    </div>
  )
}
