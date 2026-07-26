import pb from '@/lib/pocketbase/client'

export interface MetaPromptBlock {
  title: string
  content: string
}

export interface MetaPromptResult {
  blocks: MetaPromptBlock[]
  content: string
  publico: string
  publicoName: string
  recordId: string
}

export async function generateMetaPrompt(
  objetivo: string,
  tipo: string,
  canal: string,
  publico: string,
): Promise<MetaPromptResult> {
  const res = await pb.send('/backend/v1/generate-meta-prompt', {
    method: 'POST',
    body: JSON.stringify({ objetivo, tipo, canal, publico }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    blocks: res.blocks || [],
    content: res.content || '',
    publico: res.publico || publico,
    publicoName: res.publicoName || '',
    recordId: res.recordId || '',
  }
}
