import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Instagram, Newspaper, Camera } from 'lucide-react'
import { HighlightBox } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide, formatTitleSize } from './format-context'
import { getEdition, getFileUrl } from '@/services/magazine'

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

function Eyebrow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-orange-500" />
      <span className="type-eyebrow text-[0.625rem] text-orange-600">{text}</span>
    </div>
  )
}

function CapaEdicaoView({ data, format }: { data: any; format: TemplateFormat }) {
  const [coverUrl, setCoverUrl] = useState(data.cover_image || '')
  const [coverAlt, setCoverAlt] = useState(data.cover_alt_text || '')
  const [editionTitle, setEditionTitle] = useState(data.title || '')
  const editionId = data._editionId
  const highlights: string[] = data.highlights || []
  const story = isVertical(format)

  useEffect(() => {
    if (data.cover_image) return
    if (!editionId) return
    getEdition(editionId)
      .then((ed: any) => {
        const url = ed.cover_url || (ed.cover_file ? getFileUrl(ed, ed.cover_file) : '')
        if (url) setCoverUrl(url)
        if (ed.cover_alt_text) setCoverAlt(ed.cover_alt_text)
        if (!data.title && ed.title) setEditionTitle(ed.title)
      })
      .catch(() => {})
  }, [editionId, data.cover_image, data.title])

  return (
    <div className="h-full flex flex-col bg-gray-900 safe-area overflow-hidden relative">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={coverAlt || editionTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
      )}
      <div
        className={`absolute inset-0 ${story ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/20' : 'bg-gradient-to-t from-black/85 via-black/30 to-transparent'}`}
      />
      <div className="relative z-10 flex flex-col h-full justify-end">
        <div className="flex items-center gap-2 mb-2">
          <Newspaper className="w-4 h-4 text-orange-400" />
          <span className="type-eyebrow text-[0.625rem] text-orange-400">Capa da Edição</span>
        </div>
        {editionTitle && (
          <h2
            className={`type-display ${formatTitleSize(format)} font-serif font-bold text-white mb-1`}
          >
            {editionTitle}
          </h2>
        )}
        {data.subtitle && (
          <p className="type-subheadline text-sm text-white/70 mb-2">{data.subtitle}</p>
        )}
        {highlights.length > 0 && !story && (
          <div className="mb-2">
            {highlights.slice(0, 3).map((h, i) => (
              <p key={i} className="type-caption text-xs text-white/60 flex items-start gap-1.5">
                <span className="text-orange-400 mt-0.5">•</span>
                <span>{h}</span>
              </p>
            ))}
          </div>
        )}
        {renderCTA(data.cta_label || 'Ler Agora', data.link || '/', format)}
      </div>
    </div>
  )
}

export function renderGroup4(template: string, d: any, format: TemplateFormat = 'a4') {
  if (template === 'story_social') {
    const story = isVertical(format)
    const square = isSquare(format)
    const options: any[] = d.options || []
    return (
      <div
        className={`h-full flex flex-col safe-area overflow-hidden relative ${story ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white' : 'bg-white'}`}
      >
        {story && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
        )}
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className={`w-4 h-4 ${story ? 'text-white/90' : 'text-orange-500'}`} />
            <span
              className={`type-eyebrow text-[0.625rem] ${story ? 'text-white/90' : 'text-orange-600'}`}
            >
              Story Social
            </span>
          </div>
          {d.hook && (
            <h2
              className={`type-display ${formatTitleSize(format)} ${story ? 'text-white' : 'text-gray-900'} mb-2 font-bold`}
            >
              {d.hook}
            </h2>
          )}
          {d.subject && (
            <p
              className={`type-subheadline text-sm ${story ? 'text-white/80' : 'text-gray-500'} mb-3`}
            >
              {d.subject}
            </p>
          )}
          {d.image && (
            <img
              src={d.image}
              alt={d.hook || ''}
              className={`w-full ${story ? 'h-40' : square ? 'h-36' : 'h-32'} object-cover rounded-lg mb-3`}
            />
          )}
          {d.caption && (
            <p
              className={`type-body text-sm ${story ? 'text-white/90' : 'text-gray-700'} flex-1 overflow-auto leading-relaxed`}
            >
              {d.caption}
            </p>
          )}
          {options.length > 0 && (
            <div className="mt-2 space-y-1">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-1.5 text-xs type-caption ${story ? 'bg-white/10 text-white/90' : 'bg-orange-50 text-gray-700'}`}
                >
                  {typeof opt === 'string' ? opt : opt.text || opt.label || ''}
                </div>
              ))}
            </div>
          )}
          {d.cta_variant && (
            <span
              className={`mt-2 px-2 py-0.5 rounded-full text-[0.625rem] font-bold type-eyebrow ${story ? 'bg-white/20 text-white' : 'bg-orange-200 text-orange-800'}`}
            >
              Variante {d.cta_variant}
            </span>
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
        {d.cta_variant && (
          <div className="px-3">
            <span className="px-2 py-0.5 rounded-full bg-orange-200 text-orange-800 text-[0.625rem] font-bold type-eyebrow">
              Variante {d.cta_variant}
            </span>
          </div>
        )}
        {renderCTA(d.cta_label || 'Ler Edição Completa', d.cta_link || '/', format)}
      </div>
    )
  }

  if (template === 'capa_edicao') {
    return <CapaEdicaoView data={d} format={format} />
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
        <Eyebrow icon={Camera} text="Fashion Editorial" />
        {d.toc_title && (
          <p className="type-caption text-xs text-orange-600 mb-1 italic">{d.toc_title}</p>
        )}
        {d.title && (
          <h2 className={`type-display ${formatTitleSize(format)} text-gray-900 mb-1`}>
            {d.title}
          </h2>
        )}
        {d.intro && <p className="type-subheadline text-sm text-gray-500 mb-3 italic">{d.intro}</p>}
        {images.filter(Boolean).length > 0 && (
          <div className={`grid ${gridCls} gap-2 mb-3`}>
            {images
              .filter(Boolean)
              .slice(0, story ? 1 : isSquare(format) ? 4 : wide ? 3 : 2)
              .map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`w-full ${story ? 'h-48' : 'h-28'} object-cover rounded-lg`}
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
        {d.credits && <p className="type-credits text-xs text-gray-400 mt-2">Por {d.credits}</p>}
      </div>
    )
  }

  return null
}
