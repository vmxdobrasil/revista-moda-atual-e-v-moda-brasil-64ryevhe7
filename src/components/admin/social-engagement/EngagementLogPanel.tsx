import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getEngagementLogs, type EngagementLog } from '@/services/social-engagement'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageCircle, Mail } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const INTENT_LABELS: Record<string, string> = {
  elogio: 'Elogio',
  pergunta_conteudo: 'Pergunta (Conteúdo)',
  pergunta_produto: 'Pergunta (Produto)',
  critica: 'Crítica',
  spam: 'Spam',
  parceria: 'Parceria',
  consultoria: 'Consultoria',
  reclamacao: 'Reclamação',
}

const STATUS_CONFIG: Record<string, string> = {
  respondido: 'bg-green-100 text-green-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  encaminhado_humano: 'bg-red-100 text-red-700',
  ignorado: 'bg-gray-100 text-gray-500',
}

export function EngagementLogPanel() {
  const [logs, setLogs] = useState<EngagementLog[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [intentFilter, setIntentFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadData = useCallback(async () => {
    try {
      const data = await getEngagementLogs({
        type: typeFilter || undefined,
        intent: intentFilter || undefined,
        status: statusFilter || undefined,
      })
      setLogs(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [typeFilter, intentFilter, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('engagement_log', () => loadData())

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="comment">Comentário</SelectItem>
            <SelectItem value="dm">DM</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setIntentFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Intenção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(INTENT_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="respondido">Respondido</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="encaminhado_humano">Encaminhado</SelectItem>
            <SelectItem value="ignorado">Ignorado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-400">
              Nenhuma interação encontrada.
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'dm' ? 'bg-blue-100' : 'bg-orange-100'}`}
                  >
                    {log.type === 'dm' ? (
                      <Mail className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-gray-800">
                        {log.ig_username || 'Usuário'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {INTENT_LABELS[log.intent] || log.intent}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_CONFIG[log.status] || ''}`}
                      >
                        {log.status}
                      </Badge>
                      {log.forwarded_to && (
                        <Badge variant="outline" className="text-xs text-red-600">
                          → {log.forwarded_to}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Mensagem:</strong> {log.message_text}
                    </p>
                    {log.response_text && (
                      <p className="text-sm text-gray-500">
                        <strong>Resposta:</strong> {log.response_text}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
