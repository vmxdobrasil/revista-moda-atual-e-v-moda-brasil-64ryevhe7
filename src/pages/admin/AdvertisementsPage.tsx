import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  getAllAds,
  deleteAd,
  toggleAdActive,
  getAdImageUrl,
  type Advertisement,
} from '@/services/advertisements'
import { useRealtime } from '@/hooks/use-realtime'
import { AdvertisementForm } from './components/AdvertisementForm'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Megaphone, Trash2, Pencil, AlertCircle } from 'lucide-react'

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setError(false)
      const data = await getAllAds()
      setAds(data)
    } catch {
      setError(true)
      toast({ title: 'Erro', description: 'Falha ao carregar anúncios.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useRealtime('advertisements', () => loadData())
  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await deleteAd(id)
      toast({ title: 'Sucesso', description: 'Anúncio excluído.' })
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao excluir.', variant: 'destructive' })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const prevAds = ads
    setAds((prev) => prev.map((a) => (a.id === id ? { ...a, is_active: isActive } : a)))
    try {
      await toggleAdActive(id, isActive)
      toast({
        title: 'Sucesso',
        description: isActive ? 'Anúncio ativado.' : 'Anúncio desativado.',
      })
    } catch {
      setAds(prevAds)
      toast({ title: 'Erro', description: 'Falha ao alterar status.', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Não foi possível carregar</h3>
        <p className="text-gray-500 max-w-md text-lg mb-6">
          Ocorreu um erro ao buscar os anúncios. Tente novamente.
        </p>
        <Button
          onClick={() => {
            setLoading(true)
            loadData()
          }}
          className="bg-orange-500 hover:bg-orange-600 rounded-full px-8"
        >
          Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <Megaphone className="text-orange-500" /> Anúncios
          </h2>
          <p className="text-gray-500 mt-1">Gerencie os banners publicitários do site.</p>
        </div>
        <Button
          onClick={() => {
            setEditingAd(null)
            setFormOpen(true)
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Anúncio
        </Button>
      </div>

      {ads.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhum anúncio cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="relative group border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="aspect-[2/1] bg-gray-50 flex items-center justify-center overflow-hidden">
                {ad.image ? (
                  <img
                    src={getAdImageUrl(ad, ad.image)}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Megaphone className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{ad.title}</h3>
                  <Badge
                    variant={ad.is_active ? 'default' : 'secondary'}
                    className={ad.is_active ? 'bg-green-500' : ''}
                  >
                    {ad.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {ad.url && <p className="text-xs text-gray-400 truncate">{ad.url}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={ad.is_active}
                    onCheckedChange={(checked) => handleToggleActive(ad.id, checked)}
                    id={`ad-toggle-${ad.id}`}
                  />
                  <span className="text-xs text-gray-500">
                    {ad.is_active ? 'Visível publicamente' : 'Oculto'}
                  </span>
                </div>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => {
                    setEditingAd(ad)
                    setFormOpen(true)
                  }}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="secondary" className="h-7 w-7 text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(ad.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdvertisementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={loadData}
        editingAd={editingAd}
      />
    </div>
  )
}
