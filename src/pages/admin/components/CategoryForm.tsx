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
import { createCategory, updateCategory, slugify, type Top60Category } from '@/services/top60'
import { Loader2, Save } from 'lucide-react'

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingCategory?: Top60Category | null
  nextOrder: number
}

export function CategoryForm({
  open,
  onOpenChange,
  onSaved,
  editingCategory,
  nextOrder,
}: CategoryFormProps) {
  const [form, setForm] = useState({ name: '', slug: '', order: nextOrder })
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        slug: editingCategory.slug,
        order: editingCategory.order,
      })
    } else {
      setForm({ name: '', slug: '', order: nextOrder })
    }
    setFieldErrors({})
  }, [editingCategory, open, nextOrder])

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data = { ...form, slug: form.slug || slugify(form.name), order: Number(form.order) }
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
        toast({ title: 'Sucesso', description: 'Categoria atualizada.' })
      } else {
        await createCategory(data)
        toast({ title: 'Sucesso', description: 'Categoria criada.' })
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))
              }
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            {fieldErrors.slug && <p className="text-sm text-red-500">{fieldErrors.slug}</p>}
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
            />
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
            {editingCategory ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
