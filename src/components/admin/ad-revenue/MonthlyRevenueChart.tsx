import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { type AdProposal, FORMAT_LABELS, AD_FORMATS, formatCurrency } from '@/services/ad-proposals'

interface Props {
  proposals: AdProposal[]
}

const COLORS = [
  'hsl(24, 95%, 53%)',
  'hsl(142, 71%, 45%)',
  'hsl(217, 91%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
]

export function MonthlyRevenueChart({ proposals }: Props) {
  const chartData = useMemo(() => {
    const revenueStatuses = ['aceito', 'contrato', 'entregue']
    const filtered = proposals.filter((p) => revenueStatuses.includes(p.status || ''))
    const map: Record<string, Record<string, number>> = {}
    filtered.forEach((p) => {
      const month = (p.created || '').substring(0, 7)
      if (!month) return
      if (!map[month]) map[month] = {}
      const fmt = p.format || 'banner'
      map[month][fmt] = (map[month][fmt] || 0) + (p.suggested_price || 0)
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, formats]) => ({ month, ...formats }))
  }, [proposals])

  if (chartData.length === 0) return null

  const config: Record<string, { label: string; color: string }> = {}
  AD_FORMATS.forEach((f, i) => {
    config[f] = { label: FORMAT_LABELS[f], color: COLORS[i % COLORS.length] }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução de Receita por Formato</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend />
            {AD_FORMATS.map((f) => (
              <Bar key={f} dataKey={f} fill={config[f].color} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
