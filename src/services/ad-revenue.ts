import pb from '@/lib/pocketbase/client'

export interface AdProposal {
  id: string
  advertiser: string
  campaign: string
  edition: string
  format: string
  position: string
  audience_reach: number
  suggested_price: number
  match_score: number
  proposal_data: any
  status: string
  contract_date: string
  delivery_date: string
  created: string
  updated: string
  expand?: {
    edition?: { id: string; title: string; description: string }
  }
}

export interface GenerateProposalParams {
  advertiser: string
  campaign?: string
  edition_id?: string
  format?: string
  position?: string
}

export interface PriceResult {
  suggested_price: number
  base_price: number
  reach_adjustment: number
  position_adjustment: number
  rationale: string
}

export const AD_FORMATS = [
  { value: 'banner', label: 'Banner', basePrice: 500 },
  { value: 'capa', label: 'Capa', basePrice: 5000 },
  { value: 'pagina_inteira', label: 'Página Inteira', basePrice: 3000 },
  { value: 'sponsored_content', label: 'Sponsored Content', basePrice: 2500 },
  { value: 'story', label: 'Story', basePrice: 800 },
  { value: 'editorial_destaque', label: 'Editorial Destaque', basePrice: 4000 },
]

export const AD_POSITIONS = [
  'Capa principal',
  'Página interior topo',
  'Página interior meio',
  'Página interior rodapé',
  'Banner lateral',
  'Story destaque',
]

export const PROPOSAL_STATUSES = [
  'rascunho',
  'enviado',
  'aceito',
  'recusado',
  'contrato',
  'entregue',
]

export const AD_STATUSES = [
  'rascunho',
  'aprovado',
  'em_entrega',
  'entregue',
  'concluido',
  'cancelado',
]

export async function getProposals(): Promise<AdProposal[]> {
  return (await pb.collection('ad_proposals').getFullList({
    sort: '-created',
    expand: 'edition',
  })) as unknown as AdProposal[]
}

export async function updateProposal(id: string, data: Partial<AdProposal>): Promise<AdProposal> {
  return (await pb.collection('ad_proposals').update(id, data)) as unknown as AdProposal
}

export async function deleteProposal(id: string): Promise<void> {
  await pb.collection('ad_proposals').delete(id)
}

export async function generateProposal(params: GenerateProposalParams): Promise<AdProposal> {
  return await pb.send('/backend/v1/proposta', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function priceAd(
  format: string,
  audience_reach: number,
  position: string,
): Promise<PriceResult> {
  return await pb.send('/backend/v1/precificar', {
    method: 'POST',
    body: JSON.stringify({ format, audience_reach, position }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}
