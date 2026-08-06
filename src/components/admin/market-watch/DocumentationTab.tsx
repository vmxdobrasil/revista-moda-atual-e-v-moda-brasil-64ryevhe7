import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Eye,
  Database,
  Bell,
  FileBarChart,
  GitBranch,
  Brain,
  Link2,
  ShieldCheck,
  Search,
  Layers,
  Lock,
} from 'lucide-react'

const STEPS = [
  {
    icon: Eye,
    title: '1. Monitoramento',
    desc: 'Concorrentes são cadastrados na coleção competitors com métricas de performance (seguidores, engajamento, frequência de posts, temas de conteúdo). Sinais de mercado são capturados manualmente ou via integrações e armazenados em market_signals.',
  },
  {
    icon: Database,
    title: '2. Armazenamento',
    desc: 'Cada sinal inclui tipo (tendência, alerta de concorrente, menção de marca, comportamento do consumidor), severidade (info, atenção, crítico), status (novo, em análise, notificado, arquivado) e dados relacionados. O campo embedding (vector 1536d) habilita busca semântica.',
  },
  {
    icon: Bell,
    title: '3. Alerta',
    desc: 'Sinais críticos e de atenção são destacados no dashboard. O endpoint /backend/v1/alertas permite filtrar por tipo, severidade, status, concorrente e período. Notificações em tempo real via SSE mantêm a interface sincronizada.',
  },
  {
    icon: FileBarChart,
    title: '4. Relatório',
    desc: 'O endpoint /backend/v1/concorrentes gera um relatório comparativo com ranking de engajamento. O agente Market Watch consolida dados em um relatório mensal de inteligência competitiva com recomendações acionáveis.',
  },
  {
    icon: GitBranch,
    title: '5. Integração',
    desc: 'Insights são compartilhados com o Fashion Trend Advisor (enriquecimento de análise), Trend Researcher (contexto de mercado em relatórios) e Social Analytics (benchmarks comparativos por plataforma).',
  },
]

const COLLECTIONS = [
  {
    name: 'competitors',
    desc: 'Perfis e métricas de concorrentes monitorados',
    fields: 'name, platform, followers, engagement_rate, post_frequency, content_themes',
  },
  {
    name: 'market_signals',
    desc: 'Sinais e alertas de mercado capturados',
    fields: 'signal_type, title, severity, status, detected_at, embedding (vector 1536d)',
  },
]

const INTEGRATIONS = [
  {
    icon: Brain,
    title: 'Fashion Trend Advisor',
    desc: 'O agente tem acesso de leitura às coleções competitors e market_signals. O hook /backend/v1/agents/fashion-trend-advisor/chat enriquece cada mensagem com sinais recentes e top concorrentes, permitindo citar movimentos competitivos nas análises.',
  },
  {
    icon: FileBarChart,
    title: 'Trend Researcher',
    desc: 'Relatórios de tendência incluem contexto de mercado (concorrentes e sinais recentes) para enriquecer as recomendações. Cada tendência pode ser vinculada aos sinais de mercado que a originaram.',
  },
  {
    icon: Link2,
    title: 'Social Analytics',
    desc: 'O módulo de Social Analytics exibe benchmarks comparativos entre o desempenho da revista e os concorrentes monitorados, com quebra por plataforma (instagram, facebook, youtube, whatsapp) via /backend/v1/market-benchmarks e /backend/v1/market-watch/benchmarks.',
  },
]

const SECURITY_NOTES = [
  {
    icon: Lock,
    title: 'Autenticação Administrativa',
    desc: 'Todas as rotas do Market Watch (/backend/v1/concorrentes, /backend/v1/alertas, /backend/v1/market-benchmarks, /backend/v1/market-watch-agent-stream) exigem autenticação ($apis.requireAuth). Apenas usuários autenticados podem acessar os dados.',
  },
  {
    icon: ShieldCheck,
    title: 'Portal Público Isolado',
    desc: 'O portal do anunciante (/public/anunciante) não tem acesso aos dados de Market Watch. As coleções competitors e market_signals possuem regras de acesso que exigem autenticação (listRule e viewRule = "@request.auth.id != \'\'"). Nenhum dado competitivo é exposto publicamente.',
  },
  {
    icon: Search,
    title: 'Busca Semântica Protegida',
    desc: 'O endpoint /backend/v1/market-signals-search utiliza $vectors.search sobre o campo embedding, herdando as regras de acesso da coleção market_signals. Apenas usuários autenticados podem realizar buscas semânticas.',
  },
]

export function DocumentationTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="rounded-xl border-none bg-gradient-to-r from-orange-50 to-blue-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Market Watch — Intelligence</h2>
          </div>
          <p className="text-sm text-gray-600">
            Documentação do fluxo de monitoramento competitivo, captura de sinais de mercado e
            geração de inteligência. Todo o módulo é protegido por autenticação administrativa.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Segurança e Controle de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SECURITY_NOTES.map((note, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 shrink-0">
                <note.icon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{note.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{note.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent>
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
          <CardTitle>Coleções de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {COLLECTIONS.map((c) => (
            <div key={c.name} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-mono text-xs">
                  {c.name}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Auth required
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{c.desc}</p>
              <p className="text-xs text-gray-400">
                <strong>Campos principais:</strong> {c.fields}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {INTEGRATIONS.map((int, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 shrink-0">
                  <int.icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{int.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{int.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/concorrentes
            </code>{' '}
            — Relatório comparativo de concorrentes com ranking e filtros (platform, category, sort,
            limit).
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/alertas
            </code>{' '}
            — Sinais de mercado com filtros por tipo, severidade, status, concorrente e período.
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/market-benchmarks
            </code>{' '}
            — Benchmarks comparativos entre revista e concorrentes (engajamento, frequência,
            seguidores).
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/market-watch/benchmarks
            </code>{' '}
            — Benchmarks detalhados com comparação de engajamento vs média concorrentes.
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/market-watch/per-platform
            </code>{' '}
            — Métricas comparativas agrupadas por plataforma (instagram, facebook, youtube, tiktok,
            site).
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              POST /backend/v1/market-signals-search
            </code>{' '}
            — Busca semântica em sinais de mercado via embeddings (vector 1536d, cosine distance).
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              POST /backend/v1/market-watch-agent-stream
            </code>{' '}
            — Chat com streaming do agente Market Watch (SSE).
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              POST /backend/v1/agents/fashion-trend-advisor/chat
            </code>{' '}
            — Chat do Fashion Trend Advisor com enriquecimento automático de dados de Market Watch.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            Validação de Parâmetros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Todos os hooks validam os parâmetros de entrada antes de executar consultas. Parâmetros
            inválidos retornam HTTP 400 com mensagens claras indicando o campo e os valores
            esperados. Não há falhas silenciosas — qualquer erro é logado via{' '}
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
              $app.logger()
            </code>{' '}
            e retornado ao cliente.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              platform: instagram | facebook | youtube | tiktok | site
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              sort: followers | engagement_rate | post_frequency
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              signal_type: tendencia | alerta_concorrente | mencao_marca | comportamento_consumidor
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              severity: info | atencao | critico
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
              status: novo | em_analise | notificado | arquivado
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
