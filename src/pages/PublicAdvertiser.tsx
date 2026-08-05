import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import {
  Search,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ArrowLeft,
} from 'lucide-react'
import {
  getPublicAdvertiserData,
  PROPOSAL_STATUS_LABELS,
  STATUS_BADGE_CLASSES,
} from '@/services/ad-proposals'

interface CampaignData {
  id: string
  campaign: string
  edition_title: string
  format: string
  format_label: string
  position: string
  status: string
  delivery_date: string
  audience_reach: number
  contract_number: string
  contract_date_formal: string
  metrics: {
    total_views: number
    total_likes: number
    total_comments: number
    total_shares: number
    total_saves: number
    avg_engagement_rate: number
    post_count: number
  }
}

interface AdvertiserData {
  advertiser: string
  campaigns: CampaignData[]
  summary: {
    total_campaigns: number
    total_reach: number
    total_engagement: number
  }
}

export default function PublicAdvertiser() {
  const [search, setSearch] = useState('')
  const [activeAdvertiser, setActiveAdvertiser] = useState('')
  const [data, setData] = useState<AdvertiserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (advertiser: string) => {
    setLoading(true)
    setError('')
    try {
      const result = await getPublicAdvertiserData(advertiser)
      setData(result)
    } catch {
      setError('Não foi possível carregar os dados. Tente novamente.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeAdvertiser) {
      fetchData(activeAdvertiser)
      const interval = setInterval(() => fetchData(activeAdvertiser), 30000)
      return () => clearInterval(interval)
    }
  }, [activeAdvertiser, fetchData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      setActiveAdvertiser(search.trim())
    }
  }

  const chartConfig = {
    views: { label: 'Views', color: 'hsl(24, 95%, 53%)' },
    engagement: { label: 'Engajamento', color: 'hsl(142, 71%, 45%)' },
  }

  const reachData =
    data?.campaigns
      .filter((c) => c.metrics.total_views > 0)
      .map((c) => ({
        name: c.campaign || c.format_label,
        views: c.metrics.total_views,
        engagement:
          c.metrics.total_likes +
          c.metrics.total_comments +
          c.metrics.total_shares +
          c.metrics.total_saves,
      })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4 px-6 md:px-12">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 text-white font-extrabold text-sm">
              V
            </div>
            <span className="text-orange-600 font-bold text-lg tracking-tight">MODA BRASIL</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Voltar ao site
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Dashboard do Anunciante
          </h1>
          <p className="text-gray-500">Acompanhe o desempenho das suas campanhas em tempo real</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-8">
          <Input
            type="text"
            placeholder="Digite o nome do anunciante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gap-2">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </form>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center text-gray-500">{error}</CardContent>
          </Card>
        )}

        {!loading && !data && !error && (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center text-gray-400">
              Digite o nome do anunciante para visualizar o desempenho das campanhas.
            </CardContent>
          </Card>
        )}

        {data && !loading && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">{data.advertiser}</h2>
              <p className="text-sm text-gray-500">
                {data.summary.total_campaigns} campanha(s) ativa(s)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
                    <Eye className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Alcance Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {data.summary.total_reach.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Engajamento Total</p>
                    <p className="text-lg font-bold text-gray-900">
                      {data.summary.total_engagement.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                    <Bookmark className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campanhas</p>
                    <p className="text-lg font-bold text-gray-900">
                      {data.summary.total_campaigns}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {reachData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Alcance por Campanha</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={reachData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" fill="hsl(24, 95%, 53%)" radius={4} />
                      <Bar dataKey="engagement" fill="hsl(142, 71%, 45%)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {data.campaigns.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {c.campaign || c.format_label}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {c.edition_title || 'Edição não vinculada'} · {c.format_label}
                        </p>
                      </div>
                      <Badge
                        className={STATUS_BADGE_CLASSES[c.status] || 'bg-gray-100 text-gray-700'}
                        variant="secondary"
                      >
                        {PROPOSAL_STATUS_LABELS[c.status] || c.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span>{c.metrics.total_views.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span>{c.metrics.total_likes.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span>{c.metrics.total_comments.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-purple-400" />
                        <span>{c.metrics.total_shares.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-amber-400" />
                        <span>{c.metrics.total_saves.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    {(c.delivery_date || c.contract_number) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
                        {c.delivery_date && <span>Entrega: {c.delivery_date}</span>}
                        {c.contract_number && <span>Contrato: {c.contract_number}</span>}
                        {c.metrics.post_count > 0 && <span>{c.metrics.post_count} post(s)</span>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-xs text-gray-400">
              Dados atualizados a cada 30 segundos · © {new Date().getFullYear()} Revista MODA ATUAL
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
