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
import { updateStoryText, type StoryText } from '@/services/story-texts'
import { Loader2, Save } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing: StoryText | null
}

function validateOptions(options: string[]): string | null {
  for (let i = 0; i < options.length; i++) {
    if (!options[i].trim()) return `Opção ${i + 1} não pode estar vazia`
    const words = options[i].trim().split(/\s+/)
    if (words.length > 8) return `Opção ${i + 1} excede o limite de 8 palavras`
  }
  return null
}

export function StoryTextEditModal({ open, onOpenChange, onSaved, editing }: Props) {
  const [options, setOptions] = useState<string[]>(['', '', ''])
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (editing) {
      setOptions(editing.options?.length === 3 ? [...editing.options] : ['', '', ''])
    }
    setFieldErrors({})
    setLocalError(null)
  }, [editing, open])

  const handleSubmit = async () => {
    if (!editing) return
    const err = validateOptions(options)
    if (err) {
      setLocalError(err)
      return
    }
    setLocalError(null)
    setSaving(true)
    setFieldErrors({})
    try {
      await updateStoryText(editing.id, { options })
      toast({ title: 'Sucesso', description: 'Texto atualizado.' })
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Textos — {editing?.subject}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Label>
                Opção {i + 1} {options[i] && `(${options[i].trim().split(/\s+/).length} palavras)`}
              </Label>
              <Input
                value={options[i]}
                onChange={(e) =>
                  setOptions((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                placeholder={`Opção ${i + 1}...`}
              />
              {fieldErrors[`options`] && (
                <p className="text-sm text-red-500">{fieldErrors[`options`]}</p>
              )}
            </div>
          ))}
          {localError && <p className="text-sm text-red-500">{localError}</p>}
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
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
