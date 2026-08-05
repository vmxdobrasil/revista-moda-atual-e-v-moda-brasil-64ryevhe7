import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowRight, DollarSign, LayoutGrid, Truck, BarChart3 } from 'lucide-react'

const STEPS = [
  {
    icon: FileText,
    title: '1. Proposta',
    desc: 'Selecione um anunciante e campanha na aba Propostas. O sistema faz auto-match com a edição mais relevante, calcula alcance e preço sugerido, e gera o texto comercial via IA.',
  },
  {
    icon: DollarSign,
    title: '2. Contrato',
    desc: 'Após aprovação do anunciante, altere o status da proposta para "contrato" e defina a data de contrato. O preço sugerido pela precificação é persistido na proposta.',
  },
  {
    icon: Truck,
    title: '3. Entrega',
    desc: 'Na aba Entregas, acompanhe o branded content em produção. Defina a data de entrega e atualize o status conforme o conteúdo é produzido e publicado.',
  },
  {
    icon: BarChart3,
    title: '4. Relatório',
    desc: 'Na aba Relatórios, gere o relatório de performance por campanha, agregando alcance (social_posts + editions.view_count), engajamento e CPM.',
  },
]

const FLOWS = [
  {
    icon: ArrowRight,
    title: 'Gerar Proposta',
    desc: 'Aba Propostas → preencha anunciante/campanha → opcionalmente escolha edição e formato → clique "Gerar Proposta". O hook /backend/v1/proposta faz o match, calcula alcance e preço, e gera o texto via IA.',
  },
  {
    icon: DollarSign,
    title: 'Precificar Anúncio',
    desc: 'O hook /backend/v1/precificar calcula o preço sugerido com base no formato (base price), alcance (multiplicador) e posição (ajuste premium/desconto). A justificativa é gerada via IA.',
  },
  {
    icon: LayoutGrid,
    title: 'Gerenciar Inventário',
    desc: 'Aba Inventário lista os espaços publicitários por edição (formato, posição, preço base). Use "Propor" para iniciar uma nova proposta a partir de um espaço.',
  },
]

export function DocumentacaoTab() {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Fluxo de Monetização</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">{s.title}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Como Usar</h3>
          <div className="space-y-4">
            {FLOWS.map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Formatos e Preços Base</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {[
              { f: 'Banner', p: 'R$ 500' },
              { f: 'Capa', p: 'R$ 5.000' },
              { f: 'Página Inteira', p: 'R$ 3.000' },
              { f: 'Sponsored Content', p: 'R$ 2.500' },
              { f: 'Story', p: 'R$ 800' },
              { f: 'Editorial Destaque', p: 'R$ 4.000' },
            ].map((item) => (
              <div key={item.f} className="flex justify-between py-1.5 border-b">
                <span className="text-gray-600">{item.f}</span>
                <span className="font-medium text-gray-700">{item.p}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Preços ajustados por alcance (até +200%) e posição (premium +30%, rodapé -20%).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
