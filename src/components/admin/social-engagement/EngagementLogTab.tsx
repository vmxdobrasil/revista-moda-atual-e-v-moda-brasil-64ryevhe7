import { useState, useEffect, useCallback } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRealtime } from '@/hooks/use-realtime'
import { getAllLogs } from '@/services/social-engagement-config'

const STATUS_COLORS: Record<string, string> = {
  respondido: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  encaminhado_humano: 'bg-orange-100 text-orange-800',
  ignorado: 'bg-gray-100 text-gray-800',
}

export function EngagementLogTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const loadData = useCallback(async () => {
    try {
      const data = await getAllLogs()
      setLogs(data)
    } catch {
      setLogs([])
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

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.type === filter)

  if (loading)
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Log de Interações</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="comment">Comentários</SelectItem>
            <SelectItem value="dm">DMs</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{filtered.length} interações</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs">{r.type === 'comment' ? '💬' : '✉️'}</TableCell>
                    <TableCell className="font-medium text-xs">@{r.ig_username}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs" title={r.message_text}>
                      {r.message_text}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {r.intent}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="max-w-xs truncate text-xs text-muted-foreground"
                      title={r.response_text}
                    >
                      {r.response_text || '-'}
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
                    <TableCell className="text-xs text-muted-foreground">
                      {r.created ? new Date(r.created).toLocaleString('pt-BR') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
