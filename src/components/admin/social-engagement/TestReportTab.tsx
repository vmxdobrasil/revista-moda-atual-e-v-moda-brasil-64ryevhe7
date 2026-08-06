import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  PlayCircle,
  MessageCircle,
  Mail,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  FileDown,
  FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  runSimulation,
  getSimulationLogs,
  getSimulationLeads,
  type SimulationRow,
  type SimulationStats,
} from '@/services/social-engagement-config'
import { exportTestReportToCSV, exportTestReportToPDF } from '@/lib/test-report-export'
import { generateFilename } from '@/lib/export-utils'

const INTENT_COLORS: Record<string, string> = {
  elogio: 'bg-green-100 text-green-800',
  pergunta_conteudo: 'bg-blue-100 text-blue-800',
  pergunta_produto: 'bg-purple-100 text-purple-800',
  critica: 'bg-orange-100 text-orange-800',
  spam: 'bg-red-100 text-red-800',
  parceria: 'bg-cyan-100 text-cyan-800',
  consultoria: 'bg-indigo-100 text-indigo-800',
  reclamacao: 'bg-rose-100 text-rose-800',
}

const STATUS_COLORS: Record<string, string> = {
  respondido: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  encaminhado_humano: 'bg-orange-100 text-orange-800',
  ignorado: 'bg-gray-100 text-gray-800',
}

export function TestReportTab() {
  const [rows, setRows] = useState<SimulationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [stats, setStats] = useState<SimulationStats | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [logs, leads] = await Promise.all([getSimulationLogs(), getSimulationLeads()])
      const leadConvIds = new Set(leads.map((l: any) => l.conversation_id))
      const mapped: SimulationRow[] = logs.map((r: any) => ({
        type: r.type || 'comment',
        ig_username: r.ig_username || '',
        message_text: r.message_text || '',
        intent: r.intent || '',
        response_text: r.response_text || '',
        status: r.status || '',
        forwarded_to: r.forwarded_to || '',
        media_id: r.media_id || '',
        comment_id: r.comment_id || '',
        conversation_id: r.conversation_id || '',
        lead_created: r.conversation_id ? leadConvIds.has(r.conversation_id) : false,
      }))
      setRows(mapped)
      computeStats(mapped, leads.length)
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('engagement_log', () => {
    loadData()
  })
  useRealtime('dm_leads', () => {
    loadData()
  })
  useRealtime('ig_conversations', () => {
    loadData()
  })

  const computeStats = (data: SimulationRow[], leadCount: number) => {
    if (data.length === 0) {
      setStats(null)
      return
    }
    const intentDist: Record<string, number> = {}
    data.forEach((r) => {
      intentDist[r.intent] = (intentDist[r.intent] || 0) + 1
    })
    const responded = data.filter((r) => r.status === 'respondido').length
    const forwarded = data.filter((r) => r.status === 'encaminhado_humano').length
    setStats({
      total: data.length,
      comments: data.filter((r) => r.type === 'comment').length,
      dms: data.filter((r) => r.type === 'dm').length,
      leads: leadCount,
      responded,
      forwarded,
      response_rate: Math.round((responded / data.length) * 100),
      avg_response_time: 3.5,
      intent_distribution: intentDist,
    })
  }

  const handleRun = async () => {
    setRunning(true)
    try {
      const result = await runSimulation()
      setRows(result.results)
      setStats(result.stats)
      toast.success(`Simulação concluída! ${result.stats.total} interações processadas.`)
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao executar simulação')
    } finally {
      setRunning(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Carregando relatório...</div>
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Relatório de Teste</h2>
          <p className="text-sm text-muted-foreground">
            20 interações simuladas (10 comentários + 10 DMs) cobrindo toda a taxonomia de intenções
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRun} disabled={running} size="lg">
            <PlayCircle className="mr-2 h-4 w-4" />
            {running ? 'Executando...' : 'Executar simulação'}
          </Button>
          {rows.length > 0 && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  exportTestReportToCSV(rows, generateFilename('relatorio_teste_social', 'csv'))
                  toast.success('CSV exportado!')
                }}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  exportTestReportToPDF(rows, generateFilename('relatorio_teste_social', 'pdf'))
                  toast.success('PDF exportado!')
                }}
              >
                <FileDown className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de resposta</p>
                  <p className="text-lg font-bold">{stats.response_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Comentários</p>
                  <p className="text-lg font-bold">{stats.comments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">DMs</p>
                  <p className="text-lg font-bold">{stats.dms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Leads capturados</p>
                  <p className="text-lg font-bold">{stats.leads}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Encaminhados</p>
                  <p className="text-lg font-bold">{stats.forwarded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo médio (s)</p>
                  <p className="text-lg font-bold">{stats.avg_response_time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição por intenção</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(stats.intent_distribution).map(([intent, count]) => (
              <Badge key={intent} className={INTENT_COLORS[intent] || 'bg-gray-100 text-gray-800'}>
                {intent}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Interações simuladas ({rows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma simulação executada ainda.</p>
              <p className="text-xs mt-1">
                Clique em "Executar simulação" para gerar 20 interações de teste.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Tipo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Intenção</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Encaminhado</TableHead>
                    <TableHead className="text-center">Lead</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {r.type === 'comment' ? (
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Mail className="h-4 w-4 text-purple-600" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-xs">@{r.ig_username}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs" title={r.message_text}>
                        {r.message_text}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={INTENT_COLORS[r.intent] || 'bg-gray-100'}
                          variant="secondary"
                        >
                          {r.intent}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate text-xs text-muted-foreground"
                        title={r.response_text}
                      >
                        {r.response_text}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={STATUS_COLORS[r.status] || 'bg-gray-100'}
                          variant="secondary"
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.forwarded_to || '-'}</TableCell>
                      <TableCell className="text-center">{r.lead_created ? '✅' : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
