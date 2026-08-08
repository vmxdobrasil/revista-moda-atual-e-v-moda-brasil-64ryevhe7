import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'

export type TemplateData = Record<string, any>
export type SetTemplateData = (data: TemplateData) => void

export const GROUP1 = ['lookbook', 'indice', 'trend_report']
export const GROUP2 = ['anuncio_patrocinado', 'top60_marcas', 'perfil_marca', 'parceiro_anunciante']

export function getParceiroInitialData(): TemplateData {
  return {
    partner_name: '',
    logo: '',
    description: '',
    contact_info: '',
    link: '/',
    testimonial: '',
    testimonial_author: '',
  }
}

export function getPerfilMarcaInitialData(): TemplateData {
  return {
    brand_name: '',
    logo: '',
    description: '',
    website: '',
    social_handle: '',
    products: [],
  }
}
export const GROUP3 = ['galeria_produtos', 'materia_cta', 'comparativo_ab']
export const GROUP4 = ['story_social', 'newsletter_preview', 'capa_edicao', 'fashion_editorial']
export const GROUP5 = ['coluna_holofote_evoluida', 'coluna_marketing_moda']
export const NEW_TEMPLATE_VALUES = [...GROUP1, ...GROUP2, ...GROUP3, ...GROUP4, ...GROUP5]

export function getInitialTemplateData(template: string): TemplateData {
  switch (template) {
    case 'indice':
      return { sections: [{ title: '', link: '' }] }
    case 'trend_report':
      return { trends: [{ headline: '', description: '', image: '' }] }
    case 'galeria_produtos':
      return { products: [{ name: '', image: '', description: '', link: '' }] }
    case 'comparativo_ab':
      return {
        option_a: { title: '', description: '', image: '' },
        option_b: { title: '', description: '', image: '' },
      }
    case 'coluna_marketing_moda':
      return {
        author: 'Valter Mendonca',
        author_bio:
          'CEO da Revista MODA ATUAL. Especialista em marketing, digital marketing, branding e gestao de private cards e sistemas de beneficios.',
        subtitle: '',
        insights: [],
        practical_actions: [],
        cta_label: 'Saiba Mais',
        cta_link: '/',
        edition_title: '',
        images: [],
      }
    case 'parceiro_anunciante':
      return {
        partner_name: '',
        logo: '',
        description: '',
        contact_info: '',
        link: '/',
        testimonial: '',
        testimonial_author: '',
      }
    case 'perfil_marca':
      return {
        brand_name: '',
        logo: '',
        description: '',
        website: '',
        social_handle: '',
        products: [],
      }
    case 'coluna_holofote_evoluida':
      return {
        images: [],
        highlights: [],
        interaction_cta_label: 'Interagir',
        interaction_cta_link: '/',
        edition_title: '',
        person_name: '',
        person_role: '',
      }
    case 'lookbook':
      return {
        season: '',
        looks: [],
        images: [],
        link: '/',
        edition_title: '',
      }
    case 'materia_cta':
    case 'fashion_editorial':
      return { images: [] }
    default:
      return {}
  }
}

export function setField(d: TemplateData, set: SetTemplateData, field: string, val: any) {
  set({ ...d, [field]: val })
}
export function setNested(
  d: TemplateData,
  set: SetTemplateData,
  key: string,
  field: string,
  val: any,
) {
  set({ ...d, [key]: { ...(d[key] || {}), [field]: val } })
}
export function updateItem(
  d: TemplateData,
  set: SetTemplateData,
  list: string,
  i: number,
  field: string,
  val: any,
) {
  const arr = [...(d[list] || [])]
  arr[i] = { ...arr[i], [field]: val }
  set({ ...d, [list]: arr })
}
export function addItem(d: TemplateData, set: SetTemplateData, list: string, item: any) {
  set({ ...d, [list]: [...(d[list] || []), item] })
}
export function removeItem(d: TemplateData, set: SetTemplateData, list: string, i: number) {
  const arr = [...(d[list] || [])]
  arr.splice(i, 1)
  set({ ...d, [list]: arr })
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function ImageListEditor({
  label,
  images,
  onChange,
}: {
  label: string
  images: string[]
  onChange: (imgs: string[]) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button variant="outline" size="sm" type="button" onClick={() => onChange([...images, ''])}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
      {images.map((img, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={img}
            onChange={(e) => {
              const n = [...images]
              n[i] = e.target.value
              onChange(n)
            }}
            placeholder="URL da imagem"
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => {
              const n = [...images]
              n.splice(i, 1)
              onChange(n)
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  )
}
