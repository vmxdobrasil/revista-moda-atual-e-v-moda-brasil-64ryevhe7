import { useState, useEffect, useRef } from 'react'
import { getEditions, type Edition } from '@/services/magazine'
import {
  runContentWorkflow,
  saveWorkflowToGeneratedContent,
  type WorkflowResult,
} from '@/services/content-workflow'
import { WorkflowResultDisplay } from './components/WorkflowResultDisplay'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Play, AlertCircle, Save, Check, X, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Analisando', agent: 'content-analyzer' },
  { label: 'Pesquisando', agent: 'trend-researcher' },
  { label: 'Escrevendo', agent: 'copywriter' },
  { label: 'Criando Visual', agent: 'visual-designer' },
]

type StepStatus = 'pending' | 'active' | 'done' | 'error'

const stepStyles: Record<StepStatus, string> = {
  pending: 'bg-gray-100 text-gray-400',
  active: 'bg-orange-100 text-orange-500',
  done: 'bg-green-100 text-green-600',
  error: 'bg-red-100 text-red-600',
}

export default function ContentWorkflowPage() {
  const [theme, setTheme] = useState('')
  const [editions, setEditions] = useState<Edition[]>([])
  const [selectedEdition, setSelectedEdition] = useState('')
  const [loading, setLoading] = useState(false)
  const [steps, setSteps] = useState<StepStatus[]>(['pending', 'pending', 'pending', 'pending'])
  const [result, setResult] = useState<WorkflowResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [failedStep, setFailedStep] = useState<string | null>(null)
  const [partialOutputs, setPartialOutputs] = useState<unknown>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    getEditions()
      .then(setEditions)
      .catch(() => {})
  }, [])

  const startProgress = () => {
    setSteps(['active', 'pending', 'pending', 'pending'])
    intervalRef.current = setInterval(() => {
      setSteps((prev) => {
        const next = [...prev]
        const idx = next.indexOf('active')
        if (idx >= 0 && idx < 3) {
          next[idx] = 'done'
          next[idx + 1] = 'active'
        }
        return next
      })
    }, 8000)
  }

  const stopProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleStart = async () => {
    if (!selectedEdition && !theme.trim()) {
      toast({
        title: 'Erro',
        description: 'Selecione uma edição ou digite um tema.',
        variant: 'destructive',
      })
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setFailedStep(null)
    setPartialOutputs(null)
    startProgress()
    try {
      const res = await runContentWorkflow(selectedEdition || undefined, theme.trim() || undefined)
      if (res.success) {
        setResult(res)
        setSteps(['done', 'done', 'done', 'done'])
      } else {
        setError(res.error || 'Erro desconhecido')
        setFailedStep(res.failed_step || null)
        setPartialOutputs(res.partial_outputs || null)
        const failedIdx = STEPS.findIndex((s) => s.agent === res.failed_step)
        if (failedIdx >= 0) {
          setSteps((prev) =>
            prev.map((_, i) => (i < failedIdx ? 'done' : i === failedIdx ? 'error' : 'pending')),
          )
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na comunicação.'
      setError(msg)
      setSteps((prev) => prev.map((s) => (s === 'active' ? 'error' : s)))
    } finally {
      stopProgress()
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const themeValue =
        theme.trim() || editions.find((e) => e.id === selectedEdition)?.title || 'Workflow Result'
      await saveWorkflowToGeneratedContent({
        theme: themeValue,
        original_edition: selectedEdition || undefined,
        content_data: result.final_content,
      })
      toast({ title: 'Sucesso', description: 'Conteúdo salvo com sucesso!' })
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Workflow de Conteúdo</h2>
        <p className="text-gray-500 mt-1">Pipeline automatizado com 4 especialistas de IA.</p>
      </div>

      <Card className="rounded-xl border-none bg-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Edição</label>
            <Select value={selectedEdition} onValueChange={setSelectedEdition}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar edição..." />
              </SelectTrigger>
              <SelectContent>
                {editions.map((ed) => (
                  <SelectItem key={ed.id} value={ed.id}>
                    {ed.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Ou tema personalizado
            </label>
            <Input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Digite um tema..."
            />
          </div>
          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Executando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Iniciar Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(loading || result || error) && (
        <div className="flex items-start justify-between gap-2">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  stepStyles[steps[i]],
                )}
              >
                {steps[i] === 'done' && <Check className="w-5 h-5" />}
                {steps[i] === 'active' && <Loader2 className="w-5 h-5 animate-spin" />}
                {steps[i] === 'error' && <X className="w-5 h-5" />}
                {steps[i] === 'pending' && <Circle className="w-5 h-5" />}
              </div>
              <span className="text-xs text-center text-gray-600">{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>Erro {failedStep ? `no step: ${failedStep}` : ''}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {partialOutputs && (
        <Card className="rounded-xl border-gray-200">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Saídas Parciais</p>
            <pre className="text-xs overflow-x-auto text-gray-600 bg-gray-50 rounded-lg p-3">
              {JSON.stringify(partialOutputs, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {result && !error && (
        <>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} variant="outline" className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar no Histórico
            </Button>
          </div>
          <WorkflowResultDisplay result={result} />
        </>
      )}
    </div>
  )
}
