import { useState, useEffect, useCallback } from 'react'
import {
  getCompetitors,
  getAlerts,
  getBenchmarks,
  type CompetitorReport,
  type SignalResponse,
  type BenchmarkData,
} from '@/services/market-watch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, Trophy, AlertTriangle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export function MonthlyReportTab() {
  const [report, setReport] = useState<CompetitorReport | null>(null)
  const [signals, setSignals] = useState<SignalResponse | null>(null)
  const [benchmarks, setBenchmarks] = useState<BenchmarkData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [comp, sig, bench] = await Promise.all([
        getCompetitors(),
        getAlerts({ status: 'novo' }),
        getBenchmarks(),
      ])
      setReport(comp)
      setSignals(sig)
      setBenchmarks(bench)
    } catch {
      toast.error('Erro ao carregar relatório mensal.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading || !report || !signals || !benchmarks) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const topComp = report.competitors[0]
  const criticalSignals = signals.signals.filter((s) => s.severity === 'critico')
  const rma = benchmarks.revista_moda_atual

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Relatório de Inteligência Competitiva —{' '}
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Ranking de Performance
            </h4>
            <div className="space-y-2">
              {report.ranking.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium">
                    #{r.rank} {r.name}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      {r.followers.toLocaleString('pt-BR')} seg.
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {r.engagement_rate.toFixed(2)}% eng.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Benchmark Revista MODA ATUAL
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Engajamento médio: <strong>{(rma.avg_engagement_rate * 100).toFixed(2)}%</strong>
                </p>
                <p>
                  Total de posts: <strong>{rma.total_posts}</strong>
                </p>
                <p>
                  Total de views: <strong>{rma.total_views.toLocaleString('pt-BR')}</strong>
                </p>
                <p>
                  Melhor concorrente: <strong>{benchmarks.comparison.best_competitor}</strong> (
                  {benchmarks.comparison.best_competitor_er.toFixed(2)}%)
                </p>
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Sinais Críticos Ativos
              </h4>
              {criticalSignals.length > 0 ? (
                <div className="space-y-2">
                  {criticalSignals.map((s) => (
                    <div key={s.id} className="text-sm">
                      <p className="font-medium text-gray-700">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.detected_at}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum sinal crítico no momento.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Resumo Executivo</h4>
            <p className="text-sm text-gray-600">
              Monitoramento de {report.summary.total} concorrentes ativos. Engajamento médio do
              mercado: {report.summary.avg_engagement.toFixed(2)}%. Frequência média de posts:{' '}
              {report.summary.avg_post_frequency}/semana. {signals.total} sinais ativos,{' '}
              {criticalSignals.length} críticos. Top performer: {topComp?.name} com{' '}
              {topComp?.engagement_rate.toFixed(2)}% de engajamento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
