import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { TemplateFormat } from './format-context'
import { isVertical, formatTitleSize } from './format-context'
import { BrandLogo } from '@/components/BrandLogo'

export function EditorialDivider({ className = '' }: { className?: string }) {
  return <div className={`editorial-divider w-12 ${className}`} />
}

export function EditorialHeader({
  eyebrow,
  title,
  subtitle,
  format = 'a4',
  align = 'left',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  format?: TemplateFormat
  align?: string
}) {
  const story = isVertical(format)
  const alignCls = align === 'center' ? 'text-center items-center' : 'text-left'
  return (
    <div className={`mb-4 flex flex-col ${alignCls}`}>
      {eyebrow && (
        <span className="type-eyebrow text-[0.625rem] md:text-[0.6875rem] text-orange-600 mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className={`type-display ${formatTitleSize(format)} text-gray-900`}>{title}</h2>
      {subtitle && (
        <p
          className={`type-subheadline ${story ? 'text-sm' : 'text-base md:text-lg'} text-gray-500 mt-2`}
        >
          {subtitle}
        </p>
      )}
      <EditorialDivider className={`mt-3 ${align === 'center' ? 'mx-auto' : ''}`} />
    </div>
  )
}

export function TemplateFooter({
  editionTitle,
  publicationDate,
  showLogo = true,
  format = 'a4',
}: {
  editionTitle?: string
  publicationDate?: string
  showLogo?: boolean
  format?: TemplateFormat
}) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50/90 border-t border-gray-200 flex-shrink-0 mt-auto">
      {showLogo && (
        <BrandLogo format={format} variant="primary" className="h-4 md:h-5 w-auto object-contain" />
      )}
      {editionTitle && (
        <span className="text-[0.625rem] text-gray-500 font-serif italic truncate max-w-[180px]">
          {editionTitle}
        </span>
      )}
      {publicationDate && (
        <span className="text-[0.625rem] text-gray-400 whitespace-nowrap">{publicationDate}</span>
      )}
    </div>
  )
}

export function CTABlock({
  label,
  link,
  format = 'a4',
}: {
  label: string
  link: string
  format?: TemplateFormat
}) {
  if (!label) return null
  const story = isVertical(format)
  const cls = story
    ? 'mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white bg-orange-600 shadow-lg self-start text-xs'
    : 'mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-orange-600 shadow-lg hover:scale-105 transition-transform self-start text-sm'
  return (
    <Link to={link || '/'} className={cls}>
      {label} <ArrowRight className={story ? 'w-3 h-3' : 'w-4 h-4'} />
    </Link>
  )
}

export function HighlightBox({
  title,
  items,
  variant = 'light',
  format = 'a4',
}: {
  title: string
  items: string[]
  variant?: 'light' | 'dark'
  format?: TemplateFormat
}) {
  if (!items || items.length === 0) return null
  const bg =
    variant === 'dark' ? 'bg-white/5 border-orange-400' : 'bg-orange-50/80 border-orange-600'
  const text = variant === 'dark' ? 'text-white/70' : 'text-gray-700'
  const titleColor = variant === 'dark' ? 'text-orange-400' : 'text-orange-900'
  const bullet = variant === 'dark' ? 'text-orange-400' : 'text-orange-600'
  return (
    <div className={`mt-3 p-3 ${bg} border-l-4 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className={`w-4 h-4 ${titleColor}`} />
        <h4 className={`type-eyebrow ${titleColor} text-[0.625rem]`}>{title}</h4>
      </div>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className={`type-caption ${text} text-xs flex items-start gap-1.5`}>
            <span className={`${bullet} mt-0.5`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function EditionSeal({ text }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/90 border border-orange-300 rounded-full text-[0.625rem] font-bold text-orange-800 whitespace-nowrap type-eyebrow shadow-sm">
      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
      <span>{text || 'Revista MODA ATUAL'}</span>
    </div>
  )
}

export function MarketDataBar({
  label,
  value,
  unit,
  max,
  trend,
}: {
  label: string
  value: number
  unit?: string
  max: number
  trend?: 'up' | 'down' | 'neutral'
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="type-caption text-gray-600">{label}</span>
        <span className={`font-bold ${trendColor}`}>
          {value}
          {unit} {trendIcon}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
