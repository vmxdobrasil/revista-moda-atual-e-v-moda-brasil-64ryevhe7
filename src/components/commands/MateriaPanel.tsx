import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Newspaper, X } from 'lucide-react'
import type { MateriaSections } from '@/services/materia'

export type MateriaPhase = 'idle' | 'need-tema' | 'generating' | 'result' | 'error'

interface MateriaPanelProps {
  phase: MateriaPhase
  content: string
  sections: MateriaSections | null
  error: string
  onGenerate: (tema: string) => void
  onNewSearch: () => void
  onClose: () => void
}

const SECTION_LABELS: { key: keyof MateriaSections; label: string }[] = [
  { key: 'titulo', label: 'TÍTULO PRINCIPAL' },
  { key: 'subtitulo', label: 'SUBTÍTULO' },
  { key: 'olho', label: 'OLHO' },
  { key: 'corpo', label: 'CORPO DA MATÉRIA' },
  { key: 'cta', label: 'CALL TO ACTION' },
  { key: 'tags', label: 'TAGS DE SEO' },
  { key: 'social', label: 'SUGESTÃO DE REDES SOCIAIS' },
]

function formatFullArticle(sections: MateriaSections): string {
  return SECTION_LABELS.map((s) => `${s.label}:\n${sections[s.key]}`).join('\n\n')
}

export function MateriaPanel({
  phase,
  content,
  sections,
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

  if (phase === 'result' && sections) {
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">Matéria Jornalística</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(formatFullArticle(sections), 'full')}
            className="gap-2"
          >
            {copiedKey === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedKey === 'full' ? 'Copiado!' : 'Copiar artigo completo'}
          </Button>
        </div>
        {SECTION_LABELS.map((sec) => {
          const text = sections[sec.key]
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

  if (phase === 'result' && !sections && content) {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-orange-500" />
          <p className="text-sm font-medium">Matéria Jornalística</p>
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
