import pb from '@/lib/pocketbase/client'
import { streamAgentChat } from '@/lib/skipAi'

export interface CompetitorItem {
  id: string
  name: string
  description: string
  category_name: string
  platform: string
  social_handle: string
  website: string
  followers: number
  engagement_rate: number
  post_frequency: number
  content_themes: string[]
  last_checked_at: string
  notes: string
}

export interface ConcorrentesReport {
  competitors: CompetitorItem[]
  ranking: Array<{ name: string; engagement_rate: number; followers: number }>
  summary: {
    total: number
    avg_followers: number
    avg_engagement_rate: number
    avg_post_frequency: number
  }
}

export interface MarketSignalItem {
  id: string
  signal_type: string
  title: string
  description: string
  competitor_id: string
  competitor_name: string
  severity: string
  source: string
  detected_at: string
  status: string
  related_data: Record<string, unknown> | null
}

export interface AlertasReport {
  signals: MarketSignalItem[]
  summary: {
    total: number
    by_type: Record<string, number>
    by_severity: Record<string, number>
    by_status: Record<string, number>
  }
}

export interface AlertaParams {
  signal_type?: string
  severity?: string
  status?: string
  competitor?: string
  date_from?: string
  date_to?: string
  limit?: number
}

export interface MarketBenchmarksData {
  magazine: { engagement_rate: number; post_frequency: number; total_posts: number }
  competitors_avg: { engagement_rate: number; post_frequency: number; total_competitors: number }
  ranking: Array<{
    name: string
    platform: string
    engagement_rate: number
    post_frequency: number
    followers: number
  }>
}

export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created: string
}

export interface StreamMarketWatchResult {
  conversationId: string
  messageId: string
  content: string
}

export async function getConcorrentesReport(): Promise<ConcorrentesReport> {
  return pb.send('/backend/v1/concorrentes', { method: 'GET' })
}

export async function getAlertas(params?: AlertaParams): Promise<AlertasReport> {
  const query: string[] = []
  if (params?.signal_type) query.push(`signal_type=${encodeURIComponent(params.signal_type)}`)
  if (params?.severity) query.push(`severity=${encodeURIComponent(params.severity)}`)
  if (params?.status) query.push(`status=${encodeURIComponent(params.status)}`)
  if (params?.competitor) query.push(`competitor=${encodeURIComponent(params.competitor)}`)
  if (params?.date_from) query.push(`date_from=${encodeURIComponent(params.date_from)}`)
  if (params?.date_to) query.push(`date_to=${encodeURIComponent(params.date_to)}`)
  if (params?.limit) query.push(`limit=${params.limit}`)
  const qs = query.length > 0 ? `?${query.join('&')}` : ''
  return pb.send(`/backend/v1/alertas${qs}`, { method: 'GET' })
}

export async function getMarketBenchmarks(): Promise<MarketBenchmarksData> {
  return pb.send('/backend/v1/market-benchmarks', { method: 'GET' })
}

export async function streamMarketWatchChat(
  message: string,
  conversationId: string | null,
  onChunk: (delta: string, full: string) => void,
): Promise<StreamMarketWatchResult> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/market-watch-agent-stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify({ message, conversation_id: conversationId }),
    },
  )

  const result = await streamAgentChat(res, {
    onChunk: (delta: string, full: string) => onChunk(delta, full),
  })

  return {
    conversationId: res.headers.get('X-Conversation-Id') ?? result.conversation_id,
    messageId: result.message_id,
    content: result.content,
  }
}
