import { useState, useEffect, useCallback } from 'react'

export interface AlertSettings {
  viewThreshold: number
  engagementThreshold: number
}

const STORAGE_KEY = 'social-analytics-alert-settings'
const DEFAULT_SETTINGS: AlertSettings = {
  viewThreshold: 500000,
  engagementThreshold: 0.01,
}

export function useAlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const updateSettings = useCallback((partial: Partial<AlertSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }, [])

  return { settings, updateSettings }
}
