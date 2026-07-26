import { useState, useCallback } from 'react'
import { generateArquitetoWorkflow } from '@/services/arquiteto-workflow'
import {
  ArquitetoWorkflowPanel,
  type ArquitetoWorkflowPhase,
} from '@/components/commands/ArquitetoWorkflowPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Play, AlertCircle, Copy, Check, Wand2 } from 'lucide-react'

export default function ArquitetoWorkflowPage() {
  const [entregaFinal, setEntregaFinal] = useState('')
  const [n, setN] = useState('5')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerate = useCallback(async () => {
    const nNum = parseInt(n, 10)
    if (!entregaFinal.trim()) {
      toast({ title: 'Erro', description: 'Entrega Final é obrigatória.', variant: 'destructive' })
      return
    }
    if (!Number.isInteger(nNum) || nNum < 1 || nNum > 7) {
      toast({
        title: 'Erro',
        description: 'Número de Etapas deve ser entre 1 e 7.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setError(null)
    setResult('')
    try {
      const res = await generateArquitetoWorkflow(entregaFinal.trim(), nNum)
      setResult(res.workflow)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [entregaFinal, n, toast])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [result])

  const nNum = parseInt(n, 10)
  const nValid = Number.isInteger(nNum) && nNum >= 1 && nNum <= 7

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Arquiteto de Workflow</h2>
        <p className="text-gray-500 mt-1">
          Gere workflows de IA com múltiplas etapas encadeadas para a Revista MODA ATUAL DIGITAL.
        </p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Entrega Final</label>
            <Input
              value={entregaFinal}
              onChange={(e) => setEntregaFinal(e.target.value)}
              placeholder="ex: Pauta completa de moda sustentável"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Número de Etapas (1–7)
            </label>
            <Input
              type="number"
              min={1}
              max={7}
              value={n}
              onChange={(e) => setN(e.target.value)}
              placeholder="ex: 5"
            />
            {n && !nValid && <p className="text-xs text-red-500 mt-1">N deve ser entre 1 e 7</p>}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !entregaFinal.trim() || !nValid}
            className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Gerar Workflow
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
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900">Workflow Gerado</h3>
              </div>
              <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {result}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
