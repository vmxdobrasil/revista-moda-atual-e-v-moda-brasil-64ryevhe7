import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, Store, X, ShoppingBag, Star } from 'lucide-react'
import {
  getAllProducts,
  getImageUrl,
  formatPrice,
  type MarketplaceProduct,
} from '@/services/marketplace'

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brandFilter = searchParams.get('brand') || ''
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detailProduct, setDetailProduct] = useState<MarketplaceProduct | null>(null)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (brandFilter && p.vendor?.toLowerCase() !== brandFilter.toLowerCase()) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [products, search, brandFilter])

  const clearBrandFilter = () => {
    setSearchParams({})
  }

  return (
    <div className="min-h-full bg-zinc-50 p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-black rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 max-w-xl">
            <Badge className="bg-orange-500 hover:bg-orange-500 text-white mb-4 border-none">
              V MODA BRASIL
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {brandFilter ? brandFilter : 'Marketplace'}
            </h1>
            <p className="text-zinc-400 text-lg">
              {brandFilter
                ? `Produtos de ${brandFilter}`
                : 'Conecte-se com fornecedores premium e abasteça sua loja com exclusividade.'}
            </p>
          </div>
        </div>

        {brandFilter && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
            <Store className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">
              Filtrando por marca: <strong>{brandFilter}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={clearBrandFilter} className="ml-auto gap-1">
              <X className="w-4 h-4" /> Limpar filtro
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} produtos</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden group hover:border-orange-400/50 transition-colors cursor-pointer"
                onClick={() => setDetailProduct(p)}
              >
                <div className="aspect-square relative overflow-hidden bg-gray-100">
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
                      <Star className="w-3 h-3 mr-1 fill-white" /> Destaque
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    {p.category}
                  </p>
                  <h3 className="font-bold text-gray-900 truncate mb-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
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
                      <ShoppingBag className="w-4 h-4 mr-2" /> Comprar agora
                    </a>
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
