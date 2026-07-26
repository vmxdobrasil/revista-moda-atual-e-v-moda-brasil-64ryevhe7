import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
  Search,
  Clapperboard,
  X,
  Music,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import type { ReelScriptResult, ReelScript } from '@/services/reel-script'

export type ReelScriptPhase = 'idle' | 'need-tema' | 'generating' | 'result' | 'error'

interface ReelScriptPanelProps {
  phase: ReelScriptPhase
  result: ReelScriptResult | null
  error: string
  onGenerate: (tema: string) => void
  onNewSearch: () => void
  onClose: () => void
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({ title: `${label} copiado!` })
    setTimeout(() => setCopied(false), 2000)
  }, [text, label])
  return (
    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={handleCopy}>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </Button>
  )
}

function ScriptSection({
  title,
  children,
  copyText,
}: {
  title: string
  children: React.ReactNode
  copyText: string
}) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-orange-600">{title}</span>
        <CopyButton text={copyText} label={title} />
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

function buildFullText(script: ReelScript): string {
  let text = `🎬 Roteiro de Reels\n\n`
  text += `TEXTO NA TELA (HOOK): ${script.hook}\n\n`
  text += `CENA 1 (${script.cena1.timing || '0-3s'}):\n- Visual: ${script.cena1.visual}\n- Texto na tela: ${script.cena1.text}\n\n`
  text += `CENA 2 (${script.cena2.timing || '3-8s'}):\n- Visual: ${script.cena2.visual}\n- Texto na tela: ${script.cena2.text}\n\n`
  text += `CENA 3 (${script.cena3.timing || '8-15s'}):\n- Visual: ${script.cena3.visual}\n- Texto na tela: ${script.cena3.text}\n\n`
  text += `CENA FINAL:\n- Visual: ${script.cenaFinal.visual}\n- Texto na tela: ${script.cenaFinal.text}\n- CTA: ${script.cenaFinal.cta || 'VEJA O CATÁLOGO'}\n\n`
  text += `LEGENDA: ${script.legenda}\n\n`
  text += `HASHTAGS: ${script.hashtags.join(' ')}\n\n`
  text += `ÁUDIO SUGERIDO: ${script.audio}`
  return text
}

export function ReelScriptPanel({
  phase,
  result,
  error,
  onGenerate,
  onNewSearch,
  onClose,
}: ReelScriptPanelProps) {
  const [temaInput, setTemaInput] = useState('')
  const [copiedAll, setCopiedAll] = useState(false)

  const handleSubmit = useCallback(() => {
    const tema = temaInput.trim()
    if (tema) onGenerate(tema)
  }, [temaInput, onGenerate])

  const handleCopyAll = useCallback(() => {
    if (!result) return
    navigator.clipboard.writeText(buildFullText(result.script))
    setCopiedAll(true)
    toast({ title: 'Roteiro completo copiado!' })
    setTimeout(() => setCopiedAll(false), 2000)
  }, [result])

  if (phase === 'idle') return null

  if (phase === 'need-tema') {
    return (
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium">Qual o tema do Reel?</p>
        <Input
          autoFocus
          value={temaInput}
          onChange={(e) => setTemaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
          }}
          placeholder="Ex: Macacões de verão"
        />
        <Button size="sm" onClick={handleSubmit} disabled={!temaInput.trim()}>
          Gerar roteiro de Reels
        </Button>
      </div>
    )
  }

  if (phase === 'generating') {
    return (
      <div className="p-8 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500">Gerando roteiro de Reels...</p>
      </div>
    )
  }

  if (phase === 'result' && result) {
    const s = result.script
    return (
      <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium">🎬 Roteiro de Reels</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyAll} className="gap-2">
              {copiedAll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copiedAll ? 'Copiado!' : 'Copiar tudo'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="gap-1">
              <X className="w-3 h-3" /> Fechar
            </Button>
          </div>
        </div>

        <ScriptSection title="TEXTO NA TELA (HOOK)" copyText={s.hook}>
          <p className="whitespace-pre-wrap font-medium">{s.hook}</p>
        </ScriptSection>

        <ScriptSection
          title={`CENA 1 (${s.cena1.timing || '0-3s'})`}
          copyText={`Visual: ${s.cena1.visual}\nTexto na tela: ${s.cena1.text}`}
        >
          <p>
            <span className="text-xs text-muted-foreground">Visual:</span> {s.cena1.visual}
          </p>
          <p>
            <span className="text-xs text-muted-foreground">Texto na tela:</span> {s.cena1.text}
          </p>
        </ScriptSection>

        <ScriptSection
          title={`CENA 2 (${s.cena2.timing || '3-8s'})`}
          copyText={`Visual: ${s.cena2.visual}\nTexto na tela: ${s.cena2.text}`}
        >
          <p>
            <span className="text-xs text-muted-foreground">Visual:</span> {s.cena2.visual}
          </p>
          <p>
            <span className="text-xs text-muted-foreground">Texto na tela:</span> {s.cena2.text}
          </p>
        </ScriptSection>

        <ScriptSection
          title={`CENA 3 (${s.cena3.timing || '8-15s'})`}
          copyText={`Visual: ${s.cena3.visual}\nTexto na tela: ${s.cena3.text}`}
        >
          <p>
            <span className="text-xs text-muted-foreground">Visual:</span> {s.cena3.visual}
          </p>
          <p>
            <span className="text-xs text-muted-foreground">Texto na tela:</span> {s.cena3.text}
          </p>
        </ScriptSection>

        <ScriptSection
          title="CENA FINAL"
          copyText={`Visual: ${s.cenaFinal.visual}\nTexto na tela: ${s.cenaFinal.text}\nCTA: ${s.cenaFinal.cta || 'VEJA O CATÁLOGO'}`}
        >
          <p>
            <span className="text-xs text-muted-foreground">Visual:</span> {s.cenaFinal.visual}
          </p>
          <p>
            <span className="text-xs text-muted-foreground">Texto na tela:</span> {s.cenaFinal.text}
          </p>
          <p>
            <span className="text-xs text-muted-foreground">CTA:</span>{' '}
            <span className="font-bold text-orange-600">
              {s.cenaFinal.cta || 'VEJA O CATÁLOGO'}
            </span>
          </p>
        </ScriptSection>

        <ScriptSection title="LEGENDA" copyText={s.legenda}>
          <p className="whitespace-pre-wrap">{s.legenda}</p>
        </ScriptSection>

        <ScriptSection title="HASHTAGS" copyText={s.hashtags.join(' ')}>
          <div className="flex flex-wrap gap-1">
            {s.hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </ScriptSection>

        <ScriptSection title="ÁUDIO SUGERIDO" copyText={s.audio}>
          <div className="flex items-center gap-2">
            <Music className="w-3 h-3 text-orange-500" />
            <p>{s.audio}</p>
          </div>
        </ScriptSection>

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
        <p className="text-sm font-medium">Erro ao gerar roteiro</p>
      </div>
      <p className="text-sm text-gray-500">{error}</p>
      <Button size="sm" variant="outline" onClick={onNewSearch} className="gap-2">
        <RotateCcw className="w-3 h-3" /> Tentar novamente
      </Button>
    </div>
  )
}
