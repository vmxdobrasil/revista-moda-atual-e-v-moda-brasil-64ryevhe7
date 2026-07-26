import pb from '@/lib/pocketbase/client'

export interface WeeklyPlanResult {
  content: string
  day_sections: Record<string, string>
  resumo: string
  subject: string
  recordId: string
}

export async function generateWeeklyPlan(
  dataInicio: string,
  dataFim: string,
  tema1: string,
  tema2: string,
  tema3: string,
): Promise<WeeklyPlanResult> {
  const res = await pb.send('/backend/v1/generate-weekly-plan', {
    method: 'POST',
    body: JSON.stringify({ dataInicio, dataFim, tema1, tema2, tema3 }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    content: res.content,
    day_sections: res.day_sections,
    resumo: res.resumo,
    subject: res.subject,
    recordId: res.recordId,
  }
}
