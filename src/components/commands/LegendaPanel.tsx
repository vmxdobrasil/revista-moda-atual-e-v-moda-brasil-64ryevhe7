import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search } from 'lucide-react'

export type LegendaPhase = 'idle' | 'need-theme' | 'generating' | 'result' | 'error'

interface LegendaPanelProps {
  phase: LegendaPhase
  caption: string
  error: string
  onGenerate: (theme: string) => void
  onNewSearch: () => void
}

export function LegendaPanel({
  phase,
  caption,
  error,
  onGenerate,
  onNewSearch,
}: LegendaPanelProps) {
  const [themeInput, setThemeInput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = useCallback(() => {
    const theme = themeInput.trim()
    if (theme) onGenerate(theme)
  }, [themeInput, onGenerate])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(caption)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [caption])

  if (phase === 'idle') return null

  if (phase === 'need-theme') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o tema do post?</p>
        <Input
          autoFocus
          value={themeInput}
          onChange={(e) => setThemeInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: coleção verão 2025"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!themeInput.trim()}>
          Gerar legenda
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando legenda...</p>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Legenda gerada</p>
          <span className="text-xs text-gray-400">{caption.length} caracteres</span>
        </div>
        <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed">{caption}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
            <Search className="w-3 h-3" />
            Nova busca
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar legenda</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" />
        Tentar novamente
      </Button>
    </div>
  )
}
