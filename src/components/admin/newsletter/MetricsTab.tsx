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
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { MetricCard } from '@/components/admin/MetricCard'
import { MailOpen, MousePointerClick, UserMinus, Eye } from 'lucide-react'
import type { NewsletterCampaign } from '@/services/newsletter'

interface MetricsTabProps {
  campaigns: NewsletterCampaign[]
}

export function MetricsTab({ campaigns }: MetricsTabProps) {
  const totals = useMemo(() => {
    let opened = 0,
      clicked = 0,
      unsubscribed = 0,
      totalAudience = 0
    for (const c of campaigns) {
      opened += c.opened_count || 0
      clicked += c.click_count || 0
      unsubscribed += c.unsubscribe_count || 0
      totalAudience += c.audience_size || 0
    }
    const avgOpenRate =
      campaigns.length > 0
        ? campaigns.reduce((s, c) => s + (c.open_rate || 0), 0) / campaigns.length
        : 0
    const avgClickRate =
      campaigns.length > 0
        ? campaigns.reduce((s, c) => s + (c.click_rate || 0), 0) / campaigns.length
        : 0
    const retention =
      totalAudience > 0
        ? Math.round(((totalAudience - unsubscribed) / totalAudience) * 1000) / 10
        : 100
    return { opened, clicked, unsubscribed, avgOpenRate, avgClickRate, retention }
  }, [campaigns])

  const chartConfig: ChartConfig = {
    opened: { label: 'Aberturas', color: 'hsl(24,95%,53%)' },
    clicked: { label: 'Cliques', color: 'hsl(280,65%,55%)' },
  }

  const timeData = useMemo(() => {
    return [...campaigns]
      .filter((c) => c.created)
      .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
      .map((c) => ({
        name: c.title?.length > 20 ? c.title.slice(0, 20) + '…' : c.title,
        opened: c.opened_count || 0,
        clicked: c.click_count || 0,
      }))
  }, [campaigns])

  const barData = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => (b.open_rate || 0) - (a.open_rate || 0))
      .slice(0, 10)
      .map((c) => ({
        name: c.title?.length > 15 ? c.title.slice(0, 15) + '…' : c.title,
        open_rate: Math.round((c.open_rate || 0) * 100) / 100,
        click_rate: Math.round((c.click_rate || 0) * 100) / 100,
      }))
  }, [campaigns])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={MailOpen}
          label="Total de Aberturas"
          value={totals.opened}
          color="hsl(24,95%,53%)"
        />
        <MetricCard
          icon={MousePointerClick}
          label="Total de Cliques"
          value={totals.clicked}
          color="hsl(280,65%,55%)"
        />
        <MetricCard
          icon={UserMinus}
          label="Descadastros"
          value={totals.unsubscribed}
          color="hsl(0,80%,50%)"
        />
        <MetricCard
          icon={Eye}
          label="Retenção (%)"
          value={totals.retention}
          color="hsl(140,70%,45%)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700">Taxa Média de Abertura</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">
              {totals.avgOpenRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700">Taxa Média de Clique</p>
            <p className="text-3xl font-bold text-purple-500 mt-1">
              {totals.avgClickRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Aberturas e Cliques por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={70} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="opened" fill="hsl(24,95%,53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicked" fill="hsl(280,65%,55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Taxas de Performance (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={barData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={70} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="open_rate"
                  stroke="hsl(24,95%,53%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="click_rate"
                  stroke="hsl(280,65%,55%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
