import { useState, useEffect, useCallback, useMemo } from 'react'
import { getAuditReport, type AuditReport } from '@/services/audit'
import { MetricCard } from '@/components/admin/MetricCard'
import { AuditHistory } from '@/components/audit/AuditHistory'
import { AuditCharts } from '@/components/audit/AuditCharts'
import { AuditComparison } from '@/components/audit/AuditComparison'
import {
  CollectionsPanel,
  HooksPanel,
  AgentsPanel,
  DeliveryPanel,
  DivergencesPanel,
  FixPanel,
} from '@/components/audit/AuditTabPanels'
import { exportAuditToCSV, exportAuditToPDF, exportAuditToTXT } from '@/lib/audit-export'
import { useRealtime } from '@/hooks/use-realtime'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  FileType,
  ArrowLeft,
  Database,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'

export default function AuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHistorical, setIsHistorical] = useState(false)

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
      setIsHistorical(false)
    }
    setError(null)
    try {
      setReport(await getAuditReport())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar relatório.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useRealtime(
    'audit_logs',
    () => {
      load(false)
    },
    !isHistorical,
  )
  useRealtime(
    'audit_snapshots',
    () => {
      load(false)
    },
    !isHistorical,
  )
  useRealtime(
    'delivery_queue',
    () => {
      load(false)
    },
    !isHistorical,
  )

  const handleViewHistorical = (r: AuditReport) => {
    setReport(r)
    setIsHistorical(true)
  }

  const totalRecords = useMemo(
    () => report?.collections.reduce((sum, c) => sum + c.count, 0) ?? 0,
    [report],
  )
  const activeHooks = useMemo(
    () => report?.hooks.filter((h) => h.status === 'active').length ?? 0,
    [report],
  )
  const errorHooks = useMemo(
    () => report?.hooks.filter((h) => h.status === 'error').length ?? 0,
    [report],
  )

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
            <Button onClick={() => load(true)} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Relatório Atual
            </Button>
          )}
          <Button onClick={() => exportAuditToCSV(report)} variant="outline" className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button onClick={() => exportAuditToPDF(report)} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button onClick={() => exportAuditToTXT(report)} variant="outline" className="gap-2">
            <FileType className="w-4 h-4" /> Exportar TXT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="collections">Coleções ({report.collections.length})</TabsTrigger>
          <TabsTrigger value="hooks">Hooks ({report.hooks.length})</TabsTrigger>
          <TabsTrigger value="agents">Agentes ({report.agents.length})</TabsTrigger>
          <TabsTrigger value="delivery">Fila de Entrega</TabsTrigger>
          <TabsTrigger value="divergences">Divergências</TabsTrigger>
          <TabsTrigger value="fix">Correções</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Database}
              label="Total de Registros"
              value={totalRecords}
              color="hsl(24, 95%, 53%)"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Hooks Ativos"
              value={activeHooks}
              color="hsl(140, 70%, 45%)"
            />
            <MetricCard
              icon={AlertCircle}
              label="Hooks com Erro"
              value={errorHooks}
              color="hsl(0, 80%, 50%)"
            />
            <MetricCard
              icon={Clock}
              label="Fila Pendente"
              value={report.deliveryQueue.pending}
              color="hsl(210, 80%, 50%)"
            />
          </div>
          <AuditCharts report={report} />
          <AuditComparison />
        </TabsContent>
        <TabsContent value="collections">
          <CollectionsPanel report={report} />
        </TabsContent>
        <TabsContent value="hooks">
          <HooksPanel report={report} />
        </TabsContent>
        <TabsContent value="agents">
          <AgentsPanel report={report} />
        </TabsContent>
        <TabsContent value="delivery">
          <DeliveryPanel report={report} />
        </TabsContent>
        <TabsContent value="divergences">
          <DivergencesPanel report={report} />
        </TabsContent>
        <TabsContent value="fix">
          <FixPanel report={report} />
        </TabsContent>
        <TabsContent value="history">
          <AuditHistory onViewReport={handleViewHistorical} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
