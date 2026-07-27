import pb from '@/lib/pocketbase/client'

export interface MultiFormatFinalContent {
  trend_analysis?: { raw?: string }
  article_content?: { raw?: string; titulo_principal?: string; corpo?: string }
  instagram_caption?: string
  reel_script?: { raw?: string }
  seo_title?: string[]
  youtube_description?: string
}

export interface MultiFormatResult {
  id: string
  theme: string
  status: string
  error_note: string
  agent_outputs: Record<string, unknown>
  final_content: MultiFormatFinalContent
  created: string
  updated: string
}

export async function runMultiFormatGenerator(
  theme: string,
  productId?: string,
): Promise<{
  success: boolean
  id: string
  final_content?: MultiFormatFinalContent
  error?: string
}> {
  return pb.send('/backend/v1/multi-format-generator/run', {
    method: 'POST',
    body: JSON.stringify({ theme, product_id: productId || '' }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getMultiFormatResults(): Promise<MultiFormatResult[]> {
  const results = await pb.collection('workflow_results').getFullList({ sort: '-created' })
  return (results as unknown as MultiFormatResult[]).filter((r) => r.status && r.status !== '')
}

export async function getMultiFormatResult(id: string): Promise<MultiFormatResult> {
  return pb.collection('workflow_results').getOne(id) as unknown as MultiFormatResult
}
