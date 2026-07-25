import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { ArrowUp, ArrowDown } from 'lucide-react'
import type { SocialPost } from '@/services/social-posts'

interface MonthlyAgg {
  month: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  new_followers: number
}

interface MonthlyComparisonProps {
  posts: SocialPost[]
}

const METRICS: Array<{ key: keyof Omit<MonthlyAgg, 'month'>; label: string }> = [
  { key: 'views', label: 'Views' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Coment.' },
  { key: 'shares', label: 'Shares' },
  { key: 'saves', label: 'Saves' },
  { key: 'new_followers', label: 'Seguidores' },
]

function aggregateByMonth(posts: SocialPost[]): MonthlyAgg[] {
  const map: Record<string, MonthlyAgg> = {}
  posts.forEach((p) => {
    const monthKey = (p.post_date || '').substring(0, 7)
    if (!monthKey) return
    if (!map[monthKey]) {
      map[monthKey] = {
        month: monthKey,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        new_followers: 0,
      }
    }
    const m = map[monthKey]
    m.views += p.views || 0
    m.likes += p.likes || 0
    m.comments += p.comments || 0
    m.shares += p.shares || 0
    m.saves += p.saves || 0
    m.new_followers += p.new_followers || 0
  })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month))
}

function formatNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString('pt-BR')
}

export function MonthlyComparison({ posts }: MonthlyComparisonProps) {
  const monthlyData = useMemo(() => aggregateByMonth(posts), [posts])
  const months = monthlyData.map((m) => m.month)
  const [monthA, setMonthA] = useState('')
  const [monthB, setMonthB] = useState('')

  useEffect(() => {
    if (monthlyData.length > 0 && !monthA) setMonthA(monthlyData[0].month)
    if (monthlyData.length > 1 && !monthB) setMonthB(monthlyData[monthlyData.length - 1].month)
  }, [monthlyData, monthA, monthB])

  const selectedA = monthlyData.find((m) => m.month === monthA) || monthlyData[0]
  const selectedB =
    monthlyData.find((m) => m.month === monthB) || monthlyData[monthlyData.length - 1]

  const comparisonData = useMemo(() => {
    if (!selectedA || !selectedB) return []
    return METRICS.map((metric) => ({
      metric: metric.label,
      [selectedA.month]: selectedA[metric.key] as number,
      [selectedB.month]: selectedB[metric.key] as number,
    }))
  }, [selectedA, selectedB])

  const chartConfig: ChartConfig = {}
  if (selectedA)
    chartConfig[selectedA.month] = { label: selectedA.month, color: 'hsl(24, 95%, 53%)' }
  if (selectedB)
    chartConfig[selectedB.month] = { label: selectedB.month, color: 'hsl(280, 65%, 60%)' }

  const getChange = (current: number, previous: number): number | null => {
    if (previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800">Comparativo Mensal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Mês</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="pb-2 px-2 font-medium text-right">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-6">
                    No data
                  </td>
                </tr>
              ) : (
                monthlyData.map((m, i) => {
                  const prev = i > 0 ? monthlyData[i - 1] : null
                  return (
                    <tr key={m.month} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-800">{m.month}</td>
                      {METRICS.map((metric) => {
                        const change = prev
                          ? getChange(m[metric.key] as number, prev[metric.key] as number)
                          : null
                        return (
                          <td key={metric.key} className="py-3 px-2 text-right">
                            <div className="font-medium text-gray-700">
                              {formatNum(m[metric.key] as number)}
                            </div>
                            {change === null ? (
                              <span className="text-xs text-gray-400">N/A</span>
                            ) : (
                              <span
                                className={`inline-flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}
                              >
                                {change >= 0 ? (
                                  <ArrowUp className="w-3 h-3" />
                                ) : (
                                  <ArrowDown className="w-3 h-3" />
                                )}
                                {Math.abs(change).toFixed(0)}%
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {months.length >= 2 && (
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-4 no-print">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mês A:</span>
                <Select value={monthA || undefined} onValueChange={setMonthA}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((mo) => (
                      <SelectItem key={mo} value={mo}>
                        {mo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mês B:</span>
                <Select value={monthB || undefined} onValueChange={setMonthB}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((mo) => (
                      <SelectItem key={mo} value={mo}>
                        {mo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {comparisonData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" fontSize={11} />
                    <YAxis tickFormatter={(v) => formatNum(v)} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {selectedA && (
                      <Bar
                        dataKey={selectedA.month}
                        fill="hsl(24, 95%, 53%)"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                    {selectedB && (
                      <Bar
                        dataKey={selectedB.month}
                        fill="hsl(280, 65%, 60%)"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
