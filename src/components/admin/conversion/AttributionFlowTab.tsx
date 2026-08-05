import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MousePointerClick, ShoppingCart, BarChart3, Sparkles, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    icon: MousePointerClick,
    title: '1. Leitor Interage',
    description:
      'O leitor navega pela revista imersiva e clica em um hotspot ou CTA. O hotspot registra link_origin (revista, hotspot, whatsapp), cta_variant (A, B, C) e click_count em page_hotspots.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: ShoppingCart,
    title: '2. Pedido Registrado',
    description:
      'Quando um pedido é feito no V MODA BRASIL Marketplace, ele é registrado em marketplace_orders com o campo origin indicando de onde veio o cliente (revista, hotspot ou whatsapp).',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: BarChart3,
    title: '3. Métricas Agregadas',
    description:
      'Os dados são agregados por conteúdo em conversion_metrics: content_id, content_type, period, impressions, clicks, orders, conversion_rate, cta_variant e link_origin.',
    color: 'text-orange-600 bg-orange-50',
  },
  {
    icon: Sparkles,
    title: '4. Relatório e Recomendações',
    description:
      'O Relatório de Funil mostra KPIs, top 10 conteúdos e breakdowns. O agente Conversion analisa os dados e recomenda otimizações de CTA, hotspots e melhorias no funil.',
    color: 'text-purple-600 bg-purple-50',
  },
]

const METRICS = [
  {
    label: 'Taxa de Conversão',
    formula: '(orders / impressions) × 100',
    desc: 'Percentual de leitores que fizeram pedido',
  },
  {
    label: 'CTR (Click-Through Rate)',
    formula: '(clicks / impressions) × 100',
    desc: 'Percentual de leitores que clicaram',
  },
  {
    label: 'Taxa de Conversão de Cliques',
    formula: '(orders / clicks) × 100',
    desc: 'Percentual de cliques que viraram pedido',
  },
]

const ORIGINS = [
  {
    name: 'revista',
    label: 'Revista',
    color: 'border-blue-400',
    textColor: 'text-blue-600',
    desc: 'O leitor acessa o conteúdo diretamente pela revista digital. O CTA direciona para uma página interna ou produto do marketplace. Registrado em link_origin = "revista".',
  },
  {
    name: 'hotspot',
    label: 'Hotspot',
    color: 'border-orange-400',
    textColor: 'text-orange-600',
    desc: 'O leitor clica em um hotspot interativo sobre uma imagem da revista. O hotspot abre um produto ou detalhe. Registrado em link_origin = "hotspot".',
  },
  {
    name: 'whatsapp',
    label: 'WhatsApp',
    color: 'border-green-400',
    textColor: 'text-green-600',
    desc: 'O leitor é direcionado para uma conversa no WhatsApp via link wa.me. Ideal para conversão direta e atendimento personalizado. Registrado em link_origin = "whatsapp".',
  },
]

const AB_TESTING_STEPS = [
  'Cada hotspot e CTA recebe um cta_variant (A, B, C…) que identifica a versão testada.',
  'O funil rastreia cliques, pedidos e taxa de conversão por variante em conversion_metrics.',
  'O relatório de funil mostra a comparação no gráfico "A/B Test — Taxa de Conversão por Variante".',
  'O agente Conversion analisa os dados e recomenda a variante com melhor performance histórica.',
  'O endpoint POST /backend/v1/cta sugere novas variantes baseadas nos dados reais de conversão.',
]

export function AttributionFlowTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Atribuição de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Documentação completa do fluxo de atribuição do funil Revista MODA ATUAL → V MODA BRASIL
            Marketplace. Este conteúdo também está disponível como memória do agente Conversion.
          </p>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i}>
                <div className="flex gap-4 items-start">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${step.color}`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {METRICS.map((m) => (
              <div key={m.label} className="border rounded-lg p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-gray-800">{m.label}</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-orange-600">
                    {m.formula}
                  </code>
                </div>
                <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coleções Envolvidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-blue-400 pl-3">
              <span className="font-mono font-bold text-blue-600">page_hotspots</span>
              <p className="text-gray-600 mt-1">
                Hotspots no leitor imersivo. Campos: link_origin, cta_variant, conversion_rate,
                click_count, title, price, link.
              </p>
            </div>
            <div className="border-l-4 border-green-400 pl-3">
              <span className="font-mono font-bold text-green-600">marketplace_orders</span>
              <p className="text-gray-600 mt-1">
                Pedidos no marketplace. Campo origin indica a origem (revista, hotspot, whatsapp).
              </p>
            </div>
            <div className="border-l-4 border-orange-400 pl-3">
              <span className="font-mono font-bold text-orange-600">conversion_metrics</span>
              <p className="text-gray-600 mt-1">
                Métricas agregadas por conteúdo: content_id, content_type, period, impressions,
                clicks, orders, conversion_rate, cta_variant, link_origin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Origens de Atribuição (link_origin)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ORIGINS.map((o) => (
              <div key={o.name} className={`border-l-4 ${o.color} pl-3`}>
                <span className={`font-mono font-bold ${o.textColor}`}>{o.name}</span>
                <span className="text-gray-500 ml-2">({o.label})</span>
                <p className="text-gray-600 mt-1 text-sm">{o.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>A/B Testing com cta_variant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AB_TESTING_STEPS.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
