import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  X,
  CheckCheck,
  Server,
  Webhook,
  Bot,
  Clock,
  AlertCircle,
} from 'lucide-react'
import type { AuditLog } from '@/services/audit-logs'

function getIcon(type: string) {
  switch (type) {
    case 'route':
      return Server
    case 'event':
      return Webhook
    case 'agent':
      return Bot
    default:
      return AlertTriangle
  }
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return date.toLocaleString('pt-BR')
}

export function FailureAlertBanner({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  if (count === 0) return null
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-3 animate-fade-in-down">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-red-900">
            {count} {count === 1 ? 'falha detectada' : 'falhas detectadas'}
          </p>
          <p className="text-sm text-red-700 truncate">
            Verifique os detalhes na aba &ldquo;Alertas&rdquo;.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="gap-2 shrink-0 border-red-300 text-red-700 hover:bg-red-100"
        onClick={onDismiss}
      >
        <CheckCheck className="w-4 h-4" /> Reconhecer
      </Button>
    </div>
  )
}

export function FailureAlertsList({
  logs,
  loading,
  error,
  onAcknowledge,
  onAcknowledgeAll,
}: {
  logs: AuditLog[]
  loading: boolean
  error: string | null
  onAcknowledge: (ids: string[]) => void
  onAcknowledgeAll: () => void
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <p className="font-medium text-red-900">Erro ao carregar alertas</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCheck className="w-6 h-6 text-green-600" />
        </div>
        <p className="font-medium text-green-900">Nenhuma falha detectada</p>
        <p className="text-sm text-green-700">
          Todos os hooks e agentes est&atilde;o funcionando corretamente.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {logs.length} {logs.length === 1 ? 'registro de falha' : 'registros de falha'}
        </p>
        <Button
          size="sm"
          variant="ghost"
          className="gap-2 text-gray-500"
          onClick={onAcknowledgeAll}
        >
          <CheckCheck className="w-4 h-4" /> Reconhecer todos
        </Button>
      </div>
      {logs.map((log) => {
        const Icon = getIcon(log.integration_type)
        return (
          <Card key={log.id} className="rounded-xl border-l-4 border-l-red-400 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{log.integration_name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {log.integration_type}
                      </Badge>
                      {log.agent_name && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Bot className="w-3 h-3" /> {log.agent_name}
                        </Badge>
                      )}
                    </div>
                    {log.error_message && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{log.error_message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatRelative(log.executed_at)}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-gray-400 hover:text-gray-600"
                  onClick={() => onAcknowledge([log.id])}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
