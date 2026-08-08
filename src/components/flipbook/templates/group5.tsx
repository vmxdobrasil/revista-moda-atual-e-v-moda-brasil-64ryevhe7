import { Quote, Briefcase, Lightbulb, Wrench, ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EditionSeal } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical } from './format-context'

export function renderGroup5(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'coluna_holofote_evolvida') {
    const story = isVertical(format)
    const highlights: string[] = d.highlights || []
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#FFF9F5] to-[#FFF3E8] safe-area overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-bl-full pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-orange-500" />
              <span className="type-eyebrow text-[0.625rem] text-orange-700">Holofote</span>
            </div>
            {!story && <EditionSeal text={d.edition_title || 'Revista Moda Atual'} />}
          </div>
          <h2 className="type-display text-2xl text-orange-900 mb-2 border-b-2 border-orange-300 pb-2">
            {d.title || 'Coluna Holofote'}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            {d.person_photo ? (
              <img
                src={d.person_photo}
                alt={d.person_name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-300"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center ring-2 ring-orange-300">
                <Quote className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="type-headline text-lg font-bold text-orange-900">
                {d.person_name || d.author || ''}
              </h3>
              {d.person_role && (
                <p className="type-caption text-sm text-orange-600 font-medium">{d.person_role}</p>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {d.body ? (
              d.body.split('\n').map((p: string, i: number) => (
                <p
                  key={i}
                  className="mb-2 type-subheadline text-orange-950/80 text-sm md:text-base text-justify italic"
                >
                  "{p}"
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic type-caption">Conteúdo em breve</p>
            )}
          </div>
          {highlights.length > 0 && (
            <div className="mt-2 p-3 bg-orange-50/80 border-l-4 border-orange-600 rounded-r-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-orange-600" />
                <h4 className="type-eyebrow text-orange-900 text-[0.625rem]">Destaques</h4>
              </div>
              <ul className="space-y-0.5">
                {highlights.map((h, i) => (
                  <li
                    key={i}
                    className="type-caption text-xs text-gray-700 flex items-start gap-1.5"
                  >
                    <span className="text-orange-600 mt-0.5">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Link
            to={d.interaction_cta_link || '/'}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors self-start"
          >
            {d.interaction_cta_label || 'Interagir'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="mt-2 pt-2 border-t border-orange-200 text-right">
            <p className="type-credits text-sm font-bold text-orange-800 font-serif normal-case">
              Por Fabia Mendonca
            </p>
            <p className="type-caption text-xs text-orange-500/70">
              Editora de Moda e Tendencias{d.date ? ` • ${d.date}` : ''}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (template === 'coluna_marketing_moda') {
    const story = isVertical(format)
    const insights: string[] = d.insights || []
    const actions: string[] = d.practical_actions || []
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-orange-950 safe-area overflow-hidden text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-400" />
            <span className="type-eyebrow text-[0.625rem] text-orange-400">Marketing de Moda</span>
          </div>
          {!story && <EditionSeal text={d.edition_title || 'Revista Moda Atual'} />}
        </div>
        <div className="flex items-center gap-3 mb-3">
          {d.author_photo ? (
            <img
              src={d.author_photo}
              alt={d.author}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-orange-400/50"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-400/50 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-orange-400" />
            </div>
          )}
          <div>
            <p className="type-headline text-lg font-bold text-orange-400 font-serif">
              {d.author || 'Valter Mendonca'}
            </p>
            <p className="type-caption text-xs text-white/50">CEO — Revista MODA ATUAL</p>
          </div>
        </div>
        <h2 className="type-display text-2xl font-bold mb-1">{d.title || 'Marketing de Moda'}</h2>
        {d.subtitle && (
          <p className="type-subheadline text-sm text-orange-300/80 mb-2">{d.subtitle}</p>
        )}
        {d.date && <p className="type-caption text-xs text-orange-300/60 mb-2">{d.date}</p>}
        <div className="flex-1 overflow-auto">
          {d.body ? (
            d.body.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-2 type-body text-white/80 text-sm md:text-base text-justify">
                {p}
              </p>
            ))
          ) : (
            <p className="text-white/40 italic type-caption">Conteúdo em breve</p>
          )}
        </div>
        {insights.length > 0 && (
          <div className="mt-2 p-3 bg-white/5 border-l-4 border-orange-400 rounded-r-lg">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-4 h-4 text-orange-400" />
              <h4 className="type-eyebrow text-orange-400 text-[0.625rem]">Insights</h4>
            </div>
            <ul className="space-y-0.5">
              {insights.map((item, i) => (
                <li key={i} className="type-caption text-xs text-white/70 flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {actions.length > 0 && (
          <div className="mt-2 p-3 bg-orange-500/10 border border-orange-400/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-orange-400" />
              <h4 className="type-eyebrow text-orange-400 text-[0.625rem]">Para Aplicar</h4>
            </div>
            <ul className="space-y-0.5">
              {actions.map((item, i) => (
                <li key={i} className="type-caption text-xs text-white/70 flex items-start gap-1.5">
                  <span className="text-orange-400 mt-0.5">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          to={d.cta_link || '/'}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-orange-500 hover:bg-orange-600 transition-colors self-start"
        >
          {d.cta_label || 'Saiba Mais'} <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="mt-2 pt-2 border-t border-orange-900/50">
          <p className="type-caption text-[0.625rem] text-white/50 leading-relaxed">
            {d.author_bio || ''}
          </p>
          <p className="type-caption text-[0.625rem] text-orange-400/60 mt-0.5">
            {d.author || 'Valter Mendonca'}
            {d.date ? ` • ${d.date}` : ''}
          </p>
        </div>
      </div>
    )
  }

  return null
}
