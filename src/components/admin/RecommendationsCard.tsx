import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'
import type { RecommendationResponse } from '@/services/social-posts'

const FORMAT_COLORS: Record<string, string> = {
  Reel: 'hsl(24, 95%, 53%)',
  Carousel: 'hsl(280, 65%, 60%)',
  Photo: 'hsl(200, 80%, 50%)',
}

export function RecommendationsCard({ data }: { data: RecommendationResponse }) {
  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Lightbulb className="w-5 h-5 text-orange-500" /> Pattern Detection & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.patterns.formats.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance por Formato</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.patterns.formats.map((f) => (
                <div key={f.format} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <Badge
                      style={{ backgroundColor: FORMAT_COLORS[f.format] || 'gray', color: 'white' }}
                    >
                      {f.format}
                    </Badge>
                    <span className="text-xs text-gray-400">{f.count} posts</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {(f.avgEngagement * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">engajamento médio</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.patterns.themes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Temas Mais Frequentes (Top Posts)
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.patterns.themes.map((t) => (
                <Badge key={t.word} variant="outline" className="text-sm">
                  {t.word} <span className="text-gray-400 ml-1">({t.count}x)</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recomendações</h4>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
