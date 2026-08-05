import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Loader2, Filter, Users, Sparkles, TrendingUp, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import {
  segmentSubscribers,
  type SegmentarResult,
  type SegmentarParams,
} from '@/services/segmentar'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: typeof Users
}) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function SegmentationTab() {
  const [segmenting, setSegmenting] = useState(false)
  const [result, setResult] = useState<SegmentarResult | null>(null)
  const [params, setParams] = useState({
    segment: '',
    status: '',
    engagement_period_days: '',
    behavior_days: '',
    min_engagement_rate: '',
    min_engagement: '',
    min_engagement_score: '',
  })

  const handleSegment = async () => {
    setSegmenting(true)
    try {
      const p: SegmentarParams = {}
      if (params.segment) p.segment = params.segment
      if (params.status) p.status = params.status
      if (params.engagement_period_days)
        p.engagement_period_days = Number(params.engagement_period_days)
      if (params.behavior_days) p.behavior_days = Number(params.behavior_days)
      if (params.min_engagement_rate) p.min_engagement_rate = Number(params.min_engagement_rate)
      if (params.min_engagement) p.min_engagement = Number(params.min_engagement)
      if (params.min_engagement_score) p.min_engagement_score = Number(params.min_engagement_score)
      const r = await segmentSubscribers(p)
      setResult(r)
      toast.success(`${r.total} assinantes encontrados.`)
    } catch {
      toast.error('Erro ao segmentar.')
    } finally {
      setSegmenting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            Critérios de Segmentação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Segmento</Label>
              <Select
                value={params.segment}
                onValueChange={(v) => setParams({ ...params, segment: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="varejo">Varejo</SelectItem>
                  <SelectItem value="atacado">Atacado</SelectItem>
                  <SelectItem value="consumidora">Consumidora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Status</Label>
              <Select
                value={params.status}
                onValueChange={(v) => setParams({ ...params, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="descadastrado">Descadastrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Score mínimo</Label>
              <Input
                type="number"
                placeholder="Ex: 50"
                value={params.min_engagement_score}
                onChange={(e) => setParams({ ...params, min_engagement_score: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Período de engajamento social (dias)</Label>
              <Input
                type="number"
                placeholder="Ex: 30"
                value={params.engagement_period_days}
                onChange={(e) => setParams({ ...params, engagement_period_days: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Comportamento ativo (dias)</Label>
              <Input
                type="number"
                placeholder="Ex: 14"
                value={params.behavior_days}
                onChange={(e) => setParams({ ...params, behavior_days: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Taxa de engajamento mínima (%)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ex: 2.5"
                value={params.min_engagement_rate}
                onChange={(e) => setParams({ ...params, min_engagement_rate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Engajamento mínimo (views/likes)</Label>
              <Input
                type="number"
                placeholder="Ex: 1000"
                value={params.min_engagement}
                onChange={(e) => setParams({ ...params, min_engagement: e.target.value })}
              />
            </div>
          </div>
          <Button
            onClick={handleSegment}
            disabled={segmenting}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {segmenting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Filter className="w-4 h-4" />
            )}
            Segmentar Audiência
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={result.total} icon={Users} />
            <StatCard label="Score Médio" value={result.avg_engagement_score} icon={Sparkles} />
            <StatCard
              label="ER Social Médio"
              value={`${(result.avg_social_engagement_rate || 0).toFixed(1)}%`}
              icon={TrendingUp}
            />
            <StatCard
              label="Scores Atualizados"
              value={result.updated_engagement_scores || 0}
              icon={TrendingUp}
            />
          </div>
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Distribuição de Engajamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-green-50">
                  <p className="text-2xl font-bold text-green-700">
                    {result.engagement_breakdown?.alta || 0}
                  </p>
                  <p className="text-xs text-green-600">Alta (70+)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-yellow-50">
                  <p className="text-2xl font-bold text-yellow-700">
                    {result.engagement_breakdown?.media || 0}
                  </p>
                  <p className="text-xs text-yellow-600">Média (35-69)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-gray-50">
                  <p className="text-2xl font-bold text-gray-600">
                    {result.engagement_breakdown?.baixa || 0}
                  </p>
                  <p className="text-xs text-gray-500">Baixa (&lt;35)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {result.recommended_editions && result.recommended_editions.length > 0 && (
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  Edições Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.recommended_editions.map((ed) => (
                  <div
                    key={ed.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{ed.title}</p>
                      {ed.slug && <p className="text-xs text-gray-400">/{ed.slug}</p>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>ER: {(ed.avg_engagement_rate || 0).toFixed(1)}%</span>
                      <span>Views: {ed.avg_views || 0}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Breakdown por Segmento e Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.by_segment || {}).map(([key, val]) => (
                  <Badge key={key} variant="outline" className="text-sm">
                    {SEGMENT_LABELS[key] || key}: {val}
                  </Badge>
                ))}
                {Object.entries(result.by_status || {}).map(([key, val]) => (
                  <Badge key={key} variant="outline" className="text-sm">
                    {key}: {val}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
