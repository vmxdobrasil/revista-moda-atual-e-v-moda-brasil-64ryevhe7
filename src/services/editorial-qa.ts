import pb from '@/lib/pocketbase/client'

export type QaClassification = 'aprovado' | 'revisar' | 'reprovado'

export interface QaParecer {
  classification: QaClassification
  justification: string
  suggestions: string[]
  score: number
}

export interface ToneAdjustment {
  adjusted_content: string
  changes: string[]
}

export async function reviewContent(
  content: string,
  contentType: 'article' | 'caption' | 'script' = 'article',
): Promise<QaParecer> {
  return await pb.send('/backend/v1/qa', {
    method: 'POST',
    body: JSON.stringify({ content, content_type: contentType }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function adjustTone(content: string): Promise<ToneAdjustment> {
  return await pb.send('/backend/v1/tono', {
    method: 'POST',
    body: JSON.stringify({ content }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function streamEditorialQaChat(
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
): Promise<Response> {
  return await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agents/editorial-qa/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: pb.authStore.token,
    },
    body: JSON.stringify({ message, conversation_id: conversationId }),
    signal,
  })
}

export async function getEditorialQaConversations(limit = 20): Promise<unknown[]> {
  return await pb.send('/backend/v1/agents/editorial-qa/conversations', { method: 'GET' })
}
