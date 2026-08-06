import pb from '@/lib/pocketbase/client'
import { streamAgentChat } from '@/lib/skipAi'

export interface EngagementLog {
  id: string
  ig_user_id: string
  ig_username: string
  type: 'comment' | 'dm'
  intent: string
  message_text: string
  response_text: string
  status: string
  media_id: string
  comment_id: string
  conversation_id: string
  forwarded_to: string
  created: string
  updated: string
}

export interface DmLead {
  id: string
  ig_user_id: string
  ig_username: string
  name: string
  email: string
  whatsapp: string
  city: string
  intent: string
  status: string
  notes: string
  conversation_id: string
  created: string
  updated: string
}

export interface IgConversation {
  id: string
  ig_user_id: string
  ig_username: string
  conversation_id: string
  message_count: number
  last_message_at: string
  context: string
  created: string
  updated: string
}

export interface SocialEngagementMetrics {
  summary: {
    total_interactions: number
    total_comments: number
    total_dms: number
    responded: number
    pending: number
    forwarded_human: number
    ignored: number
    response_rate: number
  }
  leads: {
    total: number
    novo: number
    contatado: number
    convertido: number
    conversion_rate: number
    by_intent: Record<string, number>
  }
  conversations: { total: number }
  by_intent: Record<string, number>
  by_type: Record<string, number>
}

export interface ClassifyResponse {
  intent: string
  needs_human_escalation: boolean
  message: string
}

export interface RespondCommentResponse {
  intent: string
  response: string | null
  status: string
  forwarded_to: string | null
  api_response: unknown
  log_id: string
  message?: string
}

export interface RespondDmResponse {
  intent: string
  response: string
  status: string
  conversation_id: string
  message_id: string
  forwarded_to: string | null
  api_response: unknown
  log_id: string
  message?: string
}

export interface DisplayMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created: string
}

export interface StreamSocialEngagementResult {
  conversationId: string
  messageId: string
  content: string
}

export async function getEngagementLogs(filters?: {
  type?: string
  intent?: string
  status?: string
}): Promise<EngagementLog[]> {
  const parts: string[] = []
  if (filters?.type) parts.push(`type = "${filters.type}"`)
  if (filters?.intent) parts.push(`intent = "${filters.intent}"`)
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  const filter = parts.join(' && ')
  return (await pb.collection('engagement_log').getFullList({
    sort: '-created',
    filter: filter || '',
  })) as unknown as EngagementLog[]
}

export async function getDmLeads(): Promise<DmLead[]> {
  return (await pb.collection('dm_leads').getFullList({ sort: '-created' })) as unknown as DmLead[]
}

export async function getIgConversations(): Promise<IgConversation[]> {
  return (await pb.collection('ig_conversations').getFullList({
    sort: '-last_message_at',
  })) as unknown as IgConversation[]
}

export async function getMetrics(): Promise<SocialEngagementMetrics> {
  return pb.send('/backend/v1/social-engagement/metrics', { method: 'GET' })
}

export async function classifyInteraction(message: string): Promise<ClassifyResponse> {
  return pb.send('/backend/v1/classificar-interacao', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function respondComment(data: {
  comment_text: string
  comment_id?: string
  media_id?: string
  ig_user_id?: string
  ig_username?: string
  post_context?: string
}): Promise<RespondCommentResponse> {
  return pb.send('/backend/v1/responder-comentario', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function respondDm(data: {
  message: string
  ig_user_id?: string
  ig_username?: string
  conversation_id?: string
}): Promise<RespondDmResponse> {
  return pb.send('/backend/v1/responder-dm', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function captureLead(data: {
  ig_user_id?: string
  ig_username?: string
  name?: string
  email?: string
  whatsapp?: string
  city?: string
  intent?: string
  notes?: string
  conversation_id?: string
}): Promise<{ success: boolean; lead_id: string; updated: boolean }> {
  return pb.send('/backend/v1/capturar-lead', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  await pb.collection('dm_leads').update(id, { status })
}

export async function streamSocialEngagementChat(
  message: string,
  conversationId: string | null,
  onChunk: (delta: string, full: string) => void,
): Promise<StreamSocialEngagementResult> {
  const res = await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/social-engagement-agent-stream`,
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
