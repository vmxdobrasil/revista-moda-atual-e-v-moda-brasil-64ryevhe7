import { useEffect, useState, useCallback, useMemo } from 'react'
import { getActiveAds, getAdImageUrl, type Advertisement } from '@/services/advertisements'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { Button } from '@/components/ui/button'
import { Megaphone, AlertCircle, ImageOff } from 'lucide-react'

export default function Advertisements() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getActiveAds()
      setAds(data)
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
  useRealtime('advertisements', () => loadData())

  const meta = useMemo(
    () => ({
      title: 'Anúncios — Revista Moda Atual',
      description: 'Confira os anúncios e ofertas especiais dos parceiros da Revista Moda Atual.',
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
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
            <Megaphone className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Anúncios
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Ofertas e novidades dos nossos parceiros em destaque.
          </p>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 md:h-64 bg-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
            <p className="text-gray-500 max-w-md text-lg mb-6">
              Ocorreu um erro ao buscar os anúncios. Tente novamente.
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
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <ImageOff className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhum anúncio ativo</h3>
            <p className="text-gray-500 max-w-md text-lg">
              No momento não há anúncios em exibição. Volte em breve!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {ads.map((ad) => {
              const imgUrl = getAdImageUrl(ad, ad.image)
              const content = (
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 group">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={ad.title}
                      className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100">
                      <div className="text-center">
                        <Megaphone className="w-12 h-12 text-orange-300 mx-auto mb-2" />
                        <p className="text-gray-400 font-medium">{ad.title}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-semibold text-sm md:text-base">{ad.title}</p>
                  </div>
                </div>
              )
              return ad.url ? (
                <a
                  key={ad.id}
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              ) : (
                <div key={ad.id}>{content}</div>
              )
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
