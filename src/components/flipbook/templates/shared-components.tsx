import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

export function TemplateFooter({
  editionTitle,
  publicationDate,
}: {
  editionTitle?: string
  publicationDate?: string
}) {
  if (!editionTitle && !publicationDate) return null
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50/80 border-t border-gray-200 text-[10px] text-gray-400 flex-shrink-0">
      {editionTitle && <span className="font-serif italic truncate">{editionTitle}</span>}
      {publicationDate && <span className="whitespace-nowrap">{publicationDate}</span>}
    </div>
  )
}

export function CTABlock({ label, link }: { label: string; link: string }) {
  if (!label) return null
  return (
    <Link
      to={link || '/'}
      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:scale-105 transition-transform self-start text-sm"
    >
      {label} <ArrowRight className="w-4 h-4" />
    </Link>
  )
}

export function HighlightBox({
  title,
  items,
  variant = 'light',
}: {
  title: string
  items: string[]
  variant?: 'light' | 'dark'
}) {
  if (!items || items.length === 0) return null
  const bg =
    variant === 'dark' ? 'bg-white/5 border-orange-400' : 'bg-orange-50/80 border-orange-500'
  const text = variant === 'dark' ? 'text-white/70' : 'text-gray-700'
  const titleColor = variant === 'dark' ? 'text-orange-400' : 'text-orange-900'
  const bullet = variant === 'dark' ? 'text-orange-400' : 'text-orange-500'
  return (
    <div className={`mt-3 p-3 ${bg} border-l-4 rounded-r-lg`}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className={`w-4 h-4 ${titleColor}`} />
        <h4 className={`font-bold ${titleColor} text-xs uppercase tracking-wide`}>{title}</h4>
      </div>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className={`text-xs ${text} flex items-start gap-1.5`}>
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
    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 border border-orange-300 rounded-full text-[10px] font-bold text-orange-800 whitespace-nowrap">
      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
      {text || 'Revista Moda Atual'}
    </div>
  )
}
