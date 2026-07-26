import pb from '@/lib/pocketbase/client'

export interface ReelResult {
  options: string[]
}

export async function generateReel(subject: string): Promise<ReelResult> {
  return pb.send('/backend/v1/generate-reel', {
    method: 'POST',
    body: JSON.stringify({ subject }),
    headers: { 'Content-Type': 'application/json' },
  })
}
