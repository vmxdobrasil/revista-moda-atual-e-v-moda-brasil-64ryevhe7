import pb from '@/lib/pocketbase/client'

export interface DashboardMetrics {
  editions: {
    total: number
    totalViews: number
    totalPages: number
  }
  socialPosts: {
    total: number
    totalViews: number
    totalLikes: number
    avgEngagement: number
  }
  workflowResults: {
    completed: number
    failed: number
    processing: number
  }
  deliveryQueue: {
    published: number
    pending: number
    total: number
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [editions, editionPages, socialPosts, workflowResults, deliveryQueue] = await Promise.all([
    pb.collection('editions').getFullList<any>(),
    pb.collection('edition_pages').getFullList<any>(),
    pb.collection('social_posts').getFullList<any>(),
    pb.collection('workflow_results').getFullList<any>(),
    pb.collection('delivery_queue').getFullList<any>(),
  ])

  return {
    editions: {
      total: editions.length,
      totalViews: editions.reduce((sum, e) => sum + (e.view_count || 0), 0),
      totalPages: editionPages.reduce((sum, p) => sum + (p.view_count || 0), 0),
    },
    socialPosts: {
      total: socialPosts.length,
      totalViews: socialPosts.reduce((sum, p) => sum + (p.views || 0), 0),
      totalLikes: socialPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
      avgEngagement:
        socialPosts.length > 0
          ? socialPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / socialPosts.length
          : 0,
    },
    workflowResults: {
      completed: workflowResults.filter((w) => w.status === 'completed').length,
      failed: workflowResults.filter((w) => w.status === 'failed').length,
      processing: workflowResults.filter((w) => w.status === 'processing').length,
    },
    deliveryQueue: {
      published: deliveryQueue.filter((d) => d.status === 'publicado').length,
      pending: deliveryQueue.filter((d) => d.status === 'rascunho' || d.status === 'em_revisao')
        .length,
      total: deliveryQueue.length,
    },
  }
}
