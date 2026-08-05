import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  FORMAT_LABELS,
  PROPOSAL_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  type AdProposal,
} from '@/services/ad-proposals'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}

interface PropostaDetailDialogProps {
  proposal: AdProposal | null
  onOpenChange: (open: boolean) => void
}

export function PropostaDetailDialog({ proposal, onOpenChange }: PropostaDetailDialogProps) {
  const data = (proposal?.proposal_data || {}) as Record<string, any>
  const audiences: any[] = data.suggested_audiences || []

  const fields = [
    { label: 'Introdução', value: data.intro },
    { label: 'Proposta de Valor', value: data.value_proposition },
    { label: 'Tema Editorial', value: data.matched_theme },
    { label: 'Descrição do Formato', value: data.format_description },
    { label: 'Resumo de Alcance', value: data.reach_summary },
    { label: 'Resumo de Preço', value: data.pricing_summary },
    { label: 'Chamada para Ação', value: data.cta },
  ].filter((f) => f.value)

  return (
    <Dialog open={!!proposal} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {proposal?.advertiser} — {proposal?.campaign || 'Sem campanha'}
          </DialogTitle>
        </DialogHeader>
        {proposal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Edição:</span>{' '}
                {proposal.expand?.edition?.title || '-'}
              </div>
              <div>
                <span className="text-gray-500">Formato:</span>{' '}
                {FORMAT_LABELS[proposal.format] || proposal.format}
              </div>
              <div>
                <span className="text-gray-500">Posição:</span> {proposal.position || '-'}
              </div>
              <div>
                <span className="text-gray-500">Alcance:</span>{' '}
                {proposal.audience_reach?.toLocaleString('pt-BR') || '-'}
              </div>
              <div>
                <span className="text-gray-500">Preço:</span> R${' '}
                {proposal.suggested_price?.toLocaleString('pt-BR') || '-'}
              </div>
              <div>
                <span className="text-gray-500">Match:</span> {proposal.match_score || '-'}/100
              </div>
              <div>
                <span className="text-gray-500">Status:</span>{' '}
                <Badge
                  className={STATUS_BADGE_CLASSES[proposal.status] || 'bg-gray-100'}
                  variant="secondary"
                >
                  {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Contrato:</span>{' '}
                {proposal.contract_date?.slice(0, 10) || '-'}
              </div>
              <div>
                <span className="text-gray-500">Entrega:</span>{' '}
                {proposal.delivery_date?.slice(0, 10) || '-'}
              </div>
            </div>
            {fields.map((f) => (
              <div key={f.label}>
                <h4 className="font-semibold text-sm mb-1 text-orange-500">{f.label}</h4>
                <p className="text-sm text-gray-600">{String(f.value)}</p>
              </div>
            ))}
            {audiences.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Públicos Sugeridos</h4>
                <div className="space-y-2">
                  {audiences.map((a, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {SEGMENT_LABELS[a.segment] || a.segment}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              a.engagement_level === 'alta'
                                ? 'bg-green-100 text-green-700'
                                : a.engagement_level === 'media'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }
                          >
                            Engajamento {a.engagement_level}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tamanho: {a.audience_size} | Score médio: {a.avg_engagement_score}
                        </div>
                        {a.top_interests?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {a.top_interests.map((t: any, j: number) => (
                              <Badge key={j} variant="outline" className="text-xs">
                                {t.interest}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
