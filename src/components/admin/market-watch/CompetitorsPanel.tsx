import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getConcorrentesReport,
  type ConcorrentesReport,
  type ConcorrentesParams,
} from '@/services/market-watch'
import { getCategories, type Top60Category } from '@/services/top60'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Users, TrendingUp, Calendar, Crown } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  site: 'Site',
}

const SORT_OPTIONS = [
  { value: 'followers', label: 'Seguidores' },
  { value: 'engagement_rate', label: 'Engajamento' },
  { value: 'post_frequency', label: 'Frequência' },
]

export function CompetitorsPanel() {
  const [report, setReport] = useState<ConcorrentesReport | null>(null)
  const [categories, setCategories] = useState<Top60Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ConcorrentesParams>({ sort: 'followers' })

  const loadData = useCallback(async () => {
    try {
      const data = await getConcorrentesReport(filters)
      setReport(data)
    } catch {
      toast.error('Erro ao carregar concorrentes.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
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

  const s = report.summary
  const kpis = [
    { label: 'Concorrentes', value: String(s.total), sub: '', icon: Users, color: 'text-blue-600' },
    {
      label: 'Engaj. Médio',
      value: `${s.avg_engagement_rate}%`,
      sub: '',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'Top Seguidores',
      value: s.top_followers?.name || '-',
      sub: s.top_followers ? `${(s.top_followers.value / 1000000).toFixed(1)}M` : '',
      icon: Crown,
      color: 'text-orange-600',
    },
    {
      label: 'Top Engaj.',
      value: s.top_engagement_rate?.name || '-',
      sub: s.top_engagement_rate ? `${s.top_engagement_rate.value}%` : '',
      icon: Trophy,
      color: 'text-purple-600',
    },
    {
      label: 'Top Freq.',
      value: s.top_post_frequency?.name || '-',
      sub: s.top_post_frequency ? `${s.top_post_frequency.value}/sem` : '',
      icon: Calendar,
      color: 'text-pink-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, platform: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(PLATFORM_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, category: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                <p className="text-xs text-gray-500">{kpi.label}</p>
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{kpi.value}</p>
              {kpi.sub && <p className={`text-xs font-semibold ${kpi.color}`}>{kpi.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {report.content_themes_breakdown.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Temas de Conteúdo</p>
            <div className="flex flex-wrap gap-2">
              {report.content_themes_breakdown.map((t) => (
                <Badge key={t.theme} variant="secondary" className="bg-orange-50 text-orange-700">
                  {t.theme} <span className="ml-1 text-xs text-orange-400">{t.count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                {report.competitors.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {c.rank}
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
