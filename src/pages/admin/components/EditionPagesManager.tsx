import { useEffect, useState } from 'react'
import {
  getEditionPages,
  createEditionPage,
  updateEditionPage,
  deleteEditionPage,
  EditionPage,
  getFileUrl,
} from '@/services/magazine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Save, Loader2, Image as ImageIcon, GripVertical, Tag } from 'lucide-react'
import { HotspotEditorModal } from './HotspotEditorModal'

export function EditionPagesManager({ editionId }: { editionId: string }) {
  const [pages, setPages] = useState<EditionPage[]>([])
  const [uploading, setUploading] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const { toast } = useToast()

  const loadPages = async () => {
    try {
      const pgs = await getEditionPages(editionId)
      setPages(pgs)
    } catch {
      toast({ title: 'Erro ao carregar páginas', variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadPages()
  }, [editionId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const maxPage = pages.reduce((max, p) => Math.max(max, p.page_number), 0)
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData()
        formData.append('edition', editionId)
        formData.append('page_number', (maxPage + i + 1).toString())
        formData.append('image_file', files[i])
        await createEditionPage(formData)
      }
      toast({ title: 'Sucesso', description: `${files.length} página(s) adicionada(s).` })
      loadPages()
    } catch {
      toast({ title: 'Erro ao enviar páginas.', variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === dropIdx) return

    const newPages = [...pages]
    const [draggedItem] = newPages.splice(draggedIdx, 1)
    newPages.splice(dropIdx, 0, draggedItem)

    const updated = newPages.map((p, i) => ({ ...p, page_number: i + 1 }))
    setPages(updated)

    try {
      for (const p of updated) {
        if (p.page_number !== pages.find((op) => op.id === p.id)?.page_number) {
          await updateEditionPage(p.id, { page_number: p.page_number })
        }
      }
      toast({ title: 'Ordem salva.' })
    } catch {
      toast({ title: 'Erro ao salvar ordem.', variant: 'destructive' })
      loadPages()
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
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 pb-4">
          {pages.map((page, index) => (
            <div
              key={page.id}
              draggable
              onDragStart={() => setDraggedIdx(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              className="cursor-grab active:cursor-grabbing"
            >
              <PageRow page={page} onUpdated={loadPages} />
            </div>
          ))}
          {pages.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
              Nenhuma página adicionada ainda.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PageRow({ page, onUpdated }: { page: EditionPage; onUpdated: () => void }) {
  const [tocTitle, setTocTitle] = useState(page.toc_title || '')
  const [saving, setSaving] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateEditionPage(page.id, { toc_title: tocTitle })
      toast({ title: 'Página atualizada.' })
      onUpdated()
    } catch {
      toast({ title: 'Erro ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir página ${page.page_number}?`)) return
    try {
      await deleteEditionPage(page.id)
      onUpdated()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-3 rounded-lg border hover:border-gray-300 transition-colors">
      <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />
      <div className="w-16 h-24 bg-white shrink-0 rounded border flex items-center justify-center overflow-hidden relative">
        {page.image_file || page.image_url ? (
          <img
            src={page.image_file ? getFileUrl(page, page.image_file) : page.image_url}
            className="w-full h-full object-cover pointer-events-none"
            alt={`Pág ${page.page_number}`}
          />
        ) : (
          <ImageIcon className="w-6 h-6 text-gray-300" />
        )}
      </div>

      <div className="flex-1 space-y-2 w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
            Pág {page.page_number}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 h-7"
            onClick={() => setEditorOpen(true)}
          >
            <Tag className="w-3 h-3" /> Hotspots
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Título do Índice (Opcional)</Label>
          <div className="flex gap-2">
            <Input
              value={tocTitle}
              onChange={(e) => setTocTitle(e.target.value)}
              placeholder="Ex: Capa, Editorial..."
              className="h-8"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={tocTitle === (page.toc_title || '') || saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <Button size="icon" variant="destructive" onClick={handleDelete} className="shrink-0">
        <Trash2 className="w-4 h-4" />
      </Button>

      {editorOpen && (
        <HotspotEditorModal page={page} open={editorOpen} onOpenChange={setEditorOpen} />
      )}
    </div>
  )
}
