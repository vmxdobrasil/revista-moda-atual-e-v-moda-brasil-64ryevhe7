import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, FileText, Columns2, TrendingUp, Check } from 'lucide-react'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide, formatTitleSize } from './format-context'

function renderCTA(label: string, href: string, format: TemplateFormat = 'a4') {
  if (!label) return null
  const story = isVertical(format)
  const cls = story
    ? 'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-orange-600 shadow-lg self-start text-xs'
    : 'mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-600 shadow-lg hover:scale-105 transition-transform self-start text-sm'
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label} <ArrowRight className={story ? 'w-3 h-3' : 'w-4 h-4'} />
      </a>
    )
  }
  return (
    <Link to={href || '/'} className={cls}>
      {label} <ArrowRight className={story ? 'w-3 h-3' : 'w-4 h-4'} />
    </Link>
  )
}

export function renderGroup3(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'galeria_produtos') {
    const story = isVertical(format)
    const wide = isWide(format)
    const products: any[] = d.products || []
    const gridCls = story
      ? 'grid-cols-1'
      : isSquare(format)
        ? 'grid-cols-2'
        : wide
          ? 'grid-cols-3'
          : 'grid-cols-2'
    const maxItems = story ? 3 : isSquare(format) ? 4 : 6
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Galeria de Produtos</span>
        </div>
        {d.title && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-3`}>
            {d.title}
          </h2>
        )}
        <div className={`grid ${gridCls} gap-3 flex-1 overflow-auto`}>
          {products.slice(0, maxItems).map((p, i) => (
            <div key={i} className="bg-orange-50/30 rounded-lg p-2 flex flex-col">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className={`w-full ${story ? 'h-24' : 'h-20'} object-cover rounded-md mb-2`}
                />
              )}
              <p className="text-xs font-semibold text-gray-900 type-caption line-clamp-2">
                {p.name}
              </p>
              {p.description && (
                <p className="text-[0.625rem] text-gray-500 type-caption line-clamp-2 mt-0.5">
                  {p.description}
                </p>
              )}
              {p.price && <p className="text-sm text-orange-600 font-bold mt-1">{p.price}</p>}
              {p.link && renderCTA('Ver', p.link, format)}
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (template === 'materia_cta') {
    const story = isVertical(format)
    const wide = isWide(format)
    const images: string[] = d.images || []
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Matéria</span>
        </div>
        {d.title && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-1`}>
            {d.title}
          </h2>
        )}
        {d.subtitle && <p className="type-subheadline text-sm text-gray-500 mb-3">{d.subtitle}</p>}
        {images.length > 0 && (
          <div
            className={`grid ${story ? 'grid-cols-1' : wide ? 'grid-cols-2' : 'grid-cols-2'} gap-2 mb-3`}
          >
            {images.slice(0, 2).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`w-full ${story ? 'h-32' : 'h-28'} object-cover rounded-lg`}
              />
            ))}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {d.body ? (
            d.body.split('\n').map((p: string, i: number) => (
              <p
                key={i}
                className="mb-3 type-body text-sm text-gray-700 leading-relaxed text-justify"
              >
                {i === 0 && (
                  <span className="float-left text-4xl font-serif font-bold text-orange-600 leading-none mr-2 mt-1">
                    {p.charAt(0)}
                  </span>
                )}
                {i === 0 ? p.slice(1) : p}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic type-caption">Conteúdo em breve</p>
          )}
        </div>
        {d.credits && <p className="type-credits text-xs text-gray-400 mb-2">Por {d.credits}</p>}
        {renderCTA(d.cta_label || 'Saiba Mais', d.cta_link || '/', format)}
      </div>
    )
  }
  if (template === 'comparativo_ab') {
    const story = isVertical(format)
    const wide = isWide(format)
    const factors: string[] = d.deciding_factors || []
    const optA = d.option_a || {}
    const optB = d.option_b || {}
    const stackCls = story ? 'flex-col' : 'flex-row'
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Columns2 className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Comparativo A/B</span>
        </div>
        {d.title && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-3`}>
            {d.title}
          </h2>
        )}
        <div className={`flex ${stackCls} gap-3 flex-1 overflow-auto`}>
          {[
            { label: 'A', opt: optA },
            { label: 'B', opt: optB },
          ].map(({ label, opt }) => (
            <div
              key={label}
              className="flex-1 bg-orange-50/30 rounded-lg p-3 border border-orange-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                  {label}
                </span>
                <h3 className="type-headline text-sm font-bold text-gray-900">
                  {opt.title || `Opção ${label}`}
                </h3>
              </div>
              {opt.image && (
                <img
                  src={opt.image}
                  alt={opt.title}
                  className={`w-full ${story ? 'h-28' : 'h-24'} object-cover rounded-md mb-2`}
                />
              )}
              {opt.description && (
                <p className="type-caption text-xs text-gray-600 mb-2">{opt.description}</p>
              )}
              {opt.price && <p className="text-sm text-orange-600 font-bold mb-1">{opt.price}</p>}
              {opt.metrics && (
                <div className="text-[0.625rem] text-gray-500 type-caption space-y-0.5">
                  {opt.metrics.impressions != null && (
                    <p>Impressões: {opt.metrics.impressions.toLocaleString('pt-BR')}</p>
                  )}
                  {opt.metrics.clicks != null && (
                    <p>Cliques: {opt.metrics.clicks.toLocaleString('pt-BR')}</p>
                  )}
                  {opt.metrics.conversion_rate != null && (
                    <p>Conversão: {opt.metrics.conversion_rate}%</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {factors.length > 0 && (
          <div className="mt-3 p-3 bg-orange-50/80 border-l-4 border-orange-600 rounded-r-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <h4 className="type-eyebrow text-orange-900 text-[0.625rem]">Fatores Decisivos</h4>
            </div>
            <ul className="space-y-0.5">
              {factors.map((f, i) => (
                <li key={i} className="type-caption text-xs text-gray-700 flex items-start gap-1.5">
                  <Check className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {renderCTA(d.cta_label || 'Ver Opções', d.cta_link || '/', format)}
      </div>
    )
  }
  return null
}
