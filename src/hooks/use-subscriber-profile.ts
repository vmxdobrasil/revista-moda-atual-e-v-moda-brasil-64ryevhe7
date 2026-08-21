import { useAuth } from '@/hooks/use-auth'
import { getFileUrl } from '@/services/magazine'
import { useMemo } from 'react'

export interface SubscriberProfile {
  isAuthenticated: boolean
  isSubscriber: boolean
  name: string
  avatarUrl: string | null
  initials: string
  roleLabel: string
  email?: string
}

export function useSubscriberProfile(): SubscriberProfile {
  const { user, isAuthenticated } = useAuth()

  return useMemo(() => {
    if (!isAuthenticated || !user) {
      return {
        isAuthenticated: false,
        isSubscriber: false,
        name: '',
        avatarUrl: null,
        initials: '',
        roleLabel: '',
      }
    }

    const name = (user.name || user.email?.split('@')[0] || 'Assinante VIP').trim()
    const avatarUrl = user.avatar ? getFileUrl(user, user.avatar) : user.avatar_url || null

    const initials = name
      ? name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase())
          .join('')
      : 'AS'

    return {
      isAuthenticated: true,
      isSubscriber: true,
      name,
      avatarUrl,
      initials: initials || 'VIP',
      roleLabel: 'Assinante Oficial',
      email: user.email,
    }
  }, [user, isAuthenticated])
}
