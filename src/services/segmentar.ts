import pb from '@/lib/pocketbase/client'

export interface SegmentarParams {
  segment?: string
  interests?: string[]
  min_engagement_score?: number
  status?: string
  opened_in_last_days?: number
  clicked_in_last_days?: number
  campaign_id?: string
  engagement_period_days?: number
  behavior_days?: number
  min_engagement_rate?: number
  min_engagement?: number
}

export interface RecommendedEdition {
  id: string
  title: string
  slug: string
  avg_engagement_rate: number
  avg_views: number
  match_score: number
}

export interface EngagementBreakdown {
  alta: number
  media: number
  baixa: number
}

export interface SegmentarResult {
  total: number
  by_segment: Record<string, number>
  by_status: Record<string, number>
  by_interest: Record<string, number>
  engagement_breakdown: EngagementBreakdown
  avg_engagement_score: number
  avg_social_engagement_rate: number
  updated_engagement_scores: number
  recommended_editions: RecommendedEdition[]
  ids: string[]
}

export const segmentSubscribers = async (
  params: SegmentarParams = {},
): Promise<SegmentarResult> => {
  return pb.send('/backend/v1/segmentar', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}
