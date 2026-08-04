import { useState, useEffect, useCallback } from 'react'
import { EditorialQaChat } from './components/EditorialQaChat'
import { getFilteredAuditLogs, type AuditLog } from '@/services/audit-logs'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, MessageSquare, BookOpen } from 'lucide-react'

export default function EditorialQaPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const logs = await getFilteredAuditLogs({ agentName: 'editorial-qa' }).catch(() => [])
      setAuditLogs(logs)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('audit_logs', () => loadData())

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-orange-500" />
        <h2 className="text-3xl font-bold tracking-tight">Editorial QA</h2>
      </div>
      <p className="text-gray-500">
        Controle de qualidade editorial com IA para Revista MODA ATUAL.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EditorialQaChat />

        <div className="space-y-4">
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5 text-orange-500" /> Histórico de Revisões
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-32 w-full" />
              ) : auditLogs.length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm">Nenhuma revisão anterior.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {auditLogs.slice(0, 15).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-sm border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{log.integration_name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.executed_at).toLocaleString('pt-BR')}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-400">{log.error_message}</p>
                        )}
                      </div>
                      <Badge className={log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-orange-500" /> Critérios de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Tom de Voz</h4>
                <ul className="space-y-1 text-gray-600 list-disc list-inside">
                  <li>
                    <strong>Editorial:</strong> Sofisticado, autoritativo, norma culta, 3ª pessoa
                  </li>
                  <li>
                    <strong>Informal:</strong> Aspiracional, acessível, 1ª pessoa do plural
                  </li>
                  <li>
                    <strong>Técnico:</strong> Preciso, factual, neutro, dados suportados
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Regras Editoriais</h4>
                <ul className="space-y-1 text-gray-600 list-disc list-inside">
                  <li>Estrutura: título, subtítulo, olho, corpo, CTA</li>
                  <li>Datas em formato brasileiro (DD/MM/AAAA)</li>
                  <li>Sem claims não verificados ou estatísticas sem fonte</li>
                  <li>Máx. 800 palavras (artigos), 300 (legendas)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Checklist Gramatical</h4>
                <ul className="space-y-1 text-gray-600 list-disc list-inside">
                  <li>Crase, hífen, por que/porque</li>
                  <li>Concordância verbal e nominal</li>
                  <li>Pontuação (sem vírgula Oxford)</li>
                  <li>Mal/mau, senão/se não, onde/aonde</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
