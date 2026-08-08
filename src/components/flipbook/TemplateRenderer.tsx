import { Link } from 'react-router-dom'
import { EditionPage } from '@/services/magazine'
import { Quote, ArrowRight, User, Mic } from 'lucide-react'
import { NewTemplateRenderer, NEW_TEMPLATE_VALUES } from './templates'
import type { TemplateFormat } from './templates/format-context'

export function TemplateRenderer({
  page,
  format = 'a4',
}: {
  page: EditionPage
  format?: TemplateFormat
}) {
  const t = page.template
  const d = page.template_data || {}

  if (t === 'editorial') {
    const title = d.title || 'Conteúdo em breve'
    const subtitle = d.subtitle || ''
    const content = d.content || ''
    const author = d.author || ''

    return (
      <div className="h-full flex flex-col bg-white/90 backdrop-blur-md p-8 md:p-12 shadow-2xl overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-6 mb-6">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
            Editorial
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-gray-900 mt-3 leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-500 mt-3 font-light italic">{subtitle}</p>
          )}
        </div>
        <div className="flex-1 overflow-hidden text-gray-800">
          {content ? (
            content.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed text-justify text-base md:text-lg">
                {i === 0 && (
                  <span className="float-left text-5xl md:text-6xl font-serif font-bold text-orange-600 leading-none mr-2 mt-1">
                    {p.charAt(0)}
                  </span>
                )}
                {i === 0 ? p.slice(1) : p}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic">Conteúdo em breve</p>
          )}
        </div>
        {author && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{author}</p>
              <p className="text-xs text-gray-500">Editorialista</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (t === 'marketing') {
    const title = d.title || 'Conteúdo em breve'
    const content = d.content || ''

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 via-white to-orange-50/50 p-8 md:p-12 shadow-2xl overflow-hidden">
        <div className="flex-1 flex flex-col">
          <span className="inline-block self-start text-xs font-bold tracking-[0.2em] text-white bg-orange-500 px-3 py-1 rounded-full uppercase mb-6">
            Marketing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h2>
          {content && (
            <div className="text-gray-700 flex-1 overflow-hidden text-base md:text-lg leading-relaxed">
              {content.split('\n').map((p: string, i: number) => (
                <p key={i} className="mb-4">
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <span>Confira em V MODA BRASIL</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm font-medium text-gray-500 italic font-serif">
            Diretor de Marketing da Revista Moda Atual
          </p>
        </div>
      </div>
    )
  }

  if (t === 'holofote') {
    const personName = d.person_name || d.title || 'Coluna Social'
    const personTitle = d.person_title || ''
    const content = d.content || d.bio || ''
    const photoCredit = d.photo_credit || ''

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#FFF9F5] to-[#FFF3E8] p-8 md:p-12 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-200/30 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-100/20 rounded-tr-full pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-700 uppercase mb-2">
            Holofote
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-orange-900 mb-6 border-b-2 border-orange-300 pb-4">
            Coluna Social Holofote
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg mb-4">
              <Quote className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-orange-900 mb-1">{personName}</h3>
            {personTitle && (
              <p className="text-sm md:text-base text-orange-600 font-medium mb-4">{personTitle}</p>
            )}
            {content ? (
              <div className="text-orange-950/80 text-base md:text-lg leading-loose max-w-prose">
                {content.split('\n').map((p: string, i: number) => (
                  <p key={i} className="mb-3 italic">
                    "{p}"
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">Conteúdo em breve</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-orange-200 text-right">
            {photoCredit && <p className="text-xs text-orange-500/70 mb-1">Foto: {photoCredit}</p>}
            <p className="text-lg font-bold text-orange-800 font-serif">
              Editora de Moda Fabia Mendonça
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (t === 'entrevista') {
    const interviewee = d.interviewee || 'Entrevistado'
    const interviewer = d.interviewer_name || ''
    const intro = d.intro || ''
    const qaList: Array<{ q: string; a: string }> = d.qa || []

    return (
      <div className="h-full flex flex-col bg-white/95 p-8 md:p-12 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-b from-orange-500 to-orange-700 rounded-l-sm" />

        <div className="pl-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
              Entrevista Exclusiva
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 uppercase tracking-tighter leading-none">
            <span className="text-orange-600">{interviewee}</span>
          </h2>

          {interviewer && (
            <p className="text-sm text-gray-500 mb-4">
              Por <span className="font-semibold text-gray-700">{interviewer}</span>
            </p>
          )}

          {intro && (
            <p className="text-base md:text-lg text-gray-600 mb-6 italic border-l-4 border-orange-300 pl-4 leading-relaxed">
              {intro}
            </p>
          )}

          <div className="flex-1 overflow-hidden space-y-4">
            {qaList.length > 0 ? (
              qaList.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="font-bold text-gray-900 text-sm md:text-base uppercase tracking-wide leading-snug">
                      {item.q}
                    </p>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed pl-10 border-l-2 border-gray-100">
                    {item.a}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">Conteúdo em breve</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (t === 'default') {
    const title = d.title || ''
    const content = d.content || ''

    return (
      <div className="h-full flex flex-col bg-white/85 backdrop-blur-sm p-8 md:p-12 overflow-hidden">
        {title && (
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
            {title}
          </h2>
        )}
        {content ? (
          <div className="text-gray-800 flex-1 overflow-hidden text-base md:text-lg">
            {content.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed text-justify">
                {p}
              </p>
            ))}
          </div>
        ) : (
          !title && <p className="text-gray-400 italic">Conteúdo em breve</p>
        )}
      </div>
    )
  }

  if ((NEW_TEMPLATE_VALUES as readonly string[]).includes(t as string)) {
    return (
      <NewTemplateRenderer
        template={t as string}
        data={d}
        format={format}
        editionId={page.edition}
      />
    )
  }

  return null
}
