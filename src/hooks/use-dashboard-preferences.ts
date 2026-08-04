import { useState, useEffect, useCallback } from 'react'
import {
  loadDashboardPreferences,
  saveDashboardPreferences,
  DEFAULT_PREFERENCES,
  type DashboardPreferences,
} from '@/services/user-preferences'
import type { PeriodFilter } from '@/services/dashboard-metrics'

export function useDashboardPreferences() {
  const [prefs, setPrefs] = useState<DashboardPreferences>(DEFAULT_PREFERENCES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardPreferences()
      .then(setPrefs)
      .catch(() => setPrefs(DEFAULT_PREFERENCES))
      .finally(() => setLoading(false))
  }, [])

  const setPeriod = useCallback((period: PeriodFilter) => {
    setPrefs((prev) => {
      const updated = { ...prev, period }
      saveDashboardPreferences(updated).catch(() => {})
      return updated
    })
  }, [])

  const moveCard = useCallback((cardId: string, direction: 'up' | 'down') => {
    setPrefs((prev) => {
      const sorted = [...prev.cards].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((c) => c.id === cardId)
      if (idx < 0) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const tmp = sorted[idx].order
      sorted[idx].order = sorted[swapIdx].order
      sorted[swapIdx].order = tmp
      const updated = { ...prev, cards: sorted }
      saveDashboardPreferences(updated).catch(() => {})
      return updated
    })
  }, [])

  const toggleCard = useCallback((cardId: string) => {
    setPrefs((prev) => {
      const cards = prev.cards.map((c) => (c.id === cardId ? { ...c, visible: !c.visible } : c))
      const updated = { ...prev, cards }
      saveDashboardPreferences(updated).catch(() => {})
      return updated
    })
  }, [])

  return { prefs, loading, setPeriod, moveCard, toggleCard }
}
