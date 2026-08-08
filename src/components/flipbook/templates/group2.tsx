import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Quote,
  Megaphone,
  Building2,
  Handshake,
  Star,
  ExternalLink,
} from 'lucide-react'
import { EditionSeal, HighlightBox } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide, formatTitleSize } from './format-context'
import { getBrands, type Top60Brand } from '@/services/top60'

function renderCTA(label: string, href: string, format: TemplateFormat = 'a4') {
  if (!label) return null
  const story = isVertical(format)
  const cls = story
    ? 'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-orange-600 shadow-lg self-start text-xs'
    : 'mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-600 shadow-lg hover:scale-105 transition-transform self-start text-sm'
  const icon = <ArrowRight className={story ? 'w-3 h-3' : 'w-4 h-4'} />
  if (href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label} {icon}
      </a>
    )
  }
  return (
    <Link to={href || '/'} className={cls}>
      {label} {icon}
    </Link>
  )
}

function Top60MarcasView({ data, format }: { data: any; format: TemplateFormat }) {
  const [brands, setBrands] = useState<Top60Brand[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!data.category) {
      setLoading(false)
      return
    }
    getBrands(data.category)
      .then(setBrands)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [data.category])
  if (loading)
    return (
      <div className="h-full flex items-center justify-center text-gray-400 type-caption">
        Carregando marcas...
      </div>
    )
  if (brands.length === 0)
    return (
      <div className="h-full flex items-center justify-center text-gray-400 type-caption">
        Nenhuma marca encontrada.
      </div>
    )
  const story = isVertical(format)
  const maxItems = story ? 6 : isSquare(format) ? 6 : 12
  return (
    <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Award className="w-4 h-4 text-orange-500" />
        <span className="type-eyebrow text-[0.625rem] text-orange-600">Top 60 Marcas</span>
      </div>
      {brands[0]?.expand?.category && (
        <h2 className="type-display text-xl text-gray-900 mb-3">
          {brands[0].expand.category.name}
        </h2>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 type-eyebrow">
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Marca</th>
              {!story && <th className="py-2 pr-2 hidden md:table-cell">Descrição</th>}
              <th className="py-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {brands.slice(0, maxItems).map((b, i) => (
              <tr key={b.id} className="border-b border-gray-100">
                <td className="py-2 pr-2 font-bold text-orange-600 font-serif">
                  {b.position || i + 1}
                </td>
                <td className="py-2 pr-2 font-semibold text-gray-900">{b.name}</td>
                {!story && (
                  <td className="py-2 pr-2 hidden md:table-cell text-gray-500 text-xs type-caption">
                    {b.description
                      ? b.description.slice(0, 60) + (b.description.length > 60 ? '…' : '')
                      : ''}
                  </td>
                )}
                <td className="py-2 text-right font-bold text-gray-700">{b.score || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function renderGroup2(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'anuncio_patrocinado') {
    const story = isVertical(format)
    const wide = isWide(format)
    const imgH = story ? 'h-32' : wide ? 'h-48' : 'h-40'
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-orange-500" />
            <span className="type-eyebrow text-[0.625rem] text-orange-600">
              Anúncio Patrocinado
            </span>
          </div>
          {d.advertiser && (
            <span className="type-caption text-gray-500 text-xs">{d.advertiser}</span>
          )}
        </div>
        {d.campaign && (
          <p className="type-caption text-orange-500 text-xs mb-2 font-medium">{d.campaign}</p>
        )}
        {d.image && (
          <img
            src={d.image}
            alt={d.headline || ''}
            className={`w-full ${imgH} object-cover rounded-lg mb-3`}
          />
        )}
        {d.headline && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-2`}>
            {d.headline}
          </h2>
        )}
        {d.body && (
          <p className="type-body text-sm text-gray-600 flex-1 overflow-auto leading-relaxed">
            {d.body}
          </p>
        )}
        {!d.body && d.description && (
          <p className="type-body text-sm text-gray-600 flex-1 overflow-auto leading-relaxed">
            {d.description}
          </p>
        )}
        {renderCTA(d.cta_label || 'Ver Catálogo', d.catalog_link || d.link || '/', format)}
      </div>
    )
  }
  if (template === 'top60_marcas') return <Top60MarcasView data={d} format={format} />
  if (template === 'perfil_marca') {
    const story = isVertical(format)
    const wide = isWide(format)
    const highlights: string[] = d.highlights || []
    const products: any[] = d.products || []
    const gridCls = story ? 'grid-cols-1' : wide ? 'grid-cols-3' : 'grid-cols-2'
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-3 border-b-2 border-orange-600 pb-3 mb-3">
          {d.logo && (
            <img
              src={d.logo}
              alt=""
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
            />
          )}
          <div className="flex-1">
            <h2 className="type-display text-xl text-gray-900">{d.brand_name || 'Marca'}</h2>
            {(d.category_name || d.position) && (
              <p className="type-caption text-orange-600 text-xs">
                {d.category_name ? d.category_name : ''}
                {d.position ? ` • #${d.position}` : ''}
              </p>
            )}
            {d.social_handle && (
              <p className="type-caption text-gray-500 text-xs">{d.social_handle}</p>
            )}
          </div>
        </div>
        {d.description && (
          <p className="type-body text-sm text-gray-600 mb-3 overflow-auto flex-1 leading-relaxed">
            {d.description}
          </p>
        )}
        {highlights.length > 0 && (
          <HighlightBox title="Destaques" items={highlights} format={format} />
        )}
        {products.length > 0 && (
          <div className={`grid ${gridCls} gap-2 mb-3 mt-2`}>
            {products.slice(0, story ? 2 : 4).map((p, i) => (
              <div key={i} className="bg-orange-50/40 rounded-lg p-2">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-16 object-cover rounded-md mb-1"
                  />
                )}
                <p className="text-xs font-semibold text-gray-900 truncate type-caption">
                  {p.name}
                </p>
                {p.price && <p className="text-xs text-orange-600 font-bold">{p.price}</p>}
              </div>
            ))}
          </div>
        )}
        {renderCTA('Ver Catálogo', d.catalog_link || d.website || '/', format)}
      </div>
    )
  }
  if (template === 'parceiro_anunciante') {
    const story = isVertical(format)
    const wide = isWide(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-3 border-b-2 border-orange-600 pb-3 mb-3">
          {d.logo && <img src={d.logo} alt="" className="w-12 h-12 rounded-full object-cover" />}
          <div className="flex-1">
            <h2 className="type-display text-xl text-gray-900">
              {d.partner_name || d.advertiser || 'Parceiro'}
            </h2>
            {d.campaign && <p className="type-caption text-orange-600 text-xs">{d.campaign}</p>}
          </div>
        </div>
        {(d.format || d.position || d.audience_reach || d.suggested_price) && (
          <div className={`grid ${story ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
            {d.format && (
              <div className="bg-orange-50/60 rounded-lg p-2">
                <p className="type-eyebrow text-[0.625rem] text-gray-400">Formato</p>
                <p className="type-caption text-sm font-semibold text-gray-900">{d.format}</p>
              </div>
            )}
            {d.position && (
              <div className="bg-orange-50/60 rounded-lg p-2">
                <p className="type-eyebrow text-[0.625rem] text-gray-400">Posição</p>
                <p className="type-caption text-sm font-semibold text-gray-900">{d.position}</p>
              </div>
            )}
            {d.audience_reach != null && (
              <div className="bg-orange-50/60 rounded-lg p-2">
                <p className="type-eyebrow text-[0.625rem] text-gray-400">Alcance</p>
                <p className="type-caption text-sm font-semibold text-gray-900">
                  {d.audience_reach.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            {d.suggested_price != null && (
              <div className="bg-orange-50/60 rounded-lg p-2">
                <p className="type-eyebrow text-[0.625rem] text-gray-400">Preço</p>
                <p className="type-caption text-sm font-semibold text-orange-600">
                  R$ {d.suggested_price.toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        )}
        {d.status && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 type-eyebrow">
              {d.status}
            </span>
          </div>
        )}
        {d.description && (
          <p className="type-body text-sm text-gray-600 mb-3 overflow-auto flex-1 leading-relaxed">
            {d.description}
          </p>
        )}
        {d.testimonial && (
          <div className="bg-orange-50/60 border-l-4 border-orange-400 p-3 rounded-r-lg mb-3">
            <Quote className="w-4 h-4 text-orange-400 mb-1" />
            <p className="type-subheadline text-sm italic text-gray-700">"{d.testimonial}"</p>
            {d.testimonial_author && (
              <p className="type-credits text-xs text-orange-700 mt-1">— {d.testimonial_author}</p>
            )}
          </div>
        )}
        {d.contact_info && (
          <p className="type-caption text-gray-500 text-xs mb-3">{d.contact_info}</p>
        )}
        {renderCTA(d.cta_label || 'Ver Catálogo', d.catalog_link || d.link || '/', format)}
      </div>
    )
  }
  return null
}
