import pb from '@/lib/pocketbase/client'
import type { CoverData } from '@/services/cover-versions'

export type StockImageSource = 'unsplash' | 'pexels' | 'freepik'

export interface StockImage {
  url: string
  source: string
  sourceLabel: string
  width: number
  height: number
  alt: string
}

export interface StockImageResponse {
  images: StockImage[]
  source: string
  query: string
}

export const STOCK_SOURCES: { value: StockImageSource; label: string }[] = [
  { value: 'unsplash', label: 'Unsplash' },
  { value: 'pexels', label: 'Pexels' },
  { value: 'freepik', label: 'Freepik' },
]

export async function fetchStockImages(
  query: string,
  source: StockImageSource,
): Promise<StockImageResponse> {
  return await pb.send(
    `/backend/v1/cover/stock-images?query=${encodeURIComponent(query)}&source=${source}`,
    { method: 'GET' },
  )
}

export async function logExport(
  editionId: string,
  format: 'png' | 'pdf',
  status: 'success' | 'error',
  errorMessage?: string,
): Promise<void> {
  try {
    await pb.send('/backend/v1/cover/export-log', {
      method: 'POST',
      body: JSON.stringify({
        edition_id: editionId,
        format,
        status,
        error_message: errorMessage || '',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    /* intentionally ignored */
  }
}

export async function submitForReview(deliveryId: string): Promise<void> {
  await pb.send('/backend/v1/cover/approval', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, action: 'submit_review' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function approveCover(deliveryId: string): Promise<void> {
  await pb.send('/backend/v1/cover/approval', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, action: 'approve' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function rejectCover(deliveryId: string): Promise<void> {
  await pb.send('/backend/v1/cover/approval', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, action: 'reject' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function publishCover(deliveryId: string): Promise<void> {
  await pb.send('/backend/v1/cover/approval', {
    method: 'POST',
    body: JSON.stringify({ delivery_id: deliveryId, action: 'publish' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface CoverDeliveryItem {
  id: string
  theme: string
  article_content: any
  status: string
  created: string
  updated: string
}

export async function createCoverDelivery(
  editionId: string,
  coverData: CoverData,
): Promise<CoverDeliveryItem> {
  const record = await pb.collection('delivery_queue').create({
    theme: coverData.theme,
    article_content: {
      type: 'cover',
      edition_id: editionId,
      cover_url: coverData.imageUrl,
      cover_alt_text: coverData.altText,
      cover_variants: coverData,
    },
    status: 'rascunho',
  })
  return record as unknown as CoverDeliveryItem
}

export async function getCoverDeliveryByEdition(
  editionId: string,
): Promise<CoverDeliveryItem | null> {
  try {
    const records = await pb.collection('delivery_queue').getList(1, 1, {
      filter: `article_content ~ "${editionId}"`,
      sort: '-created',
    })
    if (records.items.length === 0) return null
    return records.items[0] as unknown as CoverDeliveryItem
  } catch {
    return null
  }
}

export type SocialChannel = 'Reels' | 'YouTube' | 'Instagram'

export const CHANNEL_FORMAT_MAP: Record<SocialChannel, string> = {
  Reels: 'Reel',
  YouTube: 'Carousel',
  Instagram: 'Photo',
}

export async function scheduleABVariant(
  editionId: string,
  coverData: CoverData,
  channel: SocialChannel,
  postDate: string,
): Promise<void> {
  await pb.collection('social_posts').create({
    hook: coverData.title,
    description: coverData.subtitle,
    format: CHANNEL_FORMAT_MAP[channel],
    post_date: postDate,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    edition: editionId,
  })
}

export async function getScheduledVariants(editionId: string): Promise<any[]> {
  const records = await pb.collection('social_posts').getFullList({
    filter: `edition = "${editionId}"`,
    sort: '-post_date',
  })
  return records
}
