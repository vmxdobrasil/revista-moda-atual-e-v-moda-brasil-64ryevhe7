import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  createCampaign,
  updateNewsletterCampaign,
  type NewsletterCampaign,
  type EditionOption,
} from '@/services/newsletter'

const SEGMENTS = ['varejo', 'atacado', 'consumidora']
const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
}
const STATUSES = ['rascunho', 'em_revisao', 'aprovado', 'agendado', 'enviado', 'falhou']

interface CampaignFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing?: NewsletterCampaign | null
  editions: EditionOption[]
}

export function CampaignForm({
  open,
  onOpenChange,
  onSaved,
  editing,
  editions,
}: CampaignFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    title: '',
    subject: '',
    preheader: '',
    segments: ['varejo', 'atacado', 'consumidora'] as string[],
    status: 'rascunho',
    scheduled_at: '',
    edition: '',
  })

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || '',
        subject: editing.subject || '',
        preheader: editing.preheader || '',
        segments: editing.segments || ['varejo', 'atacado', 'consumidora'],
        status: editing.status || 'rascunho',
        scheduled_at: editing.scheduled_at ? editing.scheduled_at.split(' ')[0] : '',
        edition: editing.edition || '',
      })
    } else {
      setForm({
        title: '',
        subject: '',
        preheader: '',
        segments: ['varejo', 'atacado', 'consumidora'],
        status: 'rascunho',
        scheduled_at: '',
        edition: '',
      })
    }
    setFieldErrors({})
  }, [editing, open])

  const toggleSegment = (seg: string) => {
    setForm((f) => ({
      ...f,
      segments: f.segments.includes(seg)
        ? f.segments.filter((s) => s !== seg)
        : [...f.segments, seg],
    }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data: Record<string, unknown> = {
        title: form.title,
        subject: form.subject,
        preheader: form.preheader,
        segments: form.segments,
        status: form.status,
      }
      if (form.scheduled_at) data.scheduled_at = form.scheduled_at
      if (form.edition) data.edition = form.edition
      if (editing) {
        await updateNewsletterCampaign(editing.id, data)
        toast({ title: 'Sucesso', description: 'Campanha atualizada.' })
      } else {
        await createCampaign(data)
        toast({ title: 'Sucesso', description: 'Campanha criada.' })
      }
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Verifique os campos.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Campanha' : 'Nova Campanha'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            {fieldErrors.title && <p className="text-sm text-red-500">{fieldErrors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Linha de assunto do email"
            />
            {fieldErrors.subject && <p className="text-sm text-red-500">{fieldErrors.subject}</p>}
          </div>
          <div className="space-y-2">
            <Label>Pré-cabeçalho</Label>
            <Input
              value={form.preheader}
              onChange={(e) => setForm((f) => ({ ...f, preheader: e.target.value }))}
              placeholder="Texto de pré-visualização"
            />
            {fieldErrors.preheader && (
              <p className="text-sm text-red-500">{fieldErrors.preheader}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Segmentos-alvo</Label>
            <div className="flex flex-wrap gap-4 pt-1">
              {SEGMENTS.map((seg) => (
                <div key={seg} className="flex items-center space-x-2">
                  <Checkbox
                    id={`seg-${seg}`}
                    checked={form.segments.includes(seg)}
                    onCheckedChange={() => toggleSegment(seg)}
                  />
                  <Label htmlFor={`seg-${seg}`} className="text-sm cursor-pointer">
                    {SEGMENT_LABELS[seg]}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agendar para</Label>
              <Input
                type="date"
                value={form.scheduled_at}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Edição relacionada</Label>
            <Select
              value={form.edition}
              onValueChange={(v) => setForm((f) => ({ ...f, edition: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {editions.map((ed) => (
                  <SelectItem key={ed.id} value={ed.id}>
                    {ed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {editing ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
