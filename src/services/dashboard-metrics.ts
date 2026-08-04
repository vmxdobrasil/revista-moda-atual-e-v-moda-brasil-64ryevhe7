import pb from '@/lib/pocketbase/client'

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

function countByField<T extends Record<string, any>>(
  items: T[],
  field: string,
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of items) {
    const val = item[field] || 'unknown'
    result[val] = (result[val] || 0) + 1
  }
  return result
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
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
    pb.collection('editions').getFullList<any>(),
    pb.collection('edition_pages').getFullList<any>(),
    pb.collection('social_posts').getFullList<any>(),
    pb.collection('workflow_results').getFullList<any>(),
    pb.collection('delivery_queue').getFullList<any>(),
    pb
      .collection('marketplace_orders')
      .getFullList<any>()
      .catch(() => []),
    pb.collection('notifications').getFullList<any>(),
    pb
      .collection('seo_metrics')
      .getFullList<any>()
      .catch(() => []),
  ])

  const spStatus = countByField(socialPosts, 'status')
  const wfQaStatus = countByField(workflowResults, 'qa_status')
  const dqStatus = countByField(deliveryQueue, 'status')
  const ordStatus = countByField(orders, 'status')
  const totalPosition = seoMetrics.reduce((sum, m) => sum + (m.position || 0), 0)

  return {
    editions: {
      total: editions.length,
      totalViews: editions.reduce((sum, e) => sum + (e.view_count || 0), 0),
      totalPages: editionPages.length,
    },
    socialPosts: {
      total: socialPosts.length,
      totalViews: socialPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: socialPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
      avgEngagement:
        socialPosts.length > 0
          ? socialPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / socialPosts.length
          : 0,
      byStatus: {
        pending: spStatus.pending || 0,
        scheduled: spStatus.scheduled || 0,
        published: spStatus.published || 0,
        failed: spStatus.failed || 0,
      },
    },
    workflowResults: {
      completed: workflowResults.filter((w) => w.status === 'completed').length,
      failed: workflowResults.filter((w) => w.status === 'failed').length,
      processing: workflowResults.filter((w) => w.status === 'processing').length,
      byQaStatus: {
        aprovado: wfQaStatus.aprovado || 0,
        revisar: wfQaStatus.revisar || 0,
        reprovado: wfQaStatus.reprovado || 0,
      },
    },
    deliveryQueue: {
      total: deliveryQueue.length,
      published: dqStatus.publicado || 0,
      pending: (dqStatus.rascunho || 0) + (dqStatus.em_revisao || 0),
      byStatus: {
        rascunho: dqStatus.rascunho || 0,
        em_revisao: dqStatus.em_revisao || 0,
        aprovado: dqStatus.aprovado || 0,
        publicado: dqStatus.publicado || 0,
      },
    },
    marketplaceOrders: {
      total: orders.length,
      pending: (ordStatus.pending || 0) + (ordStatus.confirmed || 0),
      delivered: ordStatus.delivered || 0,
      byStatus: {
        pending: ordStatus.pending || 0,
        confirmed: ordStatus.confirmed || 0,
        shipped: ordStatus.shipped || 0,
        delivered: ordStatus.delivered || 0,
        cancelled: ordStatus.cancelled || 0,
      },
    },
    notifications: {
      total: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
    },
    seoMetrics: {
      totalKeywords: seoMetrics.length,
      avgPosition: seoMetrics.length > 0 ? totalPosition / seoMetrics.length : 0,
    },
  }
}
