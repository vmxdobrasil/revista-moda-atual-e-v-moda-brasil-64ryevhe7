import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllAds,
  createAd,
  updateAd,
  deleteAd,
  type Advertisement,
} from '@/services/advertisements'
import { AD_STATUSES, AD_STATUS_LABELS, STATUS_BADGE_CLASSES } from '@/services/ad-proposals'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'

interface FormState {
  advertiser: string
  campaign: string
  price: string
  status: string
  delivery: string
}

const emptyForm: FormState = {
  advertiser: '',
  campaign: '',
  price: '',
  status: 'rascunho',
  delivery: '',
}

export function AnunciantesTab() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Advertisement | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    try {
      setAds(await getAllAds())
    } catch {
      toast.error('Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('advertisements', () => {
    loadData()
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFieldErrors({})
    setDialogOpen(true)
  }

  const openEdit = (ad: Advertisement) => {
    setEditing(ad)
    setForm({
      advertiser: ad.advertiser || '',
      campaign: ad.campaign || '',
      price: ad.price?.toString() || '',
      status: ad.status || 'rascunho',
      delivery: ad.delivery?.slice(0, 10) || '',
    })
    setFieldErrors({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const fd = new FormData()
      fd.append('title', form.advertiser || form.campaign || 'Anúncio')
      fd.append('advertiser', form.advertiser)
      fd.append('campaign', form.campaign)
      if (form.price) fd.append('price', form.price)
      fd.append('status', form.status)
      if (form.delivery) fd.append('delivery', form.delivery)
      if (!editing) fd.append('is_active', 'false')
      if (editing) {
        await updateAd(editing.id, fd)
        toast.success('Anúncio atualizado')
      } else {
        await createAd(fd)
        toast.success('Anúncio criado')
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return
    try {
      await deleteAd(id)
      toast.success('Excluído')
      loadData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Anunciante
        </Button>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anunciante</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.advertiser || ad.title}</TableCell>
                <TableCell>{ad.campaign || '-'}</TableCell>
                <TableCell>{ad.price ? `R$ ${ad.price.toLocaleString('pt-BR')}` : '-'}</TableCell>
                <TableCell>
                  <Badge
                    className={STATUS_BADGE_CLASSES[ad.status || ''] || 'bg-gray-100 text-gray-700'}
                    variant="secondary"
                  >
                    {AD_STATUS_LABELS[ad.status || ''] || ad.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ad.delivery ? new Date(ad.delivery).toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(ad)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Anunciante</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="adv-name">Anunciante *</Label>
              <Input
                id="adv-name"
                value={form.advertiser}
                onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
              />
              {fieldErrors.advertiser && (
                <p className="text-sm text-red-500">{fieldErrors.advertiser}</p>
              )}
            </div>
            <div>
              <Label htmlFor="adv-camp">Campanha</Label>
              <Input
                id="adv-camp"
                value={form.campaign}
                onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="adv-price">Preço</Label>
              <Input
                id="adv-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              {fieldErrors.price && <p className="text-sm text-red-500">{fieldErrors.price}</p>}
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
                      {AD_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adv-delivery">Data de Entrega</Label>
              <Input
                id="adv-delivery"
                type="date"
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
