import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, X } from 'lucide-react'
import { type Notification, getUnreadAlerts, markNotificationRead } from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'

export function DeadlineAlerts() {
  const [alerts, setAlerts] = useState<Notification[]>([])
  const [collapsed, setCollapsed] = useState(false)

  const loadAlerts = async () => {
    try {
      setAlerts(await getUnreadAlerts())
    } catch {
      setAlerts([])
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])
  useRealtime('notifications', () => {
    loadAlerts()
  })
  useRealtime('ad_proposals', () => {
    loadAlerts()
  })

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationRead(id)
      setAlerts((prev) => prev.filter((a) => a.id !== id))
    } catch {
      /* ignore */
    }
  }

  if (alerts.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-semibold text-amber-800 text-sm">
              Alertas de Prazo de Entrega ({alerts.length})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-amber-600 hover:text-amber-800"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'Mostrar' : 'Ocultar'}
          </Button>
        </div>
        {!collapsed && (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                  alert.type === 'alert'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <Clock
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    alert.type === 'alert' ? 'text-red-500' : 'text-amber-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{alert.title}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{alert.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-gray-400 hover:text-gray-600"
                  onClick={() => handleDismiss(alert.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
