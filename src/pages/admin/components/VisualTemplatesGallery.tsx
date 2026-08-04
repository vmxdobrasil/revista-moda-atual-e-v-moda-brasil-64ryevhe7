import { useState, useEffect, useCallback } from 'react'
import { getVisualTemplates, type VisualTemplate } from '@/services/visual-templates'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Palette } from 'lucide-react'

const TEMPLATE_COLORS: Record<string, string> = {
  default: '#1f2937',
  editorial: '#2563eb',
  marketing: '#ea580c',
  holofote: '#fcd34d',
  entrevista: '#7c3aed',
}

export function VisualTemplatesGallery() {
  const [templates, setTemplates] = useState<VisualTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      setTemplates(await getVisualTemplates())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('visual_templates', () => loadData())

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        Nenhum template visual encontrado.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((t) => {
        const palette = t.palette || {}
        const typography = t.typography || {}
        const accent = TEMPLATE_COLORS[t.template] || '#ea580c'
        return (
          <Card key={t.id} className="overflow-hidden">
            <div
              className="h-24 flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${palette.primary || '#ea580c'}, ${
                  palette.secondary || '#f97316'
                })`,
              }}
            >
              <span className="text-white font-bold text-lg tracking-widest uppercase">
                {t.template}
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Badge variant="outline" style={{ color: accent }}>
                  {t.slug}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{t.description}</p>
              <div className="flex gap-1">
                {Object.values(palette).map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded border shadow-sm"
                    style={{ backgroundColor: c as string }}
                    title={c as string}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>
                  <span className="font-semibold">Título:</span> {typography.title as string}
                </p>
                <p>
                  <span className="font-semibold">Corpo:</span> {typography.body as string}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
