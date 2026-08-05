import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Loader2, Trash2, Plus, Pencil, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  deleteCampaign,
  updateNewsletterCampaign,
  type NewsletterCampaign,
  type EditionOption,
} from '@/services/newsletter'
import { CampaignForm } from './CampaignForm'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  em_revisao: 'bg-yellow-100 text-yellow-700',
  aprovado: 'bg-blue-100 text-blue-700',
  agendado: 'bg-purple-100 text-purple-700',
  enviado: 'bg-green-100 text-green-700',
  falhou: 'bg-red-100 text-red-700',
}

const STATUS_FLOW = ['rascunho', 'em_revisao', 'aprovado', 'agendado', 'enviado', 'falhou']

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
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NewsletterCampaign | null>(null)
  const [selectedEdition, setSelectedEdition] = useState('')

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id)
      toast.success('Campanha excluída.')
      onRefresh()
    } catch {
      toast.error('Erro ao excluir campanha.')
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateNewsletterCampaign(id, { status })
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={selectedEdition} onValueChange={setSelectedEdition}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Edição (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Pautas da semana</SelectItem>
            {editions.map((ed) => (
              <SelectItem key={ed.id} value={ed.id}>
                {ed.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => onGenerate(selectedEdition)}
          disabled={generating}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Gerar Newsletter
        </Button>
        <Button
          variant="outline"
          className="gap-2 ml-auto"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4" /> Nova Campanha
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            Nenhuma campanha. Clique em "Gerar Newsletter" ou "Nova Campanha".
          </CardContent>
        </Card>
      ) : (
        campaigns.map((camp) => (
          <Card key={camp.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 truncate">{camp.title}</h3>
                    <Badge className={STATUS_COLORS[camp.status] || 'bg-gray-100'}>
                      {camp.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{camp.subject}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                    <span>Audiência: {camp.audience_size || 0}</span>
                    <span>Aberturas: {camp.opened_count || 0}</span>
                    <span>Taxa: {((camp.open_rate || 0) * 100).toFixed(1)}%</span>
                    <span>Cliques: {camp.click_count || 0}</span>
                    <span>Taxa: {((camp.click_rate || 0) * 100).toFixed(1)}%</span>
                    <span>Descadastros: {camp.unsubscribe_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Select
                      value={camp.status}
                      onValueChange={(v) => handleStatusChange(camp.id, v)}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_FLOW.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPreview(camp)}
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing(camp)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(camp.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <CampaignForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={onRefresh}
        editing={editing}
        editions={editions}
      />
    </div>
  )
}
