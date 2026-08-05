import { useState, useEffect } from 'react'
import {
  getConcorrentesReport,
  getAlertas,
  type ConcorrentesReport,
  type AlertasReport,
} from '@/services/market-watch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, AlertTriangle, Trophy, FileBarChart, BarChart3 } from 'lucide-react'

export function IntelligenceReportTab() {
  const [concorrentes, setConcorrentes] = useState<ConcorrentesReport | null>(null)
  const [alertas, setAlertas] = useState<AlertasReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getConcorrentesReport(), getAlertas()])
      .then(([c, a]) => {
        setConcorrentes(c)
        setAlertas(a)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !concorrentes || !alertas) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const allCompetitors = concorrentes.competitors
  const criticalSignals = alertas.signals.filter((s) => s.severity === 'critico')
  const attentionSignals = alertas.signals.filter((s) => s.severity === 'atencao')
  const newSignals = alertas.signals.filter((s) => s.status === 'novo')
  const trendSignals = alertas.signals.filter((s) => s.signal_type === 'tendencia')
  const competitorAlerts = alertas.signals.filter((s) => s.signal_type === 'alerta_concorrente')

  const platformDist: Record<string, number> = {}
  allCompetitors.forEach((c) => {
    platformDist[c.platform] = (platformDist[c.platform] || 0) + 1
  })

  const avgEngagement = concorrentes.summary.avg_engagement_rate
  const aboveAvg = allCompetitors.filter((c) => c.engagement_rate > avgEngagement)
  const belowAvg = allCompetitors.filter((c) => c.engagement_rate <= avgEngagement)

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-none bg-gradient-to-r from-orange-50 to-purple-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileBarChart className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              Relatório de Inteligência Competitiva
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Trophy className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-sm text-gray-500">Concorrentes Monitorados</p>
            <p className="text-2xl font-bold text-gray-800">{concorrentes.summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Engajamento Médio</p>
            <p className="text-2xl font-bold text-green-600">
              {concorrentes.summary.avg_engagement_rate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-500">Sinais Críticos</p>
            <p className="text-2xl font-bold text-red-600">{criticalSignals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <FileBarChart className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Sinais Novos</p>
            <p className="text-2xl font-bold text-blue-600">{newSignals.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ranking Completo de Concorrentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allCompetitors.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-sm">
                #{i + 1}
              </Badge>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {c.platform} • {c.social_handle} • {c.followers.toLocaleString('pt-BR')}{' '}
                  seguidores
                </p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-green-600">{c.engagement_rate}%</p>
                  <p className="text-xs text-gray-400">Engaj.</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-700">{c.post_frequency}</p>
                  <p className="text-xs text-gray-400">Posts/sem</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Análise Comparativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Distribuição por Plataforma
              </p>
              <div className="space-y-1">
                {Object.entries(platformDist).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{platform}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Engajamento vs Média ({avgEngagement}%)
              </p>
              <div className="space-y-1">
                <p className="text-sm text-green-700">
                  Acima da média: <strong>{aboveAvg.length}</strong> concorrentes
                </p>
                <p className="text-sm text-gray-600">
                  Abaixo da média: <strong>{belowAvg.length}</strong> concorrentes
                </p>
                {aboveAvg.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Destaques: {aboveAvg.map((c) => c.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tendências Emergentes e Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...trendSignals, ...competitorAlerts].slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-start gap-2 py-2 border-b last:border-0">
              <Badge
                variant="secondary"
                className={`text-xs ${s.signal_type === 'tendencia' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}
              >
                {s.signal_type === 'tendencia' ? 'Tendência' : 'Alerta'}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{s.title}</p>
                {s.competitor_name && <p className="text-xs text-gray-400">{s.competitor_name}</p>}
              </div>
            </div>
          ))}
          {trendSignals.length === 0 && competitorAlerts.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              Nenhuma tendência ou movimentação detectada.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sinais que Exigem Atenção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...criticalSignals, ...attentionSignals].slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-start gap-2 py-2 border-b last:border-0">
              <Badge
                variant="secondary"
                className={`text-xs ${s.severity === 'critico' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {s.severity}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{s.title}</p>
                {s.competitor_name && <p className="text-xs text-gray-400">{s.competitor_name}</p>}
              </div>
            </div>
          ))}
          {criticalSignals.length === 0 && attentionSignals.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">
              Nenhum sinal crítico ou de atenção no momento.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
