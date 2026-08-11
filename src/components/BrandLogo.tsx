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
  xs: 'h-9 text-[10px]',
  sm: 'h-12 text-xs',
  md: 'h-16 sm:h-20 text-sm',
  lg: 'h-24 sm:h-28 text-base',
  xl: 'h-32 sm:h-36 text-lg',
  hero: 'h-48 sm:h-60 md:h-72 text-xl',
  '2xl': 'h-64 sm:h-80 md:h-96 text-2xl',
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
}: BrandLogoProps) {
  const { logoUrl, isCustomLogo } = useLogo()
  const [imgError, setImgError] = React.useState(false)

  const colors = variantColors[variant] || variantColors.default

  if (isCustomLogo && logoUrl && !imgError) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 hover:opacity-95 select-none bg-transparent p-0 m-0 border-0 shrink-0',
          onClick && 'cursor-pointer',
          className,
        )}
      >
        <img
          src={logoUrl}
          alt={alt}
          onError={() => setImgError(true)}
          className={cn('object-contain max-w-full drop-shadow-sm', sizeClasses[size], className)}
        />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0 shrink-0',
        onClick && 'cursor-pointer',
        className,
      )}
      title="Revista MODA ATUAL Digital"
    >
      <svg
        viewBox="0 0 320 134"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'object-contain max-w-full drop-shadow-md w-auto',
          sizeClasses[size],
          className,
        )}
        style={{ aspectRatio: '320 / 134' }}
      >
        <rect
          width="320"
          height="134"
          rx="16"
          fill={colors.bg}
          className="transition-colors duration-200"
        />

        <text
          x="22"
          y="28"
          fill={colors.text}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="13"
          fontWeight="800"
          letterSpacing="3.5"
        >
          REVISTA
        </text>

        <text
          x="20"
          y="84"
          fill={colors.text}
          fontFamily="Playfair Display, Didot, 'Bodoni MT', Georgia, serif"
          fontSize="50"
          fontWeight="900"
          letterSpacing="0.5"
        >
          MODA ATUAL
        </text>

        <text
          x="215"
          y="118"
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
