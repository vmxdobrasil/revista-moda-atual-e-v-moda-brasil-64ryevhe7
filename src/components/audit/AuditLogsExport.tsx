import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { FileSpreadsheet, FileType, Printer, Loader2 } from 'lucide-react'
import { getFilteredAuditLogs, type AuditLog, type AuditLogFilter } from '@/services/audit-logs'
import {
  exportAuditLogsToCSV,
  exportAuditLogsToPDF,
  exportAuditLogsToTXT,
} from '@/lib/audit-log-export'
import { useToast } from '@/hooks/use-toast'

export function AuditLogsExport() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState<AuditLogFilter>({})

  const handleFilterChange = (key: keyof AuditLogFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const handleFetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFilteredAuditLogs(filter)
      setLogs(result)
      toast({ title: `${result.length} registro(s) encontrado(s)` })
    } catch {
      toast({ title: 'Erro ao buscar logs', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  const handleExport = (format: 'csv' | 'pdf' | 'txt') => {
    if (logs.length === 0) {
      toast({
        title: 'Nenhum log para exportar',
        description: 'Busque os logs primeiro.',
        variant: 'destructive',
      })
      return
    }
    if (format === 'csv') exportAuditLogsToCSV(logs)
    else if (format === 'pdf') exportAuditLogsToPDF(logs)
    else exportAuditLogsToTXT(logs)
    toast({
      title: 'Exportação concluída!',
      description: `${logs.length} registro(s) exportado(s).`,
    })
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Exportar Logs de Auditoria</h3>
          <p className="text-sm text-gray-500">Filtre e exporte os logs no formato desejado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Data inicial</Label>
            <Input
              type="date"
              value={filter.fromDate || ''}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data final</Label>
            <Input
              type="date"
              value={filter.toDate || ''}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tipo de integração</Label>
            <Select
              value={filter.integrationType || 'all'}
              onValueChange={(v) => handleFilterChange('integrationType', v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="route">Route</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select
              value={filter.status || 'all'}
              onValueChange={(v) => handleFilterChange('status', v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Agente</Label>
            <Select
              value={filter.agentName || 'all'}
              onValueChange={(v) => handleFilterChange('agentName', v === 'all' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="auth/login">Login</SelectItem>
                <SelectItem value="auth/2fa">2FA</SelectItem>
                <SelectItem value="auth/reset-password">Reset de Senha</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleFetch} disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Buscando...' : 'Buscar Logs'}
            </Button>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="w-4 h-4" /> CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExport('pdf')}>
              <Printer className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => handleExport('txt')}>
              <FileType className="w-4 h-4" /> TXT
            </Button>
            <span className="text-sm text-gray-500 self-center ml-2">
              {logs.length} registro(s) carregado(s)
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
