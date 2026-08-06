import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSiteSettings, getLogoUrl, type SiteSettings } from '@/services/logo-settings'
import { useRealtime } from '@/hooks/use-realtime'

interface LogoContextType {
  logoUrl: string | null
  loading: boolean
  refresh: () => Promise<void>
}

const LogoContext = createContext<LogoContextType | undefined>(undefined)

export function useLogo() {
  const context = useContext(LogoContext)
  if (!context) throw new Error('useLogo must be used within a LogoProvider')
  return context
}

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const settings = await getSiteSettings()
      setLogoUrl(getLogoUrl(settings))
    } catch {
      setLogoUrl(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useRealtime('site_settings', () => {
    refresh()
  })

  return (
    <LogoContext.Provider value={{ logoUrl, loading, refresh }}>{children}</LogoContext.Provider>
  )
}
