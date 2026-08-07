import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp } from 'lucide-react'

export function renderGroup1(template: string, d: any) {
  if (template === 'lookbook') {
    const title = d.title || 'Lookbook'
    const description = d.description || ''
    const images: string[] = d.images || []
    const link = d.link || ''

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-3 mb-4">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
            Lookbook
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mt-2">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-3">
          {images.length > 0 ? (
            images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Look ${i + 1}`}
                className="w-full h-full object-cover rounded-lg shadow-md"
              />
            ))
          ) : (
            <p className="text-gray-400 italic col-span-2 text-center self-center">
              Imagens em breve
            </p>
          )}
        </div>
        {link && (
          <Link
            to={link}
            className="mt-4 inline-flex items-center gap-2 text-orange-600 font-semibold text-sm hover:gap-3 transition-all"
          >
            Ver em V MODA BRASIL <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    )
  }

  if (template === 'indice') {
    const sections: Array<{ title: string; link: string }> = d.sections || []

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 to-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-4 mb-6">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
            Índice
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mt-2">Sumário</h2>
        </div>
        <div className="flex-1 overflow-auto space-y-3">
          {sections.length > 0 ? (
            sections.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-white/60 rounded-lg hover:bg-white transition-colors"
              >
                <span className="text-orange-600 font-bold text-xl w-8 text-center">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-gray-800 font-medium">
                  {s.title || `Seção ${i + 1}`}
                </span>
                {s.link && <ArrowRight className="w-4 h-4 text-orange-400" />}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center mt-8">Seções em breve</p>
          )}
        </div>
      </div>
    )
  }

  if (template === 'trend_report') {
    const title = d.title || 'Trend Report'
    const author = d.author || ''
    const date = d.date || ''
    const trends: Array<{ headline: string; description: string; image: string }> = d.trends || []

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
              Trend Report
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900">{title}</h2>
          {(author || date) && (
            <p className="text-sm text-gray-500 mt-1">
              {author}
              {author && date ? ' • ' : ''}
              {date}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-auto space-y-4">
          {trends.length > 0 ? (
            trends.map((t, i) => (
              <div key={i} className="flex gap-4 p-3 bg-orange-50/50 rounded-lg">
                {t.image && (
                  <img
                    src={t.image}
                    alt=""
                    className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                    {t.headline || `Tendência ${i + 1}`}
                  </h3>
                  {t.description && <p className="text-sm text-gray-600 mt-1">{t.description}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic text-center mt-8">Tendências em breve</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
