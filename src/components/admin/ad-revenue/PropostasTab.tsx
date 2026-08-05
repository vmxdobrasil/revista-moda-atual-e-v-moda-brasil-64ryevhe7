import { useState, useMemo } from 'react'
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
import { Loader2, Sparkles, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  generateProposal,
  updateProposal,
  deleteProposal,
  formatCurrency,
  AD_FORMATS,
  PROPOSAL_STATUSES,
  type AdProposal,
} from '@/services/ad-revenue'
import type { Edition } from '@/services/magazine'
import type { Advertisement } from '@/services/advertisements'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-700',
  aceito: 'bg-green-100 text-green-700',
  recusado: 'bg-red-100 text-red-700',
  contrato: 'bg-yellow-100 text-yellow-700',
  entregue: 'bg-purple-100 text-purple-700',
}

interface Props {
  proposals: AdProposal[]
  editions: Edition[]
  ads: Advertisement[]
  onRefresh: () => void
}

export function PropostasTab({ proposals, editions, ads, onRefresh }: Props) {
  const [advertiser, setAdvertiser] = useState('')
  const [campaign, setCampaign] = useState('')
  const [editionId, setEditionId] = useState('')
  const [format, setFormat] = useState('banner')
  const [generating, setGenerating] = useState(false)
  const [preview, setPreview] = useState<AdProposal | null>(null)

  const sorted = useMemo(
    () =>
      [...proposals].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()),
    [proposals],
  )

  const handleGenerate = async () => {
    if (!advertiser.trim()) {
      toast.error('Informe o anunciante.')
      return
    }
    setGenerating(true)
    try {
      await generateProposal({
        advertiser: advertiser.trim(),
        campaign: campaign.trim(),
        edition_id: editionId || undefined,
        format,
      })
      toast.success('Proposta gerada!')
      setAdvertiser('')
      setCampaign('')
      onRefresh()
    } catch {
      toast.error('Erro ao gerar proposta.')
    } finally {
      setGenerating(false)
    }
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateProposal(id, { status })
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProposal(id)
      toast.success('Proposta removida.')
      onRefresh()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Gerar Nova Proposta</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Anunciante</Label>
              <Input
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                placeholder="Nome do anunciante"
              />
            </div>
            <div>
              <Label className="text-xs">Campanha</Label>
              <Input
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="Nome da campanha"
              />
            </div>
            <div>
              <Label className="text-xs">Edição (opcional)</Label>
              <Select value={editionId} onValueChange={setEditionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-match" />
                </SelectTrigger>
                <SelectContent>
                  {editions.map((ed) => (
                    <SelectItem key={ed.id} value={ed.id}>
                      {ed.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Gerar Proposta
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {sorted.map((p) => (
          <Card key={p.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{p.advertiser}</p>
                    <Badge variant="secondary" className={STATUS_COLORS[p.status] || ''}>
                      {p.status}
                    </Badge>
                  </div>
                  {p.campaign && <p className="text-sm text-gray-500">{p.campaign}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span>Match: {p.match_score}/100</span>
                    <span>Preço: {formatCurrency(p.suggested_price)}</span>
                    <span>Reach: {p.audience_reach?.toLocaleString('pt-BR')}</span>
                    <span>Formato: {p.format}</span>
                    {p.expand?.edition && <span>Edição: {p.expand.edition.title}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Select value={p.status} onValueChange={(v) => handleStatus(p.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPOSAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => setPreview(p)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sorted.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma proposta encontrada.</p>
        )}
      </div>

      {preview && (
        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Proposta — {preview.advertiser}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm max-h-[60vh] overflow-y-auto">
              {preview.proposal_data &&
                typeof preview.proposal_data === 'object' &&
                Object.entries(preview.proposal_data).map(([k, v]) => (
                  <div key={k}>
                    <span className="font-semibold text-gray-700">{k.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-gray-600">{String(v)}</span>
                  </div>
                ))}
              <div className="pt-2 border-t">
                <span className="font-semibold text-gray-700">Preço sugerido:</span>{' '}
                {formatCurrency(preview.suggested_price)}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Match score:</span>{' '}
                {preview.match_score}/100
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
