import React from 'react'
import { cn } from '@/lib/utils'
import { useLogo } from '@/hooks/use-logo'

export type BrandLogoVariant =
  | 'default'
  | 'white'
  | 'dark'
  | 'monochrome'
  | 'symbol'
  | 'full'
  | 'orange'
  | 'header'

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
  md: 'h-12 sm:h-14 md:h-16 text-sm',
  lg: 'h-18 sm:h-22 md:h-24 text-base',
  xl: 'h-24 sm:h-28 md:h-32 text-lg',
  hero: 'h-40 sm:h-52 md:h-60 lg:h-64 text-xl',
  '2xl': 'h-52 sm:h-64 md:h-72 lg:h-80 text-2xl',
}

const variantColors: Record<BrandLogoVariant, { bg: string; text: string }> = {
  default: { bg: '#EA580C', text: '#FFFFFF' },
  header: { bg: '#EA580C', text: '#FFFFFF' },
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
}: BrandLogoProps) {
  const { logoUrl, isCustomLogo } = useLogo()
  const [imgError, setImgError] = React.useState(false)

  const colors = variantColors[variant] || variantColors.default

  // Custom logo uploaded in site settings
  if (isCustomLogo && logoUrl && !imgError) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0 shrink-0 overflow-visible',
          onClick && 'cursor-pointer',
          className,
        )}
        style={{ backgroundColor: 'transparent' }}
      >
        <img
          src={logoUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className={cn(
            'object-contain max-w-full bg-transparent p-0 m-0 border-0 shadow-none filter-none mix-blend-normal',
            sizeClasses[size],
            className,
          )}
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
    )
  }

  // Official vector logo: transparent canvas around the orange rounded box
  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0 shrink-0 overflow-visible',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ backgroundColor: 'transparent' }}
      title="Revista MODA ATUAL Digital"
    >
      <svg
        viewBox="0 0 380 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'object-contain max-w-full w-auto bg-transparent p-0 m-0 border-0 drop-shadow-none',
          sizeClasses[size],
          className,
        )}
        style={{ aspectRatio: '380 / 140', backgroundColor: 'transparent' }}
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
