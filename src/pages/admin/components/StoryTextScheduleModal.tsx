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
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { updateStoryText, toDateInputValue, type StoryText } from '@/services/story-texts'
import { Loader2, Calendar, Trash2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing: StoryText | null
}

export function StoryTextScheduleModal({ open, onOpenChange, onSaved, editing }: Props) {
  const [dateValue, setDateValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    if (editing) {
      setDateValue(toDateInputValue(editing.scheduled_date))
    }
    setFieldErrors({})
  }, [editing, open])

  const handleSubmit = async () => {
    if (!editing) return
    setSaving(true)
    setFieldErrors({})
    try {
      await updateStoryText(editing.id, {
        scheduled_date: dateValue ? new Date(dateValue).toISOString() : null,
      })
      toast({ title: 'Sucesso', description: 'Agendamento atualizado.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Falha ao agendar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateStoryText(editing.id, { scheduled_date: null })
      toast({ title: 'Sucesso', description: 'Agendamento removido.' })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Agendar — {editing?.subject}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Data e hora</Label>
            <Input
              type="datetime-local"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
            />
            {fieldErrors.scheduled_date && (
              <p className="text-sm text-red-500">{fieldErrors.scheduled_date}</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleClear} disabled={saving} className="text-red-500">
            <Trash2 className="w-4 h-4 mr-2" /> Limpar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
