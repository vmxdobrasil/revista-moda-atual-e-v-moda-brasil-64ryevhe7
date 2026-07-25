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
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import {
  createBrand,
  updateBrand,
  getCategories,
  type Top60Brand,
  type Top60Category,
} from '@/services/top60'
import { Loader2, Save } from 'lucide-react'

interface BrandFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingBrand?: Top60Brand | null
}

export function BrandForm({ open, onOpenChange, onSaved, editingBrand }: BrandFormProps) {
  const [categories, setCategories] = useState<Top60Category[]>([])
  const [form, setForm] = useState<any>({
    name: '',
    category: '',
    position: 1,
    description: '',
    website: '',
    social_handle: '',
    score: 0,
    previous_position: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (editingBrand) {
      setForm({
        name: editingBrand.name,
        category: editingBrand.category,
        position: editingBrand.position,
        description: editingBrand.description || '',
        website: editingBrand.website || '',
        social_handle: editingBrand.social_handle || '',
        score: editingBrand.score || 0,
        previous_position: editingBrand.previous_position ?? '',
      })
    } else {
      setForm({
        name: '',
        category: '',
        position: 1,
        description: '',
        website: '',
        social_handle: '',
        score: 0,
        previous_position: '',
      })
    }
    setLogoFile(null)
    setFieldErrors({})
  }, [editingBrand, open])

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data: any = {
        ...form,
        position: Number(form.position),
        score: Number(form.score),
        previous_position: form.previous_position === '' ? null : Number(form.previous_position),
      }
      if (logoFile) data.logo_file = logoFile
      if (editingBrand) {
        await updateBrand(editingBrand.id, data)
        toast({ title: 'Sucesso', description: 'Marca atualizada.' })
      } else {
        await createBrand(data)
        toast({ title: 'Sucesso', description: 'Marca criada.' })
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
          <DialogTitle>{editingBrand ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
            />
            {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f: any) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category && (
                <p className="text-sm text-red-500">{fieldErrors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Posição *</Label>
              <Input
                type="number"
                min={1}
                value={form.position}
                onChange={(e) => setForm((f: any) => ({ ...f, position: e.target.value }))}
              />
              {fieldErrors.position && (
                <p className="text-sm text-red-500">{fieldErrors.position}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm((f: any) => ({ ...f, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>@Social</Label>
              <Input
                value={form.social_handle}
                onChange={(e) => setForm((f: any) => ({ ...f, social_handle: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Score</Label>
              <Input
                type="number"
                step="0.1"
                value={form.score}
                onChange={(e) => setForm((f: any) => ({ ...f, score: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Posição Anterior</Label>
              <Input
                type="number"
                value={form.previous_position}
                onChange={(e) => setForm((f: any) => ({ ...f, previous_position: e.target.value }))}
                placeholder="null = novo"
              />
            </div>
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
            {editingBrand ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
