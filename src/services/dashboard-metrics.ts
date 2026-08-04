import pb from '@/lib/pocketbase/client'

export type PeriodFilter = '7d' | '30d' | 'this_month' | 'all'

export const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  this_month: 'Este mês',
  all: 'Todo o período',
}

function periodStart(p: PeriodFilter): string | null {
  if (p === 'all') return null
  const n = new Date()
  if (p === '7d') {
    const d = new Date(n)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }
  if (p === '30d') {
    const d = new Date(n)
    d.setDate(d.getDate() - 30)
    return d.toISOString()
  }
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString()
}

function pf(field: string, p: PeriodFilter): string | undefined {
  const s = periodStart(p)
  return s ? `${field} >= '${s}'` : undefined
}

export interface DashboardMetrics {
  editions: { total: number; totalViews: number; totalPages: number }
  socialPosts: {
    total: number
    totalViews: number
    totalLikes: number
    avgEngagement: number
    byStatus: { pending: number; scheduled: number; published: number; failed: number }
  }
  workflowResults: {
    completed: number
    failed: number
    processing: number
    byQaStatus: { aprovado: number; revisar: number; reprovado: number }
  }
  deliveryQueue: {
    total: number
    published: number
    pending: number
    byStatus: { rascunho: number; em_revisao: number; aprovado: number; publicado: number }
  }
  marketplaceOrders: {
    total: number
    pending: number
    delivered: number
    byStatus: {
      pending: number
      confirmed: number
      shipped: number
      delivered: number
      cancelled: number
    }
  }
  notifications: { total: number; unread: number }
  seoMetrics: { totalKeywords: number; avgPosition: number }
}

export interface DashboardRawData {
  editions: any[]
  editionPages: any[]
  socialPosts: any[]
  workflowResults: any[]
  deliveryQueue: any[]
  orders: any[]
  notifications: any[]
  seoMetrics: any[]
}

export interface DashboardData {
  metrics: DashboardMetrics
  raw: DashboardRawData
}

function countBy<T extends Record<string, any>>(items: T[], field: string): Record<string, number> {
  const r: Record<string, number> = {}
  for (const i of items) {
    const v = i[field] || 'unknown'
    r[v] = (r[v] || 0) + 1
  }
  return r
}

export async function getDashboardData(period: PeriodFilter): Promise<DashboardData> {
  const [
    editions,
    editionPages,
    socialPosts,
    workflowResults,
    deliveryQueue,
    orders,
    notifications,
    seoMetrics,
  ] = await Promise.all([
    pb.collection('editions').getFullList<any>({ filter: pf('created', period) }),
    pb.collection('edition_pages').getFullList<any>(),
    pb.collection('social_posts').getFullList<any>({ filter: pf('post_date', period) }),
    pb.collection('workflow_results').getFullList<any>({ filter: pf('created', period) }),
    pb.collection('delivery_queue').getFullList<any>({ filter: pf('created', period) }),
    pb
      .collection('marketplace_orders')
      .getFullList<any>({ filter: pf('created', period), expand: 'product' })
      .catch(() => []),
    pb.collection('notifications').getFullList<any>({ filter: pf('created', period) }),
    pb
      .collection('seo_metrics')
      .getFullList<any>({ filter: pf('tracked_date', period) })
      .catch(() => []),
  ])

  const sp = countBy(socialPosts, 'status')
  const qa = countBy(workflowResults, 'qa_status')
  const dq = countBy(deliveryQueue, 'status')
  const ord = countBy(orders, 'status')
  const pos = seoMetrics.reduce((s, m) => s + (m.position || 0), 0)

  const raw: DashboardRawData = {
    editions,
    editionPages,
    socialPosts,
    workflowResults,
    deliveryQueue,
    orders,
    notifications,
    seoMetrics,
  }

  const metrics: DashboardMetrics = {
    editions: {
      total: editions.length,
      totalViews: editions.reduce((s, e) => s + (e.view_count || 0), 0),
      totalPages: editionPages.length,
    },
    socialPosts: {
      total: socialPosts.length,
      totalViews: socialPosts.reduce((s, p) => s + (p.views || 0), 0),
      totalLikes: socialPosts.reduce((s, p) => s + (p.likes || 0), 0),
      avgEngagement:
        socialPosts.length > 0
          ? socialPosts.reduce((s, p) => s + (p.engagement_rate || 0), 0) / socialPosts.length
          : 0,
      byStatus: {
        pending: sp.pending || 0,
        scheduled: sp.scheduled || 0,
        published: sp.published || 0,
        failed: sp.failed || 0,
      },
    },
    workflowResults: {
      completed: workflowResults.filter((w) => w.status === 'completed').length,
      failed: workflowResults.filter((w) => w.status === 'failed').length,
      processing: workflowResults.filter((w) => w.status === 'processing').length,
      byQaStatus: {
        aprovado: qa.aprovado || 0,
        revisar: qa.revisar || 0,
        reprovado: qa.reprovado || 0,
      },
    },
    deliveryQueue: {
      total: deliveryQueue.length,
      published: dq.publicado || 0,
      pending: (dq.rascunho || 0) + (dq.em_revisao || 0),
      byStatus: {
        rascunho: dq.rascunho || 0,
        em_revisao: dq.em_revisao || 0,
        aprovado: dq.aprovado || 0,
        publicado: dq.publicado || 0,
      },
    },
    marketplaceOrders: {
      total: orders.length,
      pending: (ord.pending || 0) + (ord.confirmed || 0),
      delivered: ord.delivered || 0,
      byStatus: {
        pending: ord.pending || 0,
        confirmed: ord.confirmed || 0,
        shipped: ord.shipped || 0,
        delivered: ord.delivered || 0,
        cancelled: ord.cancelled || 0,
      },
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
    },
    seoMetrics: {
      totalKeywords: seoMetrics.length,
      avgPosition: seoMetrics.length > 0 ? pos / seoMetrics.length : 0,
    },
  }

  return { metrics, raw }
}
