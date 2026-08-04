import { useState } from 'react'
import {
  generateCover,
  generateThumbnail,
  type CoverComposition,
} from '@/services/cover-art-director'
import { getEditions, type Edition } from '@/services/magazine'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ImagePlus, Loader2, Youtube, Video } from 'lucide-react'
import { useEffect, useCallback } from 'react'

export function CoverGeneratorPanel() {
  const { toast } = useToast()
  const [theme, setTheme] = useState('')
  const [editionId, setEditionId] = useState('')
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<CoverComposition | null>(null)

  const loadEditions = useCallback(async () => {
    try {
      setEditions(await getEditions())
    } catch {
      /* intentionally ignored */
    }
  }, [])

  useEffect(() => {
    loadEditions()
  }, [loadEditions])
  useRealtime('editions', () => loadEditions())

  const handleCover = async () => {
    if (!theme.trim()) return
    setLoading('cover')
    setResult(null)
    try {
      const res = await generateCover(theme.trim(), editionId || undefined)
      setResult(res)
      toast({ title: 'Sucesso', description: 'Capa gerada!' })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao gerar capa.',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleThumbnail = async (format: 'Reels' | 'YouTube') => {
    if (!theme.trim()) return
    setLoading(format)
    setResult(null)
    try {
      const res = await generateThumbnail(theme.trim(), format)
      setResult(res)
      toast({ title: 'Sucesso', description: `Thumbnail ${format} gerado!` })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err?.message || 'Falha ao gerar thumbnail.',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerar Capa / Thumbnail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema / Story</Label>
            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Digite o tema ou história da capa"
            />
          </div>
          <div className="space-y-2">
            <Label>Edição (opcional — salva capa na edição)</Label>
            <Select value={editionId} onValueChange={setEditionId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma edição" />
              </SelectTrigger>
              <SelectContent>
                {editions.map((ed) => (
                  <SelectItem key={ed.id} value={ed.id}>
                    {ed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCover}
              disabled={!!loading || !theme.trim()}
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              {loading === 'cover' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4" />
              )}
              Gerar Capa
            </Button>
            <Button
              onClick={() => handleThumbnail('Reels')}
              disabled={!!loading || !theme.trim()}
              variant="outline"
              className="gap-2"
            >
              {loading === 'Reels' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Video className="w-4 h-4" />
              )}
              Thumbnail Reels
            </Button>
            <Button
              onClick={() => handleThumbnail('YouTube')}
              disabled={!!loading || !theme.trim()}
              variant="outline"
              className="gap-2"
            >
              {loading === 'YouTube' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Youtube className="w-4 h-4" />
              )}
              Thumbnail YouTube
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Composição Gerada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Paleta: {result.palette?.name}</h4>
              <div className="flex gap-2">
                {result.palette?.colors?.map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-lg border shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                    <span className="text-xs text-gray-500 font-mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Título</Label>
                <p className="text-sm font-medium">{result.typography?.title}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Corpo</Label>
                <p className="text-sm font-medium">{result.typography?.body}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Acento</Label>
                <p className="text-sm font-medium">{result.typography?.accent}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Hierarquia Visual</Label>
              <p className="text-sm text-gray-700">{result.hierarchy}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Layout</Label>
              <p className="text-sm text-gray-700">{result.layout}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Texto Alternativo</Label>
              <p className="text-sm text-gray-700">{result.alt_text}</p>
            </div>
            {result.stock_image_query && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Stock: {result.stock_image_query}</Badge>
                <img
                  src={`https://img.usecurling.com/p/400/560?q=${encodeURIComponent(result.stock_image_query)}&color=orange`}
                  alt="Stock suggestion"
                  className="w-20 h-28 object-cover rounded-lg border"
                />
              </div>
            )}
            {result.variants?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Variações A/B</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.variants.map((v, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge>{v.name}</Badge>
                        {v.template && <Badge variant="outline">{v.template}</Badge>}
                      </div>
                      <p className="text-xs text-gray-600">{v.description}</p>
                      <div className="flex gap-1">
                        {v.palette?.map((c, j) => (
                          <div
                            key={j}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
