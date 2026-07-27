import { useEffect, useState, useCallback, useMemo } from 'react'
import { getBrands, getLogoUrl, type Top60Brand } from '@/services/top60'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Handshake, ExternalLink, AlertCircle, Building2 } from 'lucide-react'

export default function Partners() {
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getBrands()
      setBrands(data)
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
  useRealtime('top60_brands', () => loadData())

  const meta = useMemo(
    () => ({
      title: 'Parceiros — Revista Moda Atual',
      description: 'Conheça as marcas parceiras da Revista Moda Atual e do V Moda Brasil.',
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
            <Handshake className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Nossos Parceiros
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Conheça as marcas que fazem parte do ecossistema V Moda Brasil.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
            <p className="text-gray-500 max-w-md text-lg mb-6">
              Ocorreu um erro ao buscar os parceiros. Tente novamente.
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
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum parceiro ainda</h3>
            <p className="text-gray-500 max-w-md text-lg">
              Em breve você conhecerá as marcas parceiras do V Moda Brasil.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Card
                key={brand.id}
                className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white rounded-xl"
              >
                <div className="aspect-[2/1] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                  {brand.logo_file ? (
                    <img
                      src={getLogoUrl(brand, brand.logo_file)}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {brand.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
                    {brand.description || 'Parceiro V Moda Brasil.'}
                  </p>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Visitar site <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
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
