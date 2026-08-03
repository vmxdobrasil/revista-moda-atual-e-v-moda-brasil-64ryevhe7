import { useState, useEffect, useCallback } from 'react'
import { getDashboardMetrics, type DashboardMetrics as Metrics } from '@/services/dashboard-metrics'
import { useRealtime } from '@/hooks/use-realtime'
import { MetricCard } from '@/components/admin/MetricCard'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen,
  FileText,
  Eye,
  Instagram,
  Heart,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Package,
  Send,
  Clock,
  AlertCircle,
} from 'lucide-react'

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      setMetrics(await getDashboardMetrics())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar métricas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(true)
  }, [load])

  useRealtime('editions', () => load(false))
  useRealtime('edition_pages', () => load(false))
  useRealtime('social_posts', () => load(false))
  useRealtime('workflow_results', () => load(false))
  useRealtime('delivery_queue', () => load(false))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600">Erro ao carregar métricas: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          Por Edição
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={BookOpen}
            label="Total de Edições"
            value={metrics.editions.total}
            color="hsl(24, 95%, 53%)"
          />
          <MetricCard
            icon={FileText}
            label="Total de Páginas"
            value={metrics.editions.totalPages}
            color="hsl(210, 80%, 50%)"
          />
          <MetricCard
            icon={Eye}
            label="Views Acumuladas"
            value={metrics.editions.totalViews}
            color="hsl(140, 70%, 45%)"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Instagram className="w-5 h-5 text-purple-500" />
          Por Coleção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            icon={Instagram}
            label="Posts Publicados"
            value={metrics.socialPosts.total}
            color="hsl(280, 65%, 55%)"
          />
          <MetricCard
            icon={Eye}
            label="Total de Views"
            value={metrics.socialPosts.totalViews}
            color="hsl(190, 80%, 45%)"
          />
          <MetricCard
            icon={Heart}
            label="Total de Likes"
            value={metrics.socialPosts.totalLikes}
            color="hsl(340, 75%, 55%)"
          />
          <MetricCard
            icon={TrendingUp}
            label="Engajamento Médio"
            value={`${(metrics.socialPosts.avgEngagement * 100).toFixed(1)}%`}
            color="hsl(140, 70%, 45%)"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Workflows Concluídos"
            value={metrics.workflowResults.completed}
            color="hsl(140, 70%, 45%)"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          Fila de Entrega & Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Package}
            label="Fila Total"
            value={metrics.deliveryQueue.total}
            color="hsl(210, 80%, 50%)"
          />
          <MetricCard
            icon={Send}
            label="Publicados"
            value={metrics.deliveryQueue.published}
            color="hsl(140, 70%, 45%)"
          />
          <MetricCard
            icon={Clock}
            label="Pendentes"
            value={metrics.deliveryQueue.pending}
            color="hsl(40, 90%, 50%)"
          />
          <MetricCard
            icon={XCircle}
            label="Workflows Falhados"
            value={metrics.workflowResults.failed}
            color="hsl(0, 80%, 50%)"
          />
        </div>
      </div>
    </div>
  )
}
