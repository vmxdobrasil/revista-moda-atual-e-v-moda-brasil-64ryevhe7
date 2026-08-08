import { renderGroup1 } from './group1'
import { renderGroup2 } from './group2'
import { renderGroup3 } from './group3'
import { renderGroup4 } from './group4'
import { renderGroup5 } from './group5'
import { TemplateFooter } from './shared-components'
import type { TemplateFormat } from './format-context'

export const NEW_TEMPLATE_VALUES = [
  'lookbook',
  'indice',
  'trend_report',
  'anuncio_patrocinado',
  'top60_marcas',
  'perfil_marca',
  'parceiro_anunciante',
  'galeria_produtos',
  'materia_cta',
  'comparativo_ab',
  'story_social',
  'newsletter_preview',
  'capa_edicao',
  'fashion_editorial',
  'coluna_holofote_evoluida',
  'coluna_marketing_moda',
] as const

const RENDERERS = [renderGroup1, renderGroup2, renderGroup3, renderGroup4, renderGroup5]

export function NewTemplateRenderer({
  template,
  data,
  format = 'a4',
  editionId,
}: {
  template: string
  data: any
  format?: TemplateFormat
  editionId?: string
}) {
  const d = editionId ? { ...data, _editionId: editionId } : data
  for (const render of RENDERERS) {
    const result = render(template, d, format)
    if (result) {
      if (data.edition_title || data.publication_date) {
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">{result}</div>
            <TemplateFooter
              editionTitle={data.edition_title}
              publicationDate={data.publication_date}
            />
          </div>
        )
      }
      return result
    }
  }
  return null
}
