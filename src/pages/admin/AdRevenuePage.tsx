import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign } from 'lucide-react'
import { OverviewTab } from '@/components/admin/ad-revenue/OverviewTab'
import { PropostasTab } from '@/components/admin/ad-revenue/PropostasTab'
import { AnunciantesTab } from '@/components/admin/ad-revenue/AnunciantesTab'
import { InventarioTab } from '@/components/admin/ad-revenue/InventarioTab'
import { PrecificacaoTab } from '@/components/admin/ad-revenue/PrecificacaoTab'
import { EntregasTab } from '@/components/admin/ad-revenue/EntregasTab'
import { RelatoriosTab } from '@/components/admin/ad-revenue/RelatoriosTab'
import { DocumentacaoTab } from '@/components/admin/ad-revenue/DocumentacaoTab'

export default function AdRevenuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
          <DollarSign className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Revenue</h1>
          <p className="text-sm text-gray-500">Gestão de monetização e conteúdo patrocinado</p>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="propostas">Propostas</TabsTrigger>
          <TabsTrigger value="anunciantes">Anunciantes</TabsTrigger>
          <TabsTrigger value="inventario">Inventário</TabsTrigger>
          <TabsTrigger value="precificacao">Precificação</TabsTrigger>
          <TabsTrigger value="entregas">Entregas</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="documentacao">Documentação</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="propostas">
          <PropostasTab />
        </TabsContent>
        <TabsContent value="anunciantes">
          <AnunciantesTab />
        </TabsContent>
        <TabsContent value="inventario">
          <InventarioTab />
        </TabsContent>
        <TabsContent value="precificacao">
          <PrecificacaoTab />
        </TabsContent>
        <TabsContent value="entregas">
          <EntregasTab />
        </TabsContent>
        <TabsContent value="relatorios">
          <RelatoriosTab />
        </TabsContent>
        <TabsContent value="documentacao">
          <DocumentacaoTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
