import { useState, useCallback, useMemo } from 'react'
import { generateEngenheiroRefinamento } from '@/services/engenheiro-refinamento'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Play, AlertCircle, Copy, Check, Wrench } from 'lucide-react'

interface ParsedResult {
  diagnostico: string
  promptOtimizado: string
  oQueMudei: string
}

function parseResult(raw: string): ParsedResult {
  const diagnosticoMatch = raw.match(/DIAGNÓSTICO:\s*([\s\S]*?)(?=\n\s*PROMPT OTIMIZADO:)/i)
  const promptOtimizadoMatch = raw.match(/PROMPT OTIMIZADO:\s*([\s\S]*?)(?=\n\s*O QUE MUDEI:)/i)
  const oQueMudeiMatch = raw.match(/O QUE MUDEI:\s*([\s\S]*)$/i)

  return {
    diagnostico: diagnosticoMatch ? diagnosticoMatch[1].trim() : '',
    promptOtimizado: promptOtimizadoMatch ? promptOtimizadoMatch[1].trim() : '',
    oQueMudei: oQueMudeiMatch ? oQueMudeiMatch[1].trim() : '',
  }
}

export default function EngenheiroRefinamentoPage() {
  const [promptOriginal, setPromptOriginal] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const parsed = useMemo(() => (result ? parseResult(result) : null), [result])

  const handleGenerate = useCallback(async () => {
    if (!promptOriginal.trim()) {
      toast({
        title: 'Erro',
        description: 'Prompt Original é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult('')
    try {
      const res = await generateEngenheiroRefinamento(promptOriginal.trim())
      setResult(res.resultado)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [promptOriginal, toast])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Engenheiro de Prompts Sênior
        </h2>
        <p className="text-gray-500 mt-1">
          Analise e otimize prompts para sistemas de IA generativa — diagnóstico, prompt otimizado e
          lista de alterações.
        </p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Prompt Original
            </label>
            <Textarea
              value={promptOriginal}
              onChange={(e) => setPromptOriginal(e.target.value)}
              placeholder="Cole aqui o prompt que deseja analisar e otimizar..."
              rows={8}
              className="resize-y"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !promptOriginal.trim()}
            className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Gerar Otimização
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && !error && (
        <Card className="rounded-xl border-none bg-white shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900">Resultado da Otimização</h3>
              </div>
              <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar Resultado'}
              </Button>
            </div>

            {parsed && (
              <>
                {parsed.diagnostico && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                      Diagnóstico
                    </h4>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      {parsed.diagnostico}
                    </pre>
                  </div>
                )}

                {parsed.promptOtimizado && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                      Prompt Otimizado
                    </h4>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200">
                      {parsed.promptOtimizado}
                    </pre>
                  </div>
                )}

                {parsed.oQueMudei && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                      O Que Mudei
                    </h4>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      {parsed.oQueMudei}
                    </pre>
                  </div>
                )}
              </>
            )}

            {(!parsed || (!parsed.diagnostico && !parsed.promptOtimizado && !parsed.oQueMudei)) && (
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-x-auto">
                {result}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
