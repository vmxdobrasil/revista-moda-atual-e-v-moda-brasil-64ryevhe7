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
import { Loader2, Sparkles, Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  generateProposta,
  createProposal,
  AD_FORMATS,
  FORMAT_LABELS,
} from '@/services/ad-proposals'
import { getEditions, type Edition } from '@/services/magazine'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function PropostaFormDialog({ open, onOpenChange, onCreated }: Props) {
  const [advertiser, setAdvertiser] = useState('')
  const [campaign, setCampaign] = useState('')
  const [edition, setEdition] = useState('')
  const [format, setFormat] = useState('')
  const [position, setPosition] = useState('')
  const [editions, setEditions] = useState<Edition[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    if (open) {
      getEditions()
        .then(setEditions)
        .catch(() => {})
      setResult(null)
      setFieldErrors({})
    }
  }, [open])

  const handleGenerate = async () => {
    setGenerating(true)
    setFieldErrors({})
    try {
      const res = await generateProposta({ advertiser, campaign, edition, format, position })
      setResult(res)
      toast.success('Proposta gerada com sucesso!')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      await createProposal({
        advertiser,
        campaign,
        edition: edition || result?.edition || undefined,
        format: format || result?.format || undefined,
        position: position || result?.position || undefined,
        audience_reach: result?.audience_reach,
        suggested_price: result?.suggested_price,
        match_score: result?.match_score,
        proposal_data: result || undefined,
        status: 'rascunho',
      })
      toast.success('Proposta salva!')
      onOpenChange(false)
      onCreated()
      setAdvertiser('')
      setCampaign('')
      setEdition('')
      setFormat('')
      setPosition('')
      setResult(null)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" /> Gerar Proposta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="advertiser">Anunciante *</Label>
            <Input
              id="advertiser"
              value={advertiser}
              onChange={(e) => setAdvertiser(e.target.value)}
            />
            {fieldErrors.advertiser && (
              <p className="text-sm text-red-500">{fieldErrors.advertiser}</p>
            )}
          </div>
          <div>
            <Label htmlFor="campaign">Campanha</Label>
            <Input id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Edição</Label>
              <Select value={edition} onValueChange={setEdition}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {editions.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {FORMAT_LABELS[f]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="position">Posição</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ex: Página 5, Capa, etc."
            />
          </div>
          {result && (
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-orange-900">Resultado da Geração</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Match:</span>{' '}
                  <span className="font-semibold">
                    {result.match_score ? `${(result.match_score * 100).toFixed(0)}%` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Preço:</span>{' '}
                  <span className="font-semibold">
                    {result.suggested_price
                      ? `R$ ${result.suggested_price.toLocaleString('pt-BR')}`
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Alcance:</span>{' '}
                  <span className="font-semibold">
                    {result.audience_reach?.toLocaleString('pt-BR') || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating || !advertiser}
            className="gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}{' '}
            Gerar
          </Button>
          <Button onClick={handleSave} disabled={saving || !advertiser} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}{' '}
            Salvar Proposta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
