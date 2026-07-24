import { useState, useEffect, useRef } from 'react'
import {
  EditionPage,
  Hotspot,
  getHotspotsByPage,
  createHotspot,
  getFileUrl,
} from '@/services/magazine'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { DraggableHotspot } from './DraggableHotspot'

export function HotspotEditorModal({
  page,
  open,
  onOpenChange,
}: {
  page: EditionPage
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      setHotspots(await getHotspotsByPage(page.id))
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadData()
  }, [open, page.id])

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    try {
      const created = await createHotspot({
        page: page.id,
        x,
        y,
        title: 'Novo Produto',
        description: '',
        price: '',
        link: '',
      })
      setHotspots((prev) => [...prev, created])
      toast({
        title: 'Tag adicionada.',
        description: 'Arraste para reposicionar ou clique para editar.',
      })
    } catch {
      toast({ title: 'Erro ao adicionar tag.', variant: 'destructive' })
    }
  }

  const imageUrl = page.image_file ? getFileUrl(page, page.image_file) : page.image_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>Editor de Tags - Página {page.page_number}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 bg-gray-100 rounded-md overflow-hidden relative mt-2 border flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          ) : (
            <div
              ref={containerRef}
              className="relative inline-block h-full shadow-lg"
              style={{ aspectRatio: '0.7118' }}
            >
              <img
                src={imageUrl}
                alt="Página"
                className="w-full h-full object-cover cursor-crosshair"
                onClick={handleImageClick}
              />
              {hotspots.map((h) => (
                <DraggableHotspot
                  key={h.id}
                  hotspot={h}
                  containerRef={containerRef}
                  onChange={loadData}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Clique na imagem para adicionar uma tag. Arraste as tags para reposicionar. Clique em uma
          tag para editar detalhes.
        </p>
      </DialogContent>
    </Dialog>
  )
}
