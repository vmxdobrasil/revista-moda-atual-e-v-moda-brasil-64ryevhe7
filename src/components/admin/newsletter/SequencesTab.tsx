import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { deleteSequence, type NewsletterSequence } from '@/services/newsletter'
import { SequenceForm } from './SequenceForm'

const SEGMENT_LABELS: Record<string, string> = {
  varejo: 'Varejo',
  atacado: 'Atacado',
  consumidora: 'Consumidora',
  todos: 'Todos',
}
const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  ativo: 'bg-green-100 text-green-700',
  pausado: 'bg-yellow-100 text-yellow-700',
}

interface SequencesTabProps {
  sequences: NewsletterSequence[]
  onRefresh: () => void
}

export function SequencesTab({ sequences, onRefresh }: SequencesTabProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NewsletterSequence | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteSequence(id)
      toast.success('Sequência excluída.')
      onRefresh()
    } catch {
      toast.error('Erro ao excluir sequência.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4" /> Nova Sequência
        </Button>
      </div>
      {sequences.length === 0 ? (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-8 text-center text-gray-500">
            Nenhuma sequência cadastrada.
          </CardContent>
        </Card>
      ) : (
        sequences.map((seq) => (
          <Card key={seq.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{seq.name}</CardTitle>
                  <Badge className={STATUS_COLORS[seq.status] || 'bg-gray-100'}>{seq.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditing(seq)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleDelete(seq.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{seq.description}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                <Badge variant="outline">{SEGMENT_LABELS[seq.segment] || seq.segment}</Badge>
                <span>Trigger: {seq.trigger || '—'}</span>
                <span>{seq.steps?.length || 0} etapas</span>
              </div>
              <div className="space-y-2">
                {(seq.steps || []).map((step, idx) => (
                  <div key={idx} className="flex gap-3 items-start text-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0">
                      D{step.day}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{step.subject}</p>
                      <p className="text-gray-400 text-xs">{step.content_summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <SequenceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={onRefresh}
        editing={editing}
      />
    </div>
  )
}
