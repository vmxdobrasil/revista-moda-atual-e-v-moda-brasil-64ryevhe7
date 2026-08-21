import { useState, useEffect } from 'react'
import {
  FashionEvent,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/fashion_events'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  Camera,
  Calendar as CalendarIcon,
  Share2,
  Settings2,
  MapPin,
  Sparkles,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  ImageIcon,
  X,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Desfile', 'Festa', 'Tapete Vermelho', 'Outros']

const formatPTDate = (dateStr: string) => {
  if (!dateStr) return ''
  const isoStr = dateStr.length === 10 ? `${dateStr}T12:00:00Z` : dateStr
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  const day = String(d.getUTCDate()).padStart(2, '0')
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  const month = months[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return `${day} de ${month} de ${year}`
}

type GalleryItem = {
  id: string
  title: string
  description: string
  imageUrl?: string
  imageFile?: File
}

export default function EventsPage() {
  const [events, setEvents] = useState<FashionEvent[]>([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Admin / Spotlight Manager State
  const [editing, setEditing] = useState<Partial<FashionEvent> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [gallery, setGallery] = useState<GalleryItem[]>([])

  const loadEvents = async () => {
    try {
      const data = await getEvents()
      setEvents(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])
  useRealtime('fashion_events', loadEvents)

  const filteredEvents =
    activeCategory === 'All' ? events : events.filter((e) => e.category === activeCategory)

  // Spotlight is the first `is_spotlight` that matches filter, or first event
  const spotlight = filteredEvents.find((e) => e.is_spotlight) || filteredEvents[0]
  const archive = filteredEvents.filter((e) => e.id !== spotlight?.id)
  const galleryData = spotlight?.gallery_data || []

  const handleShare = (legend: string, imgUrl?: string) => {
    const text = `Confira ${legend} na Cobertura de Moda da Revista Moda Atual!`
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: legend, text, url }).catch(console.error)
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }
  }

  // Manager functions
  const handleEdit = (ev: FashionEvent) => {
    setEditing(ev)
    setIsCreating(false)
    setMainImageFile(null)
    setMainImagePreview(ev.image ? pb.files.getURL(ev, ev.image) : null)
    const gd = ev.gallery_data || []
    setGallery(
      gd.map((g) => ({
        id: Math.random().toString(),
        title: g.title || '',
        description: g.description || '',
        imageUrl: g.imageUrl || '',
      })),
    )
  }

  const handleNew = () => {
    setEditing({
      title: '',
      description: '',
      category: 'Outros',
      location: '',
      status: 'publicado',
      is_spotlight: false,
      date: new Date().toISOString().split('T')[0],
    })
    setIsCreating(true)
    setMainImageFile(null)
    setMainImagePreview(null)
    setGallery([])
  }

  const handleSave = async () => {
    if (!editing?.title || !editing?.date) {
      return toast({
        title: 'Atenção',
        description: 'Título e data são obrigatórios',
        variant: 'destructive',
      })
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', editing.title)
      fd.append('description', editing.description || '')
      fd.append('date', editing.date)
      fd.append('location', editing.location || '')
      fd.append('category', editing.category || 'Outros')
      fd.append('status', editing.status || 'publicado')
      fd.append('is_spotlight', String(editing.is_spotlight || false))

      if (mainImageFile) fd.append('image', mainImageFile)

      const finalGalleryData = gallery.map((item) => ({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl || '',
      }))

      fd.append('gallery_data', JSON.stringify(finalGalleryData))

      if (editing.is_spotlight) {
        const currentSpotlights = events.filter((e) => e.is_spotlight && e.id !== editing.id)
        for (const cs of currentSpotlights) {
          await updateEvent(cs.id, { is_spotlight: false })
        }
      }

      if (isCreating) {
        await createEvent(fd)
        toast({ title: 'Sucesso', description: 'Cobertura criada com sucesso.' })
      } else if (editing.id) {
        await updateEvent(editing.id, fd)
        toast({ title: 'Sucesso', description: 'Cobertura atualizada.' })
      }

      setEditing(null)
      loadEvents()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro',
        description: 'Falha ao salvar evento.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta cobertura de evento?')) return
    await deleteEvent(id)
    if (editing?.id === id) setEditing(null)
    loadEvents()
    toast({ title: 'Removido', description: 'Evento excluído com sucesso.' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <Badge
            variant="outline"
            className="border-orange-500/50 text-orange-400 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold rounded-full tracking-wide inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            COLUNA SOCIAL & COBERTURA DE EVENTOS
          </Badge>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white">
            HOLOFOTE & EVENTOS
          </h1>

          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base md:text-lg font-light leading-relaxed">
            Acompanhe os principais desfiles, noites de gala, lançamentos de coleções e encontros
            que movimentam o ecossistema de moda brasileiro.
          </p>

          {/* Categories / Filters & Manager */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className={cn(
                  'rounded-full px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all',
                  activeCategory === cat
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
                    : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white',
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? 'Todas as Coberturas' : cat}
              </Button>
            ))}

            {isAuthenticated && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full px-5 py-2 text-xs uppercase tracking-wider font-bold border-orange-500/40 text-orange-400 hover:bg-orange-500/10 shrink-0 ml-2"
                  >
                    <Settings2 className="w-4 h-4 mr-1.5" />
                    Gerenciar Eventos
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-6">
                  <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="font-serif text-xl sm:text-2xl flex items-center justify-between">
                      <span>Gerenciador de Coberturas & Eventos</span>
                      {!editing && (
                        <Button
                          onClick={handleNew}
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-500 text-white font-medium"
                        >
                          <Plus className="w-4 h-4 mr-1.5" />
                          Novo Evento
                        </Button>
                      )}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto py-4">
                    {editing ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <h3 className="font-serif font-bold text-lg">
                            {isCreating ? 'Cadastrar Novo Evento' : 'Editar Cobertura'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-orange-600 hover:bg-orange-500 text-white"
                            >
                              <Save className="w-4 h-4 mr-1.5" />
                              Salvar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Título do Evento *</Label>
                            <Input
                              value={editing.title || ''}
                              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                              placeholder="Ex: São Paulo Fashion Week N58"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Categoria</Label>
                            <select
                              className="w-full h-10 px-3 py-2 border rounded-md text-sm bg-background border-input"
                              value={editing.category || 'Outros'}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  category: e.target.value as any,
                                })
                              }
                            >
                              <option value="Desfile">Desfile</option>
                              <option value="Festa">Festa</option>
                              <option value="Tapete Vermelho">Tapete Vermelho</option>
                              <option value="Outros">Outros</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Data (AAAA-MM-DD) *</Label>
                            <Input
                              type="date"
                              value={editing.date || ''}
                              onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs">Local</Label>
                            <Input
                              value={editing.location || ''}
                              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                              placeholder="Ex: Pavilhão Ibirapuera, São Paulo - SP"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Descrição / Matéria</Label>
                          <Textarea
                            rows={3}
                            value={editing.description || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                description: e.target.value,
                              })
                            }
                            placeholder="Resumo da cobertura editorial do evento..."
                          />
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                          <Switch
                            checked={editing.is_spotlight || false}
                            onCheckedChange={(c) => setEditing({ ...editing, is_spotlight: c })}
                          />
                          <div>
                            <Label className="font-semibold text-sm">
                              Destaque Principal (Holofote de Capa)
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Exibe este evento em destaque principal no topo da página.
                            </p>
                          </div>
                        </div>

                        {/* Main Image Upload */}
                        <div className="space-y-2">
                          <Label className="text-xs">Foto Principal / Capa</Label>
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 border rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {mainImagePreview ? (
                                <img
                                  src={mainImagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                              )}
                            </div>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  const file = e.target.files[0]
                                  setMainImageFile(file)
                                  setMainImagePreview(URL.createObjectURL(file))
                                }
                              }}
                              className="max-w-xs"
                            />
                          </div>
                        </div>

                        {/* Secondary Gallery */}
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <Label className="font-bold text-sm">Galeria de Fotos do Evento</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setGallery((prev) => [
                                  ...prev,
                                  {
                                    id: Math.random().toString(),
                                    title: '',
                                    description: '',
                                    imageUrl: '',
                                  },
                                ])
                              }
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Adicionar Foto
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {gallery.map((item, idx) => (
                              <div
                                key={item.id}
                                className="p-3 border rounded-lg bg-card/60 flex items-center gap-3 relative"
                              >
                                <Input
                                  placeholder="Título da foto / Destaque"
                                  value={item.title}
                                  onChange={(e) => {
                                    const next = [...gallery]
                                    next[idx].title = e.target.value
                                    setGallery(next)
                                  }}
                                  className="w-1/3 text-xs"
                                />
                                <Input
                                  placeholder="URL da imagem (ex: https://...)"
                                  value={item.imageUrl || ''}
                                  onChange={(e) => {
                                    const next = [...gallery]
                                    next[idx].imageUrl = e.target.value
                                    setGallery(next)
                                  }}
                                  className="flex-1 text-xs"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() =>
                                    setGallery(gallery.filter((g) => g.id !== item.id))
                                  }
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            {gallery.length === 0 && (
                              <p className="text-xs text-muted-foreground italic text-center py-2">
                                Nenhuma foto secundária adicionada à galeria.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {events.map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0">
                                {ev.image ? (
                                  <img
                                    src={pb.files.getURL(ev, ev.image)}
                                    alt={ev.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Camera className="w-5 h-5 m-auto text-muted-foreground/50" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm leading-snug">{ev.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                  <span>{formatPTDate(ev.date)}</span>
                                  <span>•</span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {ev.category || 'Outros'}
                                  </Badge>
                                  {ev.is_spotlight && (
                                    <Badge className="bg-orange-600 text-white text-[10px] px-1.5 py-0">
                                      Spotlight
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(ev.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-16">
        {/* Spotlight Showcase */}
        {spotlight ? (
          <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xl space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 shadow-lg group">
                {spotlight.image ? (
                  <img
                    src={pb.files.getURL(spotlight, spotlight.image)}
                    alt={spotlight.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-white text-center bg-gradient-to-tr from-slate-950 to-slate-800">
                    <Camera className="w-16 h-16 text-orange-400 mb-3 opacity-60" />
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                      Registro Editorial
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-orange-600 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                  {spotlight.category || 'Destaque'}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-5 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatPTDate(spotlight.date)}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                  {spotlight.title}
                </h2>

                {spotlight.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{spotlight.location}</span>
                  </div>
                )}

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
                  {spotlight.description ||
                    'Cobertura exclusiva trazendo os melhores momentos, convidados ilustres e tendências apresentadas.'}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    onClick={() => handleShare(spotlight.title)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-semibold gap-2 shadow-md"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartilhar Cobertura
                  </Button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            {galleryData.length > 0 && (
              <div className="pt-8 border-t border-border/70 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                    Galeria de Fotos do Evento
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {galleryData.length} fotos
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {galleryData.map((item, idx) => (
                    <div
                      key={idx}
                      className="group relative flex flex-col bg-card rounded-xl overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title || 'Foto do evento'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-muted-foreground">
                            <Camera className="w-8 h-8 opacity-40" />
                          </div>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-3 right-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-xs hover:bg-orange-600 hover:text-white"
                          onClick={() => handleShare(item.title, item.imageUrl)}
                          title="Compartilhar foto"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4 space-y-1">
                        <h4 className="font-serif font-bold text-sm leading-tight text-foreground line-clamp-1">
                          {item.title || 'Destaque de Moda'}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border rounded-2xl p-8">
            <Camera className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="text-lg font-serif font-bold">Nenhuma cobertura encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione outra categoria ou volte mais tarde para ver novidades.
            </p>
          </div>
        )}

        {/* Archive / Outras Coberturas */}
        {archive.length > 0 && (
          <section className="space-y-8 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/80 pb-4">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Outras Coberturas & Acervo
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Reviva os eventos e desfiles editoriais anteriores da Revista Moda Atual.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {archive.map((ev) => (
                <Card
                  key={ev.id}
                  className="overflow-hidden border-border/70 hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {ev.image ? (
                      <img
                        src={pb.files.getURL(ev, ev.image)}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">
                        <Camera className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {ev.category || 'Outros'}
                    </span>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                        {formatPTDate(ev.date)}
                      </span>
                      <h4 className="font-serif font-bold text-lg leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {ev.title}
                      </h4>
                      {ev.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border/50 text-xs text-muted-foreground">
                      <span className="truncate max-w-[200px]">{ev.location || 'Brasil'}</span>
                      <button
                        onClick={() => handleShare(ev.title)}
                        className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-1"
                      >
                        Compartilhar
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
