import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubscriber, type Subscriber } from '@/services/newsletter'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}
const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  inativo: 'bg-gray-100 text-gray-600',
  descadastrado: 'bg-red-100 text-red-700',
}

interface SubscribersTabProps {
  subscribers: Subscriber[]
  onRefresh: () => void
}

export function SubscribersTab({ subscribers, onRefresh }: SubscribersTabProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber(id)
      toast.success('Assinante excluído.')
      onRefresh()
    } catch {
      toast.error('Erro ao excluir assinante.')
    }
  }

  if (subscribers.length === 0) {
    return (
      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-8 text-center text-gray-500">
          Nenhum assinante cadastrado.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Segmento</th>
              <th className="text-left px-4 py-3 font-medium">Engaj.</th>
              <th className="text-left px-4 py-3 font-medium">Aberturas</th>
              <th className="text-left px-4 py-3 font-medium">Cliques</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscribers.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{sub.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{sub.email}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{SEGMENT_LABELS[sub.segment] || sub.segment}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{sub.engagement_score || 0}</td>
                <td className="px-4 py-3 text-gray-600">{sub.opened_count || 0}</td>
                <td className="px-4 py-3 text-gray-600">{sub.clicked_count || 0}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[sub.status] || 'bg-gray-100'}>{sub.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(sub.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
