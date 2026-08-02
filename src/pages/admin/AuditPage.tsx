import { useState, useEffect, useCallback } from 'react'
import { getAuditReport, type AuditReport } from '@/services/audit'
import { AuditDataTable, StatusBadge, PriorityBadge } from '@/components/audit/AuditDataTable'
import { AuditHistory } from '@/components/audit/AuditHistory'
import { exportAuditToCSV, exportAuditToPDF, exportAuditToTXT } from '@/lib/audit-export'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, Download, FileText, FileSpreadsheet, FileType, ArrowLeft } from 'lucide-react'

const indisponivel = 'indisponível'

export default function AuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHistorical, setIsHistorical] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setIsHistorical(false)
    try {
      setReport(await getAuditReport())
    } catch (err) {
      console.error('Failed to load audit report:', err)
      setError(err instanceof Error ? err.message : 'Falha ao gerar relatório.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleViewHistorical = (historicalReport: AuditReport) => {
    setReport(historicalReport)
    setIsHistorical(true)
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  if (error) return <div className="text-red-500">{error}</div>
  if (!report) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-orange-500" /> Auditoria do Sistema
          </h2>
          <p className="text-gray-500 mt-1">
            {isHistorical ? 'Relatório Histórico — ' : ''}
            Gerado em {new Date(report.generatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isHistorical && (
            <Button onClick={load} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Relatório Atual
            </Button>
          )}
          <Button onClick={() => exportAuditToCSV(report)} variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={() => exportAuditToPDF(report)} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> PDF
          </Button>
          <Button onClick={() => exportAuditToTXT(report)} variant="outline" className="gap-2">
            <FileType className="w-4 h-4" /> TXT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="collections">
        <TabsList className="flex-wrap">
          <TabsTrigger value="collections">Coleções ({report.collections.length})</TabsTrigger>
          <TabsTrigger value="hooks">Hooks ({report.hooks.length})</TabsTrigger>
          <TabsTrigger value="agents">Agentes ({report.agents.length})</TabsTrigger>
          <TabsTrigger value="delivery">Fila de Entrega</TabsTrigger>
          <TabsTrigger value="divergences">Divergências</TabsTrigger>
          <TabsTrigger value="fix">Correções</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="collections">
          <Card>
            <CardContent className="p-4">
              <AuditDataTable
                columns={[
                  { key: 'name', label: 'Coleção' },
                  { key: 'count', label: 'Registros' },
                  {
                    key: 'lastRecord',
                    label: 'Último Registro',
                    render: (v) => (v ? new Date(v).toLocaleString('pt-BR') : indisponivel),
                  },
                  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                  {
                    key: 'priority',
                    label: 'Prioridade',
                    render: (v) => <PriorityBadge priority={v} />,
                  },
                ]}
                data={report.collections}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks">
          <Card>
            <CardContent className="p-4">
              <AuditDataTable
                columns={[
                  { key: 'name', label: 'Integração' },
                  { key: 'type', label: 'Tipo' },
                  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                  {
                    key: 'lastExecution',
                    label: 'Última Execução',
                    render: (v) => (v ? new Date(v).toLocaleString('pt-BR') : indisponivel),
                  },
                  { key: 'deps', label: 'Dependências' },
                  {
                    key: 'priority',
                    label: 'Prioridade',
                    render: (v) => <PriorityBadge priority={v} />,
                  },
                ]}
                data={report.hooks}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardContent className="p-4">
              <AuditDataTable
                columns={[
                  { key: 'name', label: 'Agente' },
                  { key: 'description', label: 'Descrição' },
                  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                  {
                    key: 'lastExecution',
                    label: 'Última Execução',
                    render: (v) => (v ? new Date(v).toLocaleString('pt-BR') : indisponivel),
                  },
                  {
                    key: 'priority',
                    label: 'Prioridade',
                    render: (v) => <PriorityBadge priority={v} />,
                  },
                ]}
                data={report.agents}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <StatusBadge status={report.deliveryQueue.healthStatus} />
                <span className="text-sm text-gray-500">
                  Total: {report.deliveryQueue.total} | Pendentes: {report.deliveryQueue.pending}
                </span>
                <span className="text-sm text-gray-500">
                  Tempo Médio: {report.deliveryQueue.avgProcessingTime || indisponivel}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(report.deliveryQueue.byStatus).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-800">{v}</p>
                    <p className="text-xs text-gray-500">{k}</p>
                  </div>
                ))}
              </div>
              {report.deliveryQueue.items.length > 0 && (
                <AuditDataTable
                  columns={[
                    { key: 'theme', label: 'Tema' },
                    { key: 'status', label: 'Status' },
                    {
                      key: 'processingTime',
                      label: 'Tempo de Processamento',
                    },
                    {
                      key: 'created',
                      label: 'Criado',
                      render: (v) => (v ? new Date(v).toLocaleString('pt-BR') : indisponivel),
                    },
                    {
                      key: 'priority',
                      label: 'Prioridade',
                      render: (v) => <PriorityBadge priority={v} />,
                    },
                    {
                      key: 'error_note',
                      label: 'Erro',
                      render: (v) => (v ? <span className="text-red-500 text-xs">{v}</span> : '—'),
                    },
                  ]}
                  data={report.deliveryQueue.items}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="divergences">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold">
                  Hooks: {report.hooksDivergence.documented} documentados →{' '}
                  {report.hooksDivergence.found} encontrados
                </h3>
                {report.hooksDivergence.additional.map((h) => (
                  <div key={h.name} className="border-l-2 border-orange-400 pl-3 py-1">
                    <p className="font-medium">{h.name}</p>
                    <p className="text-sm text-gray-500">{h.purpose}</p>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold">
                  Prompts: {report.promptsDivergence.documented} documentados →{' '}
                  {report.promptsDivergence.found} encontrados
                </h3>
                {report.promptsDivergence.additional.map((p) => (
                  <div key={p.slug} className="border-l-2 border-orange-400 pl-3 py-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      slug: {p.slug} | categoria: {p.category}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold">
                  Módulos Admin: {report.adminModulesDivergence.documented} documentados →{' '}
                  {report.adminModulesDivergence.found} encontrados
                </h3>
                {report.adminModulesDivergence.additional.map((m) => (
                  <div key={m.name} className="border-l-2 border-orange-400 pl-3 py-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.description}</p>
                    <p className="text-xs text-gray-400">{m.route}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fix">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <h3 className="font-bold">Arquiteto de Workflow — Correção Aplicada</h3>
                <StatusBadge status={report.arquitetoFix.status} />
              </div>
              <p className="text-sm text-gray-600">
                <strong>Bug:</strong> {report.arquitetoFix.bug}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Correção:</strong> {report.arquitetoFix.fix}
              </p>
              <div>
                <p className="text-sm font-medium mb-1">Parâmetros Corrigidos:</p>
                {report.arquitetoFix.parameterCorrections.map((c, i) => (
                  <div key={i} className="bg-gray-50 rounded p-2 text-sm">
                    <code>{c.hook}</code>: <code>{c.field}</code> → <code>{c.correctedTo}</code> (
                    {c.reason})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <AuditHistory onViewReport={handleViewHistorical} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
