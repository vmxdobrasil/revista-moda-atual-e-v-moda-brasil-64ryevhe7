import pb from '@/lib/pocketbase/client'

export interface AdProposal {
  id: string
  advertiser: string
  campaign?: string
  edition?: string
  format?: string
  position?: string
  audience_reach?: number
  suggested_price?: number
  match_score?: number
  proposal_data?: any
  status?: string
  contract_date?: string
  delivery_date?: string
  created: string
  updated: string
  expand?: {
    edition?: { id: string; title: string }
  }
}

export const PROPOSAL_STATUSES = [
  'rascunho',
  'enviado',
  'aceito',
  'recusado',
  'contrato',
  'entregue',
]
export const AD_FORMATS = [
  'banner',
  'capa',
  'pagina_inteira',
  'sponsored_content',
  'story',
  'editorial_destaque',
]
export const AD_STATUSES = [
  'rascunho',
  'aprovado',
  'em_entrega',
  'entregue',
  'concluido',
  'cancelado',
]

export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aceito: 'Aceito',
  recusado: 'Recusado',
  contrato: 'Contrato',
  entregue: 'Entregue',
}

export const AD_STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  aprovado: 'Aprovado',
  em_entrega: 'Em Entrega',
  entregue: 'Entregue',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const FORMAT_LABELS: Record<string, string> = {
  banner: 'Banner',
  capa: 'Capa',
  pagina_inteira: 'Página Inteira',
  sponsored_content: 'Conteúdo Patrocinado',
  story: 'Story',
  editorial_destaque: 'Editorial Destaque',
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
  concluido: 'bg-teal-100 text-teal-700',
  cancelado: 'bg-red-100 text-red-700',
}

export async function getProposals(): Promise<AdProposal[]> {
  return await pb.collection('ad_proposals').getFullList<AdProposal>({
    sort: '-created',
    expand: 'edition',
  })
}

export async function createProposal(data: Partial<AdProposal>): Promise<AdProposal> {
  return await pb.collection('ad_proposals').create<AdProposal>(data)
}

export async function updateProposal(id: string, data: Partial<AdProposal>): Promise<AdProposal> {
  return await pb.collection('ad_proposals').update<AdProposal>(id, data)
}

export async function deleteProposal(id: string): Promise<void> {
  await pb.collection('ad_proposals').delete(id)
}

export interface PropostaResult {
  match_score?: number
  suggested_price?: number
  edition?: string
  edition_title?: string
  format?: string
  position?: string
  audience_reach?: number
}

export async function generateProposta(data: {
  advertiser: string
  campaign?: string
  edition?: string
  format?: string
  position?: string
}): Promise<PropostaResult> {
  return await pb.send('/backend/v1/proposta', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
