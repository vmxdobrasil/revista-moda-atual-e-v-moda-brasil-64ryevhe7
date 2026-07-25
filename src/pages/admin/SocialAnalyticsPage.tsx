import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  getAllSocialPosts,
  getRecommendations,
  downloadCSV,
  type SocialPost,
  type RecommendationResponse,
} from '@/services/social-posts'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import {
  Download,
  Trophy,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Star,
} from 'lucide-react'

const FORMAT_COLORS: Record<string, string> = {
  Reel: 'hsl(24, 95%, 53%)',
  Carousel: 'hsl(280, 65%, 60%)',
  Photo: 'hsl(200, 80%, 50%)',
}

export default function SocialAnalyticsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankMetric, setRankMetric] = useState<'engagement_rate' | 'views'>('engagement_rate')
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      const [postData, recData] = await Promise.all([getAllSocialPosts(), getRecommendations()])
      setPosts(postData)
      setRecommendations(recData)
    } catch {
      toast({
        title: 'Erro',
        description: 'Failed to load analytics data.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('social_posts', () => {
    loadData()
  })

  const sortedByMetric = useMemo(() => {
    return [...posts].sort((a, b) => (b[rankMetric] as number) - (a[rankMetric] as number))
  }, [posts, rankMetric])

  const top3 = useMemo(() => sortedByMetric.slice(0, 3), [sortedByMetric])
  const bottom3 = useMemo(() => sortedByMetric.slice(-3).reverse(), [sortedByMetric])

  const formatDistribution = useMemo(() => {
    const dist: Record<string, number> = {}
    posts.forEach((p) => {
      dist[p.format] = (dist[p.format] || 0) + 1
    })
    return Object.entries(dist).map(([name, value]) => ({
      name,
      value,
      fill: FORMAT_COLORS[name] || 'hsl(0,0%,50%)',
    }))
  }, [posts])

  const top10ByViews = useMemo(() => {
    return [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map((p) => ({
        name: p.hook.length > 25 ? p.hook.slice(0, 25) + '…' : p.hook,
        views: p.views,
      }))
  }, [posts])

  const viewsOverTime = useMemo(() => {
    const grouped: Record<string, number> = {}
    posts.forEach((p) => {
      const date = p.post_date?.split(' ')[0] || ''
      if (!date) return
      const monthKey = date.substring(0, 7)
      grouped[monthKey] = (grouped[monthKey] || 0) + (p.views || 0)
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, views]) => ({ month, views }))
  }, [posts])

  const chartConfig: ChartConfig = {
    views: { label: 'Views', color: 'hsl(24, 95%, 53%)' },
  }

  const getRankBadge = (index: number, total: number) => {
    if (index < 3) return <Badge className="bg-orange-500 text-white">Top 3</Badge>
    if (index >= total - 3) return <Badge variant="destructive">Bottom 3</Badge>
    return null
  }

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: any
    label: string
    value: string | number
    color: string
  }) => (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
          style={{ backgroundColor: color + '1a' }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl border-none bg-white shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Analytics</h2>
          <p className="text-gray-500 mt-1">Análise de performance dos posts do Instagram.</p>
        </div>
        <div className="py-16 text-center bg-white rounded-xl border border-dashed">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg px-4 max-w-md mx-auto">
            Nenhum post cadastrado. Acesse "Social Posts" para adicionar métricas.
          </p>
        </div>
      </div>
    )
  }

  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0)
  const avgEngagement = posts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / posts.length
  const topPerformers = posts.filter((p) => p.is_top_performer).length

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Analytics</h2>
          <p className="text-gray-500 mt-1">Análise de performance dos posts do Instagram.</p>
        </div>
        <Button variant="outline" onClick={() => downloadCSV(posts)} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Eye}
          label="Total de Views"
          value={totalViews.toLocaleString('pt-BR')}
          color="hsl(24, 95%, 53%)"
        />
        <MetricCard
          icon={Heart}
          label="Engajamento Médio"
          value={`${(avgEngagement * 100).toFixed(1)}%`}
          color="hsl(0, 84%, 60%)"
        />
        <MetricCard
          icon={Star}
          label="Top Performers"
          value={topPerformers}
          color="hsl(45, 93%, 47%)"
        />
        <MetricCard
          icon={TrendingUp}
          label="Total de Posts"
          value={posts.length}
          color="hsl(200, 80%, 50%)"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Performance Ranking</h3>
        <ToggleGroup
          type="single"
          value={rankMetric}
          onValueChange={(v) => v && setRankMetric(v as 'engagement_rate' | 'views')}
        >
          <ToggleGroupItem value="engagement_rate">Por Engajamento</ToggleGroupItem>
          <ToggleGroupItem value="views">Por Views</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Trophy className="w-5 h-5" /> Top 3 Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {top3.map((post, i) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">{post.hook}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span>{post.views.toLocaleString('pt-BR')} views</span>
                    <span>{((post.engagement_rate || 0) * 100).toFixed(1)}% eng.</span>
                    <span>{post.format}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <TrendingDown className="w-5 h-5" /> Bottom 3 Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bottom3.map((post, i) => (
              <div
                key={post.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-400 text-white font-bold text-sm shrink-0">
                  {posts.length - i}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">{post.hook}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span>{post.views.toLocaleString('pt-BR')} views</span>
                    <span>{((post.engagement_rate || 0) * 100).toFixed(1)}% eng.</span>
                    <span>{post.format}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Hook</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Likes</TableHead>
                <TableHead className="text-right">Eng. Rate</TableHead>
                <TableHead className="text-center">Like Rate</TableHead>
                <TableHead className="text-center">Comment Rate</TableHead>
                <TableHead className="text-center">Share Rate</TableHead>
                <TableHead className="text-center">Save Rate</TableHead>
                <TableHead className="text-center">Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedByMetric.map((post, i) => (
                <TableRow key={post.id}>
                  <TableCell className="font-bold text-gray-700">{i + 1}</TableCell>
                  <TableCell className="font-medium text-gray-900 max-w-[200px] truncate">
                    {post.hook}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {post.views.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {post.likes.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right font-medium text-orange-600">
                    {((post.engagement_rate || 0) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.likes / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.comments / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.shares / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center text-gray-500">
                    {post.views ? ((post.saves / post.views) * 100).toFixed(1) : '0'}%
                  </TableCell>
                  <TableCell className="text-center">
                    {getRankBadge(i, sortedByMetric.length)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Views por Post (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10ByViews} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    fontSize={12}
                  />
                  <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(24, 95%, 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-800">Distribuição de Formatos</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {formatDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-800">Views ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsOverTime} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(24, 95%, 53%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(24, 95%, 53%)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {recommendations && (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Lightbulb className="w-5 h-5 text-orange-500" /> Pattern Detection & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.patterns.formats.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Performance por Formato
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendations.patterns.formats.map((f) => (
                    <div
                      key={f.format}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          style={{
                            backgroundColor: FORMAT_COLORS[f.format] || 'gray',
                            color: 'white',
                          }}
                        >
                          {f.format}
                        </Badge>
                        <span className="text-xs text-gray-400">{f.count} posts</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {(f.avgEngagement * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">engajamento médio</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.patterns.themes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Temas Mais Frequentes (Top Posts)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recommendations.patterns.themes.map((t) => (
                    <Badge key={t.word} variant="outline" className="text-sm">
                      {t.word} <span className="text-gray-400 ml-1">({t.count}x)</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recomendações</h4>
              <ul className="space-y-2">
                {recommendations.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
