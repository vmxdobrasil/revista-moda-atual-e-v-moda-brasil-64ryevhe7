import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Sparkles } from 'lucide-react'
import { EditorialHeader } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical } from './format-context'

export function renderGroup4(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'story_social') {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-orange-900 safe-area overflow-hidden text-white">
        <span className="type-eyebrow text-[0.625rem] text-orange-300 mb-2">Story</span>
        {d.hook && (
          <h2 className="type-display text-2xl md:text-4xl font-bold mb-4 leading-tight">
            {d.hook}
          </h2>
        )}
        {d.image && (
          <img src={d.image} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
        )}
        {d.caption && (
          <p className="text-white/80 type-body text-base leading-relaxed flex-1">{d.caption}</p>
        )}
        <Link
          to={d.link || '/'}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-white text-purple-900 hover:scale-105 transition-transform self-start text-sm"
        >
          Ver mais <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'newsletter_preview') {
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Newsletter Preview</span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-hidden border border-gray-200">
          <p className="type-caption text-xs text-gray-400 mb-1">
            Pré-header: {d.preheader || '...'}
          </p>
          <h3 className="type-headline text-lg font-bold text-gray-900 mb-3">
            {d.subject || 'Newsletter'}
          </h3>
          {d.content &&
            d.content.split('\n').map((p: string, i: number) => (
              <p key={i} className="type-body text-sm text-gray-600 mb-2">
                {p}
              </p>
            ))}
        </div>
        <Link
          to={d.cta_link || '/'}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors self-start text-sm"
        >
          Ler mais <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'capa_edicao') {
    return (
      <div className="h-full flex flex-col overflow-hidden relative bg-gray-900">
        {d.cover_image && (
          <img
            src={d.cover_image}
            alt={d.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative z-10 flex flex-col h-full justify-end safe-area text-white">
          <span className="type-eyebrow text-[0.625rem] text-orange-400 mb-2">
            Revista Moda Atual
          </span>
          <h2 className="type-display text-3xl md:text-5xl font-bold leading-tight">
            {d.title || 'Edição'}
          </h2>
          {d.subtitle && (
            <p className="type-subheadline text-lg md:text-xl text-white/70 mt-2">{d.subtitle}</p>
          )}
          {d.link && (
            <Link
              to={d.link}
              className="mt-4 inline-flex items-center gap-2 text-orange-400 font-semibold text-sm hover:gap-3 transition-all"
            >
              Ler edição →
            </Link>
          )}
        </div>
      </div>
    )
  }

  if (template === 'fashion_editorial') {
    const images: string[] = d.images || []
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Fashion Editorial</span>
        </div>
        <EditorialHeader
          title={d.title || 'Fashion Editorial'}
          subtitle={d.intro}
          format={format}
          align={d.text_align}
        />
        {images.length > 0 && (
          <div className={`grid ${story ? 'grid-cols-1' : 'grid-cols-2'} gap-2 mb-3`}>
            {images.slice(0, story ? 2 : 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full h-28 object-cover rounded-md shadow-sm"
              />
            ))}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {d.body ? (
            d.body.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-3 type-body text-gray-700 text-sm md:text-base text-justify">
                {p}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic type-caption">Conteúdo em breve</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
