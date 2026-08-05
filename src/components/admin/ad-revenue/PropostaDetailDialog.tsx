import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  type AdProposal,
  FORMAT_LABELS,
  PROPOSAL_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  formatCurrency,
} from '@/services/ad-proposals'

function parseData(data: any): any {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

interface Props {
  proposal: AdProposal | null
  onOpenChange: (open: boolean) => void
}

export function PropostaDetailDialog({ proposal, onOpenChange }: Props) {
  const pd = proposal ? parseData(proposal.proposal_data) : {}
  const audiences = pd.suggested_audiences || []

  return (
    <Dialog open={!!proposal} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-orange-600">Detalhes da Proposta</DialogTitle>
        </DialogHeader>
        {proposal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Anunciante</span>
                <p className="font-medium">{proposal.advertiser}</p>
              </div>
              <div>
                <span className="text-gray-500">Campanha</span>
                <p className="font-medium">{proposal.campaign || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Edição</span>
                <p className="font-medium">{proposal.expand?.edition?.title || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Formato</span>
                <p className="font-medium">
                  {proposal.format ? FORMAT_LABELS[proposal.format] || proposal.format : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Posição</span>
                <p className="font-medium">{proposal.position || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Alcance</span>
                <p className="font-medium">
                  {proposal.audience_reach?.toLocaleString('pt-BR') || '-'} impactos
                </p>
              </div>
              <div>
                <span className="text-gray-500">Preço sugerido</span>
                <p className="font-medium text-green-600">
                  {formatCurrency(proposal.suggested_price || 0)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Match score</span>
                <p className="font-medium">{proposal.match_score || 0}/100</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <Badge
                  className={
                    STATUS_BADGE_CLASSES[proposal.status || ''] || 'bg-gray-100 text-gray-700'
                  }
                  variant="secondary"
                >
                  {PROPOSAL_STATUS_LABELS[proposal.status || ''] || proposal.status}
                </Badge>
              </div>
              <div>
                <span className="text-gray-500">Data de entrega</span>
                <p className="font-medium">{proposal.delivery_date || '-'}</p>
              </div>
            </div>

            {proposal.contract_number && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-orange-700 text-sm">Contrato</h3>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Número</span>
                    <p className="font-medium">{proposal.contract_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Data formal</span>
                    <p className="font-medium">{proposal.contract_date_formal || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Assinado em</span>
                    <p className="font-medium">{proposal.contract_signed_at || '-'}</p>
                  </div>
                </div>
                {proposal.contract_terms && (
                  <div className="mt-2 text-sm">
                    {proposal.contract_terms.commercial && (
                      <p>
                        <strong>Valor acordado:</strong>{' '}
                        {formatCurrency(proposal.contract_terms.commercial.agreed_price || 0)}
                      </p>
                    )}
                    {proposal.contract_terms.validity && (
                      <p>
                        <strong>Vigência:</strong> {proposal.contract_terms.validity}
                      </p>
                    )}
                    {proposal.contract_terms.clauses && (
                      <div className="mt-2">
                        <strong>Cláusulas:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          {proposal.contract_terms.clauses.map((c: string, i: number) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(pd.intro || pd.value_proposition) && (
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold text-gray-700">Conteúdo da Proposta</h3>
                {pd.intro && (
                  <p>
                    <strong>Introdução:</strong> {pd.intro}
                  </p>
                )}
                {pd.value_proposition && (
                  <p>
                    <strong>Proposta de valor:</strong> {pd.value_proposition}
                  </p>
                )}
                {pd.matched_theme && (
                  <p>
                    <strong>Tema:</strong> {pd.matched_theme}
                  </p>
                )}
                {pd.format_description && (
                  <p>
                    <strong>Formato:</strong> {pd.format_description}
                  </p>
                )}
                {pd.reach_summary && (
                  <p>
                    <strong>Alcance:</strong> {pd.reach_summary}
                  </p>
                )}
                {pd.pricing_summary && (
                  <p>
                    <strong>Preço:</strong> {pd.pricing_summary}
                  </p>
                )}
                {pd.cta && (
                  <div className="bg-orange-50 border-l-3 border-orange-400 p-3 rounded text-gray-700">
                    {pd.cta}
                  </div>
                )}
              </div>
            )}

            {audiences.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm">Públicos Sugeridos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Segmento</th>
                        <th className="text-left p-2">Tamanho</th>
                        <th className="text-left p-2">Engajamento</th>
                        <th className="text-left p-2">Interesses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audiences.map((a: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 font-medium">{a.segment}</td>
                          <td className="p-2">{a.audience_size}</td>
                          <td className="p-2">{a.engagement_level || '-'}</td>
                          <td className="p-2 text-gray-600">
                            {(a.top_interests || []).map((t: any) => t.interest).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
