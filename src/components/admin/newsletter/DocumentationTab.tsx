import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  UserPlus,
  Filter,
  Mail,
  ArrowRight,
  Database,
  Layers,
  BarChart3,
  Calendar,
  GitBranch,
  Zap,
  Sparkles,
} from 'lucide-react'

const SUBSCRIBER_FIELDS = [
  { field: 'name', type: 'text', desc: 'Nome do assinante (opcional).' },
  { field: 'email', type: 'email', desc: 'E-mail único e obrigatório.' },
  { field: 'segment', type: 'select', desc: 'Varejo, Atacado ou Consumidora.' },
  { field: 'interests', type: 'json', desc: 'Lista de interesses (ex: tendências, looks).' },
  { field: 'preferences', type: 'json', desc: 'Preferências de conteúdo e frequência.' },
  { field: 'source', type: 'select', desc: 'Origem do cadastro.' },
  { field: 'engagement_score', type: 'number', desc: 'Score 0–100 calculado por comportamento.' },
  { field: 'status', type: 'select', desc: 'ativo, descadastrado ou inativo.' },
  { field: 'opened_count', type: 'number', desc: 'Total de aberturas de newsletter.' },
  { field: 'clicked_count', type: 'number', desc: 'Total de cliques em links.' },
  { field: 'last_opened_at', type: 'date', desc: 'Data da última abertura.' },
  { field: 'last_clicked_at', type: 'date', desc: 'Data do último clique.' },
  { field: 'unsubscribed_at', type: 'date', desc: 'Data de descadastro, se aplicável.' },
]

const SOURCE_VALUES = [
  { value: 'site', label: 'Site', desc: 'Cadastro direto pelo site da revista.' },
  { value: 'indicacao', label: 'Indicação', desc: 'Indicação por outra leitora.' },
  { value: 'importacao', label: 'Importação', desc: 'Importação manual de listas.' },
  { value: 'social', label: 'Social', desc: 'Captura via redes sociais.' },
  { value: 'admin', label: 'Admin', desc: 'Cadastro manual pelo administrador.' },
]

const SEGMENT_VALUES = [
  { value: 'varejo', label: 'Varejo', color: 'bg-orange-100 text-orange-700' },
  { value: 'atacado', label: 'Atacado', color: 'bg-purple-100 text-purple-700' },
  { value: 'consumidora', label: 'Consumidora', color: 'bg-blue-100 text-blue-700' },
]

