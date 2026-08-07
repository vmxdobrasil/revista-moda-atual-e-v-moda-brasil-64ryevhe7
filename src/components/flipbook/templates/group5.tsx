import { Quote, Briefcase, Lightbulb, Wrench, ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EditionSeal } from './shared-components'

export function renderGroup5(template: string, d: any) {
  if (template === 'coluna_holofote_evolvida') {
    const title = d.title || 'Coluna Holofote'
    const personName = d.person_name || d.author || ''
    const personRole = d.person_role || d.person_title || ''
    const personPhoto = d.person_photo || ''
    const date = d.date || ''
    const body = d.body || d.content || ''
    const highlights: string[] = d.highlights || []
    const ctaLabel = d.interaction_cta_label || 'Interagir'
    const ctaLink = d.interaction_cta_link || '/'
    const editionTitle = d.edition_title || ''

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#FFF9F5] to-[#FFF3E8] p-6 md:p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-bl-full pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-bold tracking-[0.3em] text-orange-700 uppercase">
                Holofote
              </span>
            </div>
            <EditionSeal text={editionTitle || 'Revista Moda Atual'} />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-orange-900 mb-3 border-b-2 border-orange-300 pb-2">
            {title}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            {personPhoto ? (
              <img
                src={personPhoto}
                alt={personName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-300"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center ring-2 ring-orange-300">
                <Quote className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-orange-900">{personName}</h3>
              {personRole && <p className="text-sm text-orange-600 font-medium">{personRole}</p>}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {body ? (
              body.split('\n').map((p, i) => (
                <p
                  key={i}
                  className="mb-2 text-orange-950/80 text-sm md:text-base leading-relaxed text-justify italic"
                >
                  "{p}"
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic">Conteudo em breve</p>
            )}
          </div>
          {highlights.length > 0 && (
            <div className="mt-2 p-3 bg-orange-50/80 border-l-4 border-orange-500 rounded-r-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-orange-600" />
                <h4 className="font-bold text-orange-900 text-xs uppercase tracking-wide">
                  Destaques
                </h4>
              </div>
              <ul className="space-y-0.5">
                {highlights.map((h, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            to={ctaLink}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors self-start"
          >
            {ctaLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="mt-2 pt-2 border-t border-orange-200 text-right">
            <p className="text-sm font-bold text-orange-800 font-serif">Por Fabia Mendonca</p>
            <p className="text-xs text-orange-500/70">
              Editora de Moda e Tendencias{date ? ` • ${date}` : ''}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (template === 'coluna_marketing_moda') {
    const title = d.title || 'Marketing de Moda'
    const subtitle = d.subtitle || ''
    const author = d.author || 'Valter Mendonca'
    const authorPhoto = d.author_photo || ''
    const authorBio =
      d.author_bio ||
      'CEO da Revista MODA ATUAL. Especialista em marketing, digital marketing, branding e gestao de private cards e sistemas de beneficios.'
    const date = d.date || ''
    const body = d.body || ''
    const insights: string[] = d.insights || []
    const practicalActions: string[] = d.practical_actions || []
    const ctaLabel = d.cta_label || 'Saiba Mais'
    const ctaLink = d.cta_link || '/'
    const editionTitle = d.edition_title || ''

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-orange-950 p-6 md:p-10 overflow-hidden text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
              Marketing de Moda
            </span>
          </div>
          <EditionSeal text={editionTitle || 'Revista Moda Atual'} />
        </div>
        <div className="flex items-center gap-3 mb-3">
          {authorPhoto ? (
            <img
              src={authorPhoto}
              alt={author}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-400/50"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-400/50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-400" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-orange-400 font-serif">{author}</p>
            <p className="text-xs text-white/50">CEO — Revista MODA ATUAL</p>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-orange-300/80 mb-2 italic">{subtitle}</p>}
        {date && <p className="text-xs text-orange-300/60 mb-2">{date}</p>}
        <div className="flex-1 overflow-auto">
          {body ? (
            body.split('\n').map((p, i) => (
              <p
                key={i}
                className="mb-2 text-white/80 text-sm md:text-base leading-relaxed text-justify"
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-white/40 italic">Conteudo em breve</p>
          )}
        </div>
        {insights.length > 0 && (
          <div className="mt-2 p-3 bg-white/5 border-l-4 border-orange-400 rounded-r-lg">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-orange-400" />
              <h4 className="font-bold text-orange-400 text-xs uppercase tracking-wide">
                Insights
              </h4>
            </div>
            <ul className="space-y-0.5">
              {insights.map((item, i) => (
                <li key={i} className="text-xs text-white/70 flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {practicalActions.length > 0 && (
          <div className="mt-2 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-orange-400" />
              <h4 className="font-bold text-orange-400 text-xs uppercase tracking-wide">
                Para Aplicar
              </h4>
            </div>
            <ul className="space-y-0.5">
              {practicalActions.map((item, i) => (
                <li key={i} className="text-xs text-white/70 flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          to={ctaLink}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition-colors self-start"
        >
          {ctaLabel} <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="mt-2 pt-2 border-t border-orange-900/50">
          <p className="text-[10px] text-white/50 leading-relaxed">{authorBio}</p>
          <p className="text-[10px] text-orange-400/60 mt-0.5">
            {author}
            {date ? ` • ${date}` : ''}
          </p>
        </div>
      </div>
    )
  }

  return null
}
