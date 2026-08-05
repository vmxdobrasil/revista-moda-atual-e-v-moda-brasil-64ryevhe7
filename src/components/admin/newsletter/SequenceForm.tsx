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
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { createSequence, updateSequence, type NewsletterSequence } from '@/services/newsletter'

const SEGMENTS = ['varejo', 'atacado', 'consumidora', 'todos']
const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}
const STATUSES = ['rascunho', 'ativo', 'pausado']

interface Step {
  day: number
  subject: string
  content_summary: string
}

interface SequenceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing?: NewsletterSequence | null
}

export function SequenceForm({ open, onOpenChange, onSaved, editing }: SequenceFormProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [form, setForm] = useState({
    name: '',
    description: '',
    segment: 'varejo',
    trigger: '',
    status: 'rascunho',
  })
  const [steps, setSteps] = useState<Step[]>([])

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        description: editing.description || '',
        segment: editing.segment || 'varejo',
        trigger: editing.trigger || '',
        status: editing.status || 'rascunho',
      })
      setSteps(
        (editing.steps || []).map((s) => ({
          day: s.day,
          subject: s.subject,
          content_summary: s.content_summary,
        })),
      )
    } else {
      setForm({
        name: '',
        description: '',
        segment: 'varejo',
        trigger: '',
        status: 'rascunho',
      })
      setSteps([])
    }
    setFieldErrors({})
  }, [editing, open])

  const addStep = () =>
    setSteps((s) => [...s, { day: (s.length + 1) * 3, subject: '', content_summary: '' }])
  const updateStep = (idx: number, field: keyof Step, value: string | number) =>
    setSteps((s) => s.map((st, i) => (i === idx ? { ...st, [field]: value } : st)))
  const removeStep = (idx: number) => setSteps((s) => s.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data: Record<string, unknown> = { ...form, steps }
      if (editing) {
        await updateSequence(editing.id, data)
        toast({ title: 'Sucesso', description: 'Sequência atualizada.' })
      } else {
        await createSequence(data)
        toast({ title: 'Sucesso', description: 'Sequência criada.' })
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
          <DialogTitle>{editing ? 'Editar Sequência' : 'Nova Sequência'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select
                value={form.segment}
                onValueChange={(v) => setForm((f) => ({ ...f, segment: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEGMENT_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="space-y-2">
            <Label>Gatilho</Label>
            <Input
              value={form.trigger}
              onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))}
              placeholder="Ex: captura inicial"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Passos da Sequência</Label>
              <Button variant="outline" size="sm" onClick={addStep} className="h-7 gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </Button>
            </div>
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-start p-3 rounded-lg bg-gray-50">
                <Input
                  type="number"
                  className="w-16"
                  value={step.day}
                  onChange={(e) => updateStep(idx, 'day', Number(e.target.value))}
                />
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Assunto"
                    value={step.subject}
                    onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                  />
                  <Input
                    placeholder="Resumo do conteúdo"
                    value={step.content_summary}
                    onChange={(e) => updateStep(idx, 'content_summary', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  onClick={() => removeStep(idx)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
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
