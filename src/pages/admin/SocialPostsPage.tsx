import { useState, useCallback, useEffect } from 'react'
import {
  getAllSocialPosts,
  deleteSocialPost,
  downloadCSV,
  type SocialPost,
} from '@/services/social-posts'
import { useRealtime } from '@/hooks/use-realtime'
import { SocialPostForm } from './components/SocialPostForm'
import { ScheduleDialog } from './components/ScheduleDialog'
import { PublishingReport } from './components/PublishingReport'
import { SocialPostsTable } from './components/SocialPostsTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { publishPost } from '@/services/social-publisher'
import { Plus, Download } from 'lucide-react'

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [schedulePostIds, setSchedulePostIds] = useState<string[]>([])
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const data = await getAllSocialPosts()
      setPosts(data)
    } catch {
      toast({ title: 'Erro', description: 'Failed to load social posts.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('social_posts', () => {
    loadData()
  })

  const handleAdd = () => {
    setEditingPost(null)
    setFormOpen(true)
  }
  const handleEdit = (post: SocialPost) => {
    setEditingPost(post)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSocialPost(id)
      toast({ title: 'Sucesso', description: 'Post excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const handleSchedule = (postIds: string[]) => {
    setSchedulePostIds(postIds)
    setScheduleOpen(true)
  }

  const handlePublish = async (postId: string) => {
    try {
      const result = await publishPost({ postId })
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `Post publicado em ${result.published?.platform || 'plataforma'}.`,
        })
        loadData()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Falha ao publicar.',
          variant: 'destructive',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao publicar.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Posts</h2>
          <p className="text-gray-500 mt-1">Gerencie posts, agendamento e publicação.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV(posts)} className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus className="w-4 h-4" /> Adicionar Post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="report">Relatório de Publicação</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-4">
          <SocialPostsTable
            posts={posts}
            loading={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSchedule={handleSchedule}
            onPublish={handlePublish}
          />
        </TabsContent>
        <TabsContent value="report" className="mt-4">
          <PublishingReport posts={posts} loading={false} />
        </TabsContent>
      </Tabs>

      <SocialPostForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingPost={editingPost}
      />
      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        postIds={schedulePostIds}
        onScheduled={loadData}
      />
    </div>
  )
}
