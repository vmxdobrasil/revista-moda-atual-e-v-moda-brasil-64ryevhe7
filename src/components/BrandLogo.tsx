import React from 'react'
import { cn } from '@/lib/utils'
import { useLogo } from '@/hooks/use-logo'
import officialLogoImg from '@/assets/editedimage1786389429173-467b1.png'

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
  xs: 'h-8 text-[10px]',
  sm: 'h-11 text-xs',
  md: 'h-14 text-sm',
  lg: 'h-24 text-base',
  xl: 'h-32 text-lg',
  hero: 'h-44 sm:h-52 md:h-64 text-xl',
  '2xl': 'h-60 sm:h-72 md:h-80 text-2xl',
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

  const activeLogoUrl = logoUrl || officialLogoImg

  if ((logoUrl || useImageOnly) && !imgError) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 hover:opacity-95 select-none bg-transparent p-0 m-0 border-0',
          onClick && 'cursor-pointer',
          className,
        )}
      >
        <img
          src={activeLogoUrl}
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
        'inline-flex items-center justify-center transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] select-none bg-transparent p-0 m-0 border-0',
        onClick && 'cursor-pointer',
        className,
      )}
      title="Revista MODA ATUAL Digital"
    >
      <svg
        viewBox="0 0 320 134"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('object-contain max-w-full drop-shadow-md', sizeClasses[size], className)}
        style={{ aspectRatio: '320 / 134' }}
      >
        <rect
          width="320"
          height="134"
          rx="16"
          fill="#EA580C"
          className="transition-colors duration-200"
        />

        <text
          x="20"
          y="26"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="13"
          fontWeight="800"
          letterSpacing="3.5"
        >
          REVISTA
        </text>

        <text
          x="18"
          y="84"
          fill="#FFFFFF"
          fontFamily="Playfair Display, Didot, 'Bodoni MT', Georgia, serif"
          fontSize="50"
          fontWeight="900"
          letterSpacing="0.5"
        >
          MODA ATUAL
        </text>

        <text
          x="222"
          y="118"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
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
