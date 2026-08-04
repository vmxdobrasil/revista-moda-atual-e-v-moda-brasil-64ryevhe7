import pb from '@/lib/pocketbase/client'

export async function streamCoverArtChat(
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
): Promise<Response> {
  return await fetch(
    `${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/agents/cover-editorial-art-director/chat`,
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

export interface CoverVariant {
  name: string
  description: string
  palette: string[]
  template?: string
}

export interface CoverComposition {
  palette: { name: string; colors: string[] }
  typography: { title: string; body: string; accent: string }
  hierarchy: string
  alt_text: string
  variants: CoverVariant[]
  stock_image_query: string
  layout: string
}

export async function generateCover(theme: string, editionId?: string): Promise<CoverComposition> {
  const body: Record<string, unknown> = { theme }
  if (editionId) body.editionId = editionId
  return await pb.send('/backend/v1/capa', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function generateThumbnail(
  theme: string,
  format: 'Reels' | 'YouTube',
): Promise<CoverComposition> {
  return await pb.send('/backend/v1/thumbnail', {
    method: 'POST',
    body: JSON.stringify({ theme, format }),
    headers: { 'Content-Type': 'application/json' },
  })
}
