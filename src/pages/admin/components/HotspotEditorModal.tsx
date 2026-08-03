import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createHotspot, updateHotspot, type Hotspot } from '@/services/magazine'
import { getAllProducts, type MarketplaceProduct } from '@/services/marketplace'
import { Loader2, Save } from 'lucide-react'

interface HotspotEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  hotspot?: Hotspot | null
  position?: { x: number; y: number }
  onSaved: () => void
}

export function HotspotEditorModal({
  open,
  onOpenChange,
  pageId,
  hotspot,
  position,
  onSaved,
}: HotspotEditorModalProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    link: '',
    product: '',
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (hotspot) {
      setForm({
        title: hotspot.title || '',
        description: hotspot.description || '',
        price: hotspot.price || '',
        link: hotspot.link || '',
        product: hotspot.product || '',
      })
    } else {
      setForm({ title: '', description: '', price: '', link: '', product: '' })
    }
  }, [hotspot, open])

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const data: Partial<Hotspot> = {
        title: form.title,
        description: form.description,
        price: form.price,
        link: form.link,
        product: form.product || undefined,
      }
      if (hotspot) {
        await updateHotspot(hotspot.id, data)
        toast({ title: 'Sucesso', description: 'Hotspot atualizado.' })
      } else {
        await createHotspot({
          ...data,
          page: pageId,
          x: position?.x ?? 50,
          y: position?.y ?? 50,
        } as Partial<Hotspot>)
        toast({ title: 'Sucesso', description: 'Hotspot criado.' })
      }
      onSaved()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hotspot ? 'Editar Hotspot' : 'Novo Hotspot'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="R$ 99,90"
              />
            </div>
            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Produto (Oferta)</Label>
            <Select
              value={form.product || 'none'}
              onValueChange={(v) => setForm((f) => ({ ...f, product: v === 'none' ? '' : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              Vincule este hotspot a um produto do marketplace para exibir como oferta.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {hotspot ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
