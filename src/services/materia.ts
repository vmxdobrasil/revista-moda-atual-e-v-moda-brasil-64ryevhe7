import pb from '@/lib/pocketbase/client'

export interface MateriaSugestaoRedes {
  instagram_text: string
  arte_description: string
}

export interface MateriaArticle {
  titulo_principal: string
  subtitulo: string
  olho: string
  corpo: string
  call_to_action: string[]
  tags_seo: string[]
  sugestao_redes: MateriaSugestaoRedes
}

export interface MateriaResult {
  content: string
  article: MateriaArticle
  recordId: string
}

export async function generateMateria(tema: string): Promise<MateriaResult> {
  const res = await pb.send('/backend/v1/generate-materia', {
    method: 'POST',
    body: JSON.stringify({ tema }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    content: res.content,
    article: {
      titulo_principal: res.titulo_principal,
      subtitulo: res.subtitulo,
      olho: res.olho,
      corpo: res.corpo,
      call_to_action: res.call_to_action,
      tags_seo: res.tags_seo,
      sugestao_redes: res.sugestao_redes,
    },
    recordId: res.recordId,
  }
}
