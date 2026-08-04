import pb from '@/lib/pocketbase/client'
import type { PeriodFilter } from '@/services/dashboard-metrics'

export interface CardPreference {
  id: string
  visible: boolean
  order: number
}

export interface DashboardPreferences {
  period: PeriodFilter
  cards: CardPreference[]
}

export const DEFAULT_CARDS: CardPreference[] = [
  { id: 'metrics', visible: true, order: 0 },
  { id: 'quick-access', visible: true, order: 1 },
  { id: 'charts', visible: true, order: 2 },
  { id: 'breakdowns', visible: true, order: 3 },
  { id: 'tabs', visible: true, order: 4 },
]

export const DEFAULT_PREFERENCES: DashboardPreferences = {
  period: 'all',
  cards: DEFAULT_CARDS,
}

export async function loadDashboardPreferences(): Promise<DashboardPreferences> {
  const user = pb.authStore.record
  if (!user) return DEFAULT_PREFERENCES
  const stored = user.get('dashboard_preferences') as DashboardPreferences | null | undefined
  if (!stored) return DEFAULT_PREFERENCES
  return {
    period: (stored.period as PeriodFilter) || 'all',
    cards: mergeCards(stored.cards || []),
  }
}

function mergeCards(stored: CardPreference[]): CardPreference[] {
  const result = DEFAULT_CARDS.map((c) => ({ ...c }))
  for (const card of result) {
    const found = stored.find((s) => s.id === card.id)
    if (found) {
      card.visible = found.visible
      card.order = found.order
    }
  }
  return result.sort((a, b) => a.order - b.order)
}

export async function saveDashboardPreferences(prefs: DashboardPreferences): Promise<void> {
  const user = pb.authStore.record
  if (!user) return
  await pb.collection('users').update(user.id, {
    dashboard_preferences: prefs,
  })
  user.set('dashboard_preferences', prefs)
}
