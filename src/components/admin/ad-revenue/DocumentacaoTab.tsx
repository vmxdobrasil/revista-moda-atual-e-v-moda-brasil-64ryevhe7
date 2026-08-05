import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Handshake,
  Package,
  BarChart3,
  FileDown,
  Settings,
  Users,
  Mail,
  FileSignature,
  Clock,
  Globe,
} from 'lucide-react'

const STEPS = [
  {
    icon: FileText,
    title: '1. Proposta',
    desc: 'O anunciante solicita uma proposta comercial. O sistema gera automaticamente um match score, preço sugerido (baseado nas regras de precificação calibradas) e edição recomendada com base no perfil do anunciante e na audiência da edição. A proposta inclui ainda públicos sugeridos calculados a partir dos assinantes ativos.',
  },
  {
    icon: Mail,
    title: '2. Envio por E-mail',
    desc: 'A proposta pode ser enviada por e-mail diretamente do dashboard, usando o mailer SMTP configurado no painel do Skip Cloud. O e-mail inclui todos os dados comerciais, conteúdo gerado por IA e públicos sugeridos. Se o SMTP não estiver configurado, o sistema exibe uma mensagem clara orientando a configuração.',
  },
  {
    icon: FileSignature,
    title: '3. Contrato Digital',
    desc: 'Quando a proposta é aceita, o admin gera um contrato digital com número único, data formal e termos detalhados (partes, escopo, valor, cláusulas). O status transita automaticamente para "contrato". A assinatura digital é registrada no sistema — não há integração com serviços externos de assinatura eletrônica.',
  },
  {
    icon: Handshake,
    title: '4. Contrato',
    desc: 'Após a proposta ser enviada e aceita pelo anunciante, o contrato é gerado com número único, data formal e termos. As datas de contrato e entrega são definidas nesta etapa. A proposta pode ser exportada em HTML/PDF com o bloco de contrato incluído.',
  },
  {
    icon: Package,
    title: '5. Entrega',
    desc: 'O conteúdo patrocinado é produzido e entregue dentro do prazo estabelecido. O status da campanha é acompanhado na aba "Entregas" com controle de prazos e atrasos. Alertas automáticos são gerados para entregas próximas do prazo (7 dias) ou atrasadas.',
  },
  {
    icon: BarChart3,
    title: '6. Relatório',
    desc: 'Após a entrega, o desempenho da campanha é registrado na aba "Relatórios", incluindo alcance, investimento, evolução de views, métricas de engajamento e comparativo entre múltiplas campanhas lado a lado para análise de ROI.',
  },
  {
    icon: Globe,
    title: '7. Acompanhamento Público',
    desc: 'O anunciante pode acompanhar o desempenho de suas campanhas em tempo real através de uma página pública (/public/anunciante), sem necessidade de login. A página exibe alcance, engajamento, status e datas de entrega — sem expor dados internos.',
  },
]

const FEATURES = [
  {
    icon: FileDown,
    title: 'Exportação de Propostas (HTML/PDF)',
    desc: 'Cada proposta pode ser exportada em um documento HTML com a identidade visual da revista, contendo todos os dados comerciais, conteúdo da proposta gerado por IA, públicos sugeridos e bloco de contrato quando aplicável.',
  },
  {
    icon: Settings,
    title: 'Calibração de Precificação',
    desc: 'A aba "Precificação" permite ao administrador editar preços base e multiplicadores (alcance e posição) por formato de anúncio. As regras são armazenadas na coleção ad_pricing_rules e usadas em tempo real pelos hooks /precificar e /proposta.',
  },
  {
    icon: BarChart3,
    title: 'Evolução de Alcance e Comparativo',
    desc: 'A aba "Relatórios" inclui um gráfico de evolução temporal de views e métricas de engajamento por campanha, além de um comparativo lado a lado de múltiplas campanhas no mesmo período, usando dados do social_posts vinculado à edição.',
  },
  {
    icon: Users,
    title: 'Sugestão de Públicos',
    desc: 'Ao gerar uma proposta, o sistema calcula automaticamente públicos sugeridos a partir dos assinantes ativos, agregados por segmento (varejo, atacado, consumidora), incluindo tamanho estimado, score médio de engajamento e principais interesses.',
  },
  {
    icon: Mail,
    title: 'Envio de Proposta por E-mail',
    desc: 'Cada proposta pode ser enviada por e-mail diretamente do dashboard via SMTP configurado no Skip Cloud. O e-mail inclui todos os dados comerciais, conteúdo da proposta e públicos sugeridos em HTML formatado.',
  },
  {
    icon: FileSignature,
    title: 'Contrato Digital',
    desc: 'Propostas aceitas podem gerar contratos digitais com número único (CT-AAAA-NNN), data formal, termos detalhados e cláusulas. A aceitação digital é registrada no sistema, sem necessidade de serviços externos de assinatura.',
  },
  {
    icon: Clock,
    title: 'Alertas de Prazo de Entrega',
    desc: 'O sistema monitora automaticamente os prazos de entrega de campanhas (ad_proposals e advertisements) a cada 6 horas. Entregas próximas do prazo (7 dias) geram notificações de aviso; entregas atrasadas geram alertas. As notificações aparecem em tempo real no módulo Ad Revenue.',
  },
  {
    icon: Globe,
    title: 'Dashboard Público do Anunciante',
    desc: 'Uma página pública (/public/anunciante) permite que anunciantes acompanhem o desempenho de suas campanhas em tempo real, sem login. Exibe apenas dados agregados de read-only (alcance, engajamento, status, datas) — sem expor regras de precificação interna, notas ou dados de outros anunciantes.',
  },
]

export function DocumentacaoTab() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Monetização (Stage 3)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            O módulo Ad Revenue gerencia o ciclo completo de monetização e conteúdo patrocinado da
            Revista MODA ATUAL, desde a proposta inicial até o acompanhamento público pós-entrega. O
            Stage 3 adiciona envio de e-mail, contrato digital, comparativo de campanhas, alertas de
            prazo e dashboard público do anunciante.
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
            <strong>Aceito:</strong> Anunciante aceitou a proposta — pronto para gerar contrato.
          </p>
          <p>
            <strong>Recusado:</strong> Anunciante recusou a proposta.
          </p>
          <p>
            <strong>Contrato:</strong> Contrato digital gerado com número, termos e data formal.
          </p>
          <p>
            <strong>Entregue:</strong> Conteúdo patrocinado entregue e publicado.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Limitações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>SMTP:</strong> O envio de e-mails depende da configuração SMTP no painel do Skip
            Cloud. Se não configurado, o recurso exibe uma mensagem amigável em vez de falhar.
          </p>
          <p>
            <strong>Assinatura digital:</strong> O contrato utiliza aceitação digital registrada na
            plataforma — não há integração com serviços externos como DocuSign, SendGrid ou Twilio.
          </p>
          <p>
            <strong>Dashboard público:</strong> A página pública exibe apenas dados agregados de
            read-only. Dados internos (regras de precificação, notas, match score) não são expostos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
