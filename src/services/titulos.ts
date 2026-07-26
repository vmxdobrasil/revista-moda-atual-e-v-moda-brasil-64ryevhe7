import pb from '@/lib/pocketbase/client'

export interface TitulosResult {
  titulos: string[]
}

export async function generateTitulos(tema: string): Promise<TitulosResult> {
  return pb.send('/backend/v1/generate-titulos', {
    method: 'POST',
    body: JSON.stringify({ tema }),
    headers: { 'Content-Type': 'application/json' },
  })
}
