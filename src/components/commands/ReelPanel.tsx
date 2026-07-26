import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Film } from 'lucide-react'

export type ReelPhase = 'idle' | 'need-subject' | 'generating' | 'result' | 'error'

interface ReelPanelProps {
  phase: ReelPhase
  options: string[]
  error: string
  onGenerate: (subject: string) => void
  onNewSearch: () => void
}

export function ReelPanel({ phase, options, error, onGenerate, onNewSearch }: ReelPanelProps) {
  const [subjectInput, setSubjectInput] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleSubmit = useCallback(() => {
    const subject = subjectInput.trim()
    if (subject) onGenerate(subject)
  }, [subjectInput, onGenerate])

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  if (phase === 'idle') return null

  if (phase === 'need-subject') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o tema do Reel?</p>
        <Input
          autoFocus
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: tendências de maquiagem 2026"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!subjectInput.trim()}>
          Gerar roteiro
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando roteiro de Reel...</p>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-orange-500" />
          <p className="text-sm font-medium">Roteiros gerados</p>
        </div>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="bg-muted rounded-lg p-3 text-sm leading-relaxed">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 whitespace-pre-wrap">{opt}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(opt, i)}
                >
                  {copiedIndex === i ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
          <Search className="w-3 h-3" />
          Nova busca
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar roteiro</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" />
        Tentar novamente
      </Button>
    </div>
  )
}
