import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Instagram } from 'lucide-react'
import { EngagementLogPanel } from '@/components/admin/social-engagement/EngagementLogPanel'
import { LeadsPanel } from '@/components/admin/social-engagement/LeadsPanel'
import { SocialEngagementChatTab } from '@/components/admin/social-engagement/SocialEngagementChatTab'
import { getMetrics, type SocialEngagementMetrics } from '@/services/social-engagement'
import { Loader2 } from 'lucide-react'

export default function SocialEngagementPage() {
  const [metrics, setMetrics] = useState<SocialEngagementMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMetrics = useCallback(async () => {
    try {
      const data = await getMetrics()
      setMetrics(data)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  const kpis = metrics
    ? [
        { label: 'Interações', value: String(metrics.summary.total_interactions) },
        { label: 'Comentários', value: String(metrics.summary.total_comments) },
        { label: 'DMs', value: String(metrics.summary.total_dms) },
        { label: 'Taxa Resposta', value: `${metrics.summary.response_rate}%` },
        { label: 'Encaminhados', value: String(metrics.summary.forwarded_human) },
        { label: 'Leads', value: String(metrics.leads.total) },
        { label: 'Convertidos', value: String(metrics.leads.convertido) },
        { label: 'Conversão', value: `${metrics.leads.conversion_rate}%` },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Instagram className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Engagement</h2>
          <p className="text-gray-500 mt-1">
            Atendimento e Interação no Instagram @revistamodaatual
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-800">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="interactions">
        <TabsList className="bg-gray-100 rounded-lg flex-wrap h-auto">
          <TabsTrigger value="interactions">Interações</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="chat">Chat com Agente</TabsTrigger>
        </TabsList>
        <TabsContent value="interactions" className="mt-4">
          <EngagementLogPanel />
        </TabsContent>
        <TabsContent value="leads" className="mt-4">
          <LeadsPanel />
        </TabsContent>
        <TabsContent value="chat" className="mt-4">
          <SocialEngagementChatTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
