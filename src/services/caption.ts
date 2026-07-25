import pb from '@/lib/pocketbase/client'

export interface CaptionResult {
  caption: string
}

export async function generateCaption(theme: string): Promise<CaptionResult> {
  return pb.send('/backend/v1/generate-caption', {
    method: 'POST',
    body: JSON.stringify({ theme }),
    headers: { 'Content-Type': 'application/json' },
  })
}
