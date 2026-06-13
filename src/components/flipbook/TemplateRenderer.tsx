import { EditionPage } from '@/services/magazine'

export function TemplateRenderer({ page }: { page: EditionPage }) {
  const t = page.template
  const d = page.template_data || {}

  if (t === 'editorial') {
    return (
      <div className="h-full flex flex-col bg-white/85 backdrop-blur-sm p-10 shadow-2xl rounded-sm border border-white/50">
        {d.title && (
          <h2 className="text-4xl font-serif text-gray-900 mb-6 uppercase tracking-widest border-b border-gray-300 pb-4">
            {d.title}
          </h2>
        )}
        {d.content && (
          <div className="text-gray-800 flex-1 overflow-hidden text-lg">
            {d.content.split('\n').map((p: string, i: number) => (
              <p key={i} className="mb-5 leading-relaxed text-justify">
                {p}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (t === 'marketing') {
    return (
      <div className="h-full flex flex-col bg-white/95 p-12 border-t-[12px] border-orange-500 shadow-2xl rounded-sm">
        <div className="flex-1 overflow-hidden flex flex-col">
          {d.title && (
            <h2 className="text-4xl font-bold text-gray-900 mb-8 tracking-tight">{d.title}</h2>
          )}
          {d.content && (
            <div className="text-gray-700 flex-1 overflow-hidden text-lg">
              {d.content.split('\n').map((p: string, i: number) => (
                <p key={i} className="mb-5 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xl font-medium text-gray-900 italic font-serif">
            Diretor de Marketing da Revista Moda Atual
          </p>
        </div>
      </div>
    )
  }

  if (t === 'holofote') {
    return (
      <div className="h-full flex flex-col bg-[#FFF9F5]/95 p-10 border-x-[6px] border-orange-300 shadow-xl relative rounded-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100/50 rounded-bl-full -z-10" />
        <h2 className="text-4xl font-serif text-orange-900 mb-8 border-b-2 border-orange-200 pb-4 tracking-wide uppercase">
          Coluna Social Holofote
        </h2>
        <div className="flex-1 overflow-hidden">
          {d.content && (
            <div className="text-orange-950/90 text-lg leading-loose font-medium">
              {d.content.split('\n').map((p: string, i: number) => (
                <p key={i} className="mb-5">
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 pt-4 border-t border-orange-200 text-right">
          <p className="text-2xl font-bold text-orange-800 font-serif">
            Editora de Moda Fabia Mendonça
          </p>
        </div>
      </div>
    )
  }

  if (t === 'entrevista') {
    return (
      <div className="h-full flex flex-col bg-white/95 p-10 shadow-2xl relative rounded-sm">
        <div className="absolute top-0 left-0 w-3 h-full bg-gray-900 rounded-l-sm" />
        <div className="pl-4 flex flex-col h-full">
          {d.interviewee && (
            <h2 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter leading-none">
              Entrevista: <br />
              <span className="text-orange-600">{d.interviewee}</span>
            </h2>
          )}
          {d.intro && (
            <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-gray-300 pl-5 leading-relaxed">
              {d.intro}
            </p>
          )}

          <div className="flex-1 overflow-hidden flex flex-col gap-6 pt-4">
            {(d.qa || []).map((item: any, i: number) => (
              <div key={i} className="space-y-3">
                <p className="font-bold text-gray-900 text-lg uppercase tracking-wide leading-snug">
                  <span className="text-orange-500 mr-2 font-black">Q.</span> {item.q}
                </p>
                <p className="text-gray-700 text-lg leading-relaxed pl-7 border-l-2 border-gray-100">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
