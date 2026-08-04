import { useState, useMemo } from 'react'
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
import { Pencil, Trash2, ArrowUpDown, Star, Calendar, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type SocialPost } from '@/services/social-posts'
import { PLATFORM_LABELS, STATUS_CONFIG } from '@/services/social-publisher'

type SortField =
  | 'hook'
  | 'format'
  | 'post_date'
  | 'views'
  | 'likes'
  | 'comments'
  | 'shares'
  | 'engagement_rate'
  | 'platform'
  | 'status'
type SortDir = 'asc' | 'desc'
const PAGE_SIZE = 10

interface Props {
  posts: SocialPost[]
  loading: boolean
  onEdit: (post: SocialPost) => void
  onDelete: (id: string) => void
  onSchedule: (postIds: string[]) => void
  onPublish: (postId: string) => Promise<void>
}

export function SocialPostsTable({
  posts,
  loading,
  onEdit,
  onDelete,
  onSchedule,
  onPublish,
}: Props) {
  const [sortField, setSortField] = useState<SortField>('post_date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      let av: string | number = (a[sortField] as string | number) ?? ''
      let bv: string | number = (b[sortField] as string | number) ?? ''
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [posts, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedPosts = sortedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const handlePublish = async (postId: string) => {
    setPublishingId(postId)
    try {
      await onPublish(postId)
    } finally {
      setPublishingId(null)
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
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b">
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="hook">Hook</SortHeader>
              <SortHeader field="format">Formato</SortHeader>
              <SortHeader field="platform">Plataforma</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="post_date">Data</SortHeader>
              <SortHeader field="views">Views</SortHeader>
              <SortHeader field="engagement_rate">Eng.</SortHeader>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                  Nenhum post cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((post) => {
                const statusConfig =
                  STATUS_CONFIG[post.status || 'pending'] || STATUS_CONFIG.pending
                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium text-gray-900 max-w-[180px] truncate">
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
                    <TableCell className="text-sm text-gray-600">
                      {post.platform ? PLATFORM_LABELS[post.platform] || post.platform : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig.badgeClass}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {post.post_date?.split(' ')[0]}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {post.views.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium text-orange-600">
                      {((post.engagement_rate || 0) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onSchedule([post.id])}
                          title="Agendar"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePublish(post.id)}
                          disabled={publishingId === post.id}
                          title="Publicar"
                        >
                          {publishingId === post.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onEdit(post)}>
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
                                onClick={() => onDelete(post.id)}
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
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
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
    </Card>
  )
}
