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
import { useToast } from '@/hooks/use-toast'
import { createHotspot, updateHotspot, type Hotspot } from '@/services/magazine'
import { Loader2, Save } from 'lucide-react'

interface HotspotEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pageId: string
  hotspot?: Hotspot | null
  position?: { x: number; y: number }
  onSaved: () => void
}

export function HotspotEditorModal({
  open,
  onOpenChange,
  pageId,
  hotspot,
  position,
  onSaved,
}: HotspotEditorModalProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    link: '',
  })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (hotspot) {
      setForm({
        title: hotspot.title || '',
        description: hotspot.description || '',
        link: hotspot.link || '',
      })
    } else {
      setForm({ title: '', description: '', link: '' })
    }
  }, [hotspot, open])

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const data: Partial<Hotspot> = {
        title: form.title,
        description: form.description,
        link: form.link,
      }
      if (hotspot) {
        await updateHotspot(hotspot.id, data)
        toast({ title: 'Sucesso', description: 'Hotspot atualizado.' })
      } else {
        await createHotspot({
          ...data,
          page: pageId,
          x: position?.x ?? 50,
          y: position?.y ?? 50,
        } as Partial<Hotspot>)
        toast({ title: 'Sucesso', description: 'Hotspot criado.' })
      }
      onSaved()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hotspot ? 'Editar Hotspot' : 'Novo Hotspot'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input
              type="url"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-400">
              Os hotspots agora direcionam para a plataforma V MODA BRASIL.
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
            {hotspot ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
