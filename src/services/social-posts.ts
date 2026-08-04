import pb from '@/lib/pocketbase/client'

export interface SocialPost {
  id: string
  hook: string
  description: string
  format: 'Reel' | 'Carousel' | 'Photo'
  post_date: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  remixes: number
  new_followers: number
  is_top_performer: boolean
  engagement_rate: number
  edition?: string
  scheduled_at?: string
  published_at?: string
  platform?: string
  status?: string
  created: string
  updated: string
}

export interface SocialPostInput {
  hook: string
  description?: string
  format: string
  post_date: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  remixes?: number
  new_followers?: number
  edition?: string
  scheduled_at?: string
  published_at?: string
  platform?: string
  status?: string
}

export interface PautaSuggestion {
  topic: string
  rationale: string
  suggestedFormat: string
  suggestedHook: string
  estimatedEngagement: number
}

export interface Underperformer {
  hook: string
  engagement: number
  format: string
}

export interface RecommendationResponse {
  recommendations: string[]
  patterns: {
    hooks: Array<{ type: string; count: number }>
    formats: Array<{ format: string; avgEngagement: number; avgViews: number; count: number }>
    themes: Array<{ word: string; count: number }>
  }
  pauta_suggestions?: PautaSuggestion[]
  underperformers?: Underperformer[]
}

const COLLECTION = 'social_posts'

export async function getSocialPosts(
  page = 1,
  perPage = 10,
  sort = '-post_date',
): Promise<{ items: SocialPost[]; totalItems: number; totalPages: number; page: number }> {
  const result = await pb.collection(COLLECTION).getList<SocialPost>(page, perPage, { sort })
  return {
    items: result.items as unknown as SocialPost[],
    totalItems: result.totalItems,
    totalPages: result.totalPages,
    page: result.page,
  }
}

export async function getAllSocialPosts(sort = '-post_date'): Promise<SocialPost[]> {
  const result = await pb.collection(COLLECTION).getFullList<SocialPost>({ sort })
  return result as unknown as SocialPost[]
}

export async function createSocialPost(data: SocialPostInput): Promise<SocialPost> {
  const payload = { ...data, status: data.status || 'pending' }
  return (await pb.collection(COLLECTION).create(payload)) as unknown as SocialPost
}

export async function updateSocialPost(
  id: string,
  data: Partial<SocialPostInput>,
): Promise<SocialPost> {
  return (await pb.collection(COLLECTION).update(id, data)) as unknown as SocialPost
}

export async function deleteSocialPost(id: string): Promise<void> {
  await pb.collection(COLLECTION).delete(id)
}

export async function getRecommendations(): Promise<RecommendationResponse> {
  return await pb.send('/backend/v1/social-analytics/recommendations', { method: 'GET' })
}

export function exportToCSV(posts: SocialPost[]): string {
  const headers = [
    'Hook',
    'Description',
    'Format',
    'Post Date',
    'Views',
    'Likes',
    'Comments',
    'Shares',
    'Saves',
    'Remixes',
    'New Followers',
    'Engagement Rate',
    'Top Performer',
    'Platform',
    'Status',
    'Scheduled At',
    'Published At',
  ]
  const rows = posts.map((p) => [
    `"${p.hook.replace(/"/g, '""')}"`,
    `"${(p.description || '').replace(/"/g, '""')}"`,
    p.format,
    p.post_date,
    p.views,
    p.likes,
    p.comments,
    p.shares,
    p.saves,
    p.remixes || 0,
    p.new_followers || 0,
    ((p.engagement_rate || 0) * 100).toFixed(2) + '%',
    p.is_top_performer ? 'Yes' : 'No',
    p.platform || '',
    p.status || '',
    p.scheduled_at || '',
    p.published_at || '',
  ])
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
}

export function downloadCSV(posts: SocialPost[]): void {
  const csv = exportToCSV(posts)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `social-analytics-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
