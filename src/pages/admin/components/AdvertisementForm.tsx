import { useState, useEffect, type FormEvent } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { createAd, updateAd, type Advertisement } from '@/services/advertisements'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingAd: Advertisement | null
}

export function AdvertisementForm({ open, onOpenChange, onSaved, editingAd }: Props) {
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title)
      setUrl(editingAd.url || '')
      setIsActive(editingAd.is_active)
    } else {
      setTitle('')
      setUrl('')
      setIsActive(true)
    }
    setImage(null)
  }, [editingAd, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', title)
      fd.append('url', url)
      fd.append('is_active', String(isActive))
      if (image) fd.append('image', image)
      if (editingAd) {
        await updateAd(editingAd.id, fd)
        toast({ title: 'Sucesso', description: 'Anúncio atualizado.' })
      } else {
        await createAd(fd)
        toast({ title: 'Sucesso', description: 'Anúncio criado.' })
      }
      onOpenChange(false)
      onSaved()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad-title">Título</Label>
            <Input
              id="ad-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-url">URL (link de destino)</Label>
            <Input
              id="ad-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ad-image">Imagem do banner</Label>
            <Input
              id="ad-image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="ad-active" />
            <Label htmlFor="ad-active">Ativo (visível publicamente)</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
