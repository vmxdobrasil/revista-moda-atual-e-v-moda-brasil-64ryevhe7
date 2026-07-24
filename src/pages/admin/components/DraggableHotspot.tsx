import { useState, useEffect, useRef, type RefObject } from 'react'
import { Hotspot, updateHotspot, deleteHotspot } from '@/services/magazine'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Loader2, Tag as TagIcon, Trash2 } from 'lucide-react'

interface DraggableHotspotProps {
  hotspot: Hotspot
  containerRef: RefObject<HTMLDivElement | null>
  onChange: () => void
}

export function DraggableHotspot({ hotspot, containerRef, onChange }: DraggableHotspotProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ x: hotspot.x, y: hotspot.y })
  const [isDragging, setIsDragging] = useState(false)
  const [title, setTitle] = useState(hotspot.title)
  const [desc, setDesc] = useState(hotspot.description)
  const [price, setPrice] = useState(hotspot.price)
  const [link, setLink] = useState(hotspot.link)
  const [savingDetails, setSavingDetails] = useState(false)
  const { toast } = useToast()
  const dragState = useRef({ startX: 0, startY: 0, hasDragged: false, pointerId: -1 })
  const isDraggingRef = useRef(false)
  const wasDragRef = useRef(false)
  const lastSavedPos = useRef({ x: hotspot.x, y: hotspot.y })
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    },
    [],
  )

  useEffect(() => {
    if (!isDraggingRef.current) {
      setPos({ x: hotspot.x, y: hotspot.y })
      lastSavedPos.current = { x: hotspot.x, y: hotspot.y }
    }
  }, [hotspot.x, hotspot.y])

  useEffect(() => {
    setTitle(hotspot.title)
    setDesc(hotspot.description)
    setPrice(hotspot.price)
    setLink(hotspot.link)
  }, [hotspot.title, hotspot.description, hotspot.price, hotspot.link])

  const debouncedSave = (id: string, x: number, y: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await updateHotspot(id, { x, y })
        lastSavedPos.current = { x, y }
        onChange()
      } catch {
        setPos(lastSavedPos.current)
        toast({ title: 'Erro ao salvar posição do hotspot.', variant: 'destructive' })
      }
    }, 300)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      hasDragged: false,
      pointerId: e.pointerId,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragState.current.pointerId !== e.pointerId) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    if (!dragState.current.hasDragged && Math.hypot(dx, dy) > 5) {
      dragState.current.hasDragged = true
      setIsDragging(true)
      isDraggingRef.current = true
    }
    if (dragState.current.hasDragged && containerRef.current) {
      const r = containerRef.current.getBoundingClientRect()
      setPos({
        x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
        y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.current.pointerId !== e.pointerId) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    if (dragState.current.hasDragged) {
      e.preventDefault()
      wasDragRef.current = true
      setIsDragging(false)
      isDraggingRef.current = false
      debouncedSave(hotspot.id, pos.x, pos.y)
    }
    dragState.current.pointerId = -1
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (dragState.current.pointerId !== e.pointerId) return
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    setIsDragging(false)
    isDraggingRef.current = false
    setPos(lastSavedPos.current)
    dragState.current.pointerId = -1
  }

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    try {
      await updateHotspot(hotspot.id, { title, description: desc, price, link })
      toast({ title: 'Tag atualizada.' })
      setOpen(false)
      onChange()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSavingDetails(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Excluir tag?')) return
    try {
      await deleteHotspot(hotspot.id)
      onChange()
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (wasDragRef.current && o) {
          wasDragRef.current = false
          return
        }
        setOpen(o)
      }}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            'absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-transform z-10 touch-none select-none',
            isDragging
              ? 'bg-orange-600 scale-125 cursor-grabbing ring-4 ring-orange-400/60 shadow-xl shadow-orange-500/50 will-change-transform'
              : 'bg-orange-500 hover:scale-110 shadow-lg',
          )}
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClick={(e) => {
            e.stopPropagation()
            if (wasDragRef.current) {
              e.preventDefault()
              wasDragRef.current = false
            }
          }}
        >
          <TagIcon className="w-4 h-4 text-white pointer-events-none" />
          {isDragging && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900/90 px-1.5 py-0.5 text-[10px] font-medium text-white pointer-events-none">
              {pos.x.toFixed(0)}%, {pos.y.toFixed(0)}%
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="right" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-4">
          <h4 className="font-medium leading-none text-gray-800">Editar Tag de Produto</h4>
          <div className="space-y-2">
            <Label className="text-xs">Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Preço</Label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: R$ 99,90"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Link (URL)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://vmodabrasil..."
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} className="flex-1">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDetails}
              disabled={savingDetails}
              className="flex-1"
            >
              {savingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
