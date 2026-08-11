export type TemplateFormat =
  | 'a4'
  | 'instagram_post'
  | 'story'
  | 'facebook'
  | 'youtube'
  | 'whatsapp'
  | 'pinterest'
  | 'linkedin'

export function isVertical(format: TemplateFormat): boolean {
  return format === 'story' || format === 'whatsapp' || format === 'pinterest'
}

export function isSquare(format: TemplateFormat): boolean {
  return format === 'instagram_post'
}

export function isWide(format: TemplateFormat): boolean {
  return format === 'facebook' || format === 'youtube' || format === 'linkedin'
}

export function formatTitleSize(format: TemplateFormat): string {
  if (isVertical(format)) return 'text-xl md:text-2xl'
  if (isSquare(format)) return 'text-2xl md:text-3xl'
  if (isWide(format)) return 'text-2xl md:text-4xl'
  return 'text-3xl md:text-5xl'
}

export function formatPadding(format: TemplateFormat): string {
  if (isVertical(format)) return 'p-4 md:p-5'
  if (isSquare(format)) return 'p-5 md:p-6'
  if (isWide(format)) return 'p-6 md:p-8'
  return 'p-8 md:p-12'
}

export function formatBodySize(format: TemplateFormat): string {
  if (isVertical(format)) return 'text-sm'
  if (isSquare(format)) return 'text-sm md:text-base'
  if (isWide(format)) return 'text-base md:text-lg'
  return 'text-base md:text-lg'
}

export function formatDropCapSize(format: TemplateFormat): string {
  if (isVertical(format)) return 'text-3xl'
  if (isSquare(format)) return 'text-4xl'
  return 'text-5xl md:text-6xl'
}

export const FORMAT_CONFIG: Record<
  TemplateFormat,
  { label: string; aspect: string; maxW: string }
> = {
  a4: { label: 'A4 Revista', aspect: '210 / 295', maxW: '420px' },
  instagram_post: { label: 'IG Post', aspect: '1 / 1', maxW: '360px' },
  story: { label: 'Story/Reels', aspect: '9 / 16', maxW: '252px' },
  facebook: { label: 'Facebook', aspect: '1200 / 630', maxW: '480px' },
  youtube: { label: 'YouTube', aspect: '16 / 9', maxW: '480px' },
  whatsapp: { label: 'WhatsApp', aspect: '9 / 16', maxW: '252px' },
  pinterest: { label: 'Pinterest', aspect: '2 / 3', maxW: '320px' },
  linkedin: { label: 'LinkedIn', aspect: '1200 / 627', maxW: '480px' },
}

export const ALL_FORMATS = Object.keys(FORMAT_CONFIG) as TemplateFormat[]

import officialOrangeLogoUrl from '@/assets/editedimage1786408634881-d3703.png'

export function getSocialLogoAsset(_format?: TemplateFormat): string {
  return officialOrangeLogoUrl
}
