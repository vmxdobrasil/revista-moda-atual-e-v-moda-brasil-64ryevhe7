import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, Edition, getFileUrl } from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Library, Settings, AlertCircle } from 'lucide-react'

export default function Index() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getEditions()
      setEditions(data)
      setError(false)
    } catch (err) {
      console.error('Failed to load editions on Index page:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('editions', () => {
    loadData().catch((err) => {
      console.error('Realtime data reload failed for editions:', err)
    })
  })

  const homeMeta = useMemo(
    () => ({
      title: 'Revista Moda Atual',
      description: 'A revista de moda brasileira que conecta estilo, tendências e informação.',
      image: '/og-image.png',
      url: window.location.origin,
      type: 'website',
    }),
    [],
  )

  useMetaTags(homeMeta)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b py-5 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <Link
          to="/"
          className="shrink-0 hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-orange-600 text-white font-extrabold text-sm md:text-lg shadow-md">
            V
          </div>
          <span className="text-orange-600 font-bold text-lg md:text-xl tracking-tight">
            MODA BRASIL
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            <Link
              to="/editions"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Edições
            </Link>
            <Link
              to="/partners"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Parceiros
            </Link>
            <Link
              to="/advertisements"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Anúncios
            </Link>
            <Link
              to="/offers"
              className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              Ofertas
            </Link>
          </nav>
          <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm md:text-base">
            <BookOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Acervo Digital</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
            <Link to="/admin">
              <Settings className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Revista Moda Atual
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
            Explore as últimas edições da nossa revista digital imersiva. Descubra as principais
            tendências, editoriais exclusivos e tenha acesso direto ao melhor do atacado brasileiro
            através de nossa vitrine interativa.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-full shadow-xl animate-fade-in-up"
          >
            <Link to="/reader/latest">
              <BookOpen className="w-6 h-6 mr-3" /> Ler Última Edição
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[0.7118] bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Erro ao carregar edições</h3>
            <p className="text-gray-500 max-w-md text-lg mb-6">
              Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.
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
        ) : editions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
              <Library className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma edição disponível</h3>
            <p className="text-gray-500 max-w-md text-lg">
              Ainda não há edições publicadas. Volte em breve para conferir as novidades!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {editions.map((ed) => (
              <Card
                key={ed.id}
                className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-xl"
              >
                <div className="relative aspect-[0.7118] overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url}
                    alt={ed.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <Button
                      asChild
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white shadow-lg h-12 text-md"
                    >
                      <Link to={`/edition/${ed.id}`}>
                        Ler Edição <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {ed.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {ed.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-12">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 text-white font-extrabold text-sm opacity-80">
              V
            </div>
            <span className="text-sm">Revista Moda Atual Digital</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm flex-wrap justify-center">
            <Link to="/" className="hover:text-orange-500 transition-colors">
              Início
            </Link>
            <Link to="/editions" className="hover:text-orange-500 transition-colors">
              Edições
            </Link>
            <Link to="/partners" className="hover:text-orange-500 transition-colors">
              Parceiros
            </Link>
            <Link to="/advertisements" className="hover:text-orange-500 transition-colors">
              Anúncios
            </Link>
            <Link to="/offers" className="hover:text-orange-500 transition-colors">
              Ofertas
            </Link>
            <Link to="/reader/latest" className="hover:text-orange-500 transition-colors">
              Ler Revista
            </Link>
            <Link to="/admin" className="hover:text-orange-500 transition-colors">
              Admin
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} V Moda Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
