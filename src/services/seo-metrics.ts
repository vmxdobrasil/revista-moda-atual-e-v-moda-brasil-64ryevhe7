import pb from '@/lib/pocketbase/client'

export interface SeoMetric {
  id: string
  keyword: string
  position: number
  search_volume: number
  difficulty: number
  edition: string
  page: string
  url: string
  tracked_date: string
  previous_position: number
  clicks: number
  impressions: number
  ctr: number
  created: string
  updated: string
  expand?: { edition?: any; page?: any }
}

export interface SeoMetricInput {
  keyword: string
  position?: number
  search_volume?: number
  difficulty?: number
  edition?: string
  page?: string
  url?: string
  tracked_date: string
  previous_position?: number
  clicks?: number
  impressions?: number
  ctr?: number
}

const COLLECTION = 'seo_metrics'

export async function getSeoMetrics(): Promise<SeoMetric[]> {
  return (await pb.collection(COLLECTION).getFullList({
    sort: '-tracked_date',
    expand: 'edition,page',
  })) as unknown as SeoMetric[]
}

export async function getSeoMetricsByKeyword(keyword: string): Promise<SeoMetric[]> {
  return (await pb.collection(COLLECTION).getFullList({
    filter: `keyword = "${keyword}"`,
    sort: '-tracked_date',
  })) as unknown as SeoMetric[]
}

export async function createSeoMetric(data: SeoMetricInput): Promise<SeoMetric> {
  return (await pb.collection(COLLECTION).create(data)) as unknown as SeoMetric
}

export async function updateSeoMetric(
  id: string,
  data: Partial<SeoMetricInput>,
): Promise<SeoMetric> {
  return (await pb.collection(COLLECTION).update(id, data)) as unknown as SeoMetric
}

export async function deleteSeoMetric(id: string): Promise<void> {
  await pb.collection(COLLECTION).delete(id)
}
