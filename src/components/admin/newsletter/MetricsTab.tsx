import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Mail, MousePointerClick, Eye, UserMinus } from 'lucide-react'
import type { NewsletterCampaign } from '@/services/newsletter'

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Mail
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

export function MetricsTab({ campaigns }: { campaigns: NewsletterCampaign[] }) {
  const chartConfig: ChartConfig = { value: { label: 'Valor', color: 'hsl(24, 95%, 53%)' } }

  const stats = useMemo(() => {
    const sent = campaigns.filter((c) => c.status === 'enviado')
    const totalOpens = sent.reduce((s, c) => s + (c.opened_count || 0), 0)
    const totalClicks = sent.reduce((s, c) => s + (c.click_count || 0), 0)
    const totalUnsub = sent.reduce((s, c) => s + (c.unsubscribe_count || 0), 0)
    const avgOpenRate =
      sent.length > 0 ? sent.reduce((s, c) => s + (c.open_rate || 0), 0) / sent.length : 0
    const avgClickRate =
      sent.length > 0 ? sent.reduce((s, c) => s + (c.click_rate || 0), 0) / sent.length : 0
    return {
      sent: sent.length,
      totalOpens,
      totalClicks,
      totalUnsub,
      avgOpenRate,
      avgClickRate,
    }
  }, [campaigns])

  const chartData = useMemo(
    () =>
      campaigns
        .filter((c) => c.status === 'enviado')
        .slice(0, 10)
        .map((c) => ({
          name: (c.title || '').length > 20 ? (c.title || '').slice(0, 20) + '…' : c.title || '',
          Aberturas: c.opened_count || 0,
          Cliques: c.click_count || 0,
          Descadastros: c.unsubscribe_count || 0,
        })),
    [campaigns],
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Mail}
          label="Campanhas Enviadas"
          value={stats.sent}
          color="hsl(24, 95%, 53%)"
        />
        <MetricCard
          icon={Eye}
          label="Total Aberturas"
          value={stats.totalOpens}
          color="hsl(142, 71%, 45%)"
        />
        <MetricCard
          icon={MousePointerClick}
          label="Total Cliques"
          value={stats.totalClicks}
          color="hsl(200, 80%, 50%)"
        />
        <MetricCard
          icon={UserMinus}
          label="Descadastros"
          value={stats.totalUnsub}
          color="hsl(0, 84%, 60%)"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">
              {(stats.avgOpenRate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Taxa de Abertura Média</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {(stats.avgClickRate * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Taxa de Clique Média</p>
          </CardContent>
        </Card>
      </div>
      {chartData.length > 0 && (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Métricas por Campanha Enviada</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="Aberturas" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Cliques" fill="hsl(200, 80%, 50%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Descadastros" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
      {stats.sent === 0 && (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            Nenhuma campanha enviada ainda. As métricas aparecerão após o envio.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
