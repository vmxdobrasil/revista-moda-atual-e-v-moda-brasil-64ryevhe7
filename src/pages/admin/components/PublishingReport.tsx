import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Clock, AlertCircle, XCircle, Send } from 'lucide-react'
import { PLATFORM_LABELS, STATUS_CONFIG } from '@/services/social-publisher'
import type { SocialPost } from '@/services/social-posts'

interface PublishingReportProps {
  posts: SocialPost[]
  loading: boolean
}

export function PublishingReport({ posts, loading }: PublishingReportProps) {
  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  const published = posts.filter((p) => p.status === 'published')
  const scheduled = posts.filter((p) => p.status === 'scheduled')
  const pending = posts.filter((p) => !p.status || p.status === 'pending')
  const failed = posts.filter((p) => p.status === 'failed')

  const stats = [
    {
      label: 'Publicados',
      count: published.length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Agendados',
      count: scheduled.length,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pendentes',
      count: pending.length,
      icon: AlertCircle,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
    },
    {
      label: 'Falhas',
      count: failed.length,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ]

  const activePosts = posts.filter((p) => p.status && p.status !== 'pending')

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-500" />
              Histórico de Publicações
            </h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {activePosts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                Nenhuma publicação agendada ou realizada ainda.
              </p>
            ) : (
              activePosts.map((post) => {
                const config = STATUS_CONFIG[post.status || 'pending'] || STATUS_CONFIG.pending
                return (
                  <div key={post.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{post.hook}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {post.platform ? PLATFORM_LABELS[post.platform] || post.platform : '—'}
                        {post.published_at &&
                          ` • Publicado em ${new Date(post.published_at).toLocaleString('pt-BR')}`}
                        {post.scheduled_at &&
                          !post.published_at &&
                          ` • Agendado para ${new Date(post.scheduled_at).toLocaleString('pt-BR')}`}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`gap-1 shrink-0 ${config.badgeClass}`}>
                      {config.label}
                    </Badge>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
