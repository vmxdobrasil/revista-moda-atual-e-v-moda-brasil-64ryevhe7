import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Instagram, Newspaper, Camera, Sparkles } from 'lucide-react'
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

export function renderGroup4(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'story_social') {
    const story = isVertical(format)
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 safe-area overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="w-4 h-4 text-white/90" />
            <span className="type-eyebrow text-[0.625rem] text-white/90">Story Social</span>
          </div>
          {d.hook && (
            <h2 className={`type-display ${formatTitleSize(format)} text-white mb-3 font-bold`}>
              {d.hook}
            </h2>
          )}
          {d.subject && <p className="type-subheadline text-sm text-white/80 mb-2">{d.subject}</p>}
          {d.image && (
            <img
              src={d.image}
              alt={d.hook || ''}
              className={`w-full ${story ? 'h-40' : 'h-32'} object-cover rounded-lg mb-3`}
            />
          )}
          {d.caption && (
            <p className="type-body text-sm text-white/90 flex-1 overflow-auto leading-relaxed">
              {d.caption}
            </p>
          )}
          {d.options && Array.isArray(d.options) && d.options.length > 0 && (
            <div className="mt-2 space-y-1">
              {d.options.map((opt: any, i: number) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white/90 type-caption"
                >
                  {typeof opt === 'string' ? opt : opt.text || opt.label || ''}
                </div>
              ))}
            </div>
          )}
          {renderCTA(d.cta_label || 'Saiba Mais', d.link || d.cta_link || '/', format)}
        </div>
      </div>
    )
  }
  if (template === 'newsletter_preview') {
    const story = isVertical(format)
    const sections: any[] = d.sections || []
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4" />
            <span className="type-eyebrow text-[0.625rem]">Newsletter</span>
          </div>
          {d.title && <h2 className="type-headline text-sm font-bold">{d.title}</h2>}
          {d.subject && <p className="text-xs text-white/80 mt-1">{d.subject}</p>}
        </div>
        <div className="flex-1 overflow-auto p-3">
          {d.preheader && (
            <p className="type-caption text-xs text-gray-400 mb-3 italic">{d.preheader}</p>
          )}
          {d.content && (
            <p className="type-body text-sm text-gray-700 mb-3 leading-relaxed">{d.content}</p>
          )}
          {sections.length > 0 && (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={i} className="border-l-2 border-orange-300 pl-3">
                  <h3 className="type-headline text-sm font-semibold text-gray-900">
                    {s.title || ''}
                  </h3>
                  {s.summary && (
                    <p className="type-caption text-xs text-gray-600 mt-0.5">{s.summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {renderCTA(d.cta_label || 'Ler Edição Completa', d.cta_link || '/', format)}
      </div>
    )
  }
  if (template === 'capa_edicao') {
    return (
      <div className="h-full flex flex-col bg-gray-900 overflow-hidden relative">
        {d.cover_image && (
          <img
            src={d.cover_image}
            alt={d.title || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col h-full justify-end safe-area">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-4 h-4 text-orange-400" />
            <span className="type-eyebrow text-[0.625rem] text-orange-400">Capa da Edição</span>
          </div>
          {d.title && (
            <h2 className="type-display text-2xl md:text-4xl font-serif font-bold text-white mb-1">
              {d.title}
            </h2>
          )}
          {d.subtitle && <p className="type-subheadline text-sm text-white/70">{d.subtitle}</p>}
          {renderCTA(d.cta_label || 'Ler Agora', d.link || '/', 'a4')}
        </div>
      </div>
    )
  }
  if (template === 'fashion_editorial') {
    const story = isVertical(format)
    const wide = isWide(format)
    const images: string[] = d.images || []
    const gridCls = story
      ? 'grid-cols-1'
      : isSquare(format)
        ? 'grid-cols-2'
        : wide
          ? 'grid-cols-3'
          : 'grid-cols-2'
    return (
      <div className="h-full flex flex-col bg-white safe-area overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-4 h-4 text-orange-500" />
          <span className="type-eyebrow text-[0.625rem] text-orange-600">Fashion Editorial</span>
        </div>
        {d.title && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-1`}>
            {d.title}
          </h2>
        )}
        {d.intro && <p className="type-subheadline text-sm text-gray-500 mb-3 italic">{d.intro}</p>}
        {images.length > 0 && (
          <div className={`grid ${gridCls} gap-2 mb-3`}>
            {images.slice(0, story ? 2 : 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className={`w-full ${story ? 'h-36' : 'h-28'} object-cover rounded-lg`}
              />
            ))}
          </div>
        )}
        <div className="flex-1 overflow-auto">
          {d.body ? (
            d.body.split('\n').map((p: string, i: number) => (
              <p
                key={i}
                className="mb-2 type-body text-sm text-gray-700 leading-relaxed text-justify"
              >
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
