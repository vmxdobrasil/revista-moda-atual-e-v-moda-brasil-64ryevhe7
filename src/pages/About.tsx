import { useEffect, useState, useCallback, useMemo } from 'react'
import { getAboutContent, type AboutContent } from '@/services/about-content'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { AlertCircle, BookHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getAboutContent()
      setContent(data)
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

  useRealtime('about_content', () => loadData())

  const meta = useMemo(
    () => ({
      title: 'Sobre Nós — Revista Moda Atual',
      description: 'Conheça a história e a missão da Revista Moda Atual e do V Moda Brasil.',
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
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
              <p className="text-gray-500 max-w-md text-lg mb-6">
                Ocorreu um erro ao carregar o conteúdo. Tente novamente.
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
          ) : content ? (
            <article className="animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-8">
                <BookHeart className="w-8 h-8 text-orange-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-8">
                {content.title}
              </h1>
              <div className="prose prose-lg max-w-none">
                {content.body.split('\n').map((paragraph, i) => {
                  const trimmed = paragraph.trim()
                  if (!trimmed) return null
                  return (
                    <p key={i} className="text-gray-700 leading-relaxed mb-6 text-lg">
                      {trimmed}
                    </p>
                  )
                })}
              </div>
            </article>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
