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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { createProduct, updateProduct, type MarketplaceProduct } from '@/services/marketplace'
import { Loader2, Save } from 'lucide-react'

const CATEGORIES = [
  'Moda Festa',
  'Jeanswear',
  'Alfaiataria',
  'Casual Chic',
  'Fitness',
  'Lingerie',
  'Praia',
  'Acessórios',
  'Calçados',
  'Tricô',
  'Infantil',
  'Plus Size',
]

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingProduct?: MarketplaceProduct | null
}

export function ProductForm({ open, onOpenChange, onSaved, editingProduct }: ProductFormProps) {
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    price: 0,
    currency: 'BRL',
    category: '',
    vendor: '',
    featured: false,
    link: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        currency: editingProduct.currency || 'BRL',
        category: editingProduct.category || '',
        vendor: editingProduct.vendor || '',
        featured: editingProduct.featured || false,
        link: editingProduct.link || '',
      })
    } else {
      setForm({
        name: '',
        description: '',
        price: 0,
        currency: 'BRL',
        category: '',
        vendor: '',
        featured: false,
        link: '',
      })
    }
    setImageFile(null)
    setFieldErrors({})
  }, [editingProduct, open])

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data: any = { ...form, price: Number(form.price), featured: !!form.featured }
      if (imageFile) data.image_file = imageFile
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        toast({ title: 'Sucesso', description: 'Produto atualizado.' })
      } else {
        await createProduct(data)
        toast({ title: 'Sucesso', description: 'Produto criado.' })
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço *</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f: any) => ({ ...f, price: e.target.value }))}
              />
              {fieldErrors.price && <p className="text-sm text-red-500">{fieldErrors.price}</p>}
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Input
                value={form.currency}
                onChange={(e) => setForm((f: any) => ({ ...f, currency: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Imagem</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f: any) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                value={form.vendor}
                onChange={(e) => setForm((f: any) => ({ ...f, vendor: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm((f: any) => ({ ...f, featured: v }))}
              />
              <Label>Destaque</Label>
            </div>
            <div className="space-y-2">
              <Label>Link Externo</Label>
              <Input
                type="url"
                value={form.link}
                onChange={(e) => setForm((f: any) => ({ ...f, link: e.target.value }))}
              />
            </div>
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
            {editingProduct ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
