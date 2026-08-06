import { useState, useEffect, useCallback } from 'react'
import { getMarketBenchmarks, type MarketBenchmarksData } from '@/services/market-watch'
import { getPerPlatformBenchmarks, type PerPlatformData } from '@/services/market-intel'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
}

const fmt = (rate: number) => (rate > 0 && rate < 1 ? rate * 100 : rate).toFixed(2)

export function MarketBenchmarks() {
  const [benchmarks, setBenchmarks] = useState<MarketBenchmarksData | null>(null)
  const [perPlatform, setPerPlatform] = useState<PerPlatformData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [bm, pp] = await Promise.all([getMarketBenchmarks(), getPerPlatformBenchmarks()])
      setBenchmarks(bm)
      setPerPlatform(pp)
      setError(null)
    } catch {
      setError('Não foi possível carregar os benchmarks competitivos.')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('competitors', () => {
    loadData()
  })

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

  if (!benchmarks || !perPlatform) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    )
  }

  const mag = benchmarks.magazine
  const avg = benchmarks.competitors_avg

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Benchmark Competitivo por Plataforma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Revista MODA ATUAL</p>
            <p className="text-lg font-bold text-blue-600">{fmt(mag.engagement_rate)}%</p>
            <p className="text-xs text-gray-400">{mag.total_posts} posts</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Média Concorrentes</p>
            <p className="text-lg font-bold text-gray-700">{fmt(avg.engagement_rate)}%</p>
            <p className="text-xs text-gray-400">{avg.total_competitors} concorrentes</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-500">Diferencial</p>
            <p className="text-lg font-bold text-green-600">
              {mag.engagement_rate > avg.engagement_rate ? '+' : ''}
              {Math.abs(mag.engagement_rate - avg.engagement_rate).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Plataforma</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">Revista</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">
                  Concorrentes (Média)
                </th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Top Concorrente</th>
              </tr>
            </thead>
            <tbody>
              {perPlatform.platforms.map((p) => {
                const topComp = p.competitors.competitors[0]
                return (
                  <tr key={p.magazine.platform} className="border-b border-gray-100">
                    <td className="py-2 px-2 font-medium">
                      {PLATFORM_LABELS[p.magazine.platform] || p.magazine.platform}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.magazine.has_data ? (
                        <span className="text-blue-600 font-semibold">
                          {fmt(p.magazine.avg_engagement)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Sem dados</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {p.competitors.competitors.length > 0 ? (
                        <span className="text-gray-700">{fmt(p.competitors.avg_engagement)}%</span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Sem dados</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {topComp ? `${topComp.name} (${fmt(topComp.engagement_rate)}%)` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Concorrente</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Plataforma</th>
                <th className="text-right py-2 px-2 font-semibold text-gray-700">
                  <Users className="w-3 h-3 inline" /> Seg.
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
              {benchmarks.ranking.map((c) => (
                <tr key={c.name + c.platform} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium">{c.name}</td>
                  <td className="py-2 px-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                      {PLATFORM_LABELS[c.platform] || c.platform}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {(c.followers / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-2 px-2 text-right text-blue-600 font-semibold">
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
  )
}
