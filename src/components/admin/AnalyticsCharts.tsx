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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import type { SocialPost } from '@/services/social-posts'

const FORMAT_COLORS: Record<string, string> = {
  Reel: 'hsl(24, 95%, 53%)',
  Carousel: 'hsl(280, 65%, 60%)',
  Photo: 'hsl(200, 80%, 50%)',
}

interface AnalyticsChartsProps {
  posts: SocialPost[]
}

export function AnalyticsCharts({ posts }: AnalyticsChartsProps) {
  const chartConfig: ChartConfig = { views: { label: 'Views', color: 'hsl(24, 95%, 53%)' } }

  const top10ByViews = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((p) => ({
        name: p.hook.length > 25 ? p.hook.slice(0, 25) + '…' : p.hook,
        views: p.views,
      }))
  }, [posts])

  const formatDistribution = useMemo(() => {
    const dist: Record<string, number> = {}
    posts.forEach((p) => {
      dist[p.format] = (dist[p.format] || 0) + 1
    })
    return Object.entries(dist).map(([name, value]) => ({
      name,
      value,
      fill: FORMAT_COLORS[name] || 'hsl(0,0%,50%)',
    }))
  }, [posts])

  const viewsOverTime = useMemo(() => {
    const grouped: Record<string, number> = {}
    posts.forEach((p) => {
      const date = p.post_date?.split(' ')[0] || ''
      if (!date) return
      const monthKey = date.substring(0, 7)
      grouped[monthKey] = (grouped[monthKey] || 0) + (p.views || 0)
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, views]) => ({ month, views }))
  }, [posts])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Views por Post (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10ByViews} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  fontSize={12}
                />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="views" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Distribuição de Formatos</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formatDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {formatDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-800">Views ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsOverTime} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(24, 95%, 53%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(24, 95%, 53%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
