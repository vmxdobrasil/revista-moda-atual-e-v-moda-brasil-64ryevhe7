import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { schedulePosts, PLATFORM_OPTIONS } from '@/services/social-publisher'
import { Loader2, Calendar, Sparkles } from 'lucide-react'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postIds: string[]
  onScheduled: () => void
}

export function ScheduleDialog({ open, onOpenChange, postIds, onScheduled }: ScheduleDialogProps) {
  const [platform, setPlatform] = useState('instagram')
  const [scheduledAt, setScheduledAt] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async (useAI: boolean) => {
    if (!postIds.length) return
    setLoading(true)
    try {
      const result = await schedulePosts({
        postIds,
        platform,
        scheduledAt: useAI ? undefined : scheduledAt || undefined,
      })
      toast({
        title: 'Sucesso',
        description: `${result.scheduled.length} post(s) agendado(s)${result.recommended_time ? ` para ${result.recommended_time}` : ''}.${result.rationale ? ` ${result.rationale}` : ''}`,
      })
      onScheduled()
      onOpenChange(false)
      setScheduledAt('')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao agendar publicação.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Agendar Publicação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Plataforma</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data e Hora (opcional)</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Deixe em branco para recomendação automática de melhor horário por IA.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            {postIds.length} post(s) selecionado(s) para agendamento.
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleSchedule(false)}
            disabled={loading || !postIds.length}
            className="bg-orange-500 hover:bg-orange-600 gap-2 w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            Agendar
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSchedule(true)}
            disabled={loading || !postIds.length}
            className="gap-2 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            IA Recomendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
