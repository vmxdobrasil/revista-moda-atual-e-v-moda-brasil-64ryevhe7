import { TrendingUp, BarChart3 } from 'lucide-react'
import { EditorialHeader, EditionSeal, HighlightBox, MarketDataBar } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare } from './format-context'

interface MarketDataItem {
  label: string
  value: number
  unit: string
  trend: string
}

export function TrendReportView({ data, format }: { data: any; format: TemplateFormat }) {
  const trends: Array<{ headline: string; description: string; image: string }> = data.trends || []
  const marketData: MarketDataItem[] = data.market_data || []
  const recommendations: string[] = data.recommendations || []
  const story = isVertical(format)
  const square = isSquare(format)
  const maxTrends = story ? 2 : square ? 3 : 6
  const maxData = story ? 2 : 5
  const maxRecs = story ? 1 : 4
  const maxValue = marketData.length > 0 ? Math.max(...marketData.map((d) => d.value)) : 0

  return (
    <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600 uppercase tracking-widest">
            Trend Report
          </span>
        </div>
        {!story && <EditionSeal text={data.edition_title || 'Revista Moda Atual'} />}
      </div>
      <EditorialHeader
        title={data.title || 'Trend Report'}
        format={format}
        align={data.text_align}
      />
      {(data.author || data.date) && (
        <p className="type-caption text-gray-500 text-xs mb-2 -mt-2">
          {data.author}
          {data.author && data.date ? ' • ' : ''}
          {data.date}
        </p>
      )}
      {data.executive_summary && (
        <div className="mb-3 p-3 bg-orange-50/70 border-l-4 border-orange-500 rounded-r-lg">
          <p className="type-subheadline text-sm text-gray-800 leading-relaxed font-medium italic">
            {data.executive_summary}
          </p>
        </div>
      )}
      {marketData.length > 0 && !story && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-orange-500" />
            <h4 className="type-eyebrow text-[0.625rem] text-orange-600 uppercase tracking-widest">
              Dados de Mercado
            </h4>
          </div>
          <div className="space-y-2">
            {marketData.slice(0, maxData).map((d, i) => (
              <MarketDataBar
                key={i}
                label={d.label}
                value={d.value}
                unit={d.unit}
                max={maxValue}
                trend={d.trend as 'up' | 'down' | 'neutral'}
              />
            ))}
          </div>
        </div>
      )}
      {story && marketData.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {marketData.slice(0, 2).map((d, i) => (
            <div key={i} className="p-2 bg-orange-50/70 rounded-lg text-center">
              <p className="text-lg font-bold text-orange-600 font-serif">
                {d.value}
                {d.unit}
              </p>
              <p className="type-caption text-[0.625rem] text-gray-500">{d.label}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto space-y-2">
        {trends.length > 0
          ? trends.slice(0, maxTrends).map((t, i) => (
              <div
                key={i}
                className="flex gap-2.5 p-2.5 bg-orange-50/40 rounded-lg border border-orange-100/50"
              >
                {t.image && (
                  <img
                    src={t.image}
                    alt=""
                    className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="type-headline font-bold text-gray-900 text-xs leading-tight">
                    {t.headline || `Tendência ${i + 1}`}
                  </h3>
                  {t.description && (
                    <p className="type-caption text-gray-600 text-[0.6875rem] mt-0.5 leading-snug">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          : !data.executive_summary && (
              <p className="text-gray-400 italic text-center mt-4 type-caption text-xs">
                Tendências em breve
              </p>
            )}
      </div>
      {recommendations.length > 0 && (
        <HighlightBox
          title="Recomendações"
          items={recommendations.slice(0, maxRecs)}
          variant="light"
          format={format}
        />
      )}
    </div>
  )
}
