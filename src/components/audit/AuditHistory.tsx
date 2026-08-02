import { useState, useEffect, useCallback } from 'react'
import {
  getAuditSnapshots,
  getAuditSnapshot,
  type AuditSnapshotSummary,
} from '@/services/audit-snapshots'
import type { AuditReport } from '@/services/audit'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { History, Eye, RefreshCw, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateAuditSnapshot } from '@/services/audit-snapshots'

interface AuditHistoryProps {
  onViewReport: (report: AuditReport) => void
}

export function AuditHistory({ onViewReport }: AuditHistoryProps) {
  const { toast } = useToast()
  const [snapshots, setSnapshots] = useState<AuditSnapshotSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSnapshots(await getAuditSnapshots())
    } catch (err) {
      console.error('Failed to load audit snapshots:', err)
      setError(err instanceof Error ? err.message : 'Falha ao carregar histórico.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleView = async (id: string) => {
    try {
      const snapshot = await getAuditSnapshot(id)
      if (snapshot.snapshot_data) {
        onViewReport(snapshot.snapshot_data)
      }
    } catch (err) {
      console.error('Failed to load snapshot:', err)
      setError(err instanceof Error ? err.message : 'Falha ao carregar relatório.')
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateAuditSnapshot()
      toast({ title: 'Snapshot gerado com sucesso!' })
      await load()
    } catch (err) {
      console.error('Failed to generate snapshot:', err)
      toast({
        title: 'Erro ao gerar snapshot',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />
  if (error) return <div className="text-red-500 text-sm">{error}</div>

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" /> Relatórios Históricos
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={load}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
              <Plus className="w-4 h-4 mr-1" />
              {generating ? 'Gerando...' : 'Gerar Agora'}
            </Button>
          </div>
        </div>
        {snapshots.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            Nenhum relatório histórico disponível. Os relatórios são gerados automaticamente a cada
            hora. Você também pode gerar manualmente clicando em "Gerar Agora".
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {snapshots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{s.period}</p>
                  <p className="text-xs text-gray-500">
                    {s.created ? new Date(s.created).toLocaleString('pt-BR') : 'indisponível'}
                  </p>
                  {s.error_message && (
                    <p className="text-xs text-red-500 mt-1">{s.error_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    className={
                      s.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : s.status === 'already_exists'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                    }
                  >
                    {s.status}
                  </Badge>
                  {s.status === 'success' && (
                    <Button variant="ghost" size="sm" onClick={() => handleView(s.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
