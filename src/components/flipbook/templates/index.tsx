import { renderGroup1 } from './group1'
import { renderGroup2 } from './group2'
import { renderGroup3 } from './group3'
import { renderGroup4 } from './group4'
import { renderGroup5 } from './group5'

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

export function NewTemplateRenderer({ template, data }: { template: string; data: any }) {
  for (const render of RENDERERS) {
    const result = render(template, data)
    if (result) return result
  }
  return null
}
