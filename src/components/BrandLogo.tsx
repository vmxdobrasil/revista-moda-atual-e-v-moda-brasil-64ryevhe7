import React from 'react'
import { cn } from '@/lib/utils'
import { useLogo } from '@/hooks/use-logo'
import officialOrangeLogoUrl from '@/assets/editedimage1786389429173-467b1.png'

export type BrandLogoVariant =
  | 'default'
  | 'white'
  | 'dark'
  | 'monochrome'
  | 'symbol'
  | 'full'
  | 'orange'
export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero' | '2xl'

export interface BrandLogoProps {
  variant?: BrandLogoVariant
  size?: BrandLogoSize
  className?: string
  showTagline?: boolean
  onClick?: () => void
  alt?: string
  useImageOnly?: boolean
}

const sizeClasses: Record<BrandLogoSize, string> = {
  xs: 'h-8 sm:h-9 text-[10px]',
  sm: 'h-10 sm:h-12 text-xs',
  md: 'h-14 sm:h-16 md:h-18 lg:h-20 text-sm',
  lg: 'h-20 sm:h-24 md:h-28 text-base',
  xl: 'h-28 sm:h-32 md:h-36 text-lg',
  hero: 'h-44 sm:h-56 md:h-64 lg:h-72 text-xl',
  '2xl': 'h-60 sm:h-72 md:h-80 lg:h-96 text-2xl',
}

const variantColors: Record<BrandLogoVariant, { bg: string; text: string }> = {
  default: { bg: '#EA580C', text: '#FFFFFF' },
  orange: { bg: '#EA580C', text: '#FFFFFF' },
  white: { bg: '#FFFFFF', text: '#EA580C' },
  dark: { bg: '#0F172A', text: '#FFFFFF' },
  monochrome: { bg: '#000000', text: '#FFFFFF' },
  symbol: { bg: '#EA580C', text: '#FFFFFF' },
  full: { bg: '#EA580C', text: '#FFFFFF' },
}

export function BrandLogo({
  variant = 'default',
  size = 'md',
  className,
  onClick,
  alt = 'Revista MODA ATUAL Digital',
  useImageOnly = false,
}: BrandLogoProps) {
  const { logoUrl } = useLogo()
  const [imgError, setImgError] = React.useState(false)

  const activeLogoUrl = logoUrl || officialOrangeLogoUrl
  const colors = variantColors[variant] || variantColors.default

  // Render official PNG image asset when available and using default/orange variants
  if (
    (useImageOnly || variant === 'default' || variant === 'orange') &&
    activeLogoUrl &&
    !imgError
  ) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0 shrink-0 overflow-visible',
          onClick && 'cursor-pointer',
          className,
        )}
      >
        <img
          src={activeLogoUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className={cn(
            'object-contain max-w-full bg-transparent p-0 m-0 border-0 mix-blend-multiply',
            sizeClasses[size],
            className,
          )}
        />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0 shrink-0 overflow-visible',
        onClick && 'cursor-pointer',
        className,
      )}
      title="Revista MODA ATUAL Digital"
    >
      <svg
        viewBox="0 0 380 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'object-contain max-w-full w-auto bg-transparent p-0 m-0 border-0 mix-blend-multiply',
          sizeClasses[size],
          className,
        )}
        style={{ aspectRatio: '380 / 140' }}
      >
        <rect
          width="380"
          height="140"
          rx="18"
          fill={colors.bg}
          className="transition-colors duration-200"
        />

        <text
          x="24"
          y="30"
          fill={colors.text}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="13"
          fontWeight="800"
          letterSpacing="3.5"
        >
          REVISTA
        </text>

        <text
          x="22"
          y="86"
          fill={colors.text}
          fontFamily="Playfair Display, Didot, 'Bodoni MT', Georgia, serif"
          fontSize="44"
          fontWeight="900"
          letterSpacing="0"
        >
          MODA ATUAL
        </text>

        <text
          x="250"
          y="122"
          fill={colors.text}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="14"
          fontWeight="800"
          letterSpacing="4"
        >
          DIGITAL
        </text>
      </svg>
    </div>
  )
}
