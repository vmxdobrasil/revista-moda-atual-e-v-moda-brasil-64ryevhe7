import pb from '@/lib/pocketbase/client'

export interface ArquitetoWorkflowResult {
  workflow: string
}

export async function generateArquitetoWorkflow(
  entregaFinal: string,
  n: number,
): Promise<ArquitetoWorkflowResult> {
  const res = await pb.send('/backend/v1/generate-arquiteto-workflow', {
    method: 'POST',
    body: JSON.stringify({ entregaFinal, n }),
    headers: { 'Content-Type': 'application/json' },
  })
  return { workflow: res.workflow || '' }
}
