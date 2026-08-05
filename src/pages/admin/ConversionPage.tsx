import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Target } from 'lucide-react'
import { FunnelReportTab } from '@/components/admin/conversion/FunnelReportTab'
import { ConversionChatTab } from '@/components/admin/conversion/ConversionChatTab'
import { AttributionFlowTab } from '@/components/admin/conversion/AttributionFlowTab'

export default function ConversionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Conversion</h2>
          <p className="text-gray-500 mt-1">Funil Revista → V MODA BRASIL Marketplace</p>
        </div>
      </div>

      <Tabs defaultValue="funnel">
        <TabsList className="bg-gray-100 rounded-lg flex-wrap h-auto">
          <TabsTrigger value="funnel">Relatório de Funil</TabsTrigger>
          <TabsTrigger value="chat">Chat com o Agente</TabsTrigger>
          <TabsTrigger value="attribution">Fluxo de Atribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="mt-4">
          <FunnelReportTab />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <ConversionChatTab />
        </TabsContent>

        <TabsContent value="attribution" className="mt-4">
          <AttributionFlowTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
