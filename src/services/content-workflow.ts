import pb from '@/lib/pocketbase/client'

export interface WorkflowAgentOutputs {
  analysis?: {
    top_themes?: string[]
    best_hooks?: string[]
    recommended_format?: string
  }
  trend_brief?: {
    trend_summary?: string
    target_audience?: string
    suggested_angle?: string
  }
  copy?: {
    title?: string
    body?: string
    suggested_hashtags?: string[]
  }
  visual?: {
    cover_concept?: string
    template?: string
    hotspots?: Array<{ x: number; y: number; title: string }>
    page_title?: string
  }
}

export interface WorkflowFinalContent extends WorkflowAgentOutputs {}

export interface WorkflowResult {
  success: boolean
  agent_outputs: WorkflowAgentOutputs
  final_content: WorkflowFinalContent
  workflow_result_id?: string
  error?: string
  failed_step?: string
  partial_outputs?: WorkflowAgentOutputs
}

export function runContentWorkflow(editionId?: string, theme?: string): Promise<WorkflowResult> {
  return pb.send('/backend/v1/content-workflow/run', {
    method: 'POST',
    body: JSON.stringify({ edition_id: editionId, theme }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function saveWorkflowToGeneratedContent(data: {
  theme: string
  original_edition?: string
  content_data: unknown
}) {
  const payload: Record<string, unknown> = {
    theme: data.theme,
    content_data: data.content_data,
  }
  if (data.original_edition) {
    payload.original_edition = data.original_edition
  }
  return pb.collection('generated_social_content').create(payload)
}
