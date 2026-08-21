import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getEditions, Edition, getFileUrl } from '@/services/magazine'
import { getBrands, type Top60Brand } from '@/services/top60'
import { useRealtime } from '@/hooks/use-realtime'
import { useMetaTags } from '@/hooks/use-meta-tags'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Library, AlertCircle, Search, Sparkles } from 'lucide-react'
import { SubscriberCoverBadge } from '@/components/SubscriberCoverBadge'

export default function Editions() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')

  const loadData = useCallback(async () => {
    try {
      const [data, b] = await Promise.all([getEditions(), getBrands()])
      setEditions(data)
      setBrands(b)
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
  useRealtime('editions', () => loadData())

  const meta = useMemo(
    () => ({
      title: 'Edições — Revista Moda Atual',
      description: 'Todas as edições da Revista Moda Atual disponíveis para leitura.',
      image: '/og-image.png',
      url: window.location.origin,
      type: 'website',
    }),
    [],
  )
  useMetaTags(meta)

  const filtered = useMemo(() => {
    return editions.filter((ed) => {
      if (brandFilter !== 'all' && ed.brand !== brandFilter) return false
      if (search && !ed.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [editions, search, brandFilter])

  const showHighlight = search === '' && brandFilter === 'all'

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Todas as Edições
        </h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
          Explore todas as edições da Revista Moda Atual. Clique em qualquer capa para começar a
          leitura interativa.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filtrar por marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[0.7118] bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
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
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6">
            <Library className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Nenhuma edição encontrada</h3>
          <p className="text-gray-500 max-w-md text-lg">
            Não há edições que correspondam aos seus filtros. Tente limpar a busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
          {filtered.map((ed, idx) => {
            const isLatest = showHighlight && idx === 0
            return (
              <Card
                key={ed.id}
                className={cn(
                  'overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white rounded-xl relative',
                  isLatest && 'ring-2 ring-orange-500 shadow-lg',
                )}
              >
                {isLatest && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-orange-600 text-white shadow-md gap-1">
                      <Sparkles className="w-3 h-3" /> Edição Mais Recente
                    </Badge>
                  </div>
                )}
                <div className="relative aspect-[0.7118] overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={ed.cover_file ? getFileUrl(ed, ed.cover_file) : ed.cover_url}
                    alt={ed.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <SubscriberCoverBadge variant="compact" />
                  </div>
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
            )
          })}
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
