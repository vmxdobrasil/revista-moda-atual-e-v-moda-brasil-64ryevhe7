import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getMarketIntelSummary, type MarketIntelSummary } from '@/services/market-intel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  Sparkles,
  Search,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const COLOR_MAP: Record<string, { icon: string; link: string }> = {
  orange: { icon: 'text-orange-500', link: 'text-orange-600 hover:text-orange-700' },
  purple: { icon: 'text-purple-500', link: 'text-purple-600 hover:text-purple-700' },
  blue: { icon: 'text-blue-500', link: 'text-blue-600 hover:text-blue-700' },
}

export function IntegrationsTab() {
  const [data, setData] = useState<MarketIntelSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const summary = await getMarketIntelSummary()
      setData(summary)
      setError(null)
    } catch {
      setError('Não foi possível carregar os dados de integração.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('market_signals', () => {
    loadData()
  })
  useRealtime('competitors', () => {
    loadData()
  })

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const integrations = [
    {
      name: 'Fashion Trend Advisor',
      desc: 'Inteligência competitiva e sinais de mercado enriquecem as recomendações de tendências.',
      icon: Sparkles,
      link: '/admin/ai-persona/chat',
      color: 'orange',
      detail: `${data.recent_signals.length} sinais ativos`,
    },
    {
      name: 'Trend Researcher',
      desc: 'Sinais de tendência e movimentações de concorrentes alimentam a identificação de tendências.',
      icon: Search,
      link: '/admin/content-generator',
      color: 'purple',
      detail: `${data.top_competitors.length} concorrentes monitorados`,
    },
    {
      name: 'Social Analytics',
      desc: 'Benchmarks comparativos entre o desempenho social da revista e concorrentes por plataforma.',
      icon: BarChart2,
      link: '/admin/social-analytics',
      color: 'blue',
      detail: 'Comparação por plataforma ativa',
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-none bg-gradient-to-r from-orange-50 to-blue-50 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Integrações Cross-Module</h2>
          <p className="text-sm text-gray-600">
            Inteligência de mercado conectada aos módulos estratégicos da plataforma.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((int) => {
          const Icon = int.icon
          const colors = COLOR_MAP[int.color]
          return (
            <Card key={int.name} className="rounded-xl shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{int.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-2">{int.desc}</p>
                <p className="text-xs text-gray-600 mb-3">{int.detail}</p>
                <Link to={int.link} className={`text-xs ${colors.link} flex items-center gap-1`}>
                  Acessar módulo <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {data.recent_signals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sinais de Mercado em Destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recent_signals.map((s) => (
              <div key={s.id} className="flex items-start gap-2 py-2 border-b last:border-0">
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    s.signal_type === 'tendencia'
                      ? 'bg-purple-100 text-purple-700'
                      : s.signal_type === 'alerta_concorrente'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {s.signal_type}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{s.title}</p>
                  {s.competitor_name && (
                    <p className="text-xs text-gray-400">{s.competitor_name}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
