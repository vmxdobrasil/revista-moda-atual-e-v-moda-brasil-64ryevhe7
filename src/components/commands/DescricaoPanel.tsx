import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Youtube } from 'lucide-react'

export type DescricaoPhase = 'idle' | 'need-tema' | 'generating' | 'result' | 'error'

interface DescricaoPanelProps {
  phase: DescricaoPhase
  description: string
  error: string
  onGenerate: (tema: string) => void
  onNewSearch: () => void
}

export function DescricaoPanel({
  phase,
  description,
  error,
  onGenerate,
  onNewSearch,
}: DescricaoPanelProps) {
  const [temaInput, setTemaInput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = useCallback(() => {
    const tema = temaInput.trim()
    if (tema) onGenerate(tema)
  }, [temaInput, onGenerate])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [description])

  if (phase === 'idle') return null

  if (phase === 'need-tema') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o título do vídeo?</p>
        <Input
          autoFocus
          value={temaInput}
          onChange={(e) => setTemaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: Tendências de moda outono inverno 2026"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!temaInput.trim()}>
          Gerar descrição
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando descrição para YouTube...</p>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">Descrição gerada</p>
          </div>
          <span className="text-xs text-gray-400">{description.length} caracteres</span>
        </div>
        <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
          {description}
        </div>
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
        <p className="text-sm font-medium">Erro ao gerar descrição</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" />
        Tentar novamente
      </Button>
    </div>
  )
}
