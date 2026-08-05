import { Card, CardContent } from '@/components/ui/card'
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
import { toast } from 'sonner'
import {
  updateProposal,
  PROPOSAL_STATUSES,
  formatCurrency,
  type AdProposal,
} from '@/services/ad-revenue'
import { updateAd, type Advertisement } from '@/services/advertisements'
import { AD_STATUSES } from '@/services/ad-revenue'
import { Truck, Calendar } from 'lucide-react'

interface Props {
  proposals: AdProposal[]
  ads: Advertisement[]
  onRefresh: () => void
}

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  aprovado: 'bg-green-100 text-green-700',
  em_entrega: 'bg-blue-100 text-blue-700',
  entregue: 'bg-purple-100 text-purple-700',
  concluido: 'bg-teal-100 text-teal-700',
  cancelado: 'bg-red-100 text-red-700',
  enviado: 'bg-blue-100 text-blue-700',
  aceito: 'bg-green-100 text-green-700',
  recusado: 'bg-red-100 text-red-700',
  contrato: 'bg-yellow-100 text-yellow-700',
}

export function EntregasTab({ proposals, ads, onRefresh }: Props) {
  const activeProposals = proposals.filter((p) =>
    ['contrato', 'entregue', 'aceito'].includes(p.status),
  )
  const activeAds = ads.filter((a) =>
    ['em_entrega', 'entregue', 'aprovado'].includes(a.status || ''),
  )

  const handleProposalDate = async (id: string, field: string, value: string) => {
    try {
      await updateProposal(id, { [field]: value || null })
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar data.')
    }
  }

  const handleAdStatus = async (id: string, status: string) => {
    try {
      await updateAd(id, { status } as any)
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Truck className="w-4 h-4" /> Propostas em Entrega
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {activeProposals.map((p) => (
            <Card key={p.id} className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800">{p.advertiser}</p>
                      <Badge variant="secondary" className={STATUS_COLORS[p.status] || ''}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      {p.campaign} · {p.format} · {formatCurrency(p.suggested_price)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <Label className="text-xs">Contrato</Label>
                      <Input
                        type="date"
                        value={p.contract_date ? p.contract_date.slice(0, 10) : ''}
                        onChange={(e) => handleProposalDate(p.id, 'contract_date', e.target.value)}
                        className="w-[150px] h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Entrega</Label>
                      <Input
                        type="date"
                        value={p.delivery_date ? p.delivery_date.slice(0, 10) : ''}
                        onChange={(e) => handleProposalDate(p.id, 'delivery_date', e.target.value)}
                        className="w-[150px] h-8 text-xs"
                      />
                    </div>
                    <Select
                      value={p.status}
                      onValueChange={(v) =>
                        updateProposal(p.id, { status: v })
                          .then(onRefresh)
                          .catch(() => toast.error('Erro'))
                      }
                    >
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeProposals.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">Nenhuma proposta em entrega.</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Campanhas em Entrega
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {activeAds.map((ad) => (
            <Card key={ad.id} className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">{ad.title}</p>
                  <p className="text-xs text-gray-400">
                    {ad.advertiser || '—'} ·{' '}
                    {ad.delivery ? new Date(ad.delivery).toLocaleDateString('pt-BR') : 'Sem data'}
                  </p>
                </div>
                <Select
                  value={ad.status || 'rascunho'}
                  onValueChange={(v) => handleAdStatus(ad.id, v)}
                >
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
          {activeAds.length === 0 && (
            <p className="text-center text-gray-400 py-4 text-sm">Nenhuma campanha em entrega.</p>
          )}
        </div>
      </div>
    </div>
  )
}
