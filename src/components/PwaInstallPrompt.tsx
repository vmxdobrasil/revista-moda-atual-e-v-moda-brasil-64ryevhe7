import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X, Smartphone } from 'lucide-react'
import logoImg from '@/assets/image-editing1-586c9.png'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone

    if (iosDevice && !isStandalone) {
      setIsIos(true)
      const dismissed = localStorage.getItem('pwa_prompt_dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    setShowPrompt(false)
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (!showPrompt) return null

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
                Instalar aplicativo
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
