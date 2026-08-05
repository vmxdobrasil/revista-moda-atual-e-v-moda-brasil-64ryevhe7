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
  contract_number?: string
  contract_date_formal?: string
  contract_terms?: any
  contract_signed_at?: string
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
  advertiser_email?: string
}

export interface PriceResult {
  suggested_price: number
  base_price: number
  reach_adjustment: number
  position_adjustment: number
  rationale: string
}

export const AD_FORMATS = [
  'banner',
  'capa',
  'pagina_inteira',
  'sponsored_content',
  'story',
  'editorial_destaque',
]

export const FORMAT_LABELS: Record<string, string> = {
  banner: 'Banner',
  capa: 'Capa',
  pagina_inteira: 'Página Inteira',
  sponsored_content: 'Conteúdo Patrocinado',
  story: 'Story',
  editorial_destaque: 'Editorial Destaque',
}

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

export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aceito: 'Aceito',
  recusado: 'Recusado',
  contrato: 'Contrato',
  entregue: 'Entregue',
}

export const AD_STATUSES = [
  'rascunho',
  'aprovado',
  'em_entrega',
  'entregue',
  'concluido',
  'cancelado',
]

export const AD_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  aprovado: 'Aprovado',
  em_entrega: 'Em Entrega',
  entregue: 'Entregue',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  enviado: 'bg-blue-100 text-blue-700',
  aceito: 'bg-green-100 text-green-700',
  recusado: 'bg-red-100 text-red-700',
  contrato: 'bg-purple-100 text-purple-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  aprovado: 'bg-green-100 text-green-700',
  em_entrega: 'bg-amber-100 text-amber-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-red-100 text-red-700',
}

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

export async function sendProposalEmail(id: string, email: string): Promise<void> {
  await pb.send('/backend/v1/proposta-email', {
    method: 'POST',
    body: JSON.stringify({ proposal_id: id, email }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function generateContract(id: string, specialTerms?: string): Promise<AdProposal> {
  return await pb.send('/backend/v1/proposta-contrato', {
    method: 'POST',
    body: JSON.stringify({ proposal_id: id, special_terms: specialTerms }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getPublicAdvertiserData(advertiser: string, token?: string): Promise<any> {
  const params = new URLSearchParams({ advertiser })
  if (token) params.set('token', token)
  return await pb.send(`/backend/v1/public/anunciante?${params.toString()}`, {
    method: 'GET',
  })
}

export async function getSocialPostsByEdition(editionId: string): Promise<any[]> {
  if (!editionId) return []
  return await pb.collection('social_posts').getFullList({
    filter: `edition = "${editionId}"`,
    sort: '-post_date',
  })
}
