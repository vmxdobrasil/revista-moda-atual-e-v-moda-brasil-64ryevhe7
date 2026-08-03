import pb from '@/lib/pocketbase/client'

export interface AuditCollection {
  name: string
  count: number
  lastRecord: string | null
  status: string
  priority: string
}

export interface AuditHook {
  name: string
  type: string
  deps: string
  lastExecution: string | null
  status: string
  priority: string
  error_message: string
}

export interface AuditAgent {
  name: string
  slug: string
  description: string
  lastExecution: string | null
  status: string
  priority: string
  error_message: string
}

export interface AuditDeliveryQueue {
  total: number
  byStatus: Record<string, number>
  pending: number
  errors: Array<{
    id: string
    theme: string
    error_note: string
    created: string
    priority: string
  }>
  healthStatus: string
  avgProcessingTime: string
  items: Array<{
    id: string
    theme: string
    status: string
    created: string
    updated: string
    published_at: string
    error_note: string
    priority: string
    processingTime: string
  }>
}

export interface AuditDivergence<T = unknown> {
  documented: number
  found: number
  additional: T[]
}

export interface AuditReport {
  generatedAt: string
  collections: AuditCollection[]
  hooks: AuditHook[]
  agents: AuditAgent[]
  deliveryQueue: AuditDeliveryQueue
  hookExecutionsByDay?: Array<{ date: string; success: number; error: number }>
  hooksDivergence: AuditDivergence<{ name: string; purpose: string; status: string }>
  promptsDivergence: AuditDivergence<{
    name: string
    slug: string
    category: string
    updated: string
  }> & {
    allPrompts: Array<{ name: string; slug: string; category: string; updated: string }>
  }
  adminModulesDivergence: AuditDivergence<{
    name: string
    description: string
    route: string
    status: string
  }>
  arquitetoFix: {
    status: string
    bug: string
    fix: string
    validated: boolean
    parameterCorrections: Array<{
      hook: string
      field: string
      correctedTo: string
      reason: string
    }>
  }
}

export async function getAuditReport(): Promise<AuditReport> {
  return await pb.send('/backend/v1/audit-report', { method: 'GET' })
}
