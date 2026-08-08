import { useState, useEffect } from 'react'
import { getEditionPages, type EditionPage } from '@/services/magazine'
import { EditorialHeader, EditionSeal } from './shared-components'
import type { TemplateFormat } from './format-context'
import { isVertical, isSquare, isWide } from './format-context'

export function IndiceView({ data, format }: { data: any; format: TemplateFormat }) {
  const [pages, setPages] = useState<EditionPage[]>([])
  const [loading, setLoading] = useState(true)
  const editionId = data._editionId

  useEffect(() => {
    if (!editionId) {
      setLoading(false)
      return
    }
    getEditionPages(editionId)
      .then(setPages)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [editionId])

  const manualSections: Array<{ title: string; link: string }> = data.sections || []
  const story = isVertical(format)

  const sections =
    manualSections.length > 0
      ? manualSections.map((s, i) => ({ title: s.title, page_number: i + 1 }))
      : pages
          .filter((p) => p.template !== 'indice')
          .map((p) => ({
            title: p.toc_title || p.template_data?.title || `Página ${p.page_number}`,
            page_number: p.page_number,
          }))

  const maxItems = story ? 6 : isSquare(format) ? 5 : isWide(format) ? 12 : 20
  const visibleSections = sections.slice(0, maxItems)

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-orange-50 via-white to-white safe-area overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="type-eyebrow text-[0.625rem] text-orange-600 uppercase tracking-widest">
          Sumário
        </span>
        {!story && <EditionSeal text={data.edition_title || 'Revista Moda Atual'} />}
      </div>
      <EditorialHeader eyebrow="Índice" title="Sumário" format={format} />
      <div className="flex-1 overflow-auto">
        {loading ? (
          <p className="text-gray-400 italic text-center mt-8 type-caption text-xs">
            Carregando sumário...
          </p>
        ) : visibleSections.length > 0 ? (
          <div className="space-y-0.5">
            {visibleSections.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-2 border-b border-dotted border-gray-200 hover:border-orange-300 transition-colors"
              >
                <span className="text-orange-600 font-bold font-serif text-sm w-7 text-right flex-shrink-0">
                  {String(s.page_number).padStart(2, '0')}
                </span>
                <span className="flex-1 type-body text-sm text-gray-800 font-medium truncate">
                  {s.title}
                </span>
                <span className="text-gray-400 text-[0.625rem] type-caption flex-shrink-0">
                  {story ? '' : `pág. ${s.page_number}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic text-center mt-8 type-caption text-xs">
            Seções em breve
          </p>
        )}
      </div>
      {sections.length > maxItems && (
        <p className="text-[0.625rem] text-gray-400 mt-1 text-center type-caption">
          +{sections.length - maxItems} seções
        </p>
      )}
    </div>
  )
}
