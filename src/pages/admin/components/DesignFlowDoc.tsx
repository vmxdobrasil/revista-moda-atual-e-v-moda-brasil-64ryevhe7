import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Lightbulb, ImagePlus, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    icon: Briefcase,
    title: '1. Briefing',
    description:
      'O time editorial fornece o tema, história e contexto. O Art Director analisa o briefing e identifica os elementos visuais chave — paleta, tipografia, referências de moda.',
  },
  {
    icon: Lightbulb,
    title: '2. Conceito',
    description:
      'A partir do briefing, o Art Director desenvolve o conceito visual: mood, hierarquia, composição e template (default, editorial, marketing, holofote ou entrevista). Variações A/B são propostas.',
  },
  {
    icon: ImagePlus,
    title: '3. Capa Final',
    description:
      'O conceito é materializado como composição HTML/CSS seguindo o Design System (laranja #ea580c, serif para títulos). A imagem de stock é selecionada e integrada. O resultado é salvo em cover_image, cover_alt_text e cover_variants.',
  },
  {
    icon: CheckCircle2,
    title: '4. Validação',
    description:
      'A capa final é revisada pelo time editorial. Variações A/B podem ser testadas em redes sociais. Thumbnails para Reels e YouTube são gerados a partir do mesmo conceito visual.',
  },
]

export function DesignFlowDoc() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Design: Briefing → Conceito → Capa Final</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  {i < STEPS.length - 1 && <div className="w-0.5 h-12 bg-orange-200 mt-1" />}
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="text-sm font-semibold text-orange-800 mb-2">Design System</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>
              <strong>Cor primária:</strong> #ea580c (laranja)
            </li>
            <li>
              <strong>Tipografia:</strong> Serif (Playfair Display) para títulos editoriais,
              Sans-serif (Inter/Montserrat) para corpo
            </li>
            <li>
              <strong>Templates:</strong> default, editorial, marketing, holofote, entrevista
            </li>
            <li>
              <strong>Capa:</strong> 800×1124px (proporção 0.7118)
            </li>
            <li>
              <strong>Reels:</strong> 1080×1920 (vertical) | <strong>YouTube:</strong> 1280×720
              (horizontal)
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
