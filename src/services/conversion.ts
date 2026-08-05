import pb from '@/lib/pocketbase/client'
import { streamAgentChat } from '@/lib/skipAi'

export interface CtaSuggestion {
  cta_variant: string
  link_origin: string
  rationale: string
  expected_conversion_rate: number
}

export interface CtaResponse {
  content_id: string
  content_type: string
  data_context: {
    best_variant: string
    best_origin: string
    orders_by_origin: Record<string, number>
  }
  suggestions: CtaSuggestion[]
}

export interface FunilSummary {
  total_impressions: number
  total_clicks: number
  total_orders: number
  avg_conversion_rate: number
  click_through_rate: number
  order_conversion_rate: number
  metric_count: number
}

export interface FunilContentItem {
  content_id: string
  content_title: string
  content_type: string
  cta_variant: string
  link_origin: string
  period: string
  impressions: number
  clicks: number
  orders: number
  conversion_rate: number
}

export interface FunilBreakdown {
  impressions: number
  clicks: number
  orders: number
  avg_conversion_rate: number
  count: number
}

export interface FunilResponse {
  summary: FunilSummary
  top_10_content: FunilContentItem[]
  breakdowns: {
    by_link_origin: Record<string, FunilBreakdown>
    by_cta_variant: Record<string, FunilBreakdown>
    by_content_type: Record<string, FunilBreakdown>
    by_period: Record<string, FunilBreakdown>
  }
  hotspots: { total: number; totalClicks: number }
  orders: {
    total: number
    byOrigin: Record<string, number>
    byStatus: Record<string, number>
  }
  filters: {
    content_type: string | null
    link_origin: string | null
    cta_variant: string | null
    period: string | null
  }
}

export interface CtaParams {
  content_id: string
  content_type: string
  theme?: string
  link?: string
}

export interface FunilParams {
  content_type?: string
  link_origin?: string
  cta_variant?: string
  period?: string
}

export async function suggestCtas(params: CtaParams): Promise<CtaResponse> {
  return pb.send('/backend/v1/cta', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getFunilReport(params?: FunilParams): Promise<FunilResponse> {
  const query: string[] = []
  if (params?.content_type) query.push(`content_type=${encodeURIComponent(params.content_type)}`)
  if (params?.link_origin) query.push(`link_origin=${encodeURIComponent(params.link_origin)}`)
  if (params?.cta_variant) query.push(`cta_variant=${encodeURIComponent(params.cta_variant)}`)
  if (params?.period) query.push(`period=${encodeURIComponent(params.period)}`)
  const qs = query.length > 0 ? `?${query.join('&')}` : ''
  return pb.send(`/backend/v1/funil${qs}`, { method: 'GET' })
}

export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created: string
}

export interface StreamConversionResult {
  conversationId: string
  messageId: string
  content: string
}

export async function streamConversionChat(
  message: string,
  conversationId: string | null,
  onChunk: (delta: string, full: string) => void,
): Promise<StreamConversionResult> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/conversion-agent-stream`,
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
