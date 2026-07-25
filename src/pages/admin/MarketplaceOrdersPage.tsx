import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getOrders,
  updateOrderStatus,
  formatPrice,
  type MarketplaceOrder,
} from '@/services/marketplace'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { ArrowLeft, ShoppingBag } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function MarketplaceOrdersPage() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setOrders(await getOrders(statusFilter !== 'all' ? statusFilter : undefined))
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar pedidos.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast, statusFilter])

  useRealtime('marketplace_orders', () => loadData())
  useMemo(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrderStatus(id, newStatus)
      toast({ title: 'Sucesso', description: 'Status atualizado.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao atualizar.', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
          <ShoppingBag className="text-orange-500" /> Pedidos
        </h2>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/admin/vmodebrasil">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-10">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium text-gray-900">
                    {o.expand?.product?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{o.customer_name}</span>
                      <span className="text-xs text-gray-400">{o.customer_email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{o.quantity}</TableCell>
                  <TableCell className="font-bold text-orange-500">
                    {formatPrice(o.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLORS[o.status] || ''} variant="secondary">
                        {STATUS_LABELS[o.status] || o.status}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            Alterar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Alterar status do pedido?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Selecione o novo status para o pedido de {o.customer_name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Select
                            defaultValue={o.status}
                            onValueChange={(v) => {
                              ;(document.activeElement as HTMLElement)?.blur()
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                const sel = document.querySelector(
                                  '[data-radix-collection-item]',
                                ) as HTMLElement
                                handleStatusChange(
                                  o.id,
                                  (document.querySelector('select') as HTMLSelectElement)?.value ||
                                    o.status,
                                )
                              }}
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
