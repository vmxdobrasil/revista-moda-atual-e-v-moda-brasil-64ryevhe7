import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSubscribers,
  getCampaigns,
  getSequences,
  getEditionsForSelect,
  generateNewsletter,
  type Subscriber,
  type NewsletterCampaign,
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

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [sequences, setSequences] = useState<NewsletterSequence[]>([])
  const [editions, setEditions] = useState<EditionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [previewCampaign, setPreviewCampaign] = useState<NewsletterCampaign | null>(null)

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
          {previewCampaign && <TabsTrigger value="preview">Preview</TabsTrigger>}
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
            onPreview={setPreviewCampaign}
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

        {previewCampaign && (
          <TabsContent value="preview" className="mt-4">
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-orange-500" />
                  Preview: {previewCampaign.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Assunto</p>
                  <p className="font-medium text-gray-800">{previewCampaign.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Preheader</p>
                  <p className="text-gray-600">{previewCampaign.preheader}</p>
                </div>
                {previewCampaign.content?.header && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="font-bold text-gray-800">
                      {previewCampaign.content.header.title}
                    </p>
                    {previewCampaign.content.header.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {previewCampaign.content.header.description}
                      </p>
                    )}
                  </div>
                )}
                {previewCampaign.content?.intro && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Introdução</p>
                    <p className="text-gray-700">{previewCampaign.content.intro}</p>
                  </div>
                )}
                {previewCampaign.content?.sections &&
                  previewCampaign.content.sections.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-400 uppercase">Seções</p>
                      {previewCampaign.content.sections.map((section, idx) => (
                        <div key={idx} className="border-l-2 border-orange-200 pl-4">
                          <p className="font-medium text-gray-800">{section.title}</p>
                          <p className="text-sm text-gray-600">{section.summary}</p>
                          {section.products && section.products.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {section.products.map((prod, pidx) => (
                                <Badge key={pidx} variant="outline" className="text-xs">
                                  {prod.name} — {prod.price}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                {previewCampaign.content?.cta && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase">CTA</p>
                    <p className="text-gray-700">{previewCampaign.content.cta}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Audiência: {previewCampaign.audience_size || 0}</span>
                  <span>Segmentos: {(previewCampaign.segments || []).join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
