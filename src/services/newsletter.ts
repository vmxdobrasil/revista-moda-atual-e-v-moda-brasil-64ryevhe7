import pb from '@/lib/pocketbase/client'
import { getEdition, getEditionPages, getHotspots, getFileUrl } from '@/services/magazine'
import {
  buildNewsletterHtml,
  type EditionPreviewData,
  type ProductCallout,
} from '@/lib/newsletter-template'

export interface NewsletterProductCallout {
  name: string
  price: string | number
  link: string
  vendor?: string
}

export interface NewsletterContentSection {
  title: string
  summary: string
  link: string
  products?: NewsletterProductCallout[]
}

export interface NewsletterContent {
  header?: { title: string; description: string }
  intro?: string
  opening?: string
  sections: NewsletterContentSection[]
  cta: string
}

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  preheader: string
  content?: NewsletterContent
  segments: string[]
  status: string
  edition?: string
  audience_size: number
  created: string
  updated?: string
  scheduled_at?: string
  send_date?: string
  opened_count?: number
  open_rate?: number
  click_count?: number
  click_rate?: number
  unsubscribe_count?: number
}

export interface Subscriber {
  id: string
  name: string
  email: string
  segment: string
  engagement_score: number
  status: string
  interests?: string[]
  preferences?: Record<string, unknown>
  source?: string
  opened_count?: number
  clicked_count?: number
  last_opened_at?: string
  last_clicked_at?: string
  unsubscribed_at?: string
  created: string
  updated: string
}

export interface NewsletterSequenceStep {
  day: number
  subject: string
  content_summary: string
}

export interface NewsletterSequence {
  id: string
  name: string
  description: string
  segment: string
  trigger: string
  steps: NewsletterSequenceStep[]
  status: string
  created: string
  updated: string
}

export interface GenerateNewsletterParams {
  week_start?: string
  edition_id?: string
  segments?: string[]
}

export interface EditionOption {
  id: string
  title: string
  description?: string
  slug?: string
}

export const generateNewsletter = async (
  params: GenerateNewsletterParams = {},
): Promise<NewsletterCampaign> => {
  return pb.send('/backend/v1/newsletter', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getEditionsForSelect = async (): Promise<EditionOption[]> => {
  return pb.collection('editions').getFullList({ sort: '-created' })
}

export const getNewsletterCampaigns = async (filter: string = '', sort: string = '-created') => {
  return pb.collection('newsletter_campaigns').getFullList({ filter, sort })
}

export const getNewsletterCampaign = async (id: string) => {
  return pb.collection('newsletter_campaigns').getOne(id)
}

export const updateNewsletterCampaign = async (id: string, data: Record<string, unknown>) => {
  return pb.collection('newsletter_campaigns').update(id, data)
}

export const deleteNewsletterCampaign = async (id: string) => {
  return pb.collection('newsletter_campaigns').delete(id)
}

export const getSubscribers = async (filter: string = '', sort: string = '-created') => {
  return pb.collection('subscribers').getFullList({ filter, sort })
}

export const getCampaigns = async (filter: string = '', sort: string = '-created') => {
  return pb.collection('newsletter_campaigns').getFullList({ filter, sort })
}

export const getSequences = async (filter: string = '', sort: string = '-created') => {
  return pb.collection('newsletter_sequences').getFullList({ filter, sort })
}

export const deleteCampaign = async (id: string) => {
  return pb.collection('newsletter_campaigns').delete(id)
}

export const deleteSubscriber = async (id: string) => {
  return pb.collection('subscribers').delete(id)
}

export const deleteSequence = async (id: string) => {
  return pb.collection('newsletter_sequences').delete(id)
}

export const createCampaign = async (
  data: Record<string, unknown>,
): Promise<NewsletterCampaign> => {
  return pb.collection('newsletter_campaigns').create(data)
}

export const createSequence = async (
  data: Record<string, unknown>,
): Promise<NewsletterSequence> => {
  return pb.collection('newsletter_sequences').create(data)
}

export const updateSequence = async (
  id: string,
  data: Record<string, unknown>,
): Promise<NewsletterSequence> => {
  return pb.collection('newsletter_sequences').update(id, data)
}

export const updateCampaign = updateNewsletterCampaign

export const duplicateCampaign = async (id: string): Promise<NewsletterCampaign> => {
  const original = await pb.collection('newsletter_campaigns').getOne(id)
  const data: Record<string, unknown> = {
    title: (original.title || 'Cópia') + ' (cópia)',
    subject: original.subject || '',
    preheader: original.preheader || '',
    content: original.content || {},
    segments: original.segments || [],
    status: 'rascunho',
    audience_size: 0,
    opened_count: 0,
    open_rate: 0,
    click_count: 0,
    click_rate: 0,
    unsubscribe_count: 0,
  }
  if (original.edition) data.edition = original.edition
  return pb.collection('newsletter_campaigns').create(data)
}

export async function getCampaignPreviewData(
  campaign: NewsletterCampaign,
): Promise<{ edition: EditionPreviewData | null; products: ProductCallout[] }> {
  if (!campaign.edition) return { edition: null, products: [] }
  try {
    const edition = await getEdition(campaign.edition)
    const pages = await getEditionPages(campaign.edition)
    const hotspots = await getHotspots(campaign.edition, pages)
    const cover =
      edition.cover_url ||
      (edition.cover_file ? getFileUrl(edition, edition.cover_file) : '') ||
      (edition.cover_image ? getFileUrl(edition, edition.cover_image) : '')
    const products: ProductCallout[] = hotspots
      .filter((h) => h.expand?.product)
      .map((h) => ({
        name: h.expand!.product!.name,
        price: h.expand!.product!.price,
        link: h.link || h.expand!.product!.link || '',
        vendor: h.expand!.product!.vendor,
      }))
    return {
      edition: { title: edition.title, description: edition.description, cover_url: cover },
      products,
    }
  } catch {
    return { edition: null, products: [] }
  }
}

export async function exportCampaignHtml(campaign: NewsletterCampaign): Promise<string> {
  const { edition, products } = await getCampaignPreviewData(campaign)
  return buildNewsletterHtml(campaign, edition, products)
}

export const exportCampaignCsv = (campaign: NewsletterCampaign): string => {
  const rows: string[] = ['field,value']
  rows.push(`title,"${(campaign.title || '').replace(/"/g, '""')}"`)
  rows.push(`subject,"${(campaign.subject || '').replace(/"/g, '""')}"`)
  rows.push(`preheader,"${(campaign.preheader || '').replace(/"/g, '""')}"`)
  rows.push(`status,"${campaign.status || ''}"`)
  rows.push(`segments,"${(campaign.segments || []).join('; ')}"`)
  rows.push(`audience_size,${campaign.audience_size || 0}`)
  rows.push(`opened_count,${campaign.opened_count || 0}`)
  rows.push(`open_rate,${campaign.open_rate || 0}`)
  rows.push(`click_count,${campaign.click_count || 0}`)
  rows.push(`click_rate,${campaign.click_rate || 0}`)
  rows.push(`unsubscribe_count,${campaign.unsubscribe_count || 0}`)
  const c = campaign.content
  if (c?.intro) rows.push(`intro,"${c.intro.replace(/"/g, '""')}"`)
  ;(c?.sections || []).forEach((s, i) => {
    rows.push(`section_${i + 1}_title,"${s.title.replace(/"/g, '""')}"`)
    rows.push(`section_${i + 1}_summary,"${s.summary.replace(/"/g, '""')}"`)
  })
  if (c?.cta) rows.push(`cta,"${c.cta.replace(/"/g, '""')}"`)
  return rows.join('\n')
}
