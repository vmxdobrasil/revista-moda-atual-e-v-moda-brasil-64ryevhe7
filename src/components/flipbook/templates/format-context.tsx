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
