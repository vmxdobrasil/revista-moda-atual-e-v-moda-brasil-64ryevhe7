import { useState, useEffect, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { getAllStoryTexts, deleteStoryText, type StoryText } from '@/services/story-texts'
import { getSavedContent, type SavedContent } from '@/services/content-generator'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { StoriesTable } from './components/StoriesTable'
import { StoryTextEditModal } from './components/StoryTextEditModal'
import { StoryTextScheduleModal } from './components/StoryTextScheduleModal'
import { LayoutDashboard, Sparkles, CalendarClock } from 'lucide-react'

function CaptionsList({ items }: { items: SavedContent[] }) {
  if (items.length === 0)
    return <p className="text-center text-gray-400 py-10">Nenhuma legenda gerada.</p>
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.theme}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.content_data?.materia_completa?.slice(0, 120) || 'Sem prévia disponível'}
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(item.created).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [stories, setStories] = useState<StoryText[]>([])
  const [captions, setCaptions] = useState<SavedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selected, setSelected] = useState<StoryText | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([getAllStoryTexts(), getSavedContent()])
      setStories(s)
      setCaptions(c)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('story_texts', () => loadData())
  useRealtime('generated_social_content', () => loadData())

  const scheduled = stories
    .filter((s) => s.scheduled_date)
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())

  const handleDelete = async (id: string) => {
    try {
      await deleteStoryText(id)
      toast({ title: 'Sucesso', description: 'Registro excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <LayoutDashboard className="w-7 h-7 text-orange-500" />
          Dashboard
        </h2>
        <p className="text-gray-500 mt-1">Gerencie textos de Stories e legendas geradas.</p>
      </div>

      <Tabs defaultValue="stories">
        <TabsList>
          <TabsTrigger value="stories" className="gap-2">
            <Sparkles className="w-4 h-4" /> Stories ({stories.length})
          </TabsTrigger>
          <TabsTrigger value="captions" className="gap-2">
            <Sparkles className="w-4 h-4" /> Legendas ({captions.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="gap-2">
            <CalendarClock className="w-4 h-4" /> Agendados ({scheduled.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              <StoriesTable
                items={stories}
                onEdit={(item) => {
                  setSelected(item)
                  setEditOpen(true)
                }}
                onSchedule={(item) => {
                  setSelected(item)
                  setScheduleOpen(true)
                }}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captions">
          <CaptionsList items={captions} />
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-0 overflow-x-auto">
              <StoriesTable
                items={scheduled}
                showScheduled
                onEdit={(item) => {
                  setSelected(item)
                  setEditOpen(true)
                }}
                onSchedule={(item) => {
                  setSelected(item)
                  setScheduleOpen(true)
                }}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <StoryTextEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={loadData}
        editing={selected}
      />
      <StoryTextScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSaved={loadData}
        editing={selected}
      />
    </div>
  )
}
