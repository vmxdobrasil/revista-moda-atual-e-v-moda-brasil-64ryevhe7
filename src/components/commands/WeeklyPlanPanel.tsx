import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, Calendar, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { WeeklyPlanResult } from '@/services/weekly-plan'

export type WeeklyPlanPhase = 'idle' | 'need-input' | 'generating' | 'result' | 'error'

interface WeeklyPlanPanelProps {
  phase: WeeklyPlanPhase
  result: WeeklyPlanResult | null
  error: string
  onGenerate: (
    dataInicio: string,
    dataFim: string,
    tema1: string,
    tema2: string,
    tema3: string,
  ) => void
  onNewSearch: () => void
  onClose: () => void
}

const DAY_LABELS: { key: string; label: string }[] = [
  { key: 'SEGUNDA-FEIRA', label: 'Segunda-feira' },
  { key: 'TERÇA-FEIRA', label: 'Terça-feira' },
  { key: 'QUARTA-FEIRA', label: 'Quarta-feira' },
  { key: 'QUINTA-FEIRA', label: 'Quinta-feira' },
  { key: 'SEXTA-FEIRA', label: 'Sexta-feira' },
  { key: 'SÁBADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
]

export function WeeklyPlanPanel({
  phase,
  result,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: WeeklyPlanPanelProps) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tema1, setTema1] = useState('')
  const [tema2, setTema2] = useState('')
  const [tema3, setTema3] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    if (dataInicio && dataFim && tema1 && tema2 && tema3) {
      onGenerate(dataInicio, dataFim, tema1, tema2, tema3)
    }
  }, [dataInicio, dataFim, tema1, tema2, tema3, onGenerate])

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast({ title: 'Copiado com sucesso!' })
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  if (phase === 'idle') return null

  if (phase === 'need-input') {
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <p className="text-sm font-medium">Preencha os campos para gerar o plano semanal:</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Data início</Label>
            <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Data fim</Label>
            <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tema 1</Label>
          <Input
            value={tema1}
            onChange={(e) => setTema1(e.target.value)}
            placeholder="Ex: tendências de verão 2026"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tema 2</Label>
          <Input
            value={tema2}
            onChange={(e) => setTema2(e.target.value)}
            placeholder="Ex: moda atacadista"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Tema 3</Label>
          <Input
            value={tema3}
            onChange={(e) => setTema3(e.target.value)}
            placeholder="Ex: acessórios em alta"
          />
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!dataInicio || !dataFim || !tema1 || !tema2 || !tema3}
        >
          Gerar plano semanal
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando plano de conteúdo semanal...</p>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const fullText = result.content
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">📅 Plano de Conteúdo Semanal</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(fullText, 'full')}
              className="gap-2"
            >
              {copiedKey === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedKey === 'full' ? 'Copiado!' : 'Copiar tudo'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="gap-1">
              <X className="w-3 h-3" /> Fechar
            </Button>
          </div>
        </div>

        {DAY_LABELS.map(({ key, label }) => {
          const dayContent = result.day_sections[key]
          if (!dayContent) return null
          const isExpanded = expandedDay === key
          return (
            <div key={key} className="bg-muted rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2">
                <button
                  className="text-xs font-bold text-orange-600 flex-1 text-left"
                  onClick={() => setExpandedDay(isExpanded ? null : key)}
                >
                  {label} {isExpanded ? '▲' : '▼'}
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleCopy(dayContent, key)}
                >
                  {copiedKey === key ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{dayContent}</p>
                </div>
              )}
            </div>
          )
        })}

        {result.resumo && (
          <div className="bg-orange-50 rounded-lg overflow-hidden border border-orange-200">
            <div className="flex items-center justify-between px-3 py-2">
              <button
                className="text-xs font-bold text-orange-700 flex-1 text-left"
                onClick={() => setExpandedDay(expandedDay === 'RESUMO' ? null : 'RESUMO')}
              >
                Resumo Semanal {expandedDay === 'RESUMO' ? '▲' : '▼'}
              </button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0"
                onClick={() => handleCopy(result.resumo, 'RESUMO')}
              >
                {copiedKey === 'RESUMO' ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
            {expandedDay === 'RESUMO' && (
              <div className="px-3 pb-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.resumo}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
            <Search className="w-3 h-3" /> Nova busca
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">Erro ao gerar plano semanal</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
