import React, { Component, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLatestEdition, Edition } from '@/services/magazine'
import {
  BookOpen,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { SubscriberCoverBadge } from '@/components/SubscriberCoverBadge'

// Local ErrorBoundary dedicated to Index page to prevent white-screen crashes
interface IndexErrorBoundaryProps {
  children: ReactNode
}
interface IndexErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class IndexErrorBoundary extends Component<IndexErrorBoundaryProps, IndexErrorBoundaryState> {
  state: IndexErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): IndexErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[IndexErrorBoundary] Erro capturado no Index:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="text-center max-w-lg space-y-6">
            <div className="flex justify-center">
              <BrandLogo size="lg" className="h-20 sm:h-24 w-auto" />
            </div>
            <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-serif text-white">Revista Moda Atual</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Encontramos uma instabilidade momentânea ao carregar a página principal. Clique
                abaixo para tentar novamente ou acesse as edições diretamente.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold"
              >
                Tentar Novamente
              </Button>
              <Link to="/editions">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Ver Todas as Edições
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Editorial animated placeholder skeleton - shown while initial data is fetching
function IndexLoadingSkeleton() {
  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      {/* Hero Loading Banner with Central Logo and Pulsing Glow */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white pt-16 pb-20 md:pt-24 md:pb-28 min-h-[500px] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge
              variant="outline"
              className="border-orange-500/50 text-orange-400 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold rounded-full tracking-wide inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              HUB DIGITAL DE MODA ATACADISTA
            </Badge>

            {/* Central Brand Logo (Immediate Visibility - Never Blank) */}
            <div className="py-4 my-2 flex flex-col items-center justify-center bg-transparent relative">
              <BrandLogo size="hero" className="h-40 sm:h-52 md:h-60 lg:h-64 w-auto" />
              {/* Animated subtle loader spinner beneath the logo */}
              <div className="flex items-center gap-2 mt-4 text-orange-400 text-xs font-medium uppercase tracking-widest">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Carregando Edição Editorial...</span>
              </div>
            </div>

            <p className="max-w-2xl text-base sm:text-lg text-slate-400 font-light leading-relaxed">
              A revista digital referência no ecossistema de moda brasileiro. Conectando marcas
              atacadistas, fabricantes e lojistas de todo o Brasil.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <div className="h-14 w-44 rounded-md bg-orange-600/30 animate-pulse" />
              <div className="h-14 w-52 rounded-md bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Skeleton Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/60 bg-card/50">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 animate-pulse" />
                <div className="h-5 w-3/4 bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-800/60 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-slate-800/40 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function IndexContent() {
  const [latestEdition, setLatestEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[Index] Component mounted. Buscando última edição...')
    let isMounted = true

    // Safety timeout: never let loading remain true longer than 3.5 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn(
          '[Index] Fetch timeout atingido. Liberando render inicial com dados em cache/fallback.',
        )
        setLoading(false)
      }
    }, 3500)

    getLatestEdition()
      .then((edition) => {
        if (!isMounted) return
        console.log(
          '[Index] Última edição carregada com sucesso:',
          edition?.title || 'Nenhuma edição encontrada',
        )
        setLatestEdition(edition)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('[Index] Erro ao carregar última edição:', err)
        setLatestEdition(null)
      })
      .finally(() => {
        if (isMounted) {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  if (loading) {
    return <IndexLoadingSkeleton />
  }

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-300">
      {/* Hero Branding Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge
              variant="outline"
              className="border-orange-500/50 text-orange-400 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold rounded-full tracking-wide"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              HUB DIGITAL DE MODA ATACADISTA
            </Badge>

            {/* High Visibility Hero Logo - Clean Orange Box with 100% transparent canvas background */}
            <div className="py-4 my-2 transition-transform duration-300 hover:scale-[1.02] flex justify-center items-center bg-transparent">
              <BrandLogo size="hero" className="h-40 sm:h-52 md:h-60 lg:h-64 w-auto" />
            </div>

            <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed">
              A revista digital referência no ecossistema de moda brasileiro. Conectando marcas
              atacadistas, fabricantes e lojistas de todo o Brasil.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/reader/latest">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-8 py-6 text-base shadow-xl shadow-orange-600/30"
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Ler Edição Atual
                </Button>
              </Link>
              <Link to="/partners">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white px-8 py-6 text-base"
                >
                  <Award className="h-5 w-5 mr-2 text-orange-400" />
                  Explorar TOP 60 Marcas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600 w-fit">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Edições Interativas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Navegue pelas coleções com hotspots clicáveis e compra direta integrada ao mercado
                atacadista.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600 w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">TOP 60 Marcas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ranking curado das melhores marcas do polo de moda atacadista nacional com
                inteligência de mercado.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-600 w-fit">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Conexão B2B</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Integração via WhatsApp e catálogo inteligente para fechamento de pedidos em
                atacado.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Edition Section */}
      {latestEdition && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/3 aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden relative shadow-md">
              {latestEdition.cover_url ? (
                <img
                  src={latestEdition.cover_url}
                  alt={latestEdition.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900 text-white text-center">
                  <BrandLogo size="lg" className="h-20 w-auto mb-4" />
                  <p className="text-sm font-semibold">{latestEdition.title}</p>
                </div>
              )}
              <div className="absolute top-3 right-3 z-10">
                <SubscriberCoverBadge variant="floating" />
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-4 text-left">
              <Badge className="bg-orange-600 hover:bg-orange-500 text-white font-medium">
                Último Lançamento
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {latestEdition.title}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {latestEdition.description ||
                  'Confira as principais tendências, lookbooks e destaques das marcas que estão transformando o mercado de moda.'}
              </p>
              <div className="pt-2">
                <Link to={`/edition/${latestEdition.id}`}>
                  <Button className="bg-primary text-primary-foreground font-semibold gap-2">
                    Acessar Revista Digital
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lead Capture Form Section */}
      <LeadCaptureSection source="landing_page" />
    </div>
  )
}

export default function Index() {
  return (
    <IndexErrorBoundary>
      <IndexContent />
    </IndexErrorBoundary>
  )
}
