import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Eraser, Play, Sparkles } from 'lucide-react'
import { analyzePrompt, type PromptAnalysisResult } from '@/lib/prompt-analysis'

export default function PromptRefinementPage() {
  const [promptOriginal, setPromptOriginal] = useState('')
  const [result, setResult] = useState<PromptAnalysisResult | null>(null)

  const handleAnalyze = useCallback(() => {
    if (!promptOriginal.trim()) return
    setResult(analyzePrompt(promptOriginal))
  }, [promptOriginal])

  const handleClear = useCallback(() => {
    setPromptOriginal('')
    setResult(null)
  }, [])

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Refinamento de Prompts</h2>
        <p className="text-gray-500 mt-1">
          Analise e otimize prompts com diagnóstico estruturado — formato, restrições e clareza de
          objetivos.
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
              placeholder="Cole aqui o prompt que deseja analisar e refinar. Ex: [PROMPT_ORIGINAL]..."
              rows={8}
              className="resize-y"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!promptOriginal.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <Play className="w-4 h-4" /> Analisar e Refinar
            </Button>
            <Button onClick={handleClear} variant="outline" className="flex-1 sm:flex-none gap-2">
              <Eraser className="w-4 h-4" /> Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900">── DIAGNÓSTICO</h3>
              </div>
              <ul className="space-y-2">
                {result.diagnostico.map((item, i) => (
                  <li key={i} className="text-sm leading-relaxed text-gray-700 flex gap-2">
                    <span className="text-orange-500 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">── PROMPT OTIMIZADO</h3>
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono bg-gray-50 rounded-lg p-4 overflow-x-auto border border-gray-200">
                {result.promptOtimizado}
              </pre>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-none bg-white shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">── O QUE MUDEI</h3>
              <ul className="space-y-2">
                {result.oQueMudei.map((item, i) => (
                  <li key={i} className="text-sm leading-relaxed text-gray-700 flex gap-2">
                    <span className="text-orange-500 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
