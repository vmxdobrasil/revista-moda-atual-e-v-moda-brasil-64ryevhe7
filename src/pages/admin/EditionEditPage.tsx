import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getEdition,
  updateEdition,
  getEditionPages,
  createEditionPage,
  updateEditionPage,
  deleteEditionPage,
  Edition,
  EditionPage,
  getFileUrl,
} from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, Trash2, Save, Loader2, Image as ImageIcon } from 'lucide-react'

export default function EditionEditPage() {
  const { id } = useParams<{ id: string }>()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [pages, setPages] = useState<EditionPage[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [ed, pgs] = await Promise.all([getEdition(id), getEditionPages(id)])
      setEdition(ed)
      setPages(pgs)
    } catch (err) {
      toast({ title: 'Erro', description: 'Edição não encontrada.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  if (!edition) return <div>Edição não encontrada.</div>

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">Editando: {edition.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EditionDetailsForm edition={edition} onUpdated={loadData} />
        </div>
        <div className="lg:col-span-2">
          <EditionPagesManager editionId={edition.id} pages={pages} onUpdated={loadData} />
        </div>
      </div>
    </div>
  )
}

function EditionDetailsForm({ edition, onUpdated }: { edition: Edition; onUpdated: () => void }) {
  const [title, setTitle] = useState(edition.title)
  const [description, setDescription] = useState(edition.description)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      if (file) formData.append('cover_file', file)

      await updateEdition(edition.id, formData)
      toast({ title: 'Sucesso', description: 'Edição atualizada.' })
      setFile(null)
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Edição</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative mb-4">
            <img
              src={edition.cover_file ? getFileUrl(edition, edition.cover_file) : edition.cover_url}
              className="w-full h-full object-cover"
              alt="Capa"
            />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Trocar Capa</Label>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function EditionPagesManager({
  editionId,
  pages,
  onUpdated,
}: {
  editionId: string
  pages: EditionPage[]
  onUpdated: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      let maxPage = pages.reduce((max, p) => Math.max(max, p.page_number), 0)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('edition', editionId)
        formData.append('page_number', (maxPage + i + 1).toString())
        formData.append('image_file', file)
        await createEditionPage(formData)
      }
      toast({ title: 'Sucesso', description: `${files.length} página(s) adicionada(s).` })
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao enviar páginas.', variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Páginas ({pages.length})</CardTitle>
        <div className="relative">
          <Input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button variant="outline" disabled={uploading}>
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Adicionar Imagens
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
            Nenhuma página adicionada ainda.
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {pages.map((page) => (
              <PageRow key={page.id} page={page} onUpdated={onUpdated} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PageRow({ page, onUpdated }: { page: EditionPage; onUpdated: () => void }) {
  const [pageNumber, setPageNumber] = useState(page.page_number.toString())
  const [tocTitle, setTocTitle] = useState(page.toc_title || '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEditionPage(page.id, {
        page_number: parseInt(pageNumber, 10),
        toc_title: tocTitle,
      })
      toast({ title: 'Página atualizada.' })
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir página ${page.page_number}?`)) return
    try {
      await deleteEditionPage(page.id)
      onUpdated()
    } catch (err) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const isChanged =
    pageNumber !== page.page_number.toString() || tocTitle !== (page.toc_title || '')

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-3 rounded-lg border">
      <div className="w-20 h-28 bg-white shrink-0 rounded border flex items-center justify-center overflow-hidden relative group">
        {page.image_file || page.image_url ? (
          <img
            src={page.image_file ? getFileUrl(page, page.image_file) : page.image_url}
            className="w-full h-full object-cover"
            alt={`Pág ${page.page_number}`}
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-300" />
        )}
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="space-y-1">
          <Label className="text-xs">Número da Página</Label>
          <Input
            type="number"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Título do Índice (Opcional)</Label>
          <Input
            value={tocTitle}
            onChange={(e) => setTocTitle(e.target.value)}
            placeholder="Ex: Capa, Editorial..."
            className="h-8"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isChanged || saving}
          className="flex-1 sm:flex-none"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          className="flex-1 sm:flex-none"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
