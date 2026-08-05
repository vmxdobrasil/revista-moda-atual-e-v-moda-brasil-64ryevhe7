import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getPricingRules, updatePricingRule, type PricingRule } from '@/services/ad-pricing'
import { getErrorMessage, extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { FORMAT_LABELS } from '@/services/ad-proposals'

interface EditState {
  base_price: string
  reach_divisor: string
  reach_max: string
  pos_premium: string
  pos_standard: string
  pos_bottom: string
  active: boolean
}

export function PrecificacaoTab() {
  const [rules, setRules] = useState<PricingRule[]>([])
  const [editState, setEditState] = useState<Record<string, EditState>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadData = async () => {
    try {
      const data = await getPricingRules()
      setRules(data)
      const edits: Record<string, EditState> = {}
      data.forEach((r) => {
        const rm = r.reach_multiplier || { divisor: 10000, max_addition: 2 }
        const pm = r.position_multiplier || { premium: 1.3, standard: 1.0, bottom: 0.8 }
        edits[r.id] = {
          base_price: String(r.base_price || 0),
          reach_divisor: String(rm.divisor || 10000),
          reach_max: String(rm.max_addition || 2),
          pos_premium: String(pm.premium || 1.3),
          pos_standard: String(pm.standard || 1.0),
          pos_bottom: String(pm.bottom || 0.8),
          active: r.active ?? true,
        }
      })
      setEditState(edits)
    } catch {
      toast.error('Erro ao carregar regras de precificação')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('ad_pricing_rules', () => {
    loadData()
  })

  const handleSave = async (id: string) => {
    const edit = editState[id]
    if (!edit) return
    setSaving(id)
    setFieldErrors({})
    try {
      await updatePricingRule(id, {
        base_price: Number(edit.base_price),
        reach_multiplier: {
          divisor: Number(edit.reach_divisor),
          max_addition: Number(edit.reach_max),
        },
        position_multiplier: {
          premium: Number(edit.pos_premium),
          standard: Number(edit.pos_standard),
          bottom: Number(edit.pos_bottom),
        },
        active: edit.active,
      })
      toast.success('Regra atualizada com sucesso')
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(null)
    }
  }

  const updateField = (id: string, field: keyof EditState, value: string | boolean) => {
    setEditState((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
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
      <p className="text-sm text-gray-500">
        Configure os preços base e multiplicadores por formato de anúncio.
      </p>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formato</TableHead>
              <TableHead>Preço Base (R$)</TableHead>
              <TableHead>Alcance Divisor</TableHead>
              <TableHead>Alcance Máx.</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Padrão</TableHead>
              <TableHead>Rodapé</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => {
              const edit = editState[r.id]
              if (!edit) return null
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {FORMAT_LABELS[r.format] || r.format}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={edit.base_price}
                      onChange={(e) => updateField(r.id, 'base_price', e.target.value)}
                      className="w-24 h-8"
                    />
                    {fieldErrors.base_price && (
                      <p className="text-xs text-red-500 mt-1">{fieldErrors.base_price}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={edit.reach_divisor}
                      onChange={(e) => updateField(r.id, 'reach_divisor', e.target.value)}
                      className="w-24 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={edit.reach_max}
                      onChange={(e) => updateField(r.id, 'reach_max', e.target.value)}
                      className="w-20 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={edit.pos_premium}
                      onChange={(e) => updateField(r.id, 'pos_premium', e.target.value)}
                      className="w-20 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={edit.pos_standard}
                      onChange={(e) => updateField(r.id, 'pos_standard', e.target.value)}
                      className="w-20 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={edit.pos_bottom}
                      onChange={(e) => updateField(r.id, 'pos_bottom', e.target.value)}
                      className="w-20 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={edit.active}
                      onCheckedChange={(v) => updateField(r.id, 'active', v)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSave(r.id)}
                      disabled={saving === r.id}
                    >
                      {saving === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <p>
          <strong>Alcance Divisor:</strong> Divide o alcance para calcular o multiplicador (ex:
          10000 = +1 a cada 10k impactos).
        </p>
        <p>
          <strong>Alcance Máx.:</strong> Limite máximo do multiplicador de alcance (ex: 2 = até 3x o
          preço base).
        </p>
        <p>
          <strong>Premium/Padrão/Rodapé:</strong> Multiplicadores de posição baseados em
          palavras-chave na posição informada.
        </p>
      </div>
    </div>
  )
}
