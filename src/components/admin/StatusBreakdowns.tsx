import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { DashboardMetrics as Metrics } from '@/services/dashboard-metrics'
import { Layers } from 'lucide-react'

interface BreakdownItem {
  label: string
  value: number
  className: string
}

function BreakdownCard({ title, items }: { title: string; items: BreakdownItem[] }) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item.label} variant="secondary" className={item.className}>
              {item.label}: {item.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function StatusBreakdowns({ metrics }: { metrics: Metrics }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Layers className="w-5 h-5 text-gray-600" />
        Breakdowns por Status
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <BreakdownCard
          title="Social Posts"
          items={[
            {
              label: 'Pending',
              value: metrics.socialPosts.byStatus.pending,
              className: 'bg-gray-100 text-gray-700',
            },
            {
              label: 'Scheduled',
              value: metrics.socialPosts.byStatus.scheduled,
              className: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'Published',
              value: metrics.socialPosts.byStatus.published,
              className: 'bg-green-100 text-green-700',
            },
            {
              label: 'Failed',
              value: metrics.socialPosts.byStatus.failed,
              className: 'bg-red-100 text-red-700',
            },
          ]}
        />
        <BreakdownCard
          title="Workflow Status"
          items={[
            {
              label: 'Processing',
              value: metrics.workflowResults.processing,
              className: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'Completed',
              value: metrics.workflowResults.completed,
              className: 'bg-green-100 text-green-700',
            },
            {
              label: 'Failed',
              value: metrics.workflowResults.failed,
              className: 'bg-red-100 text-red-700',
            },
          ]}
        />
        <BreakdownCard
          title="Workflow QA"
          items={[
            {
              label: 'Aprovado',
              value: metrics.workflowResults.byQaStatus.aprovado,
              className: 'bg-green-100 text-green-700',
            },
            {
              label: 'Revisar',
              value: metrics.workflowResults.byQaStatus.revisar,
              className: 'bg-yellow-100 text-yellow-700',
            },
            {
              label: 'Reprovado',
              value: metrics.workflowResults.byQaStatus.reprovado,
              className: 'bg-red-100 text-red-700',
            },
          ]}
        />
        <BreakdownCard
          title="Delivery Queue"
          items={[
            {
              label: 'Rascunho',
              value: metrics.deliveryQueue.byStatus.rascunho,
              className: 'bg-gray-100 text-gray-700',
            },
            {
              label: 'Em Revisão',
              value: metrics.deliveryQueue.byStatus.em_revisao,
              className: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'Aprovado',
              value: metrics.deliveryQueue.byStatus.aprovado,
              className: 'bg-green-100 text-green-700',
            },
            {
              label: 'Publicado',
              value: metrics.deliveryQueue.byStatus.publicado,
              className: 'bg-purple-100 text-purple-700',
            },
          ]}
        />
        <BreakdownCard
          title="Marketplace Orders"
          items={[
            {
              label: 'Pending',
              value: metrics.marketplaceOrders.byStatus.pending,
              className: 'bg-gray-100 text-gray-700',
            },
            {
              label: 'Confirmed',
              value: metrics.marketplaceOrders.byStatus.confirmed,
              className: 'bg-blue-100 text-blue-700',
            },
            {
              label: 'Shipped',
              value: metrics.marketplaceOrders.byStatus.shipped,
              className: 'bg-yellow-100 text-yellow-700',
            },
            {
              label: 'Delivered',
              value: metrics.marketplaceOrders.byStatus.delivered,
              className: 'bg-green-100 text-green-700',
            },
            {
              label: 'Cancelled',
              value: metrics.marketplaceOrders.byStatus.cancelled,
              className: 'bg-red-100 text-red-700',
            },
          ]}
        />
        <BreakdownCard
          title="Notificações"
          items={[
            {
              label: 'Total',
              value: metrics.notifications.total,
              className: 'bg-gray-100 text-gray-700',
            },
            {
              label: 'Não Lidas',
              value: metrics.notifications.unread,
              className: 'bg-red-100 text-red-700',
            },
          ]}
        />
      </div>
    </div>
  )
}
