import { useEffect, useRef } from 'react'
import type { StoryText } from '@/services/story-texts'

export function requestNotificationPermission(): void {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function useScheduleNotification(storyTexts: StoryText[]): void {
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return

    const checkAndNotify = () => {
      const now = Date.now()
      storyTexts.forEach((text) => {
        if (!text.scheduled_date) return
        const scheduled = new Date(text.scheduled_date).getTime()
        if (isNaN(scheduled)) return
        const diff = scheduled - now
        if (diff <= 0 && diff > -60000 && !notifiedRef.current.has(text.id)) {
          notifiedRef.current.add(text.id)
          new Notification('Hora de publicar!', {
            body: `Time to post: ${text.subject}`,
          })
        }
      })
    }

    const interval = setInterval(checkAndNotify, 30000)
    checkAndNotify()
    return () => clearInterval(interval)
  }, [storyTexts])
}
