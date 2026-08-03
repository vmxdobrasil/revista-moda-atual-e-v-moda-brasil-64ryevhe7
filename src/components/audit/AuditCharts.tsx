import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
  Legend,
} from 'recharts'
import type { AuditReport } from '@/services/audit'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'hsl(0, 0%, 50%)',
  em_revisao: 'hsl(210, 80%, 50%)',
  aprovado: 'hsl(140, 70%, 45%)',
  publicado: 'hsl(270, 65%, 60%)',
}

const chartConfig: ChartConfig = {
  count: { label: 'Registros', color: 'hsl(24, 95%, 53%)' },
  success: { label: 'Sucesso', color: 'hsl(140, 70%, 45%)' },
  error: { label: 'Erro', color: 'hsl(0, 80%, 50%)' },
}

export function AuditCharts({ report }: { report: AuditReport }) {
  const collectionData = useMemo(
    () => report.collections.map((c) => ({ name: c.name, count: c.count })),
    [report.collections],
  )

  const executionData = useMemo(
    () =>
      (report.hookExecutionsByDay || []).map((d) => ({
        date: d.date.substring(5),
        success: d.success,
        error: d.error,
      })),
    [report.hookExecutionsByDay],
  )

  const deliveryData = useMemo(
    () =>
      Object.entries(report.deliveryQueue.byStatus).map(([name, value]) => ({
        name,
        value,
        fill: STATUS_COLORS[name] || 'hsl(0,0%,50%)',
      })),
    [report.deliveryQueue.byStatus],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Registros por Coleção</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={9}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Execuções de Hooks (7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={executionData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="success"
                  stroke="hsl(140, 70%, 45%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="error"
                  stroke="hsl(0, 80%, 50%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-800">Distribuição da Fila de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(e) => `${e.name}: ${e.value}`}
                >
                  {deliveryData.map((entry, i) => (
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
  )
}
