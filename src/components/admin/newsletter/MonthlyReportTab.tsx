import { useState, useMemo } from 'react'
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { UserPlus, Eye, MousePointerClick, UserMinus, Percent } from 'lucide-react'
import type { Subscriber, NewsletterCampaign } from '@/services/newsletter'

function ReportCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Eye
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

export function MonthlyReportTab({
  subscribers,
  campaigns,
}: {
  subscribers: Subscriber[]
  campaigns: NewsletterCampaign[]
}) {
  const now = new Date()
  const [period, setPeriod] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  )
  const chartConfig: ChartConfig = {
    value: { label: 'Valor', color: 'hsl(24, 95%, 53%)' },
  }

  const report = useMemo(() => {
    const [year, month] = period.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59)

    const newSubs = subscribers.filter((s) => {
      const d = new Date(s.created || '')
      return d >= monthStart && d <= monthEnd
    })

    const unsubscribed = subscribers.filter((s) => {
      if (!s.unsubscribed_at) return false
      const d = new Date(s.unsubscribed_at)
      return d >= monthStart && d <= monthEnd
    })

    const sentCampaigns = campaigns.filter((c) => {
      if (c.status !== 'enviado') return false
      const d = new Date(c.created || '')
      return d >= monthStart && d <= monthEnd
    })

    const opens = sentCampaigns.reduce((s, c) => s + (c.opened_count || 0), 0)
    const clicks = sentCampaigns.reduce((s, c) => s + (c.click_count || 0), 0)
    const unsub = unsubscribed.length
    const totalActive = subscribers.filter((s) => s.status === 'ativo').length
    const retention = subscribers.length > 0 ? (totalActive / subscribers.length) * 100 : 100

    return {
      newSubs: newSubs.length,
      opens,
      clicks,
      unsub,
      retention,
      sentCount: sentCampaigns.length,
    }
  }, [period, subscribers, campaigns])

  const trendData = useMemo(() => {
    const months: { label: string; newSubs: number; opens: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      const start = d
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const newSubs = subscribers.filter((s) => {
        const sd = new Date(s.created || '')
        return sd >= start && sd <= end
      }).length
      const opens = campaigns
        .filter((c) => {
          const cd = new Date(c.created || '')
          return cd >= start && cd <= end
        })
        .reduce((s, c) => s + (c.opened_count || 0), 0)
      months.push({ label, newSubs, opens })
    }
    return months
  }, [subscribers, campaigns])

  const periodOptions = useMemo(() => {
    const opts: string[] = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      opts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return opts
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Período</span>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((p) => {
              const [y, m] = p.split('-')
              return (
                <SelectItem key={p} value={p}>
                  {`${m}/${y}`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ReportCard
          icon={UserPlus}
          label="Novas Leitoras"
          value={report.newSubs}
          color="hsl(142, 71%, 45%)"
        />
        <ReportCard icon={Eye} label="Aberturas" value={report.opens} color="hsl(24, 95%, 53%)" />
        <ReportCard
          icon={MousePointerClick}
          label="Cliques"
          value={report.clicks}
          color="hsl(200, 80%, 50%)"
        />
        <ReportCard
          icon={UserMinus}
          label="Descadastros"
          value={report.unsub}
          color="hsl(0, 84%, 60%)"
        />
        <ReportCard
          icon={Percent}
          label="Retenção"
          value={`${report.retention.toFixed(1)}%`}
          color="hsl(280, 65%, 60%)"
        />
      </div>
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Tendência (6 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="newSubs"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Novas Leitoras"
                />
                <Line
                  type="monotone"
                  dataKey="opens"
                  stroke="hsl(24, 95%, 53%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Aberturas"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
