export type TemplateFormat =
  | 'a4'
  | 'ig-post'
  | 'ig-story'
  | 'fb-post'
  | 'yt-thumb'
  | 'wa-status'
  | 'pin'
  | 'li-post'

export function isVertical(format: TemplateFormat): boolean {
  return format === 'ig-story' || format === 'wa-status' || format === 'pin'
}

export function isSquare(format: TemplateFormat): boolean {
  return format === 'ig-post'
}

export function isWide(format: TemplateFormat): boolean {
  return format === 'fb-post' || format === 'yt-thumb' || format === 'li-post'
}

export function formatTitleSize(format: TemplateFormat): string {
  if (isVertical(format) || isSquare(format)) return 'text-xl md:text-2xl'
  return 'text-2xl md:text-3xl'
}

export const ALL_FORMATS: TemplateFormat[] = [
  'a4',
  'ig-post',
  'ig-story',
  'fb-post',
  'yt-thumb',
  'wa-status',
  'pin',
  'li-post',
]

export const FORMAT_CONFIG: Record<
  TemplateFormat,
  { label: string; aspect: string; maxW: string }
> = {
  a4: { label: 'A4', aspect: '21 / 29.5', maxW: '595px' },
  'ig-post': { label: 'IG Post', aspect: '1 / 1', maxW: '400px' },
  'ig-story': { label: 'Story/Reels', aspect: '9 / 16', maxW: '280px' },
  'fb-post': { label: 'Facebook', aspect: '1.91 / 1', maxW: '500px' },
  'yt-thumb': { label: 'YouTube', aspect: '16 / 9', maxW: '500px' },
  'wa-status': { label: 'WhatsApp', aspect: '9 / 16', maxW: '280px' },
  pin: { label: 'Pinterest', aspect: '2 / 3', maxW: '350px' },
  'li-post': { label: 'LinkedIn', aspect: '1.91 / 1', maxW: '500px' },
}
