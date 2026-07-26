import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Bot, X } from 'lucide-react'
import type { MetaPromptResult } from '@/services/meta-prompt'

export type MetaPromptPhase = 'idle' | 'need-input' | 'generating' | 'result' | 'error'

interface MetaPromptPanelProps {
  phase: MetaPromptPhase
  result: MetaPromptResult | null
  error: string
  onGenerate: (objetivo: string, tipo: string, canal: string, publico: string) => void
  onNewSearch: () => void
  onClose: () => void
}

const AUDIENCE_NAMES: Record<string, string> = {
  P1: 'CEOs e Fundadores',
  P2: 'Diretores de Marketing',
  P3: 'Gerentes de Produto',
  P4: 'Social Media Managers',
  P5: 'Estilistas e Designers',
  P6: 'Lojistas e Revendedores',
}

export function MetaPromptPanel({
  phase,
  result,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: MetaPromptPanelProps) {
  const [objetivo, setObjetivo] = useState('')
  const [tipo, setTipo] = useState('')
  const [canal, setCanal] = useState('')
  const [publico, setPublico] = useState('P1')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  const handleSubmit = useCallback(() => {
    if (objetivo.trim() && tipo.trim() && canal.trim()) {
      onGenerate(objetivo.trim(), tipo.trim(), canal.trim(), publico)
    }
  }, [objetivo, tipo, canal, publico, onGenerate])

  if (phase === 'idle') return null

  if (phase === 'need-input') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Gerar Meta-Prompt personalizado</p>
        <Input
          autoFocus
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="Objetivo (ex: engajar)"
        />
        <Input
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Tipo (ex: legenda, roteiro)"
        />
        <Input
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          placeholder="Canal (ex: Instagram, YouTube)"
        />
        <select
          value={publico}
          onChange={(e) => setPublico(e.target.value)}
          className="w-full px-3 py-2 rounded-md border bg-background text-sm"
        >
          {Object.entries(AUDIENCE_NAMES).map(([k, v]) => (
            <option key={k} value={k}>
              {k} — {v}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!objetivo.trim() || !tipo.trim() || !canal.trim()}
        >
          Gerar Meta-Prompt
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando Meta-Prompt personalizado...</p>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">
              🤖 Meta-Prompt — {result.publico} (
              {AUDIENCE_NAMES[result.publico] || result.publicoName})
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(result.content, 'all')}
            className="gap-2"
          >
            {copiedKey === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedKey === 'all' ? 'Copiado!' : 'Copiar tudo'}
          </Button>
        </div>
        {result.blocks.map((block, i) => (
          <div key={i} className="bg-muted rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-orange-600">
                BLOCO {i + 1}: {block.title}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => handleCopy(block.content, `block-${i}`)}
              >
                {copiedKey === `block-${i}` ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{block.content}</p>
          </div>
        ))}
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

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar Meta-Prompt</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
