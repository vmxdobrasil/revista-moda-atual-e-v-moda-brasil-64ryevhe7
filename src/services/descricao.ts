import pb from '@/lib/pocketbase/client'

export interface DescricaoResult {
  description: string
}

export async function generateDescricao(tema: string): Promise<DescricaoResult> {
  return pb.send('/backend/v1/generate-descricao', {
    method: 'POST',
    body: JSON.stringify({ tema }),
    headers: { 'Content-Type': 'application/json' },
  })
}
