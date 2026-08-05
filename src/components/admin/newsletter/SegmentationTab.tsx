import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Filter, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { segmentSubscribers, type SegmentarResult } from '@/services/segmentar'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}

export function SegmentationTab() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SegmentarResult | null>(null)
  const [filters, setFilters] = useState({
    segment: '',
    status: '',
    interests: '',
    engagement_period_days: '',
    behavior_days: '',
    min_engagement_rate: '',
    min_engagement: '',
  })

  const handleSegment = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      if (filters.segment && filters.segment !== 'todos') params.segment = filters.segment
      if (filters.status) params.status = filters.status
      if (filters.interests)
        params.interests = filters.interests
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      if (filters.engagement_period_days)
        params.engagement_period_days = parseInt(filters.engagement_period_days)
      if (filters.behavior_days) params.behavior_days = parseInt(filters.behavior_days)
      if (filters.min_engagement_rate)
        params.min_engagement_rate = parseFloat(filters.min_engagement_rate)
      if (filters.min_engagement) params.min_engagement = parseInt(filters.min_engagement)
      const res = await segmentSubscribers(params)
      setResult(res)
      toast.success(`${res.total} leitoras encontradas.`)
    } catch {
      toast.error('Erro ao segmentar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            <p className="font-semibold text-gray-700">Filtros de Segmentação</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label>Segmento</Label>
              <Select
                value={filters.segment}
                onValueChange={(v) => setFilters({ ...filters, segment: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SEGMENT_LABELS).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEGMENT_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="descadastrado">Descadastrado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interesses (vírgula)</Label>
              <Input
                value={filters.interests}
                onChange={(e) => setFilters({ ...filters, interests: e.target.value })}
                placeholder="tendências, looks"
              />
            </div>
            <div>
              <Label>Período de engajamento (dias)</Label>
              <Input
                type="number"
                value={filters.engagement_period_days}
                onChange={(e) => setFilters({ ...filters, engagement_period_days: e.target.value })}
                placeholder="30"
              />
            </div>
            <div>
              <Label>Comportamento ativo (dias)</Label>
              <Input
                type="number"
                value={filters.behavior_days}
                onChange={(e) => setFilters({ ...filters, behavior_days: e.target.value })}
                placeholder="7"
              />
            </div>
            <div>
              <Label>Taxa mín. engajamento (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={filters.min_engagement_rate}
                onChange={(e) => setFilters({ ...filters, min_engagement_rate: e.target.value })}
                placeholder="2.5"
              />
            </div>
            <div>
              <Label>Métrica mín. (views)</Label>
              <Input
                type="number"
                value={filters.min_engagement}
                onChange={(e) => setFilters({ ...filters, min_engagement: e.target.value })}
                placeholder="1000"
              />
            </div>
          </div>
          <Button
            onClick={handleSegment}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Filter className="w-4 h-4 mr-2" />
            )}
            Executar Segmentação
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">{result.total}</p>
                <p className="text-xs text-gray-500">Total de Leitoras</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">{result.avg_engagement_score}</p>
                <p className="text-xs text-gray-500">Score Médio</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {result.avg_social_engagement_rate}
                </p>
                <p className="text-xs text-gray-500">ER Social Médio</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {result.updated_engagement_scores}
                </p>
                <p className="text-xs text-gray-500">Scores Atualizados</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Por Segmento</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.by_segment).map(([k, v]) => (
                    <Badge key={k} variant="secondary">
                      {SEGMENT_LABELS[k] || k}: {v}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Engajamento</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Alta: {result.engagement_breakdown.alta}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Média: {result.engagement_breakdown.media}
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Baixa: {result.engagement_breakdown.baixa}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          {result.recommended_editions && result.recommended_editions.length > 0 && (
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <p className="text-sm font-semibold text-gray-700">Edições Recomendadas</p>
                </div>
                <div className="space-y-2">
                  {result.recommended_editions.map((ed) => (
                    <div
                      key={ed.id}
                      className="flex items-center justify-between text-sm border-l-2 border-orange-200 pl-3"
                    >
                      <span className="text-gray-700">{ed.title}</span>
                      <div className="flex gap-3 text-xs text-gray-400">
                        <span>ER: {ed.avg_engagement_rate}</span>
                        <span>Views: {ed.avg_views}</span>
                        <span>Match: {ed.match_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
