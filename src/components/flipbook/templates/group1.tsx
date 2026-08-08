import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { EditionSeal, EditorialHeader } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide } from './format-context'

function itemCols(format: TemplateFormat): string {
  if (isVertical(format)) return 'grid-cols-1'
  if (isSquare(format)) return 'grid-cols-2'
  if (isWide(format)) return 'grid-cols-4'
  return 'grid-cols-2 md:grid-cols-3'
}

export function renderGroup1(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'lookbook') {
    const looks =
      d.looks?.length > 0
        ? d.looks
        : (d.images || []).map((img: string) => ({ image: img, description: '', price: '' }))
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Lookbook</span>
          {!story && <EditionSeal text={d.edition_title || 'Revista Moda Atual'} />}
        </div>
        <EditorialHeader
          title={d.title || 'Lookbook'}
          subtitle={d.season}
          format={format}
          align={d.text_align}
        />
        {d.description && (
          <p className="type-caption text-gray-500 text-xs mb-3 -mt-2">{d.description}</p>
        )}
        <div className={`grid ${itemCols(format)} gap-3 flex-1 overflow-auto`}>
          {looks.length > 0 ? (
            looks.slice(0, story ? 4 : 6).map((look: any, i: number) => (
              <div
                key={i}
                className="flex flex-col rounded-lg overflow-hidden shadow-sm bg-gray-50"
              >
                {look.image && (
                  <img
                    src={look.image}
                    alt={`Look ${i + 1}`}
                    className="w-full h-28 md:h-36 object-cover"
                  />
                )}
                <div className="p-2 flex-1 flex flex-col justify-between">
                  {look.description && (
                    <p className="type-caption text-gray-600 text-xs leading-snug">
                      {look.description}
                    </p>
                  )}
                  {look.price && (
                    <p className="text-sm font-bold text-orange-600 mt-1">{look.price}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic col-span-full text-center self-center type-caption">
              Imagens em breve
            </p>
          )}
        </div>
        <Link
          to={d.link || '/'}
          className="mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:gap-3 transition-all"
        >
          Ver em V MODA BRASIL <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'indice') {
    const sections: Array<{ title: string; link: string }> = d.sections || []
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 to-white safe-area overflow-hidden">
        <EditorialHeader eyebrow="Índice" title="Sumário" format={format} />
        <div className="flex-1 overflow-auto space-y-2">
          {sections.length > 0 ? (
            sections.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white/60 rounded-lg hover:bg-white transition-colors"
              >
                <span className="text-orange-600 font-bold text-lg w-8 text-center font-serif">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-gray-800 font-medium type-body text-sm">
                  {s.title || `Seção ${i + 1}`}
                </span>
                {s.link && <ArrowRight className="w-4 h-4 text-orange-400" />}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center mt-8 type-caption">Seções em breve</p>
          )}
        </div>
      </div>
    )
  }

  if (template === 'trend_report') {
    const trends: Array<{ headline: string; description: string; image: string }> = d.trends || []
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Trend Report</span>
        </div>
        <EditorialHeader title={d.title || 'Trend Report'} format={format} align={d.text_align} />
        {(d.author || d.date) && (
          <p className="type-caption text-gray-500 text-xs mb-3 -mt-2">
            {d.author}
            {d.author && d.date ? ' • ' : ''}
            {d.date}
          </p>
        )}
        <div className="flex-1 overflow-auto space-y-3">
          {trends.length > 0 ? (
            trends.slice(0, story ? 3 : 6).map((t, i) => (
              <div key={i} className="flex gap-3 p-3 bg-orange-50/50 rounded-lg">
                {t.image && (
                  <img
                    src={t.image}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="type-headline font-bold text-gray-900 text-sm">
                    {t.headline || `Tendência ${i + 1}`}
                  </h3>
                  {t.description && (
                    <p className="type-caption text-gray-600 text-xs mt-1">{t.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center mt-8 type-caption">
              Tendências em breve
            </p>
          )}
        </div>
      </div>
    )
  }

  return null
}
