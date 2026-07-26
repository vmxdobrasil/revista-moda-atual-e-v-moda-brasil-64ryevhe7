import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2, AlertCircle, RotateCcw, Search, TrendingUp, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { TrendReport } from '@/services/trend-report'

export type TrendReportPhase = 'idle' | 'need-tendencia' | 'generating' | 'result' | 'error'

interface TrendReportPanelProps {
  phase: TrendReportPhase
  report: TrendReport | null
  error: string
  onGenerate: (tendencia: string) => void
  onNewSearch: () => void
  onClose: () => void
}

function formatFullReport(report: TrendReport): string {
  const lines: string[] = []
  lines.push(`NOME DA TENDÊNCIA: ${report.nome}`)
  lines.push('')
  lines.push(`ORIGEM: ${report.origem}`)
  lines.push('')
  lines.push('DESCRIÇÃO:')
  lines.push(report.descricao)
  lines.push('')
  lines.push('POTENCIAL NO ATACADO:')
  lines.push(`Nível: ${report.potencial_atacado.nivel}`)
  lines.push(`Justificativa: ${report.potencial_atacado.justificativa}`)
  lines.push('')
  lines.push(`RELEVÂNCIA PARA O POLO DE GOIÁS: ${report.relevancia_polo}`)
  lines.push('')
  lines.push('OPORTUNIDADES PARA FABRICANTES:')
  report.oportunidades.forEach((op, i) => {
    lines.push(`${i + 1}. ${op}`)
  })
  lines.push('')
  lines.push(`SUGESTÃO DE ABORDAGEM EDITORIAL: ${report.abordagem_editorial}`)
  lines.push('')
  lines.push(`PALAVRAS-CHAVE RELACIONADAS: ${report.palavras_chave.join(', ')}`)
  return lines.join('\n')
}

const NIVEL_COLORS: Record<string, string> = {
  alto: 'bg-green-100 text-green-700',
  médio: 'bg-yellow-100 text-yellow-700',
  medio: 'bg-yellow-100 text-yellow-700',
  baixo: 'bg-red-100 text-red-700',
}

export function TrendReportPanel({
  phase,
  report,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: TrendReportPanelProps) {
  const [tendenciaInput, setTendenciaInput] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleSubmit = useCallback(() => {
    const tendencia = tendenciaInput.trim()
    if (tendencia) onGenerate(tendencia)
  }, [tendenciaInput, onGenerate])

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast({ title: 'Copiado com sucesso!' })
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  if (phase === 'idle') return null

  if (phase === 'need-tendencia') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o nome da tendência?</p>
        <Input
          autoFocus
          value={tendenciaInput}
          onChange={(e) => setTendenciaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: cores terrosas, moda denim, minimalismo"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!tendenciaInput.trim()}>
          Gerar relatório
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando relatório de tendência...</p>
      </div>
    )
  }

  if (phase === 'result' && report) {
    const nivelLower = report.potencial_atacado.nivel.toLowerCase()
    const nivelClass = NIVEL_COLORS[nivelLower] || 'bg-gray-100 text-gray-700'

    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">🔍 Relatório de Tendência</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(formatFullReport(report), 'full')}
            className="gap-2"
          >
            {copiedKey === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedKey === 'full' ? 'Copiado!' : 'Copiar tudo'}
          </Button>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">NOME DA TENDÊNCIA</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.nome, 'nome')}
            >
              {copiedKey === 'nome' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm font-semibold leading-relaxed">{report.nome}</p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">ORIGEM</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.origem, 'origem')}
            >
              {copiedKey === 'origem' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.origem}</p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">DESCRIÇÃO</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.descricao, 'descricao')}
            >
              {copiedKey === 'descricao' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.descricao}</p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">POTENCIAL NO ATACADO</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() =>
                handleCopy(
                  `Nível: ${report.potencial_atacado.nivel}\nJustificativa: ${report.potencial_atacado.justificativa}`,
                  'potencial',
                )
              }
            >
              {copiedKey === 'potencial' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500">Nível:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${nivelClass}`}>
              {report.potencial_atacado.nivel}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {report.potencial_atacado.justificativa}
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">
              RELEVÂNCIA PARA O POLO DE GOIÁS
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.relevancia_polo, 'relevancia')}
            >
              {copiedKey === 'relevancia' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{report.relevancia_polo}</p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">
              OPORTUNIDADES PARA FABRICANTES
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() =>
                handleCopy(
                  report.oportunidades.map((o, i) => `${i + 1}. ${o}`).join('\n'),
                  'oportunidades',
                )
              }
            >
              {copiedKey === 'oportunidades' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <ol className="text-sm leading-relaxed list-decimal list-inside space-y-1">
            {report.oportunidades.map((op, i) => (
              <li key={i}>{op}</li>
            ))}
          </ol>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">
              SUGESTÃO DE ABORDAGEM EDITORIAL
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.abordagem_editorial, 'abordagem')}
            >
              {copiedKey === 'abordagem' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {report.abordagem_editorial}
          </p>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-orange-600">PALAVRAS-CHAVE RELACIONADAS</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => handleCopy(report.palavras_chave.join(', '), 'palavras')}
            >
              {copiedKey === 'palavras' ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.palavras_chave.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

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
        <p className="text-sm font-medium">Erro ao gerar relatório</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
