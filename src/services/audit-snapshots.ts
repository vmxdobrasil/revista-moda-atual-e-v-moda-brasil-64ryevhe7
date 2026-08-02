import pb from '@/lib/pocketbase/client'
import type { AuditReport } from '@/services/audit'

export interface AuditSnapshotSummary {
  id: string
  period: string
  status: string
  error_message: string
  created: string
  updated: string
}

export interface AuditSnapshot extends AuditSnapshotSummary {
  snapshot_data: AuditReport
}

export async function getAuditSnapshots(): Promise<AuditSnapshotSummary[]> {
  return await pb.send('/backend/v1/audit-snapshots', { method: 'GET' })
}

export async function getAuditSnapshot(id: string): Promise<AuditSnapshot> {
  return await pb.collection('audit_snapshots').getOne(id)
}

export async function generateAuditSnapshot(): Promise<{
  id: string
  period: string
  status: string
}> {
  return await pb.send('/backend/v1/audit-snapshot/generate', { method: 'POST' })
}
