import { useEffect, useState } from 'react'
import {
  getFeaturedProducts,
  getImageUrl,
  formatPrice,
  type MarketplaceProduct,
} from '@/services/marketplace'
import { ShoppingBag } from 'lucide-react'

export function OffersRail() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch(() => {})
  }, [])

  if (products.length === 0) return null

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-orange-500" />
        <h3 className="text-xl font-bold text-gray-800">Ofertas em Destaque</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-48 md:w-56 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-50 overflow-hidden">
              {product.image_file ? (
                <img
                  src={getImageUrl(product, product.image_file)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-300 font-bold text-2xl">
                  {product.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
              <p className="text-lg font-bold text-orange-600 mt-1">
                {formatPrice(product.price, product.currency || 'BRL')}
              </p>
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 hover:underline mt-1 inline-block"
                >
                  Ver oferta
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
