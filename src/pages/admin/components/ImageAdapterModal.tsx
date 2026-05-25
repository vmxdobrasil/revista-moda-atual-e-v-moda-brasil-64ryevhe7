import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { updateEditionPage, EditionPage, getFileUrl } from '@/services/magazine'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Crop, Move, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageAdapterModalProps {
  page: EditionPage
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function ImageAdapterModal({ page, open, onOpenChange, onSaved }: ImageAdapterModalProps) {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loadingImg, setLoadingImg] = useState(true)
  const [saving, setSaving] = useState(false)

  const [mode, setMode] = useState<'fill' | 'fit'>('fill')
  const [bgMode, setBgMode] = useState<'blur' | 'color'>('blur')
  const [bgColor, setBgColor] = useState<string>('#ffffff')
  const [offsetX, setOffsetX] = useState(0.5)
  const [offsetY, setOffsetY] = useState(0.5)

  const isDragging = useRef(false)
  const lastClient = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!open) {
      setImage(null)
      return
    }
    const imgUrl = page.image_file ? getFileUrl(page, page.image_file) : page.image_url
    if (!imgUrl) return

    setLoadingImg(true)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      setLoadingImg(false)
      setOffsetX(0.5)
      setOffsetY(0.5)
    }
    img.onerror = () => {
      toast({
        title: 'Erro ao carregar imagem',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
      setLoadingImg(false)
    }

    // Add cache buster to avoid cross-origin issues with cached images
    const urlWithCacheBuster = new URL(
      imgUrl.startsWith('http') ? imgUrl : window.location.origin + imgUrl,
    )
    urlWithCacheBuster.searchParams.set('cb', Date.now().toString())
    img.src = urlWithCacheBuster.toString()
  }, [open, page, toast])

  useEffect(() => {
    if (!image || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width // 1050 (target width: 21cm proportional)
    const ch = canvas.height // 1475 (target height: 29.5cm proportional)
    const iw = image.width
    const ih = image.height

    ctx.clearRect(0, 0, cw, ch)

    if (mode === 'fill') {
      const scale = Math.max(cw / iw, ch / ih)
      const scaledW = iw * scale
      const scaledH = ih * scale
      const maxDx = cw - scaledW
      const maxDy = ch - scaledH

      const dx = maxDx * offsetX
      const dy = maxDy * offsetY

      ctx.drawImage(image, dx, dy, scaledW, scaledH)
    } else {
      if (bgMode === 'color') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, cw, ch)
      } else if (bgMode === 'blur') {
        const scaleCover = Math.max(cw / iw, ch / ih)
        const coverW = iw * scaleCover
        const coverH = ih * scaleCover
        const dxCover = (cw - coverW) / 2
        const dyCover = (ch - coverH) / 2

        ctx.save()
        ctx.filter = 'blur(40px)'
        ctx.drawImage(image, dxCover, dyCover, coverW, coverH)
        ctx.drawImage(image, dxCover, dyCover, coverW, coverH) // Double draw for stronger blur
        ctx.restore()

        ctx.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.fillRect(0, 0, cw, ch)
      }

      const scaleFit = Math.min(cw / iw, ch / ih)
      const scaledW = iw * scaleFit
      const scaledH = ih * scaleFit
      const dx = (cw - scaledW) / 2
      const dy = (ch - scaledH) / 2

      ctx.drawImage(image, dx, dy, scaledW, scaledH)
    }
  }, [image, mode, bgMode, bgColor, offsetX, offsetY])

  const handleSave = () => {
    if (!canvasRef.current) return
    setSaving(true)
    canvasRef.current.toBlob(
      async (blob) => {
        if (!blob) {
          toast({ title: 'Erro ao gerar imagem', variant: 'destructive' })
          setSaving(false)
          return
        }
        try {
          const formData = new FormData()
          formData.append('image_file', blob, `page_${page.page_number}_adapted.jpg`)
          await updateEditionPage(page.id, formData)
          toast({ title: 'Imagem adaptada com sucesso.' })
          onSaved()
          onOpenChange(false)
        } catch (err) {
          toast({ title: 'Erro ao salvar', variant: 'destructive' })
        } finally {
          setSaving(false)
        }
      },
      'image/jpeg',
      0.9,
    )
  }

  const cw = 1050
  const ch = 1475
  let showXSlider = false
  let showYSlider = false

  if (image && mode === 'fill') {
    const scale = Math.max(cw / image.width, ch / image.height)
    const scaledW = image.width * scale
    const scaledH = image.height * scale
    if (Math.abs(cw - scaledW) > 1) showXSlider = true
    if (Math.abs(ch - scaledH) > 1) showYSlider = true
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== 'fill') return
    isDragging.current = true
    lastClient.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current || mode !== 'fill') return
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const rect = canvas.getBoundingClientRect()
    const dxClient = e.clientX - lastClient.current.x
    const dyClient = e.clientY - lastClient.current.y
    lastClient.current = { x: e.clientX, y: e.clientY }

    const canvasScaleX = canvas.width / rect.width
    const canvasScaleY = canvas.height / rect.height
    const realMovementX = dxClient * canvasScaleX
    const realMovementY = dyClient * canvasScaleY

    const scale = Math.max(canvas.width / image.width, canvas.height / image.height)
    const scaledW = image.width * scale
    const scaledH = image.height * scale

    if (showXSlider) {
      const maxDx = canvas.width - scaledW
      if (maxDx < 0) {
        const offsetDeltaX = realMovementX / maxDx
        setOffsetX((prev) => Math.min(Math.max(prev + offsetDeltaX, 0), 1))
      }
    }

    if (showYSlider) {
      const maxDy = canvas.height - scaledH
      if (maxDy < 0) {
        const offsetDeltaY = realMovementY / maxDy
        setOffsetY((prev) => Math.min(Math.max(prev + offsetDeltaY, 0), 1))
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-4 md:p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-orange-500" />
            Adaptar Imagem (21cm x 29.5cm)
          </DialogTitle>
          <DialogDescription>
            Ajuste a imagem para as proporções da revista impressa (aprox. 1:1.4). Use "Preencher"
            para cortar ou "Encaixar" para adicionar fundo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden mt-2">
          {/* Controls Panel */}
          <div className="w-full md:w-72 flex flex-col gap-6 overflow-y-auto pr-2 shrink-0">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
              <Label className="text-base font-semibold">Modo de Adaptação</Label>
              <RadioGroup value={mode} onValueChange={(v: any) => setMode(v)} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fill" id="fill" />
                  <Label htmlFor="fill" className="cursor-pointer">
                    Preencher (Cortar bordas)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fit" id="fit" />
                  <Label htmlFor="fit" className="cursor-pointer">
                    Encaixar (Com fundo)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {mode === 'fill' && (showXSlider || showYSlider) && (
              <div className="space-y-5 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Alinhamento Manual</Label>
                  <Move className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Você também pode arrastar a imagem diretamente ao lado para alinhá-la.
                </p>
                {showXSlider && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>Esquerda</span>
                      <span>Direita</span>
                    </div>
                    <Slider
                      value={[offsetX * 100]}
                      onValueChange={(vals) => setOffsetX(vals[0] / 100)}
                      max={100}
                      step={0.1}
                    />
                  </div>
                )}
                {showYSlider && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>Topo</span>
                      <span>Base</span>
                    </div>
                    <Slider
                      value={[offsetY * 100]}
                      onValueChange={(vals) => setOffsetY(vals[0] / 100)}
                      max={100}
                      step={0.1}
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'fit' && (
              <div className="space-y-5 bg-white p-4 rounded-lg border shadow-sm">
                <Label className="text-base font-semibold">Preenchimento de Fundo</Label>
                <RadioGroup
                  value={bgMode}
                  onValueChange={(v: any) => setBgMode(v)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blur" id="blur" />
                    <Label htmlFor="blur" className="cursor-pointer">
                      Desfocado (Automático)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="color" id="color" />
                    <Label htmlFor="color" className="cursor-pointer">
                      Cor Sólida
                    </Label>
                  </div>
                </RadioGroup>

                {bgMode === 'color' && (
                  <div className="space-y-3 pt-2 pl-6">
                    <Label>Escolha a cor</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-1 bg-white"
                      />
                      <span className="text-sm font-mono text-gray-600 uppercase">{bgColor}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canvas Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 rounded-lg overflow-hidden relative border min-h-0 p-4">
            {loadingImg ? (
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-orange-500" />
                <p className="font-medium">Carregando imagem original...</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={1050}
                  height={1475}
                  className={cn(
                    'max-w-full max-h-full object-contain shadow-md bg-white border border-gray-200 transition-shadow',
                    mode === 'fill' ? 'cursor-grab active:cursor-grabbing' : '',
                  )}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>
            )}
            {!loadingImg && (
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                Visualização (21cm x 29.5cm)
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2 pt-4 border-t shrink-0 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loadingImg}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar e Substituir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
