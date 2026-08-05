import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Handshake, Package, BarChart3, FileDown, Settings, Users } from 'lucide-react'

const STEPS = [
  {
    icon: FileText,
    title: '1. Proposta',
    desc: 'O anunciante solicita uma proposta comercial. O sistema gera automaticamente um match score, preço sugerido (baseado nas regras de precificação calibradas) e edição recomendada com base no perfil do anunciante e na audiência da edição. A proposta inclui ainda públicos sugeridos calculados a partir dos assinantes ativos.',
  },
  {
    icon: Handshake,
    title: '2. Contrato',
    desc: 'Após a proposta ser enviada e aceita pelo anunciante, o status é atualizado para "contrato". As datas de contrato e entrega são definidas nesta etapa. A proposta pode ser exportada em HTML/PDF para envio ao anunciante.',
  },
  {
    icon: Package,
    title: '3. Entrega',
    desc: 'O conteúdo patrocinado é produzido e entregue dentro do prazo estabelecido. O status da campanha é acompanhado na aba "Entregas" com controle de prazos e atrasos.',
  },
  {
    icon: BarChart3,
    title: '4. Relatório',
    desc: 'Após a entrega, o desempenho da campanha é registrado na aba "Relatórios", incluindo alcance, investimento, evolução de views e métricas de engajamento ao longo do tempo para análise de ROI.',
  },
]

const FEATURES = [
  {
    icon: FileDown,
    title: 'Exportação de Propostas (HTML/PDF)',
    desc: 'Cada proposta pode ser exportada em um documento HTML com a identidade visual da revista, contendo todos os dados comerciais, conteúdo da proposta gerado por IA e públicos sugeridos. O documento pode ser impresso ou salvo como PDF diretamente pelo navegador, sem dependências externas.',
  },
  {
    icon: Settings,
    title: 'Calibração de Precificação',
    desc: 'A aba "Precificação" permite ao administrador editar preços base e multiplicadores (alcance e posição) por formato de anúncio. As regras são armazenadas na coleção ad_pricing_rules e usadas em tempo real pelos hooks /precificar e /proposta para calcular preços sugeridos.',
  },
  {
    icon: BarChart3,
    title: 'Evolução de Alcance',
    desc: 'A aba "Relatórios" inclui um gráfico de evolução temporal de views e métricas de engajamento (likes, comentários, shares, saves, remixes e taxa de engajamento) por proposta/campanha, extraídos dos social_posts vinculados à edição da proposta.',
  },
  {
    icon: Users,
    title: 'Sugestão de Públicos',
    desc: 'Ao gerar uma proposta, o sistema calcula automaticamente públicos sugeridos a partir dos assinantes ativos, agregados por segmento (varejo, atacado, consumidora), incluindo tamanho estimado, score médio de engajamento e principais interesses. Os públicos são exibidos no detalhe da proposta e no documento exportado.',
  },
]

export function DocumentacaoTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Monetização</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            O módulo Ad Revenue gerencia o ciclo completo de monetização e conteúdo patrocinado da
            Revista MODA ATUAL, desde a proposta inicial até o relatório de desempenho pós-entrega.
          </p>
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 shrink-0">
                    <step.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capacidades do Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 shrink-0">
                  <f.icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status das Propostas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Rascunho:</strong> Proposta criada, ainda em elaboração.
          </p>
          <p>
            <strong>Enviado:</strong> Proposta enviada ao anunciante, aguardando resposta.
          </p>
          <p>
            <strong>Aceito:</strong> Anunciante aceitou a proposta.
          </p>
          <p>
            <strong>Recusado:</strong> Anunciante recusou a proposta.
          </p>
          <p>
            <strong>Contrato:</strong> Contrato assinado, campanha confirmada.
          </p>
          <p>
            <strong>Entregue:</strong> Conteúdo patrocinado entregue e publicado.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formatos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Banner:</strong> Banner publicitário em páginas da edição.
          </p>
          <p>
            <strong>Capa:</strong> Patrocínio da capa da edição.
          </p>
          <p>
            <strong>Página Inteira:</strong> Página publicitária inteira.
          </p>
          <p>
            <strong>Conteúdo Patrocinado:</strong> Artigo ou matéria patrocinada.
          </p>
          <p>
            <strong>Story:</strong> Story no Instagram ou plataforma similar.
          </p>
          <p>
            <strong>Editorial Destaque:</strong> Destaque editorial com branding.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
