import { useState, useEffect, useCallback } from 'react'
import {
  scheduleABVariant,
  getScheduledVariants,
  type SocialChannel,
} from '@/services/cover-actions'
import type { CoverData } from '@/services/cover-versions'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Plus } from 'lucide-react'

interface AbSchedulingPanelProps {
  editionId: string
  variants: CoverData[]
}

const CHANNELS: SocialChannel[] = ['Reels', 'YouTube', 'Instagram']

export function AbSchedulingPanel({ editionId, variants }: AbSchedulingPanelProps) {
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [channel, setChannel] = useState<SocialChannel>('Instagram')
  const [postDate, setPostDate] = useState('')
  const [scheduled, setScheduled] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    try {
      const data = await getScheduledVariants(editionId)
      setScheduled(data)
    } catch {
      /* intentionally ignored */
    }
  }, [editionId])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('social_posts', () => loadData())

  const handleSchedule = async () => {
    if (!postDate || variants.length === 0) return
    setLoading(true)
    setError('')
    try {
      await scheduleABVariant(editionId, variants[selectedVariant], channel, postDate)
      setPostDate('')
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao agendar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Agendamento A/B</h3>
      </div>

      {variants.length === 0 ? (
        <p className="text-sm text-gray-500">Gere uma capa primeiro para agendar variações A/B.</p>
      ) : (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Variante</Label>
              <Select
                value={String(selectedVariant)}
                onValueChange={(v) => setSelectedVariant(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      Variante {String.fromCharCode(65 + i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as SocialChannel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ab-date">Data de Publicação</Label>
              <Input
                id="ab-date"
                type="date"
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleSchedule}
            disabled={loading || !postDate}
            className="gap-2 bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" /> Agendar Variante
          </Button>
        </div>
      )}

      {scheduled.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Hook</th>
                <th className="text-left p-2">Formato</th>
                <th className="text-left p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {scheduled.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-medium truncate max-w-[200px]">{s.hook}</td>
                  <td className="p-2">
                    <Badge variant="secondary">{s.format}</Badge>
                  </td>
                  <td className="p-2 text-gray-500">
                    {new Date(s.post_date).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