const STATUS_VALUES = [
  { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-700' },
  { value: 'descadastrado', label: 'Descadastrado', color: 'bg-red-100 text-red-700' },
  { value: 'inativo', label: 'Inativo', color: 'bg-gray-100 text-gray-700' },
]

const SEGMENTAR_FILTERS = [
  { param: 'segment', desc: 'Filtra por segmento (varejo, atacado, consumidora ou todos).' },
  { param: 'status', desc: 'Filtra por status (ativo, descadastrado, inativo).' },
  { param: 'interests', desc: 'Lista de interesses para buscar (correspondência parcial).' },
  { param: 'engagement_period_days', desc: 'Período em dias para analisar engajamento social.' },
  { param: 'behavior_days', desc: 'Dias de comportamento ativo (abertura + clique).' },
  {
    param: 'min_engagement_rate',
    desc: 'Taxa mínima de engajamento social (%) para incluir posts.',
  },
  { param: 'min_engagement', desc: 'Métrica mínima (views) para considerar posts relevantes.' },
  { param: 'min_engagement_score', desc: 'Score mínimo do assinante para inclusão.' },
]

const SEGMENTAR_OUTPUT = [
  { field: 'total', desc: 'Número total de assinantes no segmento.' },
  { field: 'by_segment', desc: 'Distribuição por segmento.' },
  { field: 'by_status', desc: 'Distribuição por status.' },
  { field: 'by_interest', desc: 'Distribuição por interesse declarado.' },
  { field: 'engagement_breakdown', desc: 'Alta (≥70), Média (≥35), Baixa (<35).' },
  { field: 'avg_engagement_score', desc: 'Score médio do segmento retornado.' },
  { field: 'avg_social_engagement_rate', desc: 'Taxa de engajamento social médio no período.' },
  {
    field: 'updated_engagement_scores',
    desc: 'Quantidade de scores atualizados com dados sociais.',
  },
  {
    field: 'recommended_editions',
    desc: 'Top 5 edições por match de interesse + performance social.',
  },
  { field: 'ids', desc: 'Lista de IDs dos assinantes segmentados.' },
]

const CAMPAIGN_FLOW = [
  {
    status: 'rascunho',
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-700',
    desc: 'Criada, aguardando revisão.',
  },
  {
    status: 'em_revisao',
    label: 'Em Revisão',
    color: 'bg-blue-100 text-blue-700',
    desc: 'Sendo revisada editorialmente.',
  },
  {
    status: 'aprovado',
    label: 'Aprovado',
    color: 'bg-green-100 text-green-700',
    desc: 'Revisada e pronta para agendar.',
  },
  {
    status: 'agendado',
    label: 'Agendado',
    color: 'bg-yellow-100 text-yellow-700',
    desc: 'Data de envio definida.',
  },
  {
    status: 'enviado',
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-700',
    desc: 'Newsletter enviada às leitoras.',
  },
  {
    status: 'falhou',
    label: 'Falhou',
    color: 'bg-red-100 text-red-700',
    desc: 'Falha no envio — revisar e reenviar.',
  },
]

const CAMPAIGN_FIELDS = [
  { field: 'title', desc: 'Título interno da campanha.' },
  { field: 'subject', desc: 'Linha de assunto do e-mail (máx 60 caracteres).' },
  { field: 'preheader', desc: 'Pré-visualização curta (máx 100 caracteres).' },
  { field: 'content', desc: 'JSON com header, intro, seções e CTA.' },
  { field: 'edition', desc: 'Relação com a edição da revista (opcional).' },
  { field: 'segments', desc: 'Array de segmentos alvo (varejo, atacado, consumidora).' },
  { field: 'audience_size', desc: 'Tamanho do público segmentado.' },
  { field: 'scheduled_at', desc: 'Data/hora de agendamento.' },
  { field: 'send_date', desc: 'Data/hora de envio efetivo.' },
  { field: 'opened_count', desc: 'Total de aberturas registradas.' },
  { field: 'open_rate', desc: 'Taxa de abertura (%).' },
  { field: 'click_count', desc: 'Total de cliques em links.' },
  { field: 'click_rate', desc: 'Taxa de cliques (%).' },
  { field: 'unsubscribe_count', desc: 'Total de descadastros gerados.' },
]

const SEQUENCE_STATUSES = [
  { value: 'rascunho', label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  { value: 'ativo', label: 'Ativo', color: 'bg-green-100 text-green-700' },
  { value: 'pausado', label: 'Pausado', color: 'bg-yellow-100 text-yellow-700' },
]

const TRACKED_METRICS = [
  { metric: 'Open Rate', desc: 'Percentual de aberturas sobre o total enviado.' },
  { metric: 'Click Rate', desc: 'Percentual de cliques sobre o total enviado.' },
  { metric: 'Retenção', desc: 'Manutenção de assinantes ativos ao longo do tempo.' },
  { metric: 'Descadastros', desc: 'Quantidade de leitoras que cancelaram a inscrição.' },
  {
    metric: 'Relatório Mensal',
    desc: 'Consolidação de growth, engajamento e performance por segmento.',
  },
]

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-orange-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

export function DocumentationTab() {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-none bg-gradient-to-r from-orange-50 to-purple-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Documentação do Audience Nurture</h2>
          </div>
          <p className="text-sm text-gray-600 max-w-3xl">
            Guia completo do fluxo de captura, segmentação e nutrição de leitoras da Revista MODA
            ATUAL. Esta documentação descreve como os assinantes entram na base, como audiências são
            construídas e como o ciclo de newsletters funciona do rascunho ao envio.
          </p>
        </CardContent>
      </Card>

      {/* === CAPTURE FLOW === */}
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionHeader
            icon={UserPlus}
            title="1. Captura de Assinantes"
            subtitle="Como as leitoras entram e são armazenadas na base."
          />
          <p className="text-sm text-gray-600 mb-4">
            A coleção{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              subscribers
            </code>{' '}
            é o repositório central de todas as leitoras. Cada registro contém dados demográficos,
            preferências, origem do cadastro e métricas de engajamento que alimentam a segmentação e
            a nutrição.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Campo</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {SUBSCRIBER_FIELDS.map((f) => (
                  <tr
                    key={f.field}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-2 px-3 font-mono text-xs text-orange-600">{f.field}</td>
                    <td className="py-2 px-3">
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {f.type}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Segmentos</p>
              <div className="flex flex-wrap gap-2">
                {SEGMENT_VALUES.map((s) => (
                  <Badge key={s.value} variant="secondary" className={s.color}>
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_VALUES.map((s) => (
                  <Badge key={s.value} variant="secondary" className={s.color}>
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Fontes de Captura</p>
              <div className="flex flex-wrap gap-2">
                {SOURCE_VALUES.map((s) => (
                  <Badge key={s.value} variant="secondary" className="bg-cyan-100 text-cyan-700">
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Detalhamento das Fontes (source)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SOURCE_VALUES.map((s) => (
                <div key={s.value} className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs font-mono shrink-0">
                    {s.value}
                  </Badge>
                  <span className="text-xs text-gray-500">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === SEGMENTATION FLOW === */}
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionHeader
            icon={Filter}
            title="2. Segmentação de Audiência"
            subtitle="Como audiências são construídas via o hook /segmentar."
          />
          <p className="text-sm text-gray-600 mb-4">
            O endpoint{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              POST /backend/v1/segmentar
            </code>{' '}
            aplica filtros combinados sobre a base de assinantes, enriquece os scores de engajamento
            com dados de performance social e retorna um perfil completo do segmento, incluindo
            edições recomendadas.
          </p>

          <div className="p-4 bg-orange-50 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-gray-700">Filtros Disponíveis</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-orange-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Parâmetro</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {SEGMENTAR_FILTERS.map((f) => (
                    <tr key={f.param} className="border-b border-orange-100">
                      <td className="py-2 px-3 font-mono text-xs text-orange-600 whitespace-nowrap">
                        {f.param}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-semibold text-gray-700">Resultado da Segmentação</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SEGMENTAR_OUTPUT.map((o) => (
                <div key={o.field} className="flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-purple-400 mt-1 shrink-0" />
                  <div>
                    <code className="text-xs font-mono text-purple-600">{o.field}</code>
                    <span className="text-xs text-gray-500 ml-2">{o.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-gray-700">Edições Recomendadas</p>
            </div>
            <p className="text-xs text-gray-600">
              O algoritmo cruza os interesses dos assinantes segmentados com a performance dos posts
              sociais (engagement_rate, views) por edição, calculando um{' '}
              <strong>match_score</strong>. As 5 edições com melhor combinação de engajamento social
              + match de interesse são retornadas para orientar a criação de newsletters relevantes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* === NURTURE FLOW === */}
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6">
          <SectionHeader
            icon={Mail}
            title="3. Nutrição via Newsletter"
            subtitle="Ciclo de vida de campanhas, geração via IA e sequências de nutrição."
          />

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Ciclo de Status da Campanha</p>
            <div className="flex flex-wrap items-center gap-2">
              {CAMPAIGN_FLOW.map((s, i) => (
                <div key={s.status} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="secondary" className={s.color}>
                      {s.label}
                    </Badge>
                    <span className="text-[10px] text-gray-400 max-w-[100px] text-center leading-tight">
                      {s.desc}
                    </span>
                  </div>
                  {i < CAMPAIGN_FLOW.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Campos da Campanha</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Campo</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700">Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGN_FIELDS.map((f) => (
                    <tr
                      key={f.field}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-2 px-3 font-mono text-xs text-orange-600 whitespace-nowrap">
                        {f.field}
                      </td>
                      <td className="py-2 px-3 text-gray-600">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <p className="text-sm font-semibold text-gray-700">
                Geração de Newsletter via /newsletter
              </p>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              O endpoint{' '}
              <code className="text-xs bg-white px-1.5 py-0.5 rounded font-mono text-orange-600">
                POST /backend/v1/newsletter
              </code>{' '}
              gera o conteúdo editorial de uma newsletter em rascunho usando IA. Pode ser executado
              de duas formas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Por Edição</p>
                <p className="text-xs text-gray-500">
                  Informe <code className="font-mono text-orange-600">edition_id</code> para gerar a
                  newsletter baseada nas páginas, hotspots e produtos de uma edição específica.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Por Semana</p>
                <p className="text-xs text-gray-500">
                  Sem <code className="font-mono text-orange-600">edition_id</code>, o sistema busca
                  edições da semana atual ou a mais recente para compor o conteúdo.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-semibold text-gray-700">Sequências de Nutrição</p>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Sequências automatizadas que enviam uma série de e-mails baseados em um gatilho
              (trigger). Cada sequência contém múltiplos passos (steps) com dia, assunto e resumo do
              conteúdo.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Trigger</p>
                <p className="text-xs text-gray-500">
                  Evento que inicia a sequência (ex: novo cadastro, primeira compra).
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Steps</p>
                <p className="text-xs text-gray-500">
                  Array de passos com <code className="font-mono text-purple-600">day</code>,{' '}
                  <code className="font-mono text-purple-600">subject</code> e{' '}
                  <code className="font-mono text-purple-600">content_summary</code>.
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">Status</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {SEQUENCE_STATUSES.map((s) => (
                    <Badge key={s.value} variant="secondary" className={`text-xs ${s.color}`}>
                      {s.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-semibold text-gray-700">Métricas Acompanhadas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TRACKED_METRICS.map((m) => (
                <div key={m.metric} className="flex items-start gap-2 bg-white rounded-lg p-3">
                  <ArrowRight className="w-3 h-3 text-blue-400 mt-1 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{m.metric}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
