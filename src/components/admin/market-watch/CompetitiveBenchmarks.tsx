import { useState, useEffect, useCallback } from 'react'
import { getBenchmarks, type BenchmarkData } from '@/services/market-watch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, Users, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function CompetitiveBenchmarks() {
  const [data, setData] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await getBenchmarks()
      setData(res)
    } catch {
      toast.error('Erro ao carregar benchmarks competitivos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  const rma = data.revista_moda_atual
  const comp = data.comparison

  return (
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
            <p className="text-lg font-bold text-orange-600">
              {(rma.avg_engagement_rate * 100).toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400">engajamento médio</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Melhor Concorrente</p>
            <p className="text-lg font-bold text-blue-600">{comp.best_competitor}</p>
            <p className="text-xs text-gray-400">
              {comp.best_competitor_er.toFixed(2)}% engajamento
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Diferencial vs Mercado</p>
            <p className="text-lg font-bold text-purple-600">
              {comp.engagement_vs_avg > 0 ? '+' : ''}
              {comp.engagement_vs_avg.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">vs média concorrentes</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 font-semibold text-gray-700">Concorrente</th>
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
              {data.competitors.map((c) => (
                <tr key={c.name} className="border-b border-gray-100">
                  <td className="py-2 px-2 font-medium">{c.name}</td>
                  <td className="py-2 px-2 text-right text-gray-600">
                    {(c.followers / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-2 px-2 text-right text-orange-600 font-semibold">
                    {c.engagement_rate.toFixed(2)}%
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
