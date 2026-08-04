import { useState, useEffect, useCallback } from 'react'
import { getEditions, type Edition } from '@/services/magazine'
import { createCoverVersion, type CoverData } from '@/services/cover-versions'
import {
  createCoverDelivery,
  getCoverDeliveryByEdition,
  submitForReview,
  approveCover,
  rejectCover,
  publishCover,
  type CoverDeliveryItem,
} from '@/services/cover-actions'
import { useRealtime } from '@/hooks/use-realtime'
import { StockImageSourceSelector } from '@/components/cover/StockImageSourceSelector'
import { CoverExportButtons } from '@/components/cover/CoverExportButtons'
import { CoverVersionsPanel } from '@/components/cover/CoverVersionsPanel'
import { AbSchedulingPanel } from '@/components/cover/AbSchedulingPanel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Palette, Save, Send, Check, X, Upload, Loader2, Plus } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-500' },
  em_revisao: { label: 'Em Revisão', color: 'bg-blue-500' },
  aprovado: { label: 'Aprovado', color: 'bg-green-500' },
  publicado: { label: 'Publicado', color: 'bg-purple-500' },
}

export default function CoverArtDirectorPage() {
  const { toast } = useToast()
  const [editions, setEditions] = useState<Edition[]>([])
  const [editionId, setEditionId] = useState('')
  const [theme, setTheme] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [stockSource] = useState('unsplash')
  const [variants, setVariants] = useState<CoverData[]>([])
  const [delivery, setDelivery] = useState<CoverDeliveryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadDelivery = useCallback(async () => {
    if (!editionId) return
    const d = await getCoverDeliveryByEdition(editionId)
    setDelivery(d)
  }, [editionId])

  useEffect(() => {
    getEditions()
      .then((eds) => {
        setEditions(eds)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (editionId) loadDelivery()
  }, [editionId, loadDelivery])

  useRealtime('delivery_queue', () => loadDelivery())

  const coverData: CoverData | null = imageUrl
    ? { imageUrl, title: title || theme, subtitle, altText: altText || title, stockSource, theme }
    : null

  const handleImageSelect = (url: string, alt: string) => {
    setImageUrl(url)
    setAltText(alt)
  }

  const handleAddVariant = () => {
    if (!coverData) return
    setVariants((prev) => [...prev, coverData])
    setImageUrl('')
    setTitle('')
    setSubtitle('')
    setAltText('')
  }

  const handleSave = async () => {
    if (!editionId || !coverData) return
    setSaving(true)
    try {
      await createCoverVersion(editionId, coverData)
      const d = await createCoverDelivery(editionId, coverData)
      setDelivery(d)
      toast({ title: 'Sucesso', description: 'Capa salva como rascunho!' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro ao salvar',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleApproval = async (action: 'submit' | 'approve' | 'reject' | 'publish') => {
    if (!delivery) return
    try {
      if (action === 'submit') await submitForReview(delivery.id)
      else if (action === 'approve') await approveCover(delivery.id)
      else if (action === 'reject') await rejectCover(delivery.id)
      else if (action === 'publish') await publishCover(delivery.id)
      loadDelivery()
      toast({ title: 'Sucesso', description: 'Status atualizado!' })
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Erro',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const status = delivery?.status || 'rascunho'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Palette className="w-6 h-6 text-orange-500" />
        <h2 className="text-3xl font-bold tracking-tight">Cover & Editorial Art Director</h2>
      </div>

      <div className="space-y-2 max-w-md">
        <Label>Edição</Label>
        <Select value={editionId} onValueChange={setEditionId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma edição" />
          </SelectTrigger>
          <SelectContent>
            {editions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {editionId && (
        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">Gerar Capa</TabsTrigger>
            <TabsTrigger value="versions">Versões</TabsTrigger>
            <TabsTrigger value="ab">A/B Testing</TabsTrigger>
            <TabsTrigger value="approval">Aprovação</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="bg-white border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cover-theme">Tema</Label>
                  <Input
                    id="cover-theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Tema da capa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover-title">Título</Label>
                  <Input
                    id="cover-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título na capa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover-subtitle">Subtítulo</Label>
                <Input
                  id="cover-subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Subtítulo na capa"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Selecionar Imagem Stock</h3>
              <StockImageSourceSelector
                onSelect={handleImageSelect}
                defaultQuery={theme || 'fashion magazine cover'}
              />
            </div>

            {imageUrl && (
              <div className="bg-white border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Pré-visualização</h3>
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 max-w-2xl">
                  <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white">{title || theme}</h2>
                    {subtitle && <p className="text-white/80">{subtitle}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2 bg-orange-500 hover:bg-orange-600"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar Capa
                  </Button>
                  <Button onClick={handleAddVariant} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Adicionar Variante A/B
                  </Button>
                  <CoverExportButtons
                    coverData={coverData}
                    editionId={editionId}
                    variants={variants}
                  />
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-3">Variações A/B ({variants.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {variants.map((v, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded overflow-hidden">
                      <img
                        src={v.imageUrl}
                        alt={v.altText}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 text-xs text-white bg-black/60 px-1.5 py-0.5 rounded">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions">
            <CoverVersionsPanel editionId={editionId} />
          </TabsContent>

          <TabsContent value="ab">
            <AbSchedulingPanel
              editionId={editionId}
              variants={variants.length > 0 ? variants : coverData ? [coverData] : []}
            />
          </TabsContent>

          <TabsContent value="approval" className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Workflow de Aprovação</h3>
              <Badge className={STATUS_CONFIG[status]?.color}>
                {STATUS_CONFIG[status]?.label || status}
              </Badge>
            </div>

            {!delivery ? (
              <p className="text-sm text-gray-500">
                Nenhuma capa na fila. Salve uma capa para iniciar o fluxo de aprovação.
              </p>
            ) : (
              <div className="bg-white border rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Tema:</span>
                  <span className="ml-2 font-medium">{delivery.theme}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status atual:</span>
                  <Badge className={`ml-2 ${STATUS_CONFIG[status]?.color}`}>
                    {STATUS_CONFIG[status]?.label}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {status === 'rascunho' && (
                    <Button onClick={() => handleApproval('submit')} className="gap-2">
                      <Send className="w-4 h-4" /> Enviar para Revisão
                    </Button>
                  )}
                  {status === 'em_revisao' && (
                    <>
                      <Button
                        onClick={() => handleApproval('approve')}
                        className="gap-2 bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" /> Aprovar
                      </Button>
                      <Button
                        onClick={() => handleApproval('reject')}
                        variant="outline"
                        className="gap-2"
                      >
                        <X className="w-4 h-4" /> Rejeitar
                      </Button>
                    </>
                  )}
                  {status === 'aprovado' && (
                    <Button
                      onClick={() => handleApproval('publish')}
                      className="gap-2 bg-purple-500 hover:bg-purple-600"
                    >
                      <Upload className="w-4 h-4" /> Publicar
                    </Button>
                  )}
                  {status === 'publicado' && (
                    <p className="text-sm text-green-600">Capa publicada e aplicada à edição!</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
