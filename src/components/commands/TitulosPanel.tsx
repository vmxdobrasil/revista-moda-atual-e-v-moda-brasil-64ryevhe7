import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Type } from 'lucide-react'

export type TitulosPhase = 'idle' | 'need-tema' | 'generating' | 'result' | 'error'

interface TitulosPanelProps {
  phase: TitulosPhase
  titulos: string[]
  error: string
  onGenerate: (tema: string) => void
  onNewSearch: () => void
}

export function TitulosPanel({
  phase,
  titulos,
  error,
  onGenerate,
  onNewSearch,
}: TitulosPanelProps) {
  const [temaInput, setTemaInput] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleSubmit = useCallback(() => {
    const tema = temaInput.trim()
    if (tema) onGenerate(tema)
  }, [temaInput, onGenerate])

  const handleCopy = useCallback((text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
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
          placeholder="Ex: tendências de moda outono inverno 2026"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!temaInput.trim()}>
          Gerar títulos
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando títulos SEO...</p>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-orange-500" />
          <p className="text-sm font-medium">Títulos gerados</p>
        </div>
        <div className="space-y-2">
          {titulos.map((titulo, i) => (
            <div key={i} className="bg-muted rounded-lg p-3 text-sm leading-relaxed">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1">{titulo}</p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(titulo, i)}
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
        <p className="text-sm font-medium">Erro ao gerar títulos</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" />
        Tentar novamente
      </Button>
    </div>
  )
}
