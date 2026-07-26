import { useState, useEffect, type KeyboardEvent } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { updateStoryText, type StoryText } from '@/services/story-texts'
import {
  extractTags,
  extractSimpleOptions,
  validateTag,
  getTagColor,
  isComplexOptions,
} from '@/lib/story-text-utils'
import { Loader2, Save, X } from 'lucide-react'

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
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const { toast } = useToast()

  const complexType = editing ? isComplexOptions(editing.options) : false

  useEffect(() => {
    if (editing) {
      const simpleOptions = extractSimpleOptions(editing.options)
      setOptions(simpleOptions.length === 3 ? [...simpleOptions] : ['', '', ''])
      setTags(extractTags(editing.options))
    }
    setTagInput('')
    setFieldErrors({})
    setLocalError(null)
  }, [editing, open])

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (!tag) return
      if (tags.includes(tag)) {
        setTagInput('')
        return
      }
      const error = validateTag(tag)
      if (error) {
        setLocalError(error)
        return
      }
      setLocalError(null)
      setTags([...tags, tag])
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSubmit = async () => {
    if (!editing) return
    if (!complexType) {
      const err = validateOptions(options)
      if (err) {
        setLocalError(err)
        return
      }
    }
    setLocalError(null)
    setSaving(true)
    setFieldErrors({})
    try {
      let newOptions: unknown
      if (complexType && editing.options && typeof editing.options === 'object') {
        const existingObj = editing.options as Record<string, unknown>
        if (Array.isArray(existingObj.options)) {
          newOptions = { ...existingObj, options, tags }
        } else {
          newOptions = { ...existingObj, tags }
        }
      } else {
        newOptions = { options, tags }
      }
      await updateStoryText(editing.id, { options: newOptions })
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
          {!complexType &&
            [0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Label>
                  Opção {i + 1}{' '}
                  {options[i] && `(${options[i].trim().split(/\s+/).length} palavras)`}
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
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-md border bg-background">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className={`${getTagColor(tag)} gap-1 cursor-pointer border`}
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Digite uma tag e pressione Enter...' : ''}
                className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
              />
            </div>
            {localError && <p className="text-sm text-red-500">{localError}</p>}
            <p className="text-xs text-muted-foreground">
              Pressione Enter ou vírgula para adicionar. Apenas letras, números, hífens e
              underscores. Mín 2, máx 30 caracteres.
            </p>
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
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
