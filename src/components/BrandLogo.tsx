import officialOrangeLogoUrl from '@/assets/editedimage1786408634881-d3703.png'
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

export function BrandLogo({
  variant = 'primary',
  format,
  className,
  watermark = false,
  onClick,
  alt = 'Logomarca Oficial Revista Moda Atual Digital',
}: BrandLogoProps) {
  const { logoUrl } = useLogo()

  // Always utilize the official restored logo asset or custom settings
  const srcToUse = logoUrl || officialOrangeLogoUrl

  // Optical sizing definitions ensuring "MODA ATUAL DIGITAL" text is crisp & prominent
  let variantSize = 'h-12 md:h-16'
  if (variant === 'public_header' || variant === 'header') {
    variantSize = 'h-12 md:h-16 lg:h-20'
  } else if (variant === 'admin_sidebar') {
    variantSize = 'h-12 md:h-14 lg:h-16'
  } else if (variant === 'footer') {
    variantSize = 'h-12 md:h-16'
  } else if (variant === 'login') {
    variantSize = 'h-20 md:h-24 lg:h-28'
  } else if (variant === 'hero') {
    variantSize = 'h-20 md:h-28 lg:h-32'
  } else if (variant === 'social_portrait' || variant === 'vertical' || variant === 'portrait') {
    variantSize = 'h-14 md:h-18'
  } else if (variant === 'social_landscape' || variant === 'social_square') {
    variantSize = 'h-12 md:h-16'
  }

  // Allow custom height class in className to take precedence if explicitly provided
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
        className="h-full w-auto max-w-full object-contain pointer-events-none select-none drop-shadow-sm rounded-[6px]"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
