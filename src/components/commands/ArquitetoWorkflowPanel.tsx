import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Bot, X } from 'lucide-react'

export type ArquitetoWorkflowPhase = 'idle' | 'need-input' | 'generating' | 'result' | 'error'

interface ArquitetoWorkflowPanelProps {
  phase: ArquitetoWorkflowPhase
  result: string
  error: string
  onGenerate: (entregaFinal: string, n: number) => void
  onNewSearch: () => void
  onClose: () => void
}

export function ArquitetoWorkflowPanel({
  phase,
  result,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: ArquitetoWorkflowPanelProps) {
  const [entregaFinal, setEntregaFinal] = useState('')
  const [n, setN] = useState('5')
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const handleSubmit = useCallback(() => {
    const nNum = parseInt(n, 10)
    if (entregaFinal.trim() && nNum >= 1 && nNum <= 7) {
      onGenerate(entregaFinal.trim(), nNum)
    }
  }, [entregaFinal, n, onGenerate])

  if (phase === 'idle') return null

  if (phase === 'need-input') {
    const nNum = parseInt(n, 10)
    const nValid = nNum >= 1 && nNum <= 7
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Gerar Workflow de IA</p>
        <Input
          autoFocus
          value={entregaFinal}
          onChange={(e) => setEntregaFinal(e.target.value)}
          placeholder="Entrega Final (ex: Pauta completa de moda sustentável)"
        />
        <div>
          <Input
            type="number"
            min={1}
            max={7}
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder="Número de Etapas (1-7)"
          />
          {n && !nValid && <p className="text-xs text-red-500 mt-1">N deve ser entre 1 e 7</p>}
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={!entregaFinal.trim() || !nValid}>
          Gerar Workflow
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando workflow personalizado...</p>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">🤖 Workflow Gerado</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
        </div>
        <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-muted rounded-lg p-3">
          {result}
        </pre>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
            <RotateCcw className="w-3 h-3" /> Novo workflow
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="gap-2 ml-auto">
            <X className="w-3 h-3" /> Fechar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar workflow</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
