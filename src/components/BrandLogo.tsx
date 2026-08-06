import { useLogo } from '@/hooks/use-logo'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  variant?: 'white' | 'header'
  className?: string
  watermark?: boolean
}

export function BrandLogo({ variant = 'white', className, watermark = false }: BrandLogoProps) {
  const { logoUrl } = useLogo()

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="REVISTA MODA ATUAL DIGITAL"
        className={cn(watermark && 'opacity-30', className)}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 300 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block', className)}
      style={watermark ? { opacity: 0.35 } : undefined}
      role="img"
      aria-label="REVISTA MODA ATUAL DIGITAL"
    >
      {variant === 'header' && <rect x="0" y="0" width="300" height="76" rx="8" fill="#ea580c" />}
      <text
        x="150"
        y="26"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="11"
        fontWeight="600"
        letterSpacing="2.5"
        fontFamily="system-ui, sans-serif"
      >
        REVISTA MODA ATUAL
      </text>
      <text
        x="150"
        y="58"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="26"
        fontWeight="800"
        letterSpacing="6"
        fontFamily="system-ui, sans-serif"
      >
        DIGITAL
      </text>
    </svg>
  )
}
