import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Database, Bell, FileBarChart, GitBranch, Brain, Link2 } from 'lucide-react'

const STEPS = [
  {
    icon: Eye,
    title: '1. Monitoramento',
    desc: 'Concorrentes são cadastrados na coleção competitors com métricas de performance (seguidores, engajamento, frequência de posts, temas de conteúdo). Sinais de mercado são capturados manualmente ou via integrações e armazenados em market_signals.',
  },
  {
    icon: Database,
    title: '2. Armazenamento',
    desc: 'Cada sinal inclui tipo (tendência, alerta de concorrente, menção de marca, comportamento do consumidor), severidade (info, atenção, crítico), status (novo, em análise, notificado, arquivado) e dados relacionados. O campo vector habilita busca semântica.',
  },
  {
    icon: Bell,
    title: '3. Alerta',
    desc: 'Sinais críticos e de atenção são destacados no dashboard. O endpoint /backend/v1/alertas permite filtrar por tipo, severidade, status, concorrente e período. Notificações em tempo real mantêm a interface sincronizada.',
  },
  {
    icon: FileBarChart,
    title: '4. Relatório',
    desc: 'O endpoint /backend/v1/concorrentes gera um relatório comparativo com ranking de engajamento. O agente Market Watch consolida dados em um relatório mensal de inteligência competitiva com recomendações acionáveis.',
  },
  {
    icon: GitBranch,
    title: '5. Integração',
    desc: 'Insights são compartilhados com o Fashion Trend Advisor (enriquecimento de análise), Trend Researcher (contexto de mercado em relatórios) e Social Analytics (benchmarks comparativos).',
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
    fields: 'signal_type, title, severity, status, detected_at, vector',
  },
]

const INTEGRATIONS = [
  {
    icon: Brain,
    title: 'Fashion Trend Advisor',
    desc: 'O agente agora tem acesso de leitura às coleções competitors e market_signals, permitindo referenciar dados competitivos em suas análises.',
  },
  {
    icon: FileBarChart,
    title: 'Trend Researcher',
    desc: 'Relatórios de tendência incluem contexto de mercado (concorrentes e sinais recentes) para enriquecer as recomendações.',
  },
  {
    icon: Link2,
    title: 'Social Analytics',
    desc: 'O módulo de Social Analytics exibe benchmarks comparativos entre o desempenho da revista e os concorrentes monitorados.',
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
            geração de inteligência.
          </p>
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
            — Relatório comparativo de concorrentes com ranking.
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/alertas
            </code>{' '}
            — Sinais de mercado com filtros por tipo, severidade, status e período.
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              GET /backend/v1/market-benchmarks
            </code>{' '}
            — Benchmarks comparativos entre revista e concorrentes.
          </p>
          <p>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-orange-600">
              POST /backend/v1/market-watch-agent-stream
            </code>{' '}
            — Chat com o agente Market Watch.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
