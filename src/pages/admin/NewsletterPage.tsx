import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSubscribers,
  getCampaigns,
  getSequences,
  getEditionsForSelect,
  generateNewsletter,
  type Subscriber,
  type NewsletterSequence,
  type EditionOption,
} from '@/services/newsletter'
import { OverviewTab } from '@/components/admin/newsletter/OverviewTab'
import { CampaignsTab } from '@/components/admin/newsletter/CampaignsTab'
import { SequencesTab } from '@/components/admin/newsletter/SequencesTab'
import { SegmentationTab } from '@/components/admin/newsletter/SegmentationTab'
import { MetricsTab } from '@/components/admin/newsletter/MetricsTab'
import { MonthlyReportTab } from '@/components/admin/newsletter/MonthlyReportTab'
import { SubscribersTab } from '@/components/admin/newsletter/SubscribersTab'
import { DocumentationTab } from '@/components/admin/newsletter/DocumentationTab'

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [sequences, setSequences] = useState<NewsletterSequence[]>([])
  const [editions, setEditions] = useState<EditionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [subs, camps, seqs, eds] = await Promise.all([
        getSubscribers(),
        getCampaigns(),
        getSequences(),
        getEditionsForSelect(),
      ])
      setSubscribers(subs)
      setCampaigns(camps)
      setSequences(seqs)
      setEditions(eds)
    } catch {
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('newsletter_campaigns', () => loadData())
  useRealtime('subscribers', () => loadData())
  useRealtime('newsletter_sequences', () => loadData())

  const handleGenerate = async (editionId: string) => {
    setGenerating(true)
    try {
      await generateNewsletter({
        segments: ['varejo', 'atacado', 'consumidora'],
        edition_id: editionId || undefined,
      })
      toast.success('Newsletter gerada com sucesso!')
      await loadData()
    } catch {
      toast.error('Erro ao gerar newsletter.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Audience Nurture</h2>
        <p className="text-gray-500 mt-1">Newsletter e CRM de Leitoras</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-gray-100 rounded-lg flex-wrap h-auto">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="sequences">Sequências</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
          <TabsTrigger value="report">Relatório Mensal</TabsTrigger>
          <TabsTrigger value="documentation">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab subscribers={subscribers} />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <CampaignsTab
            campaigns={campaigns}
            editions={editions}
            onGenerate={handleGenerate}
            generating={generating}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="sequences" className="mt-4">
          <SequencesTab sequences={sequences} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="segmentation" className="mt-4">
          <SegmentationTab />
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <MetricsTab campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-4">
          <SubscribersTab subscribers={subscribers} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <MonthlyReportTab subscribers={subscribers} campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="documentation" className="mt-4">
          <DocumentationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
