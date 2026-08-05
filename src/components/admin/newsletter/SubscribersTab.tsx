import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSubscriber, type Subscriber } from '@/services/newsletter'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}
const STATUS_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  descadastrado: 'bg-red-100 text-red-700',
  inativo: 'bg-gray-100 text-gray-700',
}

interface SubscribersTabProps {
  subscribers: Subscriber[]
  onRefresh: () => void
}

export function SubscribersTab({ subscribers, onRefresh }: SubscribersTabProps) {
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (
        search &&
        !s.name?.toLowerCase().includes(search.toLowerCase()) &&
        !s.email?.toLowerCase().includes(search.toLowerCase())
      )
        return false
      if (segmentFilter !== 'all' && s.segment !== segmentFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      return true
    })
  }, [subscribers, search, segmentFilter, statusFilter])

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriber(id)
      toast.success('Assinante removido.')
      onRefresh()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="pl-9"
          />
        </div>
        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos segmentos</SelectItem>
            <SelectItem value="varejo">Varejo</SelectItem>
            <SelectItem value="atacado">Atacado</SelectItem>
            <SelectItem value="consumidora">Consumidora</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="descadastrado">Descadastrado</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 px-3">Nome</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Segmento</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Score</th>
              <th className="py-2 px-3">Aberturas</th>
              <th className="py-2 px-3">Cliques</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={sub.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 text-gray-700">{sub.name || '—'}</td>
                <td className="py-2 px-3 text-gray-600 text-xs">{sub.email}</td>
                <td className="py-2 px-3">
                  <Badge variant="outline">{SEGMENT_LABELS[sub.segment] || sub.segment}</Badge>
                </td>
                <td className="py-2 px-3">
                  <Badge variant="secondary" className={STATUS_COLORS[sub.status] || ''}>
                    {sub.status}
                  </Badge>
                </td>
                <td className="py-2 px-3">
                  <span className="font-medium text-gray-700">{sub.engagement_score || 0}</span>
                </td>
                <td className="py-2 px-3 text-gray-500">{sub.opened_count || 0}</td>
                <td className="py-2 px-3 text-gray-500">{sub.clicked_count || 0}</td>
                <td className="py-2 px-3">
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(sub.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhum assinante encontrado.</p>
        )}
      </div>
      <p className="text-xs text-gray-400">
        {filtered.length} de {subscribers.length} assinantes
      </p>
    </div>
  )
}
