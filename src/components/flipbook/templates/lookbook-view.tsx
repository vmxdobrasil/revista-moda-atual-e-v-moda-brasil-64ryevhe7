import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { EditionSeal, EditorialHeader, CTABlock } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide } from './format-context'

function gridCols(format: TemplateFormat): string {
  if (isVertical(format)) return 'grid-cols-1'
  if (isSquare(format)) return 'grid-cols-2'
  if (isWide(format)) return 'grid-cols-3'
  return 'grid-cols-2 md:grid-cols-3'
}

function maxLooks(format: TemplateFormat): number {
  if (isVertical(format)) return 3
  if (isSquare(format)) return 4
  if (isWide(format)) return 6
  return 6
}

export function LookbookView({ data, format }: { data: any; format: TemplateFormat }) {
  const looks =
    data.looks?.length > 0
      ? data.looks
      : (data.images || []).map((img: string) => ({ image: img, description: '', price: '' }))
  const story = isVertical(format)
  const visibleLooks = looks.slice(0, maxLooks(format))

  return (
    <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="type-eyebrow text-[0.625rem] text-orange-600 uppercase tracking-widest">
          Lookbook
        </span>
        {!story && <EditionSeal text={data.edition_title || 'Revista Moda Atual'} />}
      </div>
      <EditorialHeader
        title={data.title || 'Lookbook'}
        subtitle={data.season}
        format={format}
        align={data.text_align}
      />
      {data.description && !story && (
        <p className="type-caption text-gray-500 text-xs mb-3 -mt-2 leading-relaxed">
          {data.description}
        </p>
      )}
      <div className={`grid ${gridCols(format)} gap-2 md:gap-3 flex-1 overflow-auto`}>
        {visibleLooks.length > 0 ? (
          visibleLooks.map((look: any, i: number) => (
            <div
              key={i}
              className="flex flex-col rounded-lg overflow-hidden shadow-sm bg-gray-50 border border-gray-100 group"
            >
              {look.image && (
                <div className="relative overflow-hidden">
                  <img
                    src={look.image}
                    alt={`Look ${i + 1}`}
                    className="w-full h-24 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-[0.625rem] font-bold text-orange-600 font-serif">
                    {i + 1}
                  </span>
                </div>
              )}
              <div className="p-2 flex-1 flex flex-col justify-between gap-1">
                {look.description && (
                  <p className="type-caption text-gray-600 text-[0.6875rem] leading-snug line-clamp-2">
                    {look.description}
                  </p>
                )}
                {look.price && <p className="text-sm font-bold text-orange-600">{look.price}</p>}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-gray-400 type-caption py-8">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-xs">Looks em breve</span>
          </div>
        )}
      </div>
      {!story && data.link && (
        <Link
          to={data.link || '/'}
          className="mt-3 inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:gap-3 transition-all self-start"
        >
          Ver em V MODA BRASIL <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {story && data.link && <CTABlock label="Ver Coleção" link={data.link} format={format} />}
    </div>
  )
}
