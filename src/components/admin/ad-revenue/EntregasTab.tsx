import { useState, useEffect } from 'react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAllAds, updateAd, type Advertisement } from '@/services/advertisements'
import { AD_STATUSES, AD_STATUS_LABELS } from '@/services/ad-proposals'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

export function EntregasTab() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const all = await getAllAds()
      setAds(
        all.filter(
          (a) =>
            a.status === 'em_entrega' ||
            a.status === 'entregue' ||
            a.status === 'aprovado' ||
            !!a.delivery,
        ),
      )
    } catch {
      toast.error('Erro ao carregar entregas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('advertisements', () => {
    loadData()
  })

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const fd = new FormData()
      fd.append('status', status)
      await updateAd(id, fd)
      toast.success('Status atualizado')
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  const today = new Date()
  const isOverdue = (delivery?: string) => delivery && new Date(delivery) < today

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Anunciante</TableHead>
            <TableHead>Campanha</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Prazo de Entrega</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.id}>
              <TableCell className="font-medium">{ad.advertiser || ad.title}</TableCell>
              <TableCell>{ad.campaign || '-'}</TableCell>
              <TableCell>{ad.price ? `R$ ${ad.price.toLocaleString('pt-BR')}` : '-'}</TableCell>
              <TableCell className={isOverdue(ad.delivery) ? 'text-red-600 font-semibold' : ''}>
                {ad.delivery ? new Date(ad.delivery).toLocaleDateString('pt-BR') : '-'}
                {isOverdue(ad.delivery) && <span className="ml-1 text-xs">(atrasado)</span>}
              </TableCell>
              <TableCell>
                <Select
                  value={ad.status || 'rascunho'}
                  onValueChange={(v) => handleStatusChange(ad.id, v)}
                >
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {AD_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {ads.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                Nenhuma entrega encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
