import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  getAllProducts,
  getImageUrl,
  formatPrice,
  type MarketplaceProduct,
} from '@/services/marketplace'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag, AlertCircle, ShoppingBag, ExternalLink } from 'lucide-react'

export default function Offers() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getAllProducts()
      setProducts(data)
      setError(false)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('marketplace_products', () => loadData())

  const meta = useMemo(
    () => ({
      title: 'Ofertas — Revista Moda Atual',
      description: 'Produtos e ofertas especiais do atacado brasileiro.',
      image: '/og-image.png',
      url: window.location.origin,
      type: 'website',
    }),
    [],
  )
  useMetaTags(meta)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
            <Tag className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Ofertas Especiais
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Produtos selecionados do atacado brasileiro com condições especiais.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
            <p className="text-gray-500 max-w-md text-lg mb-6">
              Ocorreu um erro ao buscar as ofertas. Tente novamente.
            </p>
            <Button
              onClick={() => {
                setLoading(true)
                loadData()
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma oferta disponível</h3>
            <p className="text-gray-500 max-w-md text-lg">
              No momento não há produtos em oferta. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white rounded-xl flex flex-col"
              >
                <div className="aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                  {product.image_file ? (
                    <img
                      src={getImageUrl(product, product.image_file)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3 flex-1">
                    {product.description || product.category || 'Produto do atacado brasileiro.'}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-extrabold text-orange-600">
                      {formatPrice(product.price, product.currency || 'BRL')}
                    </span>
                    {product.link && (
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Ver <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
