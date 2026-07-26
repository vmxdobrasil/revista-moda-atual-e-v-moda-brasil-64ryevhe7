import pb from '@/lib/pocketbase/client'

export interface PotencialAtacado {
  nivel: string
  justificativa: string
}

export interface TrendReport {
  nome: string
  origem: string
  descricao: string
  potencial_atacado: PotencialAtacado
  relevancia_polo: string
  oportunidades: string[]
  abordagem_editorial: string
  palavras_chave: string[]
  raw: string
  recordId: string
}

export async function generateTrendReport(tendencia: string): Promise<TrendReport> {
  const res = await pb.send('/backend/v1/generate-trend-report', {
    method: 'POST',
    body: JSON.stringify({ tendencia }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    nome: res.nome,
    origem: res.origem,
    descricao: res.descricao,
    potencial_atacado: res.potencial_atacado,
    relevancia_polo: res.relevancia_polo,
    oportunidades: res.oportunidades,
    abordagem_editorial: res.abordagem_editorial,
    palavras_chave: res.palavras_chave,
    raw: res.raw,
    recordId: res.recordId,
  }
}
