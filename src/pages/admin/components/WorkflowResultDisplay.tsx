import type { WorkflowResult } from '@/services/content-workflow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PenLine, Palette, BarChart3 } from 'lucide-react'

export function WorkflowResultDisplay({ result }: { result: WorkflowResult }) {
  const fc = result.final_content
  const copy = fc.copy || {}
  const visual = fc.visual || {}
  const analysis = fc.analysis || {}
  const trend = fc.trend_brief || {}

  return (
    <Card className="rounded-xl border-none bg-white shadow-sm">
      <CardContent className="p-6">
        <Tabs defaultValue="copy">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="copy" className="gap-1.5">
              <PenLine className="w-4 h-4" /> Copy
            </TabsTrigger>
            <TabsTrigger value="visual" className="gap-1.5">
              <Palette className="w-4 h-4" /> Visual
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1.5">
              <BarChart3 className="w-4 h-4" /> Análise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="copy" className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{copy.title}</h3>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{copy.body}</p>
            <div className="flex flex-wrap gap-2">
              {copy.suggested_hashtags?.map((tag, i) => (
                <Badge key={i} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {tag}
                </Badge>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Conceito da Capa</p>
              <p className="text-gray-600">{visual.cover_concept}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">Template:</p>
              <Badge variant="outline">{visual.template}</Badge>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Título da Página</p>
              <p className="text-gray-600">{visual.page_title}</p>
            </div>
            {visual.hotspots && visual.hotspots.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Hotspots</p>
                <div className="space-y-2">
                  {visual.hotspots.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="font-mono text-orange-500 font-medium">
                        ({h.x}, {h.y})
                      </span>
                      <span className="text-gray-600">{h.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {analysis.top_themes && analysis.top_themes.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Top Themes</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.top_themes.map((t, i) => (
                    <Badge key={i} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {analysis.best_hooks && analysis.best_hooks.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Best Hooks</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {analysis.best_hooks.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.recommended_format && (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">Formato Recomendado:</p>
                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                  {analysis.recommended_format}
                </Badge>
              </div>
            )}
            <hr className="border-gray-200" />
            {trend.trend_summary && (
              <div>
                <p className="font-semibold text-gray-900 mb-1">Resumo de Tendências</p>
                <p className="text-gray-600">{trend.trend_summary}</p>
              </div>
            )}
            {trend.target_audience && (
              <div>
                <p className="font-semibold text-gray-900 mb-1">Público-Alvo</p>
                <p className="text-gray-600">{trend.target_audience}</p>
              </div>
            )}
            {trend.suggested_angle && (
              <div>
                <p className="font-semibold text-gray-900 mb-1">Ângulo Sugerido</p>
                <p className="text-gray-600">{trend.suggested_angle}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
