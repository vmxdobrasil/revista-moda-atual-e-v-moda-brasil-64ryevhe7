import pb from '@/lib/pocketbase/client'

export async function streamFashionAdvisorChat(
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
): Promise<Response> {
  return await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agents/fashion-trend-advisor/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pb.authStore.token,
      },
      body: JSON.stringify({ message, conversation_id: conversationId }),
      signal,
    },
  )
}
