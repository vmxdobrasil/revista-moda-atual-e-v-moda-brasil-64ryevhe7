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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { generateProposal, AD_FORMATS, FORMAT_LABELS, AD_POSITIONS } from '@/services/ad-proposals'
import { getEditions, type Edition } from '@/services/magazine'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface PropostaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

interface FormState {
  advertiser: string
  campaign: string
  edition_id: string
  format: string
  position: string
}

const emptyForm: FormState = {
  advertiser: '',
  campaign: '',
  edition_id: '',
  format: 'banner',
  position: '',
}

export function PropostaFormDialog({ open, onOpenChange, onCreated }: PropostaFormDialogProps) {
  const [editions, setEditions] = useState<Edition[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(emptyForm)
      getEditions()
        .then((eds) => setEditions(eds))
        .catch(() => {})
    }
  }, [open])

  const handleSubmit = async () => {
    if (!form.advertiser.trim()) {
      toast.error('Informe o nome do anunciante')
      return
    }
    setLoading(true)
    try {
      await generateProposal({
        advertiser: form.advertiser.trim(),
        campaign: form.campaign.trim() || undefined,
        edition_id: form.edition_id || undefined,
        format: form.format || undefined,
        position: form.position || undefined,
      })
      toast.success('Proposta gerada com sucesso!')
      onOpenChange(false)
      onCreated()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            Gerar Proposta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="prop-advertiser">Anunciante *</Label>
            <Input
              id="prop-advertiser"
              value={form.advertiser}
              onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
              placeholder="Nome do anunciante"
            />
          </div>
          <div>
            <Label htmlFor="prop-campaign">Campanha</Label>
            <Input
              id="prop-campaign"
              value={form.campaign}
              onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              placeholder="Nome da campanha"
            />
          </div>
          <div>
            <Label>Edição</Label>
            <Select
              value={form.edition_id}
              onValueChange={(v) => setForm({ ...form, edition_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar edição (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((ed) => (
                  <SelectItem key={ed.id} value={ed.id}>
                    {ed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Formato</Label>
            <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AD_FORMATS.map((fmt) => (
                  <SelectItem key={fmt} value={fmt}>
                    {FORMAT_LABELS[fmt]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Posição</Label>
            <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar posição (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {AD_POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Gerar Proposta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
