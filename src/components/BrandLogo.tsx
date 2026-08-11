import officialLogoUrl from '@/assets/editedimage1786389429173-467b1.png'
import { useLogo } from '@/hooks/use-logo'
import { cn } from '@/lib/utils'
import type { TemplateFormat } from '@/components/flipbook/templates/format-context'

export type BrandLogoVariant =
  | 'primary'
  | 'header'
  | 'public_header'
  | 'admin_sidebar'
  | 'footer'
  | 'login'
  | 'hero'
  | 'default'
  | 'knockout'
  | 'white'
  | 'hollow'
  | 'vazada'
  | 'alt'
  | 'vertical'
  | 'portrait'
  | 'social_portrait'
  | 'social_landscape'
  | 'social_square'
  | 'mono'
  | 'monochrome'

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  format?: TemplateFormat
  className?: string
  watermark?: boolean
  monoColor?: 'orange' | 'white' | 'black'
  onClick?: () => void
  alt?: string
}

const VARIANT_SIZES: Record<string, string> = {
  primary: 'h-14 md:h-20 lg:h-24',
  header: 'h-14 md:h-20 lg:h-24',
  public_header: 'h-14 md:h-20 lg:h-24',
  admin_sidebar: 'h-14 md:h-18 lg:h-20',
  footer: 'h-14 md:h-20',
  login: 'h-24 md:h-32 lg:h-40',
  hero: 'h-24 md:h-36 lg:h-44',
  default: 'h-14 md:h-20 lg:h-24',
  knockout: 'h-14 md:h-20 lg:h-24',
  white: 'h-14 md:h-20 lg:h-24',
  hollow: 'h-14 md:h-20 lg:h-24',
  vazada: 'h-14 md:h-20 lg:h-24',
  alt: 'h-14 md:h-20 lg:h-24',
  vertical: 'h-18 md:h-24',
  portrait: 'h-18 md:h-24',
  social_portrait: 'h-18 md:h-24',
  social_landscape: 'h-14 md:h-20',
  social_square: 'h-14 md:h-20',
  mono: 'h-14 md:h-20 lg:h-24',
  monochrome: 'h-14 md:h-20 lg:h-24',
}

export function BrandLogo({
  variant = 'primary',
  format,
  className,
  watermark = false,
  onClick,
  alt = 'Logomarca Oficial Revista Moda Atual Digital',
}: BrandLogoProps) {
  const { logoUrl } = useLogo()

  const srcToUse = logoUrl || officialLogoUrl

  const variantSize = VARIANT_SIZES[variant] || VARIANT_SIZES.primary

  const hasCustomHeight = className?.split(' ').some((c) => c.startsWith('h-'))

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-200',
        !hasCustomHeight && variantSize,
        onClick && 'cursor-pointer hover:opacity-95 hover:scale-[1.02]',
        watermark && 'opacity-40 hover:opacity-75',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      title="Revista Moda Atual Digital"
    >
      <img
        src={srcToUse}
        alt={alt}
        className="h-full w-auto max-w-full object-contain pointer-events-none select-none"
        loading="eager"
        decoding="async"
        style={{ imageRendering: 'auto' }}
      />
    </div>
  )
}
