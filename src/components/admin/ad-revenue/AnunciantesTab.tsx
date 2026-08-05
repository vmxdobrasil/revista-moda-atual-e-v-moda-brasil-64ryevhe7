import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import {
  createAd,
  updateAd,
  deleteAd,
  getAdImageUrl,
  type Advertisement,
} from '@/services/advertisements'
import { AD_STATUSES, formatCurrency } from '@/services/ad-revenue'
import type { FieldErrors } from '@/lib/pocketbase/errors'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  aprovado: 'bg-green-100 text-green-700',
  em_entrega: 'bg-blue-100 text-blue-700',
  entregue: 'bg-purple-100 text-purple-700',
  concluido: 'bg-teal-100 text-teal-700',
  cancelado: 'bg-red-100 text-red-700',
}

interface Props {
  ads: Advertisement[]
  onRefresh: () => void
}

export function AnunciantesTab({ ads, onRefresh }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [form, setForm] = useState({
    title: '',
    advertiser: '',
    campaign: '',
    url: '',
    price: '',
    status: 'rascunho',
    delivery: '',
    is_active: true,
    image: null as File | null,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      advertiser: '',
      campaign: '',
      url: '',
      price: '',
      status: 'rascunho',
      delivery: '',
      is_active: true,
      image: null,
    })
    setErrors({})
    setFormOpen(true)
  }
  const openEdit = (ad: Advertisement) => {
    setEditing(ad)
    setForm({
      title: ad.title,
      advertiser: ad.advertiser || '',
      campaign: ad.campaign || '',
      url: ad.url || '',
      price: ad.price?.toString() || '',
      status: ad.status || 'rascunho',
      delivery: ad.delivery ? ad.delivery.slice(0, 10) : '',
      is_active: ad.is_active,
      image: null,
    })
    setErrors({})
    setFormOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setErrors({})
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('advertiser', form.advertiser)
      fd.append('campaign', form.campaign)
      fd.append('url', form.url)
      fd.append('price', form.price || '0')
      fd.append('status', form.status)
      if (form.delivery) fd.append('delivery', form.delivery)
      fd.append('is_active', String(form.is_active))
      if (form.image) fd.append('image', form.image)
      if (editing) {
        await updateAd(editing.id, fd)
        toast.success('Anúncio atualizado.')
      } else {
        await createAd(fd)
        toast.success('Anúncio criado.')
      }
      setFormOpen(false)
      onRefresh()
    } catch (err) {
      setErrors(extractFieldErrors(err))
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAd(id)
      toast.success('Removido.')
      onRefresh()
    } catch {
      toast.error('Erro ao remover.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus className="w-4 h-4" /> Novo Anúncio
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ads.map((ad) => (
          <Card key={ad.id} className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                {ad.image ? (
                  <img
                    src={getAdImageUrl(ad, ad.image)}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Megaphone className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800 truncate">{ad.title}</p>
                  <Badge variant="secondary" className={STATUS_COLORS[ad.status || ''] || ''}>
                    {ad.status || '—'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {ad.advertiser || '—'} {ad.campaign ? `· ${ad.campaign}` : ''}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  {ad.price != null && <span>{formatCurrency(ad.price)}</span>}
                  {ad.delivery && (
                    <span>Entrega: {new Date(ad.delivery).toLocaleDateString('pt-BR')}</span>
                  )}
                  <span>{ad.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => openEdit(ad)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {ads.length === 0 && (
          <p className="text-center text-gray-400 py-8 col-span-2">Nenhum anúncio cadastrado.</p>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Anúncio' : 'Novo Anúncio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <Label>Anunciante</Label>
              <Input
                value={form.advertiser}
                onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
              />
              {errors.advertiser && (
                <p className="text-xs text-red-500 mt-1">{errors.advertiser}</p>
              )}
            </div>
            <div>
              <Label>Campanha</Label>
              <Input
                value={form.campaign}
                onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data de Entrega</Label>
              <Input
                type="date"
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
              />
            </div>
            <div>
              <Label>Imagem</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                id="ad-rev-active"
              />
              <Label htmlFor="ad-rev-active">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
