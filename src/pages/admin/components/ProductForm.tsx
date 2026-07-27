import { useState, useEffect, type FormEvent } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct, type MarketplaceProduct } from '@/services/marketplace'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingProduct: MarketplaceProduct | null
}

export function ProductForm({ open, onOpenChange, onSaved, editingProduct }: Props) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [category, setCategory] = useState('')
  const [vendor, setVendor] = useState('')
  const [link, setLink] = useState('')
  const [featured, setFeatured] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name)
      setDescription(editingProduct.description || '')
      setPrice(String(editingProduct.price))
      setCurrency(editingProduct.currency || 'BRL')
      setCategory(editingProduct.category || '')
      setVendor(editingProduct.vendor || '')
      setLink(editingProduct.link || '')
      setFeatured(editingProduct.featured || false)
    } else {
      setName('')
      setDescription('')
      setPrice('')
      setCurrency('BRL')
      setCategory('')
      setVendor('')
      setLink('')
      setFeatured(false)
    }
    setImage(null)
  }, [editingProduct, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('description', description)
      fd.append('price', price)
      fd.append('currency', currency)
      fd.append('category', category)
      fd.append('vendor', vendor)
      fd.append('link', link)
      fd.append('featured', String(featured))
      if (image) fd.append('image_file', image)
      if (editingProduct) {
        await updateProduct(editingProduct.id, fd)
        toast({ title: 'Sucesso', description: 'Produto atualizado.' })
      } else {
        await createProduct(fd)
        toast({ title: 'Sucesso', description: 'Produto criado.' })
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="prod-name">Nome</Label>
            <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-desc">Descrição</Label>
            <Textarea
              id="prod-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-price">Preço</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-currency">Moeda</Label>
              <Input
                id="prod-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prod-cat">Categoria</Label>
              <Input id="prod-cat" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-vendor">Fornecedor</Label>
              <Input id="prod-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-link">Link</Label>
            <Input
              id="prod-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-image">Imagem</Label>
            <Input
              id="prod-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={featured} onCheckedChange={setFeatured} id="prod-featured" />
            <Label htmlFor="prod-featured">Destacado</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
