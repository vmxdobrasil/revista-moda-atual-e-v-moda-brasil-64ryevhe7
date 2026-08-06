import { useState, useEffect, useCallback, useMemo } from 'react'
import { getMarketBenchmarks, type MarketBenchmarksData } from '@/services/market-watch'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Users, Calendar, AlertCircle, Layers } from 'lucide-react'

const fmt = (rate: number) => (rate > 0 && rate < 1 ? rate * 100 : rate).toFixed(2)

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  site: 'Site',
}

const ALL_PLATFORMS = ['instagram', 'facebook', 'youtube', 'tiktok', 'site']

export function CompetitiveBenchmarks() {
  const [data, setData] = useState<MarketBenchmarksData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const res = await getMarketBenchmarks()
      setData(res)
      setError(null)
    } catch {
      setError('Erro ao carregar benchmarks competitivos.')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('competitors', () => {
    loadData()
  })

  const platformGroups = useMemo(() => {
    if (!data) return []
    const groups: Record<string, typeof data.ranking> = {}
    ALL_PLATFORMS.forEach((p) => {
      groups[p] = data.ranking.filter((c) => c.platform === p)
    })
    return ALL_PLATFORMS.map((p) => ({
      platform: p,
      label: PLATFORM_LABELS[p] || p,
      competitors: groups[p] || [],
      hasData: (groups[p] || []).length > 0,
    }))
  }, [data])

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  const mag = data.magazine
  const avg = data.competitors_avg

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Benchmark Competitivo — Market Watch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Revista MODA ATUAL</p>
              <p className="text-lg font-bold text-orange-600">{fmt(mag.engagement_rate)}%</p>
              <p className="text-xs text-gray-400">
                {mag.total_posts} posts • {mag.post_frequency}/sem
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Média dos Concorrentes</p>
              <p className="text-lg font-bold text-blue-600">{fmt(avg.engagement_rate)}%</p>
              <p className="text-xs text-gray-400">{avg.total_competitors} concorrentes</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Diferencial</p>
              <p className="text-lg font-bold text-purple-600">
                {mag.engagement_rate > avg.engagement_rate ? '+' : ''}
                {Math.abs(mag.engagement_rate - avg.engagement_rate).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">vs média concorrentes</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Concorrente</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">Plataforma</th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">
                    <Users className="w-3 h-3 inline" /> Seguidores
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">
                    <TrendingUp className="w-3 h-3 inline" /> Engaj.
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">
                    <Calendar className="w-3 h-3 inline" /> Posts/sem
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.ranking.map((c) => (
                  <tr key={c.name + c.platform} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-medium">{c.name}</td>
                    <td className="py-2 px-2">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600 text-xs capitalize"
                      >
                        {c.platform}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">
                      {(c.followers / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-2 px-2 text-right text-orange-600 font-semibold">
                      {fmt(c.engagement_rate)}%
                    </td>
                    <td className="py-2 px-2 text-right text-gray-600">{c.post_frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="w-4 h-4 text-blue-500" />
            Benchmarks por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {platformGroups.map((group) => (
              <div
                key={group.platform}
                className={`p-3 rounded-lg border ${group.hasData ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-200'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs capitalize ${group.hasData ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {group.label}
                  </Badge>
                  <span className="text-xs text-gray-400">{group.competitors.length} compet.</span>
                </div>
                {group.hasData ? (
                  <div className="space-y-1">
                    {group.competitors.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 truncate">{c.name}</span>
                        <div className="flex gap-2 text-gray-500 shrink-0">
                          <span>{fmt(c.engagement_rate)}%</span>
                          <span>{(c.followers / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Sem dados para esta plataforma</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
