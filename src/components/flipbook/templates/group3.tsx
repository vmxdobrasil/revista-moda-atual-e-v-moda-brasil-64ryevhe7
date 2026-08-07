import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, FileText } from 'lucide-react'

export function renderGroup3(template: string, d: any) {
  if (template === 'galeria_produtos') {
    const products: Array<{ name: string; image: string; description: string; link: string }> =
      d.products || []

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
              Galeria de Produtos
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-auto grid grid-cols-2 gap-3">
          {products.length > 0 ? (
            products.map((p, i) => (
              <div key={i} className="bg-orange-50/40 rounded-lg p-3 flex flex-col">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-gray-900 text-sm">
                  {p.name || `Produto ${i + 1}`}
                </h3>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-1 flex-1">{p.description}</p>
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
            <p className="text-gray-400 italic col-span-2 text-center self-center">
              Produtos em breve
            </p>
          )}
        </div>
      </div>
    )
  }

  if (template === 'materia_cta') {
    const title = d.title || 'Matéria'
    const body = d.body || ''
    const images: string[] = d.images || []
    const ctaLabel = d.cta_label || 'Confira'
    const ctaLink = d.cta_link || '/'

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
              Matéria
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{title}</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {body &&
            body.split('\n').map((p, i) => (
              <p
                key={i}
                className="mb-3 text-gray-700 text-sm md:text-base leading-relaxed text-justify"
              >
                {p}
              </p>
            ))}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-md" />
              ))}
            </div>
          )}
        </div>
        <Link
          to={ctaLink}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:scale-105 transition-transform self-start"
        >
          {ctaLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'comparativo_ab') {
    const optA = d.option_a || {}
    const optB = d.option_b || {}

    const renderOption = (opt: any, label: string) => (
      <div className="flex-1 bg-orange-50/40 rounded-lg p-4 flex flex-col">
        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">
          {label}
        </span>
        {opt.image && (
          <img src={opt.image} alt="" className="w-full h-28 object-cover rounded-md mb-3" />
        )}
        <h3 className="font-bold text-gray-900 text-sm md:text-base">{opt.title || `${label}`}</h3>
        {opt.description && <p className="text-sm text-gray-600 mt-1 flex-1">{opt.description}</p>}
        {opt.link && (
          <Link to={opt.link} className="text-xs text-orange-600 font-medium mt-2 hover:underline">
            Ver mais →
          </Link>
        )}
      </div>
    )

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-3 mb-4">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
            Comparativo A/B
          </span>
          <h2 className="text-xl md:text-2xl font-serif text-gray-900 mt-1">Qual você prefere?</h2>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {renderOption(optA, 'Opção A')}
          {renderOption(optB, 'Opção B')}
        </div>
      </div>
    )
  }

  return null
}
