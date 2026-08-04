import pb from '@/lib/pocketbase/client'

export interface Subscriber {
  id: string
  name: string
  email: string
  segment: 'varejo' | 'atacado' | 'consumidora'
  interests: string[]
  preferences: Record<string, unknown>
  source: string
  engagement_score: number
  status: 'ativo' | 'descadastrado' | 'inativo'
  opened_count: number
  clicked_count: number
  last_opened_at: string
  last_clicked_at: string
  unsubscribed_at: string
  created: string
  updated: string
}

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  preheader: string
  content: Record<string, unknown>
  edition?: string
  segments: string[]
  audience_size: number
  scheduled_at: string
  send_date: string
  status: string
  opened_count: number
  open_rate: number
  click_count: number
  click_rate: number
  unsubscribe_count: number
  created: string
  updated: string
}

export interface NewsletterSequence {
  id: string
  name: string
  description: string
  segment: string
  trigger: string
  steps: Array<{ day: number; subject: string; content_summary: string }>
  status: string
  created: string
  updated: string
}

export interface GenerateNewsletterParams {
  edition_id?: string
  segments?: string[]
}

export interface GenerateNewsletterResult {
  success: boolean
  campaign_id?: string
  subject: string
  preheader: string
  content: Record<string, unknown>
  audience_size: number
  segments: string[]
}

export const getSubscribers = () =>
  pb.collection('subscribers').getFullList<Subscriber>({ sort: '-created' })

export const createSubscriber = (data: Partial<Subscriber>) =>
  pb.collection('subscribers').create<Subscriber>(data)

export const updateSubscriber = (id: string, data: Partial<Subscriber>) =>
  pb.collection('subscribers').update<Subscriber>(id, data)

export const deleteSubscriber = (id: string) => pb.collection('subscribers').delete(id)

export const getCampaigns = () =>
  pb.collection('newsletter_campaigns').getFullList<NewsletterCampaign>({ sort: '-created' })

export const getCampaign = (id: string) =>
  pb.collection('newsletter_campaigns').getOne<NewsletterCampaign>(id)

export const updateCampaign = (id: string, data: Partial<NewsletterCampaign>) =>
  pb.collection('newsletter_campaigns').update<NewsletterCampaign>(id, data)

export const deleteCampaign = (id: string) => pb.collection('newsletter_campaigns').delete(id)

export const getSequences = () =>
  pb.collection('newsletter_sequences').getFullList<NewsletterSequence>({ sort: '-created' })

export const createSequence = (data: Partial<NewsletterSequence>) =>
  pb.collection('newsletter_sequences').create<NewsletterSequence>(data)

export const updateSequence = (id: string, data: Partial<NewsletterSequence>) =>
  pb.collection('newsletter_sequences').update<NewsletterSequence>(id, data)

export const deleteSequence = (id: string) => pb.collection('newsletter_sequences').delete(id)

export const generateNewsletter = (params: GenerateNewsletterParams) =>
  pb.send('/backend/v1/newsletter', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  }) as Promise<GenerateNewsletterResult>
