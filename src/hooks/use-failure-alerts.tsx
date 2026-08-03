import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorAuditLogs, type AuditLog } from '@/services/audit-logs'

const STORAGE_KEY = 'acknowledged-failure-alerts'

function loadAcknowledged(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveAcknowledged(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore
  }
}

export function useFailureAlerts() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acknowledged, setAcknowledged] = useState<Set<string>>(loadAcknowledged)

  const load = useCallback(async () => {
    setError(null)
    try {
      const data = await getErrorAuditLogs()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar alertas de falha.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('audit_logs', () => {
    load()
  })

  const unacknowledged = logs.filter((log) => !acknowledged.has(log.id))
  const hasFailures = unacknowledged.length > 0

  const acknowledge = useCallback((ids: string[]) => {
    setAcknowledged((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      saveAcknowledged(next)
      return next
    })
  }, [])

  const acknowledgeAll = useCallback(() => {
    const allIds = logs.map((log) => log.id)
    setAcknowledged(() => {
      const next = new Set(allIds)
      saveAcknowledged(next)
      return next
    })
  }, [logs])

  return {
    logs,
    unacknowledged,
    hasFailures,
    loading,
    error,
    acknowledge,
    acknowledgeAll,
  }
}
