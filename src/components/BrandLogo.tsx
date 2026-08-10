import { useLogo } from '@/hooks/use-logo'
import { cn } from '@/lib/utils'
import officialLogoUrl from '@/assets/editedimage1786392642267-e8fe7.png'

export type BrandLogoVariant =
  | 'primary'
  | 'header'
  | 'default'
  | 'knockout'
  | 'white'
  | 'hollow'
  | 'vazada'
  | 'mono'
  | 'monochrome'

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

  const isHollowOrVazada =
    variant === 'knockout' || variant === 'white' || variant === 'hollow' || variant === 'vazada'
  const isMono = variant === 'mono' || variant === 'monochrome'

  // Primary / Header / Default variant: Uses custom site_settings logo if provided, or the official primary asset (precision-cropped to isolate orange rectangle, removing external checkerboard background)
  if (!isHollowOrVazada && !isMono) {
    const isCustomLogo = Boolean(logoUrl)
    const srcToUse = logoUrl || officialLogoUrl

    if (isCustomLogo) {
      return (
        <div
          className={cn(
            'inline-flex items-center shrink-0 p-0.5',
            onClick && 'cursor-pointer',
            className,
          )}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
        >
          <img
            src={srcToUse}
            alt={alt}
            className={cn(
              'h-full w-auto max-w-full object-contain select-none transition-opacity duration-200',
              watermark && 'opacity-35 hover:opacity-60',
            )}
            loading="eager"
            decoding="async"
          />
        </div>
      )
    }

    // Official brand logo (src/assets/editedimage1786392642267-e8fe7.png) - precision cropped to isolate orange rectangle and eliminate external background
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[8px] select-none transition-opacity duration-200',
          onClick && 'cursor-pointer',
          watermark && 'opacity-35 hover:opacity-60',
          className,
        )}
        style={{ aspectRatio: '2.77 / 1' }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <img
          src={officialLogoUrl}
          alt={alt}
          className="absolute left-1/2 top-[48.25%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-cover pointer-events-none"
          style={{
            width: '114.4%',
            height: '317.5%',
          }}
          loading="eager"
          decoding="async"
        />
      </div>
    )
  }

  // Hollow / Vazada / Knockout / White version (Transparent background, white vector typography for dark photo overlays and video frames)
  if (isHollowOrVazada) {
    return (
      <div
        className={cn(
          'inline-flex items-center shrink-0 p-0.5',
          onClick && 'cursor-pointer',
          className,
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <svg
          viewBox="0 0 300 76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('h-full w-auto max-w-full select-none overflow-visible')}
          style={watermark ? { opacity: 0.35 } : undefined}
          role="img"
          aria-label={alt}
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
    <div
      className={cn(
        'inline-flex items-center shrink-0 p-0.5',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <svg
        viewBox="0 0 300 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('h-full w-auto max-w-full select-none overflow-visible')}
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
