import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette } from 'lucide-react'
import { CoverArtChat } from './components/CoverArtChat'
import { CoverGeneratorPanel } from './components/CoverGeneratorPanel'
import { VisualTemplatesGallery } from './components/VisualTemplatesGallery'
import { DesignFlowDoc } from './components/DesignFlowDoc'

export default function CoverArtDirectorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <Palette className="text-orange-500" /> Cover & Editorial Art Director
        </h2>
        <p className="text-gray-500 mt-1">
          Direção de arte para capas, layouts editoriais e thumbnails seguindo o Design System.
        </p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="generator">Gerar Capa</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="docs">Fluxo de Design</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <CoverArtChat />
        </TabsContent>
        <TabsContent value="generator">
          <CoverGeneratorPanel />
        </TabsContent>
        <TabsContent value="templates">
          <VisualTemplatesGallery />
        </TabsContent>
        <TabsContent value="docs">
          <DesignFlowDoc />
        </TabsContent>
      </Tabs>
    </div>
  )
}
