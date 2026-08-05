import pb from '@/lib/pocketbase/client'
import { streamAgentChat, displayableMessages, type DisplayMessage } from '@/lib/skipAi'

export interface FunnelKPIs {
  impressions: number
  clicks: number
  orders: number
  conversion_rate: number
}

export interface ContentRanking {
  content_id: string
  content_title: string
  content_type: string
  impressions: number
  clicks: number
  orders: number
  conversion_rate: number
  cta_variant: string
  link_origin: string
}

export interface BreakdownItem {
  impressions: number
  clicks: number
  orders: number
  conversion_rate: number
}

export interface OriginBreakdown extends BreakdownItem {
  link_origin: string
}

export interface VariantBreakdown extends BreakdownItem {
  cta_variant: string
}

export interface FunnelReport {
  kpis: FunnelKPIs
  top_contents: ContentRanking[]
  by_link_origin: OriginBreakdown[]
  by_cta_variant: VariantBreakdown[]
}

export interface FunnelFilters {
  period?: string
  content_type?: string
  link_origin?: string
  cta_variant?: string
}

export interface CTARequest {
  content_id: string
  content_type: string
  current_cta?: string
  target_audience?: string
  objective?: string
}

export interface CTASuggestion {
  cta_variant: string
  link_origin: string
  cta_text: string
  reasoning: string
  whatsapp_link?: string | null
}

export const getFunnelReport = (filters: FunnelFilters = {}): Promise<FunnelReport> => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value)
  })
  const qs = params.toString()
  return pb.send(`/backend/v1/funil${qs ? '?' + qs : ''}`, { method: 'GET' })
}

export const generateCTA = (params: CTARequest): Promise<{ suggestion: CTASuggestion }> =>
  pb.send('/backend/v1/cta', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  })

export async function streamConversionChat(
  message: string,
  conversationId: string | null,
  onChunk: (delta: string, full: string) => void,
  signal?: AbortSignal,
): Promise<{ conversationId: string; content: string }> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/conversion/chat-stream`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
      body: JSON.stringify({ message, conversation_id: conversationId }),
      signal,
    },
  )
  const result = await streamAgentChat(res, { onChunk, signal })
  return {
    conversationId: res.headers.get('X-Conversation-Id') ?? result.conversation_id,
    content: result.content,
  }
}

export async function loadConversionHistory(conversationId: string): Promise<DisplayMessage[]> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/conversion/chats/${conversationId}/messages`,
    { headers: { Authorization: pb.authStore.token } },
  )
  const payload = await res.json()
  if (!res.ok) throw new Error(payload?.error || 'failed to load history')
  return displayableMessages(payload.messages || [])
}

export { displayableMessages, type DisplayMessage }
