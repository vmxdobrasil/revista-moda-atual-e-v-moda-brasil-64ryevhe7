import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Newspaper, X } from 'lucide-react'
import type { MateriaArticle } from '@/services/materia'

export type MateriaPhase = 'idle' | 'need-tema' | 'generating' | 'result' | 'error'

interface MateriaPanelProps {
  phase: MateriaPhase
  content: string
  article: MateriaArticle | null
  error: string
  onGenerate: (tema: string) => void
  onNewSearch: () => void
  onClose: () => void
}

interface SectionDef {
  key: string
  label: string
}

const STRING_SECTIONS: SectionDef[] = [
  { key: 'titulo_principal', label: 'TÍTULO PRINCIPAL' },
  { key: 'subtitulo', label: 'SUBTÍTULO' },
  { key: 'olho', label: 'OLHO' },
  { key: 'corpo', label: 'CORPO DA MATÉRIA' },
]

function formatFullArticle(article: MateriaArticle): string {
  const lines: string[] = []
  lines.push(`TÍTULO PRINCIPAL: ${article.titulo_principal}`)
  lines.push(`SUBTÍTULO: ${article.subtitulo}`)
  lines.push(`OLHO: ${article.olho}`)
  lines.push('')
  lines.push('CORPO DA MATÉRIA:')
  lines.push(article.corpo)
  lines.push('')
  lines.push('CALL TO ACTION:')
  article.call_to_action.forEach((cta, i) => {
    lines.push(`${i + 1}. ${cta}`)
  })
  lines.push('')
  lines.push(`TAGS DE SEO: ${article.tags_seo.join(', ')}`)
  lines.push('')
  lines.push('SUGESTÃO DE REDES SOCIAIS:')
  lines.push(`Texto Instagram: ${article.sugestao_redes.instagram_text}`)
  lines.push(`Sugestão de arte: ${article.sugestao_redes.arte_description}`)
  return lines.join('\n')
}

export function MateriaPanel({
  phase,
  content,
  article,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: MateriaPanelProps) {
  const [temaInput, setTemaInput] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    const tema = temaInput.trim()
    if (tema) onGenerate(tema)
  }, [temaInput, onGenerate])

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  if (phase === 'idle') return null

  if (phase === 'need-tema') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o tema da matéria?</p>
        <Input
          autoFocus
          value={temaInput}
          onChange={(e) => setTemaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: tendências de moda verão 2026"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!temaInput.trim()}>
          Gerar matéria
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando matéria jornalística...</p>
      </div>
    )
  }

  if (phase === 'result' && article) {
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">📰 Matéria Completa</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(formatFullArticle(article), 'full')}
            className="gap-2"
          >
            {copiedKey === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedKey === 'full' ? 'Copiado!' : 'Copiar tudo'}
          </Button>
        </div>

        {STRING_SECTIONS.map((sec) => {
          const text = article[sec.key as keyof MateriaArticle] as string
          if (!text) return null
          return (
            <div key={sec.key} className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-orange-600">{sec.label}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => handleCopy(text, sec.key)}
                >
                  {copiedKey === sec.key ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
            </div>
          )
        })}

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">CALL TO ACTION</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() =>
                handleCopy(article.call_to_action.map((c, i) => `${i + 1}. ${c}`).join('\n'), 'cta')
              }
            >
              {copiedKey === 'cta' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <ol className="text-sm leading-relaxed list-decimal list-inside space-y-1">
            {article.call_to_action.map((cta, i) => (
              <li key={i}>{cta}</li>
            ))}
          </ol>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">TAGS DE SEO</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(article.tags_seo.join(', '), 'tags')}
            >
              {copiedKey === 'tags' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {article.tags_seo.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">SUGESTÃO DE REDES SOCIAIS</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() =>
                handleCopy(
                  `Texto Instagram: ${article.sugestao_redes.instagram_text}\nSugestão de arte: ${article.sugestao_redes.arte_description}`,
                  'social',
                )
              }
            >
              {copiedKey === 'social' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-gray-500">Texto Instagram:</span>
              <p className="text-sm leading-relaxed mt-0.5">
                {article.sugestao_redes.instagram_text}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500">Sugestão de arte:</span>
              <p className="text-sm leading-relaxed mt-0.5">
                {article.sugestao_redes.arte_description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
            <Search className="w-3 h-3" /> Nova busca
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="gap-2 ml-auto">
            <X className="w-3 h-3" /> Fechar
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && !article && content) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-orange-500" />
          <p className="text-sm font-medium">📰 Matéria Completa</p>
        </div>
        <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
          {content}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCopy(content, 'raw')}
          className="gap-2"
        >
          {copiedKey === 'raw' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          Copiar
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar matéria</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
