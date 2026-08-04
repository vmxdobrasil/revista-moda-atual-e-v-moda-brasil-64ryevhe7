import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

function getIcon(type: string) {
  switch (type) {
    case 'alert':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'alert':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return date.toLocaleDateString('pt-BR')
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      setNotifications(await getNotifications())
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime('notifications', () => load())

  const unread = notifications.filter((n) => !n.is_read)

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-xs font-bold rounded-full bg-red-500 text-white flex items-center justify-center">
              {unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-semibold text-sm">Notificações</span>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto text-xs gap-1"
              onClick={handleMarkAll}
            >
              <CheckCheck className="w-3 h-3" /> Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Nenhuma notificação.</p>
          ) : (
            notifications.map((n) => {
              const Icon = getIcon(n.type)
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-2 p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors',
                    !n.is_read && 'bg-blue-50/50',
                  )}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 mt-0.5', getIconColor(n.type))} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatRelative(n.created)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                  )}
                </div>
              )
            })
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
