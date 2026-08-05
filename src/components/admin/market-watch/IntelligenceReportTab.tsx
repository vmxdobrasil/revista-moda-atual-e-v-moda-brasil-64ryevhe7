import { useState, useEffect } from 'react'
import {
  getConcorrentesReport,
  getAlertas,
  type ConcorrentesReport,
  type AlertasReport,
} from '@/services/market-watch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, AlertTriangle, Trophy, FileBarChart } from 'lucide-react'

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

  const top3 = concorrentes.competitors.slice(0, 3)
  const criticalSignals = alertas.signals.filter((s) => s.severity === 'critico')
  const attentionSignals = alertas.signals.filter((s) => s.severity === 'atencao')
  const newSignals = alertas.signals.filter((s) => s.status === 'novo')

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
          <CardTitle className="text-lg">Top 3 Concorrentes por Engajamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {top3.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-sm">
                #{i + 1}
              </Badge>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">
                  {c.platform} • {c.followers.toLocaleString('pt-BR')} seguidores
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{c.engagement_rate}%</p>
                <p className="text-xs text-gray-400">{c.post_frequency} posts/sem</p>
              </div>
            </div>
          ))}
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
