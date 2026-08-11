import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSiteSettings, getLogoUrl } from '@/services/logo-settings'
import { useRealtime } from '@/hooks/use-realtime'
import officialOrangeLogoUrl from '@/assets/editedimage1786389429173-467b1.png'

interface LogoContextType {
  logoUrl: string
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
  const [logoUrl, setLogoUrl] = useState<string>(officialOrangeLogoUrl)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const settings = await getSiteSettings()
      setLogoUrl(getLogoUrl(settings) || officialOrangeLogoUrl)
    } catch {
      setLogoUrl(officialOrangeLogoUrl)
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
