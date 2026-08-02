import pb from '@/lib/pocketbase/client'

export interface WorkflowAgentOutputs {
  [key: string]: any
}

export interface WorkflowFinalContent {
  copy?: any
  visual?: any
  analysis?: any
  trend_brief?: any
}

export interface WorkflowResult {
  success: boolean
  agent_outputs?: WorkflowAgentOutputs
  final_content?: WorkflowFinalContent
  workflow_result_id?: string
  error?: string
  failed_step?: string
  partial_outputs?: WorkflowAgentOutputs
}

export async function runContentWorkflow(
  editionId?: string,
  theme?: string,
): Promise<WorkflowResult> {
  const body: Record<string, unknown> = {}
  if (editionId) body.editionId = editionId
  if (theme) body.theme = theme
  return await pb.send('/backend/v1/content-workflow/run', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function saveWorkflowToGeneratedContent(
  theme: string,
  content: any,
  editionId?: string,
): Promise<any> {
  const data: Record<string, unknown> = { theme, content_data: content }
  if (editionId) data.original_edition = editionId
  return await pb.collection('generated_social_content').create(data)
}
