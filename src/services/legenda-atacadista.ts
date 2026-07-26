import pb from '@/lib/pocketbase/client'

export interface LegendaAtacadistaResult {
  caption: string
  hashtags: string[]
  recordId: string
}

export async function generateLegendaAtacadista(
  marca: string,
  produto: string,
): Promise<LegendaAtacadistaResult> {
  const res = await pb.send('/backend/v1/generate-legenda-atacadista', {
    method: 'POST',
    body: JSON.stringify({ marca, produto }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    caption: res.caption,
    hashtags: res.hashtags,
    recordId: res.recordId,
  }
}
