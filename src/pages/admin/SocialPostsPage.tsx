import { useState, useMemo, useCallback } from 'react'
import {
  getAllSocialPosts,
  deleteSocialPost,
  downloadCSV,
  type SocialPost,
} from '@/services/social-posts'
import { useRealtime } from '@/hooks/use-realtime'
import { SocialPostForm } from './components/SocialPostForm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Download, ArrowUpDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortField =
  | 'hook'
  | 'format'
  | 'post_date'
  | 'views'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'engagement_rate'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 10

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [sortField, setSortField] = useState<SortField>('post_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const data = await getAllSocialPosts()
      setPosts(data)
    } catch {
      toast({
        title: 'Erro',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useRealtime('social_posts', () => {
    loadData()
  })

  useMemo(() => {
    loadData()
  }, [loadData])

  const sortedPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => {
      let av: string | number = a[sortField] as string | number
      let bv: string | number = b[sortField] as string | number
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
    return sorted
  }, [posts, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

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

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className={cn(
        'cursor-pointer select-none hover:text-orange-600',
        field === sortField && 'text-orange-600',
      )}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </TableHead>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b">
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Posts</h2>
          <p className="text-gray-500 mt-1">Gerencie os posts e métricas do Instagram.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV(sortedPosts)} className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button onClick={handleAdd} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus className="w-4 h-4" /> Adicionar Post
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader field="hook">Hook</SortHeader>
                <SortHeader field="format">Formato</SortHeader>
                <SortHeader field="post_date">Data</SortHeader>
                <SortHeader field="views">Views</SortHeader>
                <SortHeader field="likes">Likes</SortHeader>
                <SortHeader field="comments">Coment.</SortHeader>
                <SortHeader field="shares">Shares</SortHeader>
                <SortHeader field="engagement_rate">Eng. Rate</SortHeader>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-10">
                    Nenhum post cadastrado. Clique em "Adicionar Post" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">
                      <div className="flex items-center gap-1.5">
                        {post.is_top_performer && (
                          <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                        )}
                        <span className="truncate">{post.hook}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{post.format}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{post.post_date?.split(' ')[0]}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {post.views.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {post.likes.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {post.comments.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {post.shares.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-orange-600">
                      {((post.engagement_rate || 0) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(post)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages} — {sortedPosts.length} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <SocialPostForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingPost={editingPost}
      />
    </div>
  )
}
