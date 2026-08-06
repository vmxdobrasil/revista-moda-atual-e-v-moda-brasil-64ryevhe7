import { useState, useEffect, useCallback } from 'react'
import { getMarketIntelSummary, type MarketIntelSummary } from '@/services/market-intel'
import { useRealtime } from '@/hooks/use-realtime'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  AlertTriangle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function MarketIntelContext() {
  const [data, setData] = useState<MarketIntelSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const summary = await getMarketIntelSummary()
      setData(summary)
      setError(null)
    } catch {
      setError('Não foi possível carregar o contexto de inteligência de mercado.')
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('market_signals', () => {
    loadData()
  })
  useRealtime('competitors', () => {
    loadData()
  })

  if (error) {
    return (
      <div className="px-6 py-2 bg-red-50 border-b flex items-center gap-2">
        <AlertCircle className="w-3 h-3 text-red-500" />
        <p className="text-xs text-red-600">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="px-6 py-2 border-b flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
        <span className="text-xs text-muted-foreground">Carregando contexto de mercado...</span>
      </div>
    )
  }

  const hasData = data.recent_signals.length > 0 || data.top_competitors.length > 0
  if (!hasData) return null

  return (
    <div className="border-b bg-orange-50/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-2 flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Contexto de Inteligência de Mercado (Market Watch)
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-orange-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange-500" />
        )}
      </button>
      {expanded && (
        <div className="px-6 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.recent_signals.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Sinais Recentes</p>
              {data.recent_signals.map((s) => (
                <div key={s.id} className="text-xs py-1 flex items-start gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px]',
                      s.severity === 'critico'
                        ? 'bg-red-100 text-red-700'
                        : s.severity === 'atencao'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700',
                    )}
                  >
                    {s.signal_type}
                  </Badge>
                  <span className="text-gray-700">{s.title}</span>
                </div>
              ))}
            </div>
          )}
          {data.top_competitors.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Top Concorrentes
              </p>
              {data.top_competitors.map((c) => (
                <div key={c.name} className="text-xs py-1 flex justify-between">
                  <span className="text-gray-700">
                    {c.name} <span className="text-gray-400">({c.platform})</span>
                  </span>
                  <span className="text-orange-600 font-medium">{c.engagement_rate}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
