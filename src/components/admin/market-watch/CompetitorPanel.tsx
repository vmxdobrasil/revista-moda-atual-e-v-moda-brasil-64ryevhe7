import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getCompetitors, type CompetitorReport } from '@/services/market-watch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Users, TrendingUp, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export function CompetitorPanel() {
  const [report, setReport] = useState<CompetitorReport | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await getCompetitors()
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

  const s = report.summary

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Concorrentes</p>
            <p className="text-2xl font-bold text-blue-600">{s.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Seguidores (média)</p>
            <p className="text-2xl font-bold text-green-600">
              {s.avg_followers.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Engajamento (média)</p>
            <p className="text-2xl font-bold text-orange-600">{s.avg_engagement.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Posts/semana (média)</p>
            <p className="text-2xl font-bold text-purple-600">{s.avg_post_frequency}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {report.competitors.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <h4 className="font-bold text-gray-800">
                      #{c.rank} {c.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {c.platform}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{c.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.content_themes.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <div className="flex items-center gap-1 justify-end">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold">
                      {(c.followers / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold">{c.engagement_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-semibold">{c.post_frequency}/sem</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
