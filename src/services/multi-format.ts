import pb from '@/lib/pocketbase/client'

export interface MultiFormatFinalContent {
  trend_analysis?: any
  article_content?: any
  instagram_caption?: string
  reel_script?: any
  seo_title?: string[]
  youtube_description?: string
  youtube_content?: {
    title?: string
    script?: string
    description?: string
    tags?: string[]
    raw?: string
  }
  newsletter_content?: {
    subject?: string
    preheader?: string
    body?: string
    cta?: string
    raw?: string
  }
  blog_content?: {
    seo_title?: string
    meta_description?: string
    slug?: string
    body?: string
    keywords?: string[]
    internal_links?: string[]
    raw?: string
  }
}

export interface MultiFormatResult {
  success: boolean
  id: string
  final_content?: MultiFormatFinalContent
  error?: string
}

export async function runMultiFormatGenerator(
  theme: string,
  productId?: string,
): Promise<MultiFormatResult> {
  const body: Record<string, unknown> = { theme }
  if (productId) body.productId = productId
  return await pb.send('/backend/v1/multi-format-generator/run', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getMultiFormatResults(): Promise<any[]> {
  return await pb.collection('workflow_results').getFullList({ sort: '-created' })
}

export async function getMultiFormatResult(id: string): Promise<any> {
  return await pb.collection('workflow_results').getOne(id)
}
