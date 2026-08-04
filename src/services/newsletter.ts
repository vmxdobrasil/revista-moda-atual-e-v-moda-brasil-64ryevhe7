import pb from '@/lib/pocketbase/client'

export interface NewsletterContentSection {
  title: string
  summary: string
  link: string
}

export interface NewsletterContent {
  opening: string
  sections: NewsletterContentSection[]
  cta: string
}

export interface NewsletterCampaign {
  id: string
  title: string
  subject: string
  preheader: string
  content: NewsletterContent
  segments: string[]
  status: string
  edition?: string
  audience_size: number
  created: string
  opened_count?: number
  click_count?: number
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

export const generateNewsletter = async (
  params: GenerateNewsletterParams = {},
): Promise<NewsletterCampaign> => {
  return pb.send('/backend/v1/newsletter', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
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
