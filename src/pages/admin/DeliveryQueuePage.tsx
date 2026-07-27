import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDeliveryQueueItems,
  deleteDelivery,
  markAsPublished,
  STATUS_CONFIG,
  type DeliveryQueueItem,
  type DeliveryStatus,
} from '@/services/delivery-queue'
import { useRealtime } from '@/hooks/use-realtime'
import { DeliveryCreateForm } from './components/DeliveryCreateForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Eye, Trash2, Send, ClipboardList } from 'lucide-react'

export default function DeliveryQueuePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [items, setItems] = useState<DeliveryQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadData = useCallback(async () => {
    try {
      const data = await getDeliveryQueueItems(statusFilter === 'all' ? undefined : statusFilter)
      setItems(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar entregas.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, statusFilter])

  useRealtime('delivery_queue', () => loadData())
  useMemo(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await deleteDelivery(id)
      toast({ title: 'Sucesso', description: 'Entrega excluída.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await markAsPublished(id)
      toast({ title: 'Sucesso', description: 'Marcado como publicado.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao publicar.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-orange-500" /> Fila de Entrega
          </h2>
          <p className="text-gray-500 mt-1">
            Gerencie o fluxo de entrega de conteúdo para Instagram.
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Entrega
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Filtrar por status:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="em_revisao">Em Revisão</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhuma entrega encontrada.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tema</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.theme}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.expand?.product?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_CONFIG[item.status as DeliveryStatus]?.color || 'bg-gray-500'
                      }
                    >
                      {STATUS_CONFIG[item.status as DeliveryStatus]?.label || item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(item.created).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/admin/delivery-queue/${item.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {item.status === 'aprovado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePublish(item.id)}
                          className="text-green-600"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir entrega?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DeliveryCreateForm open={formOpen} onOpenChange={setFormOpen} onSaved={loadData} />
    </div>
  )
}
