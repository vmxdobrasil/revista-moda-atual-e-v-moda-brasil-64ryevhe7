import { Quote, Briefcase } from 'lucide-react'

export function renderGroup5(template: string, d: any) {
  if (template === 'coluna_holofote_evoluida') {
    const title = d.title || 'Coluna Holofote'
    const author = d.author || ''
    const date = d.date || ''
    const body = d.body || ''
    const images: string[] = d.images || []
    const signature = d.signature || ''

    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-[#FFF9F5] to-[#FFF3E8] p-6 md:p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-bl-full pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Quote className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.3em] text-orange-700 uppercase">
              Coluna Holofote
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-orange-900 mb-2">{title}</h2>
          {(author || date) && (
            <p className="text-sm text-orange-600 font-medium mb-4">
              {author}
              {author && date ? ' • ' : ''}
              {date}
            </p>
          )}
          <div className="flex-1 overflow-auto">
            {body ? (
              body.split('\n').map((p, i) => (
                <p
                  key={i}
                  className="mb-3 text-orange-950/80 text-sm md:text-base leading-relaxed text-justify italic"
                >
                  "{p}"
                </p>
              ))
            ) : (
              <p className="text-gray-400 italic">Conteúdo em breve</p>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-md" />
                ))}
              </div>
            )}
          </div>
          {signature && (
            <div className="mt-4 pt-3 border-t border-orange-200 text-right">
              <p className="text-lg font-bold text-orange-800 font-serif">{signature}</p>
              <p className="text-xs text-orange-500/70">Editora de Moda</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (template === 'coluna_marketing_moda') {
    const title = d.title || 'Marketing de Moda'
    const author = d.author || 'CEO'
    const date = d.date || ''
    const body = d.body || ''
    const images: string[] = d.images || []
    const signature = d.signature || 'CEO — Revista Moda Atual'

    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-orange-950 p-6 md:p-10 overflow-hidden text-white">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
            Coluna Marketing de Moda
          </span>
        </div>
        <h2 className="text-2xl md:text-4xl font-serif font-bold mb-2">{title}</h2>
        <p className="text-sm text-orange-300 font-medium mb-4">
          {author}
          {author && date ? ' • ' : ''}
          {date}
        </p>
        <div className="flex-1 overflow-auto">
          {body ? (
            body.split('\n').map((p, i) => (
              <p
                key={i}
                className="mb-3 text-white/80 text-sm md:text-base leading-relaxed text-justify"
              >
                {p}
              </p>
            ))
          ) : (
            <p className="text-white/40 italic">Conteúdo em breve</p>
          )}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-24 object-cover rounded-md" />
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-orange-900/50">
          <p className="text-lg font-bold text-orange-400 font-serif">{signature}</p>
          <p className="text-xs text-white/40">Diretor Executivo</p>
        </div>
      </div>
    )
  }

  return null
}
