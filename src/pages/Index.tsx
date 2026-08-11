import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLatestEdition, Edition } from '@/services/magazine'
import { BookOpen, Award, ArrowRight, Sparkles, CheckCircle, TrendingUp, Zap } from 'lucide-react'

export default function Index() {
  const [latestEdition, setLatestEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLatestEdition()
      .then((edition) => setLatestEdition(edition))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-16 pb-20">
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

            {/* High Visibility Hero Logo - Clean Orange Box without any white square container */}
            <div className="py-4 my-2 transition-transform duration-300 hover:scale-[1.02] flex justify-center items-center bg-transparent">
              <BrandLogo size="hero" className="h-44 sm:h-56 md:h-64 lg:h-72 w-auto" />
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
    </div>
  )
}
