import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { Users, Mail, Sparkles, TrendingUp } from 'lucide-react'
import type { Subscriber } from '@/services/newsletter'

const SEGMENT_COLORS: Record<string, string> = {
  varejo: 'hsl(24, 95%, 53%)',
  atacado: 'hsl(280, 65%, 60%)',
  consumidora: 'hsl(200, 80%, 50%)',
}

const STATUS_COLORS: Record<string, string> = {
  ativo: 'hsl(142, 71%, 45%)',
  inativo: 'hsl(0, 0%, 60%)',
  descadastrado: 'hsl(0, 84%, 60%)',
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: color + '1a' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function OverviewTab({ subscribers }: { subscribers: Subscriber[] }) {
  const chartConfig: ChartConfig = {
    count: { label: 'Leitoras', color: 'hsl(24, 95%, 53%)' },
  }

  const stats = useMemo(() => {
    const active = subscribers.filter((s) => s.status === 'ativo')
    const avgScore =
      active.length > 0
        ? Math.round(active.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / active.length)
        : 0
    const bySegment: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    for (const s of subscribers) {
      bySegment[s.segment] = (bySegment[s.segment] || 0) + 1
      const st = s.status || 'inativo'
      byStatus[st] = (byStatus[st] || 0) + 1
    }
    return { active: active.length, avgScore, bySegment, byStatus }
  }, [subscribers])

  const growthData = useMemo(() => {
    const grouped: Record<string, number> = {}
    for (const s of subscribers) {
      const month = (s.created || '').substring(0, 7)
      if (month) grouped[month] = (grouped[month] || 0) + 1
    }
    let cumulative = 0
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        cumulative += count
        return { month, new: count, total: cumulative }
      })
  }, [subscribers])

  const segmentData = Object.entries(stats.bySegment).map(([name, value]) => ({
    name,
    value,
    fill: SEGMENT_COLORS[name] || 'hsl(0,0%,50%)',
  }))
  const statusData = Object.entries(stats.byStatus).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name] || 'hsl(0,0%,50%)',
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat
          icon={Users}
          label="Total de Leitoras"
          value={subscribers.length}
          color="hsl(24, 95%, 53%)"
        />
        <MiniStat icon={Mail} label="Ativas" value={stats.active} color="hsl(142, 71%, 45%)" />
        <MiniStat
          icon={Sparkles}
          label="Score Médio"
          value={stats.avgScore}
          color="hsl(280, 65%, 60%)"
        />
        <MiniStat
          icon={TrendingUp}
          label="Crescimento (mês)"
          value={growthData.length > 0 ? growthData[growthData.length - 1].new : 0}
          color="hsl(200, 80%, 50%)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Crescimento da Base</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(24, 95%, 53%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Acumulado"
                  />
                  <Line
                    type="monotone"
                    dataKey="new"
                    stroke="hsl(200, 80%, 50%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Novas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Distribuição por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={(e) => `${e.name}: ${e.value}`}
                  >
                    {segmentData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Distribuição por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
