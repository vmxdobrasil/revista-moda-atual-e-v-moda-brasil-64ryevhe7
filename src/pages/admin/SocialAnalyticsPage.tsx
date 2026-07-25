import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  getAllSocialPosts,
  getRecommendations,
  downloadCSV,
  type SocialPost,
  type RecommendationResponse,
} from '@/services/social-posts'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAlertSettings } from '@/hooks/use-alert-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MetricCard } from '@/components/admin/MetricCard'
import { PerformanceAlerts } from '@/components/admin/PerformanceAlerts'
import { AlertSettingsPanel } from '@/components/admin/AlertSettingsPanel'
import { MonthlyComparison } from '@/components/admin/MonthlyComparison'
import { RankingTable } from '@/components/admin/RankingTable'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { TopBottomCards } from '@/components/admin/TopBottomCards'
import { RecommendationsCard } from '@/components/admin/RecommendationsCard'
import { Download, TrendingUp, Eye, Heart, Star, FileText } from 'lucide-react'

export default function SocialAnalyticsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankMetric, setRankMetric] = useState<'engagement_rate' | 'views'>('engagement_rate')
  const { settings, updateSettings } = useAlertSettings()
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

  const sortedByMetric = useMemo(
    () => [...posts].sort((a, b) => (b[rankMetric] as number) - (a[rankMetric] as number)),
    [posts, rankMetric],
  )
  const top3 = useMemo(() => sortedByMetric.slice(0, 3), [sortedByMetric])
  const bottom3 = useMemo(() => sortedByMetric.slice(-3).reverse(), [sortedByMetric])
  const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0)
  const avgEngagement = posts.length
    ? posts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / posts.length
    : 0
  const topPerformers = posts.filter((p) => p.is_top_performer).length

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

  return (
    <div className="space-y-8">
      <div className="print-only">
        <h1 className="text-2xl font-bold">Relatório de BI Social</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR')}</p>
        <hr className="my-4" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Social Analytics</h2>
          <p className="text-gray-500 mt-1">Análise de performance dos posts do Instagram.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV(posts)} className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <FileText className="w-4 h-4" /> Exportar Relatório em PDF
          </Button>
          <AlertSettingsPanel settings={settings} onUpdate={updateSettings} />
        </div>
      </div>

      <PerformanceAlerts posts={posts} settings={settings} />

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

      <TopBottomCards top3={top3} bottom3={bottom3} totalPosts={posts.length} />
      <MonthlyComparison posts={posts} />
      <RankingTable
        posts={sortedByMetric}
        rankMetric={rankMetric}
        onRankMetricChange={setRankMetric}
      />
      <AnalyticsCharts posts={posts} />
      {recommendations && <RecommendationsCard data={recommendations} />}
    </div>
  )
}
