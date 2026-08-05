import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Copy, Trash2, Eye, FileCode, FileSpreadsheet, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteCampaign,
  duplicateCampaign,
  updateCampaign,
  createCampaign,
  exportCampaignHtml,
  exportCampaignCsv,
  type NewsletterCampaign,
  type EditionOption,
} from '@/services/newsletter'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  em_revisao: 'bg-blue-100 text-blue-700',
  aprovado: 'bg-green-100 text-green-700',
  agendado: 'bg-yellow-100 text-yellow-700',
  enviado: 'bg-purple-100 text-purple-700',
  falhou: 'bg-red-100 text-red-700',
}

const STATUS_FLOW = ['rascunho', 'em_revisao', 'aprovado', 'agendado', 'enviado']

interface CampaignsTabProps {
  campaigns: NewsletterCampaign[]
  editions: EditionOption[]
  onGenerate: (editionId: string) => void
  generating: boolean
  onRefresh: () => void
  onPreview: (campaign: NewsletterCampaign) => void
}

export function CampaignsTab({
  campaigns,
  editions,
  onGenerate,
  generating,
  onRefresh,
  onPreview,
}: CampaignsTabProps) {
  const [selectedEdition, setSelectedEdition] = useState('')
  const [editingCampaign, setEditingCampaign] = useState<NewsletterCampaign | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    subject: '',
    preheader: '',
    segments: 'varejo',
    scheduled_at: '',
    send_date: '',
  })

  const sortedCampaigns = useMemo(
    () =>
      [...campaigns].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()),
    [campaigns],
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id)
      toast.success('Campanha removida.')
      onRefresh()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCampaign(id)
      toast.success('Campanha duplicada.')
      onRefresh()
    } catch {
      toast.error('Erro ao duplicar.')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateCampaign(id, { status })
      toast.success('Status atualizado.')
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleExportHtml = (campaign: NewsletterCampaign) => {
    const html = exportCampaignHtml(campaign)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign.title || 'newsletter'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = (campaign: NewsletterCampaign) => {
    const csv = exportCampaignCsv(campaign)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign.title || 'newsletter'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCreate = async () => {
    try {
      await createCampaign({
        title: form.title || 'Nova campanha',
        subject: form.subject,
        preheader: form.preheader,
        segments:
          form.segments === 'todos' ? ['varejo', 'atacado', 'consumidora'] : [form.segments],
        status: 'rascunho',
        audience_size: 0,
        scheduled_at: form.scheduled_at || null,
        send_date: form.send_date || null,
        content: { sections: [], cta: '' },
      })
      toast.success('Campanha criada.')
      setCreateOpen(false)
      onRefresh()
      setForm({
        title: '',
        subject: '',
        preheader: '',
        segments: 'varejo',
        scheduled_at: '',
        send_date: '',
      })
    } catch {
      toast.error('Erro ao criar campanha.')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingCampaign) return
    try {
      await updateCampaign(editingCampaign.id, {
        title: editingCampaign.title,
        subject: editingCampaign.subject,
        preheader: editingCampaign.preheader,
        scheduled_at: editingCampaign.scheduled_at || null,
        send_date: editingCampaign.send_date || null,
      })
      toast.success('Campanha atualizada.')
      setEditingCampaign(null)
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedEdition} onValueChange={setSelectedEdition}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Edição (ou semanal)" />
          </SelectTrigger>
          <SelectContent>
            {editions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => onGenerate(selectedEdition)}
          disabled={generating}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Gerar Newsletter
        </Button>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Assunto</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div>
                <Label>Preheader</Label>
                <Input
                  value={form.preheader}
                  onChange={(e) => setForm({ ...form, preheader: e.target.value })}
                />
              </div>
              <div>
                <Label>Segmento</Label>
                <Select
                  value={form.segments}
                  onValueChange={(v) => setForm({ ...form, segments: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="varejo">Varejo</SelectItem>
                    <SelectItem value="atacado">Atacado</SelectItem>
                    <SelectItem value="consumidora">Consumidora</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Agendar para</Label>
                <Input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Criar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sortedCampaigns.map((camp) => (
          <Card key={camp.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{camp.title}</p>
                    <Badge variant="secondary" className={STATUS_COLORS[camp.status] || ''}>
                      {camp.status}
                    </Badge>
                  </div>
                  {camp.subject && <p className="text-sm text-gray-500">{camp.subject}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    {(camp.segments || []).map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                    <span>Audiência: {camp.audience_size || 0}</span>
                    <span>Aberturas: {camp.opened_count || 0}</span>
                    <span>Cliques: {camp.click_count || 0}</span>
                    {camp.scheduled_at && (
                      <span>
                        Agendada: {new Date(camp.scheduled_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Select value={camp.status} onValueChange={(v) => handleStatusChange(camp.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FLOW.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                      <SelectItem value="falhou">falhou</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => onPreview(camp)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingCampaign(camp)}>
                    <FileCode className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleExportHtml(camp)}>
                    <FileCode className="w-4 h-4 text-orange-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleExportCsv(camp)}>
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDuplicate(camp.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(camp.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sortedCampaigns.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma campanha encontrada.</p>
        )}
      </div>

      {editingCampaign && (
        <Dialog open={!!editingCampaign} onOpenChange={(o) => !o && setEditingCampaign(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Campanha</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={editingCampaign.title}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Assunto</Label>
                <Input
                  value={editingCampaign.subject || ''}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, subject: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Preheader</Label>
                <Input
                  value={editingCampaign.preheader || ''}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, preheader: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Agendar para</Label>
                <Input
                  type="datetime-local"
                  value={
                    editingCampaign.scheduled_at ? editingCampaign.scheduled_at.slice(0, 16) : ''
                  }
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, scheduled_at: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Enviar em</Label>
                <Input
                  type="datetime-local"
                  value={editingCampaign.send_date ? editingCampaign.send_date.slice(0, 16) : ''}
                  onChange={(e) =>
                    setEditingCampaign({ ...editingCampaign, send_date: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
