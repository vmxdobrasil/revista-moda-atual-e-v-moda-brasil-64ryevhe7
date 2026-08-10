import { useLogo } from '@/hooks/use-logo'
import { cn } from '@/lib/utils'
import officialLogoUrl from '@/assets/editedimage1786320628187-25f71.png'

export type BrandLogoVariant = 'primary' | 'header' | 'knockout' | 'white' | 'mono' | 'monochrome'

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  className?: string
  watermark?: boolean
  monoColor?: 'orange' | 'white' | 'black'
  onClick?: () => void
  alt?: string
}

export function BrandLogo({
  variant = 'primary',
  className,
  watermark = false,
  monoColor = 'orange',
  onClick,
  alt = 'REVISTA MODA ATUAL DIGITAL',
}: BrandLogoProps) {
  const { logoUrl } = useLogo()

  const isWhiteOrKnockout = variant === 'knockout' || variant === 'white'
  const isMono = variant === 'mono' || variant === 'monochrome'

  // Primary / Header variant: Uses custom site_settings logo if provided, or the official primary asset
  if (!isWhiteOrKnockout && !isMono) {
    const srcToUse = logoUrl || officialLogoUrl
    return (
      <div className={cn('inline-flex items-center shrink-0 p-0.5', className)}>
        <img
          src={srcToUse}
          alt={alt}
          className={cn(
            'h-full w-auto max-w-full object-contain select-none transition-opacity duration-200',
            watermark && 'opacity-30 hover:opacity-50',
          )}
          onClick={onClick}
          loading="eager"
          decoding="async"
        />
      </div>
    )
  }

  // Knockout / White version (Transparent background, white vector typography for dark backgrounds and photo overlays)
  if (isWhiteOrKnockout) {
    return (
      <div className={cn('inline-flex items-center shrink-0 p-0.5', className)}>
        <svg
          viewBox="0 0 300 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('h-full w-auto max-w-full select-none overflow-visible')}
          style={watermark ? { opacity: 0.35 } : undefined}
          role="img"
          aria-label={alt}
          onClick={onClick}
        >
          <text
            x="150"
            y="20"
            textAnchor="middle"
            fill="#ffffff"
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
            fill="#ffffff"
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
            fill="#ffffff"
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

  // Monochrome version
  const fillColor =
    monoColor === 'orange' ? '#ea580c' : monoColor === 'white' ? '#ffffff' : '#111827'
  return (
    <div className={cn('inline-flex items-center shrink-0 p-0.5', className)}>
      <svg
        viewBox="0 0 300 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-full w-auto max-w-full select-none overflow-visible')}
        style={watermark ? { opacity: 0.35 } : undefined}
        role="img"
        aria-label={alt}
        onClick={onClick}
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
