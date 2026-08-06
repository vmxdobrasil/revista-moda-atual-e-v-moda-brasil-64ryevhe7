import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye } from 'lucide-react'
import { CompetitorsPanel } from '@/components/admin/market-watch/CompetitorsPanel'
import { SignalsPanel } from '@/components/admin/market-watch/SignalsPanel'
import { IntelligenceReportTab } from '@/components/admin/market-watch/IntelligenceReportTab'
import { MarketWatchChatTab } from '@/components/admin/market-watch/MarketWatchChatTab'
import { DocumentationTab } from '@/components/admin/market-watch/DocumentationTab'
import { CompetitiveBenchmarks } from '@/components/admin/market-watch/CompetitiveBenchmarks'

export default function MarketWatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Market Watch</h2>
          <p className="text-gray-500 mt-1">Inteligência Competitiva do Mercado de Moda</p>
        </div>
      </div>

      <Tabs defaultValue="competitors">
        <TabsList className="bg-gray-100 rounded-lg flex-wrap h-auto">
          <TabsTrigger value="competitors">Concorrentes</TabsTrigger>
          <TabsTrigger value="signals">Sinais de Mercado</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
          <TabsTrigger value="chat">Chat com Agente</TabsTrigger>
          <TabsTrigger value="docs">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="mt-4">
          <CompetitorsPanel />
        </TabsContent>

        <TabsContent value="signals" className="mt-4">
          <SignalsPanel />
        </TabsContent>

        <TabsContent value="benchmarks" className="mt-4">
          <CompetitiveBenchmarks />
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <IntelligenceReportTab />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <MarketWatchChatTab />
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <DocumentationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
