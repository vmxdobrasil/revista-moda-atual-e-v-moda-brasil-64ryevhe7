import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSiteSettings, getLogoUrl } from '@/services/logo-settings'
import { useRealtime } from '@/hooks/use-realtime'

interface LogoContextType {
  logoUrl: string | null
  isCustomLogo: boolean
  visualParams: Record<string, any> | null
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
  // Always initialize synchronously with default fallback values (logoUrl=null, isCustomLogo=false)
  // so consumer components can render immediately without waiting for network calls
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [visualParams, setVisualParams] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    try {
      // 4 second timeout guard for getSiteSettings so it never hangs indefinitely
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000))
      const settings = await Promise.race([getSiteSettings(), timeoutPromise])
      if (settings) {
        const customUrl = getLogoUrl(settings)
        setLogoUrl(customUrl)
        setVisualParams(settings.logo_visual_params || null)
      }
    } catch (err) {
      // Non-blocking fallback: default vector logo remains active
      console.warn('[LogoProvider] Failed to fetch custom site settings logo:', err)
      setLogoUrl(null)
      setVisualParams(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Refresh asynchronously in the background; UI does not wait
    refresh()
  }, [])

  useRealtime('site_settings', () => {
    refresh()
  })

  return (
    <LogoContext.Provider
      value={{
        logoUrl,
        isCustomLogo: Boolean(logoUrl),
        visualParams,
        loading,
        refresh,
      }}
    >
      {children}
    </LogoContext.Provider>
  )
}
