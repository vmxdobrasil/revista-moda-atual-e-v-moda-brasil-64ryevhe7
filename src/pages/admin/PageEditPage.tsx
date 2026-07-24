import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEditionPage, deleteEditionPage, EditionPage } from '@/services/magazine'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Loader2, Trash2, Tag, Crop, LayoutTemplate } from 'lucide-react'
import { PageEditForm } from './components/PageEditForm'
import { HotspotEditorModal } from './components/HotspotEditorModal'
import { ImageAdapterModal } from './components/ImageAdapterModal'
import { PageTemplateModal } from './components/PageTemplateModal'

export default function PageEditPage() {
  const { editionId, pageId } = useParams<{ editionId: string; pageId: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState<EditionPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [hotspotOpen, setHotspotOpen] = useState(false)
  const [adapterOpen, setAdapterOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    if (!pageId) return
    setLoading(true)
    try {
      setPage(await getEditionPage(pageId))
    } catch {
      toast({ title: 'Erro', description: 'Página não encontrada.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [pageId])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!page) return <div>Página não encontrada.</div>

  const handleDelete = async () => {
    try {
      await deleteEditionPage(page.id)
      navigate(`/admin/editions/${editionId}`)
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to={`/admin/editions/${editionId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à Edição
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Editar Página {page.page_number}</h2>
      </div>

      <PageEditForm page={page} onSaved={loadData} />

      <Card>
        <CardHeader>
          <CardTitle>Ferramentas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setHotspotOpen(true)}>
            <Tag className="w-4 h-4 mr-2" /> Hotspots
          </Button>
          <Button variant="outline" onClick={() => setAdapterOpen(true)}>
            <Crop className="w-4 h-4 mr-2" /> Adaptar Imagem
          </Button>
          <Button variant="outline" onClick={() => setTemplateOpen(true)}>
            <LayoutTemplate className="w-4 h-4 mr-2" /> Configurar Template
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Excluir Página
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                <AlertDialogDescription>Todos os hotspots serão excluídos.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {hotspotOpen && (
        <HotspotEditorModal page={page} open={hotspotOpen} onOpenChange={setHotspotOpen} />
      )}
      {adapterOpen && (
        <ImageAdapterModal
          page={page}
          open={adapterOpen}
          onOpenChange={setAdapterOpen}
          onSaved={loadData}
        />
      )}
      {templateOpen && (
        <PageTemplateModal
          page={page}
          open={templateOpen}
          onOpenChange={setTemplateOpen}
          onSaved={loadData}
        />
      )}
    </div>
  )
}
