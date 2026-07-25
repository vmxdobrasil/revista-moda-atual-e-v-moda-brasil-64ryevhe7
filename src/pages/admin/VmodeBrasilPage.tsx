import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllProducts,
  deleteProduct,
  getImageUrl,
  formatPrice,
  type MarketplaceProduct,
} from '@/services/marketplace'
import { useRealtime } from '@/hooks/use-realtime'
import { ProductForm } from './components/ProductForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Plus, Search, Trash2, Pencil, Store, ExternalLink, ShoppingCart, Star } from 'lucide-react'

export default function VmodeBrasilPage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null)
  const [detailProduct, setDetailProduct] = useState<MarketplaceProduct | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setProducts(await getAllProducts())
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar produtos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useRealtime('marketplace_products', () => loadData())
  useMemo(() => {
    loadData()
  }, [loadData])

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (catFilter !== 'all' && p.category !== catFilter) return false
        if (featuredOnly && !p.featured) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    [products, search, catFilter, featuredOnly],
  )

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products],
  )
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      toast({ title: 'Sucesso', description: 'Produto excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Store className="text-orange-500" /> Marketplace V MODA BRASIL
          </h2>
          <p className="text-gray-500 mt-1">Produtos das melhores marcas do atacado.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/vmodebrasil/orders">
              <ShoppingCart className="w-4 h-4" /> Pedidos
            </Link>
          </Button>
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
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={featuredOnly ? 'default' : 'outline'}
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className="gap-2"
        >
          <Star className="w-4 h-4" /> Destaque
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden group hover:border-orange-400/50 transition-colors cursor-pointer bg-white"
            >
              <div
                className="aspect-square relative overflow-hidden bg-gray-100"
                onClick={() => setDetailProduct(p)}
              >
                {p.image_file ? (
                  <img
                    src={getImageUrl(p, p.image_file)}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Store className="w-12 h-12" />
                  </div>
                )}
                {p.featured && (
                  <Badge className="absolute top-2 left-2 bg-orange-500 text-white border-none">
                    Destaque
                  </Badge>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingProduct(p)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 text-red-500"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardContent className="p-3" onClick={() => setDetailProduct(p)}>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{p.category}</p>
                <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-orange-500">
                    {formatPrice(p.price, p.currency)}
                  </span>
                  <span className="text-xs text-gray-500">{p.vendor}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProductForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingProduct={editingProduct}
      />
      <Dialog open={!!detailProduct} onOpenChange={(v) => !v && setDetailProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailProduct?.name}</DialogTitle>
          </DialogHeader>
          {detailProduct && (
            <div className="space-y-4">
              {detailProduct.image_file && (
                <img
                  src={getImageUrl(detailProduct, detailProduct.image_file)}
                  alt={detailProduct.name}
                  className="w-full rounded-lg"
                />
              )}
              <p className="text-gray-600 text-sm">{detailProduct.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-500">
                  {formatPrice(detailProduct.price, detailProduct.currency)}
                </span>
                {detailProduct.featured && (
                  <Badge className="bg-orange-500 text-white border-none">Destaque</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Categoria:</span> {detailProduct.category}
                </div>
                <div>
                  <span className="text-gray-400">Fornecedor:</span> {detailProduct.vendor}
                </div>
              </div>
              {detailProduct.link && (
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                  <a href={detailProduct.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" /> Ver no site
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
