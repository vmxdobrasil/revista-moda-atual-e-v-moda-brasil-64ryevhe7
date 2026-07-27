import pb from '@/lib/pocketbase/client'
import { generateMateria } from '@/services/materia'
import { generateCaption } from '@/services/caption'
import type { MarketplaceProduct } from '@/services/marketplace'

export type DeliveryStatus = 'rascunho' | 'em_revisao' | 'aprovado' | 'publicado'

export interface DeliveryQueueItem {
  id: string
  theme: string
  article_content: any
  caption: string
  bio_text: string
  product: string
  status: DeliveryStatus
  published_at: string | null
  error_note: string
  created: string
  updated: string
  expand?: { product: MarketplaceProduct }
}

export const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-500' },
  em_revisao: { label: 'Em Revisão', color: 'bg-blue-500' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500' },
  publicado: { label: 'Publicado', color: 'bg-purple-500' },
}

function getProductLink(product: MarketplaceProduct): string {
  if (product.link) return product.link
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://revistamodaatual.goskip.app'
  return `${origin}/offers`
}

export function getArticleFields(articleContent: any) {
  if (!articleContent) return null
  const article = articleContent.article || articleContent
  return {
    title: article.titulo_principal || '',
    subtitle: article.subtitulo || '',
    lead: article.olho || '',
    body: article.corpo || articleContent.content || '',
    tags: article.tags_seo || [],
    cta: article.call_to_action || [],
  }
}

export async function getDeliveryQueueItems(statusFilter?: string): Promise<DeliveryQueueItem[]> {
  const opts: any = { sort: '-created', expand: 'product' }
  if (statusFilter) opts.filter = `status = "${statusFilter}"`
  return (await pb.collection('delivery_queue').getFullList(opts)) as unknown as DeliveryQueueItem[]
}

export async function getDeliveryItem(id: string): Promise<DeliveryQueueItem> {
  return (await pb
    .collection('delivery_queue')
    .getOne(id, { expand: 'product' })) as unknown as DeliveryQueueItem
}

export async function deleteDelivery(id: string): Promise<void> {
  await pb.collection('delivery_queue').delete(id)
}

export async function updateCaption(id: string, caption: string): Promise<void> {
  await pb.collection('delivery_queue').update(id, { caption, status: 'em_revisao' })
}

export async function approveDelivery(id: string): Promise<void> {
  await pb.collection('delivery_queue').update(id, { status: 'aprovado' })
}

export async function rejectDelivery(id: string): Promise<void> {
  await pb.collection('delivery_queue').update(id, { status: 'rascunho' })
}

export async function markAsPublished(id: string): Promise<void> {
  await pb
    .collection('delivery_queue')
    .update(id, { status: 'publicado', published_at: new Date().toISOString() })
}

export async function createDeliveryWithGeneration(
  theme: string,
  productId: string,
): Promise<DeliveryQueueItem> {
  const product = (await pb
    .collection('marketplace_products')
    .getOne(productId)) as unknown as MarketplaceProduct
  const productLink = getProductLink(product)

  const record = await pb.collection('delivery_queue').create({
    theme,
    product: productId,
    status: 'rascunho',
  })

  let articleContent: any = null
  let caption = ''
  let bioText = ''
  let errorNote = ''
  let status: DeliveryStatus = 'rascunho'

  try {
    const materiaResult = await generateMateria(theme)
    articleContent = materiaResult
    try {
      const captionResult = await generateCaption(materiaResult.content)
      const ctaLine = `VEJA O CATÁLOGO\n${productLink}`
      caption = `${captionResult.caption}\n\n${ctaLine}`
      bioText = `👗 VEJA O CATÁLOGO → ${productLink}`
      status = 'em_revisao'
    } catch (captionErr) {
      errorNote = `Erro ao gerar legenda: ${captionErr instanceof Error ? captionErr.message : 'erro desconhecido'}`
    }
  } catch (articleErr) {
    errorNote = `Erro ao gerar matéria: ${articleErr instanceof Error ? articleErr.message : 'erro desconhecido'}`
  }

  const updated = await pb.collection('delivery_queue').update(record.id, {
    article_content: articleContent,
    caption,
    bio_text: bioText,
    error_note: errorNote,
    status,
  })

  return updated as unknown as DeliveryQueueItem
}
