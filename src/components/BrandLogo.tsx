import knockoutLogoUrl from '@/assets/editedimage1786393837731-f85ec.png'
import socialVerticalLogoUrl from '@/assets/editedimage1786407117674-685c3.png'
import socialSquareLogoUrl from '@/assets/editedimage1786407138361-e2583.png'
import socialLandscapeLogoUrl from '@/assets/editedimage1786407167503-234ea.png'
import { useLogo } from '@/hooks/use-logo'
import { cn } from '@/lib/utils'
import type { TemplateFormat } from '@/components/flipbook/templates/format-context'

export type BrandLogoVariant =
  | 'primary'
  | 'header'
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
  monoColor = 'orange',
  onClick,
  alt = 'Logomarca Oficial Revista Moda Atual Digital',
}: BrandLogoProps) {
  const { logoUrl } = useLogo()

  const isKnockout =
    variant === 'knockout' || variant === 'white' || variant === 'hollow' || variant === 'vazada'
  const isMono = variant === 'mono' || variant === 'monochrome'

  // Knockout white version for overlays and dark backgrounds
  if (isKnockout) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center shrink-0 select-none transition-opacity duration-200 p-0.5',
          onClick && 'cursor-pointer hover:opacity-90',
          watermark && 'opacity-40 hover:opacity-75',
          className,
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <img
          src={knockoutLogoUrl}
          alt={alt}
          className="h-full w-auto max-w-full object-contain select-none pointer-events-none filter drop-shadow-sm"
          loading="eager"
          decoding="async"
        />
      </div>
    )
  }

  // Monochrome SVG fallback
  if (isMono) {
    const fillColor =
      monoColor === 'orange' ? '#ea580c' : monoColor === 'white' ? '#ffffff' : '#111827'
    return (
      <div
        className={cn(
          'inline-flex items-center shrink-0 p-0.5 select-none',
          onClick && 'cursor-pointer hover:opacity-90',
          className,
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <svg
          viewBox="0 0 300 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto max-w-full overflow-visible"
          style={watermark ? { opacity: 0.35 } : undefined}
          role="img"
          aria-label={alt}
        >
          <text
            x="150"
            y="20"
            textAnchor="middle"
            fill={fillColor}
            fontSize="11"
            fontWeight="700"
            letterSpacing="4"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            REVISTA
          </text>
          <text
            x="150"
            y="52"
            textAnchor="middle"
            fill={fillColor}
            fontSize="28"
            fontWeight="900"
            letterSpacing="5"
            fontFamily="Didot, 'Playfair Display', 'Cinzel', Georgia, serif"
          >
            MODA ATUAL
          </text>
          <text
            x="225"
            y="68"
            textAnchor="middle"
            fill={fillColor}
            fontSize="9"
            fontWeight="800"
            letterSpacing="3"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            DIGITAL
          </text>
        </svg>
      </div>
    )
  }

  // Select context-aware logo asset based on format or explicit variant
  let srcToUse: string | null = null

  if (format) {
    if (format === 'story' || format === 'whatsapp' || format === 'pinterest') {
      srcToUse = socialVerticalLogoUrl
    } else if (format === 'instagram_post') {
      srcToUse = socialSquareLogoUrl
    } else {
      srcToUse = socialLandscapeLogoUrl
    }
  } else if (variant === 'social_portrait' || variant === 'portrait' || variant === 'vertical') {
    srcToUse = socialVerticalLogoUrl
  } else if (variant === 'social_square' || variant === 'alt') {
    srcToUse = socialSquareLogoUrl
  } else if (
    variant === 'social_landscape' ||
    variant === 'header' ||
    variant === 'primary' ||
    variant === 'default'
  ) {
    srcToUse = socialLandscapeLogoUrl
  }

  // Fall back to custom upload from site settings if present and format/variant wasn't explicit
  if (!srcToUse) {
    srcToUse = logoUrl || socialLandscapeLogoUrl
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center shrink-0 select-none transition-opacity duration-200 p-0.5',
        onClick && 'cursor-pointer hover:opacity-95',
        watermark && 'opacity-40 hover:opacity-75',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <img
        src={srcToUse}
        alt={alt}
        className="h-full w-auto max-w-full object-contain select-none pointer-events-none rounded-md"
        loading="eager"
        decoding="async"
      />
    </div>
  )
}
