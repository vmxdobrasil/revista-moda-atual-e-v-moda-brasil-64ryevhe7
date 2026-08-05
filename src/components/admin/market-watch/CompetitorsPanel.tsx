import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getConcorrentesReport, type ConcorrentesReport } from '@/services/market-watch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Trophy, Users, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  site: 'Site',
}

export function CompetitorsPanel() {
  const [report, setReport] = useState<ConcorrentesReport | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await getConcorrentesReport()
      setReport(data)
    } catch {
      toast.error('Erro ao carregar concorrentes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('competitors', () => loadData())

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const kpis = [
    { label: 'Concorrentes', value: report.summary.total, icon: Users, color: 'text-blue-600' },
    {
      label: 'Seguidores Médios',
      value: report.summary.avg_followers.toLocaleString('pt-BR'),
      icon: Trophy,
      color: 'text-orange-600',
    },
    {
      label: 'Engajamento Médio',
      value: `${report.summary.avg_engagement_rate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Posts/Semana Médio',
      value: report.summary.avg_post_frequency,
      icon: Calendar,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <p className="text-sm text-gray-500">{kpi.label}</p>
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Concorrente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Plataforma</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Seguidores</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Engaj.</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Posts/sem</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Temas</th>
                </tr>
              </thead>
              <tbody>
                {report.competitors.map((c, i) => (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {i + 1}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.social_handle}</p>
                    </td>
                    <td className="py-3 px-4">{PLATFORM_LABELS[c.platform] || c.platform}</td>
                    <td className="py-3 px-4 text-right">{c.followers.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {c.engagement_rate}%
                    </td>
                    <td className="py-3 px-4 text-right">{c.post_frequency}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.content_themes?.slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
