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

export interface AuditLogFilter {
  fromDate?: string
  toDate?: string
  integrationType?: string
  status?: string
  agentName?: string
}

export async function getErrorAuditLogs(limit = 50): Promise<AuditLog[]> {
  const result = await pb.collection('audit_logs').getList(1, limit, {
    filter: "status = 'error'",
    sort: '-executed_at',
  })
  return result.items as unknown as AuditLog[]
}

export async function getFilteredAuditLogs(filter: AuditLogFilter): Promise<AuditLog[]> {
  const parts: string[] = []
  if (filter.fromDate) parts.push(`executed_at >= "${filter.fromDate} 00:00:00"`)
  if (filter.toDate) parts.push(`executed_at <= "${filter.toDate} 23:59:59"`)
  if (filter.integrationType) parts.push(`integration_type = "${filter.integrationType}"`)
  if (filter.status) parts.push(`status = "${filter.status}"`)
  if (filter.agentName) parts.push(`agent_name = "${filter.agentName}"`)

  const filterStr = parts.length > 0 ? parts.join(' && ') : ''

  const result = await pb.collection('audit_logs').getList(1, 500, {
    filter: filterStr,
    sort: '-executed_at',
  })
  return result.items as unknown as AuditLog[]
}
