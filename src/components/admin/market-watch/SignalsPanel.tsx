import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getAlertas,
  getCompetitorsList,
  type AlertasReport,
  type AlertaParams,
} from '@/services/market-watch'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info, AlertTriangle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SEVERITY_CONFIG: Record<string, { label: string; color: string; icon: typeof Info }> = {
  info: { label: 'Info', color: 'bg-blue-100 text-blue-700', icon: Info },
  atencao: { label: 'Atenção', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  critico: { label: 'Crítico', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

const TYPE_LABELS: Record<string, string> = {
  tendencia: 'Tendência',
  alerta_concorrente: 'Alerta de Concorrente',
  mencao_marca: 'Menção de Marca',
  comportamento_consumidor: 'Comportamento do Consumidor',
}

const TYPE_HIGHLIGHT: Record<string, { border: string; bg: string; badge: string }> = {
  tendencia: { border: 'border-l-purple-500', bg: 'bg-purple-50/50', badge: 'bg-purple-500' },
  alerta_concorrente: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50/50',
    badge: 'bg-orange-500',
  },
}

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  em_analise: 'Em Análise',
  notificado: 'Notificado',
  arquivado: 'Arquivado',
}

export function SignalsPanel() {
  const [report, setReport] = useState<AlertasReport | null>(null)
  const [competitors, setCompetitors] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [filters, setFilters] = useState<AlertaParams>({})

  const loadData = useCallback(async () => {
    try {
      setFieldErrors({})
      const data = await getAlertas(filters)
      setReport(data)
    } catch (err) {
      const errors = extractFieldErrors(err)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
      } else {
        toast.error('Erro ao carregar sinais de mercado.')
      }
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    getCompetitorsList()
      .then(setCompetitors)
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('market_signals', () => loadData())

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.keys(fieldErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {Object.entries(fieldErrors).map(([field, msg]) => (
              <p key={field}>
                <strong>{field}:</strong> {msg}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, signal_type: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, severity: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(SEVERITY_CONFIG).map(([v, c]) => (
              <SelectItem key={v} value={v}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, competitor: v === 'all' ? undefined : v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Concorrente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {competitors.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="De"
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
        />
        <Input
          type="date"
          placeholder="Até"
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total de Sinais</p>
            <p className="text-2xl font-bold text-gray-800">{report.summary.total}</p>
          </CardContent>
        </Card>
        {Object.entries(report.summary.by_severity).map(([sev, count]) => {
          const cfg = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.info
          return (
            <Card key={sev}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <cfg.icon className="w-4 h-4" />
                  <p className="text-sm text-gray-500">{cfg.label}</p>
                </div>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-3">
        {report.signals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Nenhum sinal encontrado com os filtros atuais.</p>
            </CardContent>
          </Card>
        ) : (
          report.signals.map((sig) => {
            const sevCfg = SEVERITY_CONFIG[sig.severity] || SEVERITY_CONFIG.info
            const highlight = TYPE_HIGHLIGHT[sig.signal_type]
            return (
              <Card
                key={sig.id}
                className={highlight ? `${highlight.border} ${highlight.bg} border-l-4` : ''}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${sevCfg.color}`}
                    >
                      <sevCfg.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-gray-800">{sig.title}</h4>
                        {highlight && (
                          <Badge className={`text-xs text-white ${highlight.badge}`}>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                        <Badge variant="secondary" className={`text-xs ${sevCfg.color}`}>
                          {sevCfg.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[sig.signal_type] || sig.signal_type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {STATUS_LABELS[sig.status] || sig.status}
                        </Badge>
                      </div>
                      {sig.description && (
                        <p className="text-sm text-gray-600 mb-1">{sig.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {sig.competitor_name && <span>{sig.competitor_name}</span>}
                        {sig.source && <span>{sig.source}</span>}
                        {sig.detected_at && (
                          <span>{new Date(sig.detected_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
