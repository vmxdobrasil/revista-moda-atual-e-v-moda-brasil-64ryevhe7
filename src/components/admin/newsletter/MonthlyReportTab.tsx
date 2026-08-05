import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/admin/MetricCard'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, UserPlus, Heart, MailOpen, MousePointerClick, UserMinus } from 'lucide-react'
import type { Subscriber, NewsletterCampaign } from '@/services/newsletter'

interface MonthlyReportTabProps {
  subscribers: Subscriber[]
  campaigns: NewsletterCampaign[]
}

export function MonthlyReportTab({ subscribers, campaigns }: MonthlyReportTabProps) {
  const now = new Date()
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  )

  const report = useMemo(() => {
    const [year, monthNum] = month.split('-').map(Number)
    const monthStart = new Date(year, monthNum - 1, 1)
    const monthEnd = new Date(year, monthNum, 0, 23, 59, 59)

    const newSubs = subscribers.filter((s) => {
      const d = new Date(s.created)
      return d >= monthStart && d <= monthEnd
    })

    const activeReaders = subscribers.filter((s) => s.status === 'ativo').length
    const avgScore =
      subscribers.length > 0
        ? Math.round(
            (subscribers.reduce((sum, s) => sum + (s.engagement_score || 0), 0) /
              subscribers.length) *
              100,
          ) / 100
        : 0

    const monthCampaigns = campaigns.filter((c) => {
      const d = new Date(c.created)
      return d >= monthStart && d <= monthEnd
    })

    const opened = monthCampaigns.reduce((s, c) => s + (c.opened_count || 0), 0)
    const clicked = monthCampaigns.reduce((s, c) => s + (c.click_count || 0), 0)
    const unsubscribed = monthCampaigns.reduce((s, c) => s + (c.unsubscribe_count || 0), 0)

    const growthData: { day: string; total: number }[] = []
    const daysInMonth = new Date(year, monthNum, 0).getDate()
    let cumulative = 0
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`
      const dayStart = new Date(year, monthNum - 1, d)
      const dayEnd = new Date(year, monthNum - 1, d, 23, 59, 59)
      const dayCount = subscribers.filter((s) => {
        const cd = new Date(s.created)
        return cd >= dayStart && cd <= dayEnd
      }).length
      cumulative += dayCount
      growthData.push({ day: String(d), total: cumulative })
    }

    return {
      newCount: newSubs.length,
      activeReaders,
      avgScore,
      opened,
      clicked,
      unsubscribed,
      growthData,
      campaignCount: monthCampaigns.length,
    }
  }, [subscribers, campaigns, month])

  const chartConfig: ChartConfig = { total: { label: 'Acumulado', color: 'hsl(24,95%,53%)' } }
  const monthOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      opts.push({
        value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      })
    }
    return opts
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Período:</span>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={UserPlus}
          label="Novas Leitoras"
          value={report.newCount}
          color="hsl(140,70%,45%)"
        />
        <MetricCard
          icon={Users}
          label="Leitoras Ativas"
          value={report.activeReaders}
          color="hsl(200,80%,50%)"
        />
        <MetricCard
          icon={Heart}
          label="Score Médio"
          value={report.avgScore}
          color="hsl(280,65%,55%)"
        />
        <MetricCard
          icon={MailOpen}
          label="Aberturas"
          value={report.opened}
          color="hsl(24,95%,53%)"
        />
        <MetricCard
          icon={MousePointerClick}
          label="Cliques"
          value={report.clicked}
          color="hsl(340,75%,55%)"
        />
        <MetricCard
          icon={UserMinus}
          label="Descadastros"
          value={report.unsubscribed}
          color="hsl(0,80%,50%)"
        />
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Crescimento da Base no Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.growthData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(24,95%,53%)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500">
            Campanhas no período:{' '}
            <span className="font-semibold text-gray-700">{report.campaignCount}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
