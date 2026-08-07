import { Link } from 'react-router-dom'
import { ArrowRight, Mail, BookOpen, Sparkles } from 'lucide-react'

export function renderGroup4(template: string, d: any) {
  if (template === 'story_social') {
    const hook = d.hook || ''
    const image = d.image || ''
    const caption = d.caption || ''
    const link = d.link || '/'

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-purple-900 via-purple-800 to-orange-900 p-6 md:p-10 overflow-hidden text-white">
        <span className="text-xs font-bold tracking-[0.3em] text-orange-300 uppercase mb-2">
          Story
        </span>
        {hook && (
          <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 leading-tight">{hook}</h2>
        )}
        {image && <img src={image} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />}
        {caption && <p className="text-white/80 text-base leading-relaxed flex-1">{caption}</p>}
        <Link
          to={link}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold bg-white text-purple-900 hover:scale-105 transition-transform self-start"
        >
          Ver mais <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'newsletter_preview') {
    const subject = d.subject || 'Newsletter'
    const preheader = d.preheader || ''
    const content = d.content || ''
    const ctaLink = d.cta_link || '/'

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.2em] text-orange-600 uppercase">
              Newsletter Preview
            </span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-hidden border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Pré-header: {preheader || '...'}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-3">{subject}</h3>
          {content &&
            content.split('\n').map((p, i) => (
              <p key={i} className="text-sm text-gray-600 mb-2">
                {p}
              </p>
            ))}
        </div>
        <Link
          to={ctaLink}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors self-start"
        >
          Ler mais <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  if (template === 'capa_edicao') {
    const coverImage = d.cover_image || ''
    const title = d.title || 'Edição'
    const subtitle = d.subtitle || ''
    const link = d.link || ''

    return (
      <div className="h-full flex flex-col overflow-hidden relative bg-gray-900">
        {coverImage && (
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 flex flex-col h-full justify-end p-6 md:p-10 text-white">
          <span className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase mb-2">
            Revista Moda Atual
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/70 mt-2 font-light italic">{subtitle}</p>
          )}
          {link && (
            <Link
              to={link}
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
    const title = d.title || 'Fashion Editorial'
    const intro = d.intro || ''
    const images: string[] = d.images || []
    const body = d.body || ''

    return (
      <div className="h-full flex flex-col bg-white p-6 md:p-10 overflow-hidden">
        <div className="border-b-2 border-orange-500 pb-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.3em] text-orange-600 uppercase">
              Fashion Editorial
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-gray-900">{title}</h2>
          {intro && <p className="text-base text-gray-500 mt-2 italic">{intro}</p>}
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {images.map((img, i) => (
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
          {body ? (
            body.split('\n').map((p, i) => (
              <p
                key={i}
                className="mb-3 text-gray-700 text-sm md:text-base leading-relaxed text-justify"
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-gray-400 italic">Conteúdo em breve</p>
          )}
        </div>
      </div>
    )
  }

  return null
}
