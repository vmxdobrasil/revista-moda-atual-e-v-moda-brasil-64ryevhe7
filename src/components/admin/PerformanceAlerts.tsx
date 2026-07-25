import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, PartyPopper } from 'lucide-react'
import type { SocialPost } from '@/services/social-posts'
import type { AlertSettings } from '@/hooks/use-alert-settings'

interface PerformanceAlertsProps {
  posts: SocialPost[]
  settings: AlertSettings
}

interface AlertItem {
  id: string
  type: 'high' | 'low'
  message: string
}

export function PerformanceAlerts({ posts, settings }: PerformanceAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const alerts = useMemo<AlertItem[]>(() => {
    const result: AlertItem[] = []
    posts.forEach((p) => {
      if (p.views > settings.viewThreshold) {
        result.push({
          id: `high-${p.id}`,
          type: 'high',
          message: `Post atingiu ${p.views.toLocaleString('pt-BR')} visualizações! 🎉`,
        })
      }
      if (p.engagement_rate < settings.engagementThreshold && p.views >= 10000) {
        result.push({
          id: `low-${p.id}`,
          type: 'low',
          message: `Post "${p.hook}" está com baixa taxa de engajamento (${((p.engagement_rate || 0) * 100).toFixed(1)}%).`,
        })
      }
    })
    return result
  }, [posts, settings])

  const visible = alerts.filter((a) => !dismissed.has(a.id))
  if (visible.length === 0) return null

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  return (
    <div className="space-y-2 no-print">
      {visible.map((alert) => (
        <Card
          key={alert.id}
          className={
            alert.type === 'high'
              ? 'border-green-200 bg-green-50'
              : 'border-orange-200 bg-orange-50'
          }
        >
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-2 min-w-0">
              {alert.type === 'high' ? (
                <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
              )}
              <span className="text-sm text-gray-700 truncate">{alert.message}</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => dismiss(alert.id)}
              className="h-7 w-7 shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
