import pb from '@/lib/pocketbase/client'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'alert'
  is_read: boolean
  created: string
  updated: string
}

export async function getNotifications(limit = 50): Promise<Notification[]> {
  const result = await pb.collection('notifications').getList(1, limit, {
    sort: '-created',
  })
  return result.items as unknown as Notification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  await pb.collection('notifications').update(id, { is_read: true })
}

export async function markAllNotificationsRead(): Promise<void> {
  const notifications = await getNotifications()
  const unread = notifications.filter((n) => !n.is_read)
  await Promise.all(
    unread.map((n) => pb.collection('notifications').update(n.id, { is_read: true })),
  )
}

export async function getUnreadAlerts(limit = 20): Promise<Notification[]> {
  const result = await pb.collection('notifications').getList(1, limit, {
    filter: 'is_read = false && (type = "warning" || type = "alert")',
    sort: '-created',
  })
  return result.items as unknown as Notification[]
}
