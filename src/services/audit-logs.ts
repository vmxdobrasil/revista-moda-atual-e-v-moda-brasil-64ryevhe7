import pb from '@/lib/pocketbase/client'

export interface AuditLog {
  id: string
  integration_name: string
  integration_type: string
  status: string
  executed_at: string
  workflow_id: string
  error_message: string
  agent_name: string
  created: string
  updated: string
}

export async function getErrorAuditLogs(limit = 50): Promise<AuditLog[]> {
  const result = await pb.collection('audit_logs').getList(1, limit, {
    filter: "status = 'error'",
    sort: '-executed_at',
  })
  return result.items as unknown as AuditLog[]
}
