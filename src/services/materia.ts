import pb from '@/lib/pocketbase/client'

export interface MateriaSections {
  titulo: string
  subtitulo: string
  olho: string
  corpo: string
  cta: string
  tags: string
  social: string
}

export interface MateriaResult {
  content: string
  sections: MateriaSections
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
    sections: res.sections,
    recordId: res.recordId,
  }
}
