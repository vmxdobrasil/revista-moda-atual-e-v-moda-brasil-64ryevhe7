import pb from '@/lib/pocketbase/client'
import { getEditions, type Edition } from '@/services/magazine'

export interface GeneratedContent {
  materia_completa: string
  post_feed: { titulo: string; legenda: string }
  roteiro_reel: {
    duracao: string
    cenas: Array<{
      numero: number
      tempo: string
      descricao: string
      texto_overlay: string
      audio: string
    }>
  }
  stories: Array<{ numero: number; texto: string; design: string; cta: string }>
  hashtags: { principais: string[]; alcance: string[] }
  cta: string
}

export interface SavedContent {
  id: string
  theme: string
  original_edition: string
  content_data: GeneratedContent
  created: string
  updated: string
}

export { getEditions, type Edition }

export const generateContent = (theme: string, editionId?: string): Promise<GeneratedContent> =>
  pb.send('/backend/v1/generate-content', {
    method: 'POST',
    body: JSON.stringify({ theme, editionId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const saveGeneratedContent = (data: {
  theme: string
  original_edition?: string
  content_data: GeneratedContent
}) => {
  const payload: Record<string, unknown> = {
    theme: data.theme,
    content_data: data.content_data,
  }
  if (data.original_edition) {
    payload.original_edition = data.original_edition
  }
  return pb.collection('generated_social_content').create(payload)
}

export const getSavedContent = (): Promise<SavedContent[]> =>
  pb.collection('generated_social_content').getFullList<SavedContent>({ sort: '-created' })
