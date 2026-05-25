import { useState, useEffect, useRef } from 'react'
import {
  EditionPage,
  Hotspot,
  getHotspots,
  createHotspot,
  updateHotspot,
  deleteHotspot,
  getFileUrl,
} from '@/services/magazine'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Tag as TagIcon, Trash2 } from 'lucide-react'

export function HotspotEditorModal({
  page,
  open,
  onOpenChange,
}: {
  page: EditionPage
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getHotspots(page.edition)
      setHotspots(data.filter((h) => h.page === page.id))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadData()
  }, [open, page.id])

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newHotspot = {
      page: page.id,
      x,
      y,
      title: 'Novo Produto',
      description: '',
      price: '',
      link: '',
    }

    try {
      const created = await createHotspot(newHotspot)
      setHotspots((prev) => [...prev, created])
      toast({ title: 'Tag adicionada.', description: 'Clique na tag recém criada para editá-la.' })
    } catch {
      toast({ title: 'Erro ao adicionar tag.', variant: 'destructive' })
    }
  }

  const imageUrl = page.image_file ? getFileUrl(page, page.image_file) : page.image_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>Editor de Tags - Página {page.page_number}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 bg-gray-100 rounded-md overflow-hidden relative mt-2 border flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          ) : (
            <div
              className="relative inline-block h-full shadow-lg"
              style={{ aspectRatio: '0.7118' }}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Página"
                className="w-full h-full object-cover cursor-crosshair"
                onClick={handleImageClick}
              />
              {hotspots.map((h) => (
                <HotspotItem key={h.id} hotspot={h} onChange={loadData} />
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Clique em qualquer lugar da imagem para adicionar uma nova tag de produto.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function HotspotItem({ hotspot, onChange }: { hotspot: Hotspot; onChange: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(hotspot.title)
  const [desc, setDesc] = useState(hotspot.description)
  const [price, setPrice] = useState(hotspot.price)
  const [link, setLink] = useState(hotspot.link)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateHotspot(hotspot.id, { title, description: desc, price, link })
      toast({ title: 'Tag atualizada.' })
      setOpen(false)
      onChange()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Excluir tag?')) return
    try {
      await deleteHotspot(hotspot.id)
      onChange()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="absolute w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform z-10"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <TagIcon className="w-4 h-4 text-white" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <h4 className="font-medium leading-none text-gray-800">Editar Tag de Produto</h4>
          <div className="space-y-2">
            <Label className="text-xs">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Preço</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: R$ 99,90"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Link (URL)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://vmodabrasil..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} className="flex-1">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
