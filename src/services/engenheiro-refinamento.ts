import pb from '@/lib/pocketbase/client'

export interface EngenheiroRefinamentoResult {
  resultado: string
}

export async function generateEngenheiroRefinamento(
  promptOriginal: string,
): Promise<EngenheiroRefinamentoResult> {
  const res = await pb.send('/backend/v1/generate-engenheiro-refinamento', {
    method: 'POST',
    body: JSON.stringify({ promptOriginal }),
    headers: { 'Content-Type': 'application/json' },
  })
  return { resultado: res.resultado || '' }
}
