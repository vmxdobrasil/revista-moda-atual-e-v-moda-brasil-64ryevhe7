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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { getAllProducts, type MarketplaceProduct } from '@/services/marketplace'
import { createDeliveryWithGeneration } from '@/services/delivery-queue'
import { Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function DeliveryCreateForm({ open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast()
  const [theme, setTheme] = useState('')
  const [productId, setProductId] = useState('')
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (open) {
      getAllProducts()
        .then(setProducts)
        .catch(() => {})
      setTheme('')
      setProductId('')
    }
  }, [open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!theme.trim() || !productId) return
    setGenerating(true)
    try {
      const item = await createDeliveryWithGeneration(theme.trim(), productId)
      if (item.error_note) {
        toast({
          title: 'Aviso',
          description: `Entrega criada com erro: ${item.error_note}`,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Sucesso', description: 'Conteúdo gerado com sucesso!' })
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao criar entrega.', variant: 'destructive' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Entrega</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-theme">Tema / Tópico</Label>
            <Input
              id="delivery-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Digite o tema do post"
              required
              disabled={generating}
            />
          </div>
          <div className="space-y-2">
            <Label>Produto / Marca</Label>
            <Select value={productId} onValueChange={setProductId} disabled={generating}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {generating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Gerando conteúdo... Isso pode levar
              alguns minutos.
            </div>
          )}
          <DialogFooter>
            <Button
              type="submit"
              disabled={generating || !theme.trim() || !productId}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {generating ? 'Gerando...' : 'Criar e Gerar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
