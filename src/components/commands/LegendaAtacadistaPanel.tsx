import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, X, Factory } from 'lucide-react'

export type LegendaAtacadistaPhase = 'idle' | 'need-input' | 'generating' | 'result' | 'error'

interface LegendaAtacadistaPanelProps {
  phase: LegendaAtacadistaPhase
  caption: string
  hashtags: string[]
  error: string
  onGenerate: (nomeMarca: string, produto: string) => void
  onNewSearch: () => void
  onClose: () => void
}

export function LegendaAtacadistaPanel({
  phase,
  caption,
  hashtags,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: LegendaAtacadistaPanelProps) {
  const [marcaInput, setMarcaInput] = useState('')
  const [produtoInput, setProdutoInput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = useCallback(() => {
    const marca = marcaInput.trim()
    const produto = produtoInput.trim()
    if (marca && produto) onGenerate(marca, produto)
  }, [marcaInput, produtoInput, onGenerate])

  const handleCopy = useCallback(() => {
    const text = `${caption}\n\n${hashtags.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [caption, hashtags])

  if (phase === 'idle') return null

  if (phase === 'need-input') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Gerar legenda atacadista</p>
        <Input
          autoFocus
          value={marcaInput}
          onChange={(e) => setMarcaInput(e.target.value)}
          placeholder="Nome da marca (ex: Dona Fifi)"
        />
        <Input
          value={produtoInput}
          onChange={(e) => setProdutoInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Produto (ex: vestidos)"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!marcaInput.trim() || !produtoInput.trim()}
          >
            Gerar legenda
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando legenda atacadista...</p>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Factory className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">Legenda Atacadista</p>
          </div>
          <span className="text-xs text-gray-400">{caption.length} caracteres</span>
        </div>
        <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed">{caption}</div>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar legenda'}
          </Button>
          <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
            <Search className="w-3 h-3" />
            Nova busca
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="gap-2 ml-auto">
            <X className="w-3 h-3" />
            Fechar
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
