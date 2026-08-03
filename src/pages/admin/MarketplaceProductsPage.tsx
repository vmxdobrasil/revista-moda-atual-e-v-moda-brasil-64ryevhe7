import { useState, useMemo, useCallback } from 'react'
import {
  getAllProducts,
  deleteProduct,
  toggleFeatured,
  getImageUrl,
  formatPrice,
  type MarketplaceProduct,
} from '@/services/marketplace'
import { useRealtime } from '@/hooks/use-realtime'
import { ProductForm } from './components/ProductForm'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Plus, Tag, Trash2, Pencil, AlertCircle } from 'lucide-react'

export default function MarketplaceProductsPage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setError(false)
      const data = await getAllProducts()
      setProducts(data)
    } catch {
      setError(true)
      toast({ title: 'Erro', description: 'Falha ao carregar produtos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useRealtime('marketplace_products', () => loadData())
  useMemo(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      toast({ title: 'Sucesso', description: 'Produto excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await toggleFeatured(id, featured)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)))
      toast({
        title: 'Sucesso',
        description: featured ? 'Produto destacado como oferta.' : 'Destaque removido.',
      })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao alterar destaque.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
        <p className="text-gray-500 max-w-md text-lg mb-6">
          Ocorreu um erro ao buscar os produtos. Tente novamente.
        </p>
        <Button
          onClick={() => {
            setLoading(true)
            loadData()
          }}
          className="bg-orange-500 hover:bg-orange-600 rounded-full px-8"
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Tag className="text-orange-500" /> Ofertas / Produtos
          </h2>
          <p className="text-gray-500 mt-1">Gerencie os produtos em oferta do marketplace.</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            setFormOpen(true)
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhum produto cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative group border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.image_file ? (
                  <img
                    src={getImageUrl(product, product.image_file)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                  {product.featured && <Badge className="bg-orange-500">Destaque</Badge>}
                </div>
                <p className="text-lg font-bold text-orange-600">
                  {formatPrice(product.price, product.currency || 'BRL')}
                </p>
                {product.category && (
                  <p className="text-xs text-gray-400 mt-1">{product.category}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={product.featured || false}
                    onCheckedChange={(checked) => handleToggleFeatured(product.id, checked)}
                    id={`prod-featured-${product.id}`}
                  />
                  <span className="text-xs text-gray-500">
                    {product.featured ? 'Oferta em destaque' : 'Marcar como oferta'}
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditingProduct(product)
                    setFormOpen(true)
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-7 w-7 text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
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
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingProduct={editingProduct}
      />
    </div>
  )
}
