import pb from '@/lib/pocketbase/client'

export interface SegmentarParams {
  segment?: string
  interests?: string[]
  min_engagement_score?: number
  status?: string
  opened_in_last_days?: number
  clicked_in_last_days?: number
  campaign_id?: string
}

export interface SegmentarResult {
  total: number
  by_segment: Record<string, number>
  by_status: Record<string, number>
  by_interest: Record<string, number>
  avg_engagement_score: number
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
