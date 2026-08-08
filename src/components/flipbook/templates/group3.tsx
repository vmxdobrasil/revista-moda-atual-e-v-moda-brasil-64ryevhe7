import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, FileText } from 'lucide-react'
import { EditorialHeader } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide } from './format-context'

function itemCols(format: TemplateFormat): string {
  if (isVertical(format)) return 'grid-cols-1'
  if (isSquare(format)) return 'grid-cols-2'
  return 'grid-cols-2 md:grid-cols-3'
}

export function renderGroup3(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'galeria_produtos') {
    const products: Array<{ name: string; image: string; description: string; link: string }> =
      d.products || []
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Galeria de Produtos</span>
        </div>
        <div className={`grid ${itemCols(format)} gap-3 flex-1 overflow-auto`}>
          {products.length > 0 ? (
            products.slice(0, story ? 4 : 6).map((p, i) => (
              <div key={i} className="bg-orange-50/40 rounded-lg p-3 flex flex-col">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="type-headline font-semibold text-gray-900 text-sm">
                  {p.name || `Produto ${i + 1}`}
                </h3>
                {p.description && (
                  <p className="type-caption text-gray-500 text-xs mt-1 flex-1">{p.description}</p>
                )}
                {p.link && (
                  <Link
                    to={p.link}
                    className="text-xs text-orange-600 font-medium mt-1 hover:underline"
                  >
                    Ver produto →
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic col-span-full text-center self-center type-caption">
              Produtos em breve
            </p>
          )}
        </div>
      </div>
    )
  }

  if (template === 'materia_cta') {
    const images: string[] = d.images || []
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Matéria</span>
        </div>
        <EditorialHeader
          title={d.title || 'Matéria'}
          subtitle={d.subtitle}
          format={format}
          align={d.text_align}
        />
        <div className="flex-1 overflow-auto">
          {d.body &&
            d.body.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-3 type-body text-gray-700 text-sm md:text-base text-justify">
                {i === 0 && (
                  <span className="float-left type-display text-4xl font-bold text-orange-600 leading-none mr-2 mt-1">
                    {p.charAt(0)}
                  </span>
                )}
                {i === 0 ? p.slice(1) : p}
              </p>
            ))}
          {images.length > 0 && (
            <div className={`grid ${story ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mt-3`}>
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-md" />
              ))}
            </div>
          )}
        </div>
        {d.credits && <p className="mt-3 type-credits text-gray-500 text-xs">Por {d.credits}</p>}
        <Link
          to={d.cta_link || '/'}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-orange-600 shadow-lg hover:scale-105 transition-transform self-start text-sm"
        >
          {d.cta_label || 'Confira'} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'comparativo_ab') {
    const optA = d.option_a || {}
    const optB = d.option_b || {}
    const story = isVertical(format)
    const renderMetrics = (m: any) => {
      if (!m || (!m.impressions && !m.clicks && !m.orders)) return null
      return (
        <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-gray-200">
          <div className="type-caption text-xs text-gray-500">
            <span className="font-bold text-gray-700">{m.impressions || 0}</span> impressões
          </div>
          <div className="type-caption text-xs text-gray-500">
            <span className="font-bold text-gray-700">{m.clicks || 0}</span> cliques
          </div>
          <div className="type-caption text-xs text-gray-500">
            <span className="font-bold text-gray-700">{m.orders || 0}</span> pedidos
          </div>
          <div className="type-caption text-xs text-gray-500">
            <span className="font-bold text-orange-600">{m.conversion_rate || 0}%</span> conversão
          </div>
        </div>
      )
    }
    const renderOption = (opt: any, label: string) => (
      <div className="flex-1 bg-orange-50/40 rounded-lg p-4 flex flex-col">
        <span className="type-eyebrow text-[0.625rem] text-orange-600 mb-2">{label}</span>
        {opt.image && (
          <img src={opt.image} alt="" className="w-full h-24 object-cover rounded-md mb-3" />
        )}
        <h3 className="type-headline font-bold text-gray-900 text-sm">{opt.title || label}</h3>
        {opt.description && (
          <p className="type-body text-sm text-gray-600 mt-1 flex-1">{opt.description}</p>
        )}
        {renderMetrics(opt.metrics)}
        {opt.link && (
          <Link to={opt.link} className="text-xs text-orange-600 font-medium mt-2 hover:underline">
            Ver mais →
          </Link>
        )}
      </div>
    )
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <EditorialHeader eyebrow="Comparativo A/B" title="Qual você prefere?" format={format} />
        <div
          className={`flex-1 flex ${story ? 'flex-col' : 'flex-col md:flex-row'} gap-4 overflow-hidden`}
        >
          {renderOption(optA, 'Opção A')}
          {renderOption(optB, 'Opção B')}
        </div>
      </div>
    )
  }

  return null
}
