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
  createSocialPost,
  updateSocialPost,
  type SocialPost,
  type SocialPostInput,
} from '@/services/social-posts'
import { Loader2, Save } from 'lucide-react'

interface SocialPostFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editingPost?: SocialPost | null
}

const emptyForm: SocialPostInput = {
  hook: '',
  description: '',
  format: 'Reel',
  post_date: new Date().toISOString().split('T')[0],
  views: 0,
  likes: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  remixes: 0,
  new_followers: 0,
}

export function SocialPostForm({ open, onOpenChange, onSaved, editingPost }: SocialPostFormProps) {
  const [form, setForm] = useState<SocialPostInput>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const { toast } = useToast()

  useEffect(() => {
    if (editingPost) {
      setForm({
        hook: editingPost.hook,
        description: editingPost.description || '',
        format: editingPost.format,
        post_date: editingPost.post_date?.split(' ')[0] || '',
        views: editingPost.views,
        likes: editingPost.likes,
        comments: editingPost.comments,
        shares: editingPost.shares,
        saves: editingPost.saves,
        remixes: editingPost.remixes || 0,
        new_followers: editingPost.new_followers || 0,
      })
    } else {
      setForm(emptyForm)
    }
    setFieldErrors({})
  }, [editingPost, open])

  const handleSubmit = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const data: SocialPostInput = {
        ...form,
        views: Number(form.views),
        likes: Number(form.likes),
        comments: Number(form.comments),
        shares: Number(form.shares),
        saves: Number(form.saves),
        remixes: Number(form.remixes) || 0,
        new_followers: Number(form.new_followers) || 0,
      }
      if (editingPost) {
        await updateSocialPost(editingPost.id, data)
        toast({ title: 'Sucesso', description: 'Post atualizado.' })
      } else {
        await createSocialPost(data)
        toast({ title: 'Sucesso', description: 'Post criado.' })
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

  const numField = (key: keyof SocialPostInput, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={form[key] as number}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
      {fieldErrors[key as string] && (
        <p className="text-sm text-red-500">{fieldErrors[key as string]}</p>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPost ? 'Editar Post' : 'Novo Post'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Hook *</Label>
            <Textarea
              value={form.hook}
              onChange={(e) => setForm((f) => ({ ...f, hook: e.target.value }))}
              rows={2}
              placeholder="Ex: Não use calça alfaiataria..."
            />
            {fieldErrors.hook && <p className="text-sm text-red-500">{fieldErrors.hook}</p>}
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
              <Label>Formato *</Label>
              <Select
                value={form.format}
                onValueChange={(v) => setForm((f) => ({ ...f, format: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reel">Reel</SelectItem>
                  <SelectItem value="Carousel">Carousel</SelectItem>
                  <SelectItem value="Photo">Photo</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.format && <p className="text-sm text-red-500">{fieldErrors.format}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.post_date}
                onChange={(e) => setForm((f) => ({ ...f, post_date: e.target.value }))}
              />
              {fieldErrors.post_date && (
                <p className="text-sm text-red-500">{fieldErrors.post_date}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {numField('views', 'Views *')}
            {numField('likes', 'Likes *')}
            {numField('comments', 'Comments *')}
            {numField('shares', 'Shares *')}
            {numField('saves', 'Saves *')}
            {numField('remixes', 'Remixes')}
            {numField('new_followers', 'New Followers')}
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
            {editingPost ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
