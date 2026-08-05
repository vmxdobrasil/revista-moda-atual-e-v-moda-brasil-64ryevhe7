import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Plus, Pencil, Trash2, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import {
  createSequence,
  updateSequence,
  deleteSequence,
  type NewsletterSequence,
} from '@/services/newsletter'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}
const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  ativo: 'bg-green-100 text-green-700',
  pausado: 'bg-yellow-100 text-yellow-700',
}

interface SequencesTabProps {
  sequences: NewsletterSequence[]
  onRefresh: () => void
}

export function SequencesTab({ sequences, onRefresh }: SequencesTabProps) {
  const [editing, setEditing] = useState<NewsletterSequence | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', segment: 'varejo', trigger: '' })

  const handleCreate = async () => {
    try {
      await createSequence({
        name: form.name || 'Nova sequência',
        description: form.description,
        segment: form.segment,
        trigger: form.trigger,
        steps: [],
        status: 'rascunho',
      })
      toast.success('Sequência criada.')
      setCreateOpen(false)
      onRefresh()
      setForm({ name: '', description: '', segment: 'varejo', trigger: '' })
    } catch {
      toast.error('Erro ao criar.')
    }
  }

  const handleStatusToggle = async (seq: NewsletterSequence) => {
    const next = seq.status === 'ativo' ? 'pausado' : 'ativo'
    try {
      await updateSequence(seq.id, { status: next })
      toast.success('Status atualizado.')
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSequence(id)
      toast.success('Removida.')
      onRefresh()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    try {
      await updateSequence(editing.id, {
        name: editing.name,
        description: editing.description,
        segment: editing.segment,
        trigger: editing.trigger,
        steps: editing.steps,
      })
      toast.success('Atualizada.')
      setEditing(null)
      onRefresh()
    } catch {
      toast.error('Erro ao atualizar.')
    }
  }

  const addStep = () => {
    if (!editing) return
    setEditing({
      ...editing,
      steps: [
        ...editing.steps,
        { day: editing.steps.length + 1, subject: '', content_summary: '' },
      ],
    })
  }

  const updateStep = (idx: number, field: string, value: string) => {
    if (!editing) return
    const steps = [...editing.steps]
    steps[idx] = { ...steps[idx], [field]: field === 'day' ? parseInt(value) || 1 : value }
    setEditing({ ...editing, steps })
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)} variant="outline">
        <Plus className="w-4 h-4 mr-2" /> Nova Sequência
      </Button>
      <div className="grid grid-cols-1 gap-3">
        {sequences.map((seq) => (
          <Card key={seq.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">{seq.name}</p>
                    <Badge variant="secondary" className={STATUS_COLORS[seq.status] || ''}>
                      {seq.status}
                    </Badge>
                    <Badge variant="outline">{SEGMENT_LABELS[seq.segment] || seq.segment}</Badge>
                  </div>
                  {seq.description && <p className="text-sm text-gray-500">{seq.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Gatilho: {seq.trigger || '—'} · Passos: {seq.steps?.length || 0}
                  </p>
                  {seq.steps && seq.steps.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {seq.steps.map((step, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-500 border-l-2 border-orange-200 pl-2"
                        >
                          Dia {step.day}:{' '}
                          <span className="font-medium text-gray-600">{step.subject}</span> —{' '}
                          {step.content_summary}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleStatusToggle(seq)}>
                    {seq.status === 'ativo' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing({ ...seq, steps: seq.steps || [] })}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(seq.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {sequences.length === 0 && (
          <p className="text-center text-gray-400 py-8">Nenhuma sequência encontrada.</p>
        )}
      </div>

      {editing && (
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Sequência</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Segmento</Label>
                <Select
                  value={editing.segment}
                  onValueChange={(v) => setEditing({ ...editing, segment: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(SEGMENT_LABELS).map((s) => (
                      <SelectItem key={s} value={s}>
                        {SEGMENT_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gatilho</Label>
                <Input
                  value={editing.trigger || ''}
                  onChange={(e) => setEditing({ ...editing, trigger: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Passos</Label>
                  <Button size="sm" variant="outline" onClick={addStep}>
                    <Plus className="w-3 h-3 mr-1" /> Adicionar
                  </Button>
                </div>
                {editing.steps.map((step, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2 mb-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={step.day}
                        onChange={(e) => updateStep(idx, 'day', e.target.value)}
                        className="w-20"
                        placeholder="Dia"
                      />
                      <Input
                        value={step.subject}
                        onChange={(e) => updateStep(idx, 'subject', e.target.value)}
                        placeholder="Assunto"
                      />
                    </div>
                    <Textarea
                      value={step.content_summary}
                      onChange={(e) => updateStep(idx, 'content_summary', e.target.value)}
                      placeholder="Resumo do conteúdo"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveEdit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sequência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Segmento</Label>
              <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SEGMENT_LABELS).map((s) => (
                    <SelectItem key={s} value={s}>
                      {SEGMENT_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gatilho</Label>
              <Input
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
