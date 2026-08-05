import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2, Plus, Trash2, FileDown, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  getProposals,
  deleteProposal,
  updateProposal,
  PROPOSAL_STATUSES,
  PROPOSAL_STATUS_LABELS,
  FORMAT_LABELS,
  type AdProposal,
} from '@/services/ad-proposals'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { PropostaFormDialog } from './PropostaFormDialog'
import { PropostaDetailDialog } from './PropostaDetailDialog'
import { exportProposalHTML } from '@/lib/proposal-export'

export function PropostasTab() {
  const [proposals, setProposals] = useState<AdProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailProposal, setDetailProposal] = useState<AdProposal | null>(null)

  const loadData = async () => {
    try {
      setProposals(await getProposals())
    } catch {
      toast.error('Erro ao carregar propostas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('ad_proposals', () => {
    loadData()
  })

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateProposal(id, { status })
      toast.success('Status atualizado')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDateChange = async (
    id: string,
    field: 'contract_date' | 'delivery_date',
    value: string,
  ) => {
    if (!value) return
    try {
      await updateProposal(id, { [field]: value })
      toast.success('Data atualizada')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta proposta?')) return
    try {
      await deleteProposal(id)
      toast.success('Proposta excluída')
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Gerar Proposta
        </Button>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anunciante</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Edição</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Alcance</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.advertiser}</TableCell>
                <TableCell>{p.campaign || '-'}</TableCell>
                <TableCell className="max-w-[120px] truncate">
                  {p.expand?.edition?.title || '-'}
                </TableCell>
                <TableCell>{p.format ? FORMAT_LABELS[p.format] || p.format : '-'}</TableCell>
                <TableCell>{p.audience_reach?.toLocaleString('pt-BR') || '-'}</TableCell>
                <TableCell>
                  {p.suggested_price ? `R$ ${p.suggested_price.toLocaleString('pt-BR')}` : '-'}
                </TableCell>
                <TableCell>
                  {p.match_score ? `${(p.match_score * 100).toFixed(0)}%` : '-'}
                </TableCell>
                <TableCell>
                  <Select
                    value={p.status || 'rascunho'}
                    onValueChange={(v) => handleStatusChange(p.id, v)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPOSAL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {PROPOSAL_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={p.contract_date?.slice(0, 10) || ''}
                    onChange={(e) => handleDateChange(p.id, 'contract_date', e.target.value)}
                    className="w-36 h-8"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={p.delivery_date?.slice(0, 10) || ''}
                    onChange={(e) => handleDateChange(p.id, 'delivery_date', e.target.value)}
                    className="w-36 h-8"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDetailProposal(p)}>
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => exportProposalHTML(p)}>
                      <FileDown className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {proposals.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-gray-400 py-8">
                  Nenhuma proposta encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PropostaFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={loadData} />

      <PropostaDetailDialog
        proposal={detailProposal}
        onOpenChange={(open) => {
          if (!open) setDetailProposal(null)
        }}
      />
    </div>
  )
}
