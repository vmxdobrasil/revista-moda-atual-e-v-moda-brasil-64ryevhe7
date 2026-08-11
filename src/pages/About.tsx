import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { getAboutContent, AboutContent } from '@/services/about-content'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Award, ShieldCheck, Heart } from 'lucide-react'

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null)

  useEffect(() => {
    getAboutContent()
      .then((data) => setContent(data))
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-6">
        <div className="flex justify-center py-2">
          <BrandLogo size="hero" className="h-40 sm:h-52 w-auto" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {content?.title || 'Sobre a Revista MODA ATUAL Digital'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          Conectando o atacado de moda brasileiro através de tecnologia, editorial de alto nível e
          inteligência comercial.
        </p>
      </div>

      <Card className="border-border/80 shadow-md">
        <CardContent className="p-6 sm:p-10 space-y-6 text-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line">
          {content?.body || (
            <>
              A Revista MODA ATUAL Digital é o principal veículo de comunicação e negócios voltado
              exclusivamente para o ecossistema atacadista de moda do Brasil. Nossa missão é
              aproximar marcas fabricantes, lojistas revendedores e compradores em uma plataforma
              interativa e inovadora, combinando o charme e o refinamento do design editorial
              impresso com o poder de conversão da tecnologia digital. Através de nossas edições
              interativas, catálogo inteligente TOP 60 e agentes de inteligência de mercado,
              ajudamos empresas a escalarem suas vendas e fortalecerem suas marcas nacionalmente.
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
        <div className="text-center p-6 rounded-xl bg-card border border-border/60 space-y-2">
          <Award className="h-8 w-8 text-orange-500 mx-auto" />
          <h3 className="font-bold text-base">Curadoria Exclusiva</h3>
          <p className="text-xs text-muted-foreground">
            Seleção rigorosa das melhores coleções e fabricantes.
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-card border border-border/60 space-y-2">
          <Sparkles className="h-8 w-8 text-orange-500 mx-auto" />
          <h3 className="font-bold text-base">Design Senior</h3>
          <p className="text-xs text-muted-foreground">
            Proporções perfeitas e estética de revista internacional.
          </p>
        </div>

        <div className="text-center p-6 rounded-xl bg-card border border-border/60 space-y-2">
          <ShieldCheck className="h-8 w-8 text-orange-500 mx-auto" />
          <h3 className="font-bold text-base">Atacado Verificado</h3>
          <p className="text-xs text-muted-foreground">
            Conexão direta com compradores B2B qualificados.
          </p>
        </div>
      </div>
    </div>
  )
}
