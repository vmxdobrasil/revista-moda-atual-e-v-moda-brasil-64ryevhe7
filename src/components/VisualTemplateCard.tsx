import { memo } from 'react'
import type { StoryText } from '@/services/story-texts'
import { extractDisplayContent, extractTags } from '@/lib/story-text-utils'

const TYPE_GRADIENTS: Record<string, string> = {
  'meta-prompt': '#4f46e5, #7c3aed',
  materia_completa: '#2563eb, #0891b2',
  'materia-jornalistica': '#2563eb, #0891b2',
  'legenda-atacadista': '#f97316, #dc2626',
  'tendencia-relatorio': '#14b8a6, #16a34a',
  'reels-script': '#ec4899, #e11d48',
  'plano-semanal': '#a855f7, #4f46e5',
  descricao: '#ef4444, #f97316',
  texto: '#374151, #111827',
}

interface VisualTemplateCardProps {
  storyText: StoryText
  className?: string
}

export const VisualTemplateCard = memo(function VisualTemplateCard({
  storyText,
  className,
}: VisualTemplateCardProps) {
  const { content, type, typeLabel } = extractDisplayContent(storyText.options)
  const tags = extractTags(storyText.options)
  const gradient = TYPE_GRADIENTS[type] || TYPE_GRADIENTS.texto

  return (
    <div
      style={{ background: `linear-gradient(135deg, ${gradient})` }}
      className={`relative aspect-square w-full rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col ${className || ''}`}
    >
      <div className="text-white/60 text-xs font-bold tracking-widest uppercase mb-3">
        V MODA BRASIL
      </div>
      <span className="absolute top-6 right-6 md:top-8 md:right-8 bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
        {typeLabel}
      </span>
      <h2 className="text-white text-lg md:text-2xl font-extrabold mb-3 line-clamp-3">
        {storyText.subject}
      </h2>
      <p className="text-white/90 text-sm leading-relaxed flex-1 overflow-hidden line-clamp-8">
        {content}
      </p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/15 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="text-white/50 text-xs mt-3">revistaModaAtual.com</div>
    </div>
  )
})
