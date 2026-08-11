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

  // Always utilize the official restored orange rectangle logo asset
  const srcToUse = officialOrangeLogoUrl

  // Determine variant-specific default heights for layout consistency
  let variantSize = 'h-9 md:h-10'
  if (variant === 'public_header' || variant === 'header') {
    variantSize = 'h-8 md:h-10'
  } else if (variant === 'admin_sidebar') {
    variantSize = 'h-9 md:h-10'
  } else if (variant === 'footer') {
    variantSize = 'h-10 md:h-12'
  } else if (variant === 'social_portrait' || variant === 'vertical') {
    variantSize = 'h-12 md:h-14'
  }

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[8px] select-none transition-all duration-200 aspect-[2.35/1]',
        variantSize,
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
        className="absolute max-w-none w-[162%] h-[162%] object-cover pointer-events-none select-none rounded-[8px]"
        style={{ objectPosition: 'center 45.5%' }}
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
