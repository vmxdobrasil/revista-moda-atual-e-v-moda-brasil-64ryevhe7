import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Mail, Users, GitBranch, Sparkles, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getSubscribers,
  getCampaigns,
  getSequences,
  generateNewsletter,
  deleteCampaign,
  deleteSubscriber,
  deleteSequence,
  type Subscriber,
  type NewsletterCampaign,
  type NewsletterSequence,
} from '@/services/newsletter'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}

const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-600',
  descadastrado: 'bg-red-100 text-red-700',
  rascunho: 'bg-gray-100 text-gray-600',
  em_revisao: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-blue-100 text-blue-700',
  agendado: 'bg-purple-100 text-purple-700',
  enviado: 'bg-green-100 text-green-700',
  falhou: 'bg-red-100 text-red-700',
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: typeof Users
}) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [sequences, setSequences] = useState<NewsletterSequence[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [subs, camps, seqs] = await Promise.all([
        getSubscribers(),
        getCampaigns(),
        getSequences(),
      ])
      setSubscribers(subs)
      setCampaigns(camps)
      setSequences(seqs)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados da newsletter.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('newsletter_campaigns', () => {
    loadData()
  })
  useRealtime('subscribers', () => {
    loadData()
  })
  useRealtime('newsletter_sequences', () => {
    loadData()
  })

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateNewsletter({
        segments: ['varejo', 'atacado', 'consumidora'],
      })
      toast.success('Newsletter gerada com sucesso!')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar newsletter.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeleteCampaign = async (id: string) => {
    try {
      await deleteCampaign(id)
      toast.success('Campanha excluída.')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir campanha.')
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    try {
      await deleteSubscriber(id)
      toast.success('Assinante excluído.')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir assinante.')
    }
  }

  const handleDeleteSequence = async (id: string) => {
    try {
      await deleteSequence(id)
      toast.success('Sequência excluída.')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir sequência.')
    }
  }

  const activeSubs = subscribers.filter((s) => s.status === 'ativo')
  const avgEngagement =
    activeSubs.length > 0
      ? Math.round(
          activeSubs.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / activeSubs.length,
        )
      : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Audience Nurture</h2>
          <p className="text-gray-500 mt-1">Newsletter e CRM de Leitoras</p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Gerar Newsletter
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Assinantes Ativos" value={activeSubs.length} icon={Users} />
        <StatCard label="Total Assinantes" value={subscribers.length} icon={Mail} />
        <StatCard label="Engajamento Médio" value={avgEngagement} icon={Sparkles} />
        <StatCard
          label="Sequências Ativas"
          value={sequences.filter((s) => s.status === 'ativo').length}
          icon={GitBranch}
        />
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="bg-gray-100 rounded-lg">
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
          <TabsTrigger value="sequences">Sequências</TabsTrigger>
          {selectedCampaign && <TabsTrigger value="preview">Preview</TabsTrigger>}
        </TabsList>

        <TabsContent value="campaigns" className="space-y-3 mt-4">
          {campaigns.length === 0 ? (
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">
                Nenhuma campanha ainda. Clique em "Gerar Newsletter" para criar.
              </CardContent>
            </Card>
          ) : (
            campaigns.map((camp) => (
              <Card key={camp.id} className="rounded-xl border-none bg-white shadow-sm">
                <CardContent className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 truncate">{camp.title}</h3>
                      <Badge className={STATUS_COLORS[camp.status] || 'bg-gray-100 text-gray-600'}>
                        {camp.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{camp.subject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Audiência: {camp.audience_size || 0}</span>
                      <span>Aberturas: {camp.opened_count || 0}</span>
                      <span>Cliques: {camp.click_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedCampaign(camp)
                      }}
                    >
                      <Send className="w-4 h-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteCampaign(camp.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-3 mt-4">
          {subscribers.length === 0 ? (
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">
                Nenhum assinante cadastrado.
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Nome</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Segmento</th>
                      <th className="text-left px-4 py-3 font-medium">Engaj.</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{sub.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{sub.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {SEGMENT_LABELS[sub.segment] || sub.segment}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{sub.engagement_score || 0}</td>
                        <td className="px-4 py-3">
                          <Badge className={STATUS_COLORS[sub.status] || 'bg-gray-100'}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sequences" className="space-y-3 mt-4">
          {sequences.length === 0 ? (
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-8 text-center text-gray-500">
                Nenhuma sequência de nurture cadastrada.
              </CardContent>
            </Card>
          ) : (
            sequences.map((seq) => (
              <Card key={seq.id} className="rounded-xl border-none bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{seq.name}</CardTitle>
                      <Badge className={STATUS_COLORS[seq.status] || 'bg-gray-100'}>
                        {seq.status}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteSequence(seq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">{seq.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                    <Badge variant="outline">{SEGMENT_LABELS[seq.segment] || seq.segment}</Badge>
                    <span>Trigger: {seq.trigger}</span>
                    <span>{seq.steps?.length || 0} etapas</span>
                  </div>
                  <div className="space-y-2">
                    {(seq.steps || []).map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start text-sm">
                        <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                          D{step.day}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{step.subject}</p>
                          <p className="text-gray-400 text-xs">{step.content_summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {selectedCampaign && (
          <TabsContent value="preview" className="mt-4">
            <Card className="rounded-xl border-none bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Preview: {selectedCampaign.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Assunto</p>
                  <p className="font-medium text-gray-800">{selectedCampaign.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">Preheader</p>
                  <p className="text-gray-600">{selectedCampaign.preheader}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                    {JSON.stringify(selectedCampaign.content, null, 2)}
                  </pre>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>Audiência: {selectedCampaign.audience_size || 0}</span>
                  <span>Segmentos: {(selectedCampaign.segments || []).join(', ')}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
