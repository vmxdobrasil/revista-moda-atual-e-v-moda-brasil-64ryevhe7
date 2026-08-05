import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getMarketBenchmarks, type MarketBenchmarksData } from '@/services/market-watch'
import { Gauge, TrendingUp, Calendar } from 'lucide-react'

export function MarketBenchmarks() {
  const [data, setData] = useState<MarketBenchmarksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMarketBenchmarks()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Benchmark Competitivo</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const magER = (data.magazine.engagement_rate * 100).toFixed(2)
  const compER = data.competitors_avg.engagement_rate.toFixed(2)
  const erDiff = data.magazine.engagement_rate * 100 - data.competitors_avg.engagement_rate
  const erBetter = erDiff >= 0

  const magFreq = data.magazine.post_frequency
  const compFreq = data.competitors_avg.post_frequency
  const freqDiff = magFreq - compFreq
  const freqBetter = freqDiff >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Gauge className="w-5 h-5 text-orange-500" />
          Benchmark Competitivo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Revista MODA ATUAL</p>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600">Engajamento:</span>
              <span className="font-bold text-green-600">{magER}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">Posts/sem:</span>
              <span className="font-bold text-blue-600">{magFreq}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Média Concorrentes ({data.competitors_avg.total_competitors})
            </p>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Engajamento:</span>
              <span className="font-bold text-gray-700">{compER}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Posts/sem:</span>
              <span className="font-bold text-gray-700">{compFreq}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge
            variant="secondary"
            className={erBetter ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          >
            {erBetter ? '+' : ''}
            {erDiff.toFixed(2)}% engaj. vs concorrentes
          </Badge>
          <Badge
            variant="secondary"
            className={freqBetter ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          >
            {freqBetter ? '+' : ''}
            {freqDiff.toFixed(1)} posts/sem vs concorrentes
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Ranking de Concorrentes
          </p>
          {data.ranking.map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
              <span className="text-sm font-medium text-gray-700 flex-1">{c.name}</span>
              <span className="text-xs text-gray-400">{c.platform}</span>
              <span className="text-sm font-bold text-green-600 w-12 text-right">
                {c.engagement_rate}%
              </span>
              <span className="text-xs text-gray-400 w-16 text-right">{c.post_frequency}/sem</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
