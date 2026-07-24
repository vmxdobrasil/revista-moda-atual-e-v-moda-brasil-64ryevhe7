import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getEditionPages,
  updateEditionPage,
  deleteEditionPage,
  EditionPage,
  getFileUrl,
} from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { AddPageModal } from './AddPageModal'

const templateLabels: Record<string, string> = {
  default: 'Padrão',
  editorial: 'Editorial',
  marketing: 'Marketing',
  holofote: 'Holofote',
  entrevista: 'Entrevista',
}

export function EditionPagesManager({ editionId }: { editionId: string }) {
  const [pages, setPages] = useState<EditionPage[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const { toast } = useToast()

  const loadPages = async () => {
    try {
      setPages(await getEditionPages(editionId))
    } catch {
      toast({ title: 'Erro ao carregar páginas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [editionId])
  useRealtime('edition_pages', () => {
    loadPages()
  })

  const nextPageNumber = pages.length > 0 ? Math.max(...pages.map((p) => p.page_number)) + 1 : 1

  const movePage = async (index: number, direction: 'up' | 'down') => {
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= pages.length) return
    const pageA = pages[index]
    const pageB = pages[swapIdx]
    const newPages = [...pages]
    newPages[index] = { ...pageB, page_number: pageA.page_number }
    newPages[swapIdx] = { ...pageA, page_number: pageB.page_number }
    setPages(newPages)
    try {
      await updateEditionPage(pageA.id, { page_number: pageB.page_number })
      await updateEditionPage(pageB.id, { page_number: pageA.page_number })
      toast({ title: 'Ordem atualizada.' })
    } catch {
      toast({ title: 'Erro ao reordenar.', variant: 'destructive' })
      loadPages()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEditionPage(id)
      toast({ title: 'Página excluída.' })
      loadPages()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Páginas ({pages.length})</CardTitle>
        <Button
          size="sm"
          onClick={() => setAddOpen(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar Página
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border hover:border-gray-300 transition-colors"
              >
                <div className="w-14 h-20 bg-white rounded border overflow-hidden shrink-0">
                  {page.image_file || page.image_url ? (
                    <img
                      src={page.image_file ? getFileUrl(page, page.image_file) : page.image_url}
                      className="w-full h-full object-cover"
                      alt={`Pág ${page.page_number}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-700">
                      Pág {page.page_number}
                    </span>
                    <Badge
                      variant={
                        page.template && page.template !== 'default' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {templateLabels[page.template || 'default']}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {page.toc_title || 'Sem título'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => movePage(index, 'up')}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    disabled={index === pages.length - 1}
                    onClick={() => movePage(index, 'down')}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                    <Link to={`/admin/editions/${editionId}/pages/${page.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir página {page.page_number}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Todos os hotspots serão excluídos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(page.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {pages.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
                Nenhuma página adicionada.
              </div>
            )}
          </div>
        )}
      </CardContent>
      <AddPageModal
        editionId={editionId}
        nextPageNumber={nextPageNumber}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={loadPages}
      />
    </Card>
  )
}
