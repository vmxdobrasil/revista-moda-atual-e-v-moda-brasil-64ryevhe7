import pb from '@/lib/pocketbase/client'

export interface SeoOptimizationResult {
  meta_title: string
  meta_description: string
  slug: string
  headings: { h1: string[]; h2: string[]; h3: string[] }
  keyword_density: Record<string, number>
  og: { title: string; description: string; image: string }
  internal_links: string[]
  lsi_keywords: string[]
  recommendations: string[]
}

export interface KeywordSuggestion {
  keyword: string
  estimated_volume: string
  difficulty: number
  intent: string
  related: string[]
}

export interface KeywordSuggestionsResult {
  keywords: KeywordSuggestion[]
}

export async function optimizeSeo(article: string, tema?: string): Promise<SeoOptimizationResult> {
  return await pb.send('/backend/v1/seo', {
    method: 'POST',
    body: JSON.stringify({ article, tema }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function suggestKeywords(tema: string): Promise<KeywordSuggestionsResult> {
  return await pb.send('/backend/v1/palavras-chave', {
    method: 'POST',
    body: JSON.stringify({ tema }),
    headers: { 'Content-Type': 'application/json' },
  })
}
