import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'
import logoImg from '@/assets/image-editing1-586c9.png'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa_prompt_dismissed_at'
const ENGAGEMENT_KEY = 'pwa_engagement_count'
const MIN_ENGAGEMENT = 3
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000

export function PwaInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIos, setIsIos] = useState(false)

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const engagementReachedRef = useRef(false)
  const isIosRef = useRef(false)

  const isDismissed = useCallback(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) return false
    return Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION
  }, [])

  const isStandalone = useCallback(() => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    )
  }, [])

  const tryShowBanner = useCallback(() => {
    if (isStandalone()) return
    if (isDismissed()) return
    if (!engagementReachedRef.current) return
    if (isIosRef.current || deferredPromptRef.current) {
      setShowPrompt(true)
    }
  }, [isStandalone, isDismissed])

  useEffect(() => {
    if (isStandalone()) return

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    if (iosDevice) {
      setIsIos(true)
      isIosRef.current = true
    }

    const currentCount = parseInt(localStorage.getItem(ENGAGEMENT_KEY) || '0', 10)
    if (currentCount >= MIN_ENGAGEMENT) {
      engagementReachedRef.current = true
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      tryShowBanner()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const trackEngagement = () => {
      const count = parseInt(localStorage.getItem(ENGAGEMENT_KEY) || '0', 10) + 1
      localStorage.setItem(ENGAGEMENT_KEY, String(count))

      if (count >= MIN_ENGAGEMENT) {
        engagementReachedRef.current = true
        tryShowBanner()
      }
    }

    let throttleTimer: ReturnType<typeof setTimeout> | null = null
    const onInteract = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        throttleTimer = null
        trackEngagement()
      }, 2000)
    }

    document.addEventListener('click', onInteract)
    document.addEventListener('scroll', onInteract, { passive: true })
    document.addEventListener('touchstart', onInteract, { passive: true })

    tryShowBanner()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      document.removeEventListener('click', onInteract)
      document.removeEventListener('scroll', onInteract)
      document.removeEventListener('touchstart', onInteract)
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [isStandalone, tryShowBanner])

  const handleInstallClick = async () => {
    if (!deferredPromptRef.current) return
    setShowPrompt(false)
    await deferredPromptRef.current.prompt()
    const choice = await deferredPromptRef.current.userChoice
    if (choice.outcome === 'accepted') {
      deferredPromptRef.current = null
      localStorage.removeItem(ENGAGEMENT_KEY)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  useEffect(() => {
    const handleInstalled = () => {
      deferredPromptRef.current = null
      setShowPrompt(false)
      localStorage.removeItem(ENGAGEMENT_KEY)
    }
    window.addEventListener('appinstalled', handleInstalled)
    return () => window.removeEventListener('appinstalled', handleInstalled)
  }, [])

  if (!showPrompt || isStandalone()) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-background/95 backdrop-blur border border-primary/20 shadow-2xl rounded-2xl p-4 transition-all duration-300 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 p-1 flex items-center justify-center shrink-0 border border-primary/20">
          <img src={logoImg} alt="Moda Atual" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-foreground">
              Revista MODA ATUAL Digital
            </h3>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Instale o app para acesso rápido às últimas edições, tendências e ofertas exclusivas
            direto da sua tela inicial.
          </p>

          {isIos ? (
            <div className="mt-2 text-xs bg-muted/60 p-2 rounded-lg text-muted-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0 text-primary" />
              <span>
                Toque em <strong>Compartilhar</strong> e depois em{' '}
                <strong>Adicionar à Tela de Início</strong>.
              </span>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs rounded-lg px-4 gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Agora não
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
