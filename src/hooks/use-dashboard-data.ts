import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getDashboardData,
  type DashboardData,
  type PeriodFilter,
} from '@/services/dashboard-metrics'

export function useDashboardData(period: PeriodFilter) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setLoading(true)
      setError(null)
      try {
        setData(await getDashboardData(period))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados.')
      } finally {
        setLoading(false)
      }
    },
    [period],
  )

  useEffect(() => {
    load(true)
  }, [load])

  useRealtime('editions', () => load(false))
  useRealtime('edition_pages', () => load(false))
  useRealtime('social_posts', () => load(false))
  useRealtime('workflow_results', () => load(false))
  useRealtime('delivery_queue', () => load(false))
  useRealtime('marketplace_orders', () => load(false))
  useRealtime('notifications', () => load(false))
  useRealtime('seo_metrics', () => load(false))

  return { data, loading, error, reload: () => load(false) }
}
