import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, X, Factory } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export type LegendaAtacadistaPhase = 'idle' | 'need-input' | 'generating' | 'result' | 'error'

interface LegendaAtacadistaPanelProps {
  phase: LegendaAtacadistaPhase
  caption: string
  hashtags: string[]
  error: string
  onGenerate: (marca: string, produto: string) => void
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
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleSubmit = useCallback(() => {
    const marca = marcaInput.trim()
    const produto = produtoInput.trim()
    if (marca && produto) onGenerate(marca, produto)
  }, [marcaInput, produtoInput, onGenerate])

  const handleCopyCaption = useCallback(() => {
    navigator.clipboard.writeText(caption)
    setCopiedCaption(true)
    toast({ title: '✅ Copiado!', description: 'Legenda copiada para a área de transferência' })
    setTimeout(() => setCopiedCaption(false), 2000)
  }, [caption])

  const handleCopyHashtags = useCallback(() => {
    const text = hashtags.join(' ')
    navigator.clipboard.writeText(text)
    setCopiedHashtags(true)
    toast({ title: '✅ Copiado!', description: 'Hashtags copiadas para a área de transferência' })
    setTimeout(() => setCopiedHashtags(false), 2000)
  }, [hashtags])

  const handleCopyAll = useCallback(() => {
    const text = `${caption}\n\n${hashtags.join(' ')}`
    navigator.clipboard.writeText(text)
    setCopiedAll(true)
    toast({ title: '✅ Copiado!', description: 'Legenda e hashtags copiados' })
    setTimeout(() => setCopiedAll(false), 2000)
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
        <div className="space-y-1.5">
          <div className="bg-muted rounded-lg p-3 text-sm leading-relaxed">{caption}</div>
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={handleCopyCaption} className="gap-1.5 h-7">
              {copiedCaption ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copiedCaption ? 'Copiado!' : 'Copiar legenda'}
            </Button>
          </div>
        </div>
        {hashtags.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyHashtags}
                className="gap-1.5 h-7"
              >
                {copiedHashtags ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copiedHashtags ? 'Copiado!' : 'Copiar hashtags'}
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={handleCopyAll} className="gap-2">
            {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedAll ? 'Copiado!' : 'Copiar tudo'}
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
