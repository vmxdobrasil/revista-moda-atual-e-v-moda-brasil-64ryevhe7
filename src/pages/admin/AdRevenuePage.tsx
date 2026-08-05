import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { getProposals, type AdProposal } from '@/services/ad-revenue'
import { getAllAds, type Advertisement } from '@/services/advertisements'
import { getEditions, type Edition } from '@/services/magazine'
import { OverviewTab } from '@/components/admin/ad-revenue/OverviewTab'
import { PropostasTab } from '@/components/admin/ad-revenue/PropostasTab'
import { AnunciantesTab } from '@/components/admin/ad-revenue/AnunciantesTab'
import { InventarioTab } from '@/components/admin/ad-revenue/InventarioTab'
import { EntregasTab } from '@/components/admin/ad-revenue/EntregasTab'
import { RelatoriosTab } from '@/components/admin/ad-revenue/RelatoriosTab'
import { DocumentacaoTab } from '@/components/admin/ad-revenue/DocumentacaoTab'

export default function AdRevenuePage() {
  const [proposals, setProposals] = useState<AdProposal[]>([])
  const [ads, setAds] = useState<Advertisement[]>([])
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [props, adData, eds] = await Promise.all([getProposals(), getAllAds(), getEditions()])
      setProposals(props)
      setAds(adData)
      setEditions(eds)
    } catch {
      toast.error('Erro ao carregar dados do Ad Revenue.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('ad_proposals', () => loadData())
  useRealtime('advertisements', () => loadData())

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
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Ad Revenue</h2>
        <p className="text-gray-500 mt-1">Monetização e Branded Content</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="bg-gray-100 rounded-lg flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="anunciantes">Anunciantes</TabsTrigger>
          <TabsTrigger value="inventario">Inventário</TabsTrigger>
          <TabsTrigger value="entregas">Entregas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="documentacao">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab proposals={proposals} ads={ads} editions={editions} />
        </TabsContent>
        <TabsContent value="propostas" className="mt-4">
          <PropostasTab proposals={proposals} editions={editions} ads={ads} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="anunciantes" className="mt-4">
          <AnunciantesTab ads={ads} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="inventario" className="mt-4">
          <InventarioTab editions={editions} ads={ads} />
        </TabsContent>
        <TabsContent value="entregas" className="mt-4">
          <EntregasTab proposals={proposals} ads={ads} onRefresh={loadData} />
        </TabsContent>
        <TabsContent value="relatorios" className="mt-4">
          <RelatoriosTab proposals={proposals} editions={editions} />
        </TabsContent>
        <TabsContent value="documentacao" className="mt-4">
          <DocumentacaoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
